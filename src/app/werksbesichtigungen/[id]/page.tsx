import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import WerksbesichtigungBearbeiter from "@/components/WerksbesichtigungBearbeiter";
import WerksbesichtigungEditor from "@/components/WerksbesichtigungEditor";
import type { FoerderbandEintragMitDetails, Kategorie, Werksbesichtigung } from "@/lib/supabase/types";

interface BearbeiterZeile {
  user_id: string;
  users: { id: string; name: string } | { id: string; name: string }[] | null;
}

function einzeln<T>(wert: T | T[] | null | undefined): T | null {
  if (!wert) return null;
  return Array.isArray(wert) ? (wert[0] ?? null) : wert;
}

export default async function WerksbesichtigungDetailSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nutzer = await getAktuellerNutzer();
  const supabase = await createClient();

  const [{ data: besuch }, { data: eintraegeRoh }, { data: bearbeiterRoh }, { data: kategorien }] = await Promise.all([
    supabase.from("werksbesichtigungen").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("foerderband_eintraege")
      .select(
        "*, foerderband_fotos(*), foerderband_positionen(*, kategorien!produkt_kategorie_id(id, name, ebene, parent_kategorie_id))",
      )
      .eq("werksbesichtigung_id", id)
      // erstellt_am zusätzlich, weil reihenfolge beim Anlegen (noch) nicht
      // gesetzt wird - sonst wäre die Reihenfolge bei Gleichstand zufällig
      // und die Bandnummer in Meldungen (siehe werksbesichtigungStatusSetzen)
      // nicht eindeutig.
      .order("reihenfolge", { ascending: true })
      .order("erstellt_am", { ascending: true })
      .order("reihenfolge", { referencedTable: "foerderband_positionen", ascending: true })
      .order("erstellt_am", { referencedTable: "foerderband_positionen", ascending: true }),
    supabase.from("werksbesichtigung_bearbeiter").select("user_id, users(id, name)").eq("werksbesichtigung_id", id),
    supabase.from("kategorien").select("*").order("name"),
  ]);

  if (!besuch) notFound();
  const typedBesuch = besuch as Werksbesichtigung;

  // Name des Erstellers für den Bericht. Bewusst eigene Abfrage statt Join
  // users(name) in der Abfrage oben: werksbesichtigungen ist mit users zweimal
  // verbunden (ersteller_id und werksbesichtigung_bearbeiter), der Join wäre
  // ohne Hinweis mehrdeutig. Schlägt die Abfrage fehl, steht im Bericht "–".
  const { data: ersteller } = typedBesuch.ersteller_id
    ? await supabase.from("users").select("name").eq("id", typedBesuch.ersteller_id).maybeSingle()
    : { data: null };
  const erstellerName = (ersteller as { name: string } | null)?.name ?? null;

  const istAdminOderHoeher = nutzer.rolle === "admin" || nutzer.rolle === "superadmin";
  const istErsteller = typedBesuch.ersteller_id === nutzer.id;
  const bearbeiter = ((bearbeiterRoh ?? []) as unknown as BearbeiterZeile[])
    .map((z) => einzeln(z.users))
    .filter((n): n is { id: string; name: string } => n !== null);
  const istBearbeiter = bearbeiter.some((n) => n.id === nutzer.id);

  const darfBearbeiten = istErsteller || istBearbeiter || istAdminOderHoeher;
  const darfLoeschen = istErsteller || istAdminOderHoeher;
  const darfMitbearbeiterVerwalten = istErsteller || istAdminOderHoeher;
  const typedEintraege = (eintraegeRoh ?? []) as unknown as FoerderbandEintragMitDetails[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Kopf, Allgemeine Angaben und Förderbänder mit zentralem Speichern. */}
      <WerksbesichtigungEditor
        besuch={typedBesuch}
        eintraege={typedEintraege}
        kategorien={(kategorien ?? []) as Kategorie[]}
        erstellerName={erstellerName}
        darfBearbeiten={darfBearbeiten}
        darfLoeschen={darfLoeschen}
      />

      <WerksbesichtigungBearbeiter
        werksbesichtigungId={id}
        bearbeiter={bearbeiter}
        darfVerwalten={darfMitbearbeiterVerwalten}
      />
    </div>
  );
}

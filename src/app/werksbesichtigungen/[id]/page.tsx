import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import WerksbesichtigungAllgemeineAngaben from "@/components/WerksbesichtigungAllgemeineAngaben";
import WerksbesichtigungBearbeiter from "@/components/WerksbesichtigungBearbeiter";
import WerksbesichtigungPdfExport from "@/components/WerksbesichtigungPdfExport";
import FoerderbandListe from "@/components/FoerderbandListe";
import SectionLinie from "@/components/SectionLinie";
import Icon from "@/components/icons/Icon";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
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
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const [{ data: besuch }, { data: eintraegeRoh }, { data: bearbeiterRoh }, { data: kategorien }] = await Promise.all([
    supabase.from("werksbesichtigungen").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("foerderband_eintraege")
      .select(
        "*, foerderband_fotos(*), foerderband_positionen(*, kategorien!produkt_kategorie_id(id, name, ebene, parent_kategorie_id))",
      )
      .eq("werksbesichtigung_id", id)
      .order("reihenfolge", { ascending: true })
      .order("reihenfolge", { referencedTable: "foerderband_positionen", ascending: true }),
    supabase.from("werksbesichtigung_bearbeiter").select("user_id, users(id, name)").eq("werksbesichtigung_id", id),
    supabase.from("kategorien").select("*").order("name"),
  ]);

  if (!besuch) notFound();
  const typedBesuch = besuch as Werksbesichtigung;

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/werksbesichtigungen" className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-signal">
          <Icon name="chevron" size={12} className="rotate-90" /> {t("werksbesichtigungen.zurueck", sprache)}
        </Link>
        <WerksbesichtigungPdfExport besuch={typedBesuch} eintraege={typedEintraege} />
      </div>

      <div className="mt-4">
        <SectionLinie titel={t("werksbesichtigungen.allgemeineAngaben", sprache)} />
        <WerksbesichtigungAllgemeineAngaben
          besuch={typedBesuch}
          darfBearbeiten={darfBearbeiten}
          darfLoeschen={darfLoeschen}
        />
      </div>

      <section className="mt-8">
        <SectionLinie titel={t("foerderband.titel", sprache)} />
        <FoerderbandListe
          werksbesichtigungId={id}
          eintraege={typedEintraege}
          kategorien={(kategorien ?? []) as Kategorie[]}
          darfBearbeiten={darfBearbeiten}
        />
      </section>

      <WerksbesichtigungBearbeiter
        werksbesichtigungId={id}
        bearbeiter={bearbeiter}
        darfVerwalten={darfMitbearbeiterVerwalten}
      />
    </div>
  );
}

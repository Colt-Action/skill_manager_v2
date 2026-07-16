import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import KategorieVerwaltung from "@/components/KategorieVerwaltung";
import type { Kategorie, Teil } from "@/lib/supabase/types";

export default async function KategorienSeite() {
  await getAktuellerAdminOderHoeher();
  const supabase = await createClient();

  const [{ data: kategorien }, { data: teile }] = await Promise.all([
    supabase.from("kategorien").select("*").order("name"),
    supabase.from("teile").select("*").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Verwaltung</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        Kategorien &amp; Teile
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        Baue die Struktur Industrie → Hersteller → Produkt → Kategorie auf und lege darunter
        Teile mit Beschreibung und ID-Nummer an.
      </p>

      <KategorieVerwaltung
        kategorien={(kategorien ?? []) as Kategorie[]}
        teile={(teile ?? []) as Teil[]}
      />
    </div>
  );
}

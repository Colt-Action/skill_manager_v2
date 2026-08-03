import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import UebersetzungsVerwaltung from "@/components/UebersetzungsVerwaltung";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";

export default async function AdminUebersetzungenSeite() {
  const nutzer = await getAktuellerAdminOderHoeher();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const [{ data: videos }, { data: referenzen }, { data: uebersetzungen }] = await Promise.all([
    supabase
      .from("videos")
      .select("id, titel, beschreibung_schritte")
      .order("erstellt_am", { ascending: false }),
    supabase
      .from("referenzen")
      .select("id, titel, beschreibung")
      .order("erstellt_am", { ascending: false }),
    supabase
      .from("uebersetzungen")
      .select("tabelle, datensatz_id, feld, sprache, text")
      .in("tabelle", ["videos", "referenzen"]),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("nav.verwaltung", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        {t("uebersetzungen.seitenTitel", sprache)}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        {t("uebersetzungen.untertitel", sprache)}
      </p>

      <UebersetzungsVerwaltung
        videos={(videos ?? []).map((v) => ({ id: v.id, titel: v.titel, beschreibung: v.beschreibung_schritte }))}
        referenzen={referenzen ?? []}
        uebersetzungen={uebersetzungen ?? []}
      />
    </div>
  );
}

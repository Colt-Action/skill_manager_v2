import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import ReferenzBereich from "@/components/ReferenzBereich";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { Kategorie, ReferenzMitDetails, Teil } from "@/lib/supabase/types";

const REFERENZ_SELECT =
  "*, teile(id, name, teilenummer, beschreibung, kategorie_id), kategorien(id, name, ebene, parent_kategorie_id), referenz_tags(tags(id, name, synonyme)), referenz_metadaten(*), referenz_video(*), referenz_foto(*), referenz_dokument(*), referenz_link(*), referenz_likes(user_id)";

export default async function ReferenzbereichSeite() {
  const nutzer = await getAktuellerNutzer();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const [{ data: referenzen }, { data: kategorien }, { data: teile }] = await Promise.all([
    supabase
      .from("referenzen")
      .select(REFERENZ_SELECT)
      .eq("status", "veroeffentlicht")
      .order("erstellt_am", { ascending: false }),
    supabase.from("kategorien").select("*").order("name"),
    supabase.from("teile").select("*").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("referenzbereich.eyebrow", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        {t("referenzbereich.titel", sprache)}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">{t("referenzbereich.untertitel", sprache)}</p>

      <ReferenzBereich
        referenzen={(referenzen ?? []) as ReferenzMitDetails[]}
        kategorien={(kategorien ?? []) as Kategorie[]}
        teile={(teile ?? []) as Teil[]}
        aktuellerNutzerId={nutzer.id}
      />
    </div>
  );
}

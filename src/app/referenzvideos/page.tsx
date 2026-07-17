import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import ReferenzVideos from "@/components/ReferenzVideos";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { Kategorie, Teil, VideoMitDetails } from "@/lib/supabase/types";

export default async function ReferenzvideosSeite() {
  const nutzer = await getAktuellerNutzer();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const [{ data: videos }, { data: kategorien }, { data: teile }] = await Promise.all([
    supabase
      .from("videos")
      .select(
        "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme)), referenz_video_details(*)",
      )
      .eq("status", "veroeffentlicht")
      .eq("video_typ", "referenz")
      .order("erstellt_am", { ascending: false }),
    supabase.from("kategorien").select("*").order("name"),
    supabase.from("teile").select("*").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("referenzvideos.eyebrow", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        {t("referenzvideos.titel", sprache)}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        {t("referenzvideos.untertitel", sprache)}
      </p>

      <ReferenzVideos
        videos={(videos ?? []) as VideoMitDetails[]}
        kategorien={(kategorien ?? []) as Kategorie[]}
        teile={(teile ?? []) as Teil[]}
      />
    </div>
  );
}

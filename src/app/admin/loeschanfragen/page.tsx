import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import LoeschanfrageZeile from "@/components/LoeschanfrageZeile";
import EmptyState from "@/components/EmptyState";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { VideoMitDetails } from "@/lib/supabase/types";

export default async function LoeschanfragenSeite() {
  const nutzer = await getAktuellerAdminOderHoeher();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const { data: videos } = await supabase
    .from("videos")
    .select(
      "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme))",
    )
    .eq("loeschung_angefragt", true)
    .order("erstellt_am", { ascending: true });

  const videoListe = (videos ?? []) as VideoMitDetails[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("nav.verwaltung", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        {t("admin.loeschanfragenTitel", sprache)}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        {t("admin.loeschanfragenUntertitel", sprache)}
      </p>

      {videoListe.length === 0 ? (
        <EmptyState icon="🗑️" text={t("admin.loeschanfragenLeer", sprache)} />
      ) : (
        <div className="mt-6 space-y-3">
          {videoListe.map((video) => (
            <LoeschanfrageZeile key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

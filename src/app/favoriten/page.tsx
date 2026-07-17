import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import VideoCard from "@/components/VideoCard";
import EmptyState from "@/components/EmptyState";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { VideoMitDetails } from "@/lib/supabase/types";

export default async function FavoritenSeite() {
  const nutzer = await getAktuellerNutzer();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const { data: favoriten } = await supabase
    .from("favoriten")
    .select(
      "video_id, videos(*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme)))",
    )
    .eq("user_id", nutzer.id)
    .order("erstellt_am", { ascending: false });

  interface FavoritZeile {
    video_id: string;
    videos: VideoMitDetails | null;
  }

  const favoritenZeilen = (favoriten ?? []) as unknown as FavoritZeile[];
  const videos = favoritenZeilen
    .map((f) => f.videos)
    .filter((v): v is VideoMitDetails => v !== null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("favoriten.eyebrow", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        {t("favoriten.titel", sprache)}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        {t("favoriten.untertitel", sprache)}
      </p>

      {videos.length === 0 ? (
        <EmptyState icon="⭐" text={t("favoriten.leer", sprache)} />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

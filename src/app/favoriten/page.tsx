import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import VideoCard from "@/components/VideoCard";
import type { VideoMitDetails } from "@/lib/supabase/types";

export default async function FavoritenSeite() {
  const nutzer = await getAktuellerNutzer();
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
      <h1 className="text-2xl font-semibold text-slate-900">Meine Merkliste</h1>
      <p className="mt-1 text-sm text-slate-500">
        Videos, die du dir für später gemerkt hast.
      </p>

      {videos.length === 0 ? (
        <p className="mt-10 text-sm text-slate-500">
          Noch nichts gemerkt. Klick auf den Stern bei einem Video, um es hier zu sammeln.
        </p>
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

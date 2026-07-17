import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import VideoCard from "@/components/VideoCard";
import type { Lernpfad, VideoMitDetails } from "@/lib/supabase/types";

interface LernpfadVideoZeile {
  reihenfolge: number;
  videos: VideoMitDetails | null;
}

export default async function LernpfadDetailSeite({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await getAktuellerNutzer();
  const supabase = await createClient();

  const { data: lernpfad } = await supabase.from("lernpfade").select("*").eq("id", id).single();
  if (!lernpfad) notFound();

  const { data: videoZeilen } = await supabase
    .from("lernpfad_videos")
    .select(
      "reihenfolge, videos(*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme)))",
    )
    .eq("lernpfad_id", id)
    .order("reihenfolge", { ascending: true });

  const videos = ((videoZeilen ?? []) as unknown as LernpfadVideoZeile[])
    .map((z) => z.videos)
    .filter((v): v is VideoMitDetails => v !== null);

  const typedLernpfad = lernpfad as Lernpfad;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/lernpfade" className="text-xs text-accent hover:text-accent-deep">
        ← Alle Lernpfade
      </Link>
      <p className="mt-3 font-mono text-xs uppercase tracking-widest text-accent">Lernpfad</p>
      <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-foreground">
        {typedLernpfad.titel}
      </h1>
      {typedLernpfad.beschreibung && (
        <p className="mt-1 text-sm text-foreground-soft">{typedLernpfad.beschreibung}</p>
      )}

      {videos.length === 0 ? (
        <p className="mt-10 text-sm text-foreground-soft">Diesem Lernpfad wurden noch keine Videos zugeordnet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {videos.map((video, i) => (
            <div key={video.id} className="flex items-start gap-3">
              <span className="mt-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs font-bold text-accent-ink">
                {i + 1}
              </span>
              <div className="flex-1">
                <VideoCard video={video} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

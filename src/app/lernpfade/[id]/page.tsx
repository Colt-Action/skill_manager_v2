import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import VideoCard from "@/components/VideoCard";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
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
  const nutzer = await getAktuellerNutzer();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const { data: lernpfad } = await supabase.from("lernpfade").select("*").eq("id", id).single();
  if (!lernpfad) notFound();

  const [{ data: videoZeilen }, { data: ansichten }, { data: favoriten }] = await Promise.all([
    supabase
      .from("lernpfad_videos")
      .select(
        "reihenfolge, videos(*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme)))",
      )
      .eq("lernpfad_id", id)
      .order("reihenfolge", { ascending: true }),
    supabase.from("video_ansichten").select("video_id").eq("user_id", nutzer.id),
    supabase.from("favoriten").select("video_id").eq("user_id", nutzer.id).is("merkteam_id", null),
  ]);

  const videos = ((videoZeilen ?? []) as unknown as LernpfadVideoZeile[])
    .map((z) => z.videos)
    .filter((v): v is VideoMitDetails => v !== null);

  const angeseheneIds = new Set((ansichten ?? []).map((a) => a.video_id));
  const angesehenAnzahl = videos.filter((v) => angeseheneIds.has(v.id)).length;
  const gemerkteIds = new Set((favoriten ?? []).map((f) => f.video_id));

  const typedLernpfad = lernpfad as Lernpfad;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/lernpfade" className="text-xs text-accent hover:text-accent-deep">
        ← {t("lernpfade.alleLernpfade", sprache)}
      </Link>
      <p className="mt-3 font-mono text-xs uppercase tracking-widest text-accent">{t("lernpfade.lernpfad", sprache)}</p>
      <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-foreground">
        {typedLernpfad.titel}
      </h1>
      {typedLernpfad.beschreibung && (
        <p className="mt-1 text-sm text-foreground-soft">{typedLernpfad.beschreibung}</p>
      )}

      {videos.length > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${(angesehenAnzahl / videos.length) * 100}%` }}
            />
          </div>
          <p className="shrink-0 font-mono text-xs text-blueprint">
            {t("lernpfade.angesehenAnzahl", sprache, { angesehen: String(angesehenAnzahl), gesamt: String(videos.length) })}
          </p>
        </div>
      )}

      {videos.length === 0 ? (
        <p className="mt-10 text-sm text-foreground-soft">{t("lernpfade.keineVideosZugeordnet", sprache)}</p>
      ) : (
        <div className="mt-6 space-y-3">
          {videos.map((video, i) => (
            <div key={video.id} className="flex items-start gap-3">
              <span
                className={`mt-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                  angeseheneIds.has(video.id) ? "bg-success text-success-ink" : "bg-accent text-accent-ink"
                }`}
              >
                {angeseheneIds.has(video.id) ? "✓" : i + 1}
              </span>
              <div className="flex-1">
                <VideoCard video={video} gemerkt={gemerkteIds.has(video.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

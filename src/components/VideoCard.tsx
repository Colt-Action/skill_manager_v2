import Link from "next/link";
import { dauerFormatieren } from "@/lib/format";
import type { VideoMitDetails } from "@/lib/supabase/types";

export default function VideoCard({ video }: { video: VideoMitDetails }) {
  return (
    <Link
      href={`/videos/${video.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-surface ring-1 ring-line transition hover:-translate-y-0.5 hover:ring-accent hover:shadow-lg animate-fade-in-up"
    >
      <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-nav">
        {video.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnail_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
          />
        ) : (
          // Ältere Videos ohne automatisch erzeugtes Vorschaubild: Fallback
          // auf die alte Live-Video-Vorschau.
          <video src={video.datei_url} className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" muted preload="metadata" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition group-hover:opacity-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-ink shadow-lg">
            ▶
          </span>
        </span>
        {video.dauer != null && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-xs text-white">
            {dauerFormatieren(video.dauer)}
          </span>
        )}
        {video.video_typ === "referenz" && (
          <span className="absolute left-2 top-2 rounded-full bg-blueprint px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-white">
            Referenz
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 font-medium text-foreground group-hover:text-accent-deep">
          {video.titel}
        </h3>
        {video.teile && (
          <p className="font-mono text-xs text-blueprint">
            {video.teile.name} · Teil-Nr. {video.teile.teilenummer}
          </p>
        )}
        {video.video_tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {video.video_tags.slice(0, 4).map(({ tags }) => (
              <span
                key={tags.id}
                className="rounded-full bg-background px-2 py-0.5 text-[11px] text-foreground-soft ring-1 ring-line"
              >
                {tags.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

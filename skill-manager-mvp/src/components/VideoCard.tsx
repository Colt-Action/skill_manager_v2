import Link from "next/link";
import { dauerFormatieren } from "@/lib/format";
import type { VideoMitDetails } from "@/lib/supabase/types";

export default function VideoCard({ video }: { video: VideoMitDetails }) {
  return (
    <Link
      href={`/videos/${video.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 transition hover:ring-slate-400 hover:shadow-md"
    >
      <div className="relative flex aspect-video items-center justify-center bg-slate-900">
        <video src={video.datei_url} className="h-full w-full object-cover" muted preload="metadata" />
        {video.dauer != null && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
            {dauerFormatieren(video.dauer)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 font-medium text-slate-900 group-hover:underline">
          {video.titel}
        </h3>
        {video.teile && (
          <p className="text-xs text-slate-500">
            {video.teile.name} · Teil-Nr. {video.teile.teilenummer}
          </p>
        )}
        {video.video_tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {video.video_tags.slice(0, 4).map(({ tags }) => (
              <span
                key={tags.id}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
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

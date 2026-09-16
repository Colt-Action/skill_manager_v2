import Link from "next/link";
import { dauerFormatieren } from "@/lib/format";
import LikeButton from "@/components/LikeButton";
import MerkStern from "@/components/MerkStern";
import { videoLikeUmschalten } from "@/lib/actions/likes";
import { pfadZuKategorie } from "@/lib/kategorieBaum";
import type { Kategorie, ReferenzVideoDetails, VideoMitDetails } from "@/lib/supabase/types";

function details(video: VideoMitDetails): ReferenzVideoDetails | null {
  const d = video.referenz_video_details;
  if (!d) return null;
  return Array.isArray(d) ? (d[0] ?? null) : d;
}

export default function VideoCard({
  video,
  kategorien,
  aktuellerNutzerId,
  gemerkt,
}: {
  video: VideoMitDetails;
  /** Volle Kategorien-Liste - nur nötig, wenn Produkt/Kategorie/Unterkategorie-Badges gezeigt werden sollen (Referenzvideos). */
  kategorien?: Kategorie[];
  /** Für den Like-Button: eigene Nutzer-ID, falls eingeloggt. */
  aktuellerNutzerId?: string | null;
  /** Zeigt den Merken-Stern; nur übergeben, wenn ein Nutzer eingeloggt ist. */
  gemerkt?: boolean;
}) {
  const d = video.video_typ === "referenz" ? details(video) : null;
  let kategorieNamen: string[] = [];
  if (kategorien) {
    const eigeneKategorieId = video.kategorie_id ?? video.teile?.kategorie_id ?? null;
    const pfad = pfadZuKategorie(kategorien, eigeneKategorieId);
    // Produkt, Kategorie, Unterkategorie = die letzten drei Ebenen der Kette.
    kategorieNamen = pfad
      .slice(2)
      .map((id) => kategorien.find((k) => k.id === id)?.name)
      .filter((name): name is string => Boolean(name));
  }
  const metaZeile = [...kategorieNamen, d?.foerderbandbreite].filter(Boolean).join(" · ");

  const likes = video.video_likes ?? [];

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
        {gemerkt !== undefined && (
          <span className="absolute right-2 top-2">
            <MerkStern videoId={video.id} anfangsGemerkt={gemerkt} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start gap-2">
          {video.teile?.teilenummer && (
            <span className="mt-0.5 shrink-0 rounded-md bg-accent/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-accent-deep">
              {video.teile.teilenummer}
            </span>
          )}
          <h3 className="line-clamp-2 font-medium text-foreground group-hover:text-accent-deep">{video.titel}</h3>
        </div>
        {video.video_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
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
        {(metaZeile || video.video_typ === "referenz") && (
          <div className="mt-auto flex items-baseline justify-between gap-2 border-t border-line pt-2 text-xs text-foreground-soft">
            <span className="truncate">{metaZeile || " "}</span>
            <span className="flex shrink-0 items-center gap-2">
              {d?.geschwindigkeit_ms != null && (
                <span className="font-mono text-foreground">
                  <span className="text-[13px] font-bold">{d.geschwindigkeit_ms.toFixed(1)}</span> m/s
                </span>
              )}
              {video.video_typ === "referenz" && (
                <LikeButton
                  id={video.id}
                  umschalten={videoLikeUmschalten}
                  anfangsAnzahl={likes.length}
                  anfangsGeliked={likes.some((l) => l.user_id === aktuellerNutzerId)}
                  eingeloggt={Boolean(aktuellerNutzerId)}
                />
              )}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

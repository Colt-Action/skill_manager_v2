import Medienkarte from "@/components/Medienkarte";
import Icon from "@/components/icons/Icon";
import MerkStern from "@/components/MerkStern";
import LikeButton from "@/components/LikeButton";
import { videoLikeUmschalten } from "@/lib/actions/likes";
import type { ReferenzVideoDetails, VideoMitDetails } from "@/lib/supabase/types";

function details(video: VideoMitDetails): ReferenzVideoDetails | null {
  const d = video.referenz_video_details;
  if (!d) return null;
  return Array.isArray(d) ? (d[0] ?? null) : d;
}

// Betriebsdaten auf der Karte: max. 4 Werte ohne Label, feste Reihenfolge
// (Designkonzept "Typenschild" Rev. 02, Abschnitt I.4) - Segment/Verlagerung
// erscheinen nur noch auf der Detailseite, nicht mehr auf der Karte.
function werte(d: ReferenzVideoDetails | null): string[] {
  if (!d) return [];
  return [
    d.material,
    d.foerderbandbreite,
    d.geschwindigkeit_ms != null ? `${d.geschwindigkeit_ms.toFixed(1)} m/s` : null,
    d.land,
  ].filter((wert): wert is string => Boolean(wert));
}

export default function VideoCard({
  video,
  aktuellerNutzerId,
  gemerkt,
}: {
  video: VideoMitDetails;
  /** Für den Like-Button: eigene Nutzer-ID, falls eingeloggt. */
  aktuellerNutzerId?: string | null;
  /** Zeigt den Merken-Stern; nur übergeben, wenn ein Nutzer eingeloggt ist. */
  gemerkt?: boolean;
}) {
  const d = video.video_typ === "referenz" ? details(video) : null;
  const likes = video.video_likes ?? [];

  return (
    <Medienkarte
      href={`/videos/${video.id}`}
      typLabel={video.video_typ === "referenz" ? "Referenz" : undefined}
      thumbnailUrl={video.thumbnail_url}
      videoFallbackUrl={video.datei_url}
      dauer={video.dauer}
      merkStern={gemerkt !== undefined ? <MerkStern videoId={video.id} anfangsGemerkt={gemerkt} /> : undefined}
      nummer={video.teile?.teilenummer}
      titel={video.titel}
      tags={video.video_tags.map(({ tags }) => tags.name)}
      werte={werte(d)}
      platzhalterIcon={<Icon name="video" size={28} />}
      aktion={
        video.video_typ === "referenz" ? (
          <LikeButton
            id={video.id}
            umschalten={videoLikeUmschalten}
            anfangsAnzahl={likes.length}
            anfangsGeliked={likes.some((l) => l.user_id === aktuellerNutzerId)}
            eingeloggt={Boolean(aktuellerNutzerId)}
          />
        ) : undefined
      }
    />
  );
}

import Medienkarte from "@/components/Medienkarte";
import Icon, { type IconName } from "@/components/icons/Icon";
import MerkStern from "@/components/MerkStern";
import LikeButton from "@/components/LikeButton";
import { referenzLikeUmschalten } from "@/lib/actions/referenzen";
import type { ReferenzMitDetails } from "@/lib/supabase/types";

const TYP_ICON: Record<string, IconName> = { video: "video", foto: "foto", dokument: "dokument", link: "link" };

function einzeln<T>(wert: T | T[] | null | undefined): T | null {
  if (!wert) return null;
  return Array.isArray(wert) ? (wert[0] ?? null) : wert;
}

export default function ReferenzCard({
  referenz,
  aktuellerNutzerId,
  gemerkt,
}: {
  referenz: ReferenzMitDetails;
  aktuellerNutzerId?: string | null;
  gemerkt?: boolean;
}) {
  const metadaten = einzeln(referenz.referenz_metadaten);
  // Betriebsdaten auf der Karte: max. 4 Werte ohne Label, feste Reihenfolge
  // (Designkonzept "Typenschild" Rev. 02, Abschnitt I.4) - Segment/Verlagerung
  // erscheinen nur noch auf der Detailseite, nicht mehr auf der Karte.
  const werte = [
    metadaten?.material,
    metadaten?.foerderbandbreite,
    metadaten?.geschwindigkeit_ms != null ? `${metadaten.geschwindigkeit_ms.toFixed(1)} m/s` : null,
    metadaten?.land,
  ].filter((wert): wert is string => Boolean(wert));

  const likes = referenz.referenz_likes ?? [];
  const videoInhalt = referenz.typ === "video" ? einzeln(referenz.referenz_video) : null;
  const fotoInhalt = referenz.typ === "foto" ? einzeln(referenz.referenz_foto) : null;

  return (
    <Medienkarte
      href={`/referenzbereich/${referenz.id}`}
      typLabel={referenz.typ}
      thumbnailUrl={videoInhalt?.thumbnail_url ?? fotoInhalt?.nachher_url ?? fotoInhalt?.vorher_url}
      videoFallbackUrl={videoInhalt?.datei_url}
      dauer={videoInhalt?.dauer}
      merkStern={gemerkt !== undefined ? <MerkStern referenzId={referenz.id} anfangsGemerkt={gemerkt} /> : undefined}
      nummer={referenz.teile?.teilenummer}
      titel={referenz.titel}
      tags={referenz.referenz_tags.map(({ tags }) => tags.name)}
      werte={werte}
      platzhalterIcon={<Icon name={TYP_ICON[referenz.typ] ?? "dokument"} size={28} />}
      aktion={
        <LikeButton
          id={referenz.id}
          umschalten={referenzLikeUmschalten}
          anfangsAnzahl={likes.length}
          anfangsGeliked={likes.some((l) => l.user_id === aktuellerNutzerId)}
          eingeloggt={Boolean(aktuellerNutzerId)}
        />
      }
    />
  );
}

import Medienkarte from "@/components/Medienkarte";
import Icon, { type IconName } from "@/components/icons/Icon";
import MerkStern from "@/components/MerkStern";
import LikeButton from "@/components/LikeButton";
import ReferenzFeldRaster from "@/components/ReferenzFeldRaster";
import FehlendeAngabenHinweis from "@/components/FehlendeAngabenHinweis";
import type { ReferenzFeld } from "@/lib/referenzFelder";
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
  felder,
  fehlendeAngaben,
}: {
  referenz: ReferenzMitDetails;
  aktuellerNutzerId?: string | null;
  gemerkt?: boolean;
  /**
   * Wichtige Felder in drei Zeilen (siehe lib/referenzFelder.ts) - nur in der
   * Übersicht des Referenzbereichs. Ohne diese Angabe zeigt die Karte wie
   * bisher bis zu vier Werte ohne Beschriftung (Dashboard, Merkliste, ...).
   */
  felder?: ReferenzFeld[][];
  /** Texte zu fehlenden Angaben; bearbeitenHref nur für Nutzer, die die Referenz bearbeiten dürfen. */
  fehlendeAngaben?: { fehltText: string; hinweisText: string | null; bearbeitenHref?: string; bearbeitenText?: string };
}) {
  const metadaten = einzeln(referenz.referenz_metadaten);
  // Betriebsdaten auf der Karte: max. 4 Werte ohne Label, feste Reihenfolge
  // (Designkonzept "Typenschild" Rev. 02, Abschnitt I.4) - Segment/Verlagerung
  // erscheinen nur noch auf der Detailseite, nicht mehr auf der Karte.
  const werte = felder
    ? []
    : [
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
      kompakt={Boolean(felder)}
      felder={
        felder ? (
          <ReferenzFeldRaster
            zeilen={felder}
            fehltText={fehlendeAngaben?.fehltText ?? "–"}
            kopf={
              fehlendeAngaben?.hinweisText ? (
                <FehlendeAngabenHinweis
                  text={fehlendeAngaben.hinweisText}
                  bearbeitenHref={fehlendeAngaben.bearbeitenHref}
                  bearbeitenText={fehlendeAngaben.bearbeitenText}
                />
              ) : undefined
            }
          />
        ) : undefined
      }
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

import Link from "next/link";
import type { ReactNode } from "react";
import Typenschild from "@/components/Typenschild";
import { dauerFormatieren } from "@/lib/format";

interface Props {
  href: string;
  /** Sichtbares Label auf dem Thumbnail, z.B. "VIDEO", "FOTO" (i18n vom Aufrufer). */
  typLabel?: string;
  thumbnailUrl?: string | null;
  /** Fallback, wenn kein Thumbnail existiert (ältere Videos ohne generiertes Bild). */
  videoFallbackUrl?: string | null;
  dauer?: number | null;
  merkStern?: ReactNode;
  nummer?: string | null;
  titel: string;
  tags?: string[];
  /** Betriebsdaten ohne Label, max. 4, feste Reihenfolge (Material zuerst). */
  werte: string[];
  aktion?: ReactNode;
  platzhalterIcon?: ReactNode;
}

// Ersetzt die frühere Karten-Optik von VideoCard/ReferenzCard: kein Radius,
// kein Schatten, ein Rahmen - der Fuß ist ein Typenschild (Designkonzept
// "Typenschild" Rev. 02, Abschnitt F).
export default function Medienkarte({
  href,
  typLabel,
  thumbnailUrl,
  videoFallbackUrl,
  dauer,
  merkStern,
  nummer,
  titel,
  tags = [],
  werte,
  aktion,
  platzhalterIcon,
}: Props) {
  return (
    <Link href={href} className="group block border border-rule bg-paper">
      <div className="relative aspect-video overflow-hidden bg-plate">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-90 transition duration-200 group-hover:scale-[1.02] group-hover:opacity-100"
          />
        ) : videoFallbackUrl ? (
          <video
            src={videoFallbackUrl}
            className="h-full w-full object-cover opacity-90 transition duration-200 group-hover:scale-[1.02] group-hover:opacity-100"
            muted
            preload="metadata"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-plate-soft">{platzhalterIcon}</div>
        )}
        {typLabel && (
          <span className="absolute left-2 top-2 bg-black/55 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-plate-ink">
            {typLabel}
          </span>
        )}
        {dauer != null && (
          <span className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-plate-ink">
            {dauerFormatieren(dauer)}
          </span>
        )}
        {merkStern && <span className="absolute right-2 top-2">{merkStern}</span>}
      </div>
      <div className="transition-transform duration-200 group-hover:translate-x-[2px]">
        <Typenschild variante="karte" nummer={nummer} titel={titel} werte={werte} />
      </div>
      {(tags.length > 0 || aktion) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule px-3 py-2">
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-[2px] border border-rule px-2 py-0.5 text-[11px] text-ink-soft">
                {tag}
              </span>
            ))}
          </div>
          {aktion}
        </div>
      )}
    </Link>
  );
}

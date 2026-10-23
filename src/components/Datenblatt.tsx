import type { ReactNode } from "react";

// Gemeinsame Grundform für Filter und Formulare (Designkonzept "Typenschild"
// Rev. 02, Abschnitt C/I): Label links in Mono-Versalien, Feld rechts,
// getrennt durch eine Linie. Wer ausfüllt, lernt dieselbe Form wie wer
// filtert. Ein aktiver Filterwert bekommt eine Stempelkante links.
//
// min-w-0 / minmax(0,1fr): Grid- und Flex-Elemente sind sonst mindestens so
// breit wie ihr Inhalt (z.B. die längste Option eines <select>) und drücken
// die Seite am Handy über den Bildschirmrand hinaus.

export const eingabeKlasse =
  "h-11 w-full min-w-0 max-w-full rounded-[2px] border border-rule bg-paper-2 px-2.5 text-sm text-ink outline-none focus:border-ink";

// Datumsfelder: iOS Safari gibt <input type="date"> eine eigene Mindestbreite
// und zentriert den Wert - appearance-none + block hält sie in der Karte.
export const datumKlasse = `${eingabeKlasse} block appearance-none text-left`;

export const textbereichKlasse =
  "block w-full min-w-0 max-w-full rounded-[2px] border border-rule bg-paper-2 px-2.5 py-2 text-sm text-ink outline-none focus:border-ink";

export function DatenblattZeile({
  label,
  children,
  aktiv,
  untereinander,
}: {
  label: string;
  children: ReactNode;
  aktiv?: boolean;
  /** Field Mode: am Handy Label über dem Feld (volle Breite), ab md wie gewohnt nebeneinander. */
  untereinander?: boolean;
}) {
  const raster = untereinander
    ? "grid-cols-1 gap-1.5 md:grid-cols-[200px_minmax(0,1fr)] md:items-center md:gap-3"
    : "grid-cols-[140px_minmax(0,1fr)] items-center gap-3 md:grid-cols-[200px_minmax(0,1fr)]";
  return (
    <div
      className={`grid min-w-0 border-b border-rule py-2.5 ${raster} [&>*]:min-w-0 ${
        aktiv ? "border-l-[3px] border-l-signal pl-3" : ""
      }`}
    >
      <span
        className={`break-words font-mono uppercase tracking-[0.12em] text-ink-soft ${
          untereinander ? "text-[12px] md:text-[11px]" : "text-[11px]"
        }`}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

export default function Datenblatt({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

import type { ReactNode } from "react";
import type { ReferenzFeld } from "@/lib/referenzFelder";

// Feldraster der Übersichtskarte (Typenschild-Stil: kleine graue Versal-
// Beschriftung und Wert). Die Spaltenzahl richtet sich nach der Kartenbreite
// (Container-Query): sehr schmale Karten (Handy, zwei je Zeile) zeigen je
// Feld eine Zeile "Beschriftung … Wert", breitere zwei Felder je Zeile, sehr
// breite vier. Lange Wörter brechen um, nichts läuft über.
// Ein leeres Feld bleibt an seinem Platz und zeigt "fehlt" in Rot (--critical).
export default function ReferenzFeldRaster({
  zeilen,
  fehltText,
  kopf,
}: {
  zeilen: ReferenzFeld[][];
  fehltText: string;
  /** Dezente Angabe oben rechts, z.B. "2 Angaben fehlen". */
  kopf?: ReactNode;
}) {
  return (
    <div className="@container px-3 pb-2">
      {kopf && <div className="flex justify-end pb-1">{kopf}</div>}
      {zeilen.map((zeile, i) => (
        <div
          key={i}
          className="grid grid-cols-1 gap-y-1 border-t border-rule py-1.5 @[13rem]:grid-cols-2 @[13rem]:gap-x-3 @[26rem]:grid-cols-4"
        >
          {zeile.map((feld) => (
            // Schmal: Beschriftung und Wert in einer Zeile, wenn beides passt,
            // sonst rutscht der Wert in die nächste Zeile. Getrennt wird nur ein
            // Wort, das länger als die ganze Zeile ist.
            <div
              key={feld.schluessel}
              className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-2 @[13rem]:block"
            >
              <span className="max-w-full font-mono text-[10px] uppercase tracking-[0.05em] text-ink-soft [overflow-wrap:break-word] @[13rem]:block">
                {feld.label}
              </span>
              {feld.wert === null ? (
                <span className="ml-auto text-[11px] text-critical @[13rem]:ml-0 @[13rem]:block">{fehltText}</span>
              ) : (
                <span className="ml-auto max-w-full text-right text-[12px] leading-snug text-ink [overflow-wrap:break-word] @[13rem]:ml-0 @[13rem]:block @[13rem]:text-left">
                  {feld.wert}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

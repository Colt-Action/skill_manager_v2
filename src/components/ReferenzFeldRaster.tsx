import type { ReferenzFeld } from "@/lib/referenzFelder";

// Feldraster der Übersichtskarte (Typenschild-Stil: kleine graue Versal-
// Beschriftung, darunter der Wert). Vier Felder je Zeile nebeneinander,
// sobald die Karte breit genug ist (Container-Query), sonst zwei je Zeile.
export default function ReferenzFeldRaster({ zeilen }: { zeilen: ReferenzFeld[][] }) {
  return (
    <div className="@container px-3 pb-3">
      {zeilen.map((zeile, i) => (
        <div key={i} className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-rule py-2 @[26rem]:grid-cols-4">
          {zeile.map((feld) => (
            <div key={feld.schluessel} className="min-w-0">
              <span className="block truncate font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                {feld.label}
              </span>
              <span className="block break-words text-[13px] text-ink">{feld.wert ?? "–"}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

"use client";

import Icon from "@/components/icons/Icon";

export interface KachelOption<T extends string> {
  wert: T;
  label: string;
}

// Field Mode (docs/field-mode-rev01.md, 3.1): kurze Auswahlmengen (bis etwa
// fünf Optionen) als große Tipp-Flächen statt Dropdown. Die aktuelle Auswahl
// ist eindeutig sichtbar (gefüllt + Haken + aria-pressed). Mit leerErlaubt
// hebt ein zweites Antippen der gewählten Kachel die Auswahl wieder auf.
export default function AuswahlKacheln<T extends string>({
  optionen,
  wert,
  onWaehlen,
  leerErlaubt = false,
  label,
  spaltenMobil = 2,
}: {
  optionen: KachelOption<T>[];
  wert: T | "";
  onWaehlen: (wert: T | "") => void;
  leerErlaubt?: boolean;
  /** Für Screenreader: Name der Gruppe (das sichtbare Label steht in der Datenblatt-Zeile). */
  label: string;
  spaltenMobil?: 1 | 2;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`grid gap-2 ${spaltenMobil === 1 ? "grid-cols-1" : "grid-cols-2"} md:flex md:flex-wrap`}
    >
      {optionen.map((option) => {
        const gewaehlt = option.wert === wert;
        return (
          <button
            key={option.wert}
            type="button"
            aria-pressed={gewaehlt}
            onClick={() => onWaehlen(gewaehlt && leerErlaubt ? "" : option.wert)}
            className={`flex min-h-12 min-w-0 items-center justify-center gap-1.5 rounded-[2px] border px-3 py-2 text-center text-sm leading-tight md:min-h-10 ${
              gewaehlt ? "border-ink bg-ink font-semibold text-paper" : "border-rule bg-paper-2 text-ink hover:border-ink"
            }`}
          >
            {gewaehlt && <Icon name="haken" size={14} className="shrink-0" />}
            <span className="min-w-0 break-words">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

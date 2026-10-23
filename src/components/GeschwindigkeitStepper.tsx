"use client";

import { useState } from "react";
import { useSprache } from "@/components/SprachProvider";
import { GESCHWINDIGKEIT_MAX } from "@/lib/referenzvideoOptionen";

// Field Mode (docs/field-mode-rev01.md, 3.2): Geschwindigkeit am Handy als
// [−]  2,5 m/s  [+] statt kleinem Slider. Schrittweite 0,5 m/s, Antippen des
// Werts erlaubt direkte Eingabe, "Nicht angegeben" setzt null. null und 0
// bleiben getrennt: 0 wird nie gespeichert (gilt als nicht angegeben).
export const GESCHWINDIGKEIT_STEPPER_SCHRITT = 0.5;
/** Startwert beim ersten Antippen von − oder + aus "nicht angegeben". */
export const GESCHWINDIGKEIT_STEPPER_START = 2.5;
const MINIMUM = GESCHWINDIGKEIT_STEPPER_SCHRITT;

function runden(wert: number): number {
  return Math.round(wert * 10) / 10;
}

export default function GeschwindigkeitStepper({
  wert,
  onAendern,
  label,
}: {
  wert: number | null;
  onAendern: (wert: number | null) => void;
  label: string;
}) {
  const { t, sprache } = useSprache();
  const [eingabe, setEingabe] = useState<string | null>(null);
  const zahl = new Intl.NumberFormat(sprache, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  function schritt(richtung: 1 | -1) {
    if (wert === null) {
      onAendern(GESCHWINDIGKEIT_STEPPER_START);
      return;
    }
    const neu = runden(wert + richtung * GESCHWINDIGKEIT_STEPPER_SCHRITT);
    onAendern(Math.min(GESCHWINDIGKEIT_MAX, Math.max(MINIMUM, neu)));
  }

  function eingabeUebernehmen() {
    if (eingabe === null) return;
    const text = eingabe.trim().replace(",", ".");
    setEingabe(null);
    if (!text) {
      onAendern(null);
      return;
    }
    const neu = Number(text);
    if (!Number.isFinite(neu) || neu <= 0) {
      onAendern(null);
      return;
    }
    onAendern(Math.min(GESCHWINDIGKEIT_MAX, runden(neu)));
  }

  const knopf =
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-[2px] border border-ink text-xl font-medium text-ink disabled:opacity-40 md:h-10 md:w-10";

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => schritt(-1)}
          disabled={wert !== null && wert <= MINIMUM}
          aria-label={`${label} −${zahl.format(GESCHWINDIGKEIT_STEPPER_SCHRITT)} m/s`}
          className={knopf}
        >
          −
        </button>

        {eingabe !== null ? (
          <input
            autoFocus
            inputMode="decimal"
            enterKeyHint="done"
            value={eingabe}
            onChange={(e) => setEingabe(e.target.value)}
            onBlur={eingabeUebernehmen}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") setEingabe(null);
            }}
            aria-label={label}
            className="h-12 min-w-0 flex-1 rounded-[2px] border border-ink bg-paper-2 px-2 text-center font-mono text-lg tabular-nums text-ink outline-none md:h-10"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEingabe(wert === null ? "" : zahl.format(wert))}
            aria-label={`${label}: ${wert === null ? t("referenzvideos.geschwindigkeitNichtAngegeben") : `${zahl.format(wert)} m/s`}`}
            className={`flex h-12 min-w-0 flex-1 items-center justify-center rounded-[2px] border border-rule bg-paper-2 px-2 font-mono tabular-nums md:h-10 ${
              wert === null ? "text-sm text-ink-soft" : "text-lg text-ink"
            }`}
          >
            <span className="min-w-0 break-words text-center">
              {wert === null ? t("referenzvideos.geschwindigkeitNichtAngegeben") : `${zahl.format(wert)} m/s`}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => schritt(1)}
          disabled={wert !== null && wert >= GESCHWINDIGKEIT_MAX}
          aria-label={`${label} +${zahl.format(GESCHWINDIGKEIT_STEPPER_SCHRITT)} m/s`}
          className={knopf}
        >
          +
        </button>
      </div>

      <button
        type="button"
        aria-pressed={wert === null}
        onClick={() => {
          setEingabe(null);
          onAendern(null);
        }}
        className={`min-h-11 rounded-[2px] border px-3 text-sm md:min-h-10 md:self-start ${
          wert === null ? "border-ink bg-ink font-semibold text-paper" : "border-rule bg-paper-2 text-ink hover:border-ink"
        }`}
      >
        {t("referenzvideos.geschwindigkeitNichtAngegebenKnopf")}
      </button>
    </div>
  );
}

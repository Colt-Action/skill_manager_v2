"use client";

import { useSprache } from "@/components/SprachProvider";
import { GESCHWINDIGKEIT_MAX, GESCHWINDIGKEIT_MIN, GESCHWINDIGKEIT_SCHRITT } from "@/lib/referenzvideoOptionen";

// Geschwindigkeits-Eingabe für Formulare (Werksbesichtigung, Referenz-Upload,
// Admin-Editor). Startet leer ("nicht angegeben"): ganz links gezogen bzw.
// "Zurücksetzen" ergibt null statt 0, damit eine nicht erfasste
// Geschwindigkeit nicht als 0 m/s gespeichert wird. Gleiches Bedienmuster wie
// der Geschwindigkeitsfilter im Referenzbereich (der bleibt eigenständig).
export default function GeschwindigkeitRegler({
  wert,
  onAendern,
  label,
}: {
  wert: number | null;
  onAendern: (wert: number | null) => void;
  /** Für Screenreader, da das sichtbare Label je Formular woanders steht. */
  label: string;
}) {
  const { t } = useSprache();
  const anzeige = wert === null ? t("referenzvideos.geschwindigkeitNichtAngegeben") : `${wert.toFixed(1)} m/s`;

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={GESCHWINDIGKEIT_MIN}
        max={GESCHWINDIGKEIT_MAX}
        step={GESCHWINDIGKEIT_SCHRITT}
        value={wert ?? GESCHWINDIGKEIT_MIN}
        onChange={(e) => {
          const neu = Number(e.target.value);
          onAendern(neu <= GESCHWINDIGKEIT_MIN ? null : neu);
        }}
        aria-label={label}
        aria-valuetext={anzeige}
        className="min-w-0 flex-1 accent-signal"
      />
      <span
        className={`shrink-0 font-mono text-[13px] tabular-nums ${wert === null ? "text-ink-soft" : "text-ink"}`}
      >
        {anzeige}
      </span>
      {wert !== null && (
        <button
          type="button"
          onClick={() => onAendern(null)}
          className="shrink-0 rounded-[2px] border border-rule px-2 py-1 text-xs text-ink-soft hover:bg-paper-2"
        >
          {t("referenzvideos.zuruecksetzen")}
        </button>
      )}
    </div>
  );
}

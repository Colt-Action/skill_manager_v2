"use client";

import { useSprache } from "@/components/SprachProvider";

export type SpeicherZustand = "ungespeichert" | "speichert" | "gespeichert" | "fehler";

const ZUSTAND_SCHLUESSEL: Record<SpeicherZustand, string> = {
  ungespeichert: "werksbesichtigungen.zustandUngespeichert",
  speichert: "werksbesichtigungen.zustandSpeichert",
  gespeichert: "werksbesichtigungen.zustandGespeichert",
  fehler: "werksbesichtigungen.zustandFehler",
};

const MARKER_KLASSE: Record<SpeicherZustand, string> = {
  ungespeichert: "bg-ink",
  speichert: "border border-ink-soft",
  gespeichert: "bg-ok",
  fehler: "bg-critical",
};

const TEXT_KLASSE: Record<SpeicherZustand, string> = {
  ungespeichert: "text-ink",
  speichert: "text-ink-soft",
  gespeichert: "text-ok",
  fehler: "text-critical",
};

// Zentrale Speichern-Leiste der Werksbesichtigung: Zustand (Ungespeicherte
// Änderungen · Speichern … · Gespeichert · Fehler) plus "Zwischenspeichern"
// und "Bericht abschließen" bzw. "Bericht wieder öffnen". Die Farbe ist nie
// die einzige Information - der Zustand steht immer als Text daneben.
export function SpeicherZustandAnzeige({ zustand }: { zustand: SpeicherZustand }) {
  const { t } = useSprache();
  return (
    <span
      role="status"
      aria-live="polite"
      className={`flex min-w-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] ${TEXT_KLASSE[zustand]}`}
    >
      <span aria-hidden className={`h-2 w-2 shrink-0 ${MARKER_KLASSE[zustand]}`} />
      <span className="truncate">{t(ZUSTAND_SCHLUESSEL[zustand])}</span>
    </span>
  );
}

export default function WerksbesichtigungSpeicherLeiste({
  zustand,
  abgeschlossen,
  laeuft,
  onZwischenspeichern,
  onAbschliessen,
  onWiederOeffnen,
}: {
  zustand: SpeicherZustand;
  abgeschlossen: boolean;
  laeuft: boolean;
  onZwischenspeichern: () => void;
  onAbschliessen: () => void;
  onWiederOeffnen: () => void;
}) {
  const { t } = useSprache();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <SpeicherZustandAnzeige zustand={zustand} />
      <div className="ml-auto flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onZwischenspeichern}
          disabled={laeuft}
          className="h-11 rounded-[2px] border border-ink px-3 text-sm font-medium text-ink disabled:opacity-50 md:h-10"
        >
          {t("werksbesichtigungen.zwischenspeichern")}
        </button>
        {abgeschlossen ? (
          <button
            type="button"
            onClick={onWiederOeffnen}
            disabled={laeuft}
            className="h-11 rounded-[2px] border border-ink px-3 text-sm font-medium text-ink disabled:opacity-50 md:h-10"
          >
            {t("werksbesichtigungen.wiederOeffnenButton")}
          </button>
        ) : (
          <button
            type="button"
            onClick={onAbschliessen}
            disabled={laeuft}
            className="h-11 rounded-[2px] bg-signal px-3 text-sm font-semibold text-signal-ink disabled:opacity-50 md:h-10"
          >
            {t("werksbesichtigungen.abschliessenButton")}
          </button>
        )}
      </div>
    </div>
  );
}

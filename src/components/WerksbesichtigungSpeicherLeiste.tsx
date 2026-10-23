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
      <span className="min-w-0 break-words">{t(ZUSTAND_SCHLUESSEL[zustand])}</span>
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
  // Mobil: Zustand oben, darunter zwei gleich breite Knöpfe (Text darf
  // umbrechen statt abgeschnitten zu werden). Ab md: alles in einer Zeile.
  return (
    <div className="flex min-w-0 flex-col gap-1.5 md:flex-row md:items-center md:gap-3">
      <SpeicherZustandAnzeige zustand={zustand} />
      <div className="grid grid-cols-2 gap-2 md:ml-auto md:flex md:shrink-0">
        <button
          type="button"
          onClick={onZwischenspeichern}
          disabled={laeuft}
          className="min-h-11 rounded-[2px] border border-ink px-3 py-1 text-sm font-medium leading-tight text-ink disabled:opacity-50 md:min-h-10"
        >
          {t("werksbesichtigungen.zwischenspeichern")}
        </button>
        {abgeschlossen ? (
          <button
            type="button"
            onClick={onWiederOeffnen}
            disabled={laeuft}
            className="min-h-11 rounded-[2px] border border-ink px-3 py-1 text-sm font-medium leading-tight text-ink disabled:opacity-50 md:min-h-10"
          >
            {t("werksbesichtigungen.wiederOeffnenButton")}
          </button>
        ) : (
          <button
            type="button"
            onClick={onAbschliessen}
            disabled={laeuft}
            className="min-h-11 rounded-[2px] bg-signal px-3 py-1 text-sm font-semibold leading-tight text-signal-ink disabled:opacity-50 md:min-h-10"
          >
            {t("werksbesichtigungen.abschliessenButton")}
          </button>
        )}
      </div>
    </div>
  );
}

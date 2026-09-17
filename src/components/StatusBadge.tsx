const TON_KLASSEN = {
  success: "text-ok",
  accent: "text-signal",
  neutral: "text-ink-soft",
  critical: "text-critical",
} as const;

export type StatusTon = keyof typeof TON_KLASSEN;

// Einheitliches "Punkt + Text"-Muster für alle Status-Anzeigen in der App
// (Video-Status, Nutzer aktiv/deaktiviert, usw.). Kein Pill-Hintergrund mehr
// (Designkonzept "Typenschild" Rev. 02: Signalorange nur für aktiv/primär) -
// nur ein Punkt in der Statusfarbe plus Mono-Text.
export default function StatusBadge({ label, ton }: { label: string; ton: StatusTon }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.08em] ${TON_KLASSEN[ton]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

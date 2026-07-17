const TON_KLASSEN = {
  success: "bg-success/10 text-success-ink",
  accent: "bg-accent/10 text-accent-deep",
  neutral: "bg-background text-foreground-soft ring-1 ring-line",
  critical: "bg-critical/10 text-critical",
} as const;

export type StatusTon = keyof typeof TON_KLASSEN;

// Einheitliches "Punkt + Text"-Muster für alle Status-Anzeigen in der App
// (Video-Status, Nutzer aktiv/deaktiviert, usw.), damit Farben/Form überall
// gleich aussehen und auf einen Blick erkennbar sind.
export default function StatusBadge({ label, ton }: { label: string; ton: StatusTon }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide ${TON_KLASSEN[ton]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

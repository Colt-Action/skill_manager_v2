import type { ReactNode } from "react";

// Gemeinsame Grundform für Filter und Formulare (Designkonzept "Typenschild"
// Rev. 02, Abschnitt C/I): Label links in Mono-Versalien, Feld rechts,
// getrennt durch eine Linie. Wer ausfüllt, lernt dieselbe Form wie wer
// filtert. Ein aktiver Filterwert bekommt eine Stempelkante links.

export const eingabeKlasse =
  "h-10 md:h-11 w-full rounded-[2px] border border-rule bg-paper-2 px-2.5 text-sm text-ink outline-none focus:border-ink";

export function DatenblattZeile({
  label,
  children,
  aktiv,
}: {
  label: string;
  children: ReactNode;
  aktiv?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[140px_1fr] items-center gap-3 border-b border-rule py-2.5 md:grid-cols-[200px_1fr] ${
        aktiv ? "border-l-[3px] border-l-signal pl-3" : ""
      }`}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft md:text-[11px]">{label}</span>
      {children}
    </div>
  );
}

export default function Datenblatt({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

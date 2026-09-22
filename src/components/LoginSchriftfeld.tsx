import type { ReactNode } from "react";
import SpracheAuswahl from "@/components/SpracheAuswahl";

// Gemeinsamer Rahmen für Login/Passwort-vergessen (Designkonzept "Typenschild"
// Rev. 02, Abschnitt E): das Formular liegt auf einem "Zeichenblatt", das
// unten von einem echten Schriftfeld (technisches Titel-Feld) abgeschlossen
// wird - Anlage/Datum/Maßstab/Revision, statt nur einer Mono-Caption-Zeile.
export default function LoginSchriftfeld({
  eyebrow,
  titel,
  untertitel,
  children,
}: {
  eyebrow: string;
  titel: string;
  untertitel?: string;
  children: ReactNode;
}) {
  const datum = new Intl.DateTimeFormat("de-DE", { year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(),
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-plate px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-3 flex justify-end">
          <SpracheAuswahl className="border border-plate-rule bg-white/[.06] px-2 py-1 font-mono text-xs uppercase tracking-wide text-plate-soft outline-none" />
        </div>

        <div className="border border-rule-strong bg-paper text-ink">
          <div className="p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-signal">{eyebrow}</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-ink">{titel}</h1>
            {untertitel && <p className="mt-1 text-sm text-ink-soft">{untertitel}</p>}
            {children}
          </div>

          <div className="grid grid-cols-4 border-t border-rule-strong font-mono text-[10px] uppercase tracking-[0.08em]">
            <SchriftfeldZelle label="Anlage" wert="Skill Manager" />
            <SchriftfeldZelle label="Datum" wert={datum} />
            <SchriftfeldZelle label="Maßstab" wert="1:1" />
            <SchriftfeldZelle label="Rev." wert="02" letzte />
          </div>
        </div>
      </div>
    </div>
  );
}

function SchriftfeldZelle({ label, wert, letzte }: { label: string; wert: string; letzte?: boolean }) {
  return (
    <div className={`border-r border-rule px-2 py-1.5 ${letzte ? "border-r-0" : ""}`}>
      <span className="block text-ink-faint">{label}</span>
      <span className="block truncate text-ink-soft">{wert}</span>
    </div>
  );
}

import type { ReactNode } from "react";

// Jede Section hängt an einer Linie statt in einer Kiste zu stehen
// (Designkonzept "Typenschild" Rev. 02, Prinzip 4). Titel in gemischter
// Schreibung, keine Versalien (Prinzip 6) - nur Nummern, Marke und
// Feldlabels sind Versalien.
export default function SectionLinie({ titel, rechts }: { titel: string; rechts?: ReactNode }) {
  return (
    <div className="flex items-baseline gap-4 border-t border-rule-strong pt-2">
      <h2 className="font-display text-[26px] font-bold leading-none text-ink">{titel}</h2>
      {rechts && <div className="ml-auto">{rechts}</div>}
    </div>
  );
}

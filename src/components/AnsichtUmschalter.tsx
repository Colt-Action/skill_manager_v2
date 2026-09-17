"use client";

import Icon from "@/components/icons/Icon";

export type Ansicht = "karten" | "index";

// Umschalter Karten/Index auf der Section-Linie von Videothek und
// Referenzbereich (Designkonzept "Typenschild" Rev. 02, Abschnitt D/I).
export default function AnsichtUmschalter({
  wert,
  onAendern,
  labelKarten,
  labelIndex,
}: {
  wert: Ansicht;
  onAendern: (wert: Ansicht) => void;
  labelKarten: string;
  labelIndex: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => onAendern("karten")}
        aria-pressed={wert === "karten"}
        title={labelKarten}
        className={`flex items-center gap-1.5 border-b-2 pb-0.5 text-sm ${
          wert === "karten" ? "border-signal text-ink" : "border-transparent text-ink-soft"
        }`}
      >
        <Icon name="karten" size={16} />
        <span className="hidden sm:inline">{labelKarten}</span>
      </button>
      <button
        type="button"
        onClick={() => onAendern("index")}
        aria-pressed={wert === "index"}
        title={labelIndex}
        className={`flex items-center gap-1.5 border-b-2 pb-0.5 text-sm ${
          wert === "index" ? "border-signal text-ink" : "border-transparent text-ink-soft"
        }`}
      >
        <Icon name="index" size={16} />
        <span className="hidden sm:inline">{labelIndex}</span>
      </button>
    </div>
  );
}

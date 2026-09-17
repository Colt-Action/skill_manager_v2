"use client";

import { useId, useState } from "react";

// Vorher/Nachher als eine Interaktion statt zwei nebeneinander stehender
// Bilder (Designkonzept "Typenschild" Rev. 02, Abschnitt D/I): ein Regler
// legt das Vorher-Bild über das Nachher-Bild.
export default function VorherNachher({
  vorherUrl,
  nachherUrl,
  vorherLabel,
  nachherLabel,
}: {
  vorherUrl: string;
  nachherUrl: string;
  vorherLabel: string;
  nachherLabel: string;
}) {
  const [x, setX] = useState(50);
  const id = useId();

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="relative aspect-[4/3] overflow-hidden bg-plate">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={nachherUrl} alt={nachherLabel} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={vorherUrl} alt={vorherLabel} className="h-full w-full object-cover" />
        </div>
        <span className="absolute left-2 top-2 bg-black/55 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-plate-ink">
          {vorherLabel}
        </span>
        <span className="absolute right-2 top-2 bg-black/55 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-plate-ink">
          {nachherLabel}
        </span>
        <div className="pointer-events-none absolute inset-y-0 w-[2px] bg-signal" style={{ left: `${x}%` }}>
          <span className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-signal bg-paper" />
        </div>
        <label htmlFor={id} className="sr-only">
          {vorherLabel} / {nachherLabel}
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={x}
          onChange={(e) => setX(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <div className="mt-2 flex justify-center gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => setX(0)}
          className="h-9 flex-1 border border-rule text-sm text-ink-soft"
        >
          {vorherLabel}
        </button>
        <button
          type="button"
          onClick={() => setX(100)}
          className="h-9 flex-1 border border-rule text-sm text-ink-soft"
        >
          {nachherLabel}
        </button>
      </div>
    </div>
  );
}

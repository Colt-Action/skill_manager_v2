"use client";

import { useState } from "react";
import { onboardingAbgeschlossen } from "@/lib/actions/profil";

interface Schritt {
  icon: string;
  titel: string;
  text: string;
}

const SCHRITTE: Schritt[] = [
  {
    icon: "👋",
    titel: "Willkommen im Skill Manager",
    text: "Hier findest du kurze Erklärvideos zu Maschinenteilen – schnell auffindbar, egal wo du gerade arbeitest.",
  },
  {
    icon: "🔍",
    titel: "Video-Bibliothek",
    text: "Über \"Video-Bibliothek\" durchsuchst und filterst du alle Videos – nach Kategorie, Teil oder freiem Suchtext.",
  },
  {
    icon: "⬆️",
    titel: "Selbst hochladen",
    text: "Hast du ein hilfreiches Video? Lade es über \"Hochladen\" hoch – ein Admin prüft und veröffentlicht es dann.",
  },
  {
    icon: "🏷️",
    titel: "QR-Code am Teil scannen",
    text: "Viele Maschinenteile haben einen QR-Code aufgeklebt. Scan ihn mit dem Handy, um direkt die passenden Videos zu sehen.",
  },
];

export default function OnboardingTour() {
  const [sichtbar, setSichtbar] = useState(true);
  const [schritt, setSchritt] = useState(0);

  if (!sichtbar) return null;

  const istLetzter = schritt === SCHRITTE.length - 1;
  const aktuell = SCHRITTE[schritt];

  function schliessen() {
    setSichtbar(false);
    void onboardingAbgeschlossen();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 text-foreground shadow-2xl ring-1 ring-line">
        <span className="text-3xl">{aktuell.icon}</span>
        <h2 className="mt-3 font-display text-lg font-bold uppercase tracking-wide text-foreground">
          {aktuell.titel}
        </h2>
        <p className="mt-2 text-sm text-foreground-soft">{aktuell.text}</p>

        <div className="mt-5 flex items-center justify-center gap-1.5">
          {SCHRITTE.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i === schritt ? "bg-accent" : "bg-line"}`}
            />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button type="button" onClick={schliessen} className="text-xs text-foreground-soft hover:text-foreground">
            Überspringen
          </button>
          <button
            type="button"
            onClick={() => (istLetzter ? schliessen() : setSchritt((s) => s + 1))}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-accent-ink transition hover:bg-accent-deep"
          >
            {istLetzter ? "Los geht's" : "Weiter"}
          </button>
        </div>
      </div>
    </div>
  );
}

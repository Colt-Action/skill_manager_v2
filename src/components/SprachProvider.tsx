"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { STANDARD_SPRACHE, istGueltigeSprache, type Sprache } from "@/lib/i18n/sprachen";
import { t as tRoh } from "@/lib/i18n/t";
import { spracheAendern } from "@/lib/actions/sprache";

interface SprachContextWert {
  sprache: Sprache;
  setSprache: (neu: Sprache) => void;
  t: (schluessel: string, variablen?: Record<string, string>) => string;
}

const SprachContext = createContext<SprachContextWert | null>(null);

// Wird ganz oben im Layout eingebunden. initialSprache kommt vom Server
// (aus dem Nutzerprofil, falls eingeloggt, sonst "de"). Ein Wechsel wirkt
// sofort im Browser und wird - falls eingeloggt - zusätzlich im Profil
// gespeichert; nicht eingeloggte Nutzer (Login-Seite) bekommen die Wahl
// zumindest für die aktuelle Sitzung über localStorage gemerkt.
export default function SprachProvider({
  initialSprache,
  children,
}: {
  initialSprache: Sprache;
  children: React.ReactNode;
}) {
  const [sprache, setSpracheState] = useState<Sprache>(() => {
    if (initialSprache !== STANDARD_SPRACHE) return initialSprache;
    try {
      const gespeichert = localStorage.getItem("sm-sprache");
      if (gespeichert && istGueltigeSprache(gespeichert)) return gespeichert;
    } catch {
      // localStorage evtl. blockiert - dann bleibt es bei initialSprache.
    }
    return initialSprache;
  });

  const setSprache = useCallback((neu: Sprache) => {
    setSpracheState(neu);
    try {
      localStorage.setItem("sm-sprache", neu);
    } catch {
      // s.o.
    }
    void spracheAendern(neu);
  }, []);

  const t = useCallback(
    (schluessel: string, variablen?: Record<string, string>) => tRoh(schluessel, sprache, variablen),
    [sprache],
  );

  return (
    <SprachContext.Provider value={{ sprache, setSprache, t }}>{children}</SprachContext.Provider>
  );
}

export function useSprache() {
  const wert = useContext(SprachContext);
  if (!wert) throw new Error("useSprache muss innerhalb von SprachProvider verwendet werden.");
  return wert;
}

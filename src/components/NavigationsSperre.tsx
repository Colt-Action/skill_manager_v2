"use client";

import { createContext, useContext, useMemo, useRef } from "react";

// Navigationssperre bei ungespeicherten Änderungen, nach dem Muster
// "Blocking navigation" der Next-Dokumentation (Link onNavigate + Context).
// Abweichung vom Doku-Beispiel: Die Sperre liegt in einem Ref statt in
// useState - ein Wechsel rendert so nichts neu, andere Seiten merken davon
// nichts. Eine Seite setzt per setSperre(meldung) die Rückfrage (null = frei);
// Links rufen in onNavigate pruefen() auf.

interface NavigationsSperreWert {
  setSperre: (meldung: string | null) => void;
  /** true = Navigation erlaubt (keine Sperre oder Nutzer bestätigt). */
  pruefen: () => boolean;
}

const NavigationsSperreKontext = createContext<NavigationsSperreWert>({
  setSperre: () => {},
  pruefen: () => true,
});

export function NavigationsSperreProvider({ children }: { children: React.ReactNode }) {
  const meldung = useRef<string | null>(null);
  const wert = useMemo<NavigationsSperreWert>(
    () => ({
      setSperre: (neu) => {
        meldung.current = neu;
      },
      pruefen: () => meldung.current === null || window.confirm(meldung.current),
    }),
    [],
  );
  return <NavigationsSperreKontext.Provider value={wert}>{children}</NavigationsSperreKontext.Provider>;
}

export function useNavigationsSperre(): NavigationsSperreWert {
  return useContext(NavigationsSperreKontext);
}

// Für <Link onNavigate={…}>: verhindert die Navigation, wenn der Nutzer die
// Rückfrage abbricht. Gibt zurück, ob navigiert wird.
export function useNavigationPruefen(): (e: { preventDefault: () => void }) => boolean {
  const { pruefen } = useNavigationsSperre();
  return (e) => {
    if (pruefen()) return true;
    e.preventDefault();
    return false;
  };
}

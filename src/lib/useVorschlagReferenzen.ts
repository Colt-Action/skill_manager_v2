"use client";

import { useEffect, useState } from "react";
import { vorschlagReferenzenLaden } from "@/lib/actions/vorschlaege";
import type { VorschlagReferenz } from "@/lib/referenzVorschlaege";

// Referenzen für "Vergleichbare Installationen" je Produkt. Geladen wird nur,
// wenn sich das Produkt ändert (entprellt) - die Bewertung mit den aktuellen
// Bandwerten passiert ohne neue Abfrage im Browser. Positionen mit demselben
// Produkt teilen sich eine Abfrage (Zwischenspeicher je Seite). Fehler werden
// nicht gespeichert, damit ein späterer Versuch neu lädt.

const ENTPRELLEN_MS = 400;
const zwischenspeicher = new Map<string, Promise<VorschlagReferenz[]>>();

function laden(produktId: string): Promise<VorschlagReferenz[]> {
  const vorhanden = zwischenspeicher.get(produktId);
  if (vorhanden) return vorhanden;
  const versprechen = vorschlagReferenzenLaden([produktId]).then((ergebnis) => {
    if (!ergebnis.erfolg) throw new Error("Vorschläge nicht verfügbar");
    return ergebnis.referenzen[produktId] ?? [];
  });
  zwischenspeicher.set(produktId, versprechen);
  versprechen.catch(() => zwischenspeicher.delete(produktId));
  return versprechen;
}

export type VorschlagLadezustand =
  | { zustand: "ohneProdukt" }
  | { zustand: "laedt" }
  | { zustand: "fehler" }
  | { zustand: "ok"; referenzen: VorschlagReferenz[] };

export function useVorschlagReferenzen(produktId: string | null): VorschlagLadezustand {
  // Ergebnis mit dem Produkt, zu dem es gehört - "laedt" ergibt sich daraus,
  // ohne im Effekt synchron Zustand zu setzen.
  const [ergebnis, setErgebnis] = useState<{ produktId: string; referenzen: VorschlagReferenz[] | null } | null>(null);

  useEffect(() => {
    if (!produktId) return;
    let aktiv = true;
    const zeitgeber = setTimeout(() => {
      laden(produktId).then(
        (referenzen) => aktiv && setErgebnis({ produktId, referenzen }),
        () => aktiv && setErgebnis({ produktId, referenzen: null }),
      );
    }, ENTPRELLEN_MS);
    return () => {
      aktiv = false;
      clearTimeout(zeitgeber);
    };
  }, [produktId]);

  if (!produktId) return { zustand: "ohneProdukt" };
  if (!ergebnis || ergebnis.produktId !== produktId) return { zustand: "laedt" };
  if (!ergebnis.referenzen) return { zustand: "fehler" };
  return { zustand: "ok", referenzen: ergebnis.referenzen };
}

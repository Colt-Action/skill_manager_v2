"use client";

import { useState } from "react";

// Auf-/Zuklappen einer Karte der Werksbesichtigung (Field Mode 3.4):
// fertige Karten starten zugeklappt, nicht fertige (z.B. neue) aufgeklappt.
// Wird eine Karte fertig (z.B. nach dem Speichern), klappt sie von selbst zu.
// Manuell lässt sie sich jederzeit auf- und zuklappen. Die Eingaben liegen im
// WerksbesichtigungEditor, Zuklappen verliert deshalb nichts.
export function useZusammenklappen(fertig: boolean): [boolean, (offen: boolean) => void] {
  const [offen, setOffen] = useState(!fertig);
  const [warFertig, setWarFertig] = useState(fertig);
  if (fertig !== warFertig) {
    setWarFertig(fertig);
    if (fertig) setOffen(false);
  }
  return [offen, setOffen];
}

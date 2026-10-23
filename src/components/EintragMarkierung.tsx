"use client";

import { useSprache } from "@/components/SprachProvider";

// Kennzeichnung eines Berichtsteils (Allgemeine Angaben, Förderband,
// Position) beim zentralen Speichern: "Ungespeicherte Änderungen" als kleine
// Marke bzw. die Fehlermeldung des letzten Speicherversuchs als Zeile mit
// roter Kante. Ohne Inhalt wird nichts gerendert.
export default function EintragMarkierung({ ungespeichert, fehler }: { ungespeichert?: boolean; fehler?: string }) {
  const { t } = useSprache();
  if (fehler) {
    return (
      <p role="alert" className="mt-2 break-words border-l-[3px] border-critical pl-3 text-sm text-critical">
        {fehler}
      </p>
    );
  }
  if (!ungespeichert) return null;
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink">
      <span aria-hidden className="h-2 w-2 bg-ink" />
      {t("werksbesichtigungen.zustandUngespeichert")}
    </span>
  );
}

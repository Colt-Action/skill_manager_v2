"use client";

import { useRef, useState } from "react";
import { referenzLoeschen, type ReferenzLoeschErgebnis } from "@/lib/actions/referenzen";
import { useSprache } from "@/components/SprachProvider";

const FEHLER_SCHLUESSEL: Record<NonNullable<ReferenzLoeschErgebnis["fehler"]>, string> = {
  keineBerechtigung: "referenzLoeschen.fehlerKeineBerechtigung",
  nichtGefunden: "referenzLoeschen.fehlerNichtGefunden",
  dateienUebrig: "referenzLoeschen.fehlerDateienUebrig",
  datenbank: "referenzLoeschen.fehlerDatenbank",
  nichtGeloescht: "referenzLoeschen.fehlerNichtGeloescht",
};

// "Referenz löschen" auf der Detailseite - nur für Admins eingeblendet (die
// Server-Aktion prüft die Rolle zusätzlich selbst). Bestätigung in einem
// eigenen Dialog; erst danach wird gelöscht. Nach dem Löschen zurück zur
// Übersicht mit Hinweis.
export default function ReferenzLoeschen({ referenzId, titel }: { referenzId: string; titel: string }) {
  const { t } = useSprache();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<ReferenzLoeschErgebnis | null>(null);

  function oeffnen() {
    setFehler(null);
    dialogRef.current?.showModal();
  }

  // Bei Erfolg leitet die Server-Aktion selbst zur Übersicht weiter (redirect),
  // die den Hinweis "Referenz gelöscht" zeigt. Zurück kommt nur ein Fehler.
  async function loeschen() {
    setLaeuft(true);
    setFehler(null);
    const ergebnis = await referenzLoeschen(referenzId);
    setLaeuft(false);
    if (ergebnis && !ergebnis.erfolg) setFehler(ergebnis);
  }

  return (
    <section className="mt-10 border-t-[3px] border-critical pt-4">
      <button
        type="button"
        onClick={oeffnen}
        className="min-h-11 rounded-[2px] border border-critical px-4 text-sm font-medium text-critical hover:bg-paper-2"
      >
        {t("referenzLoeschen.button")}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="referenz-loeschen-titel"
        className="m-auto w-[min(32rem,calc(100vw-2rem))] border border-rule-strong bg-paper p-5 text-ink backdrop:bg-black/50"
      >
        <h2 id="referenz-loeschen-titel" className="font-display text-xl font-bold">
          {t("referenzLoeschen.titel")}
        </h2>
        <p className="mt-2 text-sm font-medium break-words">{titel}</p>
        <p className="mt-2 text-sm text-ink-soft">{t("referenzLoeschen.hinweis")}</p>

        {fehler?.fehler && (
          <div role="alert" className="mt-3 border-l-[3px] border-critical pl-3 text-sm text-ink">
            <p>{t(FEHLER_SCHLUESSEL[fehler.fehler])}</p>
            {fehler.reste && fehler.reste.length > 0 && (
              <ul className="mt-1 list-disc pl-5 font-mono text-xs break-all text-ink-soft">
                {fehler.reste.map((rest) => (
                  <li key={rest}>{rest}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            disabled={laeuft}
            className="min-h-11 rounded-[2px] border border-rule px-4 text-sm text-ink hover:bg-paper-2 disabled:opacity-50"
          >
            {t("referenzLoeschen.abbrechen")}
          </button>
          <button
            type="button"
            onClick={loeschen}
            disabled={laeuft}
            className="min-h-11 rounded-[2px] bg-critical px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {laeuft ? t("referenzLoeschen.laeuft") : t("referenzLoeschen.bestaetigen")}
          </button>
        </div>
      </dialog>
    </section>
  );
}

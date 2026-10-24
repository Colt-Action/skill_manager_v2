"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useSprache } from "@/components/SprachProvider";
import Icon from "@/components/icons/Icon";
import { produktZurKategorie } from "@/lib/produktFelder";
import {
  bandBedingungenAusFeldern,
  fehlendeBedingungenText,
  referenzVorschlaege,
  trefferAnzeige,
  type TrefferFeld,
} from "@/lib/referenzVorschlaege";
import { useVorschlagReferenzen } from "@/lib/useVorschlagReferenzen";
import type { BandFelder } from "@/lib/werksbesichtigungAenderungen";
import type { Kategorie } from "@/lib/supabase/types";

// Desktop (ab md) zeigt den Block ausgeklappt, das Handy eingeklappt.
const DESKTOP = "(min-width: 768px)";
function abonniereBreite(benachrichtigen: () => void) {
  const abfrage = window.matchMedia(DESKTOP);
  abfrage.addEventListener("change", benachrichtigen);
  return () => abfrage.removeEventListener("change", benachrichtigen);
}

// "Vergleichbare Installationen" je Position: bis zu drei Referenzen desselben
// Produkts unter ähnlichen Bandbedingungen (lib/referenzVorschlaege.ts). Eine
// Hilfe - trägt nichts in die Position ein. Bewertet mit den aktuellen, auch
// ungespeicherten Bandwerten; Laden und Fehler blockieren den Bericht nie.
export default function VergleichbareInstallationen({
  kategorien,
  produktKategorieId,
  band,
}: {
  kategorien: Kategorie[];
  produktKategorieId: string | null;
  band: BandFelder;
}) {
  const { t, sprache } = useSprache();
  const istDesktop = useSyncExternalStore(abonniereBreite, () => window.matchMedia(DESKTOP).matches, () => false);
  const [offenGewaehlt, setOffenGewaehlt] = useState<boolean | null>(null);
  const offen = offenGewaehlt ?? istDesktop;

  const produkt = produktZurKategorie(kategorien, produktKategorieId);
  const laden = useVorschlagReferenzen(produkt?.id ?? null);
  const ergebnis = useMemo(
    () =>
      referenzVorschlaege({
        band: bandBedingungenAusFeldern(band),
        produktKategorieId,
        kategorien,
        referenzen: laden.zustand === "ok" ? laden.referenzen : [],
      }),
    [band, produktKategorieId, kategorien, laden],
  );

  // Auslöser nicht erfüllt: nur ein kleiner grauer Hinweis, keine Vorschläge.
  if (ergebnis.status === "produktFehlt") {
    return <p className="py-2 text-xs text-ink-soft">{t("vorschlaege.produktWaehlen")}</p>;
  }
  if (ergebnis.status === "bedingungenUnvollstaendig") {
    return <p className="py-2 text-xs text-ink-soft">{fehlendeBedingungenText(ergebnis.fehlend, sprache, t)}</p>;
  }

  const anzahl = laden.zustand === "ok" ? ergebnis.treffer.length : null;
  const zaehler = anzahl === null || anzahl === 0 ? null : anzahl === 1 ? t("vorschlaege.anzahlEins") : t("vorschlaege.anzahl", { anzahl: String(anzahl) });

  return (
    <div className="min-w-0 border-b border-rule py-2">
      <button
        type="button"
        onClick={() => setOffenGewaehlt(!offen)}
        aria-expanded={offen}
        className="flex min-h-11 w-full min-w-0 items-center gap-2 text-left"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("vorschlaege.titel")}</span>
        {zaehler && <span className="text-xs text-ink-soft">· {zaehler}</span>}
        <Icon name="chevron" size={14} className={`ml-auto shrink-0 text-ink-soft ${offen ? "rotate-180" : ""}`} />
      </button>

      {offen && (
        <div className="mt-1">
          {laden.zustand === "laedt" && <p className="text-xs text-ink-soft">{t("vorschlaege.laedt")}</p>}
          {laden.zustand === "fehler" && <p className="text-xs text-ink-soft">{t("vorschlaege.nichtVerfuegbar")}</p>}
          {laden.zustand === "ok" && ergebnis.treffer.length === 0 && (
            <p className="text-xs text-ink-soft">{t("vorschlaege.keineTreffer")}</p>
          )}
          {laden.zustand === "ok" && ergebnis.treffer.length > 0 && (
            <ul className="grid grid-cols-1 gap-2">
              {ergebnis.treffer.map((treffer) => {
                const anzeige = trefferAnzeige(treffer, kategorien, sprache, t);
                return (
                  <li key={anzeige.referenzId} className="min-w-0 border border-rule bg-paper p-3">
                    <p className="text-sm font-medium text-ink [overflow-wrap:anywhere]">
                      {anzeige.produktTyp ?? t("vorschlaege.keineAngabe")}
                      {anzeige.land && <span className="font-normal text-ink-soft"> · {anzeige.land}</span>}
                    </p>
                    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-3">
                      {[...anzeige.bedingungen, ...anzeige.produktFelder].map((feld) => (
                        <FeldAnzeige key={feld.label} feld={feld} keineAngabe={t("vorschlaege.keineAngabe")} />
                      ))}
                    </dl>
                    {anzeige.gruende && <p className="mt-2 text-xs text-ink-soft">{anzeige.gruende}</p>}
                    <a
                      href={`/referenzbereich/${anzeige.referenzId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-signal underline underline-offset-2"
                    >
                      <Icon name="link" size={14} />
                      {t("vorschlaege.referenzOeffnen")}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function FeldAnzeige({ feld, keineAngabe }: { feld: TrefferFeld; keineAngabe: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.05em] text-ink-soft [overflow-wrap:break-word]">{feld.label}</dt>
      {/* Fehlende Angaben der Referenz dezent, nicht als Alarm. */}
      <dd className={`text-xs [overflow-wrap:anywhere] ${feld.wert === null ? "italic text-ink-faint" : "text-ink"}`}>
        {feld.wert ?? keineAngabe}
      </dd>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useSprache } from "@/components/SprachProvider";
import KategorieKaskade, { type KategoriePfad } from "@/components/KategorieKaskade";
import Icon from "@/components/icons/Icon";
import { produktTypText, tiefsteKategorieId } from "@/lib/kategorieBaum";
import { kategorieKette, produkteUnter, startHerstellerFinden, typGruppen } from "@/lib/produktAuswahl";
import { PRODUKTAUSWAHL_STARTPFAD } from "@/lib/werksbesichtigungOptionen";
import type { Kategorie } from "@/lib/supabase/types";

type Schritt = "zusammenfassung" | "produkt" | "typ";

// Geführte Produktauswahl je Position (docs/field-mode-rev01.md, 3.3):
// Produkt -> Typ (gruppiert nach Kategorie), danach eine kompakte
// Zusammenfassung "Produkt · Typ" mit "Ändern". Industrie und Hersteller
// kommen aus PRODUKTAUSWAHL_STARTPFAD; fehlt einer der Einträge, wird die
// bisherige Kaskade gezeigt. Gespeichert wird die tiefste gewählte
// Kategorie-ID. Beim Laden wird nichts gemeldet - ein unveränderter
// Altbestand gilt deshalb nie als geändert.
export default function ProduktAuswahl({
  kategorien,
  wert,
  onAendern,
  bearbeitbar,
}: {
  kategorien: Kategorie[];
  wert: string | null;
  onAendern: (kategorieId: string | null) => void;
  bearbeitbar: boolean;
}) {
  const { t } = useSprache();
  const hersteller = useMemo(() => startHerstellerFinden(kategorien, PRODUKTAUSWAHL_STARTPFAD), [kategorien]);
  const [schritt, setSchritt] = useState<Schritt>(wert ? "zusammenfassung" : "produkt");
  const [typProduktId, setTypProduktId] = useState<string | null>(null);

  if (!hersteller) {
    // Rückfall: vollständige Kaskade wie bisher (Startpfad nicht auflösbar).
    return (
      <KategorieKaskade
        kategorien={kategorien}
        startPfad={wert}
        onAendern={(pfad: KategoriePfad) => onAendern(pfad.produktId ? tiefsteKategorieId(pfad) : null)}
      />
    );
  }

  const kette = kategorieKette(kategorien, wert);
  const unterStartpfad = kette.some((k) => k.id === hersteller.id);
  const aktuellesProdukt = unterStartpfad ? (kette.find((k) => k.ebene === "produkt") ?? null) : null;
  const produkte = produkteUnter(kategorien, hersteller.id);

  function produktWaehlen(produkt: Kategorie) {
    onAendern(produkt.id);
    if (typGruppen(kategorien, produkt.id).length > 0) {
      setTypProduktId(produkt.id);
      setSchritt("typ");
    } else {
      setSchritt("zusammenfassung");
    }
  }

  function aendern() {
    if (aktuellesProdukt && typGruppen(kategorien, aktuellesProdukt.id).length > 0) {
      setTypProduktId(aktuellesProdukt.id);
      setSchritt("typ");
    } else {
      setSchritt("produkt");
    }
  }

  const tertiaer = "min-h-11 px-1 text-sm text-ink underline decoration-ink underline-offset-4";
  const schrittTitel = "font-mono text-[12px] uppercase tracking-[0.12em] text-ink-soft md:text-[11px]";

  if (schritt === "zusammenfassung" && wert) {
    // Ein Pfad außerhalb des Startpfads bleibt vollständig sichtbar.
    const text = unterStartpfad ? produktTypText(kategorien, wert) : kette.map((k) => k.name).join(" › ");
    return (
      <div className="min-w-0">
        <p className={schrittTitel}>{t("produktAuswahl.zusammenfassung")}</p>
        <p className="mt-1 break-words font-display text-[22px] font-bold leading-tight text-ink">{text ?? "—"}</p>
        {bearbeitbar && (
          <div className="mt-1 flex flex-wrap gap-x-4">
            <button type="button" onClick={aendern} className={tertiaer}>
              {t("produktAuswahl.aendern")}
            </button>
            <button
              type="button"
              onClick={() => {
                onAendern(null);
                setSchritt("produkt");
              }}
              className={`${tertiaer} text-ink-soft`}
            >
              {t("produktAuswahl.entfernen")}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!bearbeitbar) {
    return <p className="text-sm text-ink-soft">{t("produktAuswahl.keinProdukt")}</p>;
  }

  const typProdukt = typProduktId ? kategorien.find((k) => k.id === typProduktId) : null;
  if (schritt === "typ" && typProdukt) {
    const gruppen = typGruppen(kategorien, typProdukt.id);
    return (
      <div className="min-w-0 border-l-[3px] border-signal pl-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <p className={schrittTitel}>
            {t("foerderband.typ")} · <span className="text-ink">{typProdukt.name}</span>
          </p>
          <button type="button" onClick={() => setSchritt("produkt")} className={tertiaer}>
            {t("produktAuswahl.anderesProdukt")}
          </button>
        </div>
        <div className="mt-2 space-y-3">
          {gruppen.map((gruppe) => (
            <div key={gruppe.ueberschrift?.id ?? "ohne"}>
              {gruppe.ueberschrift && (
                <p className="mb-1.5 border-b border-rule pb-1 text-sm font-semibold text-ink">{gruppe.ueberschrift.name}</p>
              )}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {gruppe.typen.map((typ) => {
                  const gewaehlt = typ.id === wert;
                  return (
                    <button
                      key={typ.id}
                      type="button"
                      aria-pressed={gewaehlt}
                      onClick={() => {
                        onAendern(typ.id);
                        setSchritt("zusammenfassung");
                      }}
                      className={`flex min-h-12 min-w-0 items-center justify-center gap-1.5 rounded-[2px] border px-2 py-2 text-center text-sm leading-tight ${
                        gewaehlt ? "border-ink bg-ink font-semibold text-paper" : "border-rule bg-paper text-ink hover:border-ink"
                      }`}
                    >
                      {gewaehlt && <Icon name="haken" size={14} className="shrink-0" />}
                      <span className="min-w-0 break-words">{typ.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            onAendern(typProdukt.id);
            setSchritt("zusammenfassung");
          }}
          className={`mt-2 ${tertiaer}`}
        >
          {t("produktAuswahl.ohneTyp")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-w-0 border-l-[3px] border-signal pl-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <p className={schrittTitel}>{t("produktAuswahl.produkt")}</p>
        {wert && (
          <button type="button" onClick={() => setSchritt("zusammenfassung")} className={tertiaer}>
            {t("produktAuswahl.abbrechen")}
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-col gap-2">
        {produkte.map((produkt) => {
          const gewaehlt = produkt.id === aktuellesProdukt?.id;
          return (
            <button
              key={produkt.id}
              type="button"
              aria-pressed={gewaehlt}
              onClick={() => produktWaehlen(produkt)}
              className={`flex min-h-12 min-w-0 items-center justify-between gap-2 rounded-[2px] border px-3 py-2 text-left text-sm ${
                gewaehlt ? "border-ink bg-ink font-semibold text-paper" : "border-rule bg-paper text-ink hover:border-ink"
              }`}
            >
              <span className="min-w-0 break-words">{produkt.name}</span>
              <Icon name="chevron" size={16} className="shrink-0 -rotate-90" />
            </button>
          );
        })}
        {produkte.length === 0 && <p className="text-sm text-ink-soft">{t("produktAuswahl.keineProdukte")}</p>}
      </div>
    </div>
  );
}

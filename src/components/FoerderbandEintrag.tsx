"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { foerderbandEintragLoeschen, foerderbandPositionErstellen } from "@/lib/actions/werksbesichtigungen";
import FoerderbandFotos from "@/components/FoerderbandFotos";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import { DatenblattZeile, eingabeKlasse, textbereichKlasse } from "@/components/Datenblatt";
import EintragMarkierung from "@/components/EintragMarkierung";
import FoerderbandPositionZeile from "@/components/FoerderbandPositionZeile";
import Icon from "@/components/icons/Icon";
import GeschwindigkeitStepper from "@/components/GeschwindigkeitStepper";
import { BELT_CONNECTION_OPTIONEN, FOERDERBANDBREITE_OPTIONEN, MATERIAL_OPTIONEN } from "@/lib/referenzvideoOptionen";
import { GURTZUSTAND_OPTIONEN, GURTZUSTAND_SCHLUESSEL } from "@/lib/werksbesichtigungOptionen";
import type { BandFelder, PositionFelder } from "@/lib/werksbesichtigungAenderungen";
import AuswahlKacheln from "@/components/AuswahlKacheln";
import { useZusammenklappen } from "@/lib/useZusammenklappen";
import type { FoerderbandEintragMitDetails, Gurtzustand, Kategorie } from "@/lib/supabase/types";

const ALLE = "";

// Ein Förderband der Werksbesichtigung. Feldwerte und Änderungen kommen vom
// WerksbesichtigungEditor (zentrales Speichern). Sofort wirksam bleiben nur
// Löschen, Fotos und "+ Position" - Fotos brauchen eine echte Band-ID.
export default function FoerderbandEintrag({
  eintrag,
  nummer,
  werksbesichtigungId,
  kategorien,
  darfBearbeiten,
  werte,
  onAendern,
  ungespeichert,
  fehler,
  positionWerte,
  onPositionAendern,
  positionUngespeichert,
  positionFehler,
}: {
  eintrag: FoerderbandEintragMitDetails;
  /** Laufende Nummer (1, 2, …) in der Reihenfolge der Seite - dieselbe, die beim Abschließen gemeldet wird. */
  nummer: number;
  werksbesichtigungId: string;
  kategorien: Kategorie[];
  darfBearbeiten: boolean;
  werte: BandFelder;
  onAendern: <K extends keyof BandFelder>(feld: K, wert: BandFelder[K]) => void;
  ungespeichert: boolean;
  fehler?: string;
  positionWerte: Record<string, PositionFelder>;
  onPositionAendern: <K extends keyof PositionFelder>(id: string, feld: K, wert: PositionFelder[K]) => void;
  positionUngespeichert: (id: string) => boolean;
  positionFehler: (id: string) => string | undefined;
}) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();

  const [positionWirdErstellt, setPositionWirdErstellt] = useState(false);

  async function loeschen() {
    if (!confirm(t("foerderband.loeschenBestaetigung"))) return;
    const ergebnis = await foerderbandEintragLoeschen(eintrag.id, werksbesichtigungId);
    if (ergebnis.erfolg) {
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
    }
  }

  async function positionHinzufuegen() {
    setPositionWirdErstellt(true);
    const ergebnis = await foerderbandPositionErstellen(eintrag.id, werksbesichtigungId);
    setPositionWirdErstellt(false);
    if (ergebnis.erfolg) {
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
    }
  }

  // "Fertig" (Field Mode 3.4): Förderband-ID gesetzt, nichts ungespeichert,
  // kein Fehler. Positionen sind keine Pflicht.
  const fertig = werte.bezeichnung.trim() !== "" && !ungespeichert && !fehler;
  const [offen, setOffen] = useZusammenklappen(fertig);
  const anzahlPositionen = eintrag.foerderband_positionen.length;

  if (!offen) {
    // Kopfzeile (zugeklappt): die Förderband-ID vorn, groß und fett; dahinter
    // ruhiger Material · Bandbreite · Positionen. Fehlende Angaben entfallen
    // (keine doppelten Trennpunkte). Die laufende Nummer steht nur noch für
    // Screenreader im Kopf, sichtbar im aufgeklappten Band.
    const id = werte.bezeichnung.trim();
    const material = werte.material === "Sonstiges" ? werte.materialSonstiges.trim() || werte.material : werte.material;
    const zusatz = [
      material || null,
      werte.foerderbandbreite || null,
      anzahlPositionen === 1
        ? t("foerderband.positionenAnzahlEins")
        : t("foerderband.positionenAnzahl", { anzahl: String(anzahlPositionen) }),
    ]
      .filter((teil): teil is string => Boolean(teil))
      .join(" · ");
    return (
      <div className="mt-4 min-w-0 border border-rule border-t-2 border-t-ink bg-paper">
        <button
          type="button"
          onClick={() => setOffen(true)}
          aria-expanded={false}
          className="flex min-h-12 w-full min-w-0 items-center gap-3 px-4 py-3 text-left"
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span className="sr-only">{t("foerderband.nummer", { nummer: String(nummer) })}: </span>
            {id ? (
              <span className="min-w-0 max-w-full font-display text-lg font-bold leading-tight text-ink [overflow-wrap:anywhere]">
                {id}
              </span>
            ) : (
              <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-critical">
                {t("foerderband.idFehlt")}
              </span>
            )}
            {/* Bei Platzmangel in die nächste Zeile, höchstens zwei Zeilen, dann "…". */}
            {zusatz && <span className="line-clamp-2 min-w-0 max-w-full break-words text-sm text-ink-soft">{zusatz}</span>}
            {ungespeichert && (
              <span className="basis-full">
                <EintragMarkierung ungespeichert />
              </span>
            )}
          </span>
          {fertig && (
            <span className="flex shrink-0 items-center gap-1 text-ok">
              <Icon name="haken" size={18} />
              <span className="sr-only">{t("foerderband.fertig")}</span>
            </span>
          )}
          <Icon name="chevron" size={16} className="shrink-0 text-ink-soft" />
        </button>
        {fehler && (
          <div className="px-4 pb-3">
            <EintragMarkierung fehler={fehler} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 min-w-0 border border-rule border-t-2 border-t-ink bg-paper p-4">
      <div className="flex items-start gap-1">
        <label className="block min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
              {t("foerderband.nummer", { nummer: String(nummer) })} · {t("foerderband.bezeichnung")}
            </span>
            <EintragMarkierung ungespeichert={ungespeichert} />
          </span>
          <input
            value={werte.bezeichnung}
            onChange={(e) => onAendern("bezeichnung", e.target.value)}
            placeholder={t("foerderband.bezeichnungPlatzhalter")}
            disabled={!darfBearbeiten}
            aria-required
            className="mt-1 min-h-11 w-full min-w-0 border-b border-rule bg-transparent pb-1 font-display text-lg font-bold text-ink outline-none focus:border-ink disabled:opacity-70"
          />
        </label>
        <button
          type="button"
          onClick={() => setOffen(false)}
          aria-expanded
          title={t("foerderband.zuklappen")}
          aria-label={t("foerderband.zuklappen")}
          className="-mt-1 flex h-11 w-11 shrink-0 items-center justify-center text-ink-soft hover:text-ink"
        >
          <Icon name="chevron" size={16} className="rotate-180" />
        </button>
        {darfBearbeiten && (
          <button type="button" onClick={loeschen} className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center text-ink-faint hover:text-critical" title={t("foerderband.loeschenButton")} aria-label={t("foerderband.loeschenButton")}>
            <Icon name="schliessen" size={16} />
          </button>
        )}
      </div>
      <EintragMarkierung fehler={fehler} />

      <fieldset disabled={!darfBearbeiten} className="mt-2 border-t border-rule-strong disabled:opacity-70">
        <DatenblattZeile untereinander label={t("referenzvideos.material")}>
          <div>
            <select value={werte.material} onChange={(e) => onAendern("material", e.target.value)} className={eingabeKlasse}>
              <option value={ALLE}>{t("videothek.alle")}</option>
              {MATERIAL_OPTIONEN.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {werte.material === "Sonstiges" && (
              <input
                value={werte.materialSonstiges}
                onChange={(e) => onAendern("materialSonstiges", e.target.value)}
                className={`mt-2 ${eingabeKlasse}`}
              />
            )}
          </div>
        </DatenblattZeile>

        <DatenblattZeile untereinander label={t("referenzvideos.foerderbandbreite")}>
          <select
            value={werte.foerderbandbreite}
            onChange={(e) => onAendern("foerderbandbreite", e.target.value)}
            className={eingabeKlasse}
          >
            <option value={ALLE}>{t("videothek.alle")}</option>
            {FOERDERBANDBREITE_OPTIONEN.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </DatenblattZeile>

        <DatenblattZeile untereinander label={t("referenzvideos.beltConnection")}>
          {/* Drei Optionen -> Kacheln (Field Mode 3.1); zweites Antippen leert. */}
          <AuswahlKacheln
            label={t("referenzvideos.beltConnection")}
            optionen={BELT_CONNECTION_OPTIONEN.map((b) => ({ wert: b, label: b }))}
            wert={werte.beltConnection}
            onWaehlen={(wert) => onAendern("beltConnection", wert)}
            leerErlaubt
            spaltenMobil={1}
          />
        </DatenblattZeile>

        <DatenblattZeile untereinander label={t("foerderband.gurtzustand")}>
          <AuswahlKacheln
            label={t("foerderband.gurtzustand")}
            optionen={GURTZUSTAND_OPTIONEN.map((g) => ({ wert: g, label: t(GURTZUSTAND_SCHLUESSEL[g]) }))}
            wert={werte.gurtzustand as Gurtzustand | ""}
            onWaehlen={(wert) => onAendern("gurtzustand", wert)}
            leerErlaubt
          />
        </DatenblattZeile>

        <DatenblattZeile untereinander label={t("referenzvideos.geschwindigkeit")}>
          <GeschwindigkeitStepper
            wert={werte.geschwindigkeit}
            onAendern={(wert) => onAendern("geschwindigkeit", wert)}
            label={t("referenzvideos.geschwindigkeit")}
          />
        </DatenblattZeile>

        <DatenblattZeile untereinander label={t("foerderband.schurrenMasse")}>
          <input
            value={werte.schurrenMasse}
            onChange={(e) => onAendern("schurrenMasse", e.target.value)}
            placeholder={t("foerderband.schurrenMassePlatzhalter")}
            className={eingabeKlasse}
          />
        </DatenblattZeile>

        <DatenblattZeile untereinander label={t("foerderband.notizen")}>
          <textarea
            value={werte.notizen}
            onChange={(e) => onAendern("notizen", e.target.value)}
            rows={3}
            className={textbereichKlasse}
          />
        </DatenblattZeile>
      </fieldset>

      <div className="mt-3 border-t border-rule-strong pt-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("foerderband.positionen")}</span>
        {eintrag.foerderband_positionen.length === 0 && (
          <p className="mt-2 text-sm text-ink-soft">{t("foerderband.keinePositionen")}</p>
        )}
        {eintrag.foerderband_positionen.map((pos) => (
          <FoerderbandPositionZeile
            key={pos.id}
            eintrag={pos}
            werksbesichtigungId={werksbesichtigungId}
            kategorien={kategorien}
            darfBearbeiten={darfBearbeiten}
            werte={positionWerte[pos.id]}
            bandWerte={werte}
            onAendern={(feld, wert) => onPositionAendern(pos.id, feld, wert)}
            ungespeichert={positionUngespeichert(pos.id)}
            fehler={positionFehler(pos.id)}
          />
        ))}
        {darfBearbeiten && (
          <button
            type="button"
            onClick={positionHinzufuegen}
            disabled={positionWirdErstellt}
            className="mt-3 min-h-11 w-full rounded-[2px] border border-rule px-4 text-sm font-medium text-ink hover:bg-paper-2 disabled:opacity-50 md:w-auto"
          >
            {t("foerderband.positionHinzufuegen")}
          </button>
        )}
      </div>

      <div className="mt-3 border-t border-rule-strong pt-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("foerderband.fotos")}</span>
        <FoerderbandFotos
          fotos={eintrag.foerderband_fotos}
          foerderbandEintragId={eintrag.id}
          werksbesichtigungId={werksbesichtigungId}
          darfBearbeiten={darfBearbeiten}
        />
      </div>
    </div>
  );
}

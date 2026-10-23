"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  foerderbandEintragLoeschen,
  foerderbandFotoEntfernen,
  foerderbandFotoHinzufuegen,
  foerderbandPositionErstellen,
} from "@/lib/actions/werksbesichtigungen";
import { bildKomprimieren } from "@/lib/bildKomprimieren";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import { DatenblattZeile, eingabeKlasse, textbereichKlasse } from "@/components/Datenblatt";
import EintragMarkierung from "@/components/EintragMarkierung";
import FoerderbandPositionZeile from "@/components/FoerderbandPositionZeile";
import Icon from "@/components/icons/Icon";
import GeschwindigkeitRegler from "@/components/GeschwindigkeitRegler";
import { BELT_CONNECTION_OPTIONEN, FOERDERBANDBREITE_OPTIONEN, MATERIAL_OPTIONEN } from "@/lib/referenzvideoOptionen";
import { GURTZUSTAND_OPTIONEN, GURTZUSTAND_SCHLUESSEL } from "@/lib/werksbesichtigungOptionen";
import type { BandFelder, PositionFelder } from "@/lib/werksbesichtigungAenderungen";
import type { FoerderbandEintragMitDetails, Kategorie } from "@/lib/supabase/types";

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

  const [fotoLaedt, setFotoLaedt] = useState(false);
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

  async function fotoAusgewaehlt(datei: File | null) {
    if (!datei) return;
    setFotoLaedt(true);
    try {
      const verkleinert = await bildKomprimieren(datei);
      const supabase = createClient();
      const dateiname = `${werksbesichtigungId}/${eintrag.id}/${crypto.randomUUID()}.jpg`;
      const { error: uploadFehler } = await supabase.storage
        .from("werksbesichtigung-fotos")
        .upload(dateiname, verkleinert, { contentType: "image/jpeg" });
      if (uploadFehler) {
        toast(uploadFehler.message, "fehler");
        return;
      }
      const { data: urlData } = supabase.storage.from("werksbesichtigung-fotos").getPublicUrl(dateiname);
      const ergebnis = await foerderbandFotoHinzufuegen(eintrag.id, werksbesichtigungId, urlData.publicUrl);
      if (ergebnis.erfolg) {
        router.refresh();
      } else {
        toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
      }
    } catch (fehler) {
      toast(fehler instanceof Error ? fehler.message : t("profil.fehlerStandard"), "fehler");
    } finally {
      setFotoLaedt(false);
    }
  }

  async function fotoEntfernen(fotoId: string) {
    const ergebnis = await foerderbandFotoEntfernen(fotoId, werksbesichtigungId);
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

  return (
    <div className="mt-4 border border-rule bg-paper p-4">
      <div className="flex items-start gap-3">
        <label className="block flex-1">
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
            className="mt-1 w-full border-b border-rule bg-transparent pb-1 font-display text-lg font-bold text-ink outline-none focus:border-ink disabled:opacity-70"
          />
        </label>
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
          <select
            value={werte.beltConnection}
            onChange={(e) => onAendern("beltConnection", e.target.value)}
            className={eingabeKlasse}
          >
            <option value={ALLE}>{t("videothek.alle")}</option>
            {BELT_CONNECTION_OPTIONEN.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </DatenblattZeile>

        <DatenblattZeile untereinander label={t("foerderband.gurtzustand")}>
          <select value={werte.gurtzustand} onChange={(e) => onAendern("gurtzustand", e.target.value)} className={eingabeKlasse}>
            <option value={ALLE}>{t("videothek.alle")}</option>
            {GURTZUSTAND_OPTIONEN.map((g) => (
              <option key={g} value={g}>
                {t(GURTZUSTAND_SCHLUESSEL[g])}
              </option>
            ))}
          </select>
        </DatenblattZeile>

        <DatenblattZeile untereinander label={t("referenzvideos.geschwindigkeit")}>
          <GeschwindigkeitRegler
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
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {eintrag.foerderband_fotos.map((foto) => (
            <div key={foto.id} className="group relative aspect-square overflow-hidden border border-rule bg-plate">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto.foto_url} alt="" className="h-full w-full object-cover" />
              {darfBearbeiten && (
                <button
                  type="button"
                  onClick={() => fotoEntfernen(foto.id)}
                  title={t("foerderband.fotoEntfernen")}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <Icon name="schliessen" size={12} />
                </button>
              )}
            </div>
          ))}
          {darfBearbeiten && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-rule text-ink-faint hover:border-signal hover:text-signal">
              <Icon name="upload" size={18} />
              <span className="px-1 text-center text-[10px]">
                {fotoLaedt ? t("foerderband.fotoWirdVerkleinert") : t("foerderband.fotoHochladen")}
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                disabled={fotoLaedt}
                onChange={(e) => fotoAusgewaehlt(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

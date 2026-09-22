"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  foerderbandEintragAktualisieren,
  foerderbandEintragLoeschen,
  foerderbandFotoEntfernen,
  foerderbandFotoHinzufuegen,
} from "@/lib/actions/werksbesichtigungen";
import { bildKomprimieren } from "@/lib/bildKomprimieren";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import { DatenblattZeile, eingabeKlasse } from "@/components/Datenblatt";
import KategorieKaskade, { type KategoriePfad } from "@/components/KategorieKaskade";
import Icon from "@/components/icons/Icon";
import {
  BELT_CONNECTION_OPTIONEN,
  FOERDERBANDBREITE_OPTIONEN,
  GESCHWINDIGKEIT_MAX,
  GESCHWINDIGKEIT_MIN,
  GESCHWINDIGKEIT_SCHRITT,
  MATERIAL_OPTIONEN,
} from "@/lib/referenzvideoOptionen";
import { FOERDERBAND_POSITIONEN } from "@/lib/werksbesichtigungOptionen";
import type { FoerderbandEintragMitDetails, FoerderbandPosition, Kategorie } from "@/lib/supabase/types";

const ALLE = "";
const POSITION_SCHLUESSEL: Record<FoerderbandPosition, string> = {
  kopftrommel: "foerderband.positionKopftrommel",
  ablaufpunkt: "foerderband.positionAblaufpunkt",
  waschbox: "foerderband.positionWaschbox",
  freifeld: "foerderband.positionFreifeld",
};

export default function FoerderbandEintrag({
  eintrag,
  werksbesichtigungId,
  kategorien,
  darfBearbeiten,
}: {
  eintrag: FoerderbandEintragMitDetails;
  werksbesichtigungId: string;
  kategorien: Kategorie[];
  darfBearbeiten: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();

  const [bezeichnung, setBezeichnung] = useState(eintrag.bezeichnung);
  const [foerderbandbreite, setFoerderbandbreite] = useState(eintrag.foerderbandbreite ?? ALLE);
  const [geschwindigkeit, setGeschwindigkeit] = useState(eintrag.geschwindigkeit_ms ?? GESCHWINDIGKEIT_MIN);
  const [material, setMaterial] = useState(eintrag.material ?? ALLE);
  const [materialSonstiges, setMaterialSonstiges] = useState(eintrag.material_sonstiges ?? "");
  const [beltConnection, setBeltConnection] = useState(eintrag.belt_connection ?? ALLE);
  const [schurrenMasse, setSchurrenMasse] = useState(eintrag.schurren_masse ?? "");
  const [position, setPosition] = useState<FoerderbandPosition>(eintrag.position);
  const [produktPfad, setProduktPfad] = useState<KategoriePfad | null>(null);
  const [notizen, setNotizen] = useState(eintrag.notizen);
  const [speichert, setSpeichert] = useState(false);
  const [fotoLaedt, setFotoLaedt] = useState(false);

  const produktKategorieId = produktPfad ? produktPfad.produktId : eintrag.produkt_kategorie_id;

  async function speichern() {
    setSpeichert(true);
    const ergebnis = await foerderbandEintragAktualisieren(eintrag.id, werksbesichtigungId, {
      bezeichnung,
      foerderbandbreite: foerderbandbreite || null,
      geschwindigkeitMs: geschwindigkeit,
      material: material || null,
      materialSonstiges: material === "Sonstiges" ? materialSonstiges : null,
      beltConnection: beltConnection || null,
      schurrenMasse: schurrenMasse.trim() || null,
      position,
      produktKategorieId,
      notizen,
    });
    setSpeichert(false);
    if (ergebnis.erfolg) {
      toast(t("werksbesichtigungen.gespeichert"), "erfolg");
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
    }
  }

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

  return (
    <div className="mt-4 border border-rule bg-paper p-4">
      <div className="flex items-start gap-3">
        <input
          value={bezeichnung}
          onChange={(e) => setBezeichnung(e.target.value)}
          placeholder={t("foerderband.bezeichnungPlatzhalter")}
          disabled={!darfBearbeiten}
          className="flex-1 border-b border-rule bg-transparent pb-1 font-display text-lg font-bold text-ink outline-none focus:border-ink disabled:opacity-70"
        />
        {darfBearbeiten && (
          <button type="button" onClick={loeschen} className="shrink-0 text-ink-faint hover:text-critical" title={t("foerderband.loeschenButton")}>
            <Icon name="schliessen" size={16} />
          </button>
        )}
      </div>

      <fieldset disabled={!darfBearbeiten} className="mt-2 border-t border-rule-strong disabled:opacity-70">
        <DatenblattZeile label={t("foerderband.position")}>
          <select value={position} onChange={(e) => setPosition(e.target.value as FoerderbandPosition)} className={eingabeKlasse}>
            {FOERDERBAND_POSITIONEN.map((p) => (
              <option key={p} value={p}>
                {t(POSITION_SCHLUESSEL[p])}
              </option>
            ))}
          </select>
        </DatenblattZeile>

        <DatenblattZeile label={t("referenzvideos.material")}>
          <div>
            <select value={material} onChange={(e) => setMaterial(e.target.value)} className={eingabeKlasse}>
              <option value={ALLE}>{t("videothek.alle")}</option>
              {MATERIAL_OPTIONEN.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {material === "Sonstiges" && (
              <input
                value={materialSonstiges}
                onChange={(e) => setMaterialSonstiges(e.target.value)}
                className={`mt-2 ${eingabeKlasse}`}
              />
            )}
          </div>
        </DatenblattZeile>

        <DatenblattZeile label={t("referenzvideos.foerderbandbreite")}>
          <select value={foerderbandbreite} onChange={(e) => setFoerderbandbreite(e.target.value)} className={eingabeKlasse}>
            <option value={ALLE}>{t("videothek.alle")}</option>
            {FOERDERBANDBREITE_OPTIONEN.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </DatenblattZeile>

        <DatenblattZeile label={t("referenzvideos.beltConnection")}>
          <select value={beltConnection} onChange={(e) => setBeltConnection(e.target.value)} className={eingabeKlasse}>
            <option value={ALLE}>{t("videothek.alle")}</option>
            {BELT_CONNECTION_OPTIONEN.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </DatenblattZeile>

        <DatenblattZeile label={`${t("referenzvideos.geschwindigkeit")}: ${geschwindigkeit.toFixed(1)} m/s`}>
          <input
            type="range"
            min={GESCHWINDIGKEIT_MIN}
            max={GESCHWINDIGKEIT_MAX}
            step={GESCHWINDIGKEIT_SCHRITT}
            value={geschwindigkeit}
            onChange={(e) => setGeschwindigkeit(Number(e.target.value))}
            className="w-full accent-signal"
          />
        </DatenblattZeile>

        <DatenblattZeile label={t("foerderband.schurrenMasse")}>
          <input
            value={schurrenMasse}
            onChange={(e) => setSchurrenMasse(e.target.value)}
            placeholder={t("foerderband.schurrenMassePlatzhalter")}
            className={eingabeKlasse}
          />
        </DatenblattZeile>

        <DatenblattZeile label={t("foerderband.produkt")}>
          <KategorieKaskade
            kategorien={kategorien}
            startPfad={eintrag.produkt_kategorie_id}
            onAendern={setProduktPfad}
          />
        </DatenblattZeile>

        <DatenblattZeile label={t("foerderband.notizen")}>
          <textarea
            value={notizen}
            onChange={(e) => setNotizen(e.target.value)}
            rows={3}
            className="w-full rounded-[2px] border border-rule bg-paper-2 px-2.5 py-2 text-sm text-ink outline-none focus:border-ink"
          />
        </DatenblattZeile>
      </fieldset>

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

      {darfBearbeiten && (
        <button
          type="button"
          onClick={speichern}
          disabled={speichert}
          className="mt-4 rounded-[2px] bg-signal px-4 py-2 text-sm font-bold uppercase tracking-wide text-signal-ink disabled:opacity-50"
        >
          {speichert ? t("werksbesichtigungen.speichertLaeuft") : t("werksbesichtigungen.speichern")}
        </button>
      )}
    </div>
  );
}

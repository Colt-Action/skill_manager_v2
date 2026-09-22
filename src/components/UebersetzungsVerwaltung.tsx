"use client";

import { useMemo, useState } from "react";
import { uebersetzungSpeichern } from "@/lib/actions/uebersetzungen";
import { useSprache } from "@/components/SprachProvider";
import { SPRACHEN, type Sprache } from "@/lib/i18n/sprachen";

type Typ = "video" | "referenz";

interface ElementZeile {
  id: string;
  titel: string;
  beschreibung: string;
}

interface UebersetzungZeile {
  tabelle: string;
  datensatz_id: string;
  feld: string;
  sprache: string;
  text: string;
}

const ALLE = "";
const TABELLE_JE_TYP: Record<Typ, string> = { video: "videos", referenz: "referenzen" };

export default function UebersetzungsVerwaltung({
  videos,
  referenzen,
  uebersetzungen,
}: {
  videos: ElementZeile[];
  referenzen: ElementZeile[];
  uebersetzungen: UebersetzungZeile[];
}) {
  const { t } = useSprache();
  const [typ, setTyp] = useState<Typ>("video");
  const [elementId, setElementId] = useState(ALLE);
  const [zielsprache, setZielsprache] = useState<Sprache>("en");
  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [speichert, setSpeichert] = useState(false);
  const [nachricht, setNachricht] = useState<string | null>(null);

  const elemente = typ === "video" ? videos : referenzen;
  const tabelle = TABELLE_JE_TYP[typ];
  const ausgewaehltesElement = elemente.find((e) => e.id === elementId) ?? null;

  const uebersetzungenDesElements = useMemo(
    () => uebersetzungen.filter((u) => u.tabelle === tabelle && u.datensatz_id === elementId),
    [uebersetzungen, tabelle, elementId],
  );

  const uebersetzteSprachen = useMemo(
    () => Array.from(new Set(uebersetzungenDesElements.map((u) => u.sprache))),
    [uebersetzungenDesElements],
  );

  function typGewaehlt(neuerTyp: Typ) {
    setTyp(neuerTyp);
    setElementId(ALLE);
    setTitel("");
    setBeschreibung("");
    setNachricht(null);
  }

  function feldWerteLaden(neueTabelle: string, neueElementId: string, neueSprache: Sprache) {
    const vorhandenerTitel = uebersetzungen.find(
      (u) => u.tabelle === neueTabelle && u.datensatz_id === neueElementId && u.feld === "titel" && u.sprache === neueSprache,
    );
    const vorhandeneBeschreibung = uebersetzungen.find(
      (u) =>
        u.tabelle === neueTabelle &&
        u.datensatz_id === neueElementId &&
        (u.feld === "beschreibung_schritte" || u.feld === "beschreibung") &&
        u.sprache === neueSprache,
    );
    setTitel(vorhandenerTitel?.text ?? "");
    setBeschreibung(vorhandeneBeschreibung?.text ?? "");
  }

  function elementGewaehlt(neueElementId: string) {
    setElementId(neueElementId);
    setNachricht(null);
    feldWerteLaden(tabelle, neueElementId, zielsprache);
  }

  function sprachGewaehlt(neueSprache: Sprache) {
    setZielsprache(neueSprache);
    setNachricht(null);
    feldWerteLaden(tabelle, elementId, neueSprache);
  }

  async function speichern(e: React.FormEvent) {
    e.preventDefault();
    if (!elementId) return;
    setSpeichert(true);
    setNachricht(null);
    const ergebnis = await uebersetzungSpeichern({
      typ,
      datensatzId: elementId,
      sprache: zielsprache,
      titel,
      beschreibung,
    });
    setSpeichert(false);
    setNachricht(ergebnis.erfolg ? t("uebersetzungen.gespeichert") : ergebnis.fehler ?? t("uebersetzungen.fehlerSpeichern"));
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => typGewaehlt("video")}
          className={`rounded-[2px] px-3 py-1.5 text-sm font-semibold ${
            typ === "video" ? "bg-signal text-signal-ink" : "bg-paper text-ink-soft"
          }`}
        >
          {t("uebersetzungen.typVideo")}
        </button>
        <button
          type="button"
          onClick={() => typGewaehlt("referenz")}
          className={`rounded-[2px] px-3 py-1.5 text-sm font-semibold ${
            typ === "referenz" ? "bg-signal text-signal-ink" : "bg-paper text-ink-soft"
          }`}
        >
          {t("uebersetzungen.typReferenz")}
        </button>
      </div>

      {elemente.length === 0 ? (
        <p className="text-sm text-ink-soft">
          {typ === "video" ? t("uebersetzungen.keineVideos") : t("uebersetzungen.keineReferenzen")}
        </p>
      ) : (
        <>
          <label className="block">
            <span className="text-sm font-medium text-ink">
              {typ === "video" ? t("uebersetzungen.videoWaehlen") : t("uebersetzungen.referenzWaehlen")}
            </span>
            <select
              value={elementId}
              onChange={(e) => elementGewaehlt(e.target.value)}
              className="mt-1 w-full rounded-[2px] border border-rule bg-paper px-3 py-2 text-sm text-ink"
            >
              <option value={ALLE}>{t("upload.bitteWaehlen")}</option>
              {elemente.map((el) => (
                <option key={el.id} value={el.id}>
                  {el.titel}
                </option>
              ))}
            </select>
          </label>

          {ausgewaehltesElement && (
            <>
              <p className="text-xs text-ink-soft">
                {uebersetzteSprachen.length > 0
                  ? t("uebersetzungen.bereitsUebersetzt", {
                      sprachen: uebersetzteSprachen
                        .map((code) => SPRACHEN.find((s) => s.code === code)?.label ?? code)
                        .join(", "),
                    })
                  : t("uebersetzungen.nochKeineUebersetzung")}
              </p>

              <div className="border border-rule bg-paper p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{t("uebersetzungen.originalTitel")}</p>
                <p className="mt-1 text-sm text-ink">{ausgewaehltesElement.titel}</p>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-ink-soft">{t("uebersetzungen.originalBeschreibung")}</p>
                <p className="mt-1 whitespace-pre-line text-sm text-ink-soft">
                  {ausgewaehltesElement.beschreibung || "–"}
                </p>
              </div>

              <form onSubmit={speichern} className="border border-rule bg-paper p-4 space-y-3">
                <label className="block">
                  <span className="text-sm font-medium text-ink">{t("uebersetzungen.spracheWaehlen")}</span>
                  <select
                    value={zielsprache}
                    onChange={(e) => sprachGewaehlt(e.target.value as Sprache)}
                    className="mt-1 w-full rounded-[2px] border border-rule bg-paper px-3 py-2 text-sm text-ink"
                  >
                    {SPRACHEN.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-ink">{t("uebersetzungen.uebersetzterTitel")}</span>
                  <input
                    value={titel}
                    onChange={(e) => setTitel(e.target.value)}
                    className="mt-1 w-full rounded-[2px] border border-rule bg-paper px-3 py-2 text-sm text-ink"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-ink">{t("uebersetzungen.uebersetzteBeschreibung")}</span>
                  <textarea
                    value={beschreibung}
                    onChange={(e) => setBeschreibung(e.target.value)}
                    rows={5}
                    className="mt-1 w-full rounded-[2px] border border-rule bg-paper px-3 py-2 text-sm text-ink"
                  />
                </label>

                {nachricht && <p className="text-xs text-ink-soft">{nachricht}</p>}

                <button
                  type="submit"
                  disabled={speichert}
                  className="rounded-[2px] bg-signal px-4 py-2 text-sm font-bold uppercase tracking-wide text-signal-ink transition hover:bg-signal disabled:opacity-50"
                >
                  {speichert ? t("profil.speichertLaeuft") : t("uebersetzungen.speichernButton")}
                </button>
              </form>
            </>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { uebersetzungSpeichern } from "@/lib/actions/uebersetzungen";
import { useSprache } from "@/components/SprachProvider";
import { SPRACHEN, type Sprache } from "@/lib/i18n/sprachen";

interface VideoZeile {
  id: string;
  titel: string;
  beschreibung_schritte: string;
}

interface UebersetzungZeile {
  datensatz_id: string;
  feld: string;
  sprache: string;
  text: string;
}

const ALLE = "";

export default function UebersetzungsVerwaltung({
  videos,
  uebersetzungen,
}: {
  videos: VideoZeile[];
  uebersetzungen: UebersetzungZeile[];
}) {
  const { t } = useSprache();
  const [videoId, setVideoId] = useState(ALLE);
  const [zielsprache, setZielsprache] = useState<Sprache>("en");
  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [speichert, setSpeichert] = useState(false);
  const [nachricht, setNachricht] = useState<string | null>(null);

  const ausgewaehltesVideo = videos.find((v) => v.id === videoId) ?? null;

  const uebersetzungenDesVideos = useMemo(
    () => uebersetzungen.filter((u) => u.datensatz_id === videoId),
    [uebersetzungen, videoId],
  );

  const uebersetzteSprachen = useMemo(
    () => Array.from(new Set(uebersetzungenDesVideos.map((u) => u.sprache))),
    [uebersetzungenDesVideos],
  );

  function videoGewaehlt(neueVideoId: string) {
    setVideoId(neueVideoId);
    setNachricht(null);
    const vorhandenerTitel = uebersetzungen.find(
      (u) => u.datensatz_id === neueVideoId && u.feld === "titel" && u.sprache === zielsprache,
    );
    const vorhandeneBeschreibung = uebersetzungen.find(
      (u) => u.datensatz_id === neueVideoId && u.feld === "beschreibung_schritte" && u.sprache === zielsprache,
    );
    setTitel(vorhandenerTitel?.text ?? "");
    setBeschreibung(vorhandeneBeschreibung?.text ?? "");
  }

  function sprachGewaehlt(neueSprache: Sprache) {
    setZielsprache(neueSprache);
    setNachricht(null);
    const vorhandenerTitel = uebersetzungen.find(
      (u) => u.datensatz_id === videoId && u.feld === "titel" && u.sprache === neueSprache,
    );
    const vorhandeneBeschreibung = uebersetzungen.find(
      (u) => u.datensatz_id === videoId && u.feld === "beschreibung_schritte" && u.sprache === neueSprache,
    );
    setTitel(vorhandenerTitel?.text ?? "");
    setBeschreibung(vorhandeneBeschreibung?.text ?? "");
  }

  async function speichern(e: React.FormEvent) {
    e.preventDefault();
    if (!videoId) return;
    setSpeichert(true);
    setNachricht(null);
    const ergebnis = await uebersetzungSpeichern({
      videoId,
      sprache: zielsprache,
      titel,
      beschreibung,
    });
    setSpeichert(false);
    setNachricht(ergebnis.erfolg ? t("uebersetzungen.gespeichert") : ergebnis.fehler ?? t("uebersetzungen.fehlerSpeichern"));
  }

  if (videos.length === 0) {
    return <p className="mt-6 text-sm text-foreground-soft">{t("uebersetzungen.keineVideos")}</p>;
  }

  return (
    <div className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-foreground">{t("uebersetzungen.videoWaehlen")}</span>
        <select
          value={videoId}
          onChange={(e) => videoGewaehlt(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground"
        >
          <option value={ALLE}>{t("upload.bitteWaehlen")}</option>
          {videos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.titel}
            </option>
          ))}
        </select>
      </label>

      {ausgewaehltesVideo && (
        <>
          <p className="text-xs text-foreground-soft">
            {uebersetzteSprachen.length > 0
              ? t("uebersetzungen.bereitsUebersetzt", {
                  sprachen: uebersetzteSprachen
                    .map((code) => SPRACHEN.find((s) => s.code === code)?.label ?? code)
                    .join(", "),
                })
              : t("uebersetzungen.nochKeineUebersetzung")}
          </p>

          <div className="rounded-xl bg-surface p-4 ring-1 ring-line">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground-soft">{t("uebersetzungen.originalTitel")}</p>
            <p className="mt-1 text-sm text-foreground">{ausgewaehltesVideo.titel}</p>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-foreground-soft">{t("uebersetzungen.originalBeschreibung")}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-foreground-soft">
              {ausgewaehltesVideo.beschreibung_schritte || "–"}
            </p>
          </div>

          <form onSubmit={speichern} className="rounded-xl bg-surface p-4 ring-1 ring-line space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-foreground">{t("uebersetzungen.spracheWaehlen")}</span>
              <select
                value={zielsprache}
                onChange={(e) => sprachGewaehlt(e.target.value as Sprache)}
                className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
              >
                {SPRACHEN.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-foreground">{t("uebersetzungen.uebersetzterTitel")}</span>
              <input
                value={titel}
                onChange={(e) => setTitel(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-foreground">{t("uebersetzungen.uebersetzteBeschreibung")}</span>
              <textarea
                value={beschreibung}
                onChange={(e) => setBeschreibung(e.target.value)}
                rows={5}
                className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>

            {nachricht && <p className="text-xs text-foreground-soft">{nachricht}</p>}

            <button
              type="submit"
              disabled={speichert}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-accent-ink transition hover:bg-accent-deep disabled:opacity-50"
            >
              {speichert ? t("profil.speichertLaeuft") : t("uebersetzungen.speichernButton")}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

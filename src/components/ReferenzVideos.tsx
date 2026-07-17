"use client";

import { useMemo, useState } from "react";
import VideoCard from "@/components/VideoCard";
import EmptyState from "@/components/EmptyState";
import KategorieKaskade, { type KategoriePfad } from "@/components/KategorieKaskade";
import {
  BELT_CONNECTION_OPTIONEN,
  FOERDERBANDBREITE_OPTIONEN,
  GESCHWINDIGKEIT_MAX,
  GESCHWINDIGKEIT_MIN,
  GESCHWINDIGKEIT_SCHRITT,
  MATERIAL_OPTIONEN,
} from "@/lib/referenzvideoOptionen";
import type { Kategorie, ReferenzVideoDetails, Teil, VideoMitDetails } from "@/lib/supabase/types";

const ALLE = "";
const GESCHWINDIGKEIT_TOLERANZ = 1.5;

function details(video: VideoMitDetails): ReferenzVideoDetails | null {
  const d = video.referenz_video_details;
  if (!d) return null;
  return Array.isArray(d) ? (d[0] ?? null) : d;
}

export default function ReferenzVideos({
  videos,
  kategorien,
  teile,
}: {
  videos: VideoMitDetails[];
  kategorien: Kategorie[];
  teile: Teil[];
}) {
  const [pfad, setPfad] = useState<KategoriePfad>({
    industrieId: null,
    herstellerId: null,
    produktId: null,
    kategorieId: null,
  });
  const [teilId, setTeilId] = useState(ALLE);
  const [material, setMaterial] = useState(ALLE);
  const [foerderbandbreite, setFoerderbandbreite] = useState(ALLE);
  const [beltConnection, setBeltConnection] = useState(ALLE);
  const [runbackReversible, setRunbackReversible] = useState(ALLE);
  const [geschwindigkeit, setGeschwindigkeit] = useState<number | null>(null);
  const [land, setLand] = useState("");
  const [besonderheiten, setBesonderheiten] = useState("");

  // Welche Hersteller die Zusatzfilter zeigen, ist kein Codewissen (nicht auf
  // "HOSCH" verdrahtet), sondern ein Flag, das Admins je Hersteller in der
  // Kategorien-Verwaltung selbst setzen können.
  const ausgewaehlterHersteller = useMemo(
    () => kategorien.find((k) => k.id === pfad.herstellerId) ?? null,
    [kategorien, pfad.herstellerId],
  );
  const zeigeZusatzfilter = ausgewaehlterHersteller?.zeigt_referenz_zusatzfelder ?? false;

  const sichtbareTeile = useMemo(
    () => (pfad.kategorieId ? teile.filter((t) => t.kategorie_id === pfad.kategorieId) : teile),
    [teile, pfad.kategorieId],
  );

  function pfadGeaendert(neuerPfad: KategoriePfad) {
    setPfad(neuerPfad);
    setTeilId(ALLE);
  }

  const gefiltert = useMemo(() => {
    return videos.filter((video) => {
      if (teilId !== ALLE && video.teil_id !== teilId) return false;

      if (teilId === ALLE && (pfad.industrieId || pfad.herstellerId || pfad.produktId || pfad.kategorieId)) {
        const teilKategorieId = video.teile?.kategorie_id ?? null;
        if (!teilKategorieId) return false;
        // Grobe Prüfung: Kategorie-Kette hoch verfolgen und mit Auswahl abgleichen.
        const byId = new Map(kategorien.map((k) => [k.id, k]));
        const kette: string[] = [];
        let aktuelle = byId.get(teilKategorieId);
        while (aktuelle) {
          kette.unshift(aktuelle.id);
          aktuelle = aktuelle.parent_kategorie_id ? byId.get(aktuelle.parent_kategorie_id) : undefined;
        }
        const gewuenscht = [pfad.industrieId, pfad.herstellerId, pfad.produktId, pfad.kategorieId];
        for (let i = 0; i < gewuenscht.length; i++) {
          if (gewuenscht[i] && kette[i] !== gewuenscht[i]) return false;
        }
      }

      if (!zeigeZusatzfilter) return true;
      const d = details(video);

      if (material && d?.material !== material) return false;
      if (foerderbandbreite && d?.foerderbandbreite !== foerderbandbreite) return false;
      if (beltConnection && d?.belt_connection !== beltConnection) return false;
      if (runbackReversible === "ja" && d?.runback_reversible !== true) return false;
      if (runbackReversible === "nein" && d?.runback_reversible !== false) return false;
      if (
        geschwindigkeit !== null &&
        (d?.geschwindigkeit_ms == null ||
          Math.abs(d.geschwindigkeit_ms - geschwindigkeit) > GESCHWINDIGKEIT_TOLERANZ)
      )
        return false;
      if (land.trim() && !d?.land?.toLowerCase().includes(land.trim().toLowerCase())) return false;
      if (
        besonderheiten.trim() &&
        !d?.besonderheiten?.toLowerCase().includes(besonderheiten.trim().toLowerCase())
      )
        return false;

      return true;
    });
  }, [
    videos,
    pfad,
    teilId,
    kategorien,
    zeigeZusatzfilter,
    material,
    foerderbandbreite,
    beltConnection,
    runbackReversible,
    geschwindigkeit,
    land,
    besonderheiten,
  ]);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[280px] flex-1">
          <KategorieKaskade kategorien={kategorien} mitAlleOption onAendern={pfadGeaendert} />
        </div>

        <label className="block w-44">
          <span className="font-mono text-xs uppercase tracking-wide text-foreground-soft">Teil</span>
          <select
            value={teilId}
            onChange={(e) => setTeilId(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          >
            <option value={ALLE}>Alle</option>
            {sichtbareTeile.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {zeigeZusatzfilter && (
        <div className="mt-4 rounded-xl bg-surface p-4 ring-1 ring-line">
          <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">
            {ausgewaehlterHersteller?.name}-Zusatzfilter
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="text-xs font-medium text-foreground-soft">Material</span>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-background px-2 py-1.5 text-sm text-foreground"
              >
                <option value={ALLE}>Alle</option>
                {MATERIAL_OPTIONEN.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-foreground-soft">Förderbandbreite</span>
              <select
                value={foerderbandbreite}
                onChange={(e) => setFoerderbandbreite(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-background px-2 py-1.5 text-sm text-foreground"
              >
                <option value={ALLE}>Alle</option>
                {FOERDERBANDBREITE_OPTIONEN.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-foreground-soft">Belt Connection</span>
              <select
                value={beltConnection}
                onChange={(e) => setBeltConnection(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-background px-2 py-1.5 text-sm text-foreground"
              >
                <option value={ALLE}>Alle</option>
                {BELT_CONNECTION_OPTIONEN.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-foreground-soft">Runback/Reversible</span>
              <select
                value={runbackReversible}
                onChange={(e) => setRunbackReversible(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-background px-2 py-1.5 text-sm text-foreground"
              >
                <option value={ALLE}>Alle</option>
                <option value="ja">Ja</option>
                <option value="nein">Nein</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-foreground-soft">Land</span>
              <input
                value={land}
                onChange={(e) => setLand(e.target.value)}
                placeholder="z. B. Deutschland"
                className="mt-1 w-full rounded-lg border border-line bg-background px-2 py-1.5 text-sm text-foreground"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-foreground-soft">Besonderheiten</span>
              <input
                value={besonderheiten}
                onChange={(e) => setBesonderheiten(e.target.value)}
                placeholder="Freitext-Suche"
                className="mt-1 w-full rounded-lg border border-line bg-background px-2 py-1.5 text-sm text-foreground"
              />
            </label>

            <label className="block sm:col-span-2 lg:col-span-3">
              <span className="text-xs font-medium text-foreground-soft">
                Geschwindigkeit:{" "}
                {geschwindigkeit === null ? (
                  "egal"
                ) : (
                  <span className="font-mono text-blueprint">
                    ca. {geschwindigkeit.toFixed(1)} m/s (±{GESCHWINDIGKEIT_TOLERANZ} m/s)
                  </span>
                )}
              </span>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="range"
                  min={GESCHWINDIGKEIT_MIN}
                  max={GESCHWINDIGKEIT_MAX}
                  step={GESCHWINDIGKEIT_SCHRITT}
                  value={geschwindigkeit ?? GESCHWINDIGKEIT_MIN}
                  onChange={(e) => setGeschwindigkeit(Number(e.target.value))}
                  className="flex-1 accent-accent"
                />
                {geschwindigkeit !== null && (
                  <button
                    type="button"
                    onClick={() => setGeschwindigkeit(null)}
                    className="rounded-md border border-line px-2 py-1 text-xs text-foreground-soft hover:bg-background"
                  >
                    Zurücksetzen
                  </button>
                )}
              </div>
            </label>
          </div>
        </div>
      )}

      {gefiltert.length === 0 ? (
        <EmptyState icon="🎯" text="Keine Referenzvideos gefunden. Versuch andere Filter." />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {gefiltert.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

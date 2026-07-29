"use client";

import { useMemo, useState } from "react";
import VideoCard from "@/components/VideoCard";
import EmptyState from "@/components/EmptyState";
import KategorieKaskade, { type KategoriePfad } from "@/components/KategorieKaskade";
import { useSprache } from "@/components/SprachProvider";
import { pfadZuKategorie } from "@/lib/kategorieBaum";
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
  aktuellerNutzerId,
}: {
  videos: VideoMitDetails[];
  kategorien: Kategorie[];
  teile: Teil[];
  aktuellerNutzerId?: string | null;
}) {
  const { t } = useSprache();
  const [pfad, setPfad] = useState<KategoriePfad>({
    industrieId: null,
    herstellerId: null,
    produktId: null,
    kategorieId: null,
    unterkategorieId: null,
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
  // Kategorien-Verwaltung selbst setzen können. Solange kein Hersteller
  // ausgewählt ist (jetzt möglich, da Industrie/Hersteller/Produkt unabhängig
  // wählbar sind), werden die Zusatzfilter trotzdem angezeigt - sie werden
  // nur ausgeblendet, wenn man aktiv einen Hersteller ohne diese Felder wählt.
  const ausgewaehlterHersteller = useMemo(
    () => kategorien.find((k) => k.id === pfad.herstellerId) ?? null,
    [kategorien, pfad.herstellerId],
  );
  const zeigeZusatzfilter = pfad.herstellerId
    ? (ausgewaehlterHersteller?.zeigt_referenz_zusatzfelder ?? false)
    : true;

  const sichtbareTeile = useMemo(
    () => (pfad.unterkategorieId ? teile.filter((t) => t.kategorie_id === pfad.unterkategorieId) : teile),
    [teile, pfad.unterkategorieId],
  );

  function pfadGeaendert(neuerPfad: KategoriePfad) {
    setPfad(neuerPfad);
    setTeilId(ALLE);
  }

  type Zusatzfilter = {
    material: string;
    foerderbandbreite: string;
    beltConnection: string;
    runbackReversible: string;
    geschwindigkeit: number | null;
    land: string;
    besonderheiten: string;
  };

  const aktuelleZusatzfilter: Zusatzfilter = {
    material,
    foerderbandbreite,
    beltConnection,
    runbackReversible,
    geschwindigkeit,
    land,
    besonderheiten,
  };

  function passtVideo(video: VideoMitDetails, zf: Zusatzfilter): boolean {
    if (teilId !== ALLE && video.teil_id !== teilId) return false;

    const gewuenscht = [pfad.industrieId, pfad.herstellerId, pfad.produktId, pfad.kategorieId, pfad.unterkategorieId];
    if (teilId === ALLE && gewuenscht.some(Boolean)) {
      // Ein Video kann direkt (videos.kategorie_id) ODER über sein Teil
      // (teile.kategorie_id) einer Kategorie zugeordnet sein - direkt hat
      // Vorrang, damit auch Referenzvideos ohne exaktes Teil filterbar sind.
      const eigeneKategorieId = video.kategorie_id ?? video.teile?.kategorie_id ?? null;
      const kette = pfadZuKategorie(kategorien, eigeneKategorieId);
      for (let i = 0; i < gewuenscht.length; i++) {
        if (gewuenscht[i] && kette[i] !== gewuenscht[i]) return false;
      }
    }

    if (!zeigeZusatzfilter) return true;
    const d = details(video);

    if (zf.material && d?.material !== zf.material) return false;
    if (zf.foerderbandbreite && d?.foerderbandbreite !== zf.foerderbandbreite) return false;
    if (zf.beltConnection && d?.belt_connection !== zf.beltConnection) return false;
    if (zf.runbackReversible === "ja" && d?.runback_reversible !== true) return false;
    if (zf.runbackReversible === "nein" && d?.runback_reversible !== false) return false;
    if (
      zf.geschwindigkeit !== null &&
      (d?.geschwindigkeit_ms == null ||
        Math.abs(d.geschwindigkeit_ms - zf.geschwindigkeit) > GESCHWINDIGKEIT_TOLERANZ)
    )
      return false;
    if (zf.land.trim() && !d?.land?.toLowerCase().includes(zf.land.trim().toLowerCase())) return false;
    if (
      zf.besonderheiten.trim() &&
      !d?.besonderheiten?.toLowerCase().includes(zf.besonderheiten.trim().toLowerCase())
    )
      return false;

    return true;
  }

  const gefiltert = useMemo(() => {
    return videos.filter((video) => passtVideo(video, aktuelleZusatzfilter));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Wenn die aktuelle Kombination nichts findet: für jedes gesetzte
  // Zusatzfeld prüfen, ob es einen alternativen Wert gäbe, mit dem (bei
  // sonst gleichen Filtern) Videos gefunden würden - z.B. "Bandbreite
  // 1200-1400mm gibt es ein Video" statt der gewählten 1000-1200mm.
  const naheTreffer = useMemo(() => {
    if (gefiltert.length > 0 || !zeigeZusatzfilter) return [];
    const vorschlaege: { feld: string; wert: string }[] = [];

    if (foerderbandbreite) {
      for (const wert of FOERDERBANDBREITE_OPTIONEN) {
        if (wert === foerderbandbreite) continue;
        const treffer = videos.some((v) =>
          passtVideo(v, { ...aktuelleZusatzfilter, foerderbandbreite: wert }),
        );
        if (treffer) {
          vorschlaege.push({ feld: t("referenzvideos.foerderbandbreite"), wert });
          break;
        }
      }
    }
    if (material) {
      for (const wert of MATERIAL_OPTIONEN) {
        if (wert === material) continue;
        const treffer = videos.some((v) => passtVideo(v, { ...aktuelleZusatzfilter, material: wert }));
        if (treffer) {
          vorschlaege.push({ feld: t("referenzvideos.material"), wert });
          break;
        }
      }
    }
    if (beltConnection) {
      for (const wert of BELT_CONNECTION_OPTIONEN) {
        if (wert === beltConnection) continue;
        const treffer = videos.some((v) =>
          passtVideo(v, { ...aktuelleZusatzfilter, beltConnection: wert }),
        );
        if (treffer) {
          vorschlaege.push({ feld: t("referenzvideos.beltConnection"), wert });
          break;
        }
      }
    }
    if (runbackReversible) {
      const alt = runbackReversible === "ja" ? "nein" : "ja";
      const treffer = videos.some((v) =>
        passtVideo(v, { ...aktuelleZusatzfilter, runbackReversible: alt }),
      );
      if (treffer) {
        vorschlaege.push({ feld: t("referenzvideos.runbackReversible"), wert: t(`referenzvideos.${alt}`) });
      }
    }
    if (geschwindigkeit !== null) {
      for (let schritt = GESCHWINDIGKEIT_SCHRITT; schritt <= GESCHWINDIGKEIT_MAX; schritt += GESCHWINDIGKEIT_SCHRITT) {
        const kandidaten = [geschwindigkeit + schritt, geschwindigkeit - schritt].filter(
          (w) => w >= GESCHWINDIGKEIT_MIN && w <= GESCHWINDIGKEIT_MAX,
        );
        const treffer = kandidaten.find((w) =>
          videos.some((v) => passtVideo(v, { ...aktuelleZusatzfilter, geschwindigkeit: w })),
        );
        if (treffer !== undefined) {
          vorschlaege.push({ feld: t("referenzvideos.geschwindigkeit"), wert: `${treffer.toFixed(1)} m/s` });
          break;
        }
      }
    }
    if (land.trim()) {
      const alternativen = new Set(
        videos.map((v) => details(v)?.land).filter((l): l is string => Boolean(l && l.trim())),
      );
      for (const wert of alternativen) {
        const treffer = videos.some((v) => passtVideo(v, { ...aktuelleZusatzfilter, land: wert }));
        if (treffer) {
          vorschlaege.push({ feld: t("referenzvideos.land"), wert });
          break;
        }
      }
    }

    return vorschlaege;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gefiltert.length, zeigeZusatzfilter, videos, pfad, teilId, material, foerderbandbreite, beltConnection, runbackReversible, geschwindigkeit, land, besonderheiten, t]);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[280px] flex-1">
          <KategorieKaskade kategorien={kategorien} mitAlleOption onAendern={pfadGeaendert} />
        </div>

        <label className="block w-44">
          <span className="font-mono text-xs uppercase tracking-wide text-foreground-soft">{t("videothek.teil")}</span>
          <select
            value={teilId}
            onChange={(e) => setTeilId(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          >
            <option value={ALLE}>{t("videothek.alle")}</option>
            {sichtbareTeile.map((teil) => (
              <option key={teil.id} value={teil.id}>
                {teil.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {zeigeZusatzfilter && (
        <div className="mt-4 rounded-xl bg-surface p-4 ring-1 ring-line">
          <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">
            {t("referenzvideos.zusatzfilter", { hersteller: ausgewaehlterHersteller?.name ?? "" })}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="text-xs font-medium text-foreground-soft">{t("referenzvideos.material")}</span>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-background px-2 py-1.5 text-sm text-foreground"
              >
                <option value={ALLE}>{t("videothek.alle")}</option>
                {MATERIAL_OPTIONEN.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-foreground-soft">{t("referenzvideos.foerderbandbreite")}</span>
              <select
                value={foerderbandbreite}
                onChange={(e) => setFoerderbandbreite(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-background px-2 py-1.5 text-sm text-foreground"
              >
                <option value={ALLE}>{t("videothek.alle")}</option>
                {FOERDERBANDBREITE_OPTIONEN.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-foreground-soft">{t("referenzvideos.beltConnection")}</span>
              <select
                value={beltConnection}
                onChange={(e) => setBeltConnection(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-background px-2 py-1.5 text-sm text-foreground"
              >
                <option value={ALLE}>{t("videothek.alle")}</option>
                {BELT_CONNECTION_OPTIONEN.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-foreground-soft">{t("referenzvideos.runbackReversible")}</span>
              <select
                value={runbackReversible}
                onChange={(e) => setRunbackReversible(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-background px-2 py-1.5 text-sm text-foreground"
              >
                <option value={ALLE}>{t("videothek.alle")}</option>
                <option value="ja">{t("referenzvideos.ja")}</option>
                <option value="nein">{t("referenzvideos.nein")}</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-foreground-soft">{t("referenzvideos.land")}</span>
              <input
                value={land}
                onChange={(e) => setLand(e.target.value)}
                placeholder={t("referenzvideos.landPlatzhalter")}
                className="mt-1 w-full rounded-lg border border-line bg-background px-2 py-1.5 text-sm text-foreground"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-foreground-soft">{t("referenzvideos.besonderheiten")}</span>
              <input
                value={besonderheiten}
                onChange={(e) => setBesonderheiten(e.target.value)}
                placeholder={t("referenzvideos.besonderheitenPlatzhalter")}
                className="mt-1 w-full rounded-lg border border-line bg-background px-2 py-1.5 text-sm text-foreground"
              />
            </label>

            <label className="block sm:col-span-2 lg:col-span-3">
              <span className="text-xs font-medium text-foreground-soft">
                {t("referenzvideos.geschwindigkeit")}
                {": "}
                {geschwindigkeit === null ? (
                  t("referenzvideos.geschwindigkeitEgal")
                ) : (
                  <span className="font-mono text-blueprint">
                    {t("referenzvideos.geschwindigkeitCa", {
                      wert: geschwindigkeit.toFixed(1),
                      toleranz: String(GESCHWINDIGKEIT_TOLERANZ),
                    })}
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
                    {t("referenzvideos.zuruecksetzen")}
                  </button>
                )}
              </div>
            </label>
          </div>
        </div>
      )}

      {gefiltert.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon="🎯" text={t("referenzvideos.keineTreffer")} />
          {naheTreffer.length > 0 && (
            <div className="mx-auto mt-3 max-w-md rounded-lg bg-blueprint/10 px-4 py-3 text-center text-sm text-blueprint">
              {naheTreffer.map((vorschlag, i) => (
                <p key={i}>
                  {t("referenzvideos.naheTreffer", { feld: vorschlag.feld, wert: vorschlag.wert })}
                </p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {gefiltert.map((video) => (
            <VideoCard key={video.id} video={video} kategorien={kategorien} aktuellerNutzerId={aktuellerNutzerId} />
          ))}
        </div>
      )}
    </div>
  );
}

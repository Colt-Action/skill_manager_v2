"use client";

import { useEffect, useMemo, useState } from "react";
import VideoCard from "@/components/VideoCard";
import KategorieKaskade, { type KategoriePfad } from "@/components/KategorieKaskade";
import EmptyState from "@/components/EmptyState";
import { pfadZuKategorie } from "@/lib/kategorieBaum";
import { sucheOhneTrefferProtokollieren } from "@/lib/actions/suche";
import { useSprache } from "@/components/SprachProvider";
import type { Kategorie, Teil, VideoMitDetails } from "@/lib/supabase/types";

interface Props {
  videos: VideoMitDetails[];
  kategorien: Kategorie[];
  teile: Teil[];
  anfangsSuchtext?: string;
}

const ALLE = "";
const SEITENGROESSE = 24;
const SPEICHER_SCHLUESSEL = "sm-videothek-filter";

interface GespeicherterFilter {
  kategorieId: string | null;
  teilId: string;
}

function gespeicherterFilterLesen(): GespeicherterFilter | null {
  try {
    const raw = localStorage.getItem(SPEICHER_SCHLUESSEL);
    return raw ? (JSON.parse(raw) as GespeicherterFilter) : null;
  } catch {
    return null;
  }
}

export default function Videothek({ videos, kategorien, teile, anfangsSuchtext = "" }: Props) {
  const { t } = useSprache();
  const [pfad, setPfad] = useState<KategoriePfad>({
    industrieId: null,
    herstellerId: null,
    produktId: null,
    kategorieId: null,
  });
  const [startKategorieId] = useState<string | null>(() => gespeicherterFilterLesen()?.kategorieId ?? null);
  const [teilId, setTeilId] = useState(() => gespeicherterFilterLesen()?.teilId ?? ALLE);
  const [suchtext, setSuchtext] = useState(anfangsSuchtext);
  const [sichtbareAnzahl, setSichtbareAnzahl] = useState(SEITENGROESSE);

  const sichtbareTeile = useMemo(
    () =>
      pfad.kategorieId
        ? teile.filter((t) => t.kategorie_id === pfad.kategorieId)
        : teile,
    [teile, pfad.kategorieId],
  );

  function pfadGeaendert(neuerPfad: KategoriePfad) {
    setPfad(neuerPfad);
    setTeilId(ALLE);
  }

  const suchtextNormalisiert = suchtext.trim().toLowerCase();

  const gefilterteVideos = useMemo(() => {
    return videos.filter((video) => {
      if (teilId !== ALLE && video.teil_id !== teilId) return false;

      if (teilId === ALLE && (pfad.industrieId || pfad.herstellerId || pfad.produktId || pfad.kategorieId)) {
        const teilKategorieId = video.teile?.kategorie_id ?? null;
        if (!teilKategorieId) return false;
        const videoPfad = pfadZuKategorie(kategorien, teilKategorieId);
        const gewuenscht = [pfad.industrieId, pfad.herstellerId, pfad.produktId, pfad.kategorieId];
        for (let i = 0; i < gewuenscht.length; i++) {
          if (gewuenscht[i] && videoPfad[i] !== gewuenscht[i]) return false;
        }
      }

      if (!suchtextNormalisiert) return true;

      const felder = [
        video.titel,
        video.teile?.teilenummer ?? "",
        video.teile?.name ?? "",
        ...video.video_tags.flatMap(({ tags }) => [tags.name, ...tags.synonyme]),
      ];

      return felder.some((feld) => feld.toLowerCase().includes(suchtextNormalisiert));
    });
  }, [videos, teilId, pfad, kategorien, suchtextNormalisiert]);

  // Bei jeder Filter-/Suchänderung wieder von vorne anzeigen, statt mitten
  // in einer alten "Mehr anzeigen"-Liste zu bleiben. Vergleich während des
  // Renderns (React-empfohlenes Muster), statt in einem useEffect.
  const filterSchluessel = `${teilId}|${pfad.industrieId}|${pfad.herstellerId}|${pfad.produktId}|${pfad.kategorieId}|${suchtextNormalisiert}`;
  const [vorherigerFilterSchluessel, setVorherigerFilterSchluessel] = useState(filterSchluessel);
  if (filterSchluessel !== vorherigerFilterSchluessel) {
    setVorherigerFilterSchluessel(filterSchluessel);
    setSichtbareAnzahl(SEITENGROESSE);
  }

  const sichtbareVideos = gefilterteVideos.slice(0, sichtbareAnzahl);

  // Zuletzt genutzte Kategorie/Teil-Auswahl merken, damit Nutzer beim
  // nächsten Besuch nicht wieder bei "Alle" anfangen müssen.
  useEffect(() => {
    try {
      const tiefsteKategorieId =
        pfad.kategorieId ?? pfad.produktId ?? pfad.herstellerId ?? pfad.industrieId ?? null;
      localStorage.setItem(
        SPEICHER_SCHLUESSEL,
        JSON.stringify({ kategorieId: tiefsteKategorieId, teilId } satisfies GespeicherterFilter),
      );
    } catch {
      // localStorage evtl. blockiert (privates Surfen) – dann gilt die
      // Auswahl einfach nur für diese Sitzung.
    }
  }, [pfad, teilId]);

  // Wenn die Suche (nach kurzer Pause) keine Treffer bringt, wird das für
  // das Analytics-Dashboard der Trainer gespeichert.
  useEffect(() => {
    if (!suchtextNormalisiert || gefilterteVideos.length > 0) return;
    const timer = setTimeout(() => {
      sucheOhneTrefferProtokollieren(suchtextNormalisiert);
    }, 800);
    return () => clearTimeout(timer);
  }, [suchtextNormalisiert, gefilterteVideos.length]);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[280px]">
          <KategorieKaskade
            kategorien={kategorien}
            mitAlleOption
            startPfad={startKategorieId}
            onAendern={pfadGeaendert}
          />
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

        <label className="min-w-[240px] flex-1 max-w-sm">
          <span className="font-mono text-xs uppercase tracking-wide text-foreground-soft">{t("videothek.suche")}</span>
          <input
            type="search"
            value={suchtext}
            onChange={(e) => setSuchtext(e.target.value)}
            placeholder={t("videothek.suchePlatzhalter")}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>
      </div>

      {gefilterteVideos.length === 0 ? (
        <EmptyState icon="🔍" text={t("videothek.keineTreffer")} />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sichtbareVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          {sichtbareAnzahl < gefilterteVideos.length && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setSichtbareAnzahl((n) => n + SEITENGROESSE)}
                className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-foreground hover:bg-surface"
              >
                {t("videothek.mehrAnzeigen", { anzahl: String(gefilterteVideos.length - sichtbareAnzahl) })}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import VideoCard from "@/components/VideoCard";
import KategorieKaskade, { type KategoriePfad } from "@/components/KategorieKaskade";
import { pfadZuKategorie } from "@/lib/kategorieBaum";
import { sucheOhneTrefferProtokollieren } from "@/lib/actions/suche";
import type { Kategorie, Teil, VideoMitDetails } from "@/lib/supabase/types";

interface Props {
  videos: VideoMitDetails[];
  kategorien: Kategorie[];
  teile: Teil[];
}

const ALLE = "";

export default function Videothek({ videos, kategorien, teile }: Props) {
  const [pfad, setPfad] = useState<KategoriePfad>({
    industrieId: null,
    herstellerId: null,
    produktId: null,
    kategorieId: null,
  });
  const [teilId, setTeilId] = useState(ALLE);
  const [suchtext, setSuchtext] = useState("");

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

        <label className="min-w-[240px] flex-1 max-w-sm">
          <span className="font-mono text-xs uppercase tracking-wide text-foreground-soft">Suche</span>
          <input
            type="search"
            value={suchtext}
            onChange={(e) => setSuchtext(e.target.value)}
            placeholder="Titel, Teilenummer, Tag …"
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>
      </div>

      {gefilterteVideos.length === 0 ? (
        <p className="mt-10 text-center text-sm text-foreground-soft">
          Keine Videos gefunden. Versuch einen anderen Suchbegriff oder Filter.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {gefilterteVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import VideoCard from "@/components/VideoCard";
import { sucheOhneTrefferProtokollieren } from "@/lib/actions/suche";
import type { Kategorie, Teil, VideoMitDetails } from "@/lib/supabase/types";

interface Props {
  videos: VideoMitDetails[];
  kategorien: Kategorie[];
  teile: Teil[];
}

const ALLE = "alle";

export default function Videothek({ videos, kategorien, teile }: Props) {
  const [maschinentyp, setMaschinentyp] = useState(ALLE);
  const [kategorieId, setKategorieId] = useState(ALLE);
  const [teilId, setTeilId] = useState(ALLE);
  const [suchtext, setSuchtext] = useState("");

  // Geführte Filterung: Maschinentyp -> Kategorie -> Teil.
  // Jede Auswahl schränkt die nächste Liste ein.
  const maschinentypen = useMemo(
    () => Array.from(new Set(kategorien.map((k) => k.maschinentyp))).sort(),
    [kategorien],
  );

  const sichtbareKategorien = useMemo(
    () =>
      maschinentyp === ALLE
        ? kategorien
        : kategorien.filter((k) => k.maschinentyp === maschinentyp),
    [kategorien, maschinentyp],
  );

  const sichtbareTeile = useMemo(
    () =>
      kategorieId === ALLE ? teile : teile.filter((t) => t.kategorie_id === kategorieId),
    [teile, kategorieId],
  );

  // Wenn eine übergeordnete Auswahl geändert wird, setzen wir die
  // untergeordnete Auswahl direkt beim Ändern zurück (statt in einem
  // separaten Effect danach).
  function maschinentypGeaendert(neuerWert: string) {
    setMaschinentyp(neuerWert);
    setKategorieId(ALLE);
    setTeilId(ALLE);
  }

  function kategorieGeaendert(neuerWert: string) {
    setKategorieId(neuerWert);
    setTeilId(ALLE);
  }

  const suchtextNormalisiert = suchtext.trim().toLowerCase();

  const gefilterteVideos = useMemo(() => {
    return videos.filter((video) => {
      if (teilId !== ALLE && video.teil_id !== teilId) return false;
      if (teilId === ALLE && kategorieId !== ALLE && video.teile?.kategorie_id !== kategorieId)
        return false;
      if (teilId === ALLE && kategorieId === ALLE && maschinentyp !== ALLE) {
        const kategorie = kategorien.find((k) => k.id === video.teile?.kategorie_id);
        if (kategorie?.maschinentyp !== maschinentyp) return false;
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
  }, [videos, teilId, kategorieId, maschinentyp, kategorien, suchtextNormalisiert]);

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
        <Auswahl
          label="Maschinentyp"
          value={maschinentyp}
          onChange={maschinentypGeaendert}
          optionen={maschinentypen.map((m) => ({ value: m, label: m }))}
        />
        <Auswahl
          label="Kategorie"
          value={kategorieId}
          onChange={kategorieGeaendert}
          optionen={sichtbareKategorien.map((k) => ({ value: k.id, label: k.name }))}
        />
        <Auswahl
          label="Teil"
          value={teilId}
          onChange={setTeilId}
          optionen={sichtbareTeile.map((t) => ({ value: t.id, label: t.name }))}
        />

        <label className="ml-auto min-w-[240px] flex-1 max-w-sm">
          <span className="text-sm font-medium text-slate-700">Suche</span>
          <input
            type="search"
            value={suchtext}
            onChange={(e) => setSuchtext(e.target.value)}
            placeholder="Titel, Teilenummer, Tag …"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
        </label>
      </div>

      {gefilterteVideos.length === 0 ? (
        <p className="mt-10 text-center text-sm text-slate-500">
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

function Auswahl({
  label,
  value,
  onChange,
  optionen,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  optionen: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-44 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
      >
        <option value={ALLE}>Alle</option>
        {optionen.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

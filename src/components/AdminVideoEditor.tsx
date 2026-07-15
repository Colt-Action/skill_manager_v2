"use client";

import { useMemo, useState } from "react";
import { videoAktualisieren, videoFreigeben } from "@/lib/actions/admin";
import KategorieKaskade, { type KategoriePfad } from "@/components/KategorieKaskade";
import type { Kategorie, Teil, VideoMitDetails } from "@/lib/supabase/types";

const ALLE = "";

export default function AdminVideoEditor({
  video,
  kategorien,
  teile,
}: {
  video: VideoMitDetails;
  kategorien: Kategorie[];
  teile: Teil[];
}) {
  const [pfad, setPfad] = useState<KategoriePfad>({
    industrieId: null,
    herstellerId: null,
    produktId: null,
    kategorieId: video.teile?.kategorie_id ?? null,
  });
  const [teilId, setTeilId] = useState(video.teil_id ?? ALLE);
  const [beschreibung, setBeschreibung] = useState(video.beschreibung_schritte);
  const [tagsText, setTagsText] = useState(
    video.video_tags.map(({ tags }) => tags.name).join(", "),
  );
  const [speichert, setSpeichert] = useState(false);
  const [gibtFrei, setGibtFrei] = useState(false);
  const [nachricht, setNachricht] = useState<string | null>(null);
  const [freigegeben, setFreigegeben] = useState(false);

  const sichtbareTeile = useMemo(
    () => (pfad.kategorieId ? teile.filter((t) => t.kategorie_id === pfad.kategorieId) : []),
    [teile, pfad.kategorieId],
  );

  function pfadGeaendert(neuerPfad: KategoriePfad) {
    setPfad(neuerPfad);
    setTeilId(ALLE);
  }

  async function speichern() {
    setSpeichert(true);
    setNachricht(null);
    const ergebnis = await videoAktualisieren({
      id: video.id,
      teilId: teilId || null,
      beschreibungSchritte: beschreibung,
      tagNamen: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setSpeichert(false);
    setNachricht(ergebnis.erfolg ? "Gespeichert." : ergebnis.fehler ?? "Fehler beim Speichern.");
  }

  async function freigeben() {
    setGibtFrei(true);
    const ergebnis = await videoFreigeben(video.id);
    setGibtFrei(false);
    if (ergebnis.erfolg) {
      setFreigegeben(true);
    } else {
      setNachricht(ergebnis.fehler ?? "Fehler beim Freigeben.");
    }
  }

  if (freigegeben) {
    return (
      <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">
          &bdquo;{video.titel}&ldquo; wurde freigegeben und ist jetzt in der Videothek sichtbar.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
      <div className="flex flex-wrap items-start gap-4">
        <video src={video.datei_url} controls className="aspect-video w-56 rounded-lg bg-black" />
        <div className="min-w-[240px] flex-1">
          <h2 className="font-medium text-slate-900">{video.titel}</h2>
          <p className="text-xs text-slate-400">
            Hochgeladen am {new Date(video.erstellt_am).toLocaleDateString("de-DE")}
          </p>

          <div className="mt-3">
            <KategorieKaskade
              kategorien={kategorien}
              startPfad={video.teile?.kategorie_id ?? null}
              onAendern={pfadGeaendert}
            />
          </div>

          <label className="mt-3 block">
            <span className="text-xs font-medium text-slate-600">Teil</span>
            <select
              value={teilId}
              onChange={(e) => setTeilId(e.target.value)}
              disabled={!pfad.kategorieId}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value={ALLE}>–</option>
              {sichtbareTeile.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.teilenummer}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-3 block">
            <span className="text-xs font-medium text-slate-600">Tags (Komma-getrennt)</span>
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              placeholder="z. B. Ventil, Dichtung, Wartung"
            />
          </label>

          <label className="mt-3 block">
            <span className="text-xs font-medium text-slate-600">
              Schritt-für-Schritt-Beschreibung
            </span>
            <textarea
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
            />
          </label>

          {nachricht && <p className="mt-2 text-xs text-slate-500">{nachricht}</p>}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={speichern}
              disabled={speichert}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
            >
              {speichert ? "Speichert …" : "Änderungen speichern"}
            </button>
            <button
              type="button"
              onClick={freigeben}
              disabled={gibtFrei}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {gibtFrei ? "Gibt frei …" : "Freigeben"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

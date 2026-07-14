"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { videoHochladen } from "@/lib/actions/video";
import type { Kategorie, Teil } from "@/lib/supabase/types";

const ALLE = "";

export default function UploadForm({
  kategorien,
  teile,
}: {
  kategorien: Kategorie[];
  teile: Teil[];
}) {
  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [maschinentyp, setMaschinentyp] = useState(ALLE);
  const [kategorieId, setKategorieId] = useState(ALLE);
  const [teilId, setTeilId] = useState(ALLE);
  const [datei, setDatei] = useState<File | null>(null);
  const [dauer, setDauer] = useState<number | null>(null);
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [fortschritt, setFortschritt] = useState<string | null>(null);

  const maschinentypen = useMemo(
    () => Array.from(new Set(kategorien.map((k) => k.maschinentyp))).sort(),
    [kategorien],
  );
  const sichtbareKategorien = useMemo(
    () =>
      maschinentyp === ALLE ? kategorien : kategorien.filter((k) => k.maschinentyp === maschinentyp),
    [kategorien, maschinentyp],
  );
  const sichtbareTeile = useMemo(
    () => (kategorieId === ALLE ? teile : teile.filter((t) => t.kategorie_id === kategorieId)),
    [teile, kategorieId],
  );

  function dateiAusgewaehlt(datei: File | null) {
    setDatei(datei);
    setDauer(null);
    if (!datei) return;

    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      setDauer(Math.round(video.duration));
      URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(datei);
  }

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setFehler(null);

    if (!datei) {
      setFehler("Bitte eine Videodatei auswählen.");
      return;
    }
    if (!titel.trim()) {
      setFehler("Bitte einen Titel eingeben.");
      return;
    }

    setLaedt(true);
    try {
      setFortschritt("Video wird hochgeladen …");
      const supabase = createClient();
      const dateiname = `${crypto.randomUUID()}-${datei.name}`;

      const { error: uploadFehler } = await supabase.storage
        .from("videos")
        .upload(dateiname, datei);

      if (uploadFehler) {
        setFehler(`Upload fehlgeschlagen: ${uploadFehler.message}`);
        return;
      }

      const { data: urlData } = supabase.storage.from("videos").getPublicUrl(dateiname);

      setFortschritt("Eintrag wird gespeichert …");
      const ergebnis = await videoHochladen({
        titel: titel.trim(),
        dateiUrl: urlData.publicUrl,
        dauer,
        beschreibungSchritte: beschreibung.trim(),
        teilId: teilId || null,
      });

      if (ergebnis && !ergebnis.erfolg) {
        setFehler(ergebnis.fehler ?? "Unbekannter Fehler beim Speichern.");
      }
      // Bei Erfolg leitet die Server Action automatisch weiter (redirect).
    } finally {
      setLaedt(false);
      setFortschritt(null);
    }
  }

  return (
    <form onSubmit={absenden} className="mt-6 space-y-5">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Titel</span>
        <input
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          placeholder="z. B. Dichtungsring am Ventil XY wechseln"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Videodatei</span>
        <input
          type="file"
          accept="video/*"
          required
          onChange={(e) => dateiAusgewaehlt(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:text-white"
        />
        {dauer != null && <span className="mt-1 block text-xs text-slate-400">Länge erkannt: {dauer} Sek.</span>}
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Maschinentyp</span>
          <select
            value={maschinentyp}
            onChange={(e) => {
              setMaschinentyp(e.target.value);
              setKategorieId(ALLE);
              setTeilId(ALLE);
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value={ALLE}>Bitte wählen</option>
            {maschinentypen.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Kategorie</span>
          <select
            value={kategorieId}
            onChange={(e) => {
              setKategorieId(e.target.value);
              setTeilId(ALLE);
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value={ALLE}>Bitte wählen</option>
            {sichtbareKategorien.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Teil</span>
          <select
            value={teilId}
            onChange={(e) => setTeilId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value={ALLE}>Bitte wählen</option>
            {sichtbareTeile.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          Kurzbeschreibung / Schritt-für-Schritt-Anleitung
        </span>
        <textarea
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          placeholder={"1. Maschine ausschalten\n2. Abdeckung öffnen\n3. …"}
        />
      </label>

      {fehler && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{fehler}</p>}

      <button
        type="submit"
        disabled={laedt}
        className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {laedt ? fortschritt ?? "Wird hochgeladen …" : "Video einreichen"}
      </button>
    </form>
  );
}

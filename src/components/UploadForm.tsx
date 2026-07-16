"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { videoHochladen } from "@/lib/actions/video";
import KategorieKaskade, { type KategoriePfad } from "@/components/KategorieKaskade";
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
  const [pfad, setPfad] = useState<KategoriePfad>({
    industrieId: null,
    herstellerId: null,
    produktId: null,
    kategorieId: null,
  });
  const [teilId, setTeilId] = useState(ALLE);
  const [datei, setDatei] = useState<File | null>(null);
  const [dauer, setDauer] = useState<number | null>(null);
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [fortschritt, setFortschritt] = useState<string | null>(null);

  const sichtbareTeile = useMemo(
    () => (pfad.kategorieId ? teile.filter((t) => t.kategorie_id === pfad.kategorieId) : []),
    [teile, pfad.kategorieId],
  );

  function pfadGeaendert(neuerPfad: KategoriePfad) {
    setPfad(neuerPfad);
    setTeilId(ALLE);
  }

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
        <span className="text-sm font-medium text-foreground">Titel</span>
        <input
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          placeholder="z. B. Dichtungsring am Ventil XY wechseln"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground">Videodatei</span>
        <input
          type="file"
          accept="video/*"
          required
          onChange={(e) => dateiAusgewaehlt(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm text-foreground-soft file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-accent-ink"
        />
        {dauer != null && <span className="mt-1 block font-mono text-xs text-foreground-soft">Länge erkannt: {dauer} Sek.</span>}
      </label>

      <div>
        <span className="text-sm font-medium text-foreground">Wo gehört das Video hin?</span>
        <div className="mt-1">
          <KategorieKaskade kategorien={kategorien} onAendern={pfadGeaendert} />
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-foreground">Teil</span>
        <select
          value={teilId}
          onChange={(e) => setTeilId(e.target.value)}
          disabled={!pfad.kategorieId}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground disabled:bg-background disabled:text-foreground-soft"
        >
          <option value={ALLE}>Bitte wählen</option>
          {sichtbareTeile.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} · {t.teilenummer}
            </option>
          ))}
        </select>
        {pfad.kategorieId && sichtbareTeile.length === 0 && (
          <p className="mt-1 text-xs text-accent-deep">
            Für diese Kategorie gibt es noch keine Teile. Ein Admin kann welche unter
            &bdquo;Kategorien &amp; Teile&ldquo; anlegen.
          </p>
        )}
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground">
          Kurzbeschreibung / Schritt-für-Schritt-Anleitung
        </span>
        <textarea
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          placeholder={"1. Maschine ausschalten\n2. Abdeckung öffnen\n3. …"}
        />
      </label>

      {fehler && <p className="rounded-md bg-critical/10 px-3 py-2 text-sm text-critical">{fehler}</p>}

      <button
        type="submit"
        disabled={laedt}
        className="w-full rounded-lg bg-accent py-2.5 text-sm font-bold uppercase tracking-wide text-accent-ink transition hover:bg-accent-deep disabled:opacity-50"
      >
        {laedt ? fortschritt ?? "Wird hochgeladen …" : "Video einreichen"}
      </button>
    </form>
  );
}

"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { videoHochladen } from "@/lib/actions/video";
import KategorieKaskade, { type KategoriePfad } from "@/components/KategorieKaskade";
import {
  BELT_CONNECTION_OPTIONEN,
  FOERDERBANDBREITE_OPTIONEN,
  GESCHWINDIGKEIT_MAX,
  GESCHWINDIGKEIT_MIN,
  GESCHWINDIGKEIT_SCHRITT,
  MATERIAL_OPTIONEN,
} from "@/lib/referenzvideoOptionen";
import type { Kategorie, Teil, VideoTyp } from "@/lib/supabase/types";

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
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const [thumbnailVorschau, setThumbnailVorschau] = useState<string | null>(null);
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [fortschritt, setFortschritt] = useState<string | null>(null);

  const [videoTyp, setVideoTyp] = useState<VideoTyp>("schulung");
  const [material, setMaterial] = useState("");
  const [materialSonstiges, setMaterialSonstiges] = useState("");
  const [geschwindigkeit, setGeschwindigkeit] = useState(GESCHWINDIGKEIT_MIN);
  const [foerderbandbreite, setFoerderbandbreite] = useState("");
  const [beltConnection, setBeltConnection] = useState("");
  const [mechanicalSpliceTyp, setMechanicalSpliceTyp] = useState("");
  const [runbackReversible, setRunbackReversible] = useState(false);
  const [land, setLand] = useState("");
  const [besonderheiten, setBesonderheiten] = useState("");

  const sichtbareTeile = useMemo(
    () => (pfad.kategorieId ? teile.filter((t) => t.kategorie_id === pfad.kategorieId) : []),
    [teile, pfad.kategorieId],
  );

  // Ob die HOSCH-artigen Zusatzfelder erscheinen, hängt vom gewählten
  // Hersteller ab (Flag in der Kategorien-Verwaltung), nicht von einem fest
  // im Code verdrahteten Namen – so funktioniert das automatisch auch für
  // später hinzukommende Hersteller.
  const ausgewaehlterHersteller = useMemo(
    () => kategorien.find((k) => k.id === pfad.herstellerId) ?? null,
    [kategorien, pfad.herstellerId],
  );
  const zeigtReferenzZusatzfelder = ausgewaehlterHersteller?.zeigt_referenz_zusatzfelder ?? false;

  function pfadGeaendert(neuerPfad: KategoriePfad) {
    setPfad(neuerPfad);
    setTeilId(ALLE);
  }

  function dateiAusgewaehlt(datei: File | null) {
    setDatei(datei);
    setDauer(null);
    setThumbnailBlob(null);
    setThumbnailVorschau(null);
    if (!datei) return;

    // Erzeugt automatisch ein Vorschaubild aus dem Video (statt später bei
    // jeder Kartenansicht das komplette Video laden zu müssen) – dafür wird
    // kurz ein unsichtbares <video>-Element genutzt, an eine Stelle
    // gesprungen und der aktuelle Frame in ein Canvas gezeichnet.
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => {
      setDauer(Math.round(video.duration));
      video.currentTime = Math.min(1, video.duration / 2 || 0);
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setThumbnailBlob(blob);
              setThumbnailVorschau(URL.createObjectURL(blob));
            }
            URL.revokeObjectURL(video.src);
          },
          "image/jpeg",
          0.8,
        );
      }
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

      let thumbnailUrl: string | null = null;
      if (thumbnailBlob) {
        setFortschritt("Vorschaubild wird hochgeladen …");
        const thumbnailName = `${crypto.randomUUID()}.jpg`;
        const { error: thumbnailFehler } = await supabase.storage
          .from("thumbnails")
          .upload(thumbnailName, thumbnailBlob, { contentType: "image/jpeg" });
        if (!thumbnailFehler) {
          thumbnailUrl = supabase.storage.from("thumbnails").getPublicUrl(thumbnailName).data.publicUrl;
        }
      }

      setFortschritt("Eintrag wird gespeichert …");
      const ergebnis = await videoHochladen({
        titel: titel.trim(),
        dateiUrl: urlData.publicUrl,
        thumbnailUrl,
        dauer,
        beschreibungSchritte: beschreibung.trim(),
        teilId: teilId || null,
        videoTyp,
        referenzDetails:
          videoTyp === "referenz"
            ? {
                material,
                materialSonstiges,
                geschwindigkeitMs: geschwindigkeit,
                foerderbandbreite,
                beltConnection,
                mechanicalSpliceTyp,
                runbackReversible,
                land: land.trim(),
                besonderheiten: besonderheiten.trim(),
              }
            : null,
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
      <div>
        <span className="text-sm font-medium text-foreground">Art des Videos</span>
        <div className="mt-1 flex rounded-lg bg-background p-1 text-sm ring-1 ring-line">
          <button
            type="button"
            onClick={() => setVideoTyp("schulung")}
            className={`flex-1 rounded-md py-1.5 font-semibold transition ${
              videoTyp === "schulung" ? "bg-accent text-accent-ink" : "text-foreground-soft"
            }`}
          >
            Schulungsvideo
          </button>
          <button
            type="button"
            onClick={() => setVideoTyp("referenz")}
            className={`flex-1 rounded-md py-1.5 font-semibold transition ${
              videoTyp === "referenz" ? "bg-accent text-accent-ink" : "text-foreground-soft"
            }`}
          >
            Referenzvideo
          </button>
        </div>
        <p className="mt-1 text-xs text-foreground-soft">
          {videoTyp === "schulung"
            ? "Erklärt Technikern, wie ein Teil funktioniert oder gewartet wird – erscheint in der Video-Bibliothek."
            : "Zeigt, wie ein HOSCH-Gerät in einer Kundenanlage läuft – erscheint im Bereich \"Referenzvideos\"."}
        </p>
      </div>

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
        {thumbnailVorschau && (
          <div className="mt-2 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnailVorschau} alt="" className="h-14 w-24 rounded-lg object-cover ring-1 ring-line" />
            <span className="font-mono text-xs text-foreground-soft">Automatisch erzeugtes Vorschaubild</span>
          </div>
        )}
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

      {videoTyp === "referenz" && !zeigtReferenzZusatzfelder && (
        <p className="rounded-md bg-accent/10 px-3 py-2 text-sm text-accent-deep">
          Wähle oben bei &bdquo;Wo gehört das Video hin?&ldquo; einen Hersteller mit
          Referenzvideo-Zusatzfeldern (z. B. HOSCH), um Material, Geschwindigkeit usw. anzugeben.
        </p>
      )}

      {videoTyp === "referenz" && zeigtReferenzZusatzfelder && (
        <div className="rounded-xl bg-surface p-4 ring-1 ring-line">
          <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">
            Zusatzangaben Referenzvideo ({ausgewaehlterHersteller?.name})
          </h2>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-foreground">Material</span>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">Bitte wählen</option>
                {MATERIAL_OPTIONEN.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {material === "Sonstiges" && (
                <input
                  value={materialSonstiges}
                  onChange={(e) => setMaterialSonstiges(e.target.value)}
                  placeholder="Welches Material?"
                  className="mt-2 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
                />
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-foreground">Förderbandbreite</span>
              <select
                value={foerderbandbreite}
                onChange={(e) => setFoerderbandbreite(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">Bitte wählen</option>
                {FOERDERBANDBREITE_OPTIONEN.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-foreground">
                Geschwindigkeit: <span className="font-mono text-blueprint">{geschwindigkeit.toFixed(1)} m/s</span>
              </span>
              <input
                type="range"
                min={GESCHWINDIGKEIT_MIN}
                max={GESCHWINDIGKEIT_MAX}
                step={GESCHWINDIGKEIT_SCHRITT}
                value={geschwindigkeit}
                onChange={(e) => setGeschwindigkeit(Number(e.target.value))}
                className="mt-2 w-full accent-accent"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-foreground">Belt Connection</span>
              <select
                value={beltConnection}
                onChange={(e) => setBeltConnection(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">Bitte wählen</option>
                {BELT_CONNECTION_OPTIONEN.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {beltConnection === "Mechanical Splice" && (
                <input
                  value={mechanicalSpliceTyp}
                  onChange={(e) => setMechanicalSpliceTyp(e.target.value)}
                  placeholder="Welche Art von Mechanical Splice?"
                  className="mt-2 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
                />
              )}
            </label>

            <label className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={runbackReversible}
                onChange={(e) => setRunbackReversible(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              <span className="text-sm font-medium text-foreground">Runback/Reversible</span>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-foreground">Land</span>
              <input
                value={land}
                onChange={(e) => setLand(e.target.value)}
                placeholder="z. B. Deutschland"
                className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-foreground">Andere Besonderheiten</span>
              <input
                value={besonderheiten}
                onChange={(e) => setBesonderheiten(e.target.value)}
                placeholder="Freies Feld"
                className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
          </div>
        </div>
      )}

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

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { videoHochladen } from "@/lib/actions/video";
import KategorieKaskade, { type KategoriePfad } from "@/components/KategorieKaskade";
import { useSprache } from "@/components/SprachProvider";
import type { Kategorie, Teil } from "@/lib/supabase/types";

const ALLE = "";

// Nur noch für Schulungsvideos - Referenzen (Video/Foto/Dokument/Link) haben
// seit Phase 17 ihr eigenes Formular im Referenzbereich.
export default function UploadForm({
  kategorien,
  teile,
}: {
  kategorien: Kategorie[];
  teile: Teil[];
}) {
  const { t } = useSprache();
  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [pfad, setPfad] = useState<KategoriePfad>({
    industrieId: null,
    herstellerId: null,
    produktId: null,
    kategorieId: null,
    unterkategorieId: null,
  });
  const [teilId, setTeilId] = useState(ALLE);
  const [datei, setDatei] = useState<File | null>(null);
  const [dauer, setDauer] = useState<number | null>(null);
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const [thumbnailVorschau, setThumbnailVorschau] = useState<string | null>(null);
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [fortschritt, setFortschritt] = useState<string | null>(null);

  const sichtbareTeile = useMemo(
    () => (pfad.unterkategorieId ? teile.filter((t) => t.kategorie_id === pfad.unterkategorieId) : []),
    [teile, pfad.unterkategorieId],
  );

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
      setFehler(t("upload.fehlerKeineDatei"));
      return;
    }
    if (!titel.trim()) {
      setFehler(t("upload.fehlerKeinTitel"));
      return;
    }

    setLaedt(true);
    try {
      setFortschritt(t("upload.fortschrittVideo"));
      const supabase = createClient();
      const dateiname = `${crypto.randomUUID()}-${datei.name}`;

      const { error: uploadFehler } = await supabase.storage
        .from("videos")
        .upload(dateiname, datei);

      if (uploadFehler) {
        setFehler(t("upload.fehlerUploadFehlgeschlagen", { meldung: uploadFehler.message }));
        return;
      }

      const { data: urlData } = supabase.storage.from("videos").getPublicUrl(dateiname);

      let thumbnailUrl: string | null = null;
      if (thumbnailBlob) {
        setFortschritt(t("upload.fortschrittThumbnail"));
        const thumbnailName = `${crypto.randomUUID()}.jpg`;
        const { error: thumbnailFehler } = await supabase.storage
          .from("thumbnails")
          .upload(thumbnailName, thumbnailBlob, { contentType: "image/jpeg" });
        if (!thumbnailFehler) {
          thumbnailUrl = supabase.storage.from("thumbnails").getPublicUrl(thumbnailName).data.publicUrl;
        }
      }

      setFortschritt(t("upload.fortschrittEintrag"));
      const ergebnis = await videoHochladen({
        titel: titel.trim(),
        dateiUrl: urlData.publicUrl,
        thumbnailUrl,
        dauer,
        beschreibungSchritte: beschreibung.trim(),
        teilId: teilId || null,
        kategorieId:
          pfad.unterkategorieId ?? pfad.kategorieId ?? pfad.produktId ?? pfad.herstellerId ?? pfad.industrieId ?? null,
        videoTyp: "schulung",
        referenzDetails: null,
      });

      if (ergebnis && !ergebnis.erfolg) {
        setFehler(ergebnis.fehler ?? t("upload.fehlerUnbekannt"));
      }
      // Bei Erfolg leitet die Server Action automatisch weiter (redirect).
    } finally {
      setLaedt(false);
      setFortschritt(null);
    }
  }

  return (
    <form onSubmit={absenden} className="mt-6 space-y-5">
      <p className="rounded-md bg-blueprint/10 px-3 py-2 text-sm text-blueprint">
        {t("upload.referenzHinweis")}{" "}
        <Link href="/referenzbereich/hochladen" className="font-semibold underline">
          {t("upload.referenzHinweisLink")}
        </Link>
      </p>

      <label className="block">
        <span className="text-sm font-medium text-foreground">{t("upload.titel")}</span>
        <input
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          placeholder={t("upload.titelPlatzhalter")}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground">{t("upload.videodatei")}</span>
        <input
          type="file"
          accept="video/*"
          required
          onChange={(e) => dateiAusgewaehlt(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm text-foreground-soft file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-accent-ink"
        />
        {dauer != null && (
          <span className="mt-1 block font-mono text-xs text-foreground-soft">
            {t("upload.laengeErkannt", { sekunden: String(dauer) })}
          </span>
        )}
        {thumbnailVorschau && (
          <div className="mt-2 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnailVorschau} alt="" className="h-14 w-24 rounded-lg object-cover ring-1 ring-line" />
            <span className="font-mono text-xs text-foreground-soft">{t("upload.vorschaubildAutomatisch")}</span>
          </div>
        )}
      </label>

      <div>
        <span className="text-sm font-medium text-foreground">{t("upload.wohin")}</span>
        <div className="mt-1">
          <KategorieKaskade kategorien={kategorien} onAendern={pfadGeaendert} />
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-foreground">{t("upload.teil")}</span>
        <select
          value={teilId}
          onChange={(e) => setTeilId(e.target.value)}
          disabled={!pfad.unterkategorieId}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground disabled:bg-background disabled:text-foreground-soft"
        >
          <option value={ALLE}>{t("upload.bitteWaehlen")}</option>
          {sichtbareTeile.map((teil) => (
            <option key={teil.id} value={teil.id}>
              {teil.name} · {teil.teilenummer}
            </option>
          ))}
        </select>
        {pfad.unterkategorieId && sichtbareTeile.length === 0 && (
          <p className="mt-1 text-xs text-accent-deep">{t("upload.keineTeileHinweis")}</p>
        )}
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground">{t("upload.kurzbeschreibung")}</span>
        <textarea
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          placeholder={t("upload.beschreibungPlatzhalter")}
        />
      </label>

      {fehler && <p className="rounded-md bg-critical/10 px-3 py-2 text-sm text-critical">{fehler}</p>}

      <button
        type="submit"
        disabled={laedt}
        className="w-full rounded-lg bg-accent py-2.5 text-sm font-bold uppercase tracking-wide text-accent-ink transition hover:bg-accent-deep disabled:opacity-50"
      >
        {laedt ? fortschritt ?? t("upload.wirdHochgeladen") : t("upload.videoEinreichen")}
      </button>
    </form>
  );
}

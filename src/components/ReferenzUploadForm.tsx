"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { referenzErstellen } from "@/lib/actions/referenzen";
import KategorieKaskade, { type KategoriePfad } from "@/components/KategorieKaskade";
import { useSprache } from "@/components/SprachProvider";
import {
  BELT_CONNECTION_OPTIONEN,
  FOERDERBANDBREITE_OPTIONEN,
  GESCHWINDIGKEIT_MAX,
  GESCHWINDIGKEIT_MIN,
  GESCHWINDIGKEIT_SCHRITT,
  MATERIAL_OPTIONEN,
} from "@/lib/referenzvideoOptionen";
import type { Kategorie, ReferenzTyp, Teil } from "@/lib/supabase/types";

const ALLE = "";

const TYP_OPTIONEN: { typ: ReferenzTyp; icon: string; labelSchluessel: string }[] = [
  { typ: "video", icon: "🎥", labelSchluessel: "referenzUpload.typVideo" },
  { typ: "foto", icon: "📷", labelSchluessel: "referenzUpload.typFoto" },
  { typ: "dokument", icon: "📄", labelSchluessel: "referenzUpload.typDokument" },
  { typ: "link", icon: "🔗", labelSchluessel: "referenzUpload.typLink" },
];

export default function ReferenzUploadForm({
  kategorien,
  teile,
}: {
  kategorien: Kategorie[];
  teile: Teil[];
}) {
  const { t } = useSprache();
  const [typ, setTyp] = useState<ReferenzTyp>("video");
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
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [fortschritt, setFortschritt] = useState<string | null>(null);

  // Video
  const [videoDatei, setVideoDatei] = useState<File | null>(null);
  const [dauer, setDauer] = useState<number | null>(null);
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const [thumbnailVorschau, setThumbnailVorschau] = useState<string | null>(null);

  // Foto
  const [vorherDatei, setVorherDatei] = useState<File | null>(null);
  const [nachherDatei, setNachherDatei] = useState<File | null>(null);

  // Dokument
  const [dokumentDatei, setDokumentDatei] = useState<File | null>(null);

  // Link
  const [linkUrl, setLinkUrl] = useState("");
  const [linkQuelle, setLinkQuelle] = useState("");

  // Zusatzfelder (Material, Geschwindigkeit, ...)
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
    () => (pfad.unterkategorieId ? teile.filter((t) => t.kategorie_id === pfad.unterkategorieId) : []),
    [teile, pfad.unterkategorieId],
  );

  const ausgewaehlterHersteller = useMemo(
    () => kategorien.find((k) => k.id === pfad.herstellerId) ?? null,
    [kategorien, pfad.herstellerId],
  );
  const zeigtZusatzfelder = ausgewaehlterHersteller?.zeigt_referenz_zusatzfelder ?? false;

  function pfadGeaendert(neuerPfad: KategoriePfad) {
    setPfad(neuerPfad);
    setTeilId(ALLE);
  }

  function videoDateiAusgewaehlt(datei: File | null) {
    setVideoDatei(datei);
    setDauer(null);
    setThumbnailBlob(null);
    setThumbnailVorschau(null);
    if (!datei) return;

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

    if (!titel.trim()) {
      setFehler(t("referenzUpload.fehlerKeinTitel"));
      return;
    }
    if (typ === "video" && !videoDatei) {
      setFehler(t("referenzUpload.fehlerKeineDatei"));
      return;
    }
    if (typ === "foto" && !vorherDatei && !nachherDatei) {
      setFehler(t("referenzUpload.fehlerKeinFoto"));
      return;
    }
    if (typ === "dokument" && !dokumentDatei) {
      setFehler(t("referenzUpload.fehlerKeineDatei"));
      return;
    }
    if (typ === "link" && !linkUrl.trim()) {
      setFehler(t("referenzUpload.fehlerKeineUrl"));
      return;
    }

    setLaedt(true);
    try {
      const supabase = createClient();
      const kategorieId =
        pfad.unterkategorieId ?? pfad.kategorieId ?? pfad.produktId ?? pfad.herstellerId ?? pfad.industrieId ?? null;

      const metadaten = zeigtZusatzfelder
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
        : null;

      if (typ === "video" && videoDatei) {
        setFortschritt(t("referenzUpload.fortschrittDatei"));
        const dateiname = `${crypto.randomUUID()}-${videoDatei.name}`;
        const { error: uploadFehler } = await supabase.storage.from("videos").upload(dateiname, videoDatei);
        if (uploadFehler) {
          setFehler(uploadFehler.message);
          return;
        }
        const { data: urlData } = supabase.storage.from("videos").getPublicUrl(dateiname);

        let thumbnailUrl: string | null = null;
        if (thumbnailBlob) {
          const thumbnailName = `${crypto.randomUUID()}.jpg`;
          const { error: thumbnailFehler } = await supabase.storage
            .from("thumbnails")
            .upload(thumbnailName, thumbnailBlob, { contentType: "image/jpeg" });
          if (!thumbnailFehler) {
            thumbnailUrl = supabase.storage.from("thumbnails").getPublicUrl(thumbnailName).data.publicUrl;
          }
        }

        setFortschritt(t("referenzUpload.fortschrittEintrag"));
        const ergebnis = await referenzErstellen({
          titel: titel.trim(),
          beschreibung: beschreibung.trim(),
          typ,
          kategorieId,
          teilId: teilId || null,
          metadaten,
          video: { dateiUrl: urlData.publicUrl, thumbnailUrl, dauer },
        });
        if (ergebnis && !ergebnis.erfolg) setFehler(ergebnis.fehler ?? t("referenzUpload.fehlerUnbekannt"));
        return;
      }

      if (typ === "foto") {
        setFortschritt(t("referenzUpload.fortschrittDatei"));
        let vorherUrl: string | null = null;
        let nachherUrl: string | null = null;
        if (vorherDatei) {
          const name = `${crypto.randomUUID()}-vorher-${vorherDatei.name}`;
          const { error: e } = await supabase.storage.from("referenz-fotos").upload(name, vorherDatei);
          if (e) {
            setFehler(e.message);
            return;
          }
          vorherUrl = supabase.storage.from("referenz-fotos").getPublicUrl(name).data.publicUrl;
        }
        if (nachherDatei) {
          const name = `${crypto.randomUUID()}-nachher-${nachherDatei.name}`;
          const { error: e } = await supabase.storage.from("referenz-fotos").upload(name, nachherDatei);
          if (e) {
            setFehler(e.message);
            return;
          }
          nachherUrl = supabase.storage.from("referenz-fotos").getPublicUrl(name).data.publicUrl;
        }

        setFortschritt(t("referenzUpload.fortschrittEintrag"));
        const ergebnis = await referenzErstellen({
          titel: titel.trim(),
          beschreibung: beschreibung.trim(),
          typ,
          kategorieId,
          teilId: teilId || null,
          metadaten,
          foto: { vorherUrl, nachherUrl },
        });
        if (ergebnis && !ergebnis.erfolg) setFehler(ergebnis.fehler ?? t("referenzUpload.fehlerUnbekannt"));
        return;
      }

      if (typ === "dokument" && dokumentDatei) {
        setFortschritt(t("referenzUpload.fortschrittDatei"));
        const dateiname = `${crypto.randomUUID()}-${dokumentDatei.name}`;
        const { error: uploadFehler } = await supabase.storage
          .from("referenz-dokumente")
          .upload(dateiname, dokumentDatei);
        if (uploadFehler) {
          setFehler(uploadFehler.message);
          return;
        }
        const { data: urlData } = supabase.storage.from("referenz-dokumente").getPublicUrl(dateiname);
        const dateityp = dokumentDatei.name.toLowerCase().endsWith(".pdf") ? "pdf" : "word";

        setFortschritt(t("referenzUpload.fortschrittEintrag"));
        const ergebnis = await referenzErstellen({
          titel: titel.trim(),
          beschreibung: beschreibung.trim(),
          typ,
          kategorieId,
          teilId: teilId || null,
          metadaten,
          dokument: { dateiUrl: urlData.publicUrl, dateiname: dokumentDatei.name, dateityp },
        });
        if (ergebnis && !ergebnis.erfolg) setFehler(ergebnis.fehler ?? t("referenzUpload.fehlerUnbekannt"));
        return;
      }

      if (typ === "link") {
        setFortschritt(t("referenzUpload.fortschrittEintrag"));
        const ergebnis = await referenzErstellen({
          titel: titel.trim(),
          beschreibung: beschreibung.trim(),
          typ,
          kategorieId,
          teilId: teilId || null,
          metadaten,
          link: { url: linkUrl.trim(), quelle: linkQuelle.trim() },
        });
        if (ergebnis && !ergebnis.erfolg) setFehler(ergebnis.fehler ?? t("referenzUpload.fehlerUnbekannt"));
      }
    } finally {
      setLaedt(false);
      setFortschritt(null);
    }
  }

  return (
    <form onSubmit={absenden} className="mt-6 space-y-5">
      <div>
        <span className="text-sm font-medium text-foreground">{t("referenzUpload.artDerReferenz")}</span>
        <div className="mt-1 grid grid-cols-2 gap-1 rounded-lg bg-background p-1 text-sm ring-1 ring-line sm:grid-cols-4">
          {TYP_OPTIONEN.map((option) => (
            <button
              key={option.typ}
              type="button"
              onClick={() => setTyp(option.typ)}
              className={`rounded-md py-1.5 font-semibold transition ${
                typ === option.typ ? "bg-accent text-accent-ink" : "text-foreground-soft"
              }`}
            >
              {option.icon} {t(option.labelSchluessel)}
            </button>
          ))}
        </div>
      </div>

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

      {typ === "video" && (
        <label className="block">
          <span className="text-sm font-medium text-foreground">{t("upload.videodatei")}</span>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => videoDateiAusgewaehlt(e.target.files?.[0] ?? null)}
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
      )}

      {typ === "foto" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-foreground">{t("referenzUpload.fotoVorher")}</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setVorherDatei(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-foreground-soft file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-accent-ink"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">{t("referenzUpload.fotoNachher")}</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNachherDatei(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-foreground-soft file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-accent-ink"
            />
          </label>
          <p className="text-xs text-foreground-soft sm:col-span-2">{t("referenzUpload.fotoHinweis")}</p>
        </div>
      )}

      {typ === "dokument" && (
        <label className="block">
          <span className="text-sm font-medium text-foreground">{t("referenzUpload.dokumentDatei")}</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setDokumentDatei(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm text-foreground-soft file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-accent-ink"
          />
          <span className="mt-1 block text-xs text-foreground-soft">{t("referenzUpload.dokumentHinweis")}</span>
        </label>
      )}

      {typ === "link" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-foreground">{t("referenzUpload.linkUrl")}</span>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-foreground">{t("referenzUpload.linkQuelle")}</span>
            <input
              value={linkQuelle}
              onChange={(e) => setLinkQuelle(e.target.value)}
              placeholder={t("referenzUpload.linkQuellePlatzhalter")}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </label>
        </div>
      )}

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

      {!zeigtZusatzfelder && (
        <p className="rounded-md bg-accent/10 px-3 py-2 text-sm text-accent-deep">{t("upload.zusatzfelderHinweis")}</p>
      )}

      {zeigtZusatzfelder && (
        <div className="rounded-xl bg-surface p-4 ring-1 ring-line">
          <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">
            {t("upload.zusatzangaben", { hersteller: ausgewaehlterHersteller?.name ?? "" })}
          </h2>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-foreground">{t("upload.material")}</span>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">{t("upload.bitteWaehlen")}</option>
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
                  placeholder={t("upload.materialSonstigesPlatzhalter")}
                  className="mt-2 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
                />
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-foreground">{t("upload.foerderbandbreite")}</span>
              <select
                value={foerderbandbreite}
                onChange={(e) => setFoerderbandbreite(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">{t("upload.bitteWaehlen")}</option>
                {FOERDERBANDBREITE_OPTIONEN.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-foreground">
                {t("upload.geschwindigkeit")}: <span className="font-mono text-blueprint">{geschwindigkeit.toFixed(1)} m/s</span>
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
              <span className="text-sm font-medium text-foreground">{t("upload.beltConnection")}</span>
              <select
                value={beltConnection}
                onChange={(e) => setBeltConnection(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">{t("upload.bitteWaehlen")}</option>
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
                  placeholder={t("upload.mechanicalSplicePlatzhalter")}
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
              <span className="text-sm font-medium text-foreground">{t("upload.runbackReversible")}</span>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-foreground">{t("upload.land")}</span>
              <input
                value={land}
                onChange={(e) => setLand(e.target.value)}
                placeholder={t("upload.landPlatzhalter")}
                className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-foreground">{t("upload.andereBesonderheiten")}</span>
              <input
                value={besonderheiten}
                onChange={(e) => setBesonderheiten(e.target.value)}
                placeholder={t("upload.besonderheitenPlatzhalter")}
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
        {laedt ? fortschritt ?? t("upload.wirdHochgeladen") : t("referenzUpload.einreichenButton")}
      </button>
    </form>
  );
}

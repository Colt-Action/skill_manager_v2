"use client";

import { useMemo, useState } from "react";
import { referenzAktualisieren, referenzFreigeben } from "@/lib/actions/referenzen";
import KategorieKaskade, { type KategoriePfad } from "@/components/KategorieKaskade";
import { useSprache } from "@/components/SprachProvider";
import type { Kategorie, ReferenzMitDetails, Teil } from "@/lib/supabase/types";

const ALLE = "";

function einzeln<T>(wert: T | T[] | null | undefined): T | null {
  if (!wert) return null;
  return Array.isArray(wert) ? (wert[0] ?? null) : wert;
}

const TYP_ICON: Record<string, string> = { video: "🎥", foto: "📷", dokument: "📄", link: "🔗" };

function ReferenzVorschau({ referenz }: { referenz: ReferenzMitDetails }) {
  if (referenz.typ === "video") {
    const inhalt = einzeln(referenz.referenz_video);
    if (!inhalt) return null;
    return <video src={inhalt.datei_url} controls className="aspect-video w-56 rounded-lg bg-nav" />;
  }
  if (referenz.typ === "foto") {
    const inhalt = einzeln(referenz.referenz_foto);
    if (!inhalt) return null;
    return (
      <div className="flex gap-2">
        {inhalt.vorher_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={inhalt.vorher_url} alt="Vorher" className="h-28 w-28 rounded-lg object-cover ring-1 ring-line" />
        )}
        {inhalt.nachher_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={inhalt.nachher_url} alt="Nachher" className="h-28 w-28 rounded-lg object-cover ring-1 ring-line" />
        )}
      </div>
    );
  }
  if (referenz.typ === "dokument") {
    const inhalt = einzeln(referenz.referenz_dokument);
    if (!inhalt) return null;
    return (
      <a
        href={inhalt.datei_url}
        target="_blank"
        rel="noreferrer"
        className="flex h-28 w-56 flex-col items-center justify-center gap-1 rounded-lg bg-nav text-sm text-white ring-1 ring-line"
      >
        <span className="text-2xl">📄</span>
        <span className="px-2 text-center text-xs">{inhalt.dateiname}</span>
      </a>
    );
  }
  const inhalt = einzeln(referenz.referenz_link);
  if (!inhalt) return null;
  return (
    <a
      href={inhalt.url}
      target="_blank"
      rel="noreferrer"
      className="flex h-28 w-56 flex-col items-center justify-center gap-1 rounded-lg bg-nav text-sm text-white ring-1 ring-line"
    >
      <span className="text-2xl">🔗</span>
      <span className="px-2 text-center text-xs">{inhalt.quelle ?? inhalt.url}</span>
    </a>
  );
}

export default function AdminReferenzEditor({
  referenz,
  kategorien,
  teile,
}: {
  referenz: ReferenzMitDetails;
  kategorien: Kategorie[];
  teile: Teil[];
}) {
  const { t } = useSprache();
  const startKategorieId = referenz.kategorie_id ?? referenz.teile?.kategorie_id ?? null;
  const [pfad, setPfad] = useState<KategoriePfad>({
    industrieId: null,
    herstellerId: null,
    produktId: null,
    kategorieId: null,
    unterkategorieId: startKategorieId,
  });
  const [teilId, setTeilId] = useState(referenz.teil_id ?? ALLE);
  const [beschreibung, setBeschreibung] = useState(referenz.beschreibung);
  const [tagsText, setTagsText] = useState(
    referenz.referenz_tags.map(({ tags }) => tags.name).join(", "),
  );
  const [speichert, setSpeichert] = useState(false);
  const [gibtFrei, setGibtFrei] = useState(false);
  const [nachricht, setNachricht] = useState<string | null>(null);
  const [freigegeben, setFreigegeben] = useState(false);

  const sichtbareTeile = useMemo(
    () => (pfad.unterkategorieId ? teile.filter((t) => t.kategorie_id === pfad.unterkategorieId) : []),
    [teile, pfad.unterkategorieId],
  );

  function pfadGeaendert(neuerPfad: KategoriePfad) {
    setPfad(neuerPfad);
    setTeilId(ALLE);
  }

  async function speichern() {
    setSpeichert(true);
    setNachricht(null);
    const ergebnis = await referenzAktualisieren({
      id: referenz.id,
      teilId: teilId || null,
      kategorieId:
        pfad.unterkategorieId ?? pfad.kategorieId ?? pfad.produktId ?? pfad.herstellerId ?? pfad.industrieId ?? null,
      beschreibung,
      tagNamen: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setSpeichert(false);
    setNachricht(ergebnis.erfolg ? t("adminVideoEditor.gespeichert") : ergebnis.fehler ?? t("profil.fehlerStandard"));
  }

  async function freigeben() {
    setGibtFrei(true);
    const ergebnis = await referenzFreigeben(referenz.id);
    setGibtFrei(false);
    if (ergebnis.erfolg) {
      setFreigegeben(true);
    } else {
      setNachricht(ergebnis.fehler ?? t("adminVideoEditor.fehlerFreigeben"));
    }
  }

  if (freigegeben) {
    return (
      <div className="rounded-xl bg-surface p-5 ring-1 ring-line">
        <p className="text-sm text-foreground-soft">
          {t("adminReferenzEditor.freigegebenHinweis", { titel: referenz.titel })}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-surface p-5 ring-1 ring-line">
      <div className="flex flex-wrap items-start gap-4">
        <ReferenzVorschau referenz={referenz} />
        <div className="min-w-[240px] flex-1">
          <h2 className="font-medium text-foreground">
            {TYP_ICON[referenz.typ]} {referenz.titel}
          </h2>
          <p className="font-mono text-xs text-foreground-soft">
            {t("adminVideoEditor.hochgeladenAm", { datum: new Date(referenz.erstellt_am).toLocaleDateString("de-DE") })}
          </p>

          <div className="mt-3">
            <KategorieKaskade kategorien={kategorien} startPfad={startKategorieId} onAendern={pfadGeaendert} />
          </div>

          <label className="mt-3 block">
            <span className="font-mono text-xs uppercase tracking-wide text-foreground-soft">{t("videothek.teil")}</span>
            <select
              value={teilId}
              onChange={(e) => setTeilId(e.target.value)}
              disabled={!pfad.unterkategorieId}
              className="mt-1 w-full rounded-lg border border-line bg-background px-2 py-1.5 text-sm text-foreground disabled:bg-background disabled:text-foreground-soft"
            >
              <option value={ALLE}>–</option>
              {sichtbareTeile.map((teil) => (
                <option key={teil.id} value={teil.id}>
                  {teil.name} · {teil.teilenummer}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-3 block">
            <span className="font-mono text-xs uppercase tracking-wide text-foreground-soft">{t("adminVideoEditor.tagsLabel")}</span>
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-background px-2 py-1.5 text-sm text-foreground"
              placeholder={t("adminVideoEditor.tagsPlatzhalter")}
            />
          </label>

          <label className="mt-3 block">
            <span className="font-mono text-xs uppercase tracking-wide text-foreground-soft">
              {t("adminReferenzEditor.beschreibungLabel")}
            </span>
            <textarea
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-line bg-background px-2 py-1.5 text-sm text-foreground"
            />
          </label>

          {nachricht && <p className="mt-2 text-xs text-foreground-soft">{nachricht}</p>}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={speichern}
              disabled={speichert}
              className="rounded-lg border border-line px-3 py-1.5 text-sm text-foreground hover:bg-background disabled:opacity-50"
            >
              {speichert ? t("profil.speichertLaeuft") : t("adminVideoEditor.speichernButton")}
            </button>
            {referenz.status !== "veroeffentlicht" && (
              <button
                type="button"
                onClick={freigeben}
                disabled={gibtFrei}
                className="rounded-lg bg-success px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {gibtFrei ? t("adminVideoEditor.gibtFreiLaeuft") : t("adminVideoEditor.freigebenButton")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

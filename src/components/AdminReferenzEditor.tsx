"use client";

import { useMemo, useState } from "react";
import { referenzAktualisieren, referenzFreigeben } from "@/lib/actions/referenzen";
import KategorieKaskade, { type KategoriePfad } from "@/components/KategorieKaskade";
import GeschwindigkeitRegler from "@/components/GeschwindigkeitRegler";
import { useSprache } from "@/components/SprachProvider";
import Icon, { type IconName } from "@/components/icons/Icon";
import {
  ABSTREIFSEGMENT_OPTIONEN,
  BELT_CONNECTION_OPTIONEN,
  FOERDERBANDBREITE_OPTIONEN,
  MATERIAL_OPTIONEN,
  UMMANTELUNG_OPTIONEN,
  VERLAGERUNG_OPTIONEN,
} from "@/lib/referenzvideoOptionen";
import { felderFuerKategorie } from "@/lib/produktFelder";
import { tiefsteKategorieId } from "@/lib/kategorieBaum";
import { istStartHersteller } from "@/lib/produktAuswahl";
import { PRODUKTAUSWAHL_STARTPFAD } from "@/lib/werksbesichtigungOptionen";
import { linkPruefen } from "@/lib/linkPruefen";
import { GURTZUSTAND_OPTIONEN, GURTZUSTAND_SCHLUESSEL } from "@/lib/werksbesichtigungOptionen";
import type { Kategorie, ReferenzMitDetails, Teil } from "@/lib/supabase/types";

const ALLE = "";

// Auswahlfeld "Teil" im Bearbeiten-Formular (Detailseite) vorerst
// ausgeblendet - auf true setzen, um es wieder einzublenden. Solange es
// ausgeblendet ist, bleibt das gespeicherte Teil beim Speichern unverändert.
const REFERENZ_TEIL_SICHTBAR = false;

function einzeln<T>(wert: T | T[] | null | undefined): T | null {
  if (!wert) return null;
  return Array.isArray(wert) ? (wert[0] ?? null) : wert;
}

const TYP_ICON: Record<string, IconName> = { video: "video", foto: "foto", dokument: "dokument", link: "link" };
const TYP_SCHLUESSEL: Record<string, string> = {
  video: "referenzUpload.typVideo",
  foto: "referenzUpload.typFoto",
  dokument: "referenzUpload.typDokument",
  link: "referenzUpload.typLink",
};

function ReferenzVorschau({ referenz }: { referenz: ReferenzMitDetails }) {
  if (referenz.typ === "video") {
    const inhalt = einzeln(referenz.referenz_video);
    if (!inhalt) return null;
    return <video src={inhalt.datei_url} controls className="aspect-video w-56 border border-rule bg-plate" />;
  }
  if (referenz.typ === "foto") {
    const inhalt = einzeln(referenz.referenz_foto);
    if (!inhalt) return null;
    return (
      <div className="flex gap-2">
        {inhalt.vorher_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={inhalt.vorher_url} alt="Vorher" className="h-28 w-28 border border-rule object-cover" />
        )}
        {inhalt.nachher_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={inhalt.nachher_url} alt="Nachher" className="h-28 w-28 border border-rule object-cover" />
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
        className="flex h-28 w-56 flex-col items-center justify-center gap-1 border border-rule bg-plate text-sm text-plate-ink"
      >
        <Icon name="dokument" size={24} />
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
      className="flex h-28 w-56 flex-col items-center justify-center gap-1 border border-rule bg-plate text-sm text-plate-ink"
    >
      <Icon name="link" size={24} />
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
  const [titel, setTitel] = useState(referenz.titel);
  const [teilId, setTeilId] = useState(referenz.teil_id ?? ALLE);
  const [beschreibung, setBeschreibung] = useState(referenz.beschreibung);

  const startMetadaten = einzeln(referenz.referenz_metadaten);
  const [material, setMaterial] = useState(startMetadaten?.material ?? "");
  const [materialSonstiges, setMaterialSonstiges] = useState(startMetadaten?.material_sonstiges ?? "");
  // Ein gespeicherter Wert 0 stammt aus der Zeit, als der Regler bei 0
  // startete, und gilt als "nicht angegeben" (wird beim Speichern zu null).
  const [geschwindigkeit, setGeschwindigkeit] = useState<number | null>(startMetadaten?.geschwindigkeit_ms || null);
  const [foerderbandbreite, setFoerderbandbreite] = useState(startMetadaten?.foerderbandbreite ?? "");
  const [beltConnection, setBeltConnection] = useState(startMetadaten?.belt_connection ?? "");
  const [mechanicalSpliceTyp, setMechanicalSpliceTyp] = useState(startMetadaten?.mechanical_splice_typ ?? "");
  const [runbackReversible, setRunbackReversible] = useState(startMetadaten?.runback_reversible ?? false);
  const [land, setLand] = useState(startMetadaten?.land ?? "");
  const [besonderheiten, setBesonderheiten] = useState(startMetadaten?.besonderheiten ?? "");
  const [abstreifsegment, setAbstreifsegment] = useState(startMetadaten?.abstreifsegment ?? "");
  const [verlagerung, setVerlagerung] = useState(startMetadaten?.verlagerung ?? "");
  const [gurtzustand, setGurtzustand] = useState(startMetadaten?.gurtzustand ?? "");
  const [ummantelung, setUmmantelung] = useState(startMetadaten?.ummantelung ?? "");
  const [hoschirisLink, setHoschirisLink] = useState(startMetadaten?.hoschiris_data_url ?? "");
  // "Verknüpfung HOSCHiris DATA" nur bei Hersteller HOSCH (gleicher Startpfad
  // wie die Werksbesichtigung). Sonst ausgeblendet; der gespeicherte Link bleibt.
  const istHosch = istStartHersteller(kategorien, PRODUKTAUSWAHL_STARTPFAD, pfad.herstellerId);

  // Zum gewählten Produkt geltende Felder (lib/produktFelder.ts). Ausgeblendete
  // Felder behalten ihren gespeicherten Wert und werden unverändert gespeichert.
  const produktFelder = felderFuerKategorie(kategorien, tiefsteKategorieId(pfad));

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
    if (REFERENZ_TEIL_SICHTBAR) setTeilId(ALLE);
  }

  async function speichern() {
    if (istHosch && !linkPruefen(hoschirisLink).ok) {
      setNachricht(t("referenzbereich.hoschirisUngueltig"));
      return;
    }
    setSpeichert(true);
    setNachricht(null);
    const ergebnis = await referenzAktualisieren({
      id: referenz.id,
      titel,
      // Ausgeblendetes Teil-Feld: das gespeicherte Teil bleibt unverändert.
      teilId: REFERENZ_TEIL_SICHTBAR ? teilId || null : referenz.teil_id,
      kategorieId:
        pfad.unterkategorieId ?? pfad.kategorieId ?? pfad.produktId ?? pfad.herstellerId ?? pfad.industrieId ?? null,
      beschreibung,
      // Keine Tags übergeben: das Feld ist entfallen, vorhandene Tags bleiben.
      metadaten: {
        material,
        materialSonstiges,
        geschwindigkeitMs: geschwindigkeit,
        foerderbandbreite,
        beltConnection,
        mechanicalSpliceTyp,
        runbackReversible,
        land,
        besonderheiten,
        abstreifsegment,
        verlagerung,
        gurtzustand,
        ummantelung,
        // Nur bei HOSCH übergeben - sonst bleibt der gespeicherte Link unverändert.
        hoschirisDataUrl: istHosch ? hoschirisLink : undefined,
      },
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
      <div className="border border-rule bg-paper p-5">
        <p className="text-sm text-ink-soft">
          {t("adminReferenzEditor.freigegebenHinweis", { titel: referenz.titel })}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-rule bg-paper p-5">
      <div className="flex flex-wrap items-start gap-4">
        <ReferenzVorschau referenz={referenz} />
        <div className="min-w-[240px] flex-1">
          <p className="font-mono text-xs text-ink-soft">
            {t("adminVideoEditor.hochgeladenAm", { datum: new Date(referenz.erstellt_am).toLocaleDateString("de-DE") })}
          </p>

          <label className="mt-2 block">
            <span className="font-mono text-xs uppercase tracking-wide text-ink-soft">{t("adminVideoEditor.titelLabel")}</span>
            <input
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              className="mt-1 w-full rounded-[2px] border border-rule bg-paper px-2 py-1.5 text-sm font-medium text-ink"
            />
          </label>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
            <Icon name={TYP_ICON[referenz.typ]} size={13} /> {t(TYP_SCHLUESSEL[referenz.typ])}
          </p>

          <div className="mt-3">
            <KategorieKaskade kategorien={kategorien} startPfad={startKategorieId} onAendern={pfadGeaendert} />
          </div>

          {REFERENZ_TEIL_SICHTBAR && (
            <label className="mt-3 block">
              <span className="font-mono text-xs uppercase tracking-wide text-ink-soft">{t("videothek.teil")}</span>
              <select
                value={teilId}
                onChange={(e) => setTeilId(e.target.value)}
                disabled={!pfad.unterkategorieId}
                className="mt-1 w-full rounded-[2px] border border-rule bg-paper px-2 py-1.5 text-sm text-ink disabled:bg-paper disabled:text-ink-soft"
              >
                <option value={ALLE}>–</option>
                {sichtbareTeile.map((teil) => (
                  <option key={teil.id} value={teil.id}>
                    {teil.name} · {teil.teilenummer}
                  </option>
                ))}
              </select>
            </label>
          )}

          {istHosch && (
            <label className="mt-3 block">
              <span className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                {t("referenzbereich.hoschirisLabel")}
              </span>
              <input
                type="url"
                inputMode="url"
                value={hoschirisLink}
                onChange={(e) => setHoschirisLink(e.target.value)}
                placeholder="https://"
                className="mt-1 w-full rounded-[2px] border border-rule bg-paper px-2 py-1.5 text-sm text-ink"
              />
            </label>
          )}

          <label className="mt-3 block">
            <span className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              {t("adminReferenzEditor.beschreibungLabel")}
            </span>
            <textarea
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-[2px] border border-rule bg-paper px-2 py-1.5 text-sm text-ink"
            />
          </label>

          <div className="mt-4 rounded-[2px] bg-paper p-3">
            <h3 className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              {t("adminReferenzEditor.zusatzangabenTitel")}
            </h3>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-ink">{t("upload.material")}</span>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="mt-1 w-full rounded-[2px] border border-rule bg-paper px-2 py-1.5 text-sm text-ink"
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
                    className="mt-2 w-full rounded-[2px] border border-rule bg-paper px-2 py-1.5 text-sm text-ink"
                  />
                )}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ink">{t("upload.foerderbandbreite")}</span>
                <select
                  value={foerderbandbreite}
                  onChange={(e) => setFoerderbandbreite(e.target.value)}
                  className="mt-1 w-full rounded-[2px] border border-rule bg-paper px-2 py-1.5 text-sm text-ink"
                >
                  <option value="">{t("upload.bitteWaehlen")}</option>
                  {FOERDERBANDBREITE_OPTIONEN.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>

              <div className="block sm:col-span-2">
                <span className="text-sm font-medium text-ink">{t("upload.geschwindigkeit")}</span>
                <div className="mt-2">
                  <GeschwindigkeitRegler
                    wert={geschwindigkeit}
                    onAendern={setGeschwindigkeit}
                    label={t("upload.geschwindigkeit")}
                  />
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-ink">{t("foerderband.gurtzustand")}</span>
                <select
                  value={gurtzustand}
                  onChange={(e) => setGurtzustand(e.target.value)}
                  className="mt-1 w-full rounded-[2px] border border-rule bg-paper px-2 py-1.5 text-sm text-ink"
                >
                  <option value="">{t("upload.bitteWaehlen")}</option>
                  {GURTZUSTAND_OPTIONEN.map((g) => (
                    <option key={g} value={g}>
                      {t(GURTZUSTAND_SCHLUESSEL[g])}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ink">{t("upload.beltConnection")}</span>
                <select
                  value={beltConnection}
                  onChange={(e) => setBeltConnection(e.target.value)}
                  className="mt-1 w-full rounded-[2px] border border-rule bg-paper px-2 py-1.5 text-sm text-ink"
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
                    className="mt-2 w-full rounded-[2px] border border-rule bg-paper px-2 py-1.5 text-sm text-ink"
                  />
                )}
              </label>

              <label className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  checked={runbackReversible}
                  onChange={(e) => setRunbackReversible(e.target.checked)}
                  className="h-4 w-4 accent-signal"
                />
                <span className="text-sm font-medium text-ink">{t("upload.runbackReversible")}</span>
              </label>

              {produktFelder.includes("abstreifsegment") && (
                <label className="block">
                  <span className="text-sm font-medium text-ink">{t("upload.abstreifsegment")}</span>
                  <select
                    value={abstreifsegment}
                    onChange={(e) => setAbstreifsegment(e.target.value)}
                    className="mt-1 w-full rounded-[2px] border border-rule bg-paper px-2 py-1.5 text-sm text-ink"
                  >
                    <option value="">{t("upload.bitteWaehlen")}</option>
                    {ABSTREIFSEGMENT_OPTIONEN.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {produktFelder.includes("verlagerung") && (
                <label className="block">
                  <span className="text-sm font-medium text-ink">{t("upload.verlagerung")}</span>
                  <select
                    value={verlagerung}
                    onChange={(e) => setVerlagerung(e.target.value)}
                    className="mt-1 w-full rounded-[2px] border border-rule bg-paper px-2 py-1.5 text-sm text-ink"
                  >
                    <option value="">{t("upload.bitteWaehlen")}</option>
                    {VERLAGERUNG_OPTIONEN.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {produktFelder.includes("ummantelung") && (
                <label className="block">
                  <span className="text-sm font-medium text-ink">{t("upload.ummantelung")}</span>
                  <select
                    value={ummantelung}
                    onChange={(e) => setUmmantelung(e.target.value)}
                    className="mt-1 w-full rounded-[2px] border border-rule bg-paper px-2 py-1.5 text-sm text-ink"
                  >
                    <option value="">{t("upload.bitteWaehlen")}</option>
                    {UMMANTELUNG_OPTIONEN.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="block">
                <span className="text-sm font-medium text-ink">{t("upload.land")}</span>
                <input
                  value={land}
                  onChange={(e) => setLand(e.target.value)}
                  placeholder={t("upload.landPlatzhalter")}
                  className="mt-1 w-full rounded-[2px] border border-rule bg-paper px-2 py-1.5 text-sm text-ink"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-ink">{t("upload.andereBesonderheiten")}</span>
                <input
                  value={besonderheiten}
                  onChange={(e) => setBesonderheiten(e.target.value)}
                  placeholder={t("upload.besonderheitenPlatzhalter")}
                  className="mt-1 w-full rounded-[2px] border border-rule bg-paper px-2 py-1.5 text-sm text-ink"
                />
              </label>
            </div>
          </div>

          {nachricht && <p className="mt-2 text-xs text-ink-soft">{nachricht}</p>}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={speichern}
              disabled={speichert}
              className="rounded-[2px] border border-rule px-3 py-1.5 text-sm text-ink hover:bg-paper-2 disabled:opacity-50"
            >
              {speichert ? t("profil.speichertLaeuft") : t("adminVideoEditor.speichernButton")}
            </button>
            {referenz.status !== "veroeffentlicht" && (
              <button
                type="button"
                onClick={freigeben}
                disabled={gibtFrei}
                className="rounded-[2px] bg-success px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
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

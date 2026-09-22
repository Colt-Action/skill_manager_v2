"use client";

import { useMemo, useState } from "react";
import ReferenzCard from "@/components/ReferenzCard";
import EmptyState from "@/components/EmptyState";
import KategorieKaskade, { type KategoriePfad } from "@/components/KategorieKaskade";
import Icon, { type IconName } from "@/components/icons/Icon";
import AnsichtUmschalter, { type Ansicht } from "@/components/AnsichtUmschalter";
import Index, { type IndexZeile } from "@/components/Index";
import { DatenblattZeile, eingabeKlasse } from "@/components/Datenblatt";
import { useSprache } from "@/components/SprachProvider";
import { pfadZuKategorie, teilAnzeigenamen } from "@/lib/kategorieBaum";
import {
  ABSTREIFSEGMENT_OPTIONEN,
  BELT_CONNECTION_OPTIONEN,
  FOERDERBANDBREITE_OPTIONEN,
  GESCHWINDIGKEIT_MAX,
  GESCHWINDIGKEIT_MIN,
  GESCHWINDIGKEIT_SCHRITT,
  MATERIAL_OPTIONEN,
  VERLAGERUNG_OPTIONEN,
} from "@/lib/referenzvideoOptionen";
import type { Kategorie, ReferenzMetadaten, ReferenzMitDetails, ReferenzTyp, Teil } from "@/lib/supabase/types";

const ALLE = "";
const GESCHWINDIGKEIT_TOLERANZ = 1.5;

const TYP_OPTIONEN: { typ: ReferenzTyp; icon: IconName; labelSchluessel: string }[] = [
  { typ: "video", icon: "video", labelSchluessel: "referenzUpload.typVideo" },
  { typ: "foto", icon: "foto", labelSchluessel: "referenzUpload.typFoto" },
  { typ: "dokument", icon: "dokument", labelSchluessel: "referenzUpload.typDokument" },
  { typ: "link", icon: "link", labelSchluessel: "referenzUpload.typLink" },
];

function metadaten(referenz: ReferenzMitDetails): ReferenzMetadaten | null {
  const d = referenz.referenz_metadaten;
  if (!d) return null;
  return Array.isArray(d) ? (d[0] ?? null) : d;
}

// Baut den gesamten durchsuchbaren Text einer Referenz zusammen: Titel,
// Beschreibung, kompletter Kategorie-Pfad (Industrie/Hersteller/Produkt/
// Kategorie/Unterkategorie), Teil, Tags, alle Sachfelder (Material,
// Bandbreite, Land, Besonderheiten, ...) und - bei Dokumenten - der
// erkannte Volltext. So findet z.B. "Hauptabstreifer" oder "Kohle" auch
// dann etwas, wenn dieses Wort nicht wörtlich im Titel steht.
function suchbarerText(referenz: ReferenzMitDetails, kategorien: Kategorie[]): string {
  const dokument = Array.isArray(referenz.referenz_dokument)
    ? (referenz.referenz_dokument[0] ?? null)
    : referenz.referenz_dokument ?? null;
  const d = metadaten(referenz);

  const eigeneKategorieId = referenz.kategorie_id ?? referenz.teile?.kategorie_id ?? null;
  const kategorieNamen = pfadZuKategorie(kategorien, eigeneKategorieId)
    .map((id) => kategorien.find((k) => k.id === id)?.name ?? "")
    .filter(Boolean);

  const teile = [
    referenz.titel,
    referenz.beschreibung,
    ...kategorieNamen,
    referenz.teile?.name ?? "",
    referenz.teile?.teilenummer ?? "",
    ...referenz.referenz_tags.flatMap(({ tags }) => [tags.name, ...tags.synonyme]),
    d?.material ?? "",
    d?.material_sonstiges ?? "",
    d?.foerderbandbreite ?? "",
    d?.belt_connection ?? "",
    d?.land ?? "",
    d?.besonderheiten ?? "",
    dokument?.volltext ?? "",
  ];

  return teile.join(" ").toLowerCase();
}

// Alle eingegebenen Wörter müssen irgendwo im durchsuchbaren Text
// vorkommen (UND-Verknüpfung), z.B. "Hauptabstreifer B6 Kohle" findet nur
// Referenzen, bei denen alle drei Begriffe zutreffen.
function suchtextPasst(suchbar: string, suchtext: string): boolean {
  const woerter = suchtext.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return woerter.every((wort) => suchbar.includes(wort));
}

export default function ReferenzBereich({
  referenzen,
  kategorien,
  teile,
  aktuellerNutzerId,
  gemerkteIds = [],
}: {
  referenzen: ReferenzMitDetails[];
  kategorien: Kategorie[];
  teile: Teil[];
  aktuellerNutzerId?: string | null;
  gemerkteIds?: string[];
}) {
  const { t } = useSprache();
  const gemerkteIdSet = useMemo(() => new Set(gemerkteIds), [gemerkteIds]);
  const [typen, setTypen] = useState<Set<ReferenzTyp>>(new Set(["video"]));
  const [suchtext, setSuchtext] = useState("");
  const [pfad, setPfad] = useState<KategoriePfad>({
    industrieId: null,
    herstellerId: null,
    produktId: null,
    kategorieId: null,
    unterkategorieId: null,
  });
  const [teilId, setTeilId] = useState(ALLE);
  const [material, setMaterial] = useState(ALLE);
  const [foerderbandbreite, setFoerderbandbreite] = useState(ALLE);
  const [beltConnection, setBeltConnection] = useState(ALLE);
  const [runbackReversible, setRunbackReversible] = useState(ALLE);
  const [geschwindigkeit, setGeschwindigkeit] = useState<number | null>(null);
  const [land, setLand] = useState("");
  const [besonderheiten, setBesonderheiten] = useState("");
  const [abstreifsegment, setAbstreifsegment] = useState(ALLE);
  const [verlagerung, setVerlagerung] = useState(ALLE);
  const [ansicht, setAnsicht] = useState<Ansicht>("karten");

  const ausgewaehlterHersteller = useMemo(
    () => kategorien.find((k) => k.id === pfad.herstellerId) ?? null,
    [kategorien, pfad.herstellerId],
  );
  // Solange kein Hersteller ausgewählt ist, werden die Zusatzfilter trotzdem
  // angezeigt - sie werden nur ausgeblendet, wenn aktiv ein Hersteller ohne
  // diese Felder gewählt wird (siehe Fix in Phase 16).
  const zeigeZusatzfilter = pfad.herstellerId
    ? (ausgewaehlterHersteller?.zeigt_referenz_zusatzfelder ?? false)
    : true;

  const sichtbareTeile = useMemo(
    () => (pfad.unterkategorieId ? teile.filter((tl) => tl.kategorie_id === pfad.unterkategorieId) : teile),
    [teile, pfad.unterkategorieId],
  );
  const teilNamen = useMemo(() => teilAnzeigenamen(sichtbareTeile, kategorien), [sichtbareTeile, kategorien]);

  function pfadGeaendert(neuerPfad: KategoriePfad) {
    setPfad(neuerPfad);
    setTeilId(ALLE);
  }

  function typUmschalten(typ: ReferenzTyp) {
    setTypen((vorherig) => {
      const neu = new Set(vorherig);
      if (neu.has(typ)) neu.delete(typ);
      else neu.add(typ);
      return neu;
    });
  }

  type Zusatzfilter = {
    material: string;
    foerderbandbreite: string;
    beltConnection: string;
    runbackReversible: string;
    geschwindigkeit: number | null;
    land: string;
    besonderheiten: string;
    abstreifsegment: string;
    verlagerung: string;
  };

  const aktuelleZusatzfilter: Zusatzfilter = {
    material,
    foerderbandbreite,
    beltConnection,
    runbackReversible,
    geschwindigkeit,
    land,
    besonderheiten,
    abstreifsegment,
    verlagerung,
  };

  function passtReferenz(referenz: ReferenzMitDetails, zf: Zusatzfilter): boolean {
    if (!typen.has(referenz.typ)) return false;
    if (teilId !== ALLE && referenz.teil_id !== teilId) return false;

    const gewuenscht = [pfad.industrieId, pfad.herstellerId, pfad.produktId, pfad.kategorieId, pfad.unterkategorieId];
    if (teilId === ALLE && gewuenscht.some(Boolean)) {
      const eigeneKategorieId = referenz.kategorie_id ?? referenz.teile?.kategorie_id ?? null;
      const kette = pfadZuKategorie(kategorien, eigeneKategorieId);
      for (let i = 0; i < gewuenscht.length; i++) {
        if (gewuenscht[i] && kette[i] !== gewuenscht[i]) return false;
      }
    }

    if (suchtext.trim() && !suchtextPasst(suchbarerText(referenz, kategorien), suchtext)) return false;

    if (!zeigeZusatzfilter) return true;
    const d = metadaten(referenz);

    if (zf.material && d?.material !== zf.material) return false;
    if (zf.foerderbandbreite && d?.foerderbandbreite !== zf.foerderbandbreite) return false;
    if (zf.beltConnection && d?.belt_connection !== zf.beltConnection) return false;
    if (zf.abstreifsegment && d?.abstreifsegment !== zf.abstreifsegment) return false;
    if (zf.verlagerung && d?.verlagerung !== zf.verlagerung) return false;
    if (zf.runbackReversible === "ja" && d?.runback_reversible !== true) return false;
    if (zf.runbackReversible === "nein" && d?.runback_reversible !== false) return false;
    if (
      zf.geschwindigkeit !== null &&
      (d?.geschwindigkeit_ms == null || Math.abs(d.geschwindigkeit_ms - zf.geschwindigkeit) > GESCHWINDIGKEIT_TOLERANZ)
    )
      return false;
    if (zf.land.trim() && !d?.land?.toLowerCase().includes(zf.land.trim().toLowerCase())) return false;
    if (
      zf.besonderheiten.trim() &&
      !d?.besonderheiten?.toLowerCase().includes(zf.besonderheiten.trim().toLowerCase())
    )
      return false;

    return true;
  }

  const gefiltert = useMemo(() => {
    return referenzen.filter((referenz) => passtReferenz(referenz, aktuelleZusatzfilter));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    referenzen,
    typen,
    pfad,
    teilId,
    kategorien,
    suchtext,
    zeigeZusatzfilter,
    material,
    foerderbandbreite,
    beltConnection,
    runbackReversible,
    geschwindigkeit,
    land,
    besonderheiten,
    abstreifsegment,
    verlagerung,
  ]);

  const naheTreffer = useMemo(() => {
    if (gefiltert.length > 0 || !zeigeZusatzfilter) return [];
    const vorschlaege: { feld: string; wert: string }[] = [];

    if (foerderbandbreite) {
      for (const wert of FOERDERBANDBREITE_OPTIONEN) {
        if (wert === foerderbandbreite) continue;
        if (referenzen.some((r) => passtReferenz(r, { ...aktuelleZusatzfilter, foerderbandbreite: wert }))) {
          vorschlaege.push({ feld: t("referenzvideos.foerderbandbreite"), wert });
          break;
        }
      }
    }
    if (material) {
      for (const wert of MATERIAL_OPTIONEN) {
        if (wert === material) continue;
        if (referenzen.some((r) => passtReferenz(r, { ...aktuelleZusatzfilter, material: wert }))) {
          vorschlaege.push({ feld: t("referenzvideos.material"), wert });
          break;
        }
      }
    }
    if (beltConnection) {
      for (const wert of BELT_CONNECTION_OPTIONEN) {
        if (wert === beltConnection) continue;
        if (referenzen.some((r) => passtReferenz(r, { ...aktuelleZusatzfilter, beltConnection: wert }))) {
          vorschlaege.push({ feld: t("referenzvideos.beltConnection"), wert });
          break;
        }
      }
    }
    if (runbackReversible) {
      const alt = runbackReversible === "ja" ? "nein" : "ja";
      if (referenzen.some((r) => passtReferenz(r, { ...aktuelleZusatzfilter, runbackReversible: alt }))) {
        vorschlaege.push({ feld: t("referenzvideos.runbackReversible"), wert: t(`referenzvideos.${alt}`) });
      }
    }
    if (abstreifsegment) {
      for (const wert of ABSTREIFSEGMENT_OPTIONEN) {
        if (wert === abstreifsegment) continue;
        if (referenzen.some((r) => passtReferenz(r, { ...aktuelleZusatzfilter, abstreifsegment: wert }))) {
          vorschlaege.push({ feld: t("referenzvideos.abstreifsegment"), wert });
          break;
        }
      }
    }
    if (verlagerung) {
      for (const wert of VERLAGERUNG_OPTIONEN) {
        if (wert === verlagerung) continue;
        if (referenzen.some((r) => passtReferenz(r, { ...aktuelleZusatzfilter, verlagerung: wert }))) {
          vorschlaege.push({ feld: t("referenzvideos.verlagerung"), wert });
          break;
        }
      }
    }
    if (geschwindigkeit !== null) {
      for (let schritt = GESCHWINDIGKEIT_SCHRITT; schritt <= GESCHWINDIGKEIT_MAX; schritt += GESCHWINDIGKEIT_SCHRITT) {
        const kandidaten = [geschwindigkeit + schritt, geschwindigkeit - schritt].filter(
          (w) => w >= GESCHWINDIGKEIT_MIN && w <= GESCHWINDIGKEIT_MAX,
        );
        const treffer = kandidaten.find((w) =>
          referenzen.some((r) => passtReferenz(r, { ...aktuelleZusatzfilter, geschwindigkeit: w })),
        );
        if (treffer !== undefined) {
          vorschlaege.push({ feld: t("referenzvideos.geschwindigkeit"), wert: `${treffer.toFixed(1)} m/s` });
          break;
        }
      }
    }
    if (land.trim()) {
      const alternativen = new Set(
        referenzen.map((r) => metadaten(r)?.land).filter((l): l is string => Boolean(l && l.trim())),
      );
      for (const wert of alternativen) {
        if (referenzen.some((r) => passtReferenz(r, { ...aktuelleZusatzfilter, land: wert }))) {
          vorschlaege.push({ feld: t("referenzvideos.land"), wert });
          break;
        }
      }
    }

    return vorschlaege;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gefiltert.length, zeigeZusatzfilter, referenzen, typen, pfad, teilId, suchtext, material, foerderbandbreite, beltConnection, runbackReversible, geschwindigkeit, land, besonderheiten, abstreifsegment, verlagerung, t]);

  const indexZeilen: IndexZeile[] = gefiltert.map((referenz) => {
    const eigeneKategorieId = referenz.kategorie_id ?? referenz.teile?.kategorie_id ?? null;
    const kategorieName = pfadZuKategorie(kategorien, eigeneKategorieId)
      .slice(2)
      .map((id) => kategorien.find((k) => k.id === id)?.name)
      .filter((name): name is string => Boolean(name))
      .pop();
    return {
      id: referenz.id,
      href: `/referenzbereich/${referenz.id}`,
      nummer: referenz.teile?.teilenummer,
      titel: referenz.titel,
      kategorie: kategorieName,
      rechts: metadaten(referenz)?.material ?? undefined,
    };
  });

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[240px] flex-1 max-w-sm">
          <span className="font-mono text-xs uppercase tracking-wide text-ink-soft">{t("referenzbereich.suche")}</span>
          <input
            type="search"
            value={suchtext}
            onChange={(e) => setSuchtext(e.target.value)}
            placeholder={t("referenzbereich.suchePlatzhalter")}
            className={`mt-1 ${eingabeKlasse}`}
          />
        </label>

        <div>
          <span className="font-mono text-xs uppercase tracking-wide text-ink-soft">{t("referenzbereich.typen")}</span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {TYP_OPTIONEN.map((option) => (
              <button
                key={option.typ}
                type="button"
                onClick={() => typUmschalten(option.typ)}
                className={`flex items-center gap-1.5 rounded-[2px] border px-3 py-1.5 text-sm font-medium transition ${
                  typen.has(option.typ) ? "border-signal text-ink" : "border-rule text-ink-soft"
                }`}
              >
                <Icon name={option.icon} size={15} />
                {t(option.labelSchluessel)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 border border-rule bg-paper p-4">
        <KategorieKaskade kategorien={kategorien} mitAlleOption onAendern={pfadGeaendert} />

        <div className="mt-4 border-t border-rule pt-1">
          <DatenblattZeile label={t("videothek.teil")} aktiv={Boolean(teilId)}>
            <select value={teilId} onChange={(e) => setTeilId(e.target.value)} className={eingabeKlasse}>
              <option value={ALLE}>{t("videothek.alle")}</option>
              {sichtbareTeile.map((teil) => (
                <option key={teil.id} value={teil.id}>
                  {teilNamen.get(teil.id) ?? teil.name}
                </option>
              ))}
            </select>
          </DatenblattZeile>
        </div>
      </div>

      {zeigeZusatzfilter && (
        <div className="mt-4 border border-rule bg-paper p-4">
          <h2 className="font-mono text-xs uppercase tracking-wide text-annot">
            {t("referenzvideos.zusatzfilter", { hersteller: ausgewaehlterHersteller?.name ?? "" })}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("referenzvideos.material")}</span>
              <select value={material} onChange={(e) => setMaterial(e.target.value)} className={`mt-1 ${eingabeKlasse}`}>
                <option value={ALLE}>{t("videothek.alle")}</option>
                {MATERIAL_OPTIONEN.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("referenzvideos.foerderbandbreite")}</span>
              <select
                value={foerderbandbreite}
                onChange={(e) => setFoerderbandbreite(e.target.value)}
                className={`mt-1 ${eingabeKlasse}`}
              >
                <option value={ALLE}>{t("videothek.alle")}</option>
                {FOERDERBANDBREITE_OPTIONEN.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("referenzvideos.beltConnection")}</span>
              <select
                value={beltConnection}
                onChange={(e) => setBeltConnection(e.target.value)}
                className={`mt-1 ${eingabeKlasse}`}
              >
                <option value={ALLE}>{t("videothek.alle")}</option>
                {BELT_CONNECTION_OPTIONEN.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("referenzvideos.abstreifsegment")}</span>
              <select
                value={abstreifsegment}
                onChange={(e) => setAbstreifsegment(e.target.value)}
                className={`mt-1 ${eingabeKlasse}`}
              >
                <option value={ALLE}>{t("videothek.alle")}</option>
                {ABSTREIFSEGMENT_OPTIONEN.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("referenzvideos.verlagerung")}</span>
              <select
                value={verlagerung}
                onChange={(e) => setVerlagerung(e.target.value)}
                className={`mt-1 ${eingabeKlasse}`}
              >
                <option value={ALLE}>{t("videothek.alle")}</option>
                {VERLAGERUNG_OPTIONEN.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("referenzvideos.runbackReversible")}</span>
              <select
                value={runbackReversible}
                onChange={(e) => setRunbackReversible(e.target.value)}
                className={`mt-1 ${eingabeKlasse}`}
              >
                <option value={ALLE}>{t("videothek.alle")}</option>
                <option value="ja">{t("referenzvideos.ja")}</option>
                <option value="nein">{t("referenzvideos.nein")}</option>
              </select>
            </label>

            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("referenzvideos.land")}</span>
              <input
                value={land}
                onChange={(e) => setLand(e.target.value)}
                placeholder={t("referenzvideos.landPlatzhalter")}
                className={`mt-1 ${eingabeKlasse}`}
              />
            </label>

            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("referenzvideos.besonderheiten")}</span>
              <input
                value={besonderheiten}
                onChange={(e) => setBesonderheiten(e.target.value)}
                placeholder={t("referenzvideos.besonderheitenPlatzhalter")}
                className={`mt-1 ${eingabeKlasse}`}
              />
            </label>

            <label className="block sm:col-span-2 lg:col-span-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                {t("referenzvideos.geschwindigkeit")}
                {": "}
                {geschwindigkeit === null ? (
                  t("referenzvideos.geschwindigkeitEgal")
                ) : (
                  <span className="text-annot">
                    {t("referenzvideos.geschwindigkeitCa", {
                      wert: geschwindigkeit.toFixed(1),
                      toleranz: String(GESCHWINDIGKEIT_TOLERANZ),
                    })}
                  </span>
                )}
              </span>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="range"
                  min={GESCHWINDIGKEIT_MIN}
                  max={GESCHWINDIGKEIT_MAX}
                  step={GESCHWINDIGKEIT_SCHRITT}
                  value={geschwindigkeit ?? GESCHWINDIGKEIT_MIN}
                  onChange={(e) => {
                    const wert = Number(e.target.value);
                    // Ganz nach links gezogen = Filter wieder deaktivieren (zeigt
                    // wieder alle), statt fälschlich nach "GESCHWINDIGKEIT_MIN"
                    // zu filtern - das entspricht der intuitiven Erwartung an
                    // einen Regler, der bei "ganz links" spürbar "aus" bedeutet.
                    setGeschwindigkeit(wert <= GESCHWINDIGKEIT_MIN ? null : wert);
                  }}
                  className="flex-1 accent-signal"
                />
                {geschwindigkeit !== null && (
                  <button
                    type="button"
                    onClick={() => setGeschwindigkeit(null)}
                    className="rounded-[2px] border border-rule px-2 py-1 text-xs text-ink-soft hover:bg-paper-2"
                  >
                    {t("referenzvideos.zuruecksetzen")}
                  </button>
                )}
              </div>
            </label>
          </div>
        </div>
      )}

      {gefiltert.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon="filter" text={t("referenzvideos.keineTreffer")} />
          {naheTreffer.length > 0 && (
            <div className="mx-auto mt-3 max-w-md border-l-[3px] border-annot bg-paper-2 px-4 py-3 text-center text-sm text-annot">
              {naheTreffer.map((vorschlag, i) => (
                <p key={i}>{t("referenzvideos.naheTreffer", { feld: vorschlag.feld, wert: vorschlag.wert })}</p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mt-6 flex items-center justify-end">
            <AnsichtUmschalter
              wert={ansicht}
              onAendern={setAnsicht}
              labelKarten={t("ansicht.karten")}
              labelIndex={t("ansicht.index")}
            />
          </div>

          <div className="mt-3 sm:hidden">
            <Index zeilen={indexZeilen} />
          </div>
          <div className="mt-3 hidden sm:block">
            {ansicht === "index" ? (
              <Index zeilen={indexZeilen} />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {gefiltert.map((referenz) => (
                  <ReferenzCard
                    key={referenz.id}
                    referenz={referenz}
                    aktuellerNutzerId={aktuellerNutzerId}
                    gemerkt={gemerkteIdSet.has(referenz.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

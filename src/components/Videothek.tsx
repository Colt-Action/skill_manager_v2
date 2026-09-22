"use client";

import { useEffect, useMemo, useState } from "react";
import VideoCard from "@/components/VideoCard";
import KategorieKaskade, { type KategoriePfad } from "@/components/KategorieKaskade";
import EmptyState from "@/components/EmptyState";
import AnsichtUmschalter, { type Ansicht } from "@/components/AnsichtUmschalter";
import Index, { type IndexZeile } from "@/components/Index";
import { DatenblattZeile, eingabeKlasse } from "@/components/Datenblatt";
import { dauerFormatieren } from "@/lib/format";
import { pfadZuKategorie, teilAnzeigenamen } from "@/lib/kategorieBaum";
import { sucheOhneTrefferProtokollieren } from "@/lib/actions/suche";
import { useSprache } from "@/components/SprachProvider";
import type { Kategorie, Teil, VideoMitDetails } from "@/lib/supabase/types";

interface Props {
  videos: VideoMitDetails[];
  kategorien: Kategorie[];
  teile: Teil[];
  anfangsSuchtext?: string;
  gemerkteIds?: string[];
}

const ALLE = "";
const SEITENGROESSE = 24;
const SPEICHER_SCHLUESSEL = "sm-videothek-filter";

interface GespeicherterFilter {
  kategorieId: string | null;
  teilId: string;
}

function gespeicherterFilterLesen(): GespeicherterFilter | null {
  try {
    const raw = localStorage.getItem(SPEICHER_SCHLUESSEL);
    return raw ? (JSON.parse(raw) as GespeicherterFilter) : null;
  } catch {
    return null;
  }
}

export default function Videothek({ videos, kategorien, teile, anfangsSuchtext = "", gemerkteIds = [] }: Props) {
  const gemerkteIdSet = useMemo(() => new Set(gemerkteIds), [gemerkteIds]);
  const { t } = useSprache();
  const [pfad, setPfad] = useState<KategoriePfad>({
    industrieId: null,
    herstellerId: null,
    produktId: null,
    kategorieId: null,
    unterkategorieId: null,
  });
  const [startKategorieId] = useState<string | null>(() => gespeicherterFilterLesen()?.kategorieId ?? null);
  const [teilId, setTeilId] = useState(() => gespeicherterFilterLesen()?.teilId ?? ALLE);
  const [suchtext, setSuchtext] = useState(anfangsSuchtext);
  const [sichtbareAnzahl, setSichtbareAnzahl] = useState(SEITENGROESSE);
  const [ansicht, setAnsicht] = useState<Ansicht>("karten");

  const sichtbareTeile = useMemo(
    () =>
      pfad.unterkategorieId
        ? teile.filter((t) => t.kategorie_id === pfad.unterkategorieId)
        : teile,
    [teile, pfad.unterkategorieId],
  );
  const teilNamen = useMemo(() => teilAnzeigenamen(sichtbareTeile, kategorien), [sichtbareTeile, kategorien]);

  function pfadGeaendert(neuerPfad: KategoriePfad) {
    setPfad(neuerPfad);
    setTeilId(ALLE);
  }

  const suchtextNormalisiert = suchtext.trim().toLowerCase();

  const gefilterteVideos = useMemo(() => {
    return videos.filter((video) => {
      if (teilId !== ALLE && video.teil_id !== teilId) return false;

      const gewuenscht = [pfad.industrieId, pfad.herstellerId, pfad.produktId, pfad.kategorieId, pfad.unterkategorieId];
      if (teilId === ALLE && gewuenscht.some(Boolean)) {
        const eigeneKategorieId = video.kategorie_id ?? video.teile?.kategorie_id ?? null;
        const videoPfad = pfadZuKategorie(kategorien, eigeneKategorieId);
        for (let i = 0; i < gewuenscht.length; i++) {
          if (gewuenscht[i] && videoPfad[i] !== gewuenscht[i]) return false;
        }
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
  }, [videos, teilId, pfad, kategorien, suchtextNormalisiert]);

  // Bei jeder Filter-/Suchänderung wieder von vorne anzeigen, statt mitten
  // in einer alten "Mehr anzeigen"-Liste zu bleiben. Vergleich während des
  // Renderns (React-empfohlenes Muster), statt in einem useEffect.
  const filterSchluessel = `${teilId}|${pfad.industrieId}|${pfad.herstellerId}|${pfad.produktId}|${pfad.kategorieId}|${pfad.unterkategorieId}|${suchtextNormalisiert}`;
  const [vorherigerFilterSchluessel, setVorherigerFilterSchluessel] = useState(filterSchluessel);
  if (filterSchluessel !== vorherigerFilterSchluessel) {
    setVorherigerFilterSchluessel(filterSchluessel);
    setSichtbareAnzahl(SEITENGROESSE);
  }

  const sichtbareVideos = gefilterteVideos.slice(0, sichtbareAnzahl);

  // Zuletzt genutzte Kategorie/Teil-Auswahl merken, damit Nutzer beim
  // nächsten Besuch nicht wieder bei "Alle" anfangen müssen.
  useEffect(() => {
    try {
      const tiefsteKategorieId =
        pfad.unterkategorieId ?? pfad.kategorieId ?? pfad.produktId ?? pfad.herstellerId ?? pfad.industrieId ?? null;
      localStorage.setItem(
        SPEICHER_SCHLUESSEL,
        JSON.stringify({ kategorieId: tiefsteKategorieId, teilId } satisfies GespeicherterFilter),
      );
    } catch {
      // localStorage evtl. blockiert (privates Surfen) – dann gilt die
      // Auswahl einfach nur für diese Sitzung.
    }
  }, [pfad, teilId]);

  // Wenn die Suche (nach kurzer Pause) keine Treffer bringt, wird das für
  // das Analytics-Dashboard der Trainer gespeichert.
  useEffect(() => {
    if (!suchtextNormalisiert || gefilterteVideos.length > 0) return;
    const timer = setTimeout(() => {
      sucheOhneTrefferProtokollieren(suchtextNormalisiert);
    }, 800);
    return () => clearTimeout(timer);
  }, [suchtextNormalisiert, gefilterteVideos.length]);

  const indexZeilen: IndexZeile[] = sichtbareVideos.map((video) => {
    const eigeneKategorieId = video.kategorie_id ?? video.teile?.kategorie_id ?? null;
    const kategorieName = pfadZuKategorie(kategorien, eigeneKategorieId)
      .slice(2)
      .map((id) => kategorien.find((k) => k.id === id)?.name)
      .filter((name): name is string => Boolean(name))
      .pop();
    return {
      id: video.id,
      href: `/videos/${video.id}`,
      nummer: video.teile?.teilenummer,
      titel: video.titel,
      kategorie: kategorieName,
      rechts: video.dauer != null ? dauerFormatieren(video.dauer) : undefined,
    };
  });

  return (
    <div className="mt-6">
      <div className="border border-rule bg-paper p-4">
        <KategorieKaskade
          kategorien={kategorien}
          mitAlleOption
          startPfad={startKategorieId}
          onAendern={pfadGeaendert}
        />

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
          <DatenblattZeile label={t("videothek.suche")}>
            <input
              type="search"
              value={suchtext}
              onChange={(e) => setSuchtext(e.target.value)}
              placeholder={t("videothek.suchePlatzhalter")}
              className={eingabeKlasse}
            />
          </DatenblattZeile>
        </div>
      </div>

      {gefilterteVideos.length === 0 ? (
        <EmptyState icon="suche" text={t("videothek.keineTreffer")} />
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

          {/* Auf dem Handy ist die Index-Zeilenliste immer die Standardansicht
              (Rev. 02, Abschnitt I.10) - Thumbnails kosten dort mehr Platz,
              als sie an Orientierung bringen. */}
          <div className="mt-3 sm:hidden">
            <Index zeilen={indexZeilen} />
          </div>
          <div className="mt-3 hidden sm:block">
            {ansicht === "index" ? (
              <Index zeilen={indexZeilen} />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sichtbareVideos.map((video) => (
                  <VideoCard key={video.id} video={video} gemerkt={gemerkteIdSet.has(video.id)} />
                ))}
              </div>
            )}
          </div>

          {sichtbareAnzahl < gefilterteVideos.length && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setSichtbareAnzahl((n) => n + SEITENGROESSE)}
                className="rounded-[2px] border border-rule px-4 py-2 text-sm font-medium text-ink hover:bg-paper-2"
              >
                {t("videothek.mehrAnzeigen", { anzahl: String(gefilterteVideos.length - sichtbareAnzahl) })}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

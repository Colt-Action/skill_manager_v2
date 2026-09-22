import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import FeedbackButtons from "@/components/FeedbackButtons";
import MerklistenAuswahl from "@/components/MerklistenAuswahl";
import LoeschungBeantragenButton from "@/components/LoeschungBeantragenButton";
import Kommentare, { type KommentarMitAutor } from "@/components/Kommentare";
import StatusBadge from "@/components/StatusBadge";
import VideoCard from "@/components/VideoCard";
import ReferenzCard from "@/components/ReferenzCard";
import Typenschild, { type TypenschildFeld } from "@/components/Typenschild";
import SectionLinie from "@/components/SectionLinie";
import { statusLabel, statusTon } from "@/lib/format";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { ReferenzMitDetails, VideoMitDetails } from "@/lib/supabase/types";

const VIDEO_SPALTEN =
  "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme))";
const REFERENZ_SPALTEN =
  "*, teile(id, name, teilenummer, beschreibung, kategorie_id), kategorien(id, name, ebene, parent_kategorie_id), referenz_tags(tags(id, name, synonyme)), referenz_metadaten(*), referenz_video(*), referenz_foto(*), referenz_dokument(*), referenz_link(*), referenz_likes(user_id)";

export default async function VideoDetailSeite({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const nutzer = await getAktuellerNutzer();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const { data: video } = await supabase
    .from("videos")
    .select(
      "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme)), referenz_video_details(*)",
    )
    .eq("id", id)
    .single();

  if (!video) notFound();

  // Aufruf zählen (fürs Analytics-Dashboard) und für den Nutzer als "zuletzt
  // angesehen" merken (fürs persönliche Dashboard) – bewusst "fire and
  // forget", damit das Laden der Seite dadurch nicht langsamer wird.
  void supabase.rpc("video_aufruf_zaehlen", { p_video_id: id });
  void supabase.rpc("video_angesehen_merken", { p_video_id: id });

  const { data: kommentare } = await supabase
    .from("kommentare")
    .select("*, users(name, avatar_url)")
    .eq("video_id", id)
    .order("erstellt_am", { ascending: true });

  const { data: uebersetzungenRoh } = await supabase
    .from("uebersetzungen")
    .select("feld, sprache, text")
    .eq("tabelle", "videos")
    .eq("datensatz_id", id)
    .eq("sprache", sprache);

  const typedVideo = video as VideoMitDetails;
  const istEigenesVideo = typedVideo.hochgeladen_von === nutzer.id;
  const istAdmin = nutzer.rolle === "admin" || nutzer.rolle === "superadmin";
  const referenzDetailsRoh = typedVideo.referenz_video_details;
  const referenzDetails = Array.isArray(referenzDetailsRoh)
    ? (referenzDetailsRoh[0] ?? null)
    : (referenzDetailsRoh ?? null);

  // Übersetzter Titel/Beschreibung, falls ein Admin sie unter "Übersetzungen"
  // für die aktuelle Sprache des Betrachters hinterlegt hat. Fehlt eine
  // Übersetzung, wird die Originalversion gezeigt (und ein Hinweis dazu).
  const uebersetzterTitel = uebersetzungenRoh?.find((u) => u.feld === "titel")?.text;
  const uebersetzteBeschreibung = uebersetzungenRoh?.find((u) => u.feld === "beschreibung_schritte")?.text;
  const hatUebersetzung = Boolean(uebersetzterTitel || uebersetzteBeschreibung);
  const zeigeUebersetzungsHinweis = sprache !== STANDARD_SPRACHE && !hatUebersetzung;
  const angezeigterTitel = uebersetzterTitel || typedVideo.titel;
  const angezeigteBeschreibung = uebersetzteBeschreibung || typedVideo.beschreibung_schritte;

  const teilId = typedVideo.teil_id;
  const [{ data: aehnlicheVideosRoh }, { data: referenzenZumTeilRoh }, { data: favoriten }] = await Promise.all([
    teilId
      ? supabase
          .from("videos")
          .select(VIDEO_SPALTEN)
          .eq("teil_id", teilId)
          .eq("video_typ", "schulung")
          .eq("status", "veroeffentlicht")
          .neq("id", id)
          .limit(4)
      : Promise.resolve({ data: [] }),
    teilId
      ? supabase.from("referenzen").select(REFERENZ_SPALTEN).eq("teil_id", teilId).eq("status", "veroeffentlicht").limit(4)
      : Promise.resolve({ data: [] }),
    supabase.from("favoriten").select("video_id").eq("user_id", nutzer.id).is("merkteam_id", null),
  ]);
  const aehnlicheVideos = (aehnlicheVideosRoh ?? []) as VideoMitDetails[];
  const gemerkteIds = new Set((favoriten ?? []).map((f) => f.video_id));
  const referenzenZumTeil = (referenzenZumTeilRoh ?? []) as ReferenzMitDetails[];

  const felder: TypenschildFeld[] = referenzDetails
    ? [
        referenzDetails.material
          ? {
              label: t("referenzvideos.material", sprache),
              wert:
                referenzDetails.material === "Sonstiges"
                  ? referenzDetails.material_sonstiges || referenzDetails.material
                  : referenzDetails.material,
            }
          : null,
        referenzDetails.foerderbandbreite
          ? { label: t("referenzvideos.foerderbandbreite", sprache), wert: referenzDetails.foerderbandbreite }
          : null,
        referenzDetails.geschwindigkeit_ms != null
          ? { label: t("referenzvideos.geschwindigkeit", sprache), wert: `${referenzDetails.geschwindigkeit_ms} m/s` }
          : null,
        referenzDetails.belt_connection
          ? {
              label: t("referenzvideos.beltConnection", sprache),
              wert:
                referenzDetails.belt_connection +
                (referenzDetails.belt_connection === "Mechanical Splice" && referenzDetails.mechanical_splice_typ
                  ? ` (${referenzDetails.mechanical_splice_typ})`
                  : ""),
            }
          : null,
        referenzDetails.land ? { label: t("referenzvideos.land", sprache), wert: referenzDetails.land } : null,
        {
          label: t("referenzvideos.runbackReversible", sprache),
          wert: referenzDetails.runback_reversible ? t("referenzvideos.ja", sprache) : t("referenzvideos.nein", sprache),
        },
      ].filter((f): f is TypenschildFeld => f !== null)
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="overflow-hidden border border-rule bg-plate">
        <video src={typedVideo.datei_url} controls className="aspect-video w-full" />
      </div>

      <p className="mt-2 font-mono text-xs text-ink-faint">
        {t("videoDetail.sprachspurLabel", sprache)}: {t("videoDetail.sprachspurBaldVerfuegbar", sprache)}
      </p>

      <div className="mt-4 flex items-center justify-end gap-2">
        <MerklistenAuswahl videoId={typedVideo.id} />
        {typedVideo.status !== "veroeffentlicht" && (
          <StatusBadge label={statusLabel(typedVideo.status)} ton={statusTon(typedVideo.status)} />
        )}
      </div>

      <Typenschild
        variante="gross"
        nummer={typedVideo.teile?.teilenummer}
        titel={angezeigterTitel}
        felder={felder}
      />
      {typedVideo.teile?.name && <p className="mt-2 font-mono text-xs text-annot">{typedVideo.teile.name}</p>}
      {typedVideo.teile?.beschreibung && <p className="mt-2 text-sm text-ink-soft">{typedVideo.teile.beschreibung}</p>}
      {referenzDetails?.besonderheiten && (
        <p className="mt-2 text-sm text-ink-soft">
          <span className="font-mono text-xs uppercase tracking-wide text-ink-faint">
            {t("referenzvideos.besonderheiten", sprache)}:{" "}
          </span>
          {referenzDetails.besonderheiten}
        </p>
      )}

      {zeigeUebersetzungsHinweis && (
        <p className="mt-3 border-l-[3px] border-annot bg-paper-2 px-3 py-2 text-xs text-annot">
          {t("videoDetail.hinweisNichtUebersetzt", sprache)}
        </p>
      )}

      {typedVideo.video_tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {typedVideo.video_tags.map(({ tags }) => (
            <span key={tags.id} className="rounded-[2px] border border-rule px-2.5 py-1 text-xs text-ink-soft">
              {tags.name}
            </span>
          ))}
        </div>
      )}

      <section className="mt-8">
        <SectionLinie titel={t("videoDetail.schrittAnleitung", sprache)} />
        <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink">
          {angezeigteBeschreibung || t("videoDetail.keineBeschreibung", sprache)}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4">
        <FeedbackButtons videoId={typedVideo.id} />
        {istEigenesVideo && (
          <LoeschungBeantragenButton
            videoId={typedVideo.id}
            bereitsBeantragt={typedVideo.loeschung_angefragt}
          />
        )}
      </div>

      <Kommentare
        videoId={typedVideo.id}
        kommentare={(kommentare ?? []) as unknown as KommentarMitAutor[]}
        eigeneNutzerId={nutzer.id}
        istAdmin={istAdmin}
      />

      {aehnlicheVideos.length > 0 && (
        <section className="mt-8">
          <SectionLinie titel={t("videoDetail.aehnlicheVideos", sprache)} />
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {aehnlicheVideos.map((v) => (
              <VideoCard key={v.id} video={v} gemerkt={gemerkteIds.has(v.id)} />
            ))}
          </div>
        </section>
      )}

      {referenzenZumTeil.length > 0 && (
        <section className="mt-8">
          <SectionLinie titel={t("videoDetail.referenzenZumTeil", sprache)} />
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {referenzenZumTeil.map((r) => (
              <ReferenzCard
                key={r.id}
                referenz={r}
                aktuellerNutzerId={nutzer.id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

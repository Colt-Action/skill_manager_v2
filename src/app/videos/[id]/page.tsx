import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import FeedbackButtons from "@/components/FeedbackButtons";
import FavoritButton from "@/components/FavoritButton";
import LoeschungBeantragenButton from "@/components/LoeschungBeantragenButton";
import Kommentare, { type KommentarMitAutor } from "@/components/Kommentare";
import StatusBadge from "@/components/StatusBadge";
import { statusLabel, statusTon } from "@/lib/format";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { VideoMitDetails } from "@/lib/supabase/types";

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

  const { data: favorit } = await supabase
    .from("favoriten")
    .select("video_id")
    .eq("video_id", id)
    .eq("user_id", nutzer.id)
    .maybeSingle();

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="overflow-hidden rounded-xl bg-nav ring-1 ring-line">
        <video src={typedVideo.datei_url} controls className="aspect-video w-full" />
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-foreground-soft">
        <span className="cursor-not-allowed rounded-full bg-background px-2 py-1 opacity-60 ring-1 ring-line">
          🔊 {t("videoDetail.sprachspurLabel", sprache)}: {t("videoDetail.sprachspurBaldVerfuegbar", sprache)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
            {angezeigterTitel}
          </h1>
          {typedVideo.teile && (
            <>
              <p className="mt-1 font-mono text-sm text-blueprint">
                {typedVideo.teile.name} · {t("kategorieVerwaltung.idNr", sprache)} {typedVideo.teile.teilenummer}
              </p>
              {typedVideo.teile.beschreibung && (
                <p className="mt-1 text-sm text-foreground-soft">{typedVideo.teile.beschreibung}</p>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <FavoritButton videoId={typedVideo.id} istFavorit={!!favorit} />
          {typedVideo.status !== "veroeffentlicht" && (
            <StatusBadge label={statusLabel(typedVideo.status)} ton={statusTon(typedVideo.status)} />
          )}
        </div>
      </div>

      {zeigeUebersetzungsHinweis && (
        <p className="mt-2 rounded-md bg-accent/10 px-3 py-2 text-xs text-accent-deep">
          {t("videoDetail.hinweisNichtUebersetzt", sprache)}
        </p>
      )}

      {typedVideo.video_tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {typedVideo.video_tags.map(({ tags }) => (
            <span
              key={tags.id}
              className="rounded-full bg-background px-2.5 py-1 text-xs text-foreground-soft ring-1 ring-line"
            >
              {tags.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl bg-surface p-5 ring-1 ring-line">
        <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">{t("videoDetail.schrittAnleitung", sprache)}</h2>
        <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
          {angezeigteBeschreibung || t("videoDetail.keineBeschreibung", sprache)}
        </div>
      </div>

      {typedVideo.video_typ === "referenz" && referenzDetails && (
        <div className="mt-6 rounded-xl bg-surface p-5 ring-1 ring-line">
          <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">
            {t("videoDetail.technischeAngaben", sprache)}
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
            {referenzDetails.material && (
              <div>
                <dt className="text-xs text-foreground-soft">{t("referenzvideos.material", sprache)}</dt>
                <dd className="text-foreground">
                  {referenzDetails.material === "Sonstiges"
                    ? referenzDetails.material_sonstiges || referenzDetails.material
                    : referenzDetails.material}
                </dd>
              </div>
            )}
            {referenzDetails.geschwindigkeit_ms != null && (
              <div>
                <dt className="text-xs text-foreground-soft">{t("referenzvideos.geschwindigkeit", sprache)}</dt>
                <dd className="text-foreground">{referenzDetails.geschwindigkeit_ms} m/s</dd>
              </div>
            )}
            {referenzDetails.foerderbandbreite && (
              <div>
                <dt className="text-xs text-foreground-soft">{t("referenzvideos.foerderbandbreite", sprache)}</dt>
                <dd className="text-foreground">{referenzDetails.foerderbandbreite}</dd>
              </div>
            )}
            {referenzDetails.belt_connection && (
              <div>
                <dt className="text-xs text-foreground-soft">{t("referenzvideos.beltConnection", sprache)}</dt>
                <dd className="text-foreground">
                  {referenzDetails.belt_connection}
                  {referenzDetails.belt_connection === "Mechanical Splice" &&
                    referenzDetails.mechanical_splice_typ &&
                    ` (${referenzDetails.mechanical_splice_typ})`}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-foreground-soft">{t("referenzvideos.runbackReversible", sprache)}</dt>
              <dd className="text-foreground">
                {referenzDetails.runback_reversible ? t("referenzvideos.ja", sprache) : t("referenzvideos.nein", sprache)}
              </dd>
            </div>
            {referenzDetails.land && (
              <div>
                <dt className="text-xs text-foreground-soft">{t("referenzvideos.land", sprache)}</dt>
                <dd className="text-foreground">{referenzDetails.land}</dd>
              </div>
            )}
            {referenzDetails.besonderheiten && (
              <div className="col-span-2 sm:col-span-3">
                <dt className="text-xs text-foreground-soft">{t("referenzvideos.besonderheiten", sprache)}</dt>
                <dd className="text-foreground">{referenzDetails.besonderheiten}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
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
    </div>
  );
}

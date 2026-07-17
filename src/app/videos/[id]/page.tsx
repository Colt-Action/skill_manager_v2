import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import FeedbackButtons from "@/components/FeedbackButtons";
import FavoritButton from "@/components/FavoritButton";
import LoeschungBeantragenButton from "@/components/LoeschungBeantragenButton";
import Kommentare, { type KommentarMitAutor } from "@/components/Kommentare";
import StatusBadge from "@/components/StatusBadge";
import { statusLabel, statusTon } from "@/lib/format";
import type { VideoMitDetails } from "@/lib/supabase/types";

export default async function VideoDetailSeite({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const nutzer = await getAktuellerNutzer();
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

  const typedVideo = video as VideoMitDetails;
  const istEigenesVideo = typedVideo.hochgeladen_von === nutzer.id;
  const istAdmin = nutzer.rolle === "admin" || nutzer.rolle === "superadmin";
  const referenzDetailsRoh = typedVideo.referenz_video_details;
  const referenzDetails = Array.isArray(referenzDetailsRoh)
    ? (referenzDetailsRoh[0] ?? null)
    : (referenzDetailsRoh ?? null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="overflow-hidden rounded-xl bg-nav ring-1 ring-line">
        <video src={typedVideo.datei_url} controls className="aspect-video w-full" />
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
            {typedVideo.titel}
          </h1>
          {typedVideo.teile && (
            <>
              <p className="mt-1 font-mono text-sm text-blueprint">
                {typedVideo.teile.name} · ID-Nr. {typedVideo.teile.teilenummer}
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
        <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">Schritt-für-Schritt-Anleitung</h2>
        <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
          {typedVideo.beschreibung_schritte || "Für dieses Video wurde noch keine Beschreibung hinterlegt."}
        </div>
      </div>

      {typedVideo.video_typ === "referenz" && referenzDetails && (
        <div className="mt-6 rounded-xl bg-surface p-5 ring-1 ring-line">
          <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">
            Technische Angaben
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
            {referenzDetails.material && (
              <div>
                <dt className="text-xs text-foreground-soft">Material</dt>
                <dd className="text-foreground">
                  {referenzDetails.material === "Sonstiges"
                    ? referenzDetails.material_sonstiges || "Sonstiges"
                    : referenzDetails.material}
                </dd>
              </div>
            )}
            {referenzDetails.geschwindigkeit_ms != null && (
              <div>
                <dt className="text-xs text-foreground-soft">Geschwindigkeit</dt>
                <dd className="text-foreground">{referenzDetails.geschwindigkeit_ms} m/s</dd>
              </div>
            )}
            {referenzDetails.foerderbandbreite && (
              <div>
                <dt className="text-xs text-foreground-soft">Förderbandbreite</dt>
                <dd className="text-foreground">{referenzDetails.foerderbandbreite}</dd>
              </div>
            )}
            {referenzDetails.belt_connection && (
              <div>
                <dt className="text-xs text-foreground-soft">Belt Connection</dt>
                <dd className="text-foreground">
                  {referenzDetails.belt_connection}
                  {referenzDetails.belt_connection === "Mechanical Splice" &&
                    referenzDetails.mechanical_splice_typ &&
                    ` (${referenzDetails.mechanical_splice_typ})`}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-foreground-soft">Runback/Reversible</dt>
              <dd className="text-foreground">{referenzDetails.runback_reversible ? "Ja" : "Nein"}</dd>
            </div>
            {referenzDetails.land && (
              <div>
                <dt className="text-xs text-foreground-soft">Land</dt>
                <dd className="text-foreground">{referenzDetails.land}</dd>
              </div>
            )}
            {referenzDetails.besonderheiten && (
              <div className="col-span-2 sm:col-span-3">
                <dt className="text-xs text-foreground-soft">Besonderheiten</dt>
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

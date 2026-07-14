import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import FeedbackButtons from "@/components/FeedbackButtons";
import { statusLabel } from "@/lib/format";
import type { VideoMitDetails } from "@/lib/supabase/types";

export default async function VideoDetailSeite({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await getAktuellerNutzer();
  const supabase = await createClient();

  const { data: video } = await supabase
    .from("videos")
    .select(
      "*, teile(id, name, teilenummer, kategorie_id), video_tags(tags(id, name, synonyme))",
    )
    .eq("id", id)
    .single();

  if (!video) notFound();

  // Aufruf zählen (fürs Analytics-Dashboard) – bewusst "fire and forget",
  // damit das Laden der Seite dadurch nicht langsamer wird.
  void supabase.rpc("video_aufruf_zaehlen", { p_video_id: id });

  const typedVideo = video as VideoMitDetails;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="overflow-hidden rounded-xl bg-black">
        <video src={typedVideo.datei_url} controls className="aspect-video w-full" />
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{typedVideo.titel}</h1>
          {typedVideo.teile && (
            <p className="mt-1 text-sm text-slate-500">
              {typedVideo.teile.name} · Teil-Nr. {typedVideo.teile.teilenummer}
            </p>
          )}
        </div>
        {typedVideo.status !== "veroeffentlicht" && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            {statusLabel(typedVideo.status)}
          </span>
        )}
      </div>

      {typedVideo.video_tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {typedVideo.video_tags.map(({ tags }) => (
            <span
              key={tags.id}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
            >
              {tags.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="font-medium text-slate-900">Schritt-für-Schritt-Anleitung</h2>
        <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
          {typedVideo.beschreibung_schritte || "Für dieses Video wurde noch keine Beschreibung hinterlegt."}
        </div>
      </div>

      <div className="mt-6">
        <FeedbackButtons videoId={typedVideo.id} />
      </div>
    </div>
  );
}

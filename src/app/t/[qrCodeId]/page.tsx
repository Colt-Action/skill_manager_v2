import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import VideoCard from "@/components/VideoCard";
import type { VideoMitDetails } from "@/lib/supabase/types";

export default async function TeilScanSeite({
  params,
}: {
  params: Promise<{ qrCodeId: string }>;
}) {
  const { qrCodeId } = await params;
  await getAktuellerNutzer();
  const supabase = await createClient();

  const { data: teil } = await supabase
    .from("teile")
    .select("*")
    .eq("qr_code_id", qrCodeId)
    .single();

  if (!teil) notFound();

  const { data: videos } = await supabase
    .from("videos")
    .select(
      "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme))",
    )
    .eq("teil_id", teil.id)
    .eq("status", "veroeffentlicht")
    .order("erstellt_am", { ascending: false });

  const videoListe = (videos ?? []) as VideoMitDetails[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Teil-Scan</p>
      <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-foreground">
        {teil.name}
      </h1>
      <p className="mt-1 font-mono text-sm text-blueprint">Teil-Nr. {teil.teilenummer}</p>

      {videoListe.length === 0 ? (
        <p className="mt-10 text-sm text-foreground-soft">
          Für dieses Teil gibt es aktuell noch kein veröffentlichtes Video.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videoListe.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

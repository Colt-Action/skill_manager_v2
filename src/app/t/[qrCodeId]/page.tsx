import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import VideoCard from "@/components/VideoCard";
import EmptyState from "@/components/EmptyState";
import Typenschild from "@/components/Typenschild";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { VideoMitDetails } from "@/lib/supabase/types";

export default async function TeilScanSeite({
  params,
}: {
  params: Promise<{ qrCodeId: string }>;
}) {
  const { qrCodeId } = await params;
  const nutzer = await getAktuellerNutzer();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const { data: teil } = await supabase
    .from("teile")
    .select("*")
    .eq("qr_code_id", qrCodeId)
    .single();

  if (!teil) notFound();

  const [{ data: videos }, { data: favoriten }] = await Promise.all([
    supabase
      .from("videos")
      .select(
        "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme))",
      )
      .eq("teil_id", teil.id)
      .eq("status", "veroeffentlicht")
      .eq("video_typ", "schulung")
      .order("erstellt_am", { ascending: false }),
    supabase.from("favoriten").select("video_id").eq("user_id", nutzer.id).is("merkteam_id", null),
  ]);

  const videoListe = (videos ?? []) as VideoMitDetails[];
  const gemerkteIds = new Set((favoriten ?? []).map((f) => f.video_id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">{t("teilScan.eyebrow", sprache)}</p>
      <div className="mt-3">
        <Typenschild variante="gross" nummer={teil.teilenummer} titel={teil.name} felder={[]} />
      </div>

      {videoListe.length === 0 ? (
        <EmptyState icon="video" text={t("teilScan.keineVideos", sprache)} />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videoListe.map((video) => (
            <VideoCard key={video.id} video={video} gemerkt={gemerkteIds.has(video.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

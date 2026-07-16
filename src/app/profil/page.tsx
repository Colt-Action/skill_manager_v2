import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import ProfilForm from "@/components/ProfilForm";
import PasswortForm from "@/components/PasswortForm";
import ProfilStatistik from "@/components/ProfilStatistik";

export default async function ProfilSeite() {
  const nutzer = await getAktuellerNutzer();
  const supabase = await createClient();

  const { data: eigeneVideos } = await supabase
    .from("videos")
    .select("id, status")
    .eq("hochgeladen_von", nutzer.id);

  const videoIds = (eigeneVideos ?? []).map((v) => v.id);
  const videosVeroeffentlicht = (eigeneVideos ?? []).filter(
    (v) => v.status === "veroeffentlicht",
  ).length;

  let feedbackGesamt = 0;
  let feedbackHilfreich = 0;
  if (videoIds.length > 0) {
    const { data: feedback } = await supabase
      .from("feedback")
      .select("hilfreich")
      .in("video_id", videoIds);
    feedbackGesamt = feedback?.length ?? 0;
    feedbackHilfreich = feedback?.filter((f) => f.hilfreich).length ?? 0;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Mitarbeiterakte</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        Mein Profil
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        Passe deinen Namen, Standort und dein Profilbild an.
      </p>

      <ProfilForm nutzer={nutzer} />

      <ProfilStatistik
        videosGesamt={eigeneVideos?.length ?? 0}
        videosVeroeffentlicht={videosVeroeffentlicht}
        feedbackGesamt={feedbackGesamt}
        feedbackHilfreich={feedbackHilfreich}
      />

      <PasswortForm />
    </div>
  );
}

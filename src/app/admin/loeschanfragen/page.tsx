import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import LoeschanfrageZeile from "@/components/LoeschanfrageZeile";
import type { VideoMitDetails } from "@/lib/supabase/types";

export default async function LoeschanfragenSeite() {
  await getAktuellerAdminOderHoeher();
  const supabase = await createClient();

  const { data: videos } = await supabase
    .from("videos")
    .select(
      "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme))",
    )
    .eq("loeschung_angefragt", true)
    .order("erstellt_am", { ascending: true });

  const videoListe = (videos ?? []) as VideoMitDetails[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Verwaltung</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        Löschanfragen
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        Techniker haben für diese Videos eine Löschung beantragt. Bestätige die Löschung oder
        lehne die Anfrage ab (das Video bleibt dann wie gehabt bestehen).
      </p>

      {videoListe.length === 0 ? (
        <p className="mt-10 text-sm text-foreground-soft">Aktuell keine offenen Löschanfragen.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {videoListe.map((video) => (
            <LoeschanfrageZeile key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

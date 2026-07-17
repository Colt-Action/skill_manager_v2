import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import AdminVideoEditor from "@/components/AdminVideoEditor";
import EmptyState from "@/components/EmptyState";
import type { Kategorie, Teil, VideoMitDetails } from "@/lib/supabase/types";

export default async function AdminPruefungSeite() {
  await getAktuellerAdminOderHoeher();
  const supabase = await createClient();

  const [{ data: videos }, { data: kategorien }, { data: teile }] = await Promise.all([
    supabase
      .from("videos")
      .select(
        "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme))",
      )
      .eq("status", "pruefung")
      .order("erstellt_am", { ascending: true }),
    supabase.from("kategorien").select("*").order("name"),
    supabase.from("teile").select("*").order("name"),
  ]);

  const videoListe = (videos ?? []) as VideoMitDetails[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Verwaltung</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        Videos in Prüfung
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        Ordne Kategorie, Teil und Tags zu, ergänze bei Bedarf die Beschreibung und gib das
        Video anschließend frei.
      </p>

      {videoListe.length === 0 ? (
        <EmptyState icon="🎉" text="Aktuell gibt es nichts zu prüfen – alle Videos sind bearbeitet." />
      ) : (
        <div className="mt-6 space-y-6">
          {videoListe.map((video) => (
            <AdminVideoEditor
              key={video.id}
              video={video}
              kategorien={(kategorien ?? []) as Kategorie[]}
              teile={(teile ?? []) as Teil[]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

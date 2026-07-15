import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import Videothek from "@/components/Videothek";
import type { Kategorie, Teil, VideoMitDetails } from "@/lib/supabase/types";

export default async function Startseite() {
  await getAktuellerNutzer();
  const supabase = await createClient();

  const [{ data: videos }, { data: kategorien }, { data: teile }] = await Promise.all([
    supabase
      .from("videos")
      .select(
        "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme))",
      )
      .eq("status", "veroeffentlicht")
      .order("erstellt_am", { ascending: false }),
    supabase.from("kategorien").select("*").order("name"),
    supabase.from("teile").select("*").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Video-Bibliothek</h1>
      <p className="mt-1 text-sm text-slate-500">
        Finde kurze Erklärvideos zu Maschinenteilen – filtere oder suche direkt los.
      </p>

      <Videothek
        videos={(videos ?? []) as VideoMitDetails[]}
        kategorien={(kategorien ?? []) as Kategorie[]}
        teile={(teile ?? []) as Teil[]}
      />
    </div>
  );
}

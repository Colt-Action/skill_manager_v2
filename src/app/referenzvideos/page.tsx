import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import ReferenzVideos from "@/components/ReferenzVideos";
import type { Kategorie, VideoMitDetails } from "@/lib/supabase/types";

export default async function ReferenzvideosSeite() {
  await getAktuellerNutzer();
  const supabase = await createClient();

  const [{ data: videos }, { data: kategorien }] = await Promise.all([
    supabase
      .from("videos")
      .select(
        "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme)), referenz_video_details(*)",
      )
      .eq("status", "veroeffentlicht")
      .eq("video_typ", "referenz")
      .order("erstellt_am", { ascending: false }),
    supabase.from("kategorien").select("*").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Für den Vertrieb</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        Referenzvideos
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        Zeig Kunden, wie gut HOSCH-Geräte in vergleichbaren Anlagen laufen – filterbar nach
        Material, Geschwindigkeit, Förderbandbreite und mehr.
      </p>

      <ReferenzVideos
        videos={(videos ?? []) as VideoMitDetails[]}
        kategorien={(kategorien ?? []) as Kategorie[]}
      />
    </div>
  );
}

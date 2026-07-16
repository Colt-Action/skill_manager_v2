import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import VideoCard from "@/components/VideoCard";
import type { Teil, VideoMitDetails } from "@/lib/supabase/types";

// Diese Seite ist als Ziel für einen Link aus der firmeninternen Service-App
// gedacht: Wer dort einen TAG (QR-Code oder NFC-Chip) an einem Gerät scannt,
// sieht die Konfiguration mit allen verbauten Teilen. Ein Button/Link dort
// kann auf diese Seite verweisen und die Teilenummern des Geräts übergeben,
// z. B. /geraet?teile=RG1-123,FD-45,HD-PU-9&geraet=Presse+12
// Diese Seite braucht dafür keinen Zugriff auf die Service-App selbst.
export default async function GeraetSeite({
  searchParams,
}: {
  searchParams: Promise<{ teile?: string; geraet?: string }>;
}) {
  const nutzer = await getAktuellerNutzer();
  const { teile: teileParam, geraet } = await searchParams;

  const teilenummern = (teileParam ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (teilenummern.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Geräte-Ansicht</p>
        <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-foreground">
          Kein Gerät angegeben
        </h1>
        <p className="mt-2 text-sm text-foreground-soft">
          Diese Seite zeigt Videos zu allen Teilen eines Geräts, wenn sie über einen Link mit
          Teilenummern aufgerufen wird, z. B.{" "}
          <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs ring-1 ring-line">
            /geraet?teile=RG1-123,FD-45
          </code>
          . Nutz stattdessen die{" "}
          <Link href="/videothek" className="text-accent hover:text-accent-deep">
            Video-Bibliothek
          </Link>
          , um gezielt zu suchen.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: teileGefunden } = await supabase
    .from("teile")
    .select("*")
    .in("teilenummer", teilenummern);

  const teileListe = (teileGefunden ?? []) as Teil[];
  const teilIds = teileListe.map((t) => t.id);

  const { data: videos } =
    teilIds.length > 0
      ? await supabase
          .from("videos")
          .select(
            "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme))",
          )
          .in("teil_id", teilIds)
          .eq("status", "veroeffentlicht")
          .order("erstellt_am", { ascending: false })
      : { data: [] };

  const videoListe = (videos ?? []) as VideoMitDetails[];
  const nichtGefunden = teilenummern.filter(
    (nr) => !teileListe.some((t) => t.teilenummer === nr),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Geräte-Ansicht</p>
      <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-foreground">
        {geraet ? geraet : "Verbaute Teile & Videos"}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        Alle Videos zu den {teileListe.length} Teilen, die laut Geräte-Konfiguration verbaut sind.
      </p>
      <p className="mt-1 text-xs text-foreground-soft">
        Angeforderte Teilenummern: {teilenummern.join(", ")}
      </p>

      {nichtGefunden.length > 0 && (
        <p className="mt-3 rounded-md bg-accent/10 px-3 py-2 text-sm text-accent-deep">
          Nicht in Skill Manager gefunden: {nichtGefunden.join(", ")} – für diese Teile fehlt evtl.
          noch ein Eintrag unter „Kategorien &amp; Teile&ldquo;.
        </p>
      )}

      {videoListe.length === 0 ? (
        <p className="mt-10 text-sm text-foreground-soft">
          Für die gefundenen Teile gibt es aktuell noch kein veröffentlichtes Video.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videoListe.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-foreground-soft">
        Angemeldet als {nutzer.name}. Diese Seite ist für Links aus der Service-App gedacht, die
        an einem TAG (QR-Code/NFC) hinterlegt werden.
      </p>
    </div>
  );
}

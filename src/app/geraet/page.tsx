import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import VideoCard from "@/components/VideoCard";
import EmptyState from "@/components/EmptyState";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
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
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const { teile: teileParam, geraet } = await searchParams;

  const teilenummern = (teileParam ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (teilenummern.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("geraet.eyebrow", sprache)}</p>
        <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-foreground">
          {t("geraet.keinGeraet", sprache)}
        </h1>
        <p className="mt-2 text-sm text-foreground-soft">
          {t("geraet.keinGeraetHinweis", sprache)}{" "}
          <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs ring-1 ring-line">
            /geraet?teile=RG1-123,FD-45
          </code>
          . {t("geraet.keinGeraetLink", sprache)}{" "}
          <Link href="/videothek" className="text-accent hover:text-accent-deep">
            {t("geraet.videoBibliothek", sprache)}
          </Link>
          {t("geraet.umGezieltZuSuchen", sprache)}
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

  const [{ data: videos }, { data: favoriten }] = await Promise.all([
    teilIds.length > 0
      ? supabase
          .from("videos")
          .select(
            "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme))",
          )
          .in("teil_id", teilIds)
          .eq("status", "veroeffentlicht")
          .eq("video_typ", "schulung")
          .order("erstellt_am", { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase.from("favoriten").select("video_id").eq("user_id", nutzer.id).is("merkteam_id", null),
  ]);

  const videoListe = (videos ?? []) as VideoMitDetails[];
  const gemerkteIds = new Set((favoriten ?? []).map((f) => f.video_id));
  const nichtGefunden = teilenummern.filter(
    (nr) => !teileListe.some((t) => t.teilenummer === nr),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("geraet.eyebrow", sprache)}</p>
      <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-foreground">
        {geraet ? geraet : t("geraet.titelFallback", sprache)}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        {t("geraet.untertitel", sprache, { anzahl: String(teileListe.length) })}
      </p>
      <p className="mt-1 text-xs text-foreground-soft">
        {t("geraet.angeforderteTeilenummern", sprache, { nummern: teilenummern.join(", ") })}
      </p>

      {nichtGefunden.length > 0 && (
        <p className="mt-3 rounded-md bg-accent/10 px-3 py-2 text-sm text-accent-deep">
          {t("geraet.nichtGefunden", sprache, { nummern: nichtGefunden.join(", ") })}
        </p>
      )}

      {videoListe.length === 0 ? (
        <EmptyState icon="🎬" text={t("geraet.keineVideos", sprache)} />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videoListe.map((video) => (
            <VideoCard key={video.id} video={video} gemerkt={gemerkteIds.has(video.id)} />
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-foreground-soft">
        {t("geraet.angemeldetAls", sprache, { name: nutzer.name })}
      </p>
    </div>
  );
}

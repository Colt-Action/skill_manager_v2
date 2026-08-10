import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import VideoCard from "@/components/VideoCard";
import ReferenzCard from "@/components/ReferenzCard";
import EmptyState from "@/components/EmptyState";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { Kategorie, ReferenzMitDetails, VideoMitDetails } from "@/lib/supabase/types";

const VIDEO_SELECT =
  "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme))";

const REFERENZ_SELECT =
  "*, teile(id, name, teilenummer, beschreibung, kategorie_id), kategorien(id, name, ebene, parent_kategorie_id), referenz_tags(tags(id, name, synonyme)), referenz_metadaten(*), referenz_video(*), referenz_foto(*), referenz_dokument(*), referenz_link(*), referenz_likes(user_id)";

interface FavoritZeile {
  merkteam_id: string | null;
  videos: VideoMitDetails | null;
}

interface ReferenzFavoritZeile {
  merkteam_id: string | null;
  referenzen: ReferenzMitDetails | null;
}

interface MerkteamZeile {
  merkteams: { id: string; name: string } | { id: string; name: string }[] | null;
}

export default async function FavoritenSeite() {
  const nutzer = await getAktuellerNutzer();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const [{ data: favoriten }, { data: referenzFavoriten }, { data: meineTeamsRoh }, { data: kategorien }] =
    await Promise.all([
      supabase
        .from("favoriten")
        .select(`merkteam_id, videos(${VIDEO_SELECT})`)
        .not("video_id", "is", null)
        .order("erstellt_am", { ascending: false }),
      supabase
        .from("favoriten")
        .select(`merkteam_id, referenzen(${REFERENZ_SELECT})`)
        .not("referenz_id", "is", null)
        .order("erstellt_am", { ascending: false }),
      supabase.from("merkteam_mitglieder").select("merkteams(id, name)").eq("user_id", nutzer.id),
      supabase.from("kategorien").select("*").order("name"),
    ]);

  const favoritenZeilen = (favoriten ?? []) as unknown as FavoritZeile[];
  const persoenlicheVideos = favoritenZeilen
    .filter((f) => !f.merkteam_id)
    .map((f) => f.videos)
    .filter((v): v is VideoMitDetails => v !== null);
  const persoenlicheIds = new Set(persoenlicheVideos.map((v) => v.id));

  const referenzFavoritenZeilen = (referenzFavoriten ?? []) as unknown as ReferenzFavoritZeile[];
  const persoenlicheReferenzen = referenzFavoritenZeilen
    .filter((f) => !f.merkteam_id)
    .map((f) => f.referenzen)
    .filter((r): r is ReferenzMitDetails => r !== null);

  const meineTeams = ((meineTeamsRoh ?? []) as unknown as MerkteamZeile[])
    .map((z) => (Array.isArray(z.merkteams) ? (z.merkteams[0] ?? null) : z.merkteams))
    .filter((z): z is { id: string; name: string } => z !== null);

  const teamAbschnitte = meineTeams.map((team) => ({
    team,
    videos: favoritenZeilen
      .filter((f) => f.merkteam_id === team.id)
      .map((f) => f.videos)
      .filter((v): v is VideoMitDetails => v !== null),
    referenzen: referenzFavoritenZeilen
      .filter((f) => f.merkteam_id === team.id)
      .map((f) => f.referenzen)
      .filter((r): r is ReferenzMitDetails => r !== null),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("favoriten.eyebrow", sprache)}</p>
          <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
            {t("favoriten.titel", sprache)}
          </h1>
          <p className="mt-1 text-sm text-foreground-soft">{t("favoriten.untertitel", sprache)}</p>
        </div>
        <Link
          href="/merkteams"
          className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground-soft hover:bg-surface"
        >
          {t("favoriten.merkteamsVerwalten", sprache)}
        </Link>
      </div>

      <h2 className="mt-6 font-mono text-xs uppercase tracking-wide text-foreground-soft">{t("favoriten.nurFuerMich", sprache)}</h2>
      {persoenlicheVideos.length === 0 && persoenlicheReferenzen.length === 0 ? (
        <EmptyState icon="⭐" text={t("favoriten.leer", sprache)} />
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {persoenlicheVideos.map((video) => (
            <VideoCard key={video.id} video={video} gemerkt />
          ))}
          {persoenlicheReferenzen.map((referenz) => (
            <ReferenzCard
              key={referenz.id}
              referenz={referenz}
              kategorien={(kategorien ?? []) as Kategorie[]}
              aktuellerNutzerId={nutzer.id}
              gemerkt
            />
          ))}
        </div>
      )}

      {teamAbschnitte.map(({ team, videos, referenzen }) => (
        <div key={team.id} className="mt-8">
          <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">{team.name}</h2>
          {videos.length === 0 && referenzen.length === 0 ? (
            <p className="mt-3 text-sm text-foreground-soft">{t("favoriten.teamLeer", sprache)}</p>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} gemerkt={persoenlicheIds.has(video.id)} />
              ))}
              {referenzen.map((referenz) => (
                <ReferenzCard
                  key={referenz.id}
                  referenz={referenz}
                  kategorien={(kategorien ?? []) as Kategorie[]}
                  aktuellerNutzerId={nutzer.id}
                  gemerkt={persoenlicheReferenzen.some((r) => r.id === referenz.id)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

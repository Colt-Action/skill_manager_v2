import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import VideoCard from "@/components/VideoCard";
import OnboardingTour from "@/components/OnboardingTour";
import type { VideoMitDetails } from "@/lib/supabase/types";

interface AnsichtZeile {
  video_id: string;
  angesehen_am: string;
  videos: VideoMitDetails | null;
}

interface FavoritZeile {
  video_id: string;
  videos: VideoMitDetails | null;
}

const VIDEO_SPALTEN =
  "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme))";

export default async function DashboardSeite() {
  const nutzer = await getAktuellerNutzer();
  const supabase = await createClient();
  const istAdminOderHoeher = nutzer.rolle === "admin" || nutzer.rolle === "superadmin";

  const [{ data: ansichten }, { data: neueVideos }, { data: favoriten }] = await Promise.all([
    supabase
      .from("video_ansichten")
      .select(`video_id, angesehen_am, videos(${VIDEO_SPALTEN})`)
      .eq("user_id", nutzer.id)
      .order("angesehen_am", { ascending: false })
      .limit(6),
    supabase
      .from("videos")
      .select(VIDEO_SPALTEN)
      .eq("status", "veroeffentlicht")
      .order("erstellt_am", { ascending: false })
      .limit(6),
    supabase
      .from("favoriten")
      .select(`video_id, videos(${VIDEO_SPALTEN})`)
      .eq("user_id", nutzer.id)
      .order("erstellt_am", { ascending: false })
      .limit(4),
  ]);

  const zuletztAngesehen = ((ansichten ?? []) as unknown as AnsichtZeile[])
    .map((a) => a.videos)
    .filter((v): v is VideoMitDetails => v !== null);

  const merkliste = ((favoriten ?? []) as unknown as FavoritZeile[])
    .map((f) => f.videos)
    .filter((v): v is VideoMitDetails => v !== null);

  const { data: veroeffentlichteVideos } = await supabase
    .from("videos")
    .select("hochgeladen_von")
    .eq("status", "veroeffentlicht");

  const beitragsZaehler = new Map<string, number>();
  for (const v of veroeffentlichteVideos ?? []) {
    if (!v.hochgeladen_von) continue;
    beitragsZaehler.set(v.hochgeladen_von, (beitragsZaehler.get(v.hochgeladen_von) ?? 0) + 1);
  }
  const topIds = Array.from(beitragsZaehler.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  let topBeitragende: { id: string; name: string; avatar_url: string | null; anzahl: number }[] = [];
  if (topIds.length > 0) {
    const { data: topNutzer } = await supabase
      .from("users")
      .select("id, name, avatar_url")
      .in("id", topIds);
    topBeitragende = (topNutzer ?? [])
      .map((n) => ({ ...n, anzahl: beitragsZaehler.get(n.id) ?? 0 }))
      .sort((a, b) => b.anzahl - a.anzahl);
  }

  let kennzahlen: { pruefung: number; loeschanfragen: number; teilAnfragen: number } | null = null;
  if (istAdminOderHoeher) {
    const [{ count: pruefung }, { count: loeschanfragen }, { count: teilAnfragen }] = await Promise.all([
      supabase.from("videos").select("id", { count: "exact", head: true }).eq("status", "pruefung"),
      supabase.from("videos").select("id", { count: "exact", head: true }).eq("loeschung_angefragt", true),
      supabase.from("teil_anfragen").select("id", { count: "exact", head: true }).eq("bearbeitet", false),
    ]);
    kennzahlen = {
      pruefung: pruefung ?? 0,
      loeschanfragen: loeschanfragen ?? 0,
      teilAnfragen: teilAnfragen ?? 0,
    };
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {!nutzer.onboarding_gesehen && <OnboardingTour />}
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Werkstatt-Konsole</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        Willkommen zurück, {nutzer.name.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        Hier ist dein Überblick – oder spring direkt in die Video-Bibliothek.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/videothek"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-accent-ink transition hover:bg-accent-deep"
        >
          Video-Bibliothek
        </Link>
        {nutzer.rolle !== "zuschauer" && (
          <Link
            href="/upload"
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-foreground hover:bg-surface"
          >
            Video hochladen
          </Link>
        )}
        <Link
          href="/teil-melden"
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-foreground hover:bg-surface"
        >
          Teil nicht gefunden?
        </Link>
      </div>

      {istAdminOderHoeher && kennzahlen && (
        <section className="mt-8">
          <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">Verwaltung – offene Punkte</h2>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <KennzahlKachel
              href="/admin"
              wert={kennzahlen.pruefung}
              label="Videos in Prüfung"
            />
            <KennzahlKachel
              href="/admin/loeschanfragen"
              wert={kennzahlen.loeschanfragen}
              label="Offene Löschanfragen"
            />
            <KennzahlKachel
              href="/admin/teil-anfragen"
              wert={kennzahlen.teilAnfragen}
              label="Teil-Meldungen"
            />
          </div>
        </section>
      )}

      {zuletztAngesehen.length > 0 && (
        <section className="mt-8">
          <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">Zuletzt angesehen</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {zuletztAngesehen.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">Neu in der Bibliothek</h2>
          <Link href="/videothek" className="text-xs text-accent hover:text-accent-deep">
            Alle ansehen →
          </Link>
        </div>
        {!neueVideos || neueVideos.length === 0 ? (
          <p className="mt-4 text-sm text-foreground-soft">Noch keine veröffentlichten Videos.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(neueVideos as VideoMitDetails[]).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </section>

      {topBeitragende.length > 0 && (
        <section className="mt-8">
          <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">Top-Beitragende</h2>
          <p className="mt-1 text-xs text-foreground-soft">
            Technikerinnen und Techniker mit den meisten veröffentlichten Videos.
          </p>
          <div className="mt-3 divide-y divide-line overflow-hidden rounded-xl bg-surface ring-1 ring-line">
            {topBeitragende.map((n, i) => (
              <div key={n.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-5 shrink-0 text-center font-mono text-xs text-foreground-soft">
                  {i + 1}
                </span>
                {n.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-line" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-ink">
                    {n.name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
                <span className="flex-1 text-sm text-foreground">{n.name}</span>
                <span className="font-mono text-xs text-foreground-soft">
                  {n.anzahl} {n.anzahl === 1 ? "Video" : "Videos"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {merkliste.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">Deine Merkliste</h2>
            <Link href="/favoriten" className="text-xs text-accent hover:text-accent-deep">
              Alle ansehen →
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {merkliste.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function KennzahlKachel({ href, wert, label }: { href: string; wert: number; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col rounded-xl bg-surface p-4 ring-1 ring-line transition hover:ring-accent"
    >
      <span className="font-display text-3xl font-bold text-foreground">{wert}</span>
      <span className="mt-1 text-sm text-foreground-soft">{label}</span>
    </Link>
  );
}

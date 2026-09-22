import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import VideoCard from "@/components/VideoCard";
import ReferenzCard from "@/components/ReferenzCard";
import MerkStern from "@/components/MerkStern";
import OnboardingTour from "@/components/OnboardingTour";
import Typenschild from "@/components/Typenschild";
import SectionLinie from "@/components/SectionLinie";
import Index, { type IndexZeile } from "@/components/Index";
import { dauerFormatieren } from "@/lib/format";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { ReferenzMitDetails, VideoMitDetails } from "@/lib/supabase/types";

interface AnsichtZeile {
  video_id: string;
  angesehen_am: string;
  videos: VideoMitDetails | null;
}

interface MerklisteVideoZeile {
  erstellt_am: string;
  videos: { id: string; titel: string } | null;
}

interface MerklisteReferenzZeile {
  erstellt_am: string;
  referenzen: { id: string; titel: string; typ: "video" | "foto" | "dokument" | "link" } | null;
}

interface TeamAktivitaetZeile {
  id: string;
  erstellt_am: string;
  users: { name: string } | { name: string }[] | null;
  merkteams: { name: string } | { name: string }[] | null;
  videos: { id: string; titel: string } | { id: string; titel: string }[] | null;
  referenzen: { id: string; titel: string } | { id: string; titel: string }[] | null;
}

const VIDEO_SPALTEN =
  "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme))";

const REFERENZ_SELECT =
  "*, teile(id, name, teilenummer, beschreibung, kategorie_id), kategorien(id, name, ebene, parent_kategorie_id), referenz_tags(tags(id, name, synonyme)), referenz_metadaten(*), referenz_video(*), referenz_foto(*), referenz_dokument(*), referenz_link(*), referenz_likes(user_id)";

function einzeln<T>(wert: T | T[] | null | undefined): T | null {
  if (!wert) return null;
  return Array.isArray(wert) ? (wert[0] ?? null) : wert;
}

export default async function DashboardSeite() {
  const nutzer = await getAktuellerNutzer();
  const supabase = await createClient();
  const istAdminOderHoeher = nutzer.rolle === "admin" || nutzer.rolle === "superadmin";
  const istUploader = nutzer.rolle !== "zuschauer";
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;

  const [
    { data: ansichten },
    { data: neueVideos },
    { data: neueReferenzen },
    { data: alleGemerkteVideos },
    { data: alleGemerkteReferenzen },
    { data: merklisteVideosRoh },
    { data: merklisteReferenzenRoh },
    { data: meineMerkteamZeilen },
  ] = await Promise.all([
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
      .eq("video_typ", "schulung")
      .order("erstellt_am", { ascending: false })
      .limit(6),
    supabase
      .from("referenzen")
      .select(REFERENZ_SELECT)
      .eq("status", "veroeffentlicht")
      .order("erstellt_am", { ascending: false })
      .limit(6),
    supabase.from("favoriten").select("video_id").eq("user_id", nutzer.id).is("merkteam_id", null),
    supabase.from("favoriten").select("referenz_id").eq("user_id", nutzer.id).is("merkteam_id", null),
    supabase
      .from("favoriten")
      .select("erstellt_am, videos(id, titel)")
      .eq("user_id", nutzer.id)
      .is("merkteam_id", null)
      .not("video_id", "is", null)
      .order("erstellt_am", { ascending: false })
      .limit(6),
    supabase
      .from("favoriten")
      .select("erstellt_am, referenzen(id, titel, typ)")
      .eq("user_id", nutzer.id)
      .is("merkteam_id", null)
      .not("referenz_id", "is", null)
      .order("erstellt_am", { ascending: false })
      .limit(6),
    supabase.from("merkteam_mitglieder").select("merkteam_id").eq("user_id", nutzer.id),
  ]);

  const gemerkteVideoIds = new Set((alleGemerkteVideos ?? []).map((f) => f.video_id));
  const gemerkteReferenzIds = new Set(
    (alleGemerkteReferenzen ?? []).map((f) => f.referenz_id).filter((id): id is string => Boolean(id)),
  );

  const zuletztAngesehen = ((ansichten ?? []) as unknown as AnsichtZeile[])
    .map((a) => a.videos)
    .filter((v): v is VideoMitDetails => v !== null);

  // "Weiter bei": das zuletzt angesehene Video wird zum Dashboard-Header
  // (Designkonzept "Typenschild" Rev. 02, Abschnitt I.3). Ohne Verlauf
  // übernimmt stattdessen ein Teilenummer-Suchfeld die Header-Rolle.
  const weiterBeiVideo = zuletztAngesehen[0] ?? null;

  // "Neu": die früher getrennten Abschnitte "Neu in der Bibliothek" und "Neu
  // im Referenzbereich" werden zu einem gemeinsamen, nach Datum sortierten
  // Strom zusammengeführt (Rev. 02, Abschnitt I.12).
  type NeuEintrag = { key: string; erstelltAm: string } & (
    | { art: "video"; video: VideoMitDetails }
    | { art: "referenz"; referenz: ReferenzMitDetails }
  );
  const neu: NeuEintrag[] = [
    ...((neueVideos ?? []) as VideoMitDetails[]).map(
      (video): NeuEintrag => ({ key: `video-${video.id}`, art: "video", video, erstelltAm: video.erstellt_am }),
    ),
    ...((neueReferenzen ?? []) as ReferenzMitDetails[]).map(
      (referenz): NeuEintrag => ({
        key: `referenz-${referenz.id}`,
        art: "referenz",
        referenz,
        erstelltAm: referenz.erstellt_am,
      }),
    ),
  ]
    .sort((a, b) => (a.erstelltAm < b.erstelltAm ? 1 : -1))
    .slice(0, 8);

  // Kompakte Merkliste fürs Dashboard: Videos und Referenzen zusammengeführt
  // und nach Merk-Zeitpunkt sortiert, statt wie bisher als eigener,
  // videos-only Grid-Abschnitt ganz unten (der bei leerer Liste komplett
  // verschwand und dadurch kaum auffiel).
  type MerklisteEintrag = { key: string; titel: string; href: string; erstelltAm: string } & (
    | { art: "video"; id: string }
    | { art: "referenz"; id: string }
  );
  const merklisteVideos: MerklisteEintrag[] = ((merklisteVideosRoh ?? []) as unknown as MerklisteVideoZeile[])
    .filter((z) => z.videos !== null)
    .map((z) => ({
      key: `video-${z.videos!.id}`,
      art: "video" as const,
      id: z.videos!.id,
      titel: z.videos!.titel,
      href: `/videos/${z.videos!.id}`,
      erstelltAm: z.erstellt_am,
    }));
  const merklisteReferenzen: MerklisteEintrag[] = (
    (merklisteReferenzenRoh ?? []) as unknown as MerklisteReferenzZeile[]
  )
    .filter((z) => z.referenzen !== null)
    .map((z) => ({
      key: `referenz-${z.referenzen!.id}`,
      art: "referenz" as const,
      id: z.referenzen!.id,
      titel: z.referenzen!.titel,
      href: `/referenzbereich/${z.referenzen!.id}`,
      erstelltAm: z.erstellt_am,
    }));
  const merkliste = [...merklisteVideos, ...merklisteReferenzen]
    .sort((a, b) => (a.erstelltAm < b.erstelltAm ? 1 : -1))
    .slice(0, 6);

  const meineMerkteamIds = (meineMerkteamZeilen ?? []).map((z) => z.merkteam_id);

  let teamAktivitaet: TeamAktivitaetZeile[] = [];
  if (meineMerkteamIds.length > 0) {
    const { data } = await supabase
      .from("favoriten")
      .select("id, erstellt_am, users(name), merkteams(name), videos(id, titel), referenzen(id, titel)")
      .in("merkteam_id", meineMerkteamIds)
      .order("erstellt_am", { ascending: false })
      .limit(6);
    teamAktivitaet = (data ?? []) as unknown as TeamAktivitaetZeile[];
  }

  let uploadKennzahlen: { pruefung: number; veroeffentlicht: number } | null = null;
  if (istUploader) {
    const [
      { count: videosPruefung },
      { count: videosVeroeffentlicht },
      { count: refPruefung },
      { count: refVeroeffentlicht },
    ] = await Promise.all([
      supabase
        .from("videos")
        .select("id", { count: "exact", head: true })
        .eq("hochgeladen_von", nutzer.id)
        .eq("status", "pruefung"),
      supabase
        .from("videos")
        .select("id", { count: "exact", head: true })
        .eq("hochgeladen_von", nutzer.id)
        .eq("status", "veroeffentlicht"),
      supabase
        .from("referenzen")
        .select("id", { count: "exact", head: true })
        .eq("hochgeladen_von", nutzer.id)
        .eq("status", "pruefung"),
      supabase
        .from("referenzen")
        .select("id", { count: "exact", head: true })
        .eq("hochgeladen_von", nutzer.id)
        .eq("status", "veroeffentlicht"),
    ]);
    const pruefung = (videosPruefung ?? 0) + (refPruefung ?? 0);
    const veroeffentlicht = (videosVeroeffentlicht ?? 0) + (refVeroeffentlicht ?? 0);
    if (pruefung > 0 || veroeffentlicht > 0) {
      uploadKennzahlen = { pruefung, veroeffentlicht };
    }
  }

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

  const zuletztAngesehenZeilen: IndexZeile[] = zuletztAngesehen.map((video) => ({
    id: video.id,
    href: `/videos/${video.id}`,
    nummer: video.teile?.teilenummer,
    titel: video.titel,
    rechts: video.dauer != null ? dauerFormatieren(video.dauer) : undefined,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {!nutzer.onboarding_gesehen && <OnboardingTour />}

      {weiterBeiVideo ? (
        <Typenschild
          variante="gross"
          nummer={weiterBeiVideo.teile?.teilenummer}
          titel={weiterBeiVideo.titel}
          href={`/videos/${weiterBeiVideo.id}`}
          felder={[]}
        />
      ) : (
        <div className="border-t-[3px] border-signal bg-plate p-6 text-plate-ink md:p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-plate-soft">{t("dashboard.eyebrow", sprache)}</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-plate-ink">
            {t("dashboard.willkommen", sprache, { name: nutzer.name.split(" ")[0] })}
          </h1>
          <form action="/videothek" className="mt-5 max-w-sm">
            <input
              type="search"
              name="q"
              placeholder={t("dashboard.teilenummerSuchen", sprache)}
              className="h-12 w-full border border-plate-rule bg-white/[.06] px-3 font-mono text-base text-plate-ink placeholder:text-plate-soft outline-none focus:border-signal"
            />
          </form>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/videothek"
          className="rounded-[2px] bg-signal px-4 py-2 text-sm font-bold uppercase tracking-wide text-signal-ink transition hover:opacity-90"
        >
          {t("dashboard.videoBibliothek", sprache)}
        </Link>
        {nutzer.rolle !== "zuschauer" && (
          <Link
            href="/upload"
            className="rounded-[2px] border border-rule px-4 py-2 text-sm font-medium text-ink hover:bg-paper-2"
          >
            {t("dashboard.videoHochladen", sprache)}
          </Link>
        )}
        <Link
          href="/teil-melden"
          className="rounded-[2px] border border-rule px-4 py-2 text-sm font-medium text-ink hover:bg-paper-2"
        >
          {t("dashboard.teilNichtGefunden", sprache)}
        </Link>
      </div>

      {istAdminOderHoeher && kennzahlen && (
        <section className="mt-10">
          <SectionLinie titel={t("dashboard.verwaltungOffenePunkte", sprache)} />
          <div className="mt-3 grid grid-cols-1 gap-px bg-rule sm:grid-cols-3">
            <KennzahlKachel href="/admin" wert={kennzahlen.pruefung} label={t("dashboard.videosInPruefung", sprache)} />
            <KennzahlKachel
              href="/admin/loeschanfragen"
              wert={kennzahlen.loeschanfragen}
              label={t("dashboard.offeneLoeschanfragen", sprache)}
            />
            <KennzahlKachel
              href="/admin/teil-anfragen"
              wert={kennzahlen.teilAnfragen}
              label={t("dashboard.teilMeldungen", sprache)}
            />
          </div>
        </section>
      )}

      {uploadKennzahlen && (
        <section className="mt-10">
          <SectionLinie titel={t("dashboard.deineUploads", sprache)} />
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm text-ink">
            <span>
              <strong className="font-display text-xl">{uploadKennzahlen.pruefung}</strong>{" "}
              <span className="text-ink-soft">{t("dashboard.uploadsInPruefung", sprache)}</span>
            </span>
            <span>
              <strong className="font-display text-xl">{uploadKennzahlen.veroeffentlicht}</strong>{" "}
              <span className="text-ink-soft">{t("dashboard.uploadsVeroeffentlicht", sprache)}</span>
            </span>
          </div>
        </section>
      )}

      <section className="mt-10">
        <SectionLinie
          titel={t("dashboard.deineMerkliste", sprache)}
          rechts={
            merkliste.length > 0 ? (
              <Link href="/favoriten" className="font-mono text-xs uppercase tracking-wide text-annot hover:text-ink">
                {t("dashboard.alleAnsehen", sprache)}
              </Link>
            ) : undefined
          }
        />
        {merkliste.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">{t("dashboard.merklisteLeer", sprache)}</p>
        ) : (
          <div className="mt-1">
            {merkliste.map((eintrag) => (
              <Link
                key={eintrag.key}
                href={eintrag.href}
                className="flex items-center gap-3 border-b border-rule py-2.5 transition-colors hover:bg-paper-2"
              >
                <span className="flex-1 truncate text-sm text-ink">{eintrag.titel}</span>
                {eintrag.art === "video" ? (
                  <MerkStern videoId={eintrag.id} anfangsGemerkt variante="inline" />
                ) : (
                  <MerkStern referenzId={eintrag.id} anfangsGemerkt variante="inline" />
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {zuletztAngesehenZeilen.length > 0 && (
        <section className="mt-10">
          <SectionLinie titel={t("dashboard.zuletztAngesehen", sprache)} />
          <Index zeilen={zuletztAngesehenZeilen} />
        </section>
      )}

      <section className="mt-10">
        <SectionLinie titel={t("dashboard.neu", sprache)} />
        {neu.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">{t("dashboard.keineNeu", sprache)}</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {neu.map((eintrag) =>
              eintrag.art === "video" ? (
                <VideoCard key={eintrag.key} video={eintrag.video} gemerkt={gemerkteVideoIds.has(eintrag.video.id)} />
              ) : (
                <ReferenzCard
                  key={eintrag.key}
                  referenz={eintrag.referenz}
                  aktuellerNutzerId={nutzer.id}
                  gemerkt={gemerkteReferenzIds.has(eintrag.referenz.id)}
                />
              ),
            )}
          </div>
        )}
      </section>

      {teamAktivitaet.length > 0 && (
        <section className="mt-10">
          <SectionLinie titel={t("dashboard.merkteamAktivitaet", sprache)} />
          <div className="mt-1">
            {teamAktivitaet.map((eintrag) => {
              const nutzerName = einzeln(eintrag.users)?.name ?? "?";
              const teamName = einzeln(eintrag.merkteams)?.name ?? "";
              const video = einzeln(eintrag.videos);
              const referenz = einzeln(eintrag.referenzen);
              const ziel = video
                ? { titel: video.titel, href: `/videos/${video.id}` }
                : referenz
                  ? { titel: referenz.titel, href: `/referenzbereich/${referenz.id}` }
                  : null;
              if (!ziel) return null;
              return (
                <Link
                  key={eintrag.id}
                  href={ziel.href}
                  className="block border-b border-rule py-2.5 text-sm text-ink transition-colors hover:bg-paper-2"
                >
                  {t("dashboard.merkteamAktivitaetEintrag", sprache, {
                    name: nutzerName,
                    titel: ziel.titel,
                    team: teamName,
                  })}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {topBeitragende.length > 0 && (
        <section className="mt-10">
          <SectionLinie titel={t("dashboard.topBeitragende", sprache)} />
          <p className="mt-1 text-xs text-ink-soft">{t("dashboard.topBeitragendeUntertitel", sprache)}</p>
          <div className="mt-2">
            {topBeitragende.map((n, i) => (
              <div key={n.id} className="flex items-center gap-3 border-b border-rule py-2.5">
                <span className="w-5 shrink-0 text-center font-mono text-xs text-ink-faint">{i + 1}</span>
                {n.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-signal text-xs font-bold text-signal-ink">
                    {n.name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
                <span className="flex-1 text-sm text-ink">{n.name}</span>
                <span className="font-mono text-xs text-ink-soft">{n.anzahl}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function KennzahlKachel({ href, wert, label }: { href: string; wert: number; label: string }) {
  return (
    <Link href={href} className="flex flex-col bg-paper p-4 transition hover:bg-paper-2">
      <span className="font-display text-3xl font-bold text-ink">{wert}</span>
      <span className="mt-1 text-sm text-ink-soft">{label}</span>
    </Link>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import LikeButton from "@/components/LikeButton";
import AdminReferenzEditor from "@/components/AdminReferenzEditor";
import VerwandteReferenzen from "@/components/VerwandteReferenzen";
import VideoCard from "@/components/VideoCard";
import { referenzLikeUmschalten } from "@/lib/actions/referenzen";
import { pfadZuKategorie } from "@/lib/kategorieBaum";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { Kategorie, ReferenzMitDetails, Teil, VideoMitDetails } from "@/lib/supabase/types";

const VIDEO_SPALTEN =
  "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme))";

const REFERENZ_SELECT =
  "*, teile(id, name, teilenummer, beschreibung, kategorie_id), kategorien(id, name, ebene, parent_kategorie_id), referenz_tags(tags(id, name, synonyme)), referenz_metadaten(*), referenz_video(*), referenz_foto(*), referenz_dokument(*), referenz_link(*), referenz_likes(user_id)";

function einzeln<T>(wert: T | T[] | null | undefined): T | null {
  if (!wert) return null;
  return Array.isArray(wert) ? (wert[0] ?? null) : wert;
}

export default async function ReferenzDetailSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nutzer = await getAktuellerNutzer();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const [{ data: referenz }, { data: kategorien }, { data: teile }, { data: verknuepfungen }] = await Promise.all([
    supabase.from("referenzen").select(REFERENZ_SELECT).eq("id", id).maybeSingle(),
    supabase.from("kategorien").select("*").order("name"),
    supabase.from("teile").select("*").order("name"),
    supabase
      .from("referenz_verknuepfungen")
      .select(
        "referenz_id_a, referenz_id_b, a:referenzen!referenz_verknuepfungen_referenz_id_a_fkey(id, titel, typ), b:referenzen!referenz_verknuepfungen_referenz_id_b_fkey(id, titel, typ)"
      )
      .or(`referenz_id_a.eq.${id},referenz_id_b.eq.${id}`),
  ]);

  if (!referenz) notFound();
  const r = referenz as ReferenzMitDetails;

  const istAdminOderHoeher = nutzer.rolle === "admin" || nutzer.rolle === "superadmin";
  if (r.status !== "veroeffentlicht" && r.hochgeladen_von !== nutzer.id && !istAdminOderHoeher) {
    notFound();
  }

  const darfVerknuepfenBearbeiten =
    istAdminOderHoeher || (r.hochgeladen_von === nutzer.id && r.status !== "veroeffentlicht");

  const verwandteReferenzen = (verknuepfungen ?? [])
    .map((v) => {
      const andere = v.referenz_id_a === id ? einzeln(v.b) : einzeln(v.a);
      return andere ? { id: andere.id, titel: andere.titel, typ: andere.typ } : null;
    })
    .filter((v): v is { id: string; titel: string; typ: ReferenzMitDetails["typ"] } => v !== null);

  const eigeneKategorieId = r.kategorie_id ?? r.teile?.kategorie_id ?? null;
  const pfad = pfadZuKategorie(kategorien ?? [], eigeneKategorieId);
  const pfadNamen = pfad
    .map((kid) => (kategorien ?? []).find((k) => k.id === kid)?.name)
    .filter((name): name is string => Boolean(name));

  const likes = r.referenz_likes ?? [];
  const metadaten = einzeln(r.referenz_metadaten);

  const { data: trainingsvideosRoh } = r.teil_id
    ? await supabase
        .from("videos")
        .select(VIDEO_SPALTEN)
        .eq("teil_id", r.teil_id)
        .eq("video_typ", "schulung")
        .eq("status", "veroeffentlicht")
        .limit(4)
    : { data: [] };
  const trainingsvideos = (trainingsvideosRoh ?? []) as VideoMitDetails[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/referenzbereich" className="font-mono text-xs uppercase tracking-widest text-accent">
        ← {t("referenzbereich.titel", sprache)}
      </Link>

      <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide text-foreground">{r.titel}</h1>
      {pfadNamen.length > 0 && <p className="mt-1 font-mono text-xs text-blueprint">{pfadNamen.join(" › ")}</p>}

      <div className="mt-4">
        <ReferenzInhalt referenz={r} />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <LikeButton
          id={r.id}
          umschalten={referenzLikeUmschalten}
          anfangsAnzahl={likes.length}
          anfangsGeliked={likes.some((l) => l.user_id === nutzer.id)}
          eingeloggt
        />
        {r.teile && (
          <span className="font-mono text-xs text-foreground-soft">
            {r.teile.name} · Teil-Nr. {r.teile.teilenummer}
          </span>
        )}
      </div>

      {metadaten && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {metadaten.material && <Badge>{metadaten.material}</Badge>}
          {metadaten.foerderbandbreite && <Badge>{metadaten.foerderbandbreite}</Badge>}
          {metadaten.geschwindigkeit_ms != null && <Badge>{metadaten.geschwindigkeit_ms.toFixed(1)} m/s</Badge>}
          {metadaten.belt_connection && <Badge>{metadaten.belt_connection}</Badge>}
          {metadaten.land && <Badge>{metadaten.land}</Badge>}
        </div>
      )}

      {r.beschreibung && <p className="mt-4 whitespace-pre-wrap text-sm text-foreground-soft">{r.beschreibung}</p>}

      {r.referenz_tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {r.referenz_tags.map(({ tags }) => (
            <span key={tags.id} className="rounded-full bg-background px-2 py-0.5 text-[11px] text-foreground-soft ring-1 ring-line">
              {tags.name}
            </span>
          ))}
        </div>
      )}

      {trainingsvideos.length > 0 && (
        <div className="mt-8">
          <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">
            {t("referenzDetail.trainingsvideosZumTeil", sprache)}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {trainingsvideos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </div>
      )}

      {istAdminOderHoeher && (
        <div className="mt-8">
          <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">
            {t("adminReferenzEditor.beschreibungLabel", sprache)} ({t("nav.verwaltung", sprache)})
          </h2>
          <div className="mt-2">
            <AdminReferenzEditor referenz={r} kategorien={(kategorien ?? []) as Kategorie[]} teile={(teile ?? []) as Teil[]} />
          </div>
        </div>
      )}

      <VerwandteReferenzen
        referenzId={r.id}
        anfangsVerknuepft={verwandteReferenzen}
        darfBearbeiten={darfVerknuepfenBearbeiten}
      />
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blueprint/10 px-2.5 py-1 font-mono text-xs text-blueprint">{children}</span>
  );
}

function ReferenzInhalt({ referenz }: { referenz: ReferenzMitDetails }) {
  if (referenz.typ === "video") {
    const inhalt = einzeln(referenz.referenz_video);
    if (!inhalt) return null;
    return <video src={inhalt.datei_url} controls className="aspect-video w-full rounded-xl bg-nav" />;
  }
  if (referenz.typ === "foto") {
    const inhalt = einzeln(referenz.referenz_foto);
    if (!inhalt) return null;
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {inhalt.vorher_url && (
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wide text-foreground-soft">Vorher</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={inhalt.vorher_url} alt="Vorher" className="w-full rounded-xl object-cover ring-1 ring-line" />
          </div>
        )}
        {inhalt.nachher_url && (
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wide text-foreground-soft">Nachher</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={inhalt.nachher_url} alt="Nachher" className="w-full rounded-xl object-cover ring-1 ring-line" />
          </div>
        )}
      </div>
    );
  }
  if (referenz.typ === "dokument") {
    const inhalt = einzeln(referenz.referenz_dokument);
    if (!inhalt) return null;
    return (
      <a
        href={inhalt.datei_url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-xl bg-surface p-4 ring-1 ring-line hover:ring-accent"
      >
        <span className="text-3xl">📄</span>
        <span className="text-sm font-medium text-foreground">{inhalt.dateiname}</span>
      </a>
    );
  }
  const inhalt = einzeln(referenz.referenz_link);
  if (!inhalt) return null;
  return (
    <a
      href={inhalt.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-xl bg-surface p-4 ring-1 ring-line hover:ring-accent"
    >
      <span className="text-3xl">🔗</span>
      <span className="text-sm font-medium text-foreground">{inhalt.quelle ?? inhalt.url}</span>
    </a>
  );
}

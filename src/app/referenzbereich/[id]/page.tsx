import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import LikeButton from "@/components/LikeButton";
import MerkStern from "@/components/MerkStern";
import AdminReferenzEditor from "@/components/AdminReferenzEditor";
import VerwandteReferenzen from "@/components/VerwandteReferenzen";
import VideoCard from "@/components/VideoCard";
import Typenschild, { type TypenschildFeld } from "@/components/Typenschild";
import SectionLinie from "@/components/SectionLinie";
import VorherNachher from "@/components/VorherNachher";
import Icon from "@/components/icons/Icon";
import { referenzLikeUmschalten } from "@/lib/actions/referenzen";
import { pfadZuKategorie } from "@/lib/kategorieBaum";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache, type Sprache } from "@/lib/i18n/sprachen";
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

  const [{ data: referenz }, { data: kategorien }, { data: teile }, { data: verknuepfungen }, { data: uebersetzungenRoh }] =
    await Promise.all([
      supabase.from("referenzen").select(REFERENZ_SELECT).eq("id", id).maybeSingle(),
      supabase.from("kategorien").select("*").order("name"),
      supabase.from("teile").select("*").order("name"),
      supabase
        .from("referenz_verknuepfungen")
        .select(
          "referenz_id_a, referenz_id_b, a:referenzen!referenz_verknuepfungen_referenz_id_a_fkey(id, titel, typ), b:referenzen!referenz_verknuepfungen_referenz_id_b_fkey(id, titel, typ)"
        )
        .or(`referenz_id_a.eq.${id},referenz_id_b.eq.${id}`),
      supabase
        .from("uebersetzungen")
        .select("feld, sprache, text")
        .eq("tabelle", "referenzen")
        .eq("datensatz_id", id)
        .eq("sprache", sprache),
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

  // Übersetzter Titel/Beschreibung, falls ein Admin sie unter "Übersetzungen"
  // für die aktuelle Sprache hinterlegt hat - analog zur Video-Detailseite.
  const uebersetzterTitel = uebersetzungenRoh?.find((u) => u.feld === "titel")?.text;
  const uebersetzteBeschreibung = uebersetzungenRoh?.find((u) => u.feld === "beschreibung")?.text;
  const hatUebersetzung = Boolean(uebersetzterTitel || uebersetzteBeschreibung);
  const zeigeUebersetzungsHinweis = sprache !== STANDARD_SPRACHE && !hatUebersetzung;
  const angezeigterTitel = uebersetzterTitel || r.titel;
  const angezeigteBeschreibung = uebersetzteBeschreibung || r.beschreibung;

  const [{ data: trainingsvideosRoh }, { data: favoriten }, { data: eigeneFavoriten }] = await Promise.all([
    r.teil_id
      ? supabase
          .from("videos")
          .select(VIDEO_SPALTEN)
          .eq("teil_id", r.teil_id)
          .eq("video_typ", "schulung")
          .eq("status", "veroeffentlicht")
          .limit(4)
      : Promise.resolve({ data: [] }),
    supabase.from("favoriten").select("video_id").eq("user_id", nutzer.id).is("merkteam_id", null),
    supabase
      .from("favoriten")
      .select("id")
      .eq("referenz_id", r.id)
      .eq("user_id", nutzer.id)
      .is("merkteam_id", null)
      .maybeSingle(),
  ]);
  const trainingsvideos = (trainingsvideosRoh ?? []) as VideoMitDetails[];
  const gemerkteIds = new Set((favoriten ?? []).map((f) => f.video_id));
  const referenzGemerkt = Boolean(eigeneFavoriten);

  const felder: TypenschildFeld[] = metadaten
    ? ([
        metadaten.material ? { label: t("referenzvideos.material", sprache), wert: metadaten.material } : null,
        metadaten.foerderbandbreite
          ? { label: t("referenzvideos.foerderbandbreite", sprache), wert: metadaten.foerderbandbreite }
          : null,
        metadaten.geschwindigkeit_ms != null
          ? { label: t("referenzvideos.geschwindigkeit", sprache), wert: `${metadaten.geschwindigkeit_ms.toFixed(1)} m/s` }
          : null,
        metadaten.belt_connection
          ? { label: t("referenzvideos.beltConnection", sprache), wert: metadaten.belt_connection }
          : null,
        metadaten.abstreifsegment
          ? { label: t("referenzvideos.abstreifsegment", sprache), wert: metadaten.abstreifsegment }
          : null,
        metadaten.verlagerung
          ? { label: t("referenzvideos.verlagerung", sprache), wert: metadaten.verlagerung }
          : null,
        metadaten.land ? { label: t("referenzvideos.land", sprache), wert: metadaten.land } : null,
      ].filter((f): f is TypenschildFeld => f !== null))
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/referenzbereich" className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-signal">
        <Icon name="chevron" size={12} className="rotate-90" /> {t("referenzbereich.titel", sprache)}
      </Link>
      {pfadNamen.length > 0 && <p className="mt-2 font-mono text-xs text-annot">{pfadNamen.join(" › ")}</p>}

      {zeigeUebersetzungsHinweis && (
        <p className="mt-2 border-l-[3px] border-annot bg-paper-2 px-3 py-2 text-xs text-annot">
          {t("videoDetail.hinweisNichtUebersetzt", sprache)}
        </p>
      )}

      <div className="mt-4">
        <ReferenzInhalt referenz={r} sprache={sprache} />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <LikeButton
          id={r.id}
          umschalten={referenzLikeUmschalten}
          anfangsAnzahl={likes.length}
          anfangsGeliked={likes.some((l) => l.user_id === nutzer.id)}
          eingeloggt
        />
        <MerkStern referenzId={r.id} anfangsGemerkt={referenzGemerkt} variante="inline" />
      </div>

      <Typenschild variante="gross" nummer={r.teile?.teilenummer} titel={angezeigterTitel} felder={felder} />
      {r.teile?.name && <p className="mt-2 font-mono text-xs text-annot">{r.teile.name}</p>}

      {angezeigteBeschreibung && (
        <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">{angezeigteBeschreibung}</p>
      )}

      {r.referenz_tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {r.referenz_tags.map(({ tags }) => (
            <span key={tags.id} className="rounded-[2px] border border-rule px-2 py-0.5 text-[11px] text-ink-soft">
              {tags.name}
            </span>
          ))}
        </div>
      )}

      {trainingsvideos.length > 0 && (
        <section className="mt-8">
          <SectionLinie titel={t("referenzDetail.trainingsvideosZumTeil", sprache)} />
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {trainingsvideos.map((v) => (
              <VideoCard key={v.id} video={v} gemerkt={gemerkteIds.has(v.id)} />
            ))}
          </div>
        </section>
      )}

      {istAdminOderHoeher && (
        <section className="mt-8">
          <SectionLinie
            titel={`${t("adminReferenzEditor.beschreibungLabel", sprache)} (${t("nav.verwaltung", sprache)})`}
          />
          <div className="mt-3">
            <AdminReferenzEditor referenz={r} kategorien={(kategorien ?? []) as Kategorie[]} teile={(teile ?? []) as Teil[]} />
          </div>
        </section>
      )}

      <VerwandteReferenzen
        referenzId={r.id}
        anfangsVerknuepft={verwandteReferenzen}
        darfBearbeiten={darfVerknuepfenBearbeiten}
      />
    </div>
  );
}

function ReferenzInhalt({ referenz, sprache }: { referenz: ReferenzMitDetails; sprache: Sprache }) {
  if (referenz.typ === "video") {
    const inhalt = einzeln(referenz.referenz_video);
    if (!inhalt) return null;
    return <video src={inhalt.datei_url} controls className="aspect-video w-full border border-rule bg-plate" />;
  }
  if (referenz.typ === "foto") {
    const inhalt = einzeln(referenz.referenz_foto);
    if (!inhalt) return null;
    const vorherLabel = t("referenzDetail.vorher", sprache);
    const nachherLabel = t("referenzDetail.nachher", sprache);
    if (inhalt.vorher_url && inhalt.nachher_url) {
      return (
        <VorherNachher
          vorherUrl={inhalt.vorher_url}
          nachherUrl={inhalt.nachher_url}
          vorherLabel={vorherLabel}
          nachherLabel={nachherLabel}
        />
      );
    }
    const einzelBild = inhalt.nachher_url ?? inhalt.vorher_url;
    if (!einzelBild) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={einzelBild} alt="" className="w-full border border-rule object-cover" />
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
        className="flex items-center gap-3 border border-rule bg-paper p-4 hover:border-signal"
      >
        <Icon name="dokument" size={28} className="text-ink-faint" />
        <span className="text-sm font-medium text-ink">{inhalt.dateiname}</span>
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
      className="flex items-center gap-3 border border-rule bg-paper p-4 hover:border-signal"
    >
      <Icon name="link" size={28} className="text-ink-faint" />
      <span className="text-sm font-medium text-ink">{inhalt.quelle ?? inhalt.url}</span>
    </a>
  );
}

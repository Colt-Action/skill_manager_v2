"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { textAusDateiExtrahieren } from "@/lib/textExtraktion";
import { GURTZUSTAND_OPTIONEN } from "@/lib/werksbesichtigungOptionen";
import type { Gurtzustand, ReferenzTyp } from "@/lib/supabase/types";

interface MetadatenInput {
  material: string;
  materialSonstiges: string;
  geschwindigkeitMs: number | null;
  foerderbandbreite: string;
  beltConnection: string;
  mechanicalSpliceTyp: string;
  runbackReversible: boolean;
  land: string;
  besonderheiten: string;
  abstreifsegment: string;
  verlagerung: string;
  gurtzustand: string;
}

// Nur Werte aus der gemeinsamen Liste speichern, sonst leer.
function gurtzustandOderNull(wert: string): Gurtzustand | null {
  return (GURTZUSTAND_OPTIONEN as string[]).includes(wert) ? (wert as Gurtzustand) : null;
}

interface ReferenzErstellenInput {
  titel: string;
  beschreibung: string;
  typ: ReferenzTyp;
  kategorieId: string | null;
  teilId: string | null;
  metadaten: MetadatenInput | null;
  video?: { dateiUrl: string; thumbnailUrl: string | null; dauer: number | null };
  foto?: { vorherUrl: string | null; nachherUrl: string | null };
  dokument?: { dateiUrl: string; dateiname: string; dateityp: "pdf" | "word" };
  link?: { url: string; quelle: string };
}

// Wird aufgerufen, nachdem etwaige Dateien bereits im Supabase Storage
// liegen (das Hochladen selbst passiert im Browser, siehe
// ReferenzUploadForm). Legt die Datenbank-Zeilen an - Status ist danach
// immer automatisch "pruefung", egal was übergeben wurde.
export async function referenzErstellen(input: ReferenzErstellenInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { erfolg: false, fehler: "Nicht eingeloggt." };
  }

  const { data: profil } = await supabase.from("users").select("rolle").eq("id", user.id).single();
  if (profil?.rolle === "zuschauer") {
    return { erfolg: false, fehler: "Zuschauer dürfen nichts hochladen." };
  }

  if (!input.titel.trim()) {
    return { erfolg: false, fehler: "Bitte einen Titel angeben." };
  }
  if (input.typ === "video" && !input.video?.dateiUrl) {
    return { erfolg: false, fehler: "Bitte ein Video hochladen." };
  }
  if (input.typ === "foto" && !input.foto?.vorherUrl && !input.foto?.nachherUrl) {
    return { erfolg: false, fehler: "Bitte mindestens ein Foto (Vorher oder Nachher) hochladen." };
  }
  if (input.typ === "dokument" && !input.dokument?.dateiUrl) {
    return { erfolg: false, fehler: "Bitte ein Dokument hochladen." };
  }
  if (input.typ === "link" && !input.link?.url.trim()) {
    return { erfolg: false, fehler: "Bitte eine URL angeben." };
  }

  const { data: neueReferenz, error } = await supabase
    .from("referenzen")
    .insert({
      titel: input.titel.trim(),
      beschreibung: input.beschreibung.trim(),
      typ: input.typ,
      kategorie_id: input.kategorieId,
      teil_id: input.teilId,
      status: "pruefung",
      hochgeladen_von: user.id,
    })
    .select("id")
    .single();

  if (error || !neueReferenz) {
    return { erfolg: false, fehler: error?.message ?? "Fehler beim Speichern." };
  }
  const referenzId = neueReferenz.id as string;

  if (input.typ === "video" && input.video) {
    const { error: inhaltFehler } = await supabase.from("referenz_video").insert({
      referenz_id: referenzId,
      datei_url: input.video.dateiUrl,
      thumbnail_url: input.video.thumbnailUrl,
      dauer: input.video.dauer,
    });
    if (inhaltFehler) return { erfolg: false, fehler: inhaltFehler.message };
  } else if (input.typ === "foto" && input.foto) {
    const { error: inhaltFehler } = await supabase.from("referenz_foto").insert({
      referenz_id: referenzId,
      vorher_url: input.foto.vorherUrl,
      nachher_url: input.foto.nachherUrl,
    });
    if (inhaltFehler) return { erfolg: false, fehler: inhaltFehler.message };
  } else if (input.typ === "dokument" && input.dokument) {
    let volltext = "";
    try {
      const antwort = await fetch(input.dokument.dateiUrl);
      const buffer = Buffer.from(await antwort.arrayBuffer());
      volltext = await textAusDateiExtrahieren(buffer, input.dokument.dateityp);
    } catch {
      volltext = "";
    }
    const { error: inhaltFehler } = await supabase.from("referenz_dokument").insert({
      referenz_id: referenzId,
      datei_url: input.dokument.dateiUrl,
      dateiname: input.dokument.dateiname,
      dateityp: input.dokument.dateityp,
      volltext,
    });
    if (inhaltFehler) return { erfolg: false, fehler: inhaltFehler.message };
  } else if (input.typ === "link" && input.link) {
    const { error: inhaltFehler } = await supabase.from("referenz_link").insert({
      referenz_id: referenzId,
      url: input.link.url.trim(),
      quelle: input.link.quelle.trim() || null,
    });
    if (inhaltFehler) return { erfolg: false, fehler: inhaltFehler.message };
  }

  if (input.metadaten) {
    const d = input.metadaten;
    const { error: metaFehler } = await supabase.from("referenz_metadaten").insert({
      referenz_id: referenzId,
      material: d.material || null,
      material_sonstiges: d.material === "Sonstiges" ? d.materialSonstiges || null : null,
      geschwindigkeit_ms: d.geschwindigkeitMs,
      foerderbandbreite: d.foerderbandbreite || null,
      belt_connection: d.beltConnection || null,
      mechanical_splice_typ: d.beltConnection === "Mechanical Splice" ? d.mechanicalSpliceTyp || null : null,
      runback_reversible: d.runbackReversible,
      land: d.land || null,
      besonderheiten: d.besonderheiten || null,
      abstreifsegment: d.abstreifsegment || null,
      verlagerung: d.verlagerung || null,
      gurtzustand: gurtzustandOderNull(d.gurtzustand),
    });
    if (metaFehler) return { erfolg: false, fehler: metaFehler.message };
  }

  revalidatePath("/referenzbereich");
  revalidatePath("/admin/referenzbereich");
  redirect("/referenzbereich?hochgeladen=1");
}

async function pruefeAdminOderHoeher() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht eingeloggt.");

  const { data: profil } = await supabase.from("users").select("rolle").eq("id", user.id).single();
  if (profil?.rolle !== "admin" && profil?.rolle !== "superadmin") {
    throw new Error("Keine Berechtigung. Nur Admin/Superadmin dürfen das.");
  }
  return supabase;
}

interface ReferenzAktualisierenInput {
  id: string;
  titel: string;
  teilId: string | null;
  kategorieId: string | null;
  beschreibung: string;
  tagNamen: string[];
  metadaten: MetadatenInput;
}

// Admin/Superadmin korrigiert Titel/Kategorie/Teil/Beschreibung, Tags und
// alle technischen Zusatzangaben - auch für bereits veröffentlichte
// Referenzen, nicht nur während der Prüfung. Gilt für alle vier Typen
// (Video/Foto/Dokument/Link), da referenz_metadaten typunabhängig ist.
export async function referenzAktualisieren(input: ReferenzAktualisierenInput) {
  const supabase = await pruefeAdminOderHoeher();

  if (!input.titel.trim()) {
    return { erfolg: false, fehler: "Bitte einen Titel angeben." };
  }

  const { error: updateFehler } = await supabase
    .from("referenzen")
    .update({
      titel: input.titel.trim(),
      teil_id: input.teilId,
      kategorie_id: input.kategorieId,
      beschreibung: input.beschreibung,
    })
    .eq("id", input.id);

  if (updateFehler) return { erfolg: false, fehler: updateFehler.message };

  const d = input.metadaten;
  const { error: metaFehler } = await supabase.from("referenz_metadaten").upsert(
    {
      referenz_id: input.id,
      material: d.material || null,
      material_sonstiges: d.material === "Sonstiges" ? d.materialSonstiges || null : null,
      geschwindigkeit_ms: d.geschwindigkeitMs,
      foerderbandbreite: d.foerderbandbreite || null,
      belt_connection: d.beltConnection || null,
      mechanical_splice_typ: d.beltConnection === "Mechanical Splice" ? d.mechanicalSpliceTyp || null : null,
      runback_reversible: d.runbackReversible,
      land: d.land || null,
      besonderheiten: d.besonderheiten || null,
      abstreifsegment: d.abstreifsegment || null,
      verlagerung: d.verlagerung || null,
      gurtzustand: gurtzustandOderNull(d.gurtzustand),
    },
    { onConflict: "referenz_id" },
  );
  if (metaFehler) return { erfolg: false, fehler: metaFehler.message };

  const tagIds: string[] = [];
  for (const roheName of input.tagNamen) {
    const name = roheName.trim();
    if (!name) continue;

    const { data: bestehenderTag } = await supabase
      .from("tags")
      .select("id")
      .ilike("name", name)
      .maybeSingle();

    if (bestehenderTag) {
      tagIds.push(bestehenderTag.id);
      continue;
    }

    const { data: neuerTag, error: tagFehler } = await supabase
      .from("tags")
      .insert({ name })
      .select("id")
      .single();

    if (tagFehler) return { erfolg: false, fehler: tagFehler.message };
    tagIds.push(neuerTag.id);
  }

  await supabase.from("referenz_tags").delete().eq("referenz_id", input.id);
  if (tagIds.length > 0) {
    await supabase
      .from("referenz_tags")
      .insert(tagIds.map((tagId) => ({ referenz_id: input.id, tag_id: tagId })));
  }

  revalidatePath("/admin/referenzbereich");
  revalidatePath("/referenzbereich");
  revalidatePath(`/referenzbereich/${input.id}`);
  return { erfolg: true };
}

export async function referenzFreigeben(id: string) {
  const supabase = await pruefeAdminOderHoeher();

  const { error } = await supabase.from("referenzen").update({ status: "veroeffentlicht" }).eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/admin/referenzbereich");
  revalidatePath("/referenzbereich");
  revalidatePath(`/referenzbereich/${id}`);
  return { erfolg: true };
}

// Schaltet den "Like" eines eingeloggten Nutzers für eine Referenz um.
export async function referenzLikeUmschalten(referenzId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };

  const { data: bestehend } = await supabase
    .from("referenz_likes")
    .select("referenz_id")
    .eq("referenz_id", referenzId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (bestehend) {
    const { error } = await supabase
      .from("referenz_likes")
      .delete()
      .eq("referenz_id", referenzId)
      .eq("user_id", user.id);
    if (error) return { erfolg: false, fehler: error.message };
    revalidatePath("/referenzbereich");
    return { erfolg: true, geliked: false };
  }

  const { error } = await supabase
    .from("referenz_likes")
    .insert({ referenz_id: referenzId, user_id: user.id });
  if (error) return { erfolg: false, fehler: error.message };
  revalidatePath("/referenzbereich");
  return { erfolg: true, geliked: true };
}

// Sucht Referenzen nach Titel, für die "Verwandte Referenzen"-Verknüpfung.
// Row Level Security sorgt automatisch dafür, dass nur Referenzen
// zurückkommen, die der Suchende auch sehen darf.
export async function referenzenSuchen(suchtext: string, ausschlussId: string) {
  const supabase = await createClient();
  const begriff = suchtext.trim();
  if (!begriff) return [];

  const { data } = await supabase
    .from("referenzen")
    .select("id, titel, typ")
    .neq("id", ausschlussId)
    .ilike("titel", `%${begriff}%`)
    .order("titel")
    .limit(15);

  return data ?? [];
}

// Verwandte Referenzen sind bewusst symmetrisch (a<->b) gespeichert - die
// kleinere ID steht immer in referenz_id_a (siehe DB-Check), damit dieselbe
// Verknüpfung nicht doppelt entstehen kann.
export async function referenzVerknuepfen(referenzId: string, andereId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };
  if (referenzId === andereId) return { erfolg: false, fehler: "Kann nicht mit sich selbst verknüpft werden." };

  const [a, b] = [referenzId, andereId].sort();
  const { error } = await supabase
    .from("referenz_verknuepfungen")
    .insert({ referenz_id_a: a, referenz_id_b: b, erstellt_von: user.id });

  if (error) return { erfolg: false, fehler: error.message };
  revalidatePath(`/referenzbereich/${referenzId}`);
  revalidatePath(`/referenzbereich/${andereId}`);
  return { erfolg: true };
}

export async function referenzEntknuepfen(referenzId: string, andereId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };

  const [a, b] = [referenzId, andereId].sort();
  const { error } = await supabase
    .from("referenz_verknuepfungen")
    .delete()
    .eq("referenz_id_a", a)
    .eq("referenz_id_b", b);

  if (error) return { erfolg: false, fehler: error.message };
  revalidatePath(`/referenzbereich/${referenzId}`);
  revalidatePath(`/referenzbereich/${andereId}`);
  return { erfolg: true };
}

// ---------------------------------------------------------------------------
// Referenz löschen (nur Admin/Superadmin, endgültig)
// ---------------------------------------------------------------------------

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Buckets, in denen Dateien von Referenzen liegen (siehe ReferenzUploadForm).
const REFERENZ_BUCKETS = ["videos", "thumbnails", "referenz-fotos", "referenz-dokumente"] as const;
type ReferenzBucket = (typeof REFERENZ_BUCKETS)[number];

/** Bucket und Pfad aus einer öffentlichen Supabase-Storage-URL; null bei fremden URLs. */
function speicherOrt(url: string | null | undefined): { bucket: ReferenzBucket; pfad: string } | null {
  if (!url) return null;
  const m = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/.exec(url.split("?")[0]);
  if (!m || !(REFERENZ_BUCKETS as readonly string[]).includes(m[1])) return null;
  return { bucket: m[1] as ReferenzBucket, pfad: decodeURIComponent(m[2]) };
}

export type ReferenzLoeschFehler =
  | "keineBerechtigung"
  | "nichtGefunden"
  | "dateienUebrig"
  | "datenbank"
  | "nichtGeloescht";

export interface ReferenzLoeschErgebnis {
  erfolg: boolean;
  fehler?: ReferenzLoeschFehler;
  /** Technische Einzelheiten zu dem, was übrig geblieben ist (je Eintrag eine Zeile). */
  reste?: string[];
  /** Dateien, die bewusst nicht gelöscht wurden, weil sie noch anderswo verwendet werden. */
  behalteneDateien?: number;
}

// Reihenfolge (es gibt keine Transaktion):
//   1. Admin-Rolle auf dem Server prüfen.
//   2. Referenz mit ihren Inhaltszeilen laden (Datei-URLs).
//   3. Dateien im Speicher löschen (Video, Vorschaubild, Fotos, Dokument) -
//      außer eine Datei wird noch von einem anderen Eintrag verwendet (z.B.
//      die alte Zeile in "videos", aus der eine Referenz kopiert wurde).
//      Bleibt dabei eine Datei übrig, bricht die Aktion VOR dem Löschen der
//      Datenbank-Zeilen ab: die Referenz bleibt vollständig erhalten und das
//      Löschen lässt sich gefahrlos wiederholen (bereits gelöschte Dateien
//      zählen dann als erledigt).
//   4. Verknüpfungen ("Verwandte Referenzen") in beide Richtungen löschen.
//   5. Metadaten löschen.
//   6. Die Referenz selbst löschen (count: "exact", muss genau 1 sein). Die
//      Kategoriezuordnung ist eine Spalte dieser Zeile; Inhaltszeilen, Tags,
//      Likes, Kommentare, Merklisten-Einträge und Verknüpfungen mit
//      Förderbändern der Werksbesichtigung entfernt die Datenbank per
//      "on delete cascade".
export async function referenzLoeschen(id: string): Promise<ReferenzLoeschErgebnis> {
  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await pruefeAdminOderHoeher();
  } catch {
    return { erfolg: false, fehler: "keineBerechtigung" };
  }
  if (!UUID.test(id)) return { erfolg: false, fehler: "nichtGefunden" };

  const { data: referenz, error: ladeFehler } = await supabase
    .from("referenzen")
    .select("id, referenz_video(datei_url, thumbnail_url), referenz_foto(vorher_url, nachher_url), referenz_dokument(datei_url)")
    .eq("id", id)
    .maybeSingle();
  if (ladeFehler) return { erfolg: false, fehler: "datenbank", reste: [ladeFehler.message] };
  if (!referenz) return { erfolg: false, fehler: "nichtGefunden" };

  const einzeln = <T,>(wert: T | T[] | null | undefined): T | null =>
    !wert ? null : Array.isArray(wert) ? (wert[0] ?? null) : wert;
  const video = einzeln(referenz.referenz_video as { datei_url: string; thumbnail_url: string | null }[] | null);
  const foto = einzeln(referenz.referenz_foto as { vorher_url: string | null; nachher_url: string | null }[] | null);
  const dokument = einzeln(referenz.referenz_dokument as { datei_url: string }[] | null);

  // Wird dieselbe Datei noch von einem anderen Eintrag verwendet?
  async function nochVerwendet(url: string): Promise<boolean> {
    const pruefungen = [
      supabase.from("referenz_video").select("referenz_id", { count: "exact", head: true }).neq("referenz_id", id).eq("datei_url", url),
      supabase.from("referenz_video").select("referenz_id", { count: "exact", head: true }).neq("referenz_id", id).eq("thumbnail_url", url),
      supabase.from("referenz_foto").select("referenz_id", { count: "exact", head: true }).neq("referenz_id", id).eq("vorher_url", url),
      supabase.from("referenz_foto").select("referenz_id", { count: "exact", head: true }).neq("referenz_id", id).eq("nachher_url", url),
      supabase.from("referenz_dokument").select("referenz_id", { count: "exact", head: true }).neq("referenz_id", id).eq("datei_url", url),
      supabase.from("videos").select("id", { count: "exact", head: true }).eq("datei_url", url),
      supabase.from("videos").select("id", { count: "exact", head: true }).eq("thumbnail_url", url),
    ];
    const ergebnisse = await Promise.all(pruefungen);
    // Im Zweifel (Fehler bei der Prüfung) die Datei behalten.
    return ergebnisse.some((e) => e.error || (e.count ?? 0) > 0);
  }

  const urls = [video?.datei_url, video?.thumbnail_url, foto?.vorher_url, foto?.nachher_url, dokument?.datei_url].filter(
    (u): u is string => Boolean(u),
  );
  const reste: string[] = [];
  let behalteneDateien = 0;

  for (const url of [...new Set(urls)]) {
    const ort = speicherOrt(url);
    if (!ort) continue; // keine Datei aus unserem Speicher (z.B. externe URL)
    if (await nochVerwendet(url)) {
      behalteneDateien += 1;
      continue;
    }
    const { data: geloescht, error } = await supabase.storage.from(ort.bucket).remove([ort.pfad]);
    if (error) {
      reste.push(`${ort.bucket}/${ort.pfad}: ${error.message}`);
      continue;
    }
    if ((geloescht ?? []).length === 0) {
      // Nichts gelöscht: Datei schon weg (z.B. Wiederholung) oder keine
      // Berechtigung - nachsehen, ob sie noch da ist.
      const ordner = ort.pfad.includes("/") ? ort.pfad.slice(0, ort.pfad.lastIndexOf("/")) : "";
      const name = ort.pfad.slice(ort.pfad.lastIndexOf("/") + 1);
      const { data: liste } = await supabase.storage.from(ort.bucket).list(ordner, { search: name });
      if ((liste ?? []).some((datei) => datei.name === name)) {
        reste.push(`${ort.bucket}/${ort.pfad}`);
      }
    }
  }
  if (reste.length > 0) return { erfolg: false, fehler: "dateienUebrig", reste, behalteneDateien };

  const { error: verknuepfungFehler } = await supabase
    .from("referenz_verknuepfungen")
    .delete({ count: "exact" })
    .or(`referenz_id_a.eq.${id},referenz_id_b.eq.${id}`);
  if (verknuepfungFehler) {
    return { erfolg: false, fehler: "datenbank", reste: [`referenz_verknuepfungen: ${verknuepfungFehler.message}`], behalteneDateien };
  }

  const { error: metaFehler } = await supabase.from("referenz_metadaten").delete({ count: "exact" }).eq("referenz_id", id);
  if (metaFehler) {
    return { erfolg: false, fehler: "datenbank", reste: [`referenz_metadaten: ${metaFehler.message}`], behalteneDateien };
  }

  const { error: loeschFehler, count } = await supabase.from("referenzen").delete({ count: "exact" }).eq("id", id);
  if (loeschFehler) return { erfolg: false, fehler: "datenbank", reste: [`referenzen: ${loeschFehler.message}`], behalteneDateien };
  // 0 Zeilen: RLS hat das Löschen verhindert oder die Referenz war schon weg -
  // dann nie "gelöscht" melden.
  if (count !== 1) return { erfolg: false, fehler: "nichtGeloescht", behalteneDateien };

  // Die Detailseite der gelöschten Referenz bewusst nicht revalidieren: sie ist
  // gerade geöffnet und würde sonst vor dem Wechsel kurz "nicht gefunden"
  // zeigen. Stattdessen per redirect zur Übersicht, die den Hinweis anzeigt.
  revalidatePath("/referenzbereich");
  revalidatePath("/admin");
  revalidatePath("/admin/referenzen");
  revalidatePath("/favoriten");
  revalidatePath("/");
  redirect(`/referenzbereich?geloescht=1${behalteneDateien ? `&behalten=${behalteneDateien}` : ""}`);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { textAusDateiExtrahieren } from "@/lib/textExtraktion";
import type { ReferenzTyp } from "@/lib/supabase/types";

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
  teilId: string | null;
  kategorieId: string | null;
  beschreibung: string;
  tagNamen: string[];
}

// Admin/Superadmin korrigiert Kategorie/Teil/Beschreibung und Tags - auch
// für bereits veröffentlichte Referenzen, nicht nur während der Prüfung.
export async function referenzAktualisieren(input: ReferenzAktualisierenInput) {
  const supabase = await pruefeAdminOderHoeher();

  const { error: updateFehler } = await supabase
    .from("referenzen")
    .update({
      teil_id: input.teilId,
      kategorie_id: input.kategorieId,
      beschreibung: input.beschreibung,
    })
    .eq("id", input.id);

  if (updateFehler) return { erfolg: false, fehler: updateFehler.message };

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

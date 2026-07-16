"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { benachrichtigungErstellen } from "@/lib/actions/benachrichtigungen";

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

interface VideoAktualisierenInput {
  id: string;
  teilId: string | null;
  beschreibungSchritte: string;
  tagNamen: string[];
}

// Trainer/Admin korrigiert Kategorie/Teil, ergänzt die Beschreibung und
// setzt die Tags eines Videos neu.
export async function videoAktualisieren(input: VideoAktualisierenInput) {
  const supabase = await pruefeAdminOderHoeher();

  const { error: updateFehler } = await supabase
    .from("videos")
    .update({
      teil_id: input.teilId,
      beschreibung_schritte: input.beschreibungSchritte,
    })
    .eq("id", input.id);

  if (updateFehler) return { erfolg: false, fehler: updateFehler.message };

  // Tags: für jeden Namen entweder bestehenden Tag verwenden oder neu anlegen.
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

  await supabase.from("video_tags").delete().eq("video_id", input.id);
  if (tagIds.length > 0) {
    await supabase
      .from("video_tags")
      .insert(tagIds.map((tagId) => ({ video_id: input.id, tag_id: tagId })));
  }

  revalidatePath("/admin");
  revalidatePath(`/videos/${input.id}`);
  return { erfolg: true };
}

export async function videoFreigeben(id: string) {
  const supabase = await pruefeAdminOderHoeher();

  const { data: video, error } = await supabase
    .from("videos")
    .update({ status: "veroeffentlicht" })
    .eq("id", id)
    .select("titel, hochgeladen_von")
    .single();
  if (error) return { erfolg: false, fehler: error.message };

  await benachrichtigungErstellen(
    supabase,
    video.hochgeladen_von,
    `Dein Video "${video.titel}" wurde freigegeben und ist jetzt sichtbar.`,
    `/videos/${id}`,
  );

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/videos/${id}`);
  return { erfolg: true };
}

// Admin/Superadmin löscht ein Video endgültig, nachdem ein Techniker die
// Löschung beantragt hat (oder direkt, falls gewünscht).
export async function videoEndgueltigLoeschen(id: string) {
  const supabase = await pruefeAdminOderHoeher();

  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/admin/loeschanfragen");
  revalidatePath("/");
  return { erfolg: true };
}

// Admin/Superadmin lehnt eine Löschanfrage ab - das Video bleibt bestehen.
export async function loeschanfrageAblehnen(id: string) {
  const supabase = await pruefeAdminOderHoeher();

  const { data: video, error } = await supabase
    .from("videos")
    .update({ loeschung_angefragt: false })
    .eq("id", id)
    .select("titel, hochgeladen_von")
    .single();
  if (error) return { erfolg: false, fehler: error.message };

  await benachrichtigungErstellen(
    supabase,
    video.hochgeladen_von,
    `Deine Löschanfrage für "${video.titel}" wurde abgelehnt.`,
    `/videos/${id}`,
  );

  revalidatePath("/admin/loeschanfragen");
  return { erfolg: true };
}

// Admin/Superadmin markiert eine "Teil nicht gefunden"-Meldung als erledigt.
export async function teilAnfrageBearbeitet(id: string) {
  const supabase = await pruefeAdminOderHoeher();

  const { data: anfrage, error } = await supabase
    .from("teil_anfragen")
    .update({ bearbeitet: true })
    .eq("id", id)
    .select("nutzer_id")
    .single();
  if (error) return { erfolg: false, fehler: error.message };

  await benachrichtigungErstellen(
    supabase,
    anfrage.nutzer_id,
    "Deine Meldung zu einem nicht gefundenen Teil wurde bearbeitet.",
    "/teil-melden",
  );

  revalidatePath("/admin/teil-anfragen");
  return { erfolg: true };
}

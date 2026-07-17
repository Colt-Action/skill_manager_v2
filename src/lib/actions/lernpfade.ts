"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function pruefeAdminOderHoeher(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erlaubt: false as const, fehler: "Nicht eingeloggt." };

  const { data: profil } = await supabase.from("users").select("rolle").eq("id", user.id).single();
  if (profil?.rolle !== "admin" && profil?.rolle !== "superadmin") {
    return { erlaubt: false as const, fehler: "Nur Admins dürfen Lernpfade verwalten." };
  }
  return { erlaubt: true as const, userId: user.id };
}

export async function lernpfadErstellen(input: { titel: string; beschreibung: string }) {
  const supabase = await createClient();
  const pruefung = await pruefeAdminOderHoeher(supabase);
  if (!pruefung.erlaubt) return { erfolg: false, fehler: pruefung.fehler };

  if (!input.titel.trim()) return { erfolg: false, fehler: "Bitte einen Titel eingeben." };

  const { error } = await supabase.from("lernpfade").insert({
    titel: input.titel.trim(),
    beschreibung: input.beschreibung.trim(),
    erstellt_von: pruefung.userId,
  });
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/admin/lernpfade");
  revalidatePath("/lernpfade");
  return { erfolg: true };
}

export async function lernpfadLoeschen(lernpfadId: string) {
  const supabase = await createClient();
  const pruefung = await pruefeAdminOderHoeher(supabase);
  if (!pruefung.erlaubt) return { erfolg: false, fehler: pruefung.fehler };

  const { error } = await supabase.from("lernpfade").delete().eq("id", lernpfadId);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/admin/lernpfade");
  revalidatePath("/lernpfade");
  return { erfolg: true };
}

export async function lernpfadVideoHinzufuegen(input: { lernpfadId: string; videoId: string }) {
  const supabase = await createClient();
  const pruefung = await pruefeAdminOderHoeher(supabase);
  if (!pruefung.erlaubt) return { erfolg: false, fehler: pruefung.fehler };

  const { count } = await supabase
    .from("lernpfad_videos")
    .select("video_id", { count: "exact", head: true })
    .eq("lernpfad_id", input.lernpfadId);

  const { error } = await supabase.from("lernpfad_videos").insert({
    lernpfad_id: input.lernpfadId,
    video_id: input.videoId,
    reihenfolge: count ?? 0,
  });
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/admin/lernpfade/${input.lernpfadId}`);
  revalidatePath(`/lernpfade/${input.lernpfadId}`);
  return { erfolg: true };
}

export async function lernpfadVideoEntfernen(input: { lernpfadId: string; videoId: string }) {
  const supabase = await createClient();
  const pruefung = await pruefeAdminOderHoeher(supabase);
  if (!pruefung.erlaubt) return { erfolg: false, fehler: pruefung.fehler };

  const { error } = await supabase
    .from("lernpfad_videos")
    .delete()
    .eq("lernpfad_id", input.lernpfadId)
    .eq("video_id", input.videoId);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/admin/lernpfade/${input.lernpfadId}`);
  revalidatePath(`/lernpfade/${input.lernpfadId}`);
  return { erfolg: true };
}

// Tauscht die Reihenfolge zweier benachbarter Videos im Lernpfad (rauf/runter
// verschieben in der Admin-Verwaltung).
export async function lernpfadVideoVerschieben(input: {
  lernpfadId: string;
  videoId: string;
  richtung: "hoch" | "runter";
}) {
  const supabase = await createClient();
  const pruefung = await pruefeAdminOderHoeher(supabase);
  if (!pruefung.erlaubt) return { erfolg: false, fehler: pruefung.fehler };

  const { data: eintraege } = await supabase
    .from("lernpfad_videos")
    .select("video_id, reihenfolge")
    .eq("lernpfad_id", input.lernpfadId)
    .order("reihenfolge", { ascending: true });

  if (!eintraege) return { erfolg: false, fehler: "Lernpfad nicht gefunden." };

  const index = eintraege.findIndex((e) => e.video_id === input.videoId);
  const tauschIndex = input.richtung === "hoch" ? index - 1 : index + 1;
  if (index === -1 || tauschIndex < 0 || tauschIndex >= eintraege.length) {
    return { erfolg: false, fehler: "Verschieben nicht möglich." };
  }

  const a = eintraege[index];
  const b = eintraege[tauschIndex];

  const [{ error: fehler1 }, { error: fehler2 }] = await Promise.all([
    supabase
      .from("lernpfad_videos")
      .update({ reihenfolge: b.reihenfolge })
      .eq("lernpfad_id", input.lernpfadId)
      .eq("video_id", a.video_id),
    supabase
      .from("lernpfad_videos")
      .update({ reihenfolge: a.reihenfolge })
      .eq("lernpfad_id", input.lernpfadId)
      .eq("video_id", b.video_id),
  ]);
  if (fehler1 || fehler2) return { erfolg: false, fehler: (fehler1 ?? fehler2)?.message };

  revalidatePath(`/admin/lernpfade/${input.lernpfadId}`);
  revalidatePath(`/lernpfade/${input.lernpfadId}`);
  return { erfolg: true };
}

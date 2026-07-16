"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { benachrichtigungErstellen } from "@/lib/actions/benachrichtigungen";

export async function kommentarErstellen(videoId: string, text: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };
  if (!text.trim()) return { erfolg: false, fehler: "Kommentar darf nicht leer sein." };

  const { data: neuerKommentar, error } = await supabase
    .from("kommentare")
    .insert({ video_id: videoId, user_id: user.id, text: text.trim() })
    .select("id")
    .single();

  if (error || !neuerKommentar) return { erfolg: false, fehler: error?.message ?? "Fehler." };

  // Video-Uploader benachrichtigen (außer man kommentiert sein eigenes Video).
  const { data: video } = await supabase
    .from("videos")
    .select("titel, hochgeladen_von")
    .eq("id", videoId)
    .single();

  if (video && video.hochgeladen_von && video.hochgeladen_von !== user.id) {
    await benachrichtigungErstellen(
      supabase,
      video.hochgeladen_von,
      `Neuer Kommentar zu deinem Video "${video.titel}".`,
      `/videos/${videoId}`,
    );
  }

  revalidatePath(`/videos/${videoId}`);
  return { erfolg: true };
}

export async function kommentarLoeschen(id: string, videoId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };

  const { error } = await supabase.from("kommentare").delete().eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/videos/${videoId}`);
  return { erfolg: true };
}

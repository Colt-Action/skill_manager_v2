"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function favoritUmschalten(videoId: string, merken: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };

  if (merken) {
    const { error } = await supabase
      .from("favoriten")
      .insert({ video_id: videoId, user_id: user.id });
    if (error) return { erfolg: false, fehler: error.message };
  } else {
    const { error } = await supabase
      .from("favoriten")
      .delete()
      .eq("video_id", videoId)
      .eq("user_id", user.id);
    if (error) return { erfolg: false, fehler: error.message };
  }

  revalidatePath(`/videos/${videoId}`);
  revalidatePath("/favoriten");
  return { erfolg: true };
}

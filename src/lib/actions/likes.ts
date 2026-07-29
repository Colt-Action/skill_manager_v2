"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Schaltet den "Like" eines eingeloggten Nutzers für ein Video um (setzen/
// entfernen), z.B. um schnell zu markieren, dass sich ein Referenzvideo gut
// als Referenz eignet.
export async function videoLikeUmschalten(videoId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };

  const { data: bestehend } = await supabase
    .from("video_likes")
    .select("video_id")
    .eq("video_id", videoId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (bestehend) {
    const { error } = await supabase
      .from("video_likes")
      .delete()
      .eq("video_id", videoId)
      .eq("user_id", user.id);
    if (error) return { erfolg: false, fehler: error.message };
    revalidatePath("/referenzvideos");
    revalidatePath("/videothek");
    return { erfolg: true, geliked: false };
  }

  const { error } = await supabase.from("video_likes").insert({ video_id: videoId, user_id: user.id });
  if (error) return { erfolg: false, fehler: error.message };
  revalidatePath("/referenzvideos");
  revalidatePath("/videothek");
  return { erfolg: true, geliked: true };
}

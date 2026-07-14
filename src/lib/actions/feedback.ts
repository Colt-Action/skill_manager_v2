"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function feedbackAbgeben(videoId: string, hilfreich: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false };

  const { error } = await supabase
    .from("feedback")
    .insert({ video_id: videoId, user_id: user.id, hilfreich });

  if (error) return { erfolg: false };

  revalidatePath(`/videos/${videoId}`);
  return { erfolg: true };
}

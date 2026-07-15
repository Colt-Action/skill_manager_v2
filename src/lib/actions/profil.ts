"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function profilAktualisieren(input: {
  name: string;
  standort: string;
  avatarUrl: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };

  const update: Record<string, unknown> = {
    name: input.name.trim(),
    standort: input.standort.trim() || null,
  };
  if (input.avatarUrl) {
    update.avatar_url = input.avatarUrl;
  }

  const { error } = await supabase.from("users").update(update).eq("id", user.id);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/", "layout");
  return { erfolg: true };
}

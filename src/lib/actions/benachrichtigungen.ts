"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Hilfsfunktion für andere Server Actions: legt eine Benachrichtigung für
// einen Nutzer an. Wird von hier aus nicht direkt vom Browser aufgerufen.
export async function benachrichtigungErstellen(
  supabase: SupabaseServerClient,
  userId: string | null,
  nachricht: string,
  link?: string,
) {
  if (!userId) return;
  await supabase.from("benachrichtigungen").insert({ user_id: userId, nachricht, link: link ?? null });
}

export async function alsGelesenMarkieren(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false };

  await supabase.from("benachrichtigungen").update({ gelesen: true }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/", "layout");
  return { erfolg: true };
}

export async function alleAlsGelesenMarkieren() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false };

  await supabase
    .from("benachrichtigungen")
    .update({ gelesen: true })
    .eq("user_id", user.id)
    .eq("gelesen", false);
  revalidatePath("/", "layout");
  return { erfolg: true };
}

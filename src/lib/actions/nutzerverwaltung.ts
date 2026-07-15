"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Rolle } from "@/lib/supabase/types";

export async function nutzerRolleAendern(nutzerId: string, neueRolle: Rolle) {
  const supabase = await createClient();
  const { error } = await supabase.from("users").update({ rolle: neueRolle }).eq("id", nutzerId);

  if (error) {
    return { erfolg: false, fehler: "Nicht erlaubt oder fehlgeschlagen: " + error.message };
  }

  revalidatePath("/admin/nutzer");
  return { erfolg: true };
}

export async function nutzerAktivStatusAendern(nutzerId: string, aktiv: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("users").update({ aktiv }).eq("id", nutzerId);

  if (error) {
    return { erfolg: false, fehler: "Nicht erlaubt oder fehlgeschlagen: " + error.message };
  }

  revalidatePath("/admin/nutzer");
  return { erfolg: true };
}

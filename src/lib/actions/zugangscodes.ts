"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function zugangscodeErstellen(input: { code: string; maxNutzungen: number | null }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const code = input.code.trim();
  if (!code) return { erfolg: false, fehler: "Bitte einen Code eingeben." };

  const { error } = await supabase.from("zugangscodes").insert({
    code,
    max_nutzungen: input.maxNutzungen,
    erstellt_von: user?.id ?? null,
  });

  if (error) {
    return {
      erfolg: false,
      fehler: error.code === "23505" ? "Dieser Code existiert bereits." : error.message,
    };
  }

  revalidatePath("/admin/zugangscodes");
  return { erfolg: true };
}

export async function zugangscodeUmschalten(input: { id: string; aktiv: boolean }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("zugangscodes")
    .update({ aktiv: input.aktiv })
    .eq("id", input.id);

  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/admin/zugangscodes");
  return { erfolg: true };
}

export async function zugangscodeLoeschen(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("zugangscodes").delete().eq("id", id);

  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/admin/zugangscodes");
  return { erfolg: true };
}

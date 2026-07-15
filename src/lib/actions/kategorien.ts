"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { KategorieEbene } from "@/lib/supabase/types";

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

export async function kategorieErstellen(input: {
  name: string;
  ebene: KategorieEbene;
  parentKategorieId: string | null;
}) {
  const supabase = await pruefeAdminOderHoeher();

  const { error } = await supabase.from("kategorien").insert({
    name: input.name.trim(),
    ebene: input.ebene,
    parent_kategorie_id: input.parentKategorieId,
  });

  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/admin/kategorien");
  revalidatePath("/upload");
  revalidatePath("/");
  return { erfolg: true };
}

export async function teilErstellen(input: {
  name: string;
  teilenummer: string;
  beschreibung: string;
  kategorieId: string;
}) {
  const supabase = await pruefeAdminOderHoeher();

  const { error } = await supabase.from("teile").insert({
    name: input.name.trim(),
    teilenummer: input.teilenummer.trim(),
    beschreibung: input.beschreibung.trim(),
    kategorie_id: input.kategorieId,
  });

  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/admin/kategorien");
  revalidatePath("/upload");
  revalidatePath("/");
  return { erfolg: true };
}

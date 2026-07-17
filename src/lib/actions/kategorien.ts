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
  zeigtReferenzZusatzfelder?: boolean;
}) {
  const supabase = await pruefeAdminOderHoeher();

  const { error } = await supabase.from("kategorien").insert({
    name: input.name.trim(),
    ebene: input.ebene,
    parent_kategorie_id: input.parentKategorieId,
    zeigt_referenz_zusatzfelder: input.ebene === "hersteller" ? !!input.zeigtReferenzZusatzfelder : false,
  });

  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/admin/kategorien");
  revalidatePath("/upload");
  revalidatePath("/");
  revalidatePath("/referenzvideos");
  return { erfolg: true };
}

// Schaltet für einen bestehenden Hersteller um, ob beim Referenzvideo-Upload
// und auf der Referenzvideos-Seite die Zusatzfilter (Material, Geschwindig-
// keit, ...) erscheinen. Dynamisch statt fest im Code auf "HOSCH" verdrahtet,
// damit spätere weitere Hersteller das selbst aktivieren können.
export async function herstellerReferenzfelderUmschalten(input: {
  kategorieId: string;
  aktiv: boolean;
}) {
  const supabase = await pruefeAdminOderHoeher();

  const { error } = await supabase
    .from("kategorien")
    .update({ zeigt_referenz_zusatzfelder: input.aktiv })
    .eq("id", input.kategorieId)
    .eq("ebene", "hersteller");

  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/admin/kategorien");
  revalidatePath("/upload");
  revalidatePath("/referenzvideos");
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

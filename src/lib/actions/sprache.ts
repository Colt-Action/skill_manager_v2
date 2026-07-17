"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { istGueltigeSprache } from "@/lib/i18n/sprachen";

// Speichert die gewählte Anzeigesprache dauerhaft im Profil. Wird auch von
// nicht eingeloggten Seiten (Login) aufgerufen - dort schlägt das einfach
// fehl (kein Nutzer), die Sprache gilt dann nur für die aktuelle Sitzung
// über den Sprach-Context im Browser.
export async function spracheAendern(sprache: string) {
  if (!istGueltigeSprache(sprache)) {
    return { erfolg: false, fehler: "Unbekannte Sprache." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };

  const { error } = await supabase.from("users").update({ sprache }).eq("id", user.id);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/", "layout");
  return { erfolg: true };
}

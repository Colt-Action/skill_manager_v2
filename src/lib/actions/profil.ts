"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function profilAktualisieren(input: {
  name: string;
  standort: string;
  firma: string;
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
    firma: input.firma.trim() || null,
  };
  if (input.avatarUrl) {
    update.avatar_url = input.avatarUrl;
  }

  const { error } = await supabase.from("users").update(update).eq("id", user.id);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/", "layout");
  return { erfolg: true };
}

// Ändert das Login-Passwort. Zur Sicherheit wird zuerst mit dem aktuellen
// Passwort gegengeprüft (signInWithPassword), bevor das neue gesetzt wird –
// so kann niemand, der z.B. eine offene Sitzung im Browser vorfindet, ohne
// Kenntnis des aktuellen Passworts das Konto übernehmen.
export async function passwortAendern(input: {
  aktuellesPasswort: string;
  neuesPasswort: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { erfolg: false, fehler: "Nicht eingeloggt." };

  if (input.neuesPasswort.length < 6) {
    return { erfolg: false, fehler: "Neues Passwort muss mind. 6 Zeichen haben." };
  }

  const { error: pruefFehler } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: input.aktuellesPasswort,
  });
  if (pruefFehler) {
    return { erfolg: false, fehler: "Aktuelles Passwort ist falsch." };
  }

  const { error } = await supabase.auth.updateUser({ password: input.neuesPasswort });
  if (error) return { erfolg: false, fehler: error.message };

  return { erfolg: true };
}

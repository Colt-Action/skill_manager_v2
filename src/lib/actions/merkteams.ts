"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function merkteamErstellen(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };

  const trimmed = name.trim();
  if (!trimmed) return { erfolg: false, fehler: "Bitte einen Namen angeben." };

  const { data: neuesTeam, error } = await supabase
    .from("merkteams")
    .insert({ name: trimmed, erstellt_von: user.id })
    .select("id")
    .single();
  if (error || !neuesTeam) return { erfolg: false, fehler: error?.message ?? "Fehler beim Anlegen." };

  const { error: mitgliedFehler } = await supabase
    .from("merkteam_mitglieder")
    .insert({ merkteam_id: neuesTeam.id, user_id: user.id });
  if (mitgliedFehler) return { erfolg: false, fehler: mitgliedFehler.message };

  revalidatePath("/merkteams");
  revalidatePath("/favoriten");
  return { erfolg: true, id: neuesTeam.id as string };
}

export async function merkteamUmbenennen(merkteamId: string, name: string) {
  const supabase = await createClient();
  const trimmed = name.trim();
  if (!trimmed) return { erfolg: false, fehler: "Bitte einen Namen angeben." };

  const { error } = await supabase.from("merkteams").update({ name: trimmed }).eq("id", merkteamId);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/merkteams");
  revalidatePath(`/merkteams/${merkteamId}`);
  revalidatePath("/favoriten");
  return { erfolg: true };
}

export async function merkteamLoeschen(merkteamId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("merkteams").delete().eq("id", merkteamId);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/merkteams");
  revalidatePath("/favoriten");
  return { erfolg: true };
}

// Sucht Nutzer:innen nach Namen, um sie als Mitglied hinzuzufügen. Zeigt nur
// Personen, die noch nicht im Team sind (und schließt niemanden per E-Mail
// ein - das System bleibt geschlossen auf bestehende App-Nutzer beschränkt).
export async function merkteamNutzerSuchen(merkteamId: string, suchtext: string) {
  const supabase = await createClient();
  const begriff = suchtext.trim();
  if (!begriff) return [];

  const { data: bestehende } = await supabase
    .from("merkteam_mitglieder")
    .select("user_id")
    .eq("merkteam_id", merkteamId);
  const bestehendeIds = (bestehende ?? []).map((m) => m.user_id);

  let query = supabase.from("users").select("id, name").ilike("name", `%${begriff}%`).order("name").limit(15);
  if (bestehendeIds.length > 0) {
    query = query.not("id", "in", `(${bestehendeIds.join(",")})`);
  }
  const { data } = await query;
  return data ?? [];
}

export async function merkteamMitgliedHinzufuegen(merkteamId: string, nutzerId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("merkteam_mitglieder")
    .insert({ merkteam_id: merkteamId, user_id: nutzerId });
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/merkteams/${merkteamId}`);
  return { erfolg: true };
}

export async function merkteamMitgliedEntfernen(merkteamId: string, nutzerId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("merkteam_mitglieder")
    .delete()
    .eq("merkteam_id", merkteamId)
    .eq("user_id", nutzerId);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/merkteams/${merkteamId}`);
  revalidatePath("/merkteams");
  revalidatePath("/favoriten");
  return { erfolg: true };
}

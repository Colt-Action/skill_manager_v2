"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// merkteamId = null -> "nur für mich" (persönliche Merkliste, wie bisher).
// merkteamId gesetzt -> Video wird für das ganze Team gemerkt/entfernt.
export async function favoritUmschalten(videoId: string, merken: boolean, merkteamId: string | null = null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };

  if (merken) {
    const { error } = await supabase
      .from("favoriten")
      .insert({ video_id: videoId, user_id: user.id, merkteam_id: merkteamId });
    if (error) return { erfolg: false, fehler: error.message };
  } else if (merkteamId) {
    const { error } = await supabase
      .from("favoriten")
      .delete()
      .eq("video_id", videoId)
      .eq("merkteam_id", merkteamId);
    if (error) return { erfolg: false, fehler: error.message };
  } else {
    const { error } = await supabase
      .from("favoriten")
      .delete()
      .eq("video_id", videoId)
      .eq("user_id", user.id)
      .is("merkteam_id", null);
    if (error) return { erfolg: false, fehler: error.message };
  }

  revalidatePath(`/videos/${videoId}`);
  revalidatePath("/favoriten");
  if (merkteamId) revalidatePath(`/merkteams/${merkteamId}`);
  return { erfolg: true };
}

// Liefert für die Merken-Auswahl auf der Video-Detailseite: ist das Video
// persönlich gemerkt, und in welchen der eigenen Merkteams ist es bereits
// gemerkt - zusammen mit allen Merkteams, denen der Nutzer angehört.
export async function merklistenStatusLaden(videoId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { persoenlich: false, teams: [] as { id: string; name: string; gemerkt: boolean }[] };

  const [{ data: meineTeams }, { data: favoriten }] = await Promise.all([
    supabase
      .from("merkteam_mitglieder")
      .select("merkteams(id, name)")
      .eq("user_id", user.id),
    supabase.from("favoriten").select("user_id, merkteam_id").eq("video_id", videoId),
  ]);

  interface MerkteamZeile {
    merkteams: { id: string; name: string } | { id: string; name: string }[] | null;
  }
  const teams = ((meineTeams ?? []) as unknown as MerkteamZeile[])
    .map((z) => (Array.isArray(z.merkteams) ? (z.merkteams[0] ?? null) : z.merkteams))
    .filter((z): z is { id: string; name: string } => z !== null);

  const gemerkteTeamIds = new Set((favoriten ?? []).filter((f) => f.merkteam_id).map((f) => f.merkteam_id as string));
  const persoenlich = (favoriten ?? []).some((f) => !f.merkteam_id && f.user_id === user.id);

  return {
    persoenlich,
    teams: teams.map((team) => ({ ...team, gemerkt: gemerkteTeamIds.has(team.id) })),
  };
}

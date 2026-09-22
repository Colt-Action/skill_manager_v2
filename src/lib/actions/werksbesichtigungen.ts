"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { FoerderbandPosition } from "@/lib/supabase/types";

export async function werksbesichtigungErstellen(felder: {
  kunde: string;
  ort: string;
  datum: string;
  merkteamId: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };

  const kunde = felder.kunde.trim();
  if (!kunde) return { erfolg: false, fehler: "Bitte einen Kunden angeben." };

  const { data: neu, error } = await supabase
    .from("werksbesichtigungen")
    .insert({
      ersteller_id: user.id,
      kunde,
      ort: felder.ort.trim() || null,
      datum: felder.datum,
      merkteam_id: felder.merkteamId,
    })
    .select("id")
    .single();
  if (error || !neu) return { erfolg: false, fehler: error?.message ?? "Fehler beim Anlegen." };

  revalidatePath("/werksbesichtigungen");
  return { erfolg: true, id: neu.id as string };
}

export async function werksbesichtigungAktualisieren(
  id: string,
  felder: { kunde: string; ort: string; datum: string; notizen: string },
) {
  const supabase = await createClient();
  const kunde = felder.kunde.trim();
  if (!kunde) return { erfolg: false, fehler: "Bitte einen Kunden angeben." };

  const { error } = await supabase
    .from("werksbesichtigungen")
    .update({ kunde, ort: felder.ort.trim() || null, datum: felder.datum, notizen: felder.notizen })
    .eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/werksbesichtigungen/${id}`);
  return { erfolg: true };
}

export async function werksbesichtigungLoeschen(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("werksbesichtigungen").delete().eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/werksbesichtigungen");
  return { erfolg: true };
}

// Sucht Nutzer:innen nach Namen, um sie als Mitbearbeiter hinzuzufügen -
// analog zu merkteamNutzerSuchen.
export async function werksbesichtigungNutzerSuchen(werksbesichtigungId: string, suchtext: string) {
  const supabase = await createClient();
  const begriff = suchtext.trim();
  if (!begriff) return [];

  const { data: besichtigung } = await supabase
    .from("werksbesichtigungen")
    .select("ersteller_id")
    .eq("id", werksbesichtigungId)
    .single();
  const { data: bestehende } = await supabase
    .from("werksbesichtigung_bearbeiter")
    .select("user_id")
    .eq("werksbesichtigung_id", werksbesichtigungId);

  const ausgeschlosseneIds = [
    ...(bestehende ?? []).map((b) => b.user_id),
    ...(besichtigung?.ersteller_id ? [besichtigung.ersteller_id] : []),
  ];

  let query = supabase.from("users").select("id, name").ilike("name", `%${begriff}%`).order("name").limit(15);
  if (ausgeschlosseneIds.length > 0) {
    query = query.not("id", "in", `(${ausgeschlosseneIds.join(",")})`);
  }
  const { data } = await query;
  return data ?? [];
}

export async function werksbesichtigungBearbeiterHinzufuegen(werksbesichtigungId: string, nutzerId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("werksbesichtigung_bearbeiter")
    .insert({ werksbesichtigung_id: werksbesichtigungId, user_id: nutzerId });
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true };
}

export async function werksbesichtigungBearbeiterEntfernen(werksbesichtigungId: string, nutzerId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("werksbesichtigung_bearbeiter")
    .delete()
    .eq("werksbesichtigung_id", werksbesichtigungId)
    .eq("user_id", nutzerId);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true };
}

export async function foerderbandEintragErstellen(werksbesichtigungId: string) {
  const supabase = await createClient();
  const { data: neu, error } = await supabase
    .from("foerderband_eintraege")
    .insert({ werksbesichtigung_id: werksbesichtigungId, bezeichnung: "", position: "freifeld" })
    .select("id")
    .single();
  if (error || !neu) return { erfolg: false, fehler: error?.message ?? "Fehler beim Anlegen." };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true, id: neu.id as string };
}

export async function foerderbandEintragAktualisieren(
  id: string,
  werksbesichtigungId: string,
  felder: {
    bezeichnung: string;
    foerderbandbreite: string | null;
    geschwindigkeitMs: number | null;
    material: string | null;
    materialSonstiges: string | null;
    beltConnection: string | null;
    schurrenMasse: string | null;
    position: FoerderbandPosition;
    produktKategorieId: string | null;
    notizen: string;
  },
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("foerderband_eintraege")
    .update({
      bezeichnung: felder.bezeichnung.trim(),
      foerderbandbreite: felder.foerderbandbreite,
      geschwindigkeit_ms: felder.geschwindigkeitMs,
      material: felder.material,
      material_sonstiges: felder.materialSonstiges,
      belt_connection: felder.beltConnection,
      schurren_masse: felder.schurrenMasse,
      position: felder.position,
      produkt_kategorie_id: felder.produktKategorieId,
      notizen: felder.notizen,
    })
    .eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true };
}

export async function foerderbandEintragLoeschen(id: string, werksbesichtigungId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("foerderband_eintraege").delete().eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true };
}

export async function foerderbandFotoHinzufuegen(
  foerderbandEintragId: string,
  werksbesichtigungId: string,
  fotoUrl: string,
) {
  const supabase = await createClient();
  const { data: neu, error } = await supabase
    .from("foerderband_fotos")
    .insert({ foerderband_eintrag_id: foerderbandEintragId, foto_url: fotoUrl })
    .select("id")
    .single();
  if (error || !neu) return { erfolg: false, fehler: error?.message ?? "Fehler beim Speichern." };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true, id: neu.id as string };
}

export async function foerderbandFotoEntfernen(fotoId: string, werksbesichtigungId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("foerderband_fotos").delete().eq("id", fotoId);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true };
}

"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { FoerderbandPosition, Gurtzustand, WerksbesichtigungStatus } from "@/lib/supabase/types";

export async function werksbesichtigungErstellen(felder: {
  kunde: string;
  partner: string;
  ort: string;
  datum: string;
  datumBis: string | null;
  merkteamId: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };

  const kunde = felder.kunde.trim();
  if (!kunde) return { erfolg: false, fehler: "Bitte einen Kunden angeben." };

  // Die id wird bewusst vorab erzeugt statt über .select() nach dem Insert
  // zurückzuholen: Postgres prüft bei INSERT ... RETURNING zusätzlich die
  // SELECT-Policy im selben Statement, was bei einer Policy, die selbst
  // wieder über diese Tabelle liest (werksbesichtigung_sichtbar), fälschlich
  // mit einer RLS-Verletzung fehlschlägt - obwohl Insert und Sichtbarkeit für
  // sich genommen beide korrekt sind.
  const id = randomUUID();
  const { error } = await supabase.from("werksbesichtigungen").insert({
    id,
    ersteller_id: user.id,
    kunde,
    partner: felder.partner.trim() || null,
    ort: felder.ort.trim() || null,
    datum: felder.datum,
    datum_bis: felder.datumBis,
    merkteam_id: felder.merkteamId,
  });
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/werksbesichtigungen");
  return { erfolg: true, id };
}

export async function werksbesichtigungAktualisieren(
  id: string,
  felder: { kunde: string; partner: string; ort: string; datum: string; datumBis: string | null; notizen: string },
) {
  const supabase = await createClient();
  const kunde = felder.kunde.trim();
  if (!kunde) return { erfolg: false, fehler: "Bitte einen Kunden angeben." };

  const { error } = await supabase
    .from("werksbesichtigungen")
    .update({
      kunde,
      partner: felder.partner.trim() || null,
      ort: felder.ort.trim() || null,
      datum: felder.datum,
      datum_bis: felder.datumBis,
      notizen: felder.notizen,
    })
    .eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/werksbesichtigungen/${id}`);
  return { erfolg: true };
}

export async function werksbesichtigungStatusSetzen(id: string, status: WerksbesichtigungStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("werksbesichtigungen").update({ status }).eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/werksbesichtigungen/${id}`);
  revalidatePath("/werksbesichtigungen");
  return { erfolg: true };
}

export async function werksbesichtigungLoeschen(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("werksbesichtigungen").delete().eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/werksbesichtigungen");
  return { erfolg: true };
}

// Sucht Nutzer:innen nach Namen, um sie als Mitbearbeiter hinzuzufügen. Bei
// leerem Suchtext kommt die volle Liste aller verfügbaren Nutzer:innen
// zurück (als Auswahlliste, nicht nur als Tipp-Suche) - abzüglich Ersteller
// und bereits hinzugefügter Mitbearbeiter.
export async function werksbesichtigungNutzerSuchen(werksbesichtigungId: string, suchtext: string) {
  const supabase = await createClient();
  const begriff = suchtext.trim();

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

  let query = supabase.from("users").select("id, name").order("name").limit(50);
  if (begriff) query = query.ilike("name", `%${begriff}%`);
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
  const id = randomUUID();
  const { error } = await supabase
    .from("foerderband_eintraege")
    .insert({ id, werksbesichtigung_id: werksbesichtigungId, bezeichnung: "" });
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true, id };
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
    gurtzustand: Gurtzustand | null;
    schurrenMasse: string | null;
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
      gurtzustand: felder.gurtzustand,
      schurren_masse: felder.schurrenMasse,
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

export async function foerderbandPositionErstellen(foerderbandEintragId: string, werksbesichtigungId: string) {
  const supabase = await createClient();
  const id = randomUUID();
  const { error } = await supabase
    .from("foerderband_positionen")
    .insert({ id, foerderband_eintrag_id: foerderbandEintragId, position: "freifeld" });
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true, id };
}

export async function foerderbandPositionAktualisieren(
  id: string,
  werksbesichtigungId: string,
  felder: {
    position: FoerderbandPosition;
    positionFreitext: string | null;
    produktKategorieId: string | null;
    konfiguration: string;
  },
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("foerderband_positionen")
    .update({
      position: felder.position,
      position_freitext: felder.position === "freifeld" ? felder.positionFreitext?.trim() || null : null,
      produkt_kategorie_id: felder.produktKategorieId,
      konfiguration: felder.konfiguration,
    })
    .eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true };
}

export async function foerderbandPositionLoeschen(id: string, werksbesichtigungId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("foerderband_positionen").delete().eq("id", id);
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
  const id = randomUUID();
  const { error } = await supabase
    .from("foerderband_fotos")
    .insert({ id, foerderband_eintrag_id: foerderbandEintragId, foto_url: fotoUrl });
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true, id };
}

export async function foerderbandFotoEntfernen(fotoId: string, werksbesichtigungId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("foerderband_fotos").delete().eq("id", fotoId);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true };
}

export async function hochgeladenerBerichtErstellen(felder: {
  kunde: string;
  ort: string;
  datum: string;
  dateiname: string;
  dateiUrl: string;
  merkteamId: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };

  const kunde = felder.kunde.trim();
  if (!kunde) return { erfolg: false, fehler: "Bitte einen Kunden angeben." };

  const id = randomUUID();
  const { error } = await supabase.from("hochgeladene_berichte").insert({
    id,
    hochgeladen_von: user.id,
    kunde,
    ort: felder.ort.trim() || null,
    datum: felder.datum,
    dateiname: felder.dateiname,
    datei_url: felder.dateiUrl,
    merkteam_id: felder.merkteamId,
  });
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/werksbesichtigungen");
  return { erfolg: true, id };
}

export async function hochgeladenerBerichtAktualisieren(
  id: string,
  felder: {
    kunde: string;
    ort: string;
    datum: string;
    neueDatei?: { dateiname: string; dateiUrl: string; alteDateiUrl: string | null };
  },
) {
  const supabase = await createClient();
  const kunde = felder.kunde.trim();
  if (!kunde) return { erfolg: false, fehler: "Bitte einen Kunden angeben." };

  const { error } = await supabase
    .from("hochgeladene_berichte")
    .update({
      kunde,
      ort: felder.ort.trim() || null,
      datum: felder.datum,
      ...(felder.neueDatei ? { dateiname: felder.neueDatei.dateiname, datei_url: felder.neueDatei.dateiUrl } : {}),
    })
    .eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };

  // Die alte Datei wird erst gelöscht, nachdem der Datenbank-Eintrag
  // erfolgreich auf die neue URL zeigt - sonst würde ein fehlgeschlagener
  // Löschversuch nie mehr nachgeholt, aber ein verwaistes altes Objekt in
  // der Storage ist unschädlich und kein Grund, die Aktion fehlschlagen zu
  // lassen.
  if (felder.neueDatei?.alteDateiUrl) {
    const pfad = felder.neueDatei.alteDateiUrl.split("/werksbesichtigung-berichte/")[1];
    if (pfad) await supabase.storage.from("werksbesichtigung-berichte").remove([pfad]);
  }

  revalidatePath("/werksbesichtigungen");
  return { erfolg: true };
}

export async function hochgeladenerBerichtLoeschen(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("hochgeladene_berichte").delete().eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/werksbesichtigungen");
  return { erfolg: true };
}

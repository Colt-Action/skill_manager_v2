"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { istGueltigeSprache } from "@/lib/i18n/sprachen";

async function pruefeAdminOderHoeher(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erlaubt: false as const, fehler: "Nicht eingeloggt." };

  const { data: profil } = await supabase.from("users").select("rolle").eq("id", user.id).single();
  if (profil?.rolle !== "admin" && profil?.rolle !== "superadmin") {
    return { erlaubt: false as const, fehler: "Nur Admins dürfen Übersetzungen verwalten." };
  }
  return { erlaubt: true as const };
}

export async function uebersetzungSpeichern(input: {
  videoId: string;
  sprache: string;
  titel: string;
  beschreibung: string;
}) {
  const supabase = await createClient();
  const pruefung = await pruefeAdminOderHoeher(supabase);
  if (!pruefung.erlaubt) return { erfolg: false, fehler: pruefung.fehler };

  if (!istGueltigeSprache(input.sprache)) {
    return { erfolg: false, fehler: "Unbekannte Sprache." };
  }

  const zeilen = [
    { feld: "titel", text: input.titel.trim() },
    { feld: "beschreibung_schritte", text: input.beschreibung.trim() },
  ].filter((z) => z.text.length > 0);

  for (const zeile of zeilen) {
    const { error } = await supabase.from("uebersetzungen").upsert(
      {
        tabelle: "videos",
        datensatz_id: input.videoId,
        feld: zeile.feld,
        sprache: input.sprache,
        text: zeile.text,
      },
      { onConflict: "tabelle,datensatz_id,feld,sprache" },
    );
    if (error) return { erfolg: false, fehler: error.message };
  }

  revalidatePath(`/videos/${input.videoId}`);
  revalidatePath("/admin/uebersetzungen");
  return { erfolg: true };
}

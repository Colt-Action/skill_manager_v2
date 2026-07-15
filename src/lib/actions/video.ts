"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface VideoHochladenInput {
  titel: string;
  dateiUrl: string;
  dauer: number | null;
  beschreibungSchritte: string;
  teilId: string | null;
}

// Wird aufgerufen, nachdem die Videodatei bereits im Supabase Storage
// liegt (das Hochladen der Datei passiert im Browser, siehe UploadForm).
// Diese Funktion legt nur die Datenbank-Zeile an – Status ist danach immer
// automatisch "pruefung" (in Prüfung), egal was übergeben wurde.
export async function videoHochladen(input: VideoHochladenInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { erfolg: false, fehler: "Nicht eingeloggt." };
  }

  const { data: profil } = await supabase.from("users").select("rolle").eq("id", user.id).single();
  if (profil?.rolle === "zuschauer") {
    return { erfolg: false, fehler: "Zuschauer dürfen keine Videos hochladen." };
  }

  const { error } = await supabase.from("videos").insert({
    titel: input.titel,
    datei_url: input.dateiUrl,
    dauer: input.dauer,
    beschreibung_schritte: input.beschreibungSchritte,
    teil_id: input.teilId,
    status: "pruefung",
    hochgeladen_von: user.id,
  });

  if (error) {
    return { erfolg: false, fehler: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/?hochgeladen=1");
}

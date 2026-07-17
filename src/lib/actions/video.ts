"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { VideoTyp } from "@/lib/supabase/types";

interface ReferenzDetailsInput {
  material: string;
  materialSonstiges: string;
  geschwindigkeitMs: number | null;
  foerderbandbreite: string;
  beltConnection: string;
  mechanicalSpliceTyp: string;
  runbackReversible: boolean;
  land: string;
  besonderheiten: string;
}

interface VideoHochladenInput {
  titel: string;
  dateiUrl: string;
  thumbnailUrl: string | null;
  dauer: number | null;
  beschreibungSchritte: string;
  teilId: string | null;
  videoTyp: VideoTyp;
  referenzDetails: ReferenzDetailsInput | null;
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

  const { data: neuesVideo, error } = await supabase
    .from("videos")
    .insert({
      titel: input.titel,
      datei_url: input.dateiUrl,
      thumbnail_url: input.thumbnailUrl,
      dauer: input.dauer,
      beschreibung_schritte: input.beschreibungSchritte,
      teil_id: input.teilId,
      status: "pruefung",
      hochgeladen_von: user.id,
      video_typ: input.videoTyp,
    })
    .select("id")
    .single();

  if (error || !neuesVideo) {
    return { erfolg: false, fehler: error?.message ?? "Fehler beim Speichern." };
  }

  if (input.videoTyp === "referenz" && input.referenzDetails) {
    const d = input.referenzDetails;
    const { error: detailsFehler } = await supabase.from("referenz_video_details").insert({
      video_id: neuesVideo.id,
      material: d.material || null,
      material_sonstiges: d.material === "Sonstiges" ? d.materialSonstiges || null : null,
      geschwindigkeit_ms: d.geschwindigkeitMs,
      foerderbandbreite: d.foerderbandbreite || null,
      belt_connection: d.beltConnection || null,
      mechanical_splice_typ:
        d.beltConnection === "Mechanical Splice" ? d.mechanicalSpliceTyp || null : null,
      runback_reversible: d.runbackReversible,
      land: d.land || null,
      besonderheiten: d.besonderheiten || null,
    });
    if (detailsFehler) {
      return { erfolg: false, fehler: detailsFehler.message };
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/referenzvideos");

  if (input.videoTyp === "referenz") {
    redirect("/referenzvideos?hochgeladen=1");
  }
  redirect("/?hochgeladen=1");
}

// Der Uploader (oder ein Admin) beantragt die Löschung eines Videos. Das
// Video wird dadurch NICHT sofort gelöscht - ein Admin muss das im Bereich
// "Löschanfragen" noch bestätigen.
export async function loeschungBeantragen(videoId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };

  const { error } = await supabase
    .from("videos")
    .update({ loeschung_angefragt: true })
    .eq("id", videoId);

  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/videos/${videoId}`);
  revalidatePath("/admin/loeschanfragen");
  return { erfolg: true };
}

// Techniker meldet, dass er für ein Teil kein passendes Video/keinen
// passenden Eintrag gefunden hat.
export async function teilNichtGefunden(notiz: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };

  if (!notiz.trim()) return { erfolg: false, fehler: "Bitte eine Notiz eingeben." };

  const { error } = await supabase
    .from("teil_anfragen")
    .insert({ nutzer_id: user.id, notiz: notiz.trim() });

  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/admin/teil-anfragen");
  return { erfolg: true };
}

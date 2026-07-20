"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface LoginState {
  fehler: string | null;
  hinweis?: string | null;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "");
  const passwort = String(formData.get("passwort") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password: passwort });

  if (error) {
    return { fehler: "Login fehlgeschlagen. Bitte E-Mail und Passwort prüfen." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function registrieren(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "");
  const passwort = String(formData.get("passwort") ?? "");
  const name = String(formData.get("name") ?? "");
  const zugangscode = String(formData.get("zugangscode") ?? "");

  if (passwort.length < 6) {
    return { fehler: "Das Passwort muss mindestens 6 Zeichen lang sein." };
  }

  const codeGetrimmt = zugangscode.trim();
  if (!codeGetrimmt) {
    return { fehler: "Bitte einen Zugangscode eingeben." };
  }

  const { data: codeGueltig } = await supabase.rpc("zugangscode_gueltig", { p_code: codeGetrimmt });
  if (!codeGueltig) {
    return { fehler: "Zugangscode ist ungültig, abgelaufen oder bereits aufgebraucht. Frag deinen Admin danach." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: passwort,
    options: { data: { name } },
  });

  if (error) {
    return { fehler: `Registrierung fehlgeschlagen: ${error.message}` };
  }

  // Erst nach erfolgreicher Registrierung verbrauchen, damit ein fehlgeschlagener
  // Versuch (z. B. E-Mail schon vergeben) den Code nicht unnötig verbraucht.
  await supabase.rpc("zugangscode_verbrauchen", { p_code: codeGetrimmt });

  if (!data.session) {
    return {
      fehler: null,
      hinweis:
        "Konto erstellt. Falls in deinem Supabase-Projekt die E-Mail-Bestätigung aktiv ist, bestätige zuerst die E-Mail und logge dich dann ein.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function passwortVergessen(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { fehler: "Bitte eine E-Mail-Adresse eingeben." };
  }

  const headerListe = await headers();
  const host = headerListe.get("host") ?? "localhost:3000";
  const protokoll = headerListe.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const basisUrl = `${protokoll}://${host}`;

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${basisUrl}/passwort-zuruecksetzen`,
  });

  // Bewusst immer die gleiche Erfolgsmeldung, egal ob die E-Mail existiert
  // oder nicht - so lässt sich nicht "erraten", welche Adressen registriert sind.
  return {
    fehler: null,
    hinweis:
      "Falls ein Konto mit dieser E-Mail existiert, wurde eine E-Mail mit einem Link zum Zurücksetzen verschickt.",
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

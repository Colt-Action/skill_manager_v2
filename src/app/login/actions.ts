"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

  if (passwort.length < 6) {
    return { fehler: "Das Passwort muss mindestens 6 Zeichen lang sein." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: passwort,
    options: { data: { name } },
  });

  if (error) {
    return { fehler: `Registrierung fehlgeschlagen: ${error.message}` };
  }

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

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

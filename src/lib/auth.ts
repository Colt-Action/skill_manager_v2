import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DbUser } from "@/lib/supabase/types";

// Lädt den eingeloggten Nutzer inkl. Profil (Name, Rolle) aus der
// Datenbank. Wenn niemand eingeloggt ist, geht's zur Login-Seite.
export async function getAktuellerNutzer(): Promise<DbUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profil } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profil) {
    redirect("/login");
  }

  return profil as DbUser;
}

// Wie getAktuellerNutzer(), schickt aber zusätzlich alle nicht-Admins zur
// Startseite zurück. Für Seiten, die nur Trainer/Admin sehen dürfen.
export async function getAktuellerTrainerAdmin(): Promise<DbUser> {
  const nutzer = await getAktuellerNutzer();
  if (nutzer.rolle !== "trainer_admin") {
    redirect("/");
  }
  return nutzer;
}

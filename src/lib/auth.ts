import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DbUser } from "@/lib/supabase/types";

// Lädt den eingeloggten Nutzer inkl. Profil (Name, Rolle) aus der
// Datenbank. Wenn niemand eingeloggt ist, geht's zur Login-Seite.
// Deaktivierte Nutzer (z.B. nach Firmenaustritt) werden automatisch
// ausgeloggt, ihre Daten/Videos bleiben aber unangetastet in der Datenbank.
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

  if (!profil.aktiv) {
    await supabase.auth.signOut();
    redirect("/login?deaktiviert=1");
  }

  return profil as DbUser;
}

// Wie getAktuellerNutzer(), schickt aber zusätzlich alle unter Admin-Level
// zur Startseite zurück. Für Seiten, die Admin oder Superadmin sehen dürfen.
export async function getAktuellerAdminOderHoeher(): Promise<DbUser> {
  const nutzer = await getAktuellerNutzer();
  if (nutzer.rolle !== "admin" && nutzer.rolle !== "superadmin") {
    redirect("/");
  }
  return nutzer;
}

// Nur für den Superadmin (verwaltet Admins).
export async function getAktuellerSuperadmin(): Promise<DbUser> {
  const nutzer = await getAktuellerNutzer();
  if (nutzer.rolle !== "superadmin") {
    redirect("/");
  }
  return nutzer;
}

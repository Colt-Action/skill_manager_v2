import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import NutzerListe from "@/components/NutzerListe";
import type { DbUser } from "@/lib/supabase/types";

export default async function NutzerverwaltungSeite() {
  const angemeldeterNutzer = await getAktuellerAdminOderHoeher();
  const supabase = await createClient();

  const { data: nutzer } = await supabase.from("users").select("*").order("erstellt_am");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Verwaltung</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        Nutzerverwaltung
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        {angemeldeterNutzer.rolle === "superadmin"
          ? "Als Superadmin kannst du alle Rollen vergeben, auch Admin/Superadmin, und Konten deaktivieren."
          : "Als Admin kannst du Techniker/Zuschauer verwalten und deaktivieren. Admin-Konten verwaltet nur der Superadmin."}
      </p>

      <NutzerListe
        nutzerListe={(nutzer ?? []) as DbUser[]}
        eigeneId={angemeldeterNutzer.id}
        istSuperadmin={angemeldeterNutzer.rolle === "superadmin"}
      />
    </div>
  );
}

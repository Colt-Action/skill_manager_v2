import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import NutzerListe from "@/components/NutzerListe";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { DbUser } from "@/lib/supabase/types";

export default async function NutzerverwaltungSeite() {
  const angemeldeterNutzer = await getAktuellerAdminOderHoeher();
  const sprache = istGueltigeSprache(angemeldeterNutzer.sprache) ? angemeldeterNutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const { data: nutzer } = await supabase.from("users").select("*").order("erstellt_am");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("nav.verwaltung", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        {t("admin.nutzerverwaltung", sprache)}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        {angemeldeterNutzer.rolle === "superadmin"
          ? t("admin.nutzerUntertitelSuperadmin", sprache)
          : t("admin.nutzerUntertitelAdmin", sprache)}
      </p>

      <NutzerListe
        nutzerListe={(nutzer ?? []) as DbUser[]}
        eigeneId={angemeldeterNutzer.id}
        istSuperadmin={angemeldeterNutzer.rolle === "superadmin"}
      />
    </div>
  );
}

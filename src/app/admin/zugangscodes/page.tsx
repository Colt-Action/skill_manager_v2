import { createClient } from "@/lib/supabase/server";
import { getAktuellerSuperadmin } from "@/lib/auth";
import ZugangscodeVerwaltung from "@/components/ZugangscodeVerwaltung";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { Zugangscode } from "@/lib/supabase/types";

export default async function AdminZugangscodesSeite() {
  const nutzer = await getAktuellerSuperadmin();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const { data: zugangscodes } = await supabase
    .from("zugangscodes")
    .select("*")
    .order("erstellt_am", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("nav.verwaltung", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        {t("zugangscodes.seitenTitel", sprache)}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        {t("zugangscodes.untertitel", sprache)}
      </p>

      <ZugangscodeVerwaltung zugangscodes={(zugangscodes ?? []) as Zugangscode[]} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import TeilAnfrageZeile from "@/components/TeilAnfrageZeile";
import EmptyState from "@/components/EmptyState";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { TeilAnfrage } from "@/lib/supabase/types";

export default async function TeilAnfragenSeite() {
  const nutzer = await getAktuellerAdminOderHoeher();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const { data: anfragen } = await supabase
    .from("teil_anfragen")
    .select("*, users(name)")
    .eq("bearbeitet", false)
    .order("erstellt_am", { ascending: true });

  const anfrageListe = (anfragen ?? []) as (TeilAnfrage & { users: { name: string } | null })[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("nav.verwaltung", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        {t("admin.teilAnfragenTitel", sprache)}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        {t("admin.teilAnfragenUntertitel", sprache)}
      </p>

      {anfrageListe.length === 0 ? (
        <EmptyState icon="📝" text={t("admin.teilAnfragenLeer", sprache)} />
      ) : (
        <div className="mt-6 space-y-3">
          {anfrageListe.map((anfrage) => (
            <TeilAnfrageZeile key={anfrage.id} anfrage={anfrage} />
          ))}
        </div>
      )}
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import Videothek from "@/components/Videothek";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { Kategorie, Teil, VideoMitDetails } from "@/lib/supabase/types";

export default async function VideothekSeite({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const nutzer = await getAktuellerNutzer();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const { q } = await searchParams;
  const supabase = await createClient();

  const [{ data: videos }, { data: kategorien }, { data: teile }] = await Promise.all([
    supabase
      .from("videos")
      .select(
        "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme))",
      )
      .eq("status", "veroeffentlicht")
      .eq("video_typ", "schulung")
      .order("erstellt_am", { ascending: false }),
    supabase.from("kategorien").select("*").order("name"),
    supabase.from("teile").select("*").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("videothek.eyebrow", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        {t("videothek.titel", sprache)}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        {t("videothek.untertitel", sprache)}
      </p>

      <Videothek
        key={q ?? ""}
        videos={(videos ?? []) as VideoMitDetails[]}
        kategorien={(kategorien ?? []) as Kategorie[]}
        teile={(teile ?? []) as Teil[]}
        anfangsSuchtext={q ?? ""}
      />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import AdminVideoEditor from "@/components/AdminVideoEditor";
import EmptyState from "@/components/EmptyState";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { Kategorie, Teil, VideoMitDetails } from "@/lib/supabase/types";

export default async function AdminPruefungSeite() {
  const nutzer = await getAktuellerAdminOderHoeher();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const [{ data: videos }, { data: kategorien }, { data: teile }] = await Promise.all([
    supabase
      .from("videos")
      .select(
        "*, teile(id, name, teilenummer, beschreibung, kategorie_id), video_tags(tags(id, name, synonyme))",
      )
      .eq("status", "pruefung")
      .order("erstellt_am", { ascending: true }),
    supabase.from("kategorien").select("*").order("name"),
    supabase.from("teile").select("*").order("name"),
  ]);

  const videoListe = (videos ?? []) as VideoMitDetails[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("nav.verwaltung", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        {t("admin.pruefungTitel", sprache)}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        {t("admin.pruefungUntertitel", sprache)}
      </p>

      {videoListe.length === 0 ? (
        <EmptyState icon="🎉" text={t("admin.pruefungLeer", sprache)} />
      ) : (
        <div className="mt-6 space-y-6">
          {videoListe.map((video) => (
            <AdminVideoEditor
              key={video.id}
              video={video}
              kategorien={(kategorien ?? []) as Kategorie[]}
              teile={(teile ?? []) as Teil[]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import EmptyState from "@/components/EmptyState";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { Lernpfad } from "@/lib/supabase/types";

interface LernpfadMitVideos extends Lernpfad {
  lernpfad_videos: { video_id: string }[];
}

export default async function LernpfadeSeite() {
  const nutzer = await getAktuellerNutzer();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const [{ data: lernpfade }, { data: ansichten }] = await Promise.all([
    supabase
      .from("lernpfade")
      .select("*, lernpfad_videos(video_id)")
      .order("erstellt_am", { ascending: false }),
    supabase.from("video_ansichten").select("video_id").eq("user_id", nutzer.id),
  ]);

  const angeseheneIds = new Set((ansichten ?? []).map((a) => a.video_id));
  const liste = (lernpfade ?? []) as unknown as LernpfadMitVideos[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("lernpfade.eyebrow", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        {t("lernpfade.titel", sprache)}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        {t("lernpfade.untertitel", sprache)}
      </p>

      {liste.length === 0 ? (
        <EmptyState icon="🧭" text={t("lernpfade.leer", sprache)} />
      ) : (
        <div className="mt-6 space-y-3">
          {liste.map((lp) => {
            const gesamt = lp.lernpfad_videos.length;
            const angesehen = lp.lernpfad_videos.filter((v) => angeseheneIds.has(v.video_id)).length;
            return (
              <Link
                key={lp.id}
                href={`/lernpfade/${lp.id}`}
                className="block rounded-xl bg-surface p-4 ring-1 ring-line transition hover:ring-accent"
              >
                <h2 className="font-medium text-foreground">{lp.titel}</h2>
                {lp.beschreibung && <p className="mt-1 text-sm text-foreground-soft">{lp.beschreibung}</p>}
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: gesamt > 0 ? `${(angesehen / gesamt) * 100}%` : "0%" }}
                    />
                  </div>
                  <p className="shrink-0 font-mono text-xs text-blueprint">
                    {t("lernpfade.videosAnzahl", sprache, { angesehen: String(angesehen), gesamt: String(gesamt) })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

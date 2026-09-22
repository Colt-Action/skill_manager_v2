import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import LernpfadErstellenForm from "@/components/LernpfadErstellenForm";
import EmptyState from "@/components/EmptyState";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { Lernpfad } from "@/lib/supabase/types";

interface LernpfadMitAnzahl extends Lernpfad {
  lernpfad_videos: { count: number }[];
}

export default async function AdminLernpfadeSeite() {
  const nutzer = await getAktuellerAdminOderHoeher();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const { data: lernpfade } = await supabase
    .from("lernpfade")
    .select("*, lernpfad_videos(count)")
    .order("erstellt_am", { ascending: false });

  const liste = (lernpfade ?? []) as unknown as LernpfadMitAnzahl[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">{t("nav.verwaltung", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink">
        {t("admin.lernpfadeTitel", sprache)}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        {t("admin.lernpfadeUntertitel", sprache)}
      </p>

      <LernpfadErstellenForm />

      {liste.length === 0 ? (
        <EmptyState icon="index" text={t("admin.lernpfadeLeer", sprache)} />
      ) : (
        <div className="mt-6 space-y-3">
          {liste.map((lp) => (
            <Link
              key={lp.id}
              href={`/admin/lernpfade/${lp.id}`}
              className="block border border-rule bg-paper p-4 transition hover:border-signal"
            >
              <h2 className="font-medium text-ink">{lp.titel}</h2>
              {lp.beschreibung && <p className="mt-1 text-sm text-ink-soft">{lp.beschreibung}</p>}
              <p className="mt-2 font-mono text-xs text-annot">
                {t("admin.videosBearbeiten", sprache, { anzahl: String(lp.lernpfad_videos[0]?.count ?? 0) })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import WerksbesichtigungErstellenForm from "@/components/WerksbesichtigungErstellenForm";
import EmptyState from "@/components/EmptyState";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { Werksbesichtigung } from "@/lib/supabase/types";

interface MerkteamZeile {
  merkteams: { id: string; name: string } | { id: string; name: string }[] | null;
}

function einzeln<T>(wert: T | T[] | null | undefined): T | null {
  if (!wert) return null;
  return Array.isArray(wert) ? (wert[0] ?? null) : wert;
}

export default async function WerksbesichtigungenSeite() {
  const nutzer = await getAktuellerNutzer();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const [{ data: besichtigungen }, { data: meineTeamsRoh }] = await Promise.all([
    supabase.from("werksbesichtigungen").select("*").order("datum", { ascending: false }),
    supabase.from("merkteam_mitglieder").select("merkteams(id, name)").eq("user_id", nutzer.id),
  ]);

  const meineTeams = ((meineTeamsRoh ?? []) as unknown as MerkteamZeile[])
    .map((z) => einzeln(z.merkteams))
    .filter((z): z is { id: string; name: string } => z !== null);

  const liste = (besichtigungen ?? []) as Werksbesichtigung[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">{t("werksbesichtigungen.eyebrow", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink">{t("werksbesichtigungen.titel", sprache)}</h1>
      <p className="mt-1 text-sm text-ink-soft">{t("werksbesichtigungen.untertitel", sprache)}</p>

      <WerksbesichtigungErstellenForm meineTeams={meineTeams} />

      {liste.length === 0 ? (
        <EmptyState icon="index" text={t("werksbesichtigungen.leer", sprache)} />
      ) : (
        <div className="mt-6 border-t border-rule-strong">
          {liste.map((besuch) => (
            <Link
              key={besuch.id}
              href={`/werksbesichtigungen/${besuch.id}`}
              className="block border-b border-rule px-1 py-4 transition-colors hover:bg-paper-2"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-medium text-ink">{besuch.kunde}</h2>
                <span className="shrink-0 font-mono text-xs text-ink-soft">
                  {new Date(besuch.datum).toLocaleDateString(sprache)}
                </span>
              </div>
              {besuch.ort && <p className="mt-1 text-sm text-ink-soft">{besuch.ort}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

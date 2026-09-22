import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import MerkteamErstellenForm from "@/components/MerkteamErstellenForm";
import EmptyState from "@/components/EmptyState";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";

interface MerkteamZeile {
  merkteams: { id: string; name: string; merkteam_mitglieder: { count: number }[] } | null;
}

export default async function MerkteamsSeite() {
  const nutzer = await getAktuellerNutzer();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const { data } = await supabase
    .from("merkteam_mitglieder")
    .select("merkteams(id, name, merkteam_mitglieder(count))")
    .eq("user_id", nutzer.id);

  const teams = ((data ?? []) as unknown as MerkteamZeile[])
    .map((z) => z.merkteams)
    .filter((z): z is NonNullable<MerkteamZeile["merkteams"]> => z !== null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">{t("merkteams.eyebrow", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink">{t("merkteams.titel", sprache)}</h1>
      <p className="mt-1 text-sm text-ink-soft">{t("merkteams.untertitel", sprache)}</p>

      <MerkteamErstellenForm />

      {teams.length === 0 ? (
        <EmptyState icon="team" text={t("merkteams.leer", sprache)} />
      ) : (
        <div className="mt-6 border-t border-rule-strong">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/merkteams/${team.id}`}
              className="block border-b border-rule px-1 py-4 transition-colors hover:bg-paper-2"
            >
              <h2 className="font-medium text-ink">{team.name}</h2>
              <p className="mt-1 font-mono text-xs text-annot">
                {t("merkteams.mitgliederAnzahl", sprache, { anzahl: String(team.merkteam_mitglieder[0]?.count ?? 0) })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("merkteams.eyebrow", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        {t("merkteams.titel", sprache)}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">{t("merkteams.untertitel", sprache)}</p>

      <MerkteamErstellenForm />

      {teams.length === 0 ? (
        <EmptyState icon="👥" text={t("merkteams.leer", sprache)} />
      ) : (
        <div className="mt-6 space-y-3">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/merkteams/${team.id}`}
              className="block rounded-xl bg-surface p-4 ring-1 ring-line transition hover:ring-accent"
            >
              <h2 className="font-medium text-foreground">{team.name}</h2>
              <p className="mt-1 font-mono text-xs text-blueprint">
                {t("merkteams.mitgliederAnzahl", sprache, { anzahl: String(team.merkteam_mitglieder[0]?.count ?? 0) })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

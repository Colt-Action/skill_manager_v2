import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import MerkteamVerwaltung from "@/components/MerkteamVerwaltung";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";

interface MitgliedZeile {
  users: { id: string; name: string } | { id: string; name: string }[] | null;
}

export default async function MerkteamDetailSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nutzer = await getAktuellerNutzer();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const [{ data: team }, { data: mitgliederRoh }] = await Promise.all([
    supabase.from("merkteams").select("id, name").eq("id", id).maybeSingle(),
    supabase.from("merkteam_mitglieder").select("users(id, name)").eq("merkteam_id", id).order("beigetreten_am"),
  ]);

  if (!team) notFound();

  const mitglieder = ((mitgliederRoh ?? []) as unknown as MitgliedZeile[])
    .map((z) => (Array.isArray(z.users) ? (z.users[0] ?? null) : z.users))
    .filter((z): z is { id: string; name: string } => z !== null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/merkteams" className="font-mono text-xs uppercase tracking-widest text-accent">
        ← {t("merkteams.titel", sprache)}
      </Link>
      <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-foreground">{team.name}</h1>

      <MerkteamVerwaltung merkteamId={team.id} name={team.name} mitglieder={mitglieder} eigeneId={nutzer.id} />
    </div>
  );
}

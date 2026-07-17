import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import EmptyState from "@/components/EmptyState";
import type { Lernpfad } from "@/lib/supabase/types";

interface LernpfadMitAnzahl extends Lernpfad {
  lernpfad_videos: { count: number }[];
}

export default async function LernpfadeSeite() {
  await getAktuellerNutzer();
  const supabase = await createClient();

  const { data: lernpfade } = await supabase
    .from("lernpfade")
    .select("*, lernpfad_videos(count)")
    .order("erstellt_am", { ascending: false });

  const liste = (lernpfade ?? []) as unknown as LernpfadMitAnzahl[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Wissen strukturiert</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        Lernpfade
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        Videos in sinnvoller Reihenfolge, z. B. für den Einstieg in ein Thema.
      </p>

      {liste.length === 0 ? (
        <EmptyState icon="🧭" text="Aktuell gibt es noch keine Lernpfade." />
      ) : (
        <div className="mt-6 space-y-3">
          {liste.map((lp) => (
            <Link
              key={lp.id}
              href={`/lernpfade/${lp.id}`}
              className="block rounded-xl bg-surface p-4 ring-1 ring-line transition hover:ring-accent"
            >
              <h2 className="font-medium text-foreground">{lp.titel}</h2>
              {lp.beschreibung && <p className="mt-1 text-sm text-foreground-soft">{lp.beschreibung}</p>}
              <p className="mt-2 font-mono text-xs text-blueprint">
                {lp.lernpfad_videos[0]?.count ?? 0} Videos
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

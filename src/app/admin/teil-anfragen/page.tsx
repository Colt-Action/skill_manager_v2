import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import TeilAnfrageZeile from "@/components/TeilAnfrageZeile";
import type { TeilAnfrage } from "@/lib/supabase/types";

export default async function TeilAnfragenSeite() {
  await getAktuellerAdminOderHoeher();
  const supabase = await createClient();

  const { data: anfragen } = await supabase
    .from("teil_anfragen")
    .select("*, users(name)")
    .eq("bearbeitet", false)
    .order("erstellt_am", { ascending: true });

  const anfrageListe = (anfragen ?? []) as (TeilAnfrage & { users: { name: string } | null })[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">&bdquo;Teil nicht gefunden&ldquo;-Meldungen</h1>
      <p className="mt-1 text-sm text-slate-500">
        Rückmeldungen von Technikern, die ein Teil nicht finden konnten.
      </p>

      {anfrageListe.length === 0 ? (
        <p className="mt-10 text-sm text-slate-500">Aktuell keine offenen Meldungen.</p>
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

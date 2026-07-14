import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import UploadForm from "@/components/UploadForm";
import type { Kategorie, Teil } from "@/lib/supabase/types";

export default async function UploadSeite() {
  await getAktuellerNutzer();
  const supabase = await createClient();

  const [{ data: kategorien }, { data: teile }] = await Promise.all([
    supabase.from("kategorien").select("*").order("name"),
    supabase.from("teile").select("*").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Video hochladen</h1>
      <p className="mt-1 text-sm text-slate-500">
        Lade ein kurzes Erklärvideo (15–30 Sek.) hoch. Nach dem Absenden landet es automatisch
        im Status &bdquo;In Prüfung&ldquo; und wird von einem Trainer freigegeben, bevor es für
        alle sichtbar ist.
      </p>

      <UploadForm
        kategorien={(kategorien ?? []) as Kategorie[]}
        teile={(teile ?? []) as Teil[]}
      />
    </div>
  );
}

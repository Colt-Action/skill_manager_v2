import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import UploadForm from "@/components/UploadForm";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { Kategorie, Teil } from "@/lib/supabase/types";

export default async function UploadSeite() {
  const nutzer = await getAktuellerNutzer();
  if (nutzer.rolle === "zuschauer") {
    redirect("/");
  }
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const [{ data: kategorien }, { data: teile }] = await Promise.all([
    supabase.from("kategorien").select("*").order("name"),
    supabase.from("teile").select("*").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("upload.eyebrow", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        {t("upload.seitenTitel", sprache)}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        {t("upload.seitenUntertitel", sprache)}
      </p>

      <UploadForm
        kategorien={(kategorien ?? []) as Kategorie[]}
        teile={(teile ?? []) as Teil[]}
      />
    </div>
  );
}

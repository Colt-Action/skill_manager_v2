import { getAktuellerNutzer } from "@/lib/auth";
import TeilMeldenForm from "@/components/TeilMeldenForm";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";

export default async function TeilMeldenSeite() {
  const nutzer = await getAktuellerNutzer();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("teilMelden.eyebrow", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        {t("teilMelden.titel", sprache)}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        {t("teilMelden.untertitel", sprache)}
      </p>

      <TeilMeldenForm />
    </div>
  );
}

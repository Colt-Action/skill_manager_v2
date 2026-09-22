import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import { dauerFormatieren } from "@/lib/format";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";

export default async function AnalyticsSeite() {
  const nutzer = await getAktuellerAdminOderHoeher();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const [{ data: topVideos }, { data: suchanfragen }] = await Promise.all([
    supabase
      .from("videos")
      .select("id, titel, aufrufe, dauer, status")
      .order("aufrufe", { ascending: false })
      .limit(10),
    supabase
      .from("suchanfragen_ohne_treffer")
      .select("suchbegriff, erstellt_am")
      .order("erstellt_am", { ascending: false })
      .limit(500),
  ]);

  const gruppiert = new Map<string, { anzahl: number; zuletzt: string }>();
  for (const eintrag of suchanfragen ?? []) {
    const begriff = eintrag.suchbegriff.trim().toLowerCase();
    const bestehend = gruppiert.get(begriff);
    if (bestehend) {
      bestehend.anzahl += 1;
    } else {
      gruppiert.set(begriff, { anzahl: 1, zuletzt: eintrag.erstellt_am });
    }
  }
  const suchenOhneTreffer = Array.from(gruppiert.entries())
    .map(([begriff, info]) => ({ begriff, ...info }))
    .sort((a, b) => b.anzahl - a.anzahl)
    .slice(0, 20);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">{t("nav.verwaltung", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink">
        {t("admin.analyticsTitel", sprache)}
      </h1>

      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-wide text-ink-soft">{t("admin.meistgeseheneVideos", sprache)}</h2>
        <div className="mt-3 overflow-hidden border border-rule bg-paper">
          {!topVideos || topVideos.length === 0 ? (
            <p className="p-4 text-sm text-ink-soft">{t("admin.nochKeineAufrufe", sprache)}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-paper font-mono text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-2">{t("admin.titelSpalte", sprache)}</th>
                  <th className="px-4 py-2">{t("admin.dauerSpalte", sprache)}</th>
                  <th className="px-4 py-2">{t("admin.aufrufeSpalte", sprache)}</th>
                </tr>
              </thead>
              <tbody className="divide-y rule">
                {topVideos.map((video) => (
                  <tr key={video.id}>
                    <td className="px-4 py-2 text-ink">{video.titel}</td>
                    <td className="px-4 py-2 font-mono text-ink-soft">{dauerFormatieren(video.dauer)}</td>
                    <td className="px-4 py-2 font-medium text-ink">{video.aufrufe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-mono text-xs uppercase tracking-wide text-ink-soft">{t("admin.suchenOhneTreffer", sprache)}</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {t("admin.suchenOhneTrefferUntertitel", sprache)}
        </p>
        <div className="mt-3 overflow-hidden border border-rule bg-paper">
          {suchenOhneTreffer.length === 0 ? (
            <p className="p-4 text-sm text-ink-soft">{t("admin.bisherKeineErfolglosenSuchen", sprache)}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-paper font-mono text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-2">{t("admin.suchbegriffSpalte", sprache)}</th>
                  <th className="px-4 py-2">{t("admin.haeufigkeitSpalte", sprache)}</th>
                  <th className="px-4 py-2">{t("admin.zuletztGesuchtSpalte", sprache)}</th>
                </tr>
              </thead>
              <tbody className="divide-y rule">
                {suchenOhneTreffer.map((eintrag) => (
                  <tr key={eintrag.begriff}>
                    <td className="px-4 py-2 text-ink">{eintrag.begriff}</td>
                    <td className="px-4 py-2 font-medium text-ink">{eintrag.anzahl}</td>
                    <td className="px-4 py-2 font-mono text-ink-soft">
                      {new Date(eintrag.zuletzt).toLocaleDateString("de-DE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

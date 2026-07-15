import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import { dauerFormatieren } from "@/lib/format";

export default async function AnalyticsSeite() {
  await getAktuellerAdminOderHoeher();
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
      <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>

      <section className="mt-8">
        <h2 className="font-medium text-slate-900">Meistgesehene Videos</h2>
        <div className="mt-3 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
          {!topVideos || topVideos.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Noch keine Aufrufe erfasst.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">Titel</th>
                  <th className="px-4 py-2">Dauer</th>
                  <th className="px-4 py-2">Aufrufe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topVideos.map((video) => (
                  <tr key={video.id}>
                    <td className="px-4 py-2 text-slate-800">{video.titel}</td>
                    <td className="px-4 py-2 text-slate-500">{dauerFormatieren(video.dauer)}</td>
                    <td className="px-4 py-2 font-medium text-slate-900">{video.aufrufe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-medium text-slate-900">Suchanfragen ohne Treffer</h2>
        <p className="mt-1 text-sm text-slate-500">
          Diese Begriffe wurden gesucht, ohne dass die Videothek Ergebnisse zeigen konnte – ein
          Hinweis darauf, wo Videos, Tags oder Synonyme fehlen.
        </p>
        <div className="mt-3 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
          {suchenOhneTreffer.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Bisher keine erfolglosen Suchen erfasst.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">Suchbegriff</th>
                  <th className="px-4 py-2">Häufigkeit</th>
                  <th className="px-4 py-2">Zuletzt gesucht</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suchenOhneTreffer.map((eintrag) => (
                  <tr key={eintrag.begriff}>
                    <td className="px-4 py-2 text-slate-800">{eintrag.begriff}</td>
                    <td className="px-4 py-2 font-medium text-slate-900">{eintrag.anzahl}</td>
                    <td className="px-4 py-2 text-slate-500">
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

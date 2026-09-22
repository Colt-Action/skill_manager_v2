import SectionLinie from "@/components/SectionLinie";
import { t } from "@/lib/i18n/t";
import type { Sprache } from "@/lib/i18n/sprachen";

export default function ProfilStatistik({
  videosGesamt,
  videosVeroeffentlicht,
  feedbackGesamt,
  feedbackHilfreich,
  sprache,
}: {
  videosGesamt: number;
  videosVeroeffentlicht: number;
  feedbackGesamt: number;
  feedbackHilfreich: number;
  sprache: Sprache;
}) {
  const hilfreichQuote =
    feedbackGesamt > 0 ? Math.round((feedbackHilfreich / feedbackGesamt) * 100) : null;

  return (
    <section className="mt-10">
      <SectionLinie titel={t("profilStatistik.titel", sprache)} />
      <div className="mt-3 grid grid-cols-2 gap-px bg-rule sm:grid-cols-3">
        <Kachel wert={videosGesamt} label={t("profilStatistik.videosBeigetragen", sprache)} />
        <Kachel wert={videosVeroeffentlicht} label={t("profilStatistik.davonVeroeffentlicht", sprache)} />
        <Kachel
          wert={hilfreichQuote !== null ? `${hilfreichQuote}%` : "–"}
          label={
            feedbackGesamt > 0
              ? t("profilStatistik.hilfreichAnzahl", sprache, { anzahl: String(feedbackGesamt) })
              : t("profilStatistik.nochKeineBewertungen", sprache)
          }
        />
      </div>
    </section>
  );
}

function Kachel({ wert, label }: { wert: number | string; label: string }) {
  return (
    <div className="bg-paper p-4 text-center">
      <span className="font-display text-2xl font-bold text-ink">{wert}</span>
      <span className="mt-1 block text-xs text-ink-soft">{label}</span>
    </div>
  );
}

export default function ProfilStatistik({
  videosGesamt,
  videosVeroeffentlicht,
  feedbackGesamt,
  feedbackHilfreich,
}: {
  videosGesamt: number;
  videosVeroeffentlicht: number;
  feedbackGesamt: number;
  feedbackHilfreich: number;
}) {
  const hilfreichQuote =
    feedbackGesamt > 0 ? Math.round((feedbackHilfreich / feedbackGesamt) * 100) : null;

  return (
    <div className="mt-8">
      <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">Deine Statistik</h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Kachel wert={videosGesamt} label="Videos beigetragen" />
        <Kachel wert={videosVeroeffentlicht} label="davon veröffentlicht" />
        <Kachel
          wert={hilfreichQuote !== null ? `${hilfreichQuote}%` : "–"}
          label={feedbackGesamt > 0 ? `hilfreich (${feedbackGesamt} Bewertungen)` : "noch keine Bewertungen"}
        />
      </div>
    </div>
  );
}

function Kachel({ wert, label }: { wert: number | string; label: string }) {
  return (
    <div className="rounded-xl bg-surface p-4 text-center ring-1 ring-line">
      <span className="font-display text-2xl font-bold text-foreground">{wert}</span>
      <span className="mt-1 block text-xs text-foreground-soft">{label}</span>
    </div>
  );
}

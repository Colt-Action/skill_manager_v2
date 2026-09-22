"use client";

import { useState } from "react";
import { loeschanfrageAblehnen, videoEndgueltigLoeschen } from "@/lib/actions/admin";
import { useSprache } from "@/components/SprachProvider";
import type { VideoMitDetails } from "@/lib/supabase/types";

export default function LoeschanfrageZeile({ video }: { video: VideoMitDetails }) {
  const { t } = useSprache();
  const [laeuft, setLaeuft] = useState(false);
  const [erledigt, setErledigt] = useState(false);

  async function endgueltigLoeschen() {
    if (!confirm(t("loeschanfrage.bestaetigung", { titel: video.titel }))) return;
    setLaeuft(true);
    const ergebnis = await videoEndgueltigLoeschen(video.id);
    setLaeuft(false);
    if (ergebnis.erfolg) setErledigt(true);
  }

  async function ablehnen() {
    setLaeuft(true);
    const ergebnis = await loeschanfrageAblehnen(video.id);
    setLaeuft(false);
    if (ergebnis.erfolg) setErledigt(true);
  }

  if (erledigt) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 border border-rule bg-paper p-4">
      <video src={video.datei_url} className="h-16 w-28 rounded-[2px] bg-plate object-cover" muted />
      <div className="min-w-[160px] flex-1">
        <p className="font-medium text-ink">{video.titel}</p>
        {video.teile && (
          <p className="font-mono text-xs text-ink-soft">
            {video.teile.name} · {video.teile.teilenummer}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={ablehnen}
        disabled={laeuft}
        className="rounded-[2px] border border-rule px-3 py-1.5 text-sm text-ink hover:bg-paper-2 disabled:opacity-50"
      >
        {t("loeschanfrage.ablehnen")}
      </button>
      <button
        type="button"
        onClick={endgueltigLoeschen}
        disabled={laeuft}
        className="rounded-[2px] bg-critical px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {t("loeschanfrage.endgueltigLoeschen")}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { loeschanfrageAblehnen, videoEndgueltigLoeschen } from "@/lib/actions/admin";
import type { VideoMitDetails } from "@/lib/supabase/types";

export default function LoeschanfrageZeile({ video }: { video: VideoMitDetails }) {
  const [laeuft, setLaeuft] = useState(false);
  const [erledigt, setErledigt] = useState(false);

  async function endgueltigLoeschen() {
    if (!confirm(`"${video.titel}" wirklich endgültig löschen? Das kann nicht rückgängig gemacht werden.`))
      return;
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
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <video src={video.datei_url} className="h-16 w-28 rounded-lg bg-black object-cover" muted />
      <div className="min-w-[160px] flex-1">
        <p className="font-medium text-slate-800">{video.titel}</p>
        {video.teile && (
          <p className="text-xs text-slate-500">
            {video.teile.name} · {video.teile.teilenummer}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={ablehnen}
        disabled={laeuft}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
      >
        Ablehnen
      </button>
      <button
        type="button"
        onClick={endgueltigLoeschen}
        disabled={laeuft}
        className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
      >
        Endgültig löschen
      </button>
    </div>
  );
}

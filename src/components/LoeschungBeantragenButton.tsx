"use client";

import { useState } from "react";
import { loeschungBeantragen } from "@/lib/actions/video";

export default function LoeschungBeantragenButton({
  videoId,
  bereitsBeantragt,
}: {
  videoId: string;
  bereitsBeantragt: boolean;
}) {
  const [beantragt, setBeantragt] = useState(bereitsBeantragt);
  const [laeuft, setLaeuft] = useState(false);

  async function beantragen() {
    if (!confirm("Löschung wirklich beantragen? Ein Admin muss das noch bestätigen.")) return;
    setLaeuft(true);
    const ergebnis = await loeschungBeantragen(videoId);
    setLaeuft(false);
    if (ergebnis.erfolg) setBeantragt(true);
  }

  if (beantragt) {
    return <p className="text-xs text-amber-600">Löschung beantragt – wartet auf Admin-Bestätigung.</p>;
  }

  return (
    <button
      type="button"
      onClick={beantragen}
      disabled={laeuft}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {laeuft ? "…" : "Löschung beantragen"}
    </button>
  );
}

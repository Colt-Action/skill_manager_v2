"use client";

import { useState } from "react";
import { loeschungBeantragen } from "@/lib/actions/video";
import StatusBadge from "@/components/StatusBadge";

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
    return <StatusBadge label="Löschung beantragt" ton="accent" />;
  }

  return (
    <button
      type="button"
      onClick={beantragen}
      disabled={laeuft}
      className="rounded-lg border border-critical/30 px-3 py-1.5 text-xs text-critical hover:bg-critical/10 disabled:opacity-50"
    >
      {laeuft ? "…" : "Löschung beantragen"}
    </button>
  );
}

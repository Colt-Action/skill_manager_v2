"use client";

import { QRCodeCanvas } from "qrcode.react";
import type { Teil } from "@/lib/supabase/types";

export default function QrCodeListe({ teile, basisUrl }: { teile: Teil[]; basisUrl: string }) {
  function herunterladen(teil: Teil) {
    const canvas = document.getElementById(`qr-${teil.id}`) as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${teil.teilenummer}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  if (teile.length === 0) {
    return <p className="mt-10 text-sm text-foreground-soft">Noch keine Teile angelegt.</p>;
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {teile.map((teil) => (
        <div
          key={teil.id}
          className="flex flex-col items-center gap-2 rounded-xl bg-surface p-4 text-center ring-1 ring-line"
        >
          <QRCodeCanvas id={`qr-${teil.id}`} value={`${basisUrl}/t/${teil.qr_code_id}`} size={160} />
          <p className="text-sm font-medium text-foreground">{teil.name}</p>
          <p className="font-mono text-xs text-foreground-soft">Teil-Nr. {teil.teilenummer}</p>
          <button
            type="button"
            onClick={() => herunterladen(teil)}
            className="mt-1 rounded-lg border border-line px-3 py-1 text-xs text-foreground hover:bg-background"
          >
            Als PNG herunterladen
          </button>
        </div>
      ))}
    </div>
  );
}

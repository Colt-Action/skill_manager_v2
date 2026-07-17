"use client";

import { QRCodeCanvas } from "qrcode.react";
import EmptyState from "@/components/EmptyState";
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
    return <EmptyState icon="🏷️" text="Noch keine Teile angelegt." />;
  }

  return (
    <div>
      <div className="mt-6 flex justify-end print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-accent-ink transition hover:bg-accent-deep"
        >
          Alle drucken / als PDF speichern
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-3">
        {teile.map((teil) => (
          <div
            key={teil.id}
            className="flex flex-col items-center gap-2 rounded-xl bg-surface p-4 text-center ring-1 ring-line print:break-inside-avoid print:border print:border-black/20 print:bg-white print:text-black print:shadow-none print:ring-0"
          >
            <QRCodeCanvas id={`qr-${teil.id}`} value={`${basisUrl}/t/${teil.qr_code_id}`} size={160} />
            <p className="text-sm font-medium text-foreground print:text-black">{teil.name}</p>
            <p className="font-mono text-xs text-foreground-soft print:text-black">Teil-Nr. {teil.teilenummer}</p>
            <button
              type="button"
              onClick={() => herunterladen(teil)}
              className="mt-1 rounded-lg border border-line px-3 py-1 text-xs text-foreground hover:bg-background print:hidden"
            >
              Als PNG herunterladen
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

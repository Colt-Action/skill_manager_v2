"use client";

import { QRCodeCanvas } from "qrcode.react";
import EmptyState from "@/components/EmptyState";
import { useSprache } from "@/components/SprachProvider";
import type { Teil } from "@/lib/supabase/types";

export default function QrCodeListe({ teile, basisUrl }: { teile: Teil[]; basisUrl: string }) {
  const { t } = useSprache();
  function herunterladen(teil: Teil) {
    const canvas = document.getElementById(`qr-${teil.id}`) as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${teil.teilenummer}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  if (teile.length === 0) {
    return <EmptyState icon="teilTag" text={t("qrCodeListe.leer")} />;
  }

  return (
    <div>
      <div className="mt-6 flex justify-end print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-[2px] bg-signal px-4 py-2 text-sm font-bold uppercase tracking-wide text-signal-ink transition hover:bg-signal"
        >
          {t("qrCodeListe.alleDrucken")}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-3">
        {teile.map((teil) => (
          <div
            key={teil.id}
            className="flex flex-col items-center gap-2 rounded-xl bg-paper p-4 text-center ring-1 ring-line print:break-inside-avoid print:border print:border-black/20 print:bg-white print:text-black print:shadow-none print:ring-0"
          >
            <QRCodeCanvas id={`qr-${teil.id}`} value={`${basisUrl}/t/${teil.qr_code_id}`} size={160} />
            <p className="text-sm font-medium text-ink print:text-black">{teil.name}</p>
            <p className="font-mono text-xs text-ink-soft print:text-black">{t("qrCodeListe.teilNr", { nummer: teil.teilenummer })}</p>
            <button
              type="button"
              onClick={() => herunterladen(teil)}
              className="mt-1 rounded-[2px] border border-rule px-3 py-1 text-xs text-ink hover:bg-paper-2 print:hidden"
            >
              {t("qrCodeListe.alsPngHerunterladen")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useSprache } from "@/components/SprachProvider";
import { useToast } from "@/components/ToastProvider";
import { werksbesichtigungAlsPdf } from "@/lib/werksbesichtigungPdf";
import type { FoerderbandEintragMitDetails, Werksbesichtigung } from "@/lib/supabase/types";

export default function WerksbesichtigungPdfExport({
  besuch,
  eintraege,
}: {
  besuch: Werksbesichtigung;
  eintraege: FoerderbandEintragMitDetails[];
}) {
  const { t, sprache } = useSprache();
  const toast = useToast();
  const [exportiertLaeuft, setExportiertLaeuft] = useState(false);

  async function exportieren() {
    setExportiertLaeuft(true);
    try {
      const datumFormatiert = besuch.datum_bis
        ? `${new Date(besuch.datum).toLocaleDateString(sprache)} – ${new Date(besuch.datum_bis).toLocaleDateString(sprache)}`
        : new Date(besuch.datum).toLocaleDateString(sprache);
      await werksbesichtigungAlsPdf(besuch, eintraege, datumFormatiert);
    } catch {
      toast(t("profil.fehlerStandard"), "fehler");
    } finally {
      setExportiertLaeuft(false);
    }
  }

  return (
    <button
      type="button"
      onClick={exportieren}
      disabled={exportiertLaeuft}
      className="rounded-[2px] border border-rule-strong px-3 py-1.5 text-xs uppercase tracking-wide text-ink hover:bg-paper-2 disabled:opacity-50"
    >
      {exportiertLaeuft ? t("werksbesichtigungen.exportLaeuft") : t("werksbesichtigungen.exportPdf")}
    </button>
  );
}

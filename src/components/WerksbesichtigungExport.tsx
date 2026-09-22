"use client";

import { useState } from "react";
import { useSprache } from "@/components/SprachProvider";
import { useToast } from "@/components/ToastProvider";
import { werksbesichtigungAlsPdf } from "@/lib/werksbesichtigungPdf";
import { werksbesichtigungAlsDocx } from "@/lib/werksbesichtigungDocx";
import type { FoerderbandEintragMitDetails, Werksbesichtigung } from "@/lib/supabase/types";

export default function WerksbesichtigungExport({
  besuch,
  eintraege,
}: {
  besuch: Werksbesichtigung;
  eintraege: FoerderbandEintragMitDetails[];
}) {
  const { t, sprache } = useSprache();
  const toast = useToast();
  const [exportiertLaeuft, setExportiertLaeuft] = useState<"pdf" | "docx" | null>(null);

  function datumFormatiert() {
    return besuch.datum_bis
      ? `${new Date(besuch.datum).toLocaleDateString(sprache)} – ${new Date(besuch.datum_bis).toLocaleDateString(sprache)}`
      : new Date(besuch.datum).toLocaleDateString(sprache);
  }

  async function alsPdf() {
    setExportiertLaeuft("pdf");
    try {
      await werksbesichtigungAlsPdf(besuch, eintraege, datumFormatiert());
    } catch {
      toast(t("profil.fehlerStandard"), "fehler");
    } finally {
      setExportiertLaeuft(null);
    }
  }

  async function alsDocx() {
    setExportiertLaeuft("docx");
    try {
      await werksbesichtigungAlsDocx(besuch, eintraege, datumFormatiert());
    } catch {
      toast(t("profil.fehlerStandard"), "fehler");
    } finally {
      setExportiertLaeuft(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={alsPdf}
        disabled={exportiertLaeuft !== null}
        className="rounded-[2px] border border-rule-strong px-3 py-1.5 text-xs uppercase tracking-wide text-ink hover:bg-paper-2 disabled:opacity-50"
      >
        {exportiertLaeuft === "pdf" ? t("werksbesichtigungen.exportLaeuft") : t("werksbesichtigungen.exportPdf")}
      </button>
      <button
        type="button"
        onClick={alsDocx}
        disabled={exportiertLaeuft !== null}
        className="rounded-[2px] border border-rule-strong px-3 py-1.5 text-xs uppercase tracking-wide text-ink hover:bg-paper-2 disabled:opacity-50"
      >
        {exportiertLaeuft === "docx" ? t("werksbesichtigungen.exportLaeuft") : t("werksbesichtigungen.exportWord")}
      </button>
    </div>
  );
}

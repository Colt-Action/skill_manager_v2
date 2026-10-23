"use client";

import { useState } from "react";
import { useSprache } from "@/components/SprachProvider";
import { useToast } from "@/components/ToastProvider";
import { werksbesichtigungAlsPdf } from "@/lib/werksbesichtigungPdf";
import { werksbesichtigungAlsDocx } from "@/lib/werksbesichtigungDocx";
import type { FoerderbandEintragMitDetails, Kategorie, Werksbesichtigung } from "@/lib/supabase/types";

export default function WerksbesichtigungExport({
  besuch,
  eintraege,
  kategorien,
  ungespeichert = false,
}: {
  besuch: Werksbesichtigung;
  eintraege: FoerderbandEintragMitDetails[];
  /** Für "Produkt · Typ" in der Produkt-Empfehlung. */
  kategorien: Kategorie[];
  /** Offene, ungespeicherte Eingaben - der Export nutzt nur den gespeicherten Stand. */
  ungespeichert?: boolean;
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
      await werksbesichtigungAlsPdf(besuch, eintraege, kategorien, datumFormatiert());
    } catch {
      toast(t("profil.fehlerStandard"), "fehler");
    } finally {
      setExportiertLaeuft(null);
    }
  }

  async function alsDocx() {
    setExportiertLaeuft("docx");
    try {
      await werksbesichtigungAlsDocx(besuch, eintraege, kategorien, datumFormatiert());
    } catch {
      toast(t("profil.fehlerStandard"), "fehler");
    } finally {
      setExportiertLaeuft(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {ungespeichert && (
        <p role="status" className="w-full border-l-[3px] border-critical pl-3 text-xs text-ink sm:w-auto">
          {t("werksbesichtigungen.exportUngespeichert")}
        </p>
      )}
      <button
        type="button"
        onClick={alsPdf}
        disabled={exportiertLaeuft !== null}
        className="min-h-11 rounded-[2px] border border-rule-strong px-3 py-1.5 text-xs uppercase tracking-wide text-ink hover:bg-paper-2 disabled:opacity-50"
      >
        {exportiertLaeuft === "pdf" ? t("werksbesichtigungen.exportLaeuft") : t("werksbesichtigungen.exportPdf")}
      </button>
      <button
        type="button"
        onClick={alsDocx}
        disabled={exportiertLaeuft !== null}
        className="min-h-11 rounded-[2px] border border-rule-strong px-3 py-1.5 text-xs uppercase tracking-wide text-ink hover:bg-paper-2 disabled:opacity-50"
      >
        {exportiertLaeuft === "docx" ? t("werksbesichtigungen.exportLaeuft") : t("werksbesichtigungen.exportWord")}
      </button>
    </div>
  );
}

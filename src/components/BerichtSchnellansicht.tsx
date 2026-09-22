"use client";

import { useSprache } from "@/components/SprachProvider";
import Icon from "@/components/icons/Icon";
import type { BerichtEintrag } from "@/components/WerksbesichtigungenUebersicht";

export default function BerichtSchnellansicht({
  eintrag,
  onSchliessen,
}: {
  eintrag: BerichtEintrag;
  onSchliessen: () => void;
}) {
  const { t, sprache } = useSprache();
  const istPdf = eintrag.quelle === "upload" && eintrag.href.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onSchliessen}>
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col border border-rule-strong bg-paper text-ink shadow-[0_12px_32px_-12px_rgba(21,22,26,.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-rule-strong p-4">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">{eintrag.kunde}</h2>
            <p className="text-sm text-ink-soft">
              {[eintrag.ort, new Date(eintrag.datum).toLocaleDateString(sprache)].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button type="button" onClick={onSchliessen} className="shrink-0 text-ink-faint hover:text-ink">
            <Icon name="schliessen" size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {eintrag.quelle === "upload" ? (
            istPdf ? (
              <iframe src={eintrag.href} title={eintrag.kunde} className="h-[65vh] w-full border border-rule" />
            ) : (
              <p className="text-sm text-ink-soft">{t("werksbesichtigungen.schnellansichtKeineVorschau")}</p>
            )
          ) : (
            <p className="whitespace-pre-wrap text-sm text-ink">
              {eintrag.notizenVorschau?.trim() || t("werksbesichtigungen.schnellansichtKeineNotizen")}
            </p>
          )}
        </div>

        <div className="border-t border-rule-strong p-4">
          <a
            href={eintrag.href}
            target={eintrag.quelle === "upload" ? "_blank" : undefined}
            rel={eintrag.quelle === "upload" ? "noreferrer" : undefined}
            className="inline-block rounded-[2px] bg-signal px-4 py-2 text-sm font-bold uppercase tracking-wide text-signal-ink"
          >
            {eintrag.quelle === "upload" ? t("werksbesichtigungen.schnellansichtDateiOeffnen") : t("werksbesichtigungen.schnellansichtVollstaendig")}
          </a>
        </div>
      </div>
    </div>
  );
}

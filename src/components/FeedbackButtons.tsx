"use client";

import { useState, useTransition } from "react";
import { feedbackAbgeben } from "@/lib/actions/feedback";
import { useSprache } from "@/components/SprachProvider";

export default function FeedbackButtons({ videoId }: { videoId: string }) {
  const { t } = useSprache();
  const [gesendet, setGesendet] = useState<"hilfreich" | "nicht_hilfreich" | null>(null);
  const [istPending, startTransition] = useTransition();

  function abstimmen(hilfreich: boolean) {
    startTransition(async () => {
      const ergebnis = await feedbackAbgeben(videoId, hilfreich);
      if (ergebnis.erfolg) {
        setGesendet(hilfreich ? "hilfreich" : "nicht_hilfreich");
      }
    });
  }

  if (gesendet) {
    return <p className="text-sm text-ink-soft">{t("feedback.danke")}</p>;
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-ink">{t("feedback.frage")}</span>
      <button
        type="button"
        disabled={istPending}
        onClick={() => abstimmen(true)}
        className="rounded-[2px] border border-rule px-3 py-1.5 text-sm text-ink hover:bg-paper-2 disabled:opacity-50"
      >
        {t("feedback.ja")}
      </button>
      <button
        type="button"
        disabled={istPending}
        onClick={() => abstimmen(false)}
        className="rounded-[2px] border border-rule px-3 py-1.5 text-sm text-ink hover:bg-paper-2 disabled:opacity-50"
      >
        {t("feedback.nein")}
      </button>
    </div>
  );
}

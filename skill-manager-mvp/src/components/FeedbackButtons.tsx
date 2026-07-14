"use client";

import { useState, useTransition } from "react";
import { feedbackAbgeben } from "@/lib/actions/feedback";

export default function FeedbackButtons({ videoId }: { videoId: string }) {
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
    return (
      <p className="text-sm text-slate-500">
        Danke für dein Feedback{gesendet === "hilfreich" ? " 👍" : " 👎"}!
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-700">War das hilfreich?</span>
      <button
        type="button"
        disabled={istPending}
        onClick={() => abstimmen(true)}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
      >
        👍 Ja
      </button>
      <button
        type="button"
        disabled={istPending}
        onClick={() => abstimmen(false)}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
      >
        👎 Nein
      </button>
    </div>
  );
}

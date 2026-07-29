"use client";

import { useState, useTransition } from "react";
import { videoLikeUmschalten } from "@/lib/actions/likes";

export default function LikeButton({
  videoId,
  anfangsAnzahl,
  anfangsGeliked,
  eingeloggt,
}: {
  videoId: string;
  anfangsAnzahl: number;
  anfangsGeliked: boolean;
  eingeloggt: boolean;
}) {
  const [anzahl, setAnzahl] = useState(anfangsAnzahl);
  const [geliked, setGeliked] = useState(anfangsGeliked);
  const [laeuft, startTransition] = useTransition();

  function klick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!eingeloggt || laeuft) return;

    const naechsterStatus = !geliked;
    setGeliked(naechsterStatus);
    setAnzahl((n) => n + (naechsterStatus ? 1 : -1));

    startTransition(async () => {
      const ergebnis = await videoLikeUmschalten(videoId);
      if (!ergebnis.erfolg) {
        // Bei Fehler die optimistische Änderung wieder rückgängig machen.
        setGeliked(!naechsterStatus);
        setAnzahl((n) => n - (naechsterStatus ? 1 : -1));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={klick}
      disabled={!eingeloggt}
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition ${
        geliked ? "bg-critical/10 text-critical" : "bg-background text-foreground-soft ring-1 ring-line"
      } disabled:cursor-default`}
    >
      <span>{geliked ? "❤️" : "🤍"}</span>
      <span className="font-mono">{anzahl}</span>
    </button>
  );
}

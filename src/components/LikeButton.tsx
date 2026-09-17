"use client";

import { useState, useTransition } from "react";
import Icon from "@/components/icons/Icon";

export default function LikeButton({
  id,
  umschalten,
  anfangsAnzahl,
  anfangsGeliked,
  eingeloggt,
}: {
  id: string;
  /** Server Action, die den Like für die gegebene ID umschaltet (videoLikeUmschalten oder referenzLikeUmschalten). */
  umschalten: (id: string) => Promise<{ erfolg: boolean }>;
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
      const ergebnis = await umschalten(id);
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
      className={`flex items-center gap-1.5 text-xs font-medium disabled:cursor-default ${
        geliked ? "text-ink" : "text-ink-faint"
      }`}
    >
      <Icon name={geliked ? "herzVoll" : "herz"} size={15} />
      <span className="font-mono tabular-nums">{anzahl}</span>
    </button>
  );
}

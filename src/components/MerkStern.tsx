"use client";

import { useState, useTransition } from "react";
import { favoritUmschalten } from "@/lib/actions/favoriten";

// Kompakter Merken-Stern für Video-Karten (Dashboard, Videothek, Lernpfade, ...).
// Schaltet nur die persönliche Merkliste um ("nur für mich") - für die
// Zuordnung zu einem Merkteam gibt es die ausführlichere Auswahl
// (MerklistenAuswahl) auf der Video-Detailseite.
export default function MerkStern({ videoId, anfangsGemerkt }: { videoId: string; anfangsGemerkt: boolean }) {
  const [gemerkt, setGemerkt] = useState(anfangsGemerkt);
  const [laeuft, startTransition] = useTransition();

  function klick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (laeuft) return;

    const naechsterStatus = !gemerkt;
    setGemerkt(naechsterStatus);

    startTransition(async () => {
      const ergebnis = await favoritUmschalten(videoId, naechsterStatus, null);
      if (!ergebnis.erfolg) setGemerkt(!naechsterStatus);
    });
  }

  return (
    <button
      type="button"
      onClick={klick}
      className={`flex h-8 w-8 items-center justify-center rounded-full text-lg shadow-sm transition ${
        gemerkt ? "bg-accent text-accent-ink" : "bg-black/40 text-white hover:bg-black/60"
      }`}
    >
      {gemerkt ? "★" : "☆"}
    </button>
  );
}

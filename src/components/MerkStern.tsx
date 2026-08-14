"use client";

import { useState, useTransition } from "react";
import { favoritUmschalten, referenzFavoritUmschalten } from "@/lib/actions/favoriten";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";

type Ziel =
  | { videoId: string; referenzId?: undefined }
  | { videoId?: undefined; referenzId: string };

type Props = Ziel & {
  anfangsGemerkt: boolean;
  // "overlay" (Standard) = dunkler Kreis fürs Vorschaubild (Grid-Karten).
  // "inline" = helle Pille neben anderen Aktionen (z.B. Detailseite).
  variante?: "overlay" | "inline";
};

// Kompakter Merken-Stern für Video-/Referenz-Karten (Dashboard, Videothek,
// Lernpfade, Referenzbereich, ...) und für die Referenz-Detailseite.
// Schaltet nur die persönliche Merkliste um ("nur für mich") - für die
// Zuordnung zu einem Merkteam gibt es die ausführlichere Auswahl
// (MerklistenAuswahl) auf der Video-Detailseite.
export default function MerkStern({ videoId, referenzId, anfangsGemerkt, variante = "overlay" }: Props) {
  const [gemerkt, setGemerkt] = useState(anfangsGemerkt);
  const [laeuft, startTransition] = useTransition();
  const toast = useToast();
  const { t } = useSprache();

  function klick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (laeuft) return;

    const naechsterStatus = !gemerkt;
    setGemerkt(naechsterStatus);

    startTransition(async () => {
      const ergebnis = videoId
        ? await favoritUmschalten(videoId, naechsterStatus, null)
        : await referenzFavoritUmschalten(referenzId as string, naechsterStatus, null);
      if (!ergebnis.erfolg) {
        setGemerkt(!naechsterStatus);
        toast(ergebnis.fehler ?? t("merkStern.fehler"), "fehler");
      }
    });
  }

  if (variante === "inline") {
    return (
      <button
        type="button"
        onClick={klick}
        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition ${
          gemerkt ? "bg-accent/10 text-accent-deep" : "bg-background text-foreground-soft ring-1 ring-line"
        }`}
      >
        <span>{gemerkt ? "★" : "☆"}</span>
      </button>
    );
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

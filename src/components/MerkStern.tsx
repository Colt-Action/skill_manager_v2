"use client";

import { useState, useTransition } from "react";
import { favoritUmschalten, referenzFavoritUmschalten } from "@/lib/actions/favoriten";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import Icon from "@/components/icons/Icon";

type Ziel =
  | { videoId: string; referenzId?: undefined }
  | { videoId?: undefined; referenzId: string };

type Props = Ziel & {
  anfangsGemerkt: boolean;
  // "overlay" (Standard) = runder Knopf fürs Vorschaubild (Grid-Karten).
  // "inline" = kleiner Knopf neben anderen Aktionen (z.B. Detailseite).
  variante?: "overlay" | "inline";
};

// Kompakter Merken-Stern für Video-/Referenz-Karten (Dashboard, Videothek,
// Lernpfade, Referenzbereich, ...) und für die Referenz-Detailseite.
// Merken ist eine persönliche Notiz, keine Systemmarkierung - der aktive
// Zustand ist deshalb Tinte, nicht Signalorange (Designkonzept "Typenschild"
// Rev. 02, Schärfung 5). Schaltet nur die persönliche Merkliste um ("nur für
// mich") - für die Zuordnung zu einem Merkteam gibt es die ausführlichere
// Auswahl (MerklistenAuswahl) auf der Video-Detailseite.
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

  const label = gemerkt ? t("merkStern.gemerkt") : t("merkStern.merken");

  if (variante === "inline") {
    return (
      <button
        type="button"
        onClick={klick}
        aria-label={label}
        aria-pressed={gemerkt}
        title={label}
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-paper ${
          gemerkt ? "text-ink" : "text-ink-faint"
        }`}
      >
        <Icon name={gemerkt ? "sternVoll" : "stern"} size={16} className={gemerkt ? "animate-pop" : undefined} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={klick}
      aria-label={label}
      aria-pressed={gemerkt}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-paper transition ${
        gemerkt ? "text-ink" : "text-ink-faint hover:text-ink"
      }`}
    >
      <Icon name={gemerkt ? "sternVoll" : "stern"} size={16} className={gemerkt ? "animate-pop" : undefined} />
    </button>
  );
}

"use client";

import { useState } from "react";
import { favoritUmschalten } from "@/lib/actions/favoriten";

export default function FavoritButton({
  videoId,
  istFavorit,
}: {
  videoId: string;
  istFavorit: boolean;
}) {
  const [aktiv, setAktiv] = useState(istFavorit);
  const [laeuft, setLaeuft] = useState(false);

  async function umschalten() {
    setLaeuft(true);
    const neuerWert = !aktiv;
    const ergebnis = await favoritUmschalten(videoId, neuerWert);
    setLaeuft(false);
    if (ergebnis.erfolg) setAktiv(neuerWert);
  }

  return (
    <button
      type="button"
      onClick={umschalten}
      disabled={laeuft}
      title={aktiv ? "Von Merkliste entfernen" : "Zur Merkliste hinzufügen"}
      className={`rounded-full p-1.5 text-lg transition ${
        aktiv ? "text-accent" : "text-foreground-soft hover:text-accent"
      }`}
    >
      {aktiv ? "★" : "☆"}
    </button>
  );
}

"use client";

import { useState } from "react";
import { teilNichtGefunden } from "@/lib/actions/video";

export default function TeilMeldenForm() {
  const [notiz, setNotiz] = useState("");
  const [gesendet, setGesendet] = useState(false);
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setLaeuft(true);
    setFehler(null);
    const ergebnis = await teilNichtGefunden(notiz);
    setLaeuft(false);
    if (ergebnis.erfolg) {
      setGesendet(true);
      setNotiz("");
    } else {
      setFehler(ergebnis.fehler ?? "Fehler beim Senden.");
    }
  }

  if (gesendet) {
    return (
      <p className="mt-6 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
        Danke, deine Meldung wurde an die Admins weitergeleitet.
      </p>
    );
  }

  return (
    <form onSubmit={absenden} className="mt-6 space-y-4">
      <textarea
        value={notiz}
        onChange={(e) => setNotiz(e.target.value)}
        rows={5}
        required
        placeholder="z. B. Ich habe die Kategorie 'HD-PU' gesucht, aber kein passendes Video gefunden für Teilenummer XY..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
      />
      {fehler && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{fehler}</p>}
      <button
        type="submit"
        disabled={laeuft}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {laeuft ? "Sendet …" : "Meldung senden"}
      </button>
    </form>
  );
}

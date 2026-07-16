"use client";

import { useState } from "react";
import { passwortAendern } from "@/lib/actions/profil";

export default function PasswortForm() {
  const [aktuellesPasswort, setAktuellesPasswort] = useState("");
  const [neuesPasswort, setNeuesPasswort] = useState("");
  const [speichert, setSpeichert] = useState(false);
  const [nachricht, setNachricht] = useState<{ text: string; fehler: boolean } | null>(null);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setSpeichert(true);
    setNachricht(null);

    const ergebnis = await passwortAendern({ aktuellesPasswort, neuesPasswort });
    setSpeichert(false);

    if (ergebnis.erfolg) {
      setNachricht({ text: "Passwort erfolgreich geändert.", fehler: false });
      setAktuellesPasswort("");
      setNeuesPasswort("");
    } else {
      setNachricht({ text: ergebnis.fehler ?? "Fehler beim Ändern.", fehler: true });
    }
  }

  return (
    <form onSubmit={absenden} className="mt-8 rounded-xl bg-surface p-5 ring-1 ring-line">
      <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">Passwort ändern</h2>
      <div className="mt-3 space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-foreground">Aktuelles Passwort</span>
          <input
            type="password"
            value={aktuellesPasswort}
            onChange={(e) => setAktuellesPasswort(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-foreground">Neues Passwort</span>
          <input
            type="password"
            value={neuesPasswort}
            onChange={(e) => setNeuesPasswort(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <span className="mt-1 block text-xs text-foreground-soft">mind. 6 Zeichen</span>
        </label>
      </div>

      {nachricht && (
        <p className={`mt-3 rounded-md px-3 py-2 text-sm ${nachricht.fehler ? "bg-critical/10 text-critical" : "bg-success/10 text-success-ink"}`}>
          {nachricht.text}
        </p>
      )}

      <button
        type="submit"
        disabled={speichert}
        className="mt-4 rounded-lg border border-line px-4 py-2 text-sm font-medium text-foreground hover:bg-background disabled:opacity-50"
      >
        {speichert ? "Ändert …" : "Passwort ändern"}
      </button>
    </form>
  );
}

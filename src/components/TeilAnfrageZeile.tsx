"use client";

import { useState } from "react";
import { teilAnfrageBearbeitet } from "@/lib/actions/admin";
import type { TeilAnfrage } from "@/lib/supabase/types";

export default function TeilAnfrageZeile({
  anfrage,
}: {
  anfrage: TeilAnfrage & { users: { name: string } | null };
}) {
  const [laeuft, setLaeuft] = useState(false);
  const [erledigt, setErledigt] = useState(false);

  async function alsErledigtMarkieren() {
    setLaeuft(true);
    const ergebnis = await teilAnfrageBearbeitet(anfrage.id);
    setLaeuft(false);
    if (ergebnis.erfolg) setErledigt(true);
  }

  if (erledigt) return null;

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <p className="text-sm text-slate-700">{anfrage.notiz}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {anfrage.users?.name ?? "Unbekannt"} ·{" "}
          {new Date(anfrage.erstellt_am).toLocaleDateString("de-DE")}
        </p>
        <button
          type="button"
          onClick={alsErledigtMarkieren}
          disabled={laeuft}
          className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-50"
        >
          Als erledigt markieren
        </button>
      </div>
    </div>
  );
}

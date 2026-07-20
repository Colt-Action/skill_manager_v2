"use client";

import { useState } from "react";
import { teilAnfrageBearbeitet } from "@/lib/actions/admin";
import { useSprache } from "@/components/SprachProvider";
import type { TeilAnfrage } from "@/lib/supabase/types";

export default function TeilAnfrageZeile({
  anfrage,
}: {
  anfrage: TeilAnfrage & { users: { name: string } | null };
}) {
  const { t } = useSprache();
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
    <div className="rounded-xl bg-surface p-4 ring-1 ring-line">
      <p className="text-sm text-foreground">{anfrage.notiz}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="font-mono text-xs text-foreground-soft">
          {anfrage.users?.name ?? t("teilAnfrageZeile.unbekannt")} ·{" "}
          {new Date(anfrage.erstellt_am).toLocaleDateString("de-DE")}
        </p>
        <button
          type="button"
          onClick={alsErledigtMarkieren}
          disabled={laeuft}
          className="rounded-lg border border-line px-3 py-1 text-xs text-foreground hover:bg-background disabled:opacity-50"
        >
          {t("teilAnfrageZeile.alsErledigtMarkieren")}
        </button>
      </div>
    </div>
  );
}

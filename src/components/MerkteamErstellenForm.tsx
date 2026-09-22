"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { merkteamErstellen } from "@/lib/actions/merkteams";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import { eingabeKlasse } from "@/components/Datenblatt";

export default function MerkteamErstellenForm() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();
  const [name, setName] = useState("");
  const [speichert, setSpeichert] = useState(false);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setSpeichert(true);
    const ergebnis = await merkteamErstellen(name);
    setSpeichert(false);
    if (ergebnis.erfolg && ergebnis.id) {
      setName("");
      router.push(`/merkteams/${ergebnis.id}`);
    } else {
      toast(ergebnis.fehler ?? t("merkteamErstellenForm.fehler"), "fehler");
    }
  }

  return (
    <form onSubmit={absenden} className="mt-6 flex flex-wrap items-end gap-2 border border-rule bg-paper p-4">
      <label className="min-w-[240px] flex-1 block">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("merkteamErstellenForm.namePlatzhalter")}</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("merkteamErstellenForm.namePlatzhalter")}
          required
          className={`mt-1 ${eingabeKlasse}`}
        />
      </label>
      <button
        type="submit"
        disabled={speichert}
        className="rounded-[2px] bg-signal px-4 py-2 text-sm font-bold uppercase tracking-wide text-signal-ink transition hover:opacity-90 disabled:opacity-50"
      >
        {t("merkteamErstellenForm.anlegenButton")}
      </button>
    </form>
  );
}

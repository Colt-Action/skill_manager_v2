"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { merkteamErstellen } from "@/lib/actions/merkteams";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";

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
    <form onSubmit={absenden} className="mt-6 flex flex-wrap items-end gap-2 rounded-xl bg-surface p-4 ring-1 ring-line">
      <label className="min-w-[240px] flex-1 block">
        <span className="font-mono text-xs uppercase tracking-wide text-foreground-soft">{t("merkteamErstellenForm.namePlatzhalter")}</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("merkteamErstellenForm.namePlatzhalter")}
          required
          className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
        />
      </label>
      <button
        type="submit"
        disabled={speichert}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-accent-ink transition hover:bg-accent-deep disabled:opacity-50"
      >
        {t("merkteamErstellenForm.anlegenButton")}
      </button>
    </form>
  );
}

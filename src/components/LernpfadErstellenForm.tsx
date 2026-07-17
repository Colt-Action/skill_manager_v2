"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { lernpfadErstellen } from "@/lib/actions/lernpfade";
import { useToast } from "@/components/ToastProvider";

export default function LernpfadErstellenForm() {
  const router = useRouter();
  const toast = useToast();
  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [speichert, setSpeichert] = useState(false);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setSpeichert(true);
    const ergebnis = await lernpfadErstellen({ titel, beschreibung });
    setSpeichert(false);
    if (ergebnis.erfolg) {
      setTitel("");
      setBeschreibung("");
      toast("Lernpfad angelegt.", "erfolg");
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? "Fehler beim Anlegen.", "fehler");
    }
  }

  return (
    <form onSubmit={absenden} className="mt-6 rounded-xl bg-surface p-4 ring-1 ring-line">
      <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">Neuer Lernpfad</h2>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          placeholder="Titel, z. B. 'Neu bei HOSCH'"
          required
          className="rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
        />
        <input
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          placeholder="Kurzbeschreibung (optional)"
          className="rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>
      <button
        type="submit"
        disabled={speichert}
        className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-accent-ink transition hover:bg-accent-deep disabled:opacity-50"
      >
        {speichert ? "Speichert …" : "Lernpfad anlegen"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { lernpfadErstellen } from "@/lib/actions/lernpfade";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";

export default function LernpfadErstellenForm() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();
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
      toast(t("lernpfadErstellenForm.angelegt"), "erfolg");
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? t("lernpfadErstellenForm.fehlerAnlegen"), "fehler");
    }
  }

  return (
    <form onSubmit={absenden} className="mt-6 border border-rule bg-paper p-4">
      <h2 className="font-mono text-xs uppercase tracking-wide text-ink-soft">{t("lernpfadErstellenForm.neuerLernpfad")}</h2>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          placeholder={t("lernpfadErstellenForm.titelPlatzhalter")}
          required
          className="rounded-[2px] border border-rule bg-paper px-3 py-2 text-sm text-ink"
        />
        <input
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          placeholder={t("lernpfadErstellenForm.beschreibungPlatzhalter")}
          className="rounded-[2px] border border-rule bg-paper px-3 py-2 text-sm text-ink"
        />
      </div>
      <button
        type="submit"
        disabled={speichert}
        className="mt-3 rounded-[2px] bg-signal px-4 py-2 text-sm font-bold uppercase tracking-wide text-signal-ink transition hover:bg-signal disabled:opacity-50"
      >
        {speichert ? t("profil.speichertLaeuft") : t("lernpfadErstellenForm.anlegenButton")}
      </button>
    </form>
  );
}

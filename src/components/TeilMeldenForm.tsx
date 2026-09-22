"use client";

import { useState } from "react";
import { teilNichtGefunden } from "@/lib/actions/video";
import { useSprache } from "@/components/SprachProvider";

export default function TeilMeldenForm() {
  const { t } = useSprache();
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
      setFehler(ergebnis.fehler ?? t("teilMelden.fehlerStandard"));
    }
  }

  if (gesendet) {
    return <p className="mt-6 border-l-[3px] border-ok bg-paper-2 px-3 py-2 text-sm text-ink">{t("teilMelden.danke")}</p>;
  }

  return (
    <form onSubmit={absenden} className="mt-6 space-y-4">
      <textarea
        value={notiz}
        onChange={(e) => setNotiz(e.target.value)}
        rows={5}
        required
        placeholder={t("teilMelden.platzhalter")}
        className="w-full rounded-[2px] border border-rule bg-paper-2 px-2.5 py-2 text-sm text-ink outline-none focus:border-ink"
      />
      {fehler && <p className="border-l-[3px] border-critical bg-paper-2 px-3 py-2 text-sm text-critical">{fehler}</p>}
      <button
        type="submit"
        disabled={laeuft}
        className="rounded-[2px] bg-signal px-4 py-2 text-sm font-bold uppercase tracking-wide text-signal-ink transition hover:opacity-90 disabled:opacity-50"
      >
        {laeuft ? t("teilMelden.sendetLaeuft") : t("teilMelden.sendenButton")}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { passwortAendern } from "@/lib/actions/profil";
import { useSprache } from "@/components/SprachProvider";
import SectionLinie from "@/components/SectionLinie";
import { DatenblattZeile, eingabeKlasse } from "@/components/Datenblatt";

export default function PasswortForm() {
  const { t } = useSprache();
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
      setNachricht({ text: t("passwortForm.erfolgreich"), fehler: false });
      setAktuellesPasswort("");
      setNeuesPasswort("");
    } else {
      setNachricht({ text: ergebnis.fehler ?? t("passwortForm.fehler"), fehler: true });
    }
  }

  return (
    <form onSubmit={absenden} className="mt-10">
      <SectionLinie titel={t("passwortForm.titel")} />
      <div className="border-t border-rule-strong">
        <DatenblattZeile label={t("passwortForm.aktuellesPasswort")}>
          <input
            type="password"
            value={aktuellesPasswort}
            onChange={(e) => setAktuellesPasswort(e.target.value)}
            required
            className={eingabeKlasse}
          />
        </DatenblattZeile>
        <DatenblattZeile label={t("passwortForm.neuesPasswort")}>
          <div>
            <input
              type="password"
              value={neuesPasswort}
              onChange={(e) => setNeuesPasswort(e.target.value)}
              required
              className={eingabeKlasse}
            />
            <span className="mt-1 block text-xs text-ink-faint">{t("passwortForm.mindestZeichen")}</span>
          </div>
        </DatenblattZeile>
      </div>

      {nachricht && (
        <p
          className={`mt-3 border-l-[3px] bg-paper-2 px-3 py-2 text-sm ${
            nachricht.fehler ? "border-critical text-critical" : "border-ok text-ink"
          }`}
        >
          {nachricht.text}
        </p>
      )}

      <button
        type="submit"
        disabled={speichert}
        className="mt-4 rounded-[2px] border border-rule px-4 py-2 text-sm font-medium text-ink hover:bg-paper-2 disabled:opacity-50"
      >
        {speichert ? t("passwortForm.aendertLaeuft") : t("passwortForm.titel")}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  zugangscodeErstellen,
  zugangscodeLoeschen,
  zugangscodeUmschalten,
} from "@/lib/actions/zugangscodes";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import type { Zugangscode } from "@/lib/supabase/types";

const UNBEGRENZT = "";

export default function ZugangscodeVerwaltung({ zugangscodes }: { zugangscodes: Zugangscode[] }) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();
  const [code, setCode] = useState("");
  const [maxNutzungen, setMaxNutzungen] = useState(UNBEGRENZT);
  const [speichert, setSpeichert] = useState(false);
  const [ladeId, setLadeId] = useState<string | null>(null);

  async function erstellen(e: React.FormEvent) {
    e.preventDefault();
    setSpeichert(true);
    const ergebnis = await zugangscodeErstellen({
      code,
      maxNutzungen: maxNutzungen === UNBEGRENZT ? null : Number(maxNutzungen),
    });
    setSpeichert(false);
    if (ergebnis.erfolg) {
      setCode("");
      setMaxNutzungen(UNBEGRENZT);
      toast(t("zugangscodes.erstellt"), "erfolg");
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? t("zugangscodes.fehlerErstellen"), "fehler");
    }
  }

  async function umschalten(zc: Zugangscode) {
    setLadeId(zc.id);
    const ergebnis = await zugangscodeUmschalten({ id: zc.id, aktiv: !zc.aktiv });
    setLadeId(null);
    if (ergebnis.erfolg) {
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? t("zugangscodes.fehlerAendern"), "fehler");
    }
  }

  async function loeschen(zc: Zugangscode) {
    if (!confirm(t("zugangscodes.loeschenBestaetigung", { code: zc.code }))) return;
    setLadeId(zc.id);
    const ergebnis = await zugangscodeLoeschen(zc.id);
    setLadeId(null);
    if (ergebnis.erfolg) {
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? t("zugangscodes.fehlerLoeschen"), "fehler");
    }
  }

  function generieren() {
    const zeichen = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let neuerCode = "";
    for (let i = 0; i < 8; i++) {
      neuerCode += zeichen[Math.floor(Math.random() * zeichen.length)];
    }
    setCode(neuerCode);
  }

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={erstellen} className="rounded-xl bg-surface p-4 ring-1 ring-line">
        <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">{t("zugangscodes.neuerCode")}</h2>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="flex gap-1 sm:col-span-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("zugangscodes.codePlatzhalter")}
              required
              className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
            />
            <button
              type="button"
              onClick={generieren}
              className="shrink-0 rounded-lg border border-line px-3 py-2 text-xs text-foreground hover:bg-background"
            >
              {t("zugangscodes.generieren")}
            </button>
          </div>
          <input
            value={maxNutzungen}
            onChange={(e) => setMaxNutzungen(e.target.value)}
            type="number"
            min={1}
            placeholder={t("zugangscodes.maxNutzungenPlatzhalter")}
            className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <p className="mt-1.5 text-xs text-foreground-soft">{t("zugangscodes.maxNutzungenHinweis")}</p>
        <button
          type="submit"
          disabled={speichert}
          className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-accent-ink transition hover:bg-accent-deep disabled:opacity-50"
        >
          {speichert ? t("profil.speichertLaeuft") : t("zugangscodes.erstellenButton")}
        </button>
      </form>

      {zugangscodes.length === 0 ? (
        <p className="text-sm text-foreground-soft">{t("zugangscodes.keineCodesVorhanden")}</p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-surface ring-1 ring-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-background font-mono text-xs uppercase tracking-wide text-foreground-soft">
              <tr>
                <th className="px-4 py-2">{t("zugangscodes.spalteCode")}</th>
                <th className="px-4 py-2">{t("zugangscodes.spalteNutzung")}</th>
                <th className="px-4 py-2">{t("nutzerListe.spalteStatus")}</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {zugangscodes.map((zc) => (
                <tr key={zc.id} className={zc.aktiv ? "" : "opacity-50"}>
                  <td className="px-4 py-2 font-mono text-foreground">{zc.code}</td>
                  <td className="px-4 py-2 text-foreground-soft">
                    {zc.genutzt_anzahl} / {zc.max_nutzungen ?? "∞"}
                  </td>
                  <td className="px-4 py-2 text-foreground-soft">
                    {zc.aktiv ? t("nutzerListe.aktiv") : t("nutzerListe.deaktiviert")}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      disabled={ladeId === zc.id}
                      onClick={() => umschalten(zc)}
                      className="rounded-lg border border-line px-2.5 py-1 text-xs text-foreground hover:bg-background disabled:opacity-50"
                    >
                      {zc.aktiv ? t("nutzerListe.deaktivierenButton") : t("nutzerListe.reaktivierenButton")}
                    </button>
                    <button
                      type="button"
                      disabled={ladeId === zc.id}
                      onClick={() => loeschen(zc)}
                      className="ml-1.5 rounded-lg border border-critical/30 px-2.5 py-1 text-xs text-critical hover:bg-critical/10 disabled:opacity-50"
                    >
                      {t("zugangscodes.loeschenButton")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

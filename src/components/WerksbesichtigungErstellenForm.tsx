"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { werksbesichtigungErstellen } from "@/lib/actions/werksbesichtigungen";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import { DatenblattZeile, eingabeKlasse } from "@/components/Datenblatt";

export default function WerksbesichtigungErstellenForm({
  meineTeams,
}: {
  meineTeams: { id: string; name: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();
  const [kunde, setKunde] = useState("");
  const [partner, setPartner] = useState("");
  const [ort, setOrt] = useState("");
  const [datum, setDatum] = useState(() => new Date().toISOString().slice(0, 10));
  const [datumBis, setDatumBis] = useState("");
  const [merkteamId, setMerkteamId] = useState("");
  const [speichert, setSpeichert] = useState(false);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setSpeichert(true);
    const ergebnis = await werksbesichtigungErstellen({
      kunde,
      partner,
      ort,
      datum,
      datumBis: datumBis || null,
      merkteamId: merkteamId || null,
    });
    setSpeichert(false);
    if (ergebnis.erfolg && ergebnis.id) {
      router.push(`/werksbesichtigungen/${ergebnis.id}`);
    } else {
      toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
    }
  }

  return (
    <form onSubmit={absenden} className="mt-6 border border-rule bg-paper p-4">
      <h2 className="font-mono text-xs uppercase tracking-wide text-annot">{t("werksbesichtigungen.neueBesichtigung")}</h2>
      <div className="mt-2 border-t border-rule-strong">
        <DatenblattZeile label={t("werksbesichtigungen.kunde")}>
          <input value={kunde} onChange={(e) => setKunde(e.target.value)} required className={eingabeKlasse} />
        </DatenblattZeile>
        <DatenblattZeile label={t("werksbesichtigungen.partnerOptional")}>
          <input
            value={partner}
            onChange={(e) => setPartner(e.target.value)}
            placeholder={t("werksbesichtigungen.partnerPlatzhalter")}
            className={`${eingabeKlasse} text-sm`}
          />
        </DatenblattZeile>
        <DatenblattZeile label={t("werksbesichtigungen.ort")}>
          <input value={ort} onChange={(e) => setOrt(e.target.value)} className={eingabeKlasse} />
        </DatenblattZeile>
        <DatenblattZeile label={t("werksbesichtigungen.datum")}>
          <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} required className={eingabeKlasse} />
        </DatenblattZeile>
        <DatenblattZeile label={t("werksbesichtigungen.datumBisOptional")}>
          <input
            type="date"
            value={datumBis}
            min={datum}
            onChange={(e) => setDatumBis(e.target.value)}
            className={eingabeKlasse}
          />
        </DatenblattZeile>
        {meineTeams.length > 0 && (
          <DatenblattZeile label={t("werksbesichtigungen.merkteamOptional")}>
            <select value={merkteamId} onChange={(e) => setMerkteamId(e.target.value)} className={eingabeKlasse}>
              <option value="">{t("werksbesichtigungen.merkteamKeins")}</option>
              {meineTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </DatenblattZeile>
        )}
      </div>
      <button
        type="submit"
        disabled={speichert}
        className="mt-4 rounded-[2px] bg-signal px-4 py-2 text-sm font-bold uppercase tracking-wide text-signal-ink disabled:opacity-50"
      >
        {t("werksbesichtigungen.anlegenButton")}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  werksbesichtigungAktualisieren,
  werksbesichtigungLoeschen,
  werksbesichtigungStatusSetzen,
} from "@/lib/actions/werksbesichtigungen";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import { DatenblattZeile, eingabeKlasse } from "@/components/Datenblatt";
import type { Werksbesichtigung } from "@/lib/supabase/types";

export default function WerksbesichtigungAllgemeineAngaben({
  besuch,
  darfBearbeiten,
  darfLoeschen,
}: {
  besuch: Werksbesichtigung;
  darfBearbeiten: boolean;
  darfLoeschen: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();
  const [kunde, setKunde] = useState(besuch.kunde);
  const [partner, setPartner] = useState(besuch.partner ?? "");
  const [ort, setOrt] = useState(besuch.ort ?? "");
  const [datum, setDatum] = useState(besuch.datum);
  const [datumBis, setDatumBis] = useState(besuch.datum_bis ?? "");
  const [notizen, setNotizen] = useState(besuch.notizen);
  const [speichert, setSpeichert] = useState(false);
  const [statusAendertSich, setStatusAendertSich] = useState(false);
  const abgeschlossen = besuch.status === "abgeschlossen";

  async function speichern() {
    setSpeichert(true);
    const ergebnis = await werksbesichtigungAktualisieren(besuch.id, {
      kunde,
      partner,
      ort,
      datum,
      datumBis: datumBis || null,
      notizen,
    });
    setSpeichert(false);
    if (ergebnis.erfolg) {
      toast(t("werksbesichtigungen.gespeichert"), "erfolg");
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
    }
  }

  async function loeschen() {
    if (!confirm(t("werksbesichtigungen.loeschenBestaetigung"))) return;
    const ergebnis = await werksbesichtigungLoeschen(besuch.id);
    if (ergebnis.erfolg) {
      router.push("/werksbesichtigungen");
    } else {
      toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
    }
  }

  async function statusUmschalten() {
    setStatusAendertSich(true);
    const ergebnis = await werksbesichtigungStatusSetzen(besuch.id, abgeschlossen ? "entwurf" : "abgeschlossen");
    setStatusAendertSich(false);
    if (ergebnis.erfolg) {
      toast(
        abgeschlossen ? t("werksbesichtigungen.wiederEroeffnet") : t("werksbesichtigungen.abgeschlossenErfolg"),
        "erfolg",
      );
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-[2px] px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.1em] ${
            abgeschlossen ? "bg-ok/15 text-ok" : "bg-annot/15 text-annot"
          }`}
        >
          {abgeschlossen ? t("werksbesichtigungen.statusAbgeschlossen") : t("werksbesichtigungen.statusEntwurf")}
        </span>
      </div>

      <fieldset disabled={!darfBearbeiten} className="mt-3 border-t border-rule-strong disabled:opacity-70">
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
          <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} className={eingabeKlasse} />
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
        <DatenblattZeile label={t("werksbesichtigungen.notizen")}>
          <textarea
            value={notizen}
            onChange={(e) => setNotizen(e.target.value)}
            rows={4}
            className="w-full rounded-[2px] border border-rule bg-paper-2 px-2.5 py-2 text-sm text-ink outline-none focus:border-ink"
          />
        </DatenblattZeile>
      </fieldset>

      {darfBearbeiten && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={speichern}
              disabled={speichert}
              className="rounded-[2px] border border-rule bg-paper px-4 py-2 text-sm font-semibold text-ink hover:bg-paper-2 disabled:opacity-50"
            >
              {speichert ? t("werksbesichtigungen.speichertLaeuft") : t("werksbesichtigungen.zwischenspeichern")}
            </button>
            <button
              type="button"
              onClick={statusUmschalten}
              disabled={statusAendertSich}
              className="rounded-[2px] bg-signal px-4 py-2 text-sm font-bold uppercase tracking-wide text-signal-ink disabled:opacity-50"
            >
              {abgeschlossen ? t("werksbesichtigungen.wiederOeffnenButton") : t("werksbesichtigungen.abschliessenButton")}
            </button>
          </div>
          {darfLoeschen && (
            <button
              type="button"
              onClick={loeschen}
              className="rounded-[2px] border border-critical/30 px-3 py-1.5 text-xs text-critical hover:bg-critical/10"
            >
              {t("werksbesichtigungen.loeschenButton")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { werksbesichtigungLoeschen } from "@/lib/actions/werksbesichtigungen";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import { DatenblattZeile, eingabeKlasse } from "@/components/Datenblatt";
import EintragMarkierung from "@/components/EintragMarkierung";
import type { BerichtFelder } from "@/lib/werksbesichtigungAenderungen";
import type { Werksbesichtigung } from "@/lib/supabase/types";

// Allgemeine Angaben eines Berichts. Werte und Änderungen kommen vom
// WerksbesichtigungEditor (zentrales Speichern); hier gibt es keinen eigenen
// Zustand und keinen Speichern-Knopf mehr.
export default function WerksbesichtigungAllgemeineAngaben({
  besuch,
  werte,
  onAendern,
  ungespeichert,
  fehler,
  darfBearbeiten,
  darfLoeschen,
}: {
  besuch: Werksbesichtigung;
  werte: BerichtFelder;
  onAendern: <K extends keyof BerichtFelder>(feld: K, wert: BerichtFelder[K]) => void;
  ungespeichert: boolean;
  fehler?: string;
  darfBearbeiten: boolean;
  darfLoeschen: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();
  const abgeschlossen = besuch.status === "abgeschlossen";

  async function loeschen() {
    if (!confirm(t("werksbesichtigungen.loeschenBestaetigung"))) return;
    const ergebnis = await werksbesichtigungLoeschen(besuch.id);
    if (ergebnis.erfolg) {
      router.push("/werksbesichtigungen");
    } else {
      toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-[2px] px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.1em] ${
            abgeschlossen ? "bg-ok/15 text-ok" : "bg-annot/15 text-annot"
          }`}
        >
          {abgeschlossen ? t("werksbesichtigungen.statusAbgeschlossen") : t("werksbesichtigungen.statusEntwurf")}
        </span>
        <EintragMarkierung ungespeichert={ungespeichert} />
      </div>
      <EintragMarkierung fehler={fehler} />

      <fieldset disabled={!darfBearbeiten} className="mt-3 border-t border-rule-strong disabled:opacity-70">
        <DatenblattZeile label={t("werksbesichtigungen.kunde")}>
          <input value={werte.kunde} onChange={(e) => onAendern("kunde", e.target.value)} required className={eingabeKlasse} />
        </DatenblattZeile>
        <DatenblattZeile label={t("werksbesichtigungen.partnerOptional")}>
          <input
            value={werte.partner}
            onChange={(e) => onAendern("partner", e.target.value)}
            placeholder={t("werksbesichtigungen.partnerPlatzhalter")}
            className={`${eingabeKlasse} text-sm`}
          />
        </DatenblattZeile>
        <DatenblattZeile label={t("werksbesichtigungen.ort")}>
          <input value={werte.ort} onChange={(e) => onAendern("ort", e.target.value)} className={eingabeKlasse} />
        </DatenblattZeile>
        <DatenblattZeile label={t("werksbesichtigungen.datum")}>
          <input type="date" value={werte.datum} onChange={(e) => onAendern("datum", e.target.value)} className={eingabeKlasse} />
        </DatenblattZeile>
        <DatenblattZeile label={t("werksbesichtigungen.datumBisOptional")}>
          <input
            type="date"
            value={werte.datumBis}
            min={werte.datum}
            onChange={(e) => onAendern("datumBis", e.target.value)}
            className={eingabeKlasse}
          />
        </DatenblattZeile>
        <DatenblattZeile label={t("werksbesichtigungen.notizen")}>
          <textarea
            value={werte.notizen}
            onChange={(e) => onAendern("notizen", e.target.value)}
            rows={4}
            className="w-full rounded-[2px] border border-rule bg-paper-2 px-2.5 py-2 text-sm text-ink outline-none focus:border-ink"
          />
        </DatenblattZeile>
      </fieldset>

      {darfLoeschen && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={loeschen}
            className="rounded-[2px] border border-critical/30 px-3 py-1.5 text-xs text-critical hover:bg-critical/10"
          >
            {t("werksbesichtigungen.loeschenButton")}
          </button>
        </div>
      )}
    </div>
  );
}

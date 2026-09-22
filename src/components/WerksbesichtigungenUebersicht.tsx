"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { hochgeladenerBerichtLoeschen, werksbesichtigungLoeschen } from "@/lib/actions/werksbesichtigungen";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import { eingabeKlasse } from "@/components/Datenblatt";
import EmptyState from "@/components/EmptyState";
import BerichtSchnellansicht from "@/components/BerichtSchnellansicht";
import HochgeladenerBerichtBearbeiten from "@/components/HochgeladenerBerichtBearbeiten";
import type { WerksbesichtigungStatus } from "@/lib/supabase/types";

export interface BerichtEintrag {
  id: string;
  kunde: string;
  ort: string | null;
  datum: string;
  datumBis: string | null;
  quelle: "skillmanager" | "upload";
  status: WerksbesichtigungStatus | null;
  href: string;
  notizenVorschau: string | null;
  darfBearbeiten: boolean;
  darfLoeschen: boolean;
}

export default function WerksbesichtigungenUebersicht({ eintraege }: { eintraege: BerichtEintrag[] }) {
  const router = useRouter();
  const toast = useToast();
  const { t, sprache } = useSprache();
  const [kundeFilter, setKundeFilter] = useState("");
  const [ortFilter, setOrtFilter] = useState("");
  const [von, setVon] = useState("");
  const [bis, setBis] = useState("");
  const [schnellansicht, setSchnellansicht] = useState<BerichtEintrag | null>(null);
  const [bearbeitenEintrag, setBearbeitenEintrag] = useState<BerichtEintrag | null>(null);

  const gefiltert = useMemo(() => {
    return eintraege.filter((e) => {
      if (kundeFilter.trim() && !e.kunde.toLowerCase().includes(kundeFilter.trim().toLowerCase())) return false;
      if (ortFilter.trim() && !(e.ort ?? "").toLowerCase().includes(ortFilter.trim().toLowerCase())) return false;
      if (von && e.datum < von) return false;
      if (bis && e.datum > bis) return false;
      return true;
    });
  }, [eintraege, kundeFilter, ortFilter, von, bis]);

  async function loeschen(eintrag: BerichtEintrag) {
    const bestaetigungsSchluessel =
      eintrag.quelle === "upload" ? "werksbesichtigungen.hochladenLoeschenBestaetigung" : "werksbesichtigungen.loeschenBestaetigung";
    if (!confirm(t(bestaetigungsSchluessel))) return;
    const ergebnis =
      eintrag.quelle === "upload" ? await hochgeladenerBerichtLoeschen(eintrag.id) : await werksbesichtigungLoeschen(eintrag.id);
    if (ergebnis.erfolg) {
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
    }
  }

  return (
    <div>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          value={kundeFilter}
          onChange={(e) => setKundeFilter(e.target.value)}
          placeholder={t("werksbesichtigungen.filterKunde")}
          className={eingabeKlasse}
        />
        <input
          value={ortFilter}
          onChange={(e) => setOrtFilter(e.target.value)}
          placeholder={t("werksbesichtigungen.filterOrt")}
          className={eingabeKlasse}
        />
        <div className="flex gap-2">
          <input type="date" value={von} onChange={(e) => setVon(e.target.value)} className={eingabeKlasse} title={t("werksbesichtigungen.filterVon")} />
          <input type="date" value={bis} onChange={(e) => setBis(e.target.value)} className={eingabeKlasse} title={t("werksbesichtigungen.filterBis")} />
        </div>
      </div>

      {gefiltert.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon="index" text={t("werksbesichtigungen.leer")} />
        </div>
      ) : (
        <div className="mt-6 border-t border-rule-strong">
          {gefiltert.map((eintrag) => (
            <div key={eintrag.id} className="border-b border-rule px-1 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h2 className="font-medium text-ink">{eintrag.kunde}</h2>
                <span className="shrink-0 font-mono text-xs text-ink-soft">
                  {new Date(eintrag.datum).toLocaleDateString(sprache)}
                  {eintrag.datumBis && ` – ${new Date(eintrag.datumBis).toLocaleDateString(sprache)}`}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {eintrag.ort && <p className="text-sm text-ink-soft">{eintrag.ort}</p>}
                <span
                  className={`inline-flex items-center gap-1 rounded-[2px] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] ${
                    eintrag.quelle === "skillmanager" ? "bg-signal/15 text-signal" : "bg-plate text-ink-soft"
                  }`}
                >
                  {eintrag.quelle === "skillmanager" ? t("werksbesichtigungen.quelleSkillManager") : t("werksbesichtigungen.quelleHochgeladen")}
                </span>
                {eintrag.status === "abgeschlossen" && (
                  <span className="inline-flex items-center gap-1 rounded-[2px] bg-ok/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ok">
                    {t("werksbesichtigungen.statusAbgeschlossen")}
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setSchnellansicht(eintrag)}
                  className="text-xs font-medium text-signal hover:underline"
                >
                  {t("werksbesichtigungen.schnellansichtButton")}
                </button>
                {eintrag.darfBearbeiten &&
                  (eintrag.quelle === "skillmanager" ? (
                    <Link href={eintrag.href} className="text-xs font-medium text-ink-soft hover:text-ink hover:underline">
                      {t("werksbesichtigungen.bearbeitenButton")}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBearbeitenEintrag(eintrag)}
                      className="text-xs font-medium text-ink-soft hover:text-ink hover:underline"
                    >
                      {t("werksbesichtigungen.bearbeitenButton")}
                    </button>
                  ))}
                {eintrag.darfLoeschen && (
                  <button type="button" onClick={() => loeschen(eintrag)} className="text-xs font-medium text-critical hover:underline">
                    {t("werksbesichtigungen.entfernenButton")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {schnellansicht && <BerichtSchnellansicht eintrag={schnellansicht} onSchliessen={() => setSchnellansicht(null)} />}
      {bearbeitenEintrag && (
        <HochgeladenerBerichtBearbeiten eintrag={bearbeitenEintrag} onSchliessen={() => setBearbeitenEintrag(null)} />
      )}
    </div>
  );
}

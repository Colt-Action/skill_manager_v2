"use client";

import { useId, useState } from "react";
import { useSprache } from "@/components/SprachProvider";
import { useToast } from "@/components/ToastProvider";
import { werksbesichtigungAlsPdf } from "@/lib/werksbesichtigungPdf";
import { werksbesichtigungAlsDocx } from "@/lib/werksbesichtigungDocx";
import { berichtModellErstellen } from "@/lib/werksbesichtigungBericht";
import { vorschlagReferenzenLaden } from "@/lib/actions/vorschlaege";
import { produktZurKategorie } from "@/lib/produktFelder";
import type { VorschlagReferenz } from "@/lib/referenzVorschlaege";
import { SPRACHEN, STANDARD_SPRACHE, istGueltigeSprache, type Sprache } from "@/lib/i18n/sprachen";
import type { FoerderbandEintragMitDetails, Kategorie, Werksbesichtigung } from "@/lib/supabase/types";

export default function WerksbesichtigungExport({
  besuch,
  eintraege,
  kategorien,
  erstellerName,
  ungespeichert = false,
}: {
  besuch: Werksbesichtigung;
  eintraege: FoerderbandEintragMitDetails[];
  /** Für "Produkt · Typ" je Position. */
  kategorien: Kategorie[];
  erstellerName: string | null;
  /** Offene, ungespeicherte Eingaben - der Export nutzt nur den gespeicherten Stand. */
  ungespeichert?: boolean;
}) {
  const { t } = useSprache();
  const toast = useToast();
  const [exportiertLaeuft, setExportiertLaeuft] = useState<"pdf" | "docx" | null>(null);
  // Sprache des Berichts: Standard Deutsch, unabhängig von der Oberflächensprache.
  const [berichtSprache, setBerichtSprache] = useState<Sprache>(STANDARD_SPRACHE);
  const spracheId = useId();
  const ungeprueft = berichtSprache !== "de" && berichtSprache !== "en";
  // "Vergleichbare Installationen mitnehmen" - Standard aus, gilt für PDF und Word.
  const [mitVergleichen, setMitVergleichen] = useState(false);

  // Mit Schalter: Referenzen für alle Produkte des (gespeicherten) Berichts in
  // einer Abfrage laden. Sind sie nicht verfügbar, folgt ein Hinweis und der
  // Export läuft ohne Vorschläge weiter.
  async function modell() {
    let vorschlagReferenzen: Record<string, VorschlagReferenz[]> | undefined;
    if (mitVergleichen) {
      const produktIds = eintraege.flatMap((band) =>
        band.foerderband_positionen
          .map((pos) => produktZurKategorie(kategorien, pos.produkt_kategorie_id)?.id)
          .filter((id): id is string => Boolean(id)),
      );
      if (produktIds.length > 0) {
        const ergebnis = await vorschlagReferenzenLaden(produktIds).catch(() => ({ erfolg: false as const }));
        if (ergebnis.erfolg) vorschlagReferenzen = ergebnis.referenzen;
        else toast(t("vorschlaege.nichtVerfuegbar"));
      }
    }
    return berichtModellErstellen({ besuch, eintraege, kategorien, erstellerName, sprache: berichtSprache, vorschlagReferenzen });
  }

  async function alsPdf() {
    setExportiertLaeuft("pdf");
    try {
      await werksbesichtigungAlsPdf(await modell());
    } catch {
      toast(t("profil.fehlerStandard"), "fehler");
    } finally {
      setExportiertLaeuft(null);
    }
  }

  async function alsDocx() {
    setExportiertLaeuft("docx");
    try {
      await werksbesichtigungAlsDocx(await modell());
    } catch {
      toast(t("profil.fehlerStandard"), "fehler");
    } finally {
      setExportiertLaeuft(null);
    }
  }

  return (
    <div className="flex w-full flex-wrap items-end gap-2 sm:w-auto">
      {ungespeichert && (
        <p role="status" className="w-full border-l-[3px] border-critical pl-3 text-xs text-ink sm:w-auto">
          {t("werksbesichtigungen.exportUngespeichert")}
        </p>
      )}
      <div className="flex w-full flex-col gap-1 sm:w-auto sm:max-w-[16rem]">
        <label htmlFor={spracheId} className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
          {t("bericht.sprache")}
        </label>
        {/* Sprachnamen sind Eigennamen in ihrer eigenen Schrift (nicht übersetzt). */}
        <select
          id={spracheId}
          value={berichtSprache}
          onChange={(e) => {
            if (istGueltigeSprache(e.target.value)) setBerichtSprache(e.target.value);
          }}
          disabled={exportiertLaeuft !== null}
          className="h-12 w-full rounded-[2px] border border-rule bg-paper-2 px-2.5 text-base text-ink outline-none focus:border-ink disabled:opacity-50 sm:h-11 sm:text-sm"
        >
          {SPRACHEN.map((s) => (
            <option key={s.code} value={s.code} lang={s.code}>
              {s.label}
            </option>
          ))}
        </select>
        {ungeprueft && <p className="text-xs text-ink-soft">{t("bericht.spracheUngeprueft")}</p>}
      </div>
      <label className="flex min-h-11 w-full cursor-pointer items-center gap-2 text-sm text-ink sm:w-auto">
        <input
          type="checkbox"
          checked={mitVergleichen}
          onChange={(e) => setMitVergleichen(e.target.checked)}
          disabled={exportiertLaeuft !== null}
          className="h-4 w-4 accent-signal"
        />
        {t("vorschlaege.exportSchalter")}
      </label>
      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
        <button
          type="button"
          onClick={alsPdf}
          disabled={exportiertLaeuft !== null}
          className="min-h-12 rounded-[2px] border border-rule-strong px-3 py-1.5 text-xs uppercase tracking-wide text-ink hover:bg-paper-2 disabled:opacity-50 sm:min-h-11"
        >
          {exportiertLaeuft === "pdf" ? t("werksbesichtigungen.exportLaeuft") : t("werksbesichtigungen.exportPdf")}
        </button>
        <button
          type="button"
          onClick={alsDocx}
          disabled={exportiertLaeuft !== null}
          className="min-h-12 rounded-[2px] border border-rule-strong px-3 py-1.5 text-xs uppercase tracking-wide text-ink hover:bg-paper-2 disabled:opacity-50 sm:min-h-11"
        >
          {exportiertLaeuft === "docx" ? t("werksbesichtigungen.exportLaeuft") : t("werksbesichtigungen.exportWord")}
        </button>
      </div>
    </div>
  );
}

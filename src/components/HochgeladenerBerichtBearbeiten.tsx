"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hochgeladenerBerichtAktualisieren } from "@/lib/actions/werksbesichtigungen";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import { DatenblattZeile, eingabeKlasse } from "@/components/Datenblatt";
import Icon from "@/components/icons/Icon";
import type { BerichtEintrag } from "@/components/WerksbesichtigungenUebersicht";

export default function HochgeladenerBerichtBearbeiten({
  eintrag,
  onSchliessen,
}: {
  eintrag: BerichtEintrag;
  onSchliessen: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();
  const [kunde, setKunde] = useState(eintrag.kunde);
  const [ort, setOrt] = useState(eintrag.ort ?? "");
  const [datum, setDatum] = useState(eintrag.datum);
  const [neueDatei, setNeueDatei] = useState<File | null>(null);
  const [speichert, setSpeichert] = useState(false);

  async function speichern() {
    setSpeichert(true);
    try {
      let dateiFeld: { dateiname: string; dateiUrl: string; alteDateiUrl: string | null } | undefined;
      if (neueDatei) {
        const supabase = createClient();
        const pfad = `${crypto.randomUUID()}-${neueDatei.name}`;
        const { error: uploadFehler } = await supabase.storage
          .from("werksbesichtigung-berichte")
          .upload(pfad, neueDatei, { contentType: neueDatei.type || undefined });
        if (uploadFehler) {
          toast(uploadFehler.message, "fehler");
          return;
        }
        const { data: urlData } = supabase.storage.from("werksbesichtigung-berichte").getPublicUrl(pfad);
        dateiFeld = { dateiname: neueDatei.name, dateiUrl: urlData.publicUrl, alteDateiUrl: eintrag.href };
      }

      const ergebnis = await hochgeladenerBerichtAktualisieren(eintrag.id, { kunde, ort, datum, neueDatei: dateiFeld });
      if (ergebnis.erfolg) {
        toast(t("werksbesichtigungen.gespeichert"), "erfolg");
        router.refresh();
        onSchliessen();
      } else {
        toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
      }
    } catch (fehler) {
      toast(fehler instanceof Error ? fehler.message : t("profil.fehlerStandard"), "fehler");
    } finally {
      setSpeichert(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onSchliessen}>
      <div
        className="w-full max-w-md border border-rule-strong bg-paper text-ink shadow-[0_12px_32px_-12px_rgba(21,22,26,.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-rule-strong p-4">
          <h2 className="font-display text-lg font-bold text-ink">{t("werksbesichtigungen.hochladenBearbeitenTitel")}</h2>
          <button type="button" onClick={onSchliessen} className="shrink-0 text-ink-faint hover:text-ink">
            <Icon name="schliessen" size={18} />
          </button>
        </div>

        <div className="border-t border-rule-strong p-4">
          <DatenblattZeile label={t("werksbesichtigungen.kunde")}>
            <input value={kunde} onChange={(e) => setKunde(e.target.value)} required className={eingabeKlasse} />
          </DatenblattZeile>
          <DatenblattZeile label={t("werksbesichtigungen.ort")}>
            <input value={ort} onChange={(e) => setOrt(e.target.value)} className={eingabeKlasse} />
          </DatenblattZeile>
          <DatenblattZeile label={t("werksbesichtigungen.datum")}>
            <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} required className={eingabeKlasse} />
          </DatenblattZeile>
          <DatenblattZeile label={t("werksbesichtigungen.hochladenDateiErsetzen")}>
            <div>
              <p className="mb-1 truncate text-xs text-ink-soft">{eintrag.dateiname}</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setNeueDatei(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-ink file:mr-3 file:rounded-[2px] file:border file:border-rule file:bg-paper-2 file:px-3 file:py-1.5 file:text-sm file:text-ink"
              />
            </div>
          </DatenblattZeile>
        </div>

        <div className="border-t border-rule-strong p-4">
          <button
            type="button"
            onClick={speichern}
            disabled={speichert}
            className="rounded-[2px] bg-signal px-4 py-2 text-sm font-bold uppercase tracking-wide text-signal-ink disabled:opacity-50"
          >
            {speichert ? t("werksbesichtigungen.speichertLaeuft") : t("werksbesichtigungen.speichern")}
          </button>
        </div>
      </div>
    </div>
  );
}

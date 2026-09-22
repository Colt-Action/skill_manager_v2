"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hochgeladenerBerichtErstellen } from "@/lib/actions/werksbesichtigungen";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import { DatenblattZeile, eingabeKlasse } from "@/components/Datenblatt";
import Icon from "@/components/icons/Icon";

export default function HochgeladenerBerichtForm({
  meineTeams,
}: {
  meineTeams: { id: string; name: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();
  const [offen, setOffen] = useState(false);
  const [kunde, setKunde] = useState("");
  const [ort, setOrt] = useState("");
  const [datum, setDatum] = useState(() => new Date().toISOString().slice(0, 10));
  const [merkteamId, setMerkteamId] = useState("");
  const [datei, setDatei] = useState<File | null>(null);
  const [laedt, setLaedt] = useState(false);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    if (!datei) {
      toast(t("werksbesichtigungen.hochladenKeineDatei"), "fehler");
      return;
    }
    setLaedt(true);
    try {
      const supabase = createClient();
      const pfad = `${crypto.randomUUID()}-${datei.name}`;
      const { error: uploadFehler } = await supabase.storage
        .from("werksbesichtigung-berichte")
        .upload(pfad, datei, { contentType: datei.type || undefined });
      if (uploadFehler) {
        toast(uploadFehler.message, "fehler");
        return;
      }
      const { data: urlData } = supabase.storage.from("werksbesichtigung-berichte").getPublicUrl(pfad);
      const ergebnis = await hochgeladenerBerichtErstellen({
        kunde,
        ort,
        datum,
        dateiname: datei.name,
        dateiUrl: urlData.publicUrl,
        merkteamId: merkteamId || null,
      });
      if (ergebnis.erfolg) {
        setKunde("");
        setOrt("");
        setDatei(null);
        toast(t("werksbesichtigungen.hochladenErfolg"), "erfolg");
        router.refresh();
        setOffen(false);
      } else {
        toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
      }
    } catch (fehler) {
      toast(fehler instanceof Error ? fehler.message : t("profil.fehlerStandard"), "fehler");
    } finally {
      setLaedt(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOffen(true)}
        className="mt-3 text-xs font-medium text-ink-soft hover:text-ink hover:underline"
      >
        {t("werksbesichtigungen.hochladenTitel")}
      </button>

      {offen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOffen(false)}>
          <form
            onSubmit={absenden}
            className="w-full max-w-md border border-rule-strong bg-paper text-ink shadow-[0_12px_32px_-12px_rgba(21,22,26,.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-rule-strong p-4">
              <h2 className="font-display text-lg font-bold text-ink">{t("werksbesichtigungen.hochladenTitel")}</h2>
              <button type="button" onClick={() => setOffen(false)} className="shrink-0 text-ink-faint hover:text-ink">
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
              <DatenblattZeile label={t("werksbesichtigungen.hochladenDatei")}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setDatei(e.target.files?.[0] ?? null)}
                  required
                  className="w-full text-sm text-ink file:mr-3 file:rounded-[2px] file:border file:border-rule file:bg-paper-2 file:px-3 file:py-1.5 file:text-sm file:text-ink"
                />
              </DatenblattZeile>
            </div>

            <div className="border-t border-rule-strong p-4">
              <button
                type="submit"
                disabled={laedt}
                className="rounded-[2px] bg-signal px-4 py-2 text-sm font-bold uppercase tracking-wide text-signal-ink disabled:opacity-50"
              >
                {laedt ? t("werksbesichtigungen.hochladenLaeuft") : t("werksbesichtigungen.hochladenButton")}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

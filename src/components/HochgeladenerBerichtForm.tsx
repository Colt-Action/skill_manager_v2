"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hochgeladenerBerichtErstellen } from "@/lib/actions/werksbesichtigungen";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import { DatenblattZeile, eingabeKlasse } from "@/components/Datenblatt";

export default function HochgeladenerBerichtForm({
  meineTeams,
}: {
  meineTeams: { id: string; name: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();
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
    <form onSubmit={absenden} className="mt-6 border border-rule bg-paper p-4">
      <h2 className="font-mono text-xs uppercase tracking-wide text-annot">{t("werksbesichtigungen.hochladenTitel")}</h2>
      <div className="mt-2 border-t border-rule-strong">
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
      <button
        type="submit"
        disabled={laedt}
        className="mt-4 rounded-[2px] border border-rule px-4 py-2 text-sm font-medium text-ink hover:bg-paper-2 disabled:opacity-50"
      >
        {laedt ? t("werksbesichtigungen.hochladenLaeuft") : t("werksbesichtigungen.hochladenButton")}
      </button>
    </form>
  );
}

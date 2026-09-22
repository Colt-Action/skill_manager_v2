"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  werksbesichtigungBearbeiterEntfernen,
  werksbesichtigungBearbeiterHinzufuegen,
  werksbesichtigungNutzerSuchen,
} from "@/lib/actions/werksbesichtigungen";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import SectionLinie from "@/components/SectionLinie";
import { eingabeKlasse } from "@/components/Datenblatt";

interface NutzerKurz {
  id: string;
  name: string;
}

export default function WerksbesichtigungBearbeiter({
  werksbesichtigungId,
  bearbeiter,
  darfVerwalten,
}: {
  werksbesichtigungId: string;
  bearbeiter: NutzerKurz[];
  darfVerwalten: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();
  const [suchtext, setSuchtext] = useState("");
  const [ergebnisse, setErgebnisse] = useState<NutzerKurz[]>([]);
  const [sucheLaeuft, startSuchTransition] = useTransition();
  const [aendernLaeuft, startAendernTransition] = useTransition();

  function suchen(e: React.FormEvent) {
    e.preventDefault();
    startSuchTransition(async () => {
      const treffer = await werksbesichtigungNutzerSuchen(werksbesichtigungId, suchtext);
      setErgebnisse(treffer);
    });
  }

  function hinzufuegen(nutzer: NutzerKurz) {
    startAendernTransition(async () => {
      const ergebnis = await werksbesichtigungBearbeiterHinzufuegen(werksbesichtigungId, nutzer.id);
      if (ergebnis.erfolg) {
        setErgebnisse((vorherig) => vorherig.filter((n) => n.id !== nutzer.id));
        router.refresh();
      } else {
        toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
      }
    });
  }

  function entfernen(nutzer: NutzerKurz) {
    startAendernTransition(async () => {
      const ergebnis = await werksbesichtigungBearbeiterEntfernen(werksbesichtigungId, nutzer.id);
      if (ergebnis.erfolg) {
        router.refresh();
      } else {
        toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
      }
    });
  }

  if (!darfVerwalten && bearbeiter.length === 0) return null;

  return (
    <section className="mt-8">
      <SectionLinie titel={t("werksbesichtigungen.mitbearbeiterTitel")} />

      {bearbeiter.length > 0 && (
        <div className="mt-1">
          {bearbeiter.map((nutzer) => (
            <div key={nutzer.id} className="flex items-center gap-2 border-b border-rule py-2.5">
              <span className="flex-1 text-sm text-ink">{nutzer.name}</span>
              {darfVerwalten && (
                <button
                  type="button"
                  onClick={() => entfernen(nutzer)}
                  disabled={aendernLaeuft}
                  className="shrink-0 rounded-[2px] px-2 py-1 text-xs text-ink-soft hover:bg-paper-2 disabled:opacity-50"
                >
                  {t("werksbesichtigungen.entfernenButton")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {darfVerwalten && (
        <div className="mt-4 border border-rule bg-paper p-4">
          <h3 className="text-sm font-medium text-ink">{t("werksbesichtigungen.mitbearbeiterHinzufuegenTitel")}</h3>
          <form onSubmit={suchen} className="mt-2 flex gap-2">
            <input
              value={suchtext}
              onChange={(e) => setSuchtext(e.target.value)}
              placeholder={t("werksbesichtigungen.suchePlatzhalter")}
              className={`flex-1 ${eingabeKlasse}`}
            />
            <button
              type="submit"
              disabled={sucheLaeuft}
              className="rounded-[2px] bg-signal px-3 py-1.5 text-sm font-semibold text-signal-ink disabled:opacity-50"
            >
              {t("werksbesichtigungen.suchenButton")}
            </button>
          </form>

          {ergebnisse.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {ergebnisse.map((nutzer) => (
                <div key={nutzer.id} className="flex items-center gap-2 border border-rule bg-paper-2 p-2 text-sm">
                  <span className="line-clamp-1 flex-1 text-ink">{nutzer.name}</span>
                  <button
                    type="button"
                    onClick={() => hinzufuegen(nutzer)}
                    disabled={aendernLaeuft}
                    className="shrink-0 rounded-[2px] bg-signal px-2 py-1 text-xs font-semibold text-signal-ink disabled:opacity-50"
                  >
                    {t("werksbesichtigungen.hinzufuegenButton")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

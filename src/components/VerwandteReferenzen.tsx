"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  referenzEntknuepfen,
  referenzenSuchen,
  referenzVerknuepfen,
} from "@/lib/actions/referenzen";
import { useSprache } from "@/components/SprachProvider";
import Icon, { type IconName } from "@/components/icons/Icon";
import type { ReferenzTyp } from "@/lib/supabase/types";

const TYP_ICON: Record<ReferenzTyp, IconName> = { video: "video", foto: "foto", dokument: "dokument", link: "link" };

interface ReferenzKurz {
  id: string;
  titel: string;
  typ: ReferenzTyp;
}

export default function VerwandteReferenzen({
  referenzId,
  anfangsVerknuepft,
  darfBearbeiten,
}: {
  referenzId: string;
  anfangsVerknuepft: ReferenzKurz[];
  darfBearbeiten: boolean;
}) {
  const { t } = useSprache();
  const [verknuepft, setVerknuepft] = useState(anfangsVerknuepft);
  const [suchtext, setSuchtext] = useState("");
  const [ergebnisse, setErgebnisse] = useState<ReferenzKurz[]>([]);
  const [sucheLaeuft, startSuchTransition] = useTransition();
  const [aendernLaeuft, startAendernTransition] = useTransition();
  const [fehler, setFehler] = useState<string | null>(null);

  function suchen(e: React.FormEvent) {
    e.preventDefault();
    setFehler(null);
    startSuchTransition(async () => {
      const treffer = await referenzenSuchen(suchtext, referenzId);
      setErgebnisse(treffer.filter((r) => !verknuepft.some((v) => v.id === r.id)));
    });
  }

  function verknuepfen(ziel: ReferenzKurz) {
    setFehler(null);
    startAendernTransition(async () => {
      const ergebnis = await referenzVerknuepfen(referenzId, ziel.id);
      if (ergebnis.erfolg) {
        setVerknuepft((vorherig) => [...vorherig, ziel]);
        setErgebnisse((vorherig) => vorherig.filter((r) => r.id !== ziel.id));
      } else {
        setFehler(ergebnis.fehler ?? t("verwandteReferenzen.fehlerVerknuepfen"));
      }
    });
  }

  function entknuepfen(ziel: ReferenzKurz) {
    setFehler(null);
    startAendernTransition(async () => {
      const ergebnis = await referenzEntknuepfen(referenzId, ziel.id);
      if (ergebnis.erfolg) {
        setVerknuepft((vorherig) => vorherig.filter((v) => v.id !== ziel.id));
      } else {
        setFehler(ergebnis.fehler ?? t("verwandteReferenzen.fehlerEntknuepfen"));
      }
    });
  }

  return (
    <div className="mt-8">
      <h2 className="font-mono text-xs uppercase tracking-wide text-ink-soft">
        {t("verwandteReferenzen.titel")}
      </h2>

      {verknuepft.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">{t("verwandteReferenzen.keine")}</p>
      ) : (
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {verknuepft.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-2 border border-rule bg-paper p-2.5"
            >
              <Link
                href={`/referenzbereich/${r.id}`}
                className="flex flex-1 items-center gap-2 text-sm text-ink hover:text-ink"
              >
                <Icon name={TYP_ICON[r.typ]} size={14} />
                <span className="line-clamp-1">{r.titel}</span>
              </Link>
              {darfBearbeiten && (
                <button
                  type="button"
                  onClick={() => entknuepfen(r)}
                  disabled={aendernLaeuft}
                  className="shrink-0 rounded-[2px] px-2 py-1 text-xs text-ink-soft hover:bg-paper-2 disabled:opacity-50"
                >
                  {t("verwandteReferenzen.entfernen")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {darfBearbeiten && (
        <div className="mt-4 border border-rule bg-paper p-4">
          <h3 className="text-sm font-medium text-ink">{t("verwandteReferenzen.suchenTitel")}</h3>
          <form onSubmit={suchen} className="mt-2 flex gap-2">
            <input
              value={suchtext}
              onChange={(e) => setSuchtext(e.target.value)}
              placeholder={t("verwandteReferenzen.suchePlatzhalter")}
              className="flex-1 rounded-[2px] border border-rule bg-paper px-3 py-1.5 text-sm text-ink outline-none focus:border-signal"
            />
            <button
              type="submit"
              disabled={sucheLaeuft}
              className="rounded-[2px] bg-signal px-3 py-1.5 text-sm font-semibold text-signal-ink disabled:opacity-50"
            >
              {t("verwandteReferenzen.suchenButton")}
            </button>
          </form>

          {fehler && <p className="mt-2 text-xs text-critical">{fehler}</p>}

          {ergebnisse.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {ergebnisse.map((r) => (
                <div key={r.id} className="flex items-center gap-2 rounded-[2px] bg-paper p-2 text-sm">
                  <Icon name={TYP_ICON[r.typ]} size={14} />
                  <span className="line-clamp-1 flex-1">{r.titel}</span>
                  <button
                    type="button"
                    onClick={() => verknuepfen(r)}
                    disabled={aendernLaeuft}
                    className="shrink-0 rounded-[2px] bg-signal px-2 py-1 text-xs font-semibold text-signal-ink disabled:opacity-50"
                  >
                    {t("verwandteReferenzen.verknuepfenButton")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

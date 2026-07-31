"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  referenzEntknuepfen,
  referenzenSuchen,
  referenzVerknuepfen,
} from "@/lib/actions/referenzen";
import { useSprache } from "@/components/SprachProvider";
import type { ReferenzTyp } from "@/lib/supabase/types";

const TYP_ICON: Record<ReferenzTyp, string> = { video: "🎥", foto: "📷", dokument: "📄", link: "🔗" };

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
      <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">
        {t("verwandteReferenzen.titel")}
      </h2>

      {verknuepft.length === 0 ? (
        <p className="mt-2 text-sm text-foreground-soft">{t("verwandteReferenzen.keine")}</p>
      ) : (
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {verknuepft.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-2 rounded-lg bg-surface p-2.5 ring-1 ring-line"
            >
              <Link
                href={`/referenzbereich/${r.id}`}
                className="flex flex-1 items-center gap-2 text-sm text-foreground hover:text-accent-deep"
              >
                <span>{TYP_ICON[r.typ]}</span>
                <span className="line-clamp-1">{r.titel}</span>
              </Link>
              {darfBearbeiten && (
                <button
                  type="button"
                  onClick={() => entknuepfen(r)}
                  disabled={aendernLaeuft}
                  className="shrink-0 rounded-md px-2 py-1 text-xs text-foreground-soft hover:bg-background disabled:opacity-50"
                >
                  {t("verwandteReferenzen.entfernen")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {darfBearbeiten && (
        <div className="mt-4 rounded-xl bg-surface p-4 ring-1 ring-line">
          <h3 className="text-sm font-medium text-foreground">{t("verwandteReferenzen.suchenTitel")}</h3>
          <form onSubmit={suchen} className="mt-2 flex gap-2">
            <input
              value={suchtext}
              onChange={(e) => setSuchtext(e.target.value)}
              placeholder={t("verwandteReferenzen.suchePlatzhalter")}
              className="flex-1 rounded-lg border border-line bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
            <button
              type="submit"
              disabled={sucheLaeuft}
              className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-ink disabled:opacity-50"
            >
              {t("verwandteReferenzen.suchenButton")}
            </button>
          </form>

          {fehler && <p className="mt-2 text-xs text-critical">{fehler}</p>}

          {ergebnisse.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {ergebnisse.map((r) => (
                <div key={r.id} className="flex items-center gap-2 rounded-lg bg-background p-2 text-sm">
                  <span>{TYP_ICON[r.typ]}</span>
                  <span className="line-clamp-1 flex-1">{r.titel}</span>
                  <button
                    type="button"
                    onClick={() => verknuepfen(r)}
                    disabled={aendernLaeuft}
                    className="shrink-0 rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-ink disabled:opacity-50"
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

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  merkteamLoeschen,
  merkteamMitgliedEntfernen,
  merkteamMitgliedHinzufuegen,
  merkteamNutzerSuchen,
  merkteamUmbenennen,
} from "@/lib/actions/merkteams";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import { eingabeKlasse } from "@/components/Datenblatt";
import SectionLinie from "@/components/SectionLinie";

interface NutzerKurz {
  id: string;
  name: string;
}

export default function MerkteamVerwaltung({
  merkteamId,
  name,
  mitglieder,
  eigeneId,
}: {
  merkteamId: string;
  name: string;
  mitglieder: NutzerKurz[];
  eigeneId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();
  const [nameWert, setNameWert] = useState(name);
  const [umbenenntLaeuft, setUmbenenntLaeuft] = useState(false);
  const [suchtext, setSuchtext] = useState("");
  const [ergebnisse, setErgebnisse] = useState<NutzerKurz[]>([]);
  const [sucheLaeuft, startSuchTransition] = useTransition();
  const [aendernLaeuft, startAendernTransition] = useTransition();

  function umbenennen(e: React.FormEvent) {
    e.preventDefault();
    setUmbenenntLaeuft(true);
    merkteamUmbenennen(merkteamId, nameWert).then((ergebnis) => {
      setUmbenenntLaeuft(false);
      if (ergebnis.erfolg) {
        toast(t("merkteamVerwaltung.umbenannt"), "erfolg");
        router.refresh();
      } else {
        toast(ergebnis.fehler ?? t("merkteamVerwaltung.fehlerUmbenennen"), "fehler");
      }
    });
  }

  function suchen(e: React.FormEvent) {
    e.preventDefault();
    startSuchTransition(async () => {
      const treffer = await merkteamNutzerSuchen(merkteamId, suchtext);
      setErgebnisse(treffer);
    });
  }

  function hinzufuegen(nutzer: NutzerKurz) {
    startAendernTransition(async () => {
      const ergebnis = await merkteamMitgliedHinzufuegen(merkteamId, nutzer.id);
      if (ergebnis.erfolg) {
        setErgebnisse((vorherig) => vorherig.filter((n) => n.id !== nutzer.id));
        router.refresh();
      } else {
        toast(ergebnis.fehler ?? t("merkteamVerwaltung.fehlerHinzufuegen"), "fehler");
      }
    });
  }

  function entfernen(nutzer: NutzerKurz) {
    startAendernTransition(async () => {
      const ergebnis = await merkteamMitgliedEntfernen(merkteamId, nutzer.id);
      if (ergebnis.erfolg) {
        if (nutzer.id === eigeneId) {
          router.push("/merkteams");
        } else {
          router.refresh();
        }
      } else {
        toast(ergebnis.fehler ?? t("merkteamVerwaltung.fehlerEntfernen"), "fehler");
      }
    });
  }

  async function teamLoeschen() {
    if (!confirm(t("merkteamVerwaltung.loeschenBestaetigung"))) return;
    const ergebnis = await merkteamLoeschen(merkteamId);
    if (ergebnis.erfolg) {
      router.push("/merkteams");
    } else {
      toast(ergebnis.fehler ?? t("merkteamVerwaltung.fehlerLoeschen"), "fehler");
    }
  }

  return (
    <div className="mt-6">
      <form onSubmit={umbenennen} className="flex flex-wrap items-end gap-2">
        <label className="min-w-[240px] flex-1 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("merkteamVerwaltung.nameLabel")}</span>
          <input
            value={nameWert}
            onChange={(e) => setNameWert(e.target.value)}
            required
            className={`mt-1 ${eingabeKlasse}`}
          />
        </label>
        <button
          type="submit"
          disabled={umbenenntLaeuft}
          className="rounded-[2px] bg-signal px-4 py-2 text-sm font-bold uppercase tracking-wide text-signal-ink disabled:opacity-50"
        >
          {t("merkteamVerwaltung.speichernButton")}
        </button>
      </form>

      <SectionLinie titel={t("merkteamVerwaltung.mitgliederTitel")} />
      <div className="mt-1">
        {mitglieder.map((mitglied) => (
          <div key={mitglied.id} className="flex items-center gap-2 border-b border-rule py-2.5">
            <span className="flex-1 text-sm text-ink">
              {mitglied.name}
              {mitglied.id === eigeneId && (
                <span className="ml-2 font-mono text-xs text-ink-faint">({t("merkteamVerwaltung.duSelbst")})</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => entfernen(mitglied)}
              disabled={aendernLaeuft}
              className="shrink-0 rounded-[2px] px-2 py-1 text-xs text-ink-soft hover:bg-paper-2 disabled:opacity-50"
            >
              {mitglied.id === eigeneId ? t("merkteamVerwaltung.verlassenButton") : t("merkteamVerwaltung.entfernenButton")}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 border border-rule bg-paper p-4">
        <h3 className="text-sm font-medium text-ink">{t("merkteamVerwaltung.hinzufuegenTitel")}</h3>
        <form onSubmit={suchen} className="mt-2 flex gap-2">
          <input
            value={suchtext}
            onChange={(e) => setSuchtext(e.target.value)}
            placeholder={t("merkteamVerwaltung.suchePlatzhalter")}
            className={`flex-1 ${eingabeKlasse}`}
          />
          <button
            type="submit"
            disabled={sucheLaeuft}
            className="rounded-[2px] bg-signal px-3 py-1.5 text-sm font-semibold text-signal-ink disabled:opacity-50"
          >
            {t("merkteamVerwaltung.suchenButton")}
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
                  {t("merkteamVerwaltung.hinzufuegenButton")}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={teamLoeschen}
        className="mt-6 rounded-[2px] border border-critical/30 px-3 py-1.5 text-xs text-critical hover:bg-critical/10"
      >
        {t("merkteamVerwaltung.komplettLoeschenButton")}
      </button>
    </div>
  );
}

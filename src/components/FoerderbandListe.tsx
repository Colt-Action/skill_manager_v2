"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { foerderbandEintragErstellen } from "@/lib/actions/werksbesichtigungen";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import FoerderbandEintrag from "@/components/FoerderbandEintrag";
import type { BandFelder, PositionFelder } from "@/lib/werksbesichtigungAenderungen";
import type { FoerderbandEintragMitDetails, Kategorie } from "@/lib/supabase/types";

export default function FoerderbandListe({
  werksbesichtigungId,
  eintraege,
  kategorien,
  darfBearbeiten,
  bandWerte,
  positionWerte,
  onBandAendern,
  onPositionAendern,
  bandUngespeichert,
  positionUngespeichert,
  bandFehler,
  positionFehler,
}: {
  werksbesichtigungId: string;
  eintraege: FoerderbandEintragMitDetails[];
  kategorien: Kategorie[];
  darfBearbeiten: boolean;
  bandWerte: Record<string, BandFelder>;
  positionWerte: Record<string, PositionFelder>;
  onBandAendern: <K extends keyof BandFelder>(id: string, feld: K, wert: BandFelder[K]) => void;
  onPositionAendern: <K extends keyof PositionFelder>(id: string, feld: K, wert: PositionFelder[K]) => void;
  bandUngespeichert: (id: string) => boolean;
  positionUngespeichert: (id: string) => boolean;
  bandFehler: (id: string) => string | undefined;
  positionFehler: (id: string) => string | undefined;
}) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();
  const [erstelltLaeuft, setErstelltLaeuft] = useState(false);

  // Legt das Band sofort an (Fotos brauchen eine echte Band-ID). Der
  // anschließende router.refresh() behält den Client-Zustand - offene,
  // ungespeicherte Eingaben im WerksbesichtigungEditor bleiben erhalten.
  async function hinzufuegen() {
    setErstelltLaeuft(true);
    const ergebnis = await foerderbandEintragErstellen(werksbesichtigungId);
    setErstelltLaeuft(false);
    if (ergebnis.erfolg) {
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
    }
  }

  return (
    <div>
      {eintraege.length === 0 && <p className="mt-3 text-sm text-ink-soft">{t("foerderband.keineEintraege")}</p>}

      {eintraege.map((eintrag, index) => (
        <FoerderbandEintrag
          key={eintrag.id}
          eintrag={eintrag}
          nummer={index + 1}
          werksbesichtigungId={werksbesichtigungId}
          kategorien={kategorien}
          darfBearbeiten={darfBearbeiten}
          werte={bandWerte[eintrag.id]}
          onAendern={(feld, wert) => onBandAendern(eintrag.id, feld, wert)}
          ungespeichert={bandUngespeichert(eintrag.id)}
          fehler={bandFehler(eintrag.id)}
          positionWerte={positionWerte}
          onPositionAendern={onPositionAendern}
          positionUngespeichert={positionUngespeichert}
          positionFehler={positionFehler}
        />
      ))}

      {darfBearbeiten && (
        <button
          type="button"
          onClick={hinzufuegen}
          disabled={erstelltLaeuft}
          className="mt-4 rounded-[2px] border border-rule px-4 py-2 text-sm font-medium text-ink hover:bg-paper-2 disabled:opacity-50"
        >
          {t("foerderband.neuesFoerderband")}
        </button>
      )}
    </div>
  );
}

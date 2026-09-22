"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { foerderbandEintragErstellen } from "@/lib/actions/werksbesichtigungen";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import FoerderbandEintrag from "@/components/FoerderbandEintrag";
import type { FoerderbandEintragMitDetails, Kategorie } from "@/lib/supabase/types";

export default function FoerderbandListe({
  werksbesichtigungId,
  eintraege,
  kategorien,
  darfBearbeiten,
}: {
  werksbesichtigungId: string;
  eintraege: FoerderbandEintragMitDetails[];
  kategorien: Kategorie[];
  darfBearbeiten: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();
  const [erstelltLaeuft, setErstelltLaeuft] = useState(false);

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

      {eintraege.map((eintrag) => (
        <FoerderbandEintrag
          key={eintrag.id}
          eintrag={eintrag}
          werksbesichtigungId={werksbesichtigungId}
          kategorien={kategorien}
          darfBearbeiten={darfBearbeiten}
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

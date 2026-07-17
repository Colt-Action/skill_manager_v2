"use client";

import { useSprache } from "@/components/SprachProvider";
import { SPRACHEN, istGueltigeSprache } from "@/lib/i18n/sprachen";

// Kompakte Sprachauswahl für die Navigation - wirkt sofort (Context) und
// wird bei eingeloggten Nutzern zusätzlich im Profil gespeichert.
export default function SpracheAuswahl({ className = "" }: { className?: string }) {
  const { sprache, setSprache, t } = useSprache();

  return (
    <select
      value={sprache}
      onChange={(e) => {
        const wert = e.target.value;
        if (istGueltigeSprache(wert)) setSprache(wert);
      }}
      title={t("nav.sprache")}
      aria-label={t("nav.sprache")}
      className={className}
    >
      {SPRACHEN.map((s) => (
        <option key={s.code} value={s.code}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

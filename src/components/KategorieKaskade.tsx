"use client";

import { useEffect, useState } from "react";
import { EBENEN_REIHENFOLGE, ebenenIcon, ebenenLabel, kinderVon, pfadZuKategorie } from "@/lib/kategorieBaum";
import type { Kategorie } from "@/lib/supabase/types";

const ALLE = "";

export interface KategoriePfad {
  industrieId: string | null;
  herstellerId: string | null;
  produktId: string | null;
  kategorieId: string | null;
  unterkategorieId: string | null;
}

const PFAD_SCHLUESSEL: (keyof KategoriePfad)[] = [
  "industrieId",
  "herstellerId",
  "produktId",
  "kategorieId",
  "unterkategorieId",
];

// Ab diesem Index (= "kategorie") ist ein gesetztes Produkt Voraussetzung.
// Darüber (Industrie/Hersteller/Produkt) sind die Ebenen im Filter-Modus
// unabhängig voneinander nutzbar, z.B. nur "HOSCH" ohne Industrie-Auswahl.
const ABHAENGIG_AB_INDEX = EBENEN_REIHENFOLGE.indexOf("kategorie");

export default function KategorieKaskade({
  kategorien,
  mitAlleOption = false,
  startPfad,
  onAendern,
}: {
  kategorien: Kategorie[];
  /** true = Filter-Modus (Videothek/Referenzvideos): "Alle" wählbar. false = Formular-Modus: konkrete Auswahl nötig. */
  mitAlleOption?: boolean;
  /** Vorbelegung, z.B. beim Bearbeiten eines Videos mit bestehender Kategorie. */
  startPfad?: string | null;
  onAendern: (pfad: KategoriePfad) => void;
}) {
  const [ids, setIds] = useState<(string | null)[]>(() => pfadZuKategorie(kategorien, startPfad ?? null));

  useEffect(() => {
    const pfad = {} as KategoriePfad;
    PFAD_SCHLUESSEL.forEach((schluessel, i) => {
      pfad[schluessel] = ids[i] ?? null;
    });
    onAendern(pfad);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  function optionenFuer(ebeneIndex: number): Kategorie[] {
    const ebene = EBENEN_REIHENFOLGE[ebeneIndex];
    const elternId = ebeneIndex === 0 ? null : ids[ebeneIndex - 1];
    if (elternId) return kinderVon(kategorien, ebene, elternId);
    if (ebeneIndex === 0) return kinderVon(kategorien, ebene, null);
    // Im Filter-Modus dürfen Industrie/Hersteller/Produkt unabhängig
    // voneinander gewählt werden, auch ohne die übergeordnete Ebene.
    if (mitAlleOption && ebeneIndex < ABHAENGIG_AB_INDEX) {
      return kategorien.filter((k) => k.ebene === ebene).sort((a, b) => a.name.localeCompare(b.name));
    }
    return [];
  }

  function deaktiviertFuer(ebeneIndex: number): boolean {
    if (ebeneIndex === 0) return false;
    if (mitAlleOption && ebeneIndex < ABHAENGIG_AB_INDEX) return false;
    return !ids[ebeneIndex - 1];
  }

  function aendern(ebeneIndex: number, wert: string | null) {
    setIds((vorherig) => {
      const neu = [...vorherig];
      neu[ebeneIndex] = wert;
      for (let i = ebeneIndex + 1; i < neu.length; i++) {
        neu[i] = null;
      }
      return neu;
    });
  }

  const stufen = EBENEN_REIHENFOLGE.map((_, i) => ({
    optionen: optionenFuer(i),
    wert: ids[i] ?? null,
    deaktiviert: deaktiviertFuer(i),
  }));

  const gewaehltePfad = ids
    .map((id) => kategorien.find((k) => k.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <div>
      {gewaehltePfad.length > 0 && (
        <p className="mb-2 font-mono text-xs text-blueprint">{gewaehltePfad.join(" › ")}</p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {EBENEN_REIHENFOLGE.map((ebene, i) => (
          <label key={ebene} className="block">
            <span className="font-mono text-xs uppercase tracking-wide text-foreground-soft">
              {ebenenIcon(ebene)} {ebenenLabel(ebene)}
            </span>
            <select
              value={stufen[i].wert ?? ALLE}
              disabled={stufen[i].deaktiviert}
              onChange={(e) => aendern(i, e.target.value || null)}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:bg-background disabled:text-foreground-soft"
            >
              <option value={ALLE}>{mitAlleOption ? "Alle" : "Bitte wählen"}</option>
              {stufen[i].optionen.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}

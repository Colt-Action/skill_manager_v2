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
}

export default function KategorieKaskade({
  kategorien,
  mitAlleOption = false,
  startPfad,
  onAendern,
}: {
  kategorien: Kategorie[];
  /** true = Filter-Modus (Videothek): "Alle" wählbar. false = Formular-Modus: konkrete Auswahl nötig. */
  mitAlleOption?: boolean;
  /** Vorbelegung, z.B. beim Bearbeiten eines Videos mit bestehender Kategorie. */
  startPfad?: string | null;
  onAendern: (pfad: KategoriePfad) => void;
}) {
  const initial = pfadZuKategorie(kategorien, startPfad ?? null);
  const [industrieId, setIndustrieId] = useState<string | null>(initial[0]);
  const [herstellerId, setHerstellerId] = useState<string | null>(initial[1]);
  const [produktId, setProduktId] = useState<string | null>(initial[2]);
  const [kategorieId, setKategorieId] = useState<string | null>(initial[3]);

  useEffect(() => {
    onAendern({ industrieId, herstellerId, produktId, kategorieId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [industrieId, herstellerId, produktId, kategorieId]);

  const industrien = kinderVon(kategorien, "industrie", null);
  const hersteller = industrieId ? kinderVon(kategorien, "hersteller", industrieId) : [];
  const produkte = herstellerId ? kinderVon(kategorien, "produkt", herstellerId) : [];
  const kategorienListe = produktId ? kinderVon(kategorien, "kategorie", produktId) : [];

  function aendern(ebeneIndex: number, wert: string | null) {
    if (ebeneIndex === 0) {
      setIndustrieId(wert);
      setHerstellerId(null);
      setProduktId(null);
      setKategorieId(null);
    } else if (ebeneIndex === 1) {
      setHerstellerId(wert);
      setProduktId(null);
      setKategorieId(null);
    } else if (ebeneIndex === 2) {
      setProduktId(wert);
      setKategorieId(null);
    } else {
      setKategorieId(wert);
    }
  }

  const stufen: { optionen: Kategorie[]; wert: string | null; deaktiviert: boolean }[] = [
    { optionen: industrien, wert: industrieId, deaktiviert: false },
    { optionen: hersteller, wert: herstellerId, deaktiviert: !industrieId },
    { optionen: produkte, wert: produktId, deaktiviert: !herstellerId },
    { optionen: kategorienListe, wert: kategorieId, deaktiviert: !produktId },
  ];

  const gewaehltePfad = [industrieId, herstellerId, produktId, kategorieId]
    .map((id) => kategorien.find((k) => k.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <div>
      {gewaehltePfad.length > 0 && (
        <p className="mb-2 font-mono text-xs text-blueprint">{gewaehltePfad.join(" › ")}</p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { kategorieErstellen, teilErstellen } from "@/lib/actions/kategorien";
import { EBENEN_REIHENFOLGE, ebenenLabel, kinderVon } from "@/lib/kategorieBaum";
import type { Kategorie, KategorieEbene, Teil } from "@/lib/supabase/types";

export default function KategorieVerwaltung({
  kategorien,
  teile,
}: {
  kategorien: Kategorie[];
  teile: Teil[];
}) {
  const router = useRouter();
  const [industrieId, setIndustrieId] = useState<string | null>(null);
  const [herstellerId, setHerstellerId] = useState<string | null>(null);
  const [produktId, setProduktId] = useState<string | null>(null);
  const [kategorieId, setKategorieId] = useState<string | null>(null);

  const ausgewaehlt: Record<KategorieEbene, string | null> = {
    industrie: industrieId,
    hersteller: herstellerId,
    produkt: produktId,
    kategorie: kategorieId,
  };

  const setter: Record<KategorieEbene, (id: string | null) => void> = {
    industrie: (id) => {
      setIndustrieId(id);
      setHerstellerId(null);
      setProduktId(null);
      setKategorieId(null);
    },
    hersteller: (id) => {
      setHerstellerId(id);
      setProduktId(null);
      setKategorieId(null);
    },
    produkt: (id) => {
      setProduktId(id);
      setKategorieId(null);
    },
    kategorie: (id) => setKategorieId(id),
  };

  const elternProEbene: Record<KategorieEbene, string | null> = {
    industrie: null,
    hersteller: industrieId,
    produkt: herstellerId,
    kategorie: produktId,
  };

  const teileDerKategorie = kategorieId
    ? teile.filter((t) => t.kategorie_id === kategorieId).sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
      {EBENEN_REIHENFOLGE.map((ebene) => (
        <Spalte
          key={ebene}
          ebene={ebene}
          eintraege={kinderVon(kategorien, ebene, elternProEbene[ebene])}
          ausgewaehlteId={ausgewaehlt[ebene]}
          onAuswaehlen={setter[ebene]}
          gesperrt={ebene !== "industrie" && !elternProEbene[ebene]}
          elternId={elternProEbene[ebene]}
          onErstellt={() => router.refresh()}
        />
      ))}

      {kategorieId && (
        <div className="sm:col-span-4">
          <h2 className="mt-4 font-medium text-slate-900">
            Teile in dieser Kategorie
          </h2>
          <div className="mt-2 space-y-2">
            {teileDerKategorie.map((t) => (
              <div key={t.id} className="rounded-lg bg-white p-3 text-sm ring-1 ring-slate-200">
                <p className="font-medium text-slate-800">
                  {t.name} <span className="text-slate-400">· {t.teilenummer}</span>
                </p>
                {t.beschreibung && <p className="mt-0.5 text-slate-500">{t.beschreibung}</p>}
              </div>
            ))}
            {teileDerKategorie.length === 0 && (
              <p className="text-sm text-slate-400">Noch keine Teile in dieser Kategorie.</p>
            )}
          </div>

          <NeuerTeilForm kategorieId={kategorieId} onErstellt={() => router.refresh()} />
        </div>
      )}
    </div>
  );
}

function Spalte({
  ebene,
  eintraege,
  ausgewaehlteId,
  onAuswaehlen,
  gesperrt,
  elternId,
  onErstellt,
}: {
  ebene: KategorieEbene;
  eintraege: Kategorie[];
  ausgewaehlteId: string | null;
  onAuswaehlen: (id: string) => void;
  gesperrt: boolean;
  elternId: string | null;
  onErstellt: () => void;
}) {
  const [neuerName, setNeuerName] = useState("");
  const [erstelltGerade, setErstelltGerade] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  async function hinzufuegen() {
    if (!neuerName.trim()) return;
    setErstelltGerade(true);
    setFehler(null);
    const ergebnis = await kategorieErstellen({
      name: neuerName,
      ebene,
      parentKategorieId: elternId,
    });
    setErstelltGerade(false);
    if (ergebnis.erfolg) {
      setNeuerName("");
      onErstellt();
    } else {
      setFehler(ergebnis.fehler ?? "Fehler beim Anlegen.");
    }
  }

  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <h3 className="text-xs font-semibold uppercase text-slate-500">{ebenenLabel(ebene)}</h3>

      {gesperrt ? (
        <p className="mt-2 text-xs text-slate-400">Erst darüber auswählen.</p>
      ) : (
        <>
          <div className="mt-2 space-y-1">
            {eintraege.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => onAuswaehlen(k.id)}
                className={`block w-full rounded-md px-2 py-1.5 text-left text-sm ${
                  ausgewaehlteId === k.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {k.name}
              </button>
            ))}
            {eintraege.length === 0 && (
              <p className="text-xs text-slate-400">Noch nichts angelegt.</p>
            )}
          </div>

          <div className="mt-3 flex gap-1">
            <input
              value={neuerName}
              onChange={(e) => setNeuerName(e.target.value)}
              placeholder="Neu…"
              className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
            />
            <button
              type="button"
              onClick={hinzufuegen}
              disabled={erstelltGerade}
              className="shrink-0 rounded-md bg-slate-900 px-2 py-1 text-xs text-white disabled:opacity-50"
            >
              +
            </button>
          </div>
          {fehler && <p className="mt-1 text-xs text-red-600">{fehler}</p>}
        </>
      )}
    </div>
  );
}

function NeuerTeilForm({
  kategorieId,
  onErstellt,
}: {
  kategorieId: string;
  onErstellt: () => void;
}) {
  const [name, setName] = useState("");
  const [teilenummer, setTeilenummer] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [speichert, setSpeichert] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setSpeichert(true);
    setFehler(null);
    const ergebnis = await teilErstellen({ name, teilenummer, beschreibung, kategorieId });
    setSpeichert(false);
    if (ergebnis.erfolg) {
      setName("");
      setTeilenummer("");
      setBeschreibung("");
      onErstellt();
    } else {
      setFehler(ergebnis.fehler ?? "Fehler beim Anlegen.");
    }
  }

  return (
    <form onSubmit={absenden} className="mt-4 rounded-xl bg-slate-50 p-4">
      <h3 className="text-sm font-medium text-slate-700">Neuen Teil anlegen</h3>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name des Teils"
          required
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={teilenummer}
          onChange={(e) => setTeilenummer(e.target.value)}
          placeholder="ID-Nr."
          required
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          placeholder="Beschreibung"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      {fehler && <p className="mt-2 text-xs text-red-600">{fehler}</p>}
      <button
        type="submit"
        disabled={speichert}
        className="mt-3 rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {speichert ? "Speichert …" : "Teil anlegen"}
      </button>
    </form>
  );
}

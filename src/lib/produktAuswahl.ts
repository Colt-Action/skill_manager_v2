import type { Kategorie } from "@/lib/supabase/types";

// Hilfsfunktionen für die geführte Produktauswahl der Werksbesichtigung
// (ProduktAuswahl.tsx). Bewusst getrennt von kategorieBaum.ts, das auch
// Videothek und Referenzbereich nutzen.

function gleicherName(a: string, b: string): boolean {
  return a.trim().toLocaleLowerCase("de") === b.trim().toLocaleLowerCase("de");
}

function kinder(kategorien: Kategorie[], elternId: string): Kategorie[] {
  return kategorien
    .filter((k) => k.parent_kategorie_id === elternId)
    .sort((a, b) => a.name.localeCompare(b.name, "de", { numeric: true }));
}

// Löst den Startpfad (z.B. ["Maschinenbau", "HOSCH"]) über die Namen auf und
// liefert den Hersteller-Eintrag - oder null, wenn ein Eintrag fehlt oder
// der Pfad leer ist (dann gilt die vollständige Kaskade).
export function startHerstellerFinden(kategorien: Kategorie[], startpfad: readonly string[]): Kategorie | null {
  const [industrieName, herstellerName] = startpfad;
  if (!industrieName || !herstellerName) return null;
  const industrie = kategorien.find(
    (k) => k.ebene === "industrie" && k.parent_kategorie_id === null && gleicherName(k.name, industrieName),
  );
  if (!industrie) return null;
  return (
    kategorien.find(
      (k) => k.ebene === "hersteller" && k.parent_kategorie_id === industrie.id && gleicherName(k.name, herstellerName),
    ) ?? null
  );
}

/**
 * Ist die gegebene Kategorie der Hersteller aus dem Startpfad (Maschinenbau ›
 * HOSCH, PRODUKTAUSWAHL_STARTPFAD)? Benutzt auch der Referenzbereich für das
 * Feld "Verknüpfung HOSCHiris DATA".
 */
export function istStartHersteller(
  kategorien: Kategorie[],
  startpfad: readonly string[],
  herstellerId: string | null | undefined,
): boolean {
  if (!herstellerId) return false;
  return startHerstellerFinden(kategorien, startpfad)?.id === herstellerId;
}

// Kette von der Wurzel bis zur gegebenen Kategorie (leer, wenn unbekannt).
export function kategorieKette(kategorien: Kategorie[], kategorieId: string | null): Kategorie[] {
  if (!kategorieId) return [];
  const byId = new Map(kategorien.map((k) => [k.id, k]));
  const kette: Kategorie[] = [];
  let aktuelle = byId.get(kategorieId);
  while (aktuelle) {
    kette.unshift(aktuelle);
    aktuelle = aktuelle.parent_kategorie_id ? byId.get(aktuelle.parent_kategorie_id) : undefined;
  }
  return kette;
}

export function produkteUnter(kategorien: Kategorie[], herstellerId: string): Kategorie[] {
  return kinder(kategorien, herstellerId);
}

export interface TypGruppe {
  /** Übergeordnete Kategorie als Überschrift; null = Kategorien ohne eigene Typen (sie sind selbst der Typ). */
  ueberschrift: Kategorie | null;
  typen: Kategorie[];
}

// Alle Typen eines Produkts, gruppiert nach Kategorie. Typ ist die tiefste
// vorhandene Ebene: Unterkategorien unter ihrer Kategorie; eine Kategorie
// ohne Unterkategorien ist selbst der Typ. Leere Liste = das Produkt hat
// keine Unterebene, der Typ-Schritt entfällt.
export function typGruppen(kategorien: Kategorie[], produktId: string): TypGruppe[] {
  const gruppen: TypGruppe[] = [];
  const ohneUnterebene: Kategorie[] = [];
  for (const kategorie of kinder(kategorien, produktId)) {
    const typen = kinder(kategorien, kategorie.id);
    if (typen.length > 0) gruppen.push({ ueberschrift: kategorie, typen });
    else ohneUnterebene.push(kategorie);
  }
  if (ohneUnterebene.length > 0) gruppen.push({ ueberschrift: null, typen: ohneUnterebene });
  return gruppen;
}

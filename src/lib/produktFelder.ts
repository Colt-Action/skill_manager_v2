import type { Kategorie } from "@/lib/supabase/types";

// Produktabhängige Felder - die EINZIGE Stelle, die festlegt, welche der
// Felder Abstreifsegment, Verlagerung und Ummantelung zu einem Produkt
// gehören. Benutzt vom Referenzbereich (Upload, Bearbeiten, Karte,
// Detailseite, fehlende Angaben) und von der Werksbesichtigung (Position,
// Export); die Referenz-Vorschläge (U4b) sollen sie ebenfalls verwenden.
//
// Zuordnung über den Namen der Kategorie auf Ebene "produkt", ohne Beachtung
// von Groß-/Kleinschreibung, Leerzeichen, Schrägstrichen und Bindestrichen.
// Die Namen stehen nur in der Datenbank (von Alex bestätigt, 2026-10-24:
// Allgemein, Dichtleistensystem, Digitales, Hauptabstreifer,
// Innengurtabstreifer, Lenkrolle/-station, Vorabstreifer) und lassen sich
// unter "Kategorien & Teile" ändern - bei einer Umbenennung hier anpassen.

export type ProduktFeld = "abstreifsegment" | "verlagerung" | "ummantelung";

/** Unbekanntes oder noch nicht gewähltes Produkt: wie bisher, nichts verstecken. */
const STANDARD_FELDER: readonly ProduktFeld[] = ["abstreifsegment", "verlagerung"];

const PRODUKT_REGELN: { namen: readonly string[]; felder: readonly ProduktFeld[] }[] = [
  { namen: ["Lenkrolle/Station", "Lenkrolle/-station"], felder: ["ummantelung"] },
  { namen: ["Dichtleistensystem"], felder: [] },
  { namen: ["Digitales"], felder: [] },
];

function normalisieren(name: string): string {
  return name.toLocaleLowerCase("de").replace(/[\s/\-]+/g, "");
}

const REGEL_JE_NAME = new Map(
  PRODUKT_REGELN.flatMap((regel) => regel.namen.map((name) => [normalisieren(name), regel.felder] as const)),
);

/** Geltende Felder zu einem Produktnamen (null = noch kein Produkt gewählt). */
export function felderFuerProdukt(produktName: string | null | undefined): readonly ProduktFeld[] {
  if (!produktName) return STANDARD_FELDER;
  return REGEL_JE_NAME.get(normalisieren(produktName)) ?? STANDARD_FELDER;
}

/** Produkt (Ebene "produkt") zu einer gewählten Kategorie: die Kategorie selbst oder ihr Vorfahr. */
export function produktZurKategorie(kategorien: Kategorie[], kategorieId: string | null | undefined): Kategorie | null {
  if (!kategorieId) return null;
  const byId = new Map(kategorien.map((k) => [k.id, k]));
  let aktuelle = byId.get(kategorieId);
  const gesehen = new Set<string>();
  while (aktuelle && !gesehen.has(aktuelle.id)) {
    if (aktuelle.ebene === "produkt") return aktuelle;
    gesehen.add(aktuelle.id);
    aktuelle = aktuelle.parent_kategorie_id ? byId.get(aktuelle.parent_kategorie_id) : undefined;
  }
  return null;
}

/** Geltende Felder zur (tiefsten) gewählten Kategorie, z.B. aus der Kaskade oder der Position. */
export function felderFuerKategorie(kategorien: Kategorie[], kategorieId: string | null | undefined): readonly ProduktFeld[] {
  return felderFuerProdukt(produktZurKategorie(kategorien, kategorieId)?.name);
}

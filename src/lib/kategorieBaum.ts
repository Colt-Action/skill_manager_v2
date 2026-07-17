import type { Kategorie, KategorieEbene } from "@/lib/supabase/types";

// Reihenfolge der vier Kategorie-Ebenen, von grob nach fein.
export const EBENEN_REIHENFOLGE: KategorieEbene[] = [
  "industrie",
  "hersteller",
  "produkt",
  "kategorie",
];

const EBENEN_LABEL: Record<KategorieEbene, string> = {
  industrie: "Industrie",
  hersteller: "Hersteller",
  produkt: "Produkt",
  kategorie: "Kategorie",
};

export function ebenenLabel(ebene: KategorieEbene): string {
  return EBENEN_LABEL[ebene];
}

// Kleine visuelle Orientierungshilfe je Ebene (grob -> fein), damit man beim
// Durchklicken der Kaskade auf einen Blick sieht, auf welcher Stufe man ist.
const EBENEN_ICON: Record<KategorieEbene, string> = {
  industrie: "🏭",
  hersteller: "🏷️",
  produkt: "📦",
  kategorie: "🗂️",
};

export function ebenenIcon(ebene: KategorieEbene): string {
  return EBENEN_ICON[ebene];
}

// Gibt alle direkten Kinder einer bestimmten Ebene unterhalb von elternId
// zurück (elternId=null -> oberste Ebene "industrie"), alphabetisch sortiert.
export function kinderVon(
  kategorien: Kategorie[],
  ebene: KategorieEbene,
  elternId: string | null,
): Kategorie[] {
  return kategorien
    .filter((k) => k.ebene === ebene && k.parent_kategorie_id === elternId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Liefert die Kette [industrieId, herstellerId, produktId] zu einer
// gegebenen "kategorie"-Zeile, indem parent_kategorie_id rückwärts verfolgt
// wird. Nützlich, um Auswahlfelder mit einem bestehenden Wert vorzubelegen.
export function pfadZuKategorie(
  kategorien: Kategorie[],
  kategorieId: string | null,
): (string | null)[] {
  const pfad: (string | null)[] = [null, null, null, null];
  if (!kategorieId) return pfad;

  const byId = new Map(kategorien.map((k) => [k.id, k]));
  let aktuelle = byId.get(kategorieId);
  const kette: Kategorie[] = [];
  while (aktuelle) {
    kette.unshift(aktuelle);
    aktuelle = aktuelle.parent_kategorie_id ? byId.get(aktuelle.parent_kategorie_id) : undefined;
  }
  kette.forEach((k, i) => {
    pfad[i] = k.id;
  });
  return pfad;
}

import type { Kategorie, KategorieEbene, Teil } from "@/lib/supabase/types";

// Reihenfolge der fünf Kategorie-Ebenen, von grob nach fein.
export const EBENEN_REIHENFOLGE: KategorieEbene[] = [
  "industrie",
  "hersteller",
  "produkt",
  "kategorie",
  "unterkategorie",
];

const EBENEN_LABEL: Record<KategorieEbene, string> = {
  industrie: "Industrie",
  hersteller: "Hersteller",
  produkt: "Produkt",
  kategorie: "Kategorie",
  unterkategorie: "Unterkategorie",
};

export function ebenenLabel(ebene: KategorieEbene): string {
  return EBENEN_LABEL[ebene];
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
  const pfad: (string | null)[] = EBENEN_REIHENFOLGE.map(() => null);
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

// Liefert die ID der tiefsten gesetzten Ebene eines Kaskaden-Pfads (der
// letzte gesetzte Wert, egal welche Ebene) oder null, wenn nichts gewählt ist.
export function tiefsteKategorieId(pfad: {
  industrieId: string | null;
  herstellerId: string | null;
  produktId: string | null;
  kategorieId: string | null;
  unterkategorieId: string | null;
}): string | null {
  return pfad.unterkategorieId ?? pfad.kategorieId ?? pfad.produktId ?? pfad.herstellerId ?? pfad.industrieId ?? null;
}

// Zerlegt eine gewählte Kategorie in Produkt und Typ: produkt = Name des
// Vorfahren (oder der Kategorie selbst) auf Ebene "produkt", typ = Name der
// Kategorie, wenn sie tiefer als das Produkt liegt (Kategorie/Unterkategorie),
// sonst null. name = Name der Kategorie selbst (Fallback ohne Produkt).
export function produktUndTyp(
  kategorien: Kategorie[],
  kategorieId: string | null,
): { produkt: string | null; typ: string | null; name: string | null } {
  if (!kategorieId) return { produkt: null, typ: null, name: null };
  const byId = new Map(kategorien.map((k) => [k.id, k]));
  const gewaehlt = byId.get(kategorieId);
  if (!gewaehlt) return { produkt: null, typ: null, name: null };

  let produkt: string | null = null;
  let aktuelle: Kategorie | undefined = gewaehlt;
  while (aktuelle) {
    if (aktuelle.ebene === "produkt") {
      produkt = aktuelle.name;
      break;
    }
    aktuelle = aktuelle.parent_kategorie_id ? byId.get(aktuelle.parent_kategorie_id) : undefined;
  }
  const istTiefer = gewaehlt.ebene === "kategorie" || gewaehlt.ebene === "unterkategorie";
  return { produkt, typ: istTiefer ? gewaehlt.name : null, name: gewaehlt.name };
}

// Anzeige "Produkt · Typ" (z.B. "Hauptabstreifer · B6"); nur der
// Produktname, wenn nichts tiefer gewählt ist; ohne Produkt-Vorfahren der
// Name der Kategorie selbst.
export function produktTypText(kategorien: Kategorie[], kategorieId: string | null): string | null {
  const { produkt, typ, name } = produktUndTyp(kategorien, kategorieId);
  if (produkt && typ) return `${produkt} · ${typ}`;
  return produkt ?? name;
}

// Liefert für jeden Teil einen Anzeigenamen fürs Dropdown. Da sich viele
// Geräte Teile-Namen wie "Aufnahme" oder "Block" teilen (aber es jeweils
// eigene Datensätze pro Gerät/Unterkategorie sind), wird bei mehrdeutigen
// Namen das zugehörige Gerät in Klammern angehängt - z.B. "Aufnahme (B6)".
// Eindeutige Namen bleiben unverändert.
export function teilAnzeigenamen(teile: Teil[], kategorien: Kategorie[]): Map<string, string> {
  const byId = new Map(kategorien.map((k) => [k.id, k]));
  const anzahlProName = new Map<string, number>();
  for (const teil of teile) {
    anzahlProName.set(teil.name, (anzahlProName.get(teil.name) ?? 0) + 1);
  }

  const ergebnis = new Map<string, string>();
  for (const teil of teile) {
    const mehrdeutig = (anzahlProName.get(teil.name) ?? 0) > 1;
    const geraet = teil.kategorie_id ? byId.get(teil.kategorie_id)?.name : undefined;
    ergebnis.set(teil.id, mehrdeutig && geraet ? `${teil.name} (${geraet})` : teil.name);
  }
  return ergebnis;
}

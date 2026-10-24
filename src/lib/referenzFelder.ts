import { GURTZUSTAND_SCHLUESSEL } from "@/lib/werksbesichtigungOptionen";
import { felderFuerKategorie, type ProduktFeld } from "@/lib/produktFelder";
import type { Gurtzustand, Kategorie, KategorieEbene, ReferenzMetadaten, ReferenzMitDetails } from "@/lib/supabase/types";

// Die wichtigen Felder einer Referenz (Übersichtskarte und Detailseite), in
// drei Zeilen:
//   1. Förderbandbreite · Material · Geschwindigkeit · Gurtzustand
//   2. Hersteller · Unterkategorie · Abstreifsegment · Verlagerung (je nach
//      Produkt: Ummantelung statt beider oder keines davon)
//   3. Land
// wert = null heißt "fehlt" - das Feld bleibt an seinem Platz und wird
// markiert, damit man es nachpflegen kann.

export interface ReferenzFeld {
  schluessel: string;
  label: string;
  wert: string | null;
}

function einzeln<T>(wert: T | T[] | null | undefined): T | null {
  if (!wert) return null;
  return Array.isArray(wert) ? (wert[0] ?? null) : wert;
}

export function referenzMetadaten(referenz: ReferenzMitDetails): ReferenzMetadaten | null {
  return einzeln(referenz.referenz_metadaten);
}

function textOderNull(wert: string | null | undefined): string | null {
  const text = wert?.trim();
  return text ? text : null;
}

/**
 * Sucht in der gespeicherten Kategorie der Referenz und ihren Vorfahren die
 * Kategorie einer bestimmten Ebene. Maßgeblich ist das Feld "ebene", nicht
 * die Position im Pfad. Gespeichert ist eine einzige Zuordnung
 * (referenzen.kategorie_id); ohne sie gilt wie in Filter und Suche die
 * Kategorie des zugeordneten Teils.
 */
export function kategorieDerEbene(
  referenz: ReferenzMitDetails,
  kategorien: Kategorie[],
  ebene: KategorieEbene,
): Kategorie | null {
  const byId = new Map(kategorien.map((k) => [k.id, k]));
  let aktuelle = byId.get(referenz.kategorie_id ?? referenz.teile?.kategorie_id ?? "");
  const gesehen = new Set<string>();
  while (aktuelle && !gesehen.has(aktuelle.id)) {
    if (aktuelle.ebene === ebene) return aktuelle;
    gesehen.add(aktuelle.id);
    aktuelle = aktuelle.parent_kategorie_id ? byId.get(aktuelle.parent_kategorie_id) : undefined;
  }
  return null;
}

const PRODUKT_FELD_LABEL: Record<ProduktFeld, string> = {
  abstreifsegment: "referenzvideos.abstreifsegment",
  verlagerung: "referenzvideos.verlagerung",
  ummantelung: "upload.ummantelung",
};

/** Geschwindigkeit in m/s; null und 0 gelten als fehlend (nie "0.0 m/s"). */
export function geschwindigkeitAnzeige(wert: number | null | undefined): string | null {
  return wert ? `${wert.toFixed(1)} m/s` : null;
}

export function referenzFelder(
  referenz: ReferenzMitDetails,
  kategorien: Kategorie[],
  tx: (schluessel: string) => string,
): ReferenzFeld[][] {
  const d = referenzMetadaten(referenz);
  const material = d?.material === "Sonstiges" ? textOderNull(d.material_sonstiges) ?? d.material : textOderNull(d?.material);
  const gurtzustand =
    d?.gurtzustand && d.gurtzustand in GURTZUSTAND_SCHLUESSEL
      ? tx(GURTZUSTAND_SCHLUESSEL[d.gurtzustand as Gurtzustand])
      : null;

  return [
    [
      { schluessel: "foerderbandbreite", label: tx("bericht.bandbreite"), wert: textOderNull(d?.foerderbandbreite) },
      { schluessel: "material", label: tx("referenzvideos.material"), wert: material },
      { schluessel: "geschwindigkeit", label: tx("bericht.geschwindigkeit"), wert: geschwindigkeitAnzeige(d?.geschwindigkeit_ms) },
      { schluessel: "gurtzustand", label: tx("foerderband.gurtzustand"), wert: gurtzustand },
    ],
    [
      {
        schluessel: "hersteller",
        label: tx("referenzbereich.hersteller"),
        wert: kategorieDerEbene(referenz, kategorien, "hersteller")?.name ?? null,
      },
      {
        schluessel: "unterkategorie",
        label: tx("referenzbereich.unterkategorie"),
        wert: kategorieDerEbene(referenz, kategorien, "unterkategorie")?.name ?? null,
      },
      // Nur die zum Produkt geltenden Felder (lib/produktFelder.ts). Gespeicherte
      // Werte nicht geltender Felder bleiben in der Datenbank, werden hier aber
      // weder angezeigt noch als fehlend gezählt.
      ...felderFuerKategorie(kategorien, referenz.kategorie_id ?? referenz.teile?.kategorie_id).map((feld) => ({
        schluessel: feld,
        label: tx(PRODUKT_FELD_LABEL[feld]),
        wert: textOderNull(d?.[feld]),
      })),
    ],
    [{ schluessel: "land", label: tx("referenzvideos.land"), wert: textOderNull(d?.land) }],
  ];
}

/** Anzahl der fehlenden wichtigen Angaben. */
export function fehlendeAngaben(zeilen: ReferenzFeld[][]): number {
  return zeilen.flat().filter((f) => f.wert === null).length;
}

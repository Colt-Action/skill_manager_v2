import { FOERDERBANDBREITE_OPTIONEN } from "@/lib/referenzvideoOptionen";
import { produktZurKategorie } from "@/lib/produktFelder";
import type { BandFelder } from "@/lib/werksbesichtigungAenderungen";
import type { FoerderbandEintrag, Kategorie, ReferenzMetadaten } from "@/lib/supabase/types";

// Referenz-Vorschläge ("Vergleichbare Installationen") für eine Position der
// Werksbesichtigung - reine Logik ohne Datenbankzugriff. Die Vorschläge sind
// eine Hilfe und tragen nichts in die Position ein.
//
// Kandidaten: nur veröffentlichte Referenzen desselben Produkts (Ebene
// "produkt" im Kategorie-Pfad, lib/produktFelder.ts) - der Typ der Position
// darf noch offen sein. Innerhalb des Produkts entscheidet die Ähnlichkeit
// der Bandbedingungen.

export type BedingungsFeld = "material" | "foerderbandbreite" | "geschwindigkeit" | "beltConnection" | "gurtzustand";

/** Reihenfolge für Anzeige und für den Hinweis "was noch fehlt". */
export const BEDINGUNGS_FELDER: readonly BedingungsFeld[] = [
  "material",
  "foerderbandbreite",
  "geschwindigkeit",
  "beltConnection",
  "gurtzustand",
];

/**
 * Gewichte (Höchstpunkte je Bedingung, zusammen 110). Material und
 * Gurtverbindung bestimmen am stärksten, wie ein Abstreifer arbeitet (Anhaftung,
 * Verbindungsstelle), daher hoch; Bandbreite und Geschwindigkeit sind über
 * Klassen bzw. Toleranzen ähnlich vergleichbar; der Gurtzustand ist eine
 * Momentaufnahme und zählt mittel.
 */
export const GEWICHTE: Record<BedingungsFeld, number> = {
  material: 30,
  beltConnection: 25,
  foerderbandbreite: 20,
  geschwindigkeit: 20,
  gurtzustand: 15,
};

/**
 * Mindestpunktzahl für einen Treffer: mehr als eine einzelne Übereinstimmung,
 * z.B. Material + Nachbarklasse der Bandbreite (40) oder Gurtverbindung +
 * Gurtzustand (40); Material allein (30) reicht nicht.
 */
export const MINDESTPUNKTE = 35;

/** Mindestens so viele Bandbedingungen müssen eingetragen sein. */
export const MINDEST_BEDINGUNGEN = 2;

export const MAX_TREFFER = 3;

/** Geschwindigkeit: volle Punkte bis max(0,5 m/s; 20 %), keine Punkte ab max(1,5 m/s; 50 %), dazwischen linear. */
export function geschwindigkeitsGrenzen(bandWert: number): { voll: number; null: number } {
  return { voll: Math.max(0.5, bandWert * 0.2), null: Math.max(1.5, bandWert * 0.5) };
}

export interface BandBedingungen {
  material: string | null;
  materialSonstiges: string | null;
  foerderbandbreite: string | null;
  /** null und 0 = keine Angabe. */
  geschwindigkeit: number | null;
  beltConnection: string | null;
  gurtzustand: string | null;
}

function text(wert: string | null | undefined): string | null {
  const t = wert?.trim();
  return t ? t : null;
}

/** Aus den aktuellen Formularwerten (Overlay, auch ungespeichert). */
export function bandBedingungenAusFeldern(band: BandFelder): BandBedingungen {
  return {
    material: text(band.material),
    materialSonstiges: text(band.materialSonstiges),
    foerderbandbreite: text(band.foerderbandbreite),
    geschwindigkeit: band.geschwindigkeit || null,
    beltConnection: text(band.beltConnection),
    gurtzustand: text(band.gurtzustand),
  };
}

/** Aus dem gespeicherten Stand (Export). */
export function bandBedingungenAusEintrag(band: FoerderbandEintrag): BandBedingungen {
  return {
    material: text(band.material),
    materialSonstiges: text(band.material_sonstiges),
    foerderbandbreite: text(band.foerderbandbreite),
    geschwindigkeit: band.geschwindigkeit_ms || null,
    beltConnection: text(band.belt_connection),
    gurtzustand: text(band.gurtzustand),
  };
}

export type VorschlagMetadaten = Pick<
  ReferenzMetadaten,
  | "material"
  | "material_sonstiges"
  | "foerderbandbreite"
  | "geschwindigkeit_ms"
  | "belt_connection"
  | "gurtzustand"
  | "land"
  | "abstreifsegment"
  | "verlagerung"
  | "ummantelung"
>;

/** Die für Vorschläge nötigen Felder einer Referenz (siehe lib/actions/vorschlaege.ts). */
export interface VorschlagReferenz {
  id: string;
  erstellt_am: string;
  /** Fehlt der Status, gilt die Referenz als bereits gefiltert (nur veröffentlichte geladen). */
  status?: string;
  kategorie_id: string | null;
  teile?: { kategorie_id: string | null } | { kategorie_id: string | null }[] | null;
  referenz_metadaten?: VorschlagMetadaten | VorschlagMetadaten[] | null;
}

function einzeln<T>(wert: T | T[] | null | undefined): T | null {
  if (!wert) return null;
  return Array.isArray(wert) ? (wert[0] ?? null) : wert;
}

export function vorschlagMetadaten(referenz: VorschlagReferenz): VorschlagMetadaten | null {
  return einzeln(referenz.referenz_metadaten);
}

/** Kategorie der Referenz (wie im Referenzbereich: eigene, sonst die des Teils). */
export function vorschlagKategorieId(referenz: VorschlagReferenz): string | null {
  return referenz.kategorie_id ?? einzeln(referenz.teile)?.kategorie_id ?? null;
}

export interface Grund {
  feld: BedingungsFeld;
  /** gleich = volle Punkte, nah = Teilpunkte, abweichend = 0, keineAngabe = Band oder Referenz ohne Wert. */
  art: "gleich" | "nah" | "abweichend" | "keineAngabe";
  punkte: number;
  band: string | number | null;
  referenz: string | number | null;
}

export interface Treffer {
  referenz: VorschlagReferenz;
  punkte: number;
  gruende: Grund[];
  /** Anzahl der fünf Bedingungen, die die Referenz angibt (für Gleichstand). */
  vollstaendigkeit: number;
}

export type VorschlagErgebnis =
  | { status: "ok"; treffer: Treffer[] }
  | { status: "produktFehlt" }
  /** fehlend = Felder, die noch eingetragen werden sollten (in BEDINGUNGS_FELDER-Reihenfolge). */
  | { status: "bedingungenUnvollstaendig"; fehlend: BedingungsFeld[] };

function bandWert(band: BandBedingungen, feld: BedingungsFeld): string | number | null {
  if (feld === "material") return band.material === "Sonstiges" ? (band.materialSonstiges ?? band.material) : band.material;
  if (feld === "geschwindigkeit") return band.geschwindigkeit || null;
  return band[feld];
}

function referenzWert(d: VorschlagMetadaten | null, feld: BedingungsFeld): string | number | null {
  if (!d) return null;
  switch (feld) {
    case "material":
      return d.material === "Sonstiges" ? (text(d.material_sonstiges) ?? d.material) : text(d.material);
    case "foerderbandbreite":
      return text(d.foerderbandbreite);
    case "geschwindigkeit":
      return d.geschwindigkeit_ms || null;
    case "beltConnection":
      return text(d.belt_connection);
    case "gurtzustand":
      return text(d.gurtzustand);
  }
}

function vergleichen(band: BandBedingungen, d: VorschlagMetadaten | null, feld: BedingungsFeld): Grund {
  const b = bandWert(band, feld);
  const r = referenzWert(d, feld);
  const gewicht = GEWICHTE[feld];
  const grund = (art: Grund["art"], punkte: number): Grund => ({ feld, art, punkte, band: b, referenz: r });

  if (b === null || r === null) return grund("keineAngabe", 0);

  if (feld === "material") {
    const bandSonstiges = band.material === "Sonstiges";
    const refSonstiges = d?.material === "Sonstiges";
    if (bandSonstiges || refSonstiges) {
      // "Sonstiges" ist nur gleich, wenn der Freitext übereinstimmt; ohne
      // Freitext auf einer Seite ist das Material unbekannt.
      const bandText = bandSonstiges ? band.materialSonstiges : null;
      const refText = refSonstiges ? text(d?.material_sonstiges) : null;
      if (bandSonstiges && refSonstiges) {
        if (!bandText || !refText) return grund("keineAngabe", 0);
        return bandText.toLocaleLowerCase("de") === refText.toLocaleLowerCase("de")
          ? grund("gleich", gewicht)
          : grund("abweichend", 0);
      }
      return grund("abweichend", 0);
    }
    return b === r ? grund("gleich", gewicht) : grund("abweichend", 0);
  }

  if (feld === "foerderbandbreite") {
    if (b === r) return grund("gleich", gewicht);
    const liste = FOERDERBANDBREITE_OPTIONEN as readonly string[];
    const ib = liste.indexOf(String(b));
    const ir = liste.indexOf(String(r));
    if (ib >= 0 && ir >= 0 && Math.abs(ib - ir) === 1) return grund("nah", gewicht / 2);
    return grund("abweichend", 0);
  }

  if (feld === "geschwindigkeit") {
    const v = Number(b);
    const diff = Math.abs(Number(r) - v);
    const grenzen = geschwindigkeitsGrenzen(v);
    if (diff < 0.05) return grund("gleich", gewicht);
    if (diff <= grenzen.voll) return grund("nah", gewicht);
    if (diff >= grenzen.null) return grund("abweichend", 0);
    const punkte = (gewicht * (grenzen.null - diff)) / (grenzen.null - grenzen.voll);
    return grund("nah", Math.round(punkte * 10) / 10);
  }

  // Gurtverbindung, Gurtzustand: nur gleich oder nicht.
  return b === r ? grund("gleich", gewicht) : grund("abweichend", 0);
}

export function referenzVorschlaege({
  band,
  produktKategorieId,
  kategorien,
  referenzen,
  maxTreffer = MAX_TREFFER,
}: {
  band: BandBedingungen;
  /** Tiefste gewählte Kategorie der Position (Produkt oder Typ). */
  produktKategorieId: string | null;
  kategorien: Kategorie[];
  referenzen: VorschlagReferenz[];
  maxTreffer?: number;
}): VorschlagErgebnis {
  const produkt = produktZurKategorie(kategorien, produktKategorieId);
  if (!produkt) return { status: "produktFehlt" };

  const vorhanden = BEDINGUNGS_FELDER.filter((feld) => bandWert(band, feld) !== null);
  if (vorhanden.length < MINDEST_BEDINGUNGEN) {
    const fehlend = BEDINGUNGS_FELDER.filter((feld) => !vorhanden.includes(feld)).slice(
      0,
      MINDEST_BEDINGUNGEN - vorhanden.length,
    );
    return { status: "bedingungenUnvollstaendig", fehlend };
  }

  const treffer: Treffer[] = [];
  for (const referenz of referenzen) {
    if (referenz.status !== undefined && referenz.status !== "veroeffentlicht") continue;
    if (produktZurKategorie(kategorien, vorschlagKategorieId(referenz))?.id !== produkt.id) continue;
    const d = vorschlagMetadaten(referenz);
    const gruende = BEDINGUNGS_FELDER.map((feld) => vergleichen(band, d, feld));
    const punkte = Math.round(gruende.reduce((summe, g) => summe + g.punkte, 0) * 10) / 10;
    if (punkte < MINDESTPUNKTE) continue;
    const vollstaendigkeit = BEDINGUNGS_FELDER.filter((feld) => referenzWert(d, feld) !== null).length;
    treffer.push({ referenz, punkte, gruende, vollstaendigkeit });
  }

  // Gleiche Punktzahl: zuerst die vollständigeren Daten, dann die neuere Referenz.
  treffer.sort(
    (a, b) =>
      b.punkte - a.punkte ||
      b.vollstaendigkeit - a.vollstaendigkeit ||
      b.referenz.erstellt_am.localeCompare(a.referenz.erstellt_am),
  );
  return { status: "ok", treffer: treffer.slice(0, maxTreffer) };
}

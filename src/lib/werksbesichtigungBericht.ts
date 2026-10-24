import { t } from "@/lib/i18n/t";
import type { Sprache } from "@/lib/i18n/sprachen";
import { produktTypText } from "@/lib/kategorieBaum";
import { GURTZUSTAND_SCHLUESSEL, POSITION_SCHLUESSEL } from "@/lib/werksbesichtigungOptionen";
import { felderFuerKategorie, produktZurKategorie, type ProduktFeld } from "@/lib/produktFelder";
import {
  bandBedingungenAusEintrag,
  referenzVorschlaege,
  trefferAnzeige,
  type VorschlagReferenz,
} from "@/lib/referenzVorschlaege";
import type { FoerderbandEintragMitDetails, Kategorie, Werksbesichtigung } from "@/lib/supabase/types";

// Berichtsmodell der Werksbesichtigung: eine einzige Stelle, die aus den
// gespeicherten Daten fertige Texte in der gewählten Sprache macht. PDF
// (werksbesichtigungPdf.ts) und Word (werksbesichtigungDocx.ts) zeichnen nur
// noch dieses Modell - dadurch haben beide Formate dieselbe Struktur und
// dieselben Beschriftungen.
//
// Gespeicherte Werte und Freitexte (Material, Gurtverbindung, Kategorienamen,
// Notizen, Konfiguration ...) werden nicht übersetzt, nur die Beschriftungen
// und die festen Auswahlwerte mit Wörterbuch-Schlüssel (Position, Gurtzustand,
// Status).

const PRODUKT_FELD_SCHLUESSEL: Record<ProduktFeld, string> = {
  abstreifsegment: "upload.abstreifsegment",
  verlagerung: "upload.verlagerung",
  ummantelung: "upload.ummantelung",
};

/** Platzhalter für leere Felder - leere Felder werden nicht weggelassen. */
export const LEER = "–";

/**
 * Spaltenbreiten der Übersichtstabelle in mm (Summe = Satzbreite 174 mm),
 * für PDF und Word. Gemessen am längsten Wort der Spaltenköpfe aller
 * lateinischen Sprachen, damit kein Kopf mitten im Wort umbricht.
 */
export const UEBERSICHT_SPALTEN_MM = [7, 28, 25, 21, 25, 25, 26, 17];

export interface BerichtFeld {
  /** Fertige Beschriftung (bei lateinischer Schrift in Versalien). */
  label: string;
  wert: string;
}

export interface BerichtPosition {
  /** Positionsname, bei "Freifeld" der Freitext. */
  titel: string;
  produktLabel: string;
  /** "Produkt · Typ", nur "Produkt" oder LEER. */
  produkt: string;
  /**
   * Die zum Produkt geltenden Felder (lib/produktFelder.ts): Abstreifsegment
   * und Verlagerung, bei Lenkrolle/-station nur Ummantelung, bei
   * Dichtleistensystem/Digitales keines (leere Liste).
   */
  felder: BerichtFeld[];
  /** Gewünschte Konfiguration (immer vorhanden). */
  konfiguration: BerichtFeld;
  /**
   * Vergleichbare Installationen (nur wenn beim Export eingeschaltet und es
   * Treffer gibt, sonst null): bis zu drei Zeilen ohne Referenztitel und Links.
   */
  vergleiche: { label: string; zeilen: BerichtVergleichZeile[] } | null;
}

export interface BerichtVergleichZeile {
  /** "Produkt · Typ · Land". */
  kopf: string;
  /** "Material: Kohle · Bandbreite: 1200-1400mm · …" (fehlende Werte als LEER). */
  angaben: string;
  /** Einzeilige Zusammenfassung ohne Beschriftungen: "Produkt · Typ · Land · Kohle · 1200-1400mm · …". */
  kurz: string;
}

export interface BerichtFoto {
  url: string;
  unterschrift: string;
}

export interface BerichtBand {
  /** Laufende Nummer als Text ("1", "2" ...). */
  nummer: string;
  /** "Förderband 1" in der gewählten Sprache. */
  titel: string;
  idLabel: string;
  /** Förderband-ID oder LEER. */
  id: string;
  felder: BerichtFeld[];
  notizen: BerichtFeld;
  positionenTitel: string;
  positionen: BerichtPosition[];
  keinePositionen: string;
  fotosTitel: string;
  fotos: BerichtFoto[];
  keineFotos: string;
}

export interface BerichtModell {
  sprache: Sprache;
  /** Chinesisch/Japanisch: eigene Schrift, keine Versalien. */
  cjk: boolean;
  titel: string;
  kunde: string;
  /** Datum bzw. Zeitraum der Besichtigung, fertig formatiert. */
  zeitraum: string;
  deckblatt: BerichtFeld[];
  uebersichtTitel: string;
  uebersicht: { spalten: string[]; zeilen: string[][] };
  keineBaender: string;
  notizen: BerichtFeld;
  baender: BerichtBand[];
  texte: {
    fotoNichtVerfuegbar: string;
    /** Linker Teil der Fußzeile: "Werksbesichtigung · Kunde". */
    fusszeile: string;
    /** "Seite {x} von {y}" in der gewählten Sprache. */
    seiteVorlage: string;
  };
  /** Dateiname ohne Endung. */
  dateiname: string;
}

export interface BerichtEingabe {
  besuch: Werksbesichtigung;
  eintraege: FoerderbandEintragMitDetails[];
  kategorien: Kategorie[];
  erstellerName: string | null;
  sprache: Sprache;
  /** Zeitpunkt des Exports (für Tests von außen setzbar). */
  exportiertAm?: Date;
  /**
   * Referenzen je Produkt-ID für "Vergleichbare Installationen" (Schalter beim
   * Export). Fehlt die Angabe, enthält der Bericht keine Vorschläge. Bewertet
   * wird mit dem gespeicherten Stand der Bänder.
   */
  vorschlagReferenzen?: Record<string, VorschlagReferenz[]>;
}

export function istCjk(sprache: Sprache): boolean {
  return sprache === "zh" || sprache === "ja";
}

function wertOderLeer(wert: string | null | undefined): string {
  const text = wert?.trim();
  return text ? text : LEER;
}

// "YYYY-MM-DD" als lokales Datum lesen - new Date("2026-10-24") wäre UTC und
// könnte je nach Zeitzone auf den Vortag fallen.
function datumLesen(wert: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(wert);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(wert);
  return Number.isNaN(d.getTime()) ? null : d;
}

function datumFormatieren(wert: string | Date | null | undefined, sprache: Sprache): string | null {
  if (!wert) return null;
  const d = wert instanceof Date ? wert : datumLesen(wert);
  if (!d) return null;
  return new Intl.DateTimeFormat(sprache, { year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** Geschwindigkeit in m/s mit einer Nachkommastelle; null und 0 = nicht angegeben. */
export function geschwindigkeitText(wert: number | null, sprache: Sprache): string {
  if (!wert) return LEER;
  const zahl = new Intl.NumberFormat(sprache, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(wert);
  return `${zahl} m/s`;
}

export function berichtModellErstellen({
  besuch,
  eintraege,
  kategorien,
  erstellerName,
  sprache,
  exportiertAm = new Date(),
  vorschlagReferenzen,
}: BerichtEingabe): BerichtModell {
  const cjk = istCjk(sprache);
  const tx = (schluessel: string, variablen?: Record<string, string>) => t(schluessel, sprache, variablen);
  // Feldlabels in Versalien - nur bei lateinischer Schrift.
  const label = (schluessel: string) => (cjk ? tx(schluessel) : tx(schluessel).toLocaleUpperCase(sprache));

  // Vergleichbare Installationen je Position (gleiche Logik wie im Editor,
  // lib/referenzVorschlaege.ts), mit dem gespeicherten Stand des Bands. Ohne
  // Treffer: null - die Karte bleibt dann wie bisher, ohne Leerzeile.
  function vergleicheFuer(eintrag: FoerderbandEintragMitDetails, produktKategorieId: string | null): BerichtPosition["vergleiche"] {
    if (!vorschlagReferenzen) return null;
    const produkt = produktZurKategorie(kategorien, produktKategorieId);
    if (!produkt) return null;
    const ergebnis = referenzVorschlaege({
      band: bandBedingungenAusEintrag(eintrag),
      produktKategorieId,
      kategorien,
      referenzen: vorschlagReferenzen[produkt.id] ?? [],
    });
    if (ergebnis.status !== "ok" || ergebnis.treffer.length === 0) return null;
    return {
      label: label("vorschlaege.titel"),
      zeilen: ergebnis.treffer.map((treffer) => {
        const anzeige = trefferAnzeige(treffer, kategorien, sprache, tx);
        return {
          kopf: [anzeige.produktTyp ?? LEER, anzeige.land ?? LEER].join(" · "),
          angaben: [...anzeige.bedingungen, ...anzeige.produktFelder]
            .map((feld) => `${feld.label}: ${feld.wert ?? LEER}`)
            .join(" · "),
          kurz: [
            anzeige.produktTyp ?? LEER,
            anzeige.land ?? LEER,
            ...[...anzeige.bedingungen, ...anzeige.produktFelder].map((feld) => feld.wert ?? LEER),
          ].join(" · "),
        };
      }),
    };
  }

  const von = datumFormatieren(besuch.datum, sprache);
  const bis = datumFormatieren(besuch.datum_bis, sprache);
  const zeitraum = von && bis && bis !== von ? `${von} – ${bis}` : (von ?? LEER);

  const deckblatt: BerichtFeld[] = [
    { label: label("werksbesichtigungen.kunde"), wert: wertOderLeer(besuch.kunde) },
    { label: label("bericht.partner"), wert: wertOderLeer(besuch.partner) },
    { label: label("werksbesichtigungen.ort"), wert: wertOderLeer(besuch.ort) },
    { label: label(bis && bis !== von ? "bericht.zeitraum" : "werksbesichtigungen.datum"), wert: zeitraum },
    { label: label("bericht.ersteller"), wert: wertOderLeer(erstellerName) },
    {
      label: label("bericht.status"),
      wert: tx(besuch.status === "abgeschlossen" ? "werksbesichtigungen.statusAbgeschlossen" : "werksbesichtigungen.statusEntwurf"),
    },
    { label: label("bericht.exportdatum"), wert: datumFormatieren(exportiertAm, sprache) ?? LEER },
  ];

  const baender: BerichtBand[] = eintraege.map((eintrag, index) => {
    const nummer = String(index + 1);
    const id = wertOderLeer(eintrag.bezeichnung);
    // Bei "Sonstiges" der Freitext; fehlt er, bleibt "Sonstiges" stehen.
    const material = wertOderLeer(
      eintrag.material === "Sonstiges" ? eintrag.material_sonstiges?.trim() || eintrag.material : eintrag.material,
    );

    const positionen: BerichtPosition[] = eintrag.foerderband_positionen.map((pos) => ({
      titel:
        pos.position === "freifeld"
          ? pos.position_freitext?.trim() || tx(POSITION_SCHLUESSEL.freifeld)
          : tx(POSITION_SCHLUESSEL[pos.position] ?? pos.position),
      produktLabel: label("foerderband.produktKurz"),
      // Tiefste gespeicherte Ebene (U2a): "Produkt · Typ" oder nur das Produkt.
      produkt: wertOderLeer(produktTypText(kategorien, pos.produkt_kategorie_id) ?? pos.kategorien?.name),
      // Nur die zum Produkt geltenden Felder; leere geltende Felder als "–".
      // Werte wie gespeichert (technische Auswahlwerte, nicht übersetzt).
      felder: felderFuerKategorie(kategorien, pos.produkt_kategorie_id).map((feld) => ({
        label: label(PRODUKT_FELD_SCHLUESSEL[feld]),
        wert: wertOderLeer(pos[feld]),
      })),
      konfiguration: { label: label("foerderband.konfiguration"), wert: wertOderLeer(pos.konfiguration) },
      vergleiche: vergleicheFuer(eintrag, pos.produkt_kategorie_id),
    }));

    const bandName = id !== LEER ? id : tx("foerderband.bandKurz", { nummer });

    return {
      nummer,
      titel: tx("foerderband.nummer", { nummer }),
      idLabel: label("foerderband.bezeichnung"),
      id,
      felder: [
        { label: label("referenzvideos.material"), wert: material },
        { label: label("bericht.bandbreite"), wert: wertOderLeer(eintrag.foerderbandbreite) },
        { label: label("bericht.geschwindigkeit"), wert: geschwindigkeitText(eintrag.geschwindigkeit_ms, sprache) },
        { label: label("referenzvideos.beltConnection"), wert: wertOderLeer(eintrag.belt_connection) },
        {
          label: label("foerderband.gurtzustand"),
          wert: eintrag.gurtzustand ? tx(GURTZUSTAND_SCHLUESSEL[eintrag.gurtzustand]) : LEER,
        },
        { label: label("foerderband.schurrenMasse"), wert: wertOderLeer(eintrag.schurren_masse) },
      ],
      notizen: { label: label("bericht.notizen"), wert: wertOderLeer(eintrag.notizen) },
      positionenTitel: tx("foerderband.positionen"),
      positionen,
      keinePositionen: tx("bericht.keinePositionen"),
      fotosTitel: tx("foerderband.fotos"),
      fotos: eintrag.foerderband_fotos.map((foto, i) => ({
        url: foto.foto_url,
        unterschrift: tx("bericht.fotoUnterschrift", { nummer: String(i + 1), id: bandName }),
      })),
      keineFotos: tx("bericht.keineFotos"),
    };
  });

  const uebersicht = {
    spalten: [
      label("bericht.nr"),
      label("foerderband.bezeichnung"),
      label("referenzvideos.material"),
      label("bericht.bandbreite"),
      label("bericht.geschwindigkeit"),
      label("referenzvideos.beltConnection"),
      label("foerderband.gurtzustand"),
      label("bericht.positionenAnzahl"),
    ],
    zeilen: baender.map((band) => [
      band.nummer,
      band.id,
      ...band.felder.slice(0, 5).map((f) => f.wert),
      String(band.positionen.length),
    ]),
  };

  const titel = tx("bericht.titel");
  const kunde = wertOderLeer(besuch.kunde);

  return {
    sprache,
    cjk,
    titel,
    kunde,
    zeitraum,
    deckblatt,
    uebersichtTitel: tx("bericht.uebersicht"),
    uebersicht,
    keineBaender: tx("bericht.keineBaender"),
    notizen: { label: label("werksbesichtigungen.notizen"), wert: wertOderLeer(besuch.notizen) },
    baender,
    texte: {
      fotoNichtVerfuegbar: tx("bericht.fotoNichtVerfuegbar"),
      fusszeile: `${titel} · ${kunde}`,
      seiteVorlage: tx("bericht.seite"),
    },
    dateiname: `Werksbesichtigung-${besuch.kunde.replace(/[^\p{L}\p{N}]+/gu, "-")}-${besuch.datum}`,
  };
}

/**
 * Zerlegt "Seite {x} von {y}" in Textteile und Platzhalter, damit Word die
 * Seitenzahl-Felder an der richtigen Stelle einsetzen kann (die Wortstellung
 * unterscheidet sich je Sprache).
 */
export function seiteVorlageTeile(vorlage: string): Array<string | { feld: "x" | "y" }> {
  return vorlage
    .split(/(\{x\}|\{y\})/)
    .filter((teil) => teil !== "")
    .map((teil) => (teil === "{x}" ? { feld: "x" } : teil === "{y}" ? { feld: "y" } : teil));
}

// ---------------------------------------------------------------------------
// Fotos: Laden und echtes Seitenverhältnis lesen
// ---------------------------------------------------------------------------

export interface BerichtBild {
  daten: Uint8Array;
  format: "JPEG" | "PNG";
  breite: number;
  hoehe: number;
}

// Liest Breite und Höhe aus dem Dateikopf (JPEG: SOF-Segment, PNG: IHDR),
// ohne das Bild zu dekodieren - funktioniert im Browser und in Node gleich.
export function bildMasseLesen(daten: Uint8Array): Omit<BerichtBild, "daten"> | null {
  if (daten.length > 24 && daten[0] === 0x89 && daten[1] === 0x50 && daten[2] === 0x4e && daten[3] === 0x47) {
    const breite = (daten[16] << 24) | (daten[17] << 16) | (daten[18] << 8) | daten[19];
    const hoehe = (daten[20] << 24) | (daten[21] << 16) | (daten[22] << 8) | daten[23];
    return breite > 0 && hoehe > 0 ? { format: "PNG", breite, hoehe } : null;
  }
  if (daten.length > 4 && daten[0] === 0xff && daten[1] === 0xd8) {
    let i = 2;
    while (i + 9 < daten.length) {
      if (daten[i] !== 0xff) {
        i += 1;
        continue;
      }
      const marker = daten[i + 1];
      // Füllbytes und Marker ohne Länge überspringen.
      if (marker === 0xff || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
        i += marker === 0xff ? 1 : 2;
        continue;
      }
      const laenge = (daten[i + 2] << 8) | daten[i + 3];
      const istSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (istSof) {
        const hoehe = (daten[i + 5] << 8) | daten[i + 6];
        const breite = (daten[i + 7] << 8) | daten[i + 8];
        return breite > 0 && hoehe > 0 ? { format: "JPEG", breite, hoehe } : null;
      }
      i += 2 + laenge;
    }
  }
  return null;
}

async function bildPerFetch(url: string): Promise<Uint8Array | null> {
  const antwort = await fetch(url);
  if (!antwort.ok) return null;
  return new Uint8Array(await antwort.arrayBuffer());
}

/**
 * Lädt alle Fotos des Berichts. Ein Foto, das nicht geladen oder gelesen
 * werden kann, wird als null geführt (im Bericht: "Foto nicht verfügbar") -
 * der Export bricht deswegen nicht ab.
 */
export async function berichtFotosLaden(
  modell: BerichtModell,
  laden: (url: string) => Promise<Uint8Array | null> = bildPerFetch,
): Promise<Map<string, BerichtBild | null>> {
  const urls = [...new Set(modell.baender.flatMap((b) => b.fotos.map((f) => f.url)))];
  const ergebnis = new Map<string, BerichtBild | null>();
  await Promise.all(
    urls.map(async (url) => {
      try {
        const daten = await laden(url);
        const masse = daten ? bildMasseLesen(daten) : null;
        ergebnis.set(url, daten && masse ? { daten, ...masse } : null);
      } catch {
        ergebnis.set(url, null);
      }
    }),
  );
  return ergebnis;
}

/** Größtes Rechteck im Seitenverhältnis des Bildes innerhalb von maxBreite × maxHoehe. */
export function bildEinpassen(bild: { breite: number; hoehe: number }, maxBreite: number, maxHoehe: number) {
  const faktor = Math.min(maxBreite / bild.breite, maxHoehe / bild.hoehe);
  return { breite: bild.breite * faktor, hoehe: bild.hoehe * faktor };
}

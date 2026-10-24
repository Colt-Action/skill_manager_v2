import type {
  FoerderbandEintrag,
  FoerderbandPosition,
  FoerderbandPositionEintrag,
  Werksbesichtigung,
} from "@/lib/supabase/types";

// Formularwerte der Werksbesichtigung im Format der Oberfläche (leere
// Auswahl = "", nicht angegebene Geschwindigkeit = null). Der
// WerksbesichtigungEditor hält davon nur die Änderungen gegenüber dem
// gespeicherten Stand; werksbesichtigungSpeichern wandelt sie in
// Datenbankspalten um.

export interface BerichtFelder {
  kunde: string;
  partner: string;
  ort: string;
  datum: string;
  datumBis: string;
  notizen: string;
}

export interface BandFelder {
  bezeichnung: string;
  material: string;
  materialSonstiges: string;
  foerderbandbreite: string;
  beltConnection: string;
  gurtzustand: string;
  geschwindigkeit: number | null;
  schurrenMasse: string;
  notizen: string;
}

export interface PositionFelder {
  position: FoerderbandPosition;
  positionFreitext: string;
  produktKategorieId: string | null;
  abstreifsegment: string;
  verlagerung: string;
  /** Nur bei Lenkrolle/-station (lib/produktFelder.ts). */
  ummantelung: string;
  konfiguration: string;
}

export interface Aenderungen {
  bericht: Partial<BerichtFelder>;
  baender: Record<string, Partial<BandFelder>>;
  positionen: Record<string, Partial<PositionFelder>>;
}

export const KEINE_AENDERUNGEN: Aenderungen = { bericht: {}, baender: {}, positionen: {} };

export function berichtFelderAus(besuch: Werksbesichtigung): BerichtFelder {
  return {
    kunde: besuch.kunde,
    partner: besuch.partner ?? "",
    ort: besuch.ort ?? "",
    datum: besuch.datum,
    datumBis: besuch.datum_bis ?? "",
    notizen: besuch.notizen,
  };
}

export function bandFelderAus(band: FoerderbandEintrag): BandFelder {
  return {
    bezeichnung: band.bezeichnung,
    material: band.material ?? "",
    materialSonstiges: band.material_sonstiges ?? "",
    foerderbandbreite: band.foerderbandbreite ?? "",
    beltConnection: band.belt_connection ?? "",
    gurtzustand: band.gurtzustand ?? "",
    // 0 stammt aus der Zeit, als der Regler bei 0 startete, und gilt als
    // "nicht angegeben" (wird beim nächsten Speichern zu null).
    geschwindigkeit: band.geschwindigkeit_ms || null,
    schurrenMasse: band.schurren_masse ?? "",
    notizen: band.notizen,
  };
}

export function positionFelderAus(position: FoerderbandPositionEintrag): PositionFelder {
  return {
    position: position.position,
    positionFreitext: position.position_freitext ?? "",
    produktKategorieId: position.produkt_kategorie_id,
    abstreifsegment: position.abstreifsegment ?? "",
    verlagerung: position.verlagerung ?? "",
    ummantelung: position.ummantelung ?? "",
    konfiguration: position.konfiguration,
  };
}

// Ergebnis von werksbesichtigungSpeichern: je Eintrag ok oder ein Fehler mit
// Art, id, lesbarer Nummer ("Förderband 2", "Position 1 an Förderband 2")
// und Meldung.
export type SpeicherArt = "bericht" | "band" | "position";

export interface SpeicherFehler {
  art: SpeicherArt;
  id: string;
  nummer: string;
  meldung: string;
}

export interface SpeicherErgebnis {
  gesamt: number;
  ok: { bericht: boolean; baender: string[]; positionen: string[] };
  fehler: SpeicherFehler[];
}

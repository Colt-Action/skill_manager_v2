import type { FoerderbandPosition, Gurtzustand } from "@/lib/supabase/types";

// Feste Auswahlliste für die Einbauposition eines Förderband-Eintrags einer
// Werksbesichtigung. Bewusst fest im Code (wie MATERIAL_OPTIONEN etc. in
// referenzvideoOptionen.ts), nicht über eine Admin-Oberfläche verwaltbar -
// bei Bedarf hier ergänzen. "freifeld" = frei formulierbare Position statt
// einer der festen Optionen.
export const FOERDERBAND_POSITIONEN: FoerderbandPosition[] = [
  "kopftrommel",
  "ablaufpunkt",
  "waschbox",
  "freifeld",
];

export const GURTZUSTAND_OPTIONEN: Gurtzustand[] = ["neu", "leicht", "mittel", "stark"];

// Startpfad der geführten Produktauswahl in der Werksbesichtigung
// (docs/field-mode-rev01.md, 3.3): Industrie und Hersteller sind Testdaten
// und werden dort nicht abgefragt. Aufgelöst wird über die Namen in der
// geladenen Kategorienliste; fehlt ein Eintrag, zeigt die Werksbesichtigung
// wieder die vollständige Kaskade. Leeres Array = Industrie und Hersteller
// wieder einblenden (vollständige Kaskade).
export const PRODUKTAUSWAHL_STARTPFAD: readonly string[] = ["Maschinenbau", "HOSCH"];

// Wörterbuch-Schlüssel der Anzeigetexte. Einzige Stelle für Formular und
// Export (PDF/Word) - die gespeicherten Werte oben bleiben unverändert, nur
// die Texte in woerterbuch.ts bestimmen, was angezeigt wird.
export const POSITION_SCHLUESSEL: Record<FoerderbandPosition, string> = {
  kopftrommel: "foerderband.positionKopftrommel",
  ablaufpunkt: "foerderband.positionAblaufpunkt",
  waschbox: "foerderband.positionWaschbox",
  freifeld: "foerderband.positionFreifeld",
};

export const GURTZUSTAND_SCHLUESSEL: Record<Gurtzustand, string> = {
  neu: "foerderband.gurtzustandNeu",
  leicht: "foerderband.gurtzustandLeicht",
  mittel: "foerderband.gurtzustandMittel",
  stark: "foerderband.gurtzustandStark",
};

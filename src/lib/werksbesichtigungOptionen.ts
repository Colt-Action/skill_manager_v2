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

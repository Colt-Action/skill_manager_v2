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

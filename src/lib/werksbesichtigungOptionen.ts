import type { FoerderbandPosition } from "@/lib/supabase/types";

// Feste Auswahlliste für die Einbauposition eines Förderband-Eintrags einer
// Werksbesichtigung. Bewusst fest im Code (wie MATERIAL_OPTIONEN etc. in
// referenzvideoOptionen.ts), nicht über eine Admin-Oberfläche verwaltbar -
// bei Bedarf hier ergänzen.
export const FOERDERBAND_POSITIONEN: FoerderbandPosition[] = [
  "kopftrommel",
  "ablaufpunkt",
  "waschbox",
  "freifeld",
];

// Wichtig: NICHT "pdf-parse" direkt importieren - dessen index.js enthält
// einen Debug-Codepfad, der beim Bundling/Server-Build versucht, eine
// Test-PDF-Datei von der Festplatte zu lesen und den Build zum Absturz
// bringt. Der eigentliche Parser liegt unabhängig davon in lib/pdf-parse.js.
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

// Extrahiert reinen Text aus einem hochgeladenen PDF oder Word-Dokument,
// damit Dokumente über die Volltextsuche im Referenzbereich auffindbar sind.
// Nutzer sehen den extrahierten Text nirgends direkt - nur Dateiname/Titel.
export async function textAusDateiExtrahieren(buffer: Buffer, dateityp: "pdf" | "word"): Promise<string> {
  try {
    if (dateityp === "pdf") {
      const ergebnis = await pdfParse(buffer);
      return ergebnis.text.trim();
    }
    const ergebnis = await mammoth.extractRawText({ buffer });
    return ergebnis.value.trim();
  } catch {
    // Gescannte PDFs ohne Textebene o.ä. schlagen hier fehl - die Datei
    // bleibt trotzdem hochladbar, nur ohne Volltextsuche.
    return "";
  }
}

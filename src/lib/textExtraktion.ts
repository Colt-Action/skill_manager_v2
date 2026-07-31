import pdfParse from "pdf-parse";
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

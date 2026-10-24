import { Document, HeadingLevel, ImageRun, Packer, Paragraph, TextRun } from "docx";
import { berichtFotosLaden, type BerichtBild, type BerichtFeld, type BerichtModell } from "@/lib/werksbesichtigungBericht";

// Zeichnet das Berichtsmodell (lib/werksbesichtigungBericht.ts) als Word-
// Dokument - dieselbe Struktur wie das PDF.

function feldZeile({ label, wert }: BerichtFeld): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun(wert)],
    spacing: { after: 80 },
  });
}

export function berichtDocxErstellen(modell: BerichtModell, fotos: Map<string, BerichtBild | null>): Document {
  const children: Paragraph[] = [
    new Paragraph({ text: `${modell.titel} – ${modell.kunde}`, heading: HeadingLevel.HEADING_1 }),
    ...modell.deckblatt.map(feldZeile),
    feldZeile(modell.notizen),
  ];

  for (const band of modell.baender) {
    children.push(
      new Paragraph({ text: `${band.titel} · ${band.id}`, heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }),
      ...band.felder.map(feldZeile),
      feldZeile(band.notizen),
    );

    if (band.positionen.length === 0) children.push(feldZeile({ label: band.positionenTitel, wert: band.keinePositionen }));
    for (const pos of band.positionen) {
      children.push(
        new Paragraph({ text: pos.titel, heading: HeadingLevel.HEADING_3 }),
        feldZeile({ label: pos.produktLabel, wert: pos.produkt }),
        ...pos.felder.map(feldZeile),
      );
    }

    for (const foto of band.fotos) {
      const bild = fotos.get(foto.url);
      if (!bild) continue;
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new ImageRun({
              type: bild.format === "PNG" ? "png" : "jpg",
              data: bild.daten,
              transformation: { width: 320, height: 240 },
            }),
          ],
        }),
      );
    }
  }

  return new Document({ sections: [{ children }] });
}

export async function werksbesichtigungAlsDocx(modell: BerichtModell) {
  const fotos = await berichtFotosLaden(modell);
  const blob = await Packer.toBlob(berichtDocxErstellen(modell, fotos));
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${modell.dateiname}.docx`;
  link.click();
  URL.revokeObjectURL(url);
}

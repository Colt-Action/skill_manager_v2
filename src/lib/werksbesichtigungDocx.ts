import { AlignmentType, Document, HeadingLevel, ImageRun, Packer, Paragraph, TextRun } from "docx";
import type { FoerderbandEintragMitDetails, Werksbesichtigung } from "@/lib/supabase/types";

async function bildAlsArrayBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const antwort = await fetch(url);
    if (!antwort.ok) return null;
    return await antwort.arrayBuffer();
  } catch {
    return null;
  }
}

const POSITION_LABEL: Record<string, string> = {
  kopftrommel: "Kopftrommel",
  ablaufpunkt: "Ablaufpunkt",
  waschbox: "Waschbox",
  freifeld: "Freifeld",
};

const GURTZUSTAND_LABEL: Record<string, string> = {
  neu: "Neuer Gurt",
  leicht: "Leichte Beschädigungen",
  mittel: "Mittlere Beschädigungen",
  stark: "Starke Beschädigungen",
};

function feldZeile(label: string, wert: string | null | undefined): Paragraph | null {
  if (!wert) return null;
  return new Paragraph({
    children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun(wert)],
    spacing: { after: 80 },
  });
}

export async function werksbesichtigungAlsDocx(
  besuch: Werksbesichtigung,
  eintraege: FoerderbandEintragMitDetails[],
  datumFormatiert: string,
) {
  const children: Paragraph[] = [
    new Paragraph({
      text: `Werksbesichtigung – ${besuch.kunde}`,
      heading: HeadingLevel.HEADING_1,
    }),
  ];

  [
    feldZeile("Kunde", besuch.kunde),
    feldZeile("Partner / Besucht mit", besuch.partner),
    feldZeile("Ort", besuch.ort),
    feldZeile("Datum", datumFormatiert),
  ].forEach((p) => p && children.push(p));

  if (besuch.notizen.trim()) {
    children.push(new Paragraph({ text: "Allgemeine Notizen", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }));
    children.push(new Paragraph({ text: besuch.notizen, spacing: { after: 120 } }));
  }

  for (const eintrag of eintraege) {
    children.push(
      new Paragraph({
        text: eintrag.bezeichnung || "Förderband",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300 },
      }),
    );

    [
      feldZeile("Material", eintrag.material === "Sonstiges" ? eintrag.material_sonstiges : eintrag.material),
      feldZeile("Bandbreite", eintrag.foerderbandbreite),
      feldZeile(
        "Geschwindigkeit",
        eintrag.geschwindigkeit_ms != null ? `${eintrag.geschwindigkeit_ms.toFixed(1)} m/s` : null,
      ),
      feldZeile("Gurtverbindung", eintrag.belt_connection),
      feldZeile("Gurtzustand", eintrag.gurtzustand ? GURTZUSTAND_LABEL[eintrag.gurtzustand] : null),
      feldZeile("Schurren-Maße", eintrag.schurren_masse),
    ].forEach((p) => p && children.push(p));

    for (const pos of eintrag.foerderband_positionen) {
      const positionsLabel =
        pos.position === "freifeld" ? pos.position_freitext || "Freifeld" : (POSITION_LABEL[pos.position] ?? pos.position);
      [
        feldZeile("Position", positionsLabel),
        feldZeile("Produkt-Empfehlung", pos.kategorien?.name ?? null),
        feldZeile("Konfiguration", pos.konfiguration.trim() || null),
      ].forEach((p) => p && children.push(p));
    }

    if (eintrag.notizen.trim()) {
      children.push(new Paragraph({ text: eintrag.notizen, spacing: { after: 120 } }));
    }

    for (const foto of eintrag.foerderband_fotos) {
      const daten = await bildAlsArrayBuffer(foto.foto_url);
      if (!daten) continue;
      try {
        children.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            children: [
              new ImageRun({
                type: "jpg",
                data: daten,
                transformation: { width: 320, height: 240 },
              }),
            ],
          }),
        );
      } catch {
        // Foto konnte nicht eingebettet werden (z.B. unbekanntes Format) - überspringen.
      }
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);

  const dateiname = `Werksbesichtigung-${besuch.kunde.replace(/[^\p{L}\p{N}]+/gu, "-")}-${besuch.datum}.docx`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = dateiname;
  link.click();
  URL.revokeObjectURL(url);
}

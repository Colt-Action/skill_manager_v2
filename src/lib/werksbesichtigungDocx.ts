import {
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TabStopType,
  TextRun,
  WidthType,
  type FileChild,
  type IBorderOptions,
} from "docx";
import { UEBERSICHT_SPALTEN_MM, berichtFotosLaden, type BerichtBild, type BerichtFeld, type BerichtModell } from "@/lib/werksbesichtigungBericht";

// Zeichnet das Berichtsmodell (lib/werksbesichtigungBericht.ts) als Word-
// Dokument - dieselbe Struktur und Reihenfolge wie das PDF.

// Farbwerte aus globals.css.
const FARBE = { ink: "15161A", inkSoft: "55575C", rule: "CFD1CC", annot: "3B6A95", signal: "E2632A" };

/** Twips (1/20 pt) je Millimeter. */
const TW = 56.6929;
const RAND_TW = Math.round(18 * TW);
const SEITE_BREITE_TW = 11906; // A4
const SEITE_HOEHE_TW = 16838;
const INHALT_TW = SEITE_BREITE_TW - 2 * RAND_TW;

// Schriftgrößen in halben Punkten (wie im PDF).
const GROESSE = { titel: 48, kunde: 26, abschnitt: 22, label: 15, wert: 20, tabelle: 17, tabelleKopf: 14 };

const KEINE_LINIE: IBorderOptions = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const LINIE_FEIN: IBorderOptions = { style: BorderStyle.SINGLE, size: 4, color: FARBE.rule };
const LINIE_STARK: IBorderOptions = { style: BorderStyle.SINGLE, size: 6, color: FARBE.ink };
const OHNE_RAHMEN = { top: KEINE_LINIE, bottom: KEINE_LINIE, left: KEINE_LINIE, right: KEINE_LINIE };
const TABELLE_OHNE_RAHMEN = { ...OHNE_RAHMEN, insideHorizontal: KEINE_LINIE, insideVertical: KEINE_LINIE };

export function berichtDocxErstellen(modell: BerichtModell, fotos: Map<string, BerichtBild | null>): Document {
  // --- Grundbausteine -------------------------------------------------------

  function label(text: string): Paragraph {
    return new Paragraph({
      keepNext: true,
      spacing: { after: 20 },
      children: [
        new TextRun({ text, size: GROESSE.label, color: FARBE.inkSoft, characterSpacing: modell.cjk ? 0 : 12 }),
      ],
    });
  }

  /** Text mit Zeilenumbrüchen als einzelne Absätze. */
  function absaetze(text: string, optionen: { size?: number; color?: string; bold?: boolean } = {}): Paragraph[] {
    return text.split("\n").map(
      (zeile) =>
        new Paragraph({
          children: [new TextRun({ text: zeile, size: optionen.size ?? GROESSE.wert, color: optionen.color, bold: optionen.bold })],
        }),
    );
  }

  function abschnitt(titel: string): Paragraph {
    return new Paragraph({
      keepNext: true,
      border: { top: { ...LINIE_STARK, space: 4 } },
      spacing: { before: 280, after: 120 },
      children: [new TextRun({ text: titel, bold: true, size: GROESSE.abschnitt })],
    });
  }

  function hinweis(text: string): Paragraph {
    return new Paragraph({
      spacing: { before: 60, after: 120 },
      children: [new TextRun({ text, size: GROESSE.wert, color: FARBE.annot })],
    });
  }

  function zelle(children: Paragraph[], breite: number, rand: Partial<Record<"top" | "bottom", IBorderOptions>> = {}) {
    return new TableCell({
      width: { size: breite, type: WidthType.DXA },
      borders: { ...OHNE_RAHMEN, ...rand },
      margins: { top: 60, bottom: 60, left: 0, right: 170 },
      children,
    });
  }

  /** Raster aus Label/Wert-Zellen mit Trennlinien, zwei Spalten. */
  function feldRaster(felder: BerichtFeld[]): Table {
    const breite = Math.round(INHALT_TW / 2);
    const reihen: TableRow[] = [];
    for (let i = 0; i < felder.length; i += 2) {
      const paar = felder.slice(i, i + 2);
      while (paar.length < 2) paar.push({ label: "", wert: "" });
      reihen.push(
        new TableRow({
          cantSplit: true,
          children: paar.map((feld) =>
            zelle(feld.label ? [label(feld.label), ...absaetze(feld.wert)] : [new Paragraph("")], breite, { bottom: LINIE_FEIN }),
          ),
        }),
      );
    }
    return new Table({
      width: { size: INHALT_TW, type: WidthType.DXA },
      columnWidths: [breite, breite],
      layout: TableLayoutType.FIXED,
      borders: TABELLE_OHNE_RAHMEN,
      rows: reihen,
    });
  }

  /** Langes Feld (Notizen): Label, dann Text; darf über Seiten laufen. */
  function feldLang(feld: BerichtFeld): Paragraph[] {
    const text = absaetze(feld.wert);
    return [
      new Paragraph({ spacing: { before: 120 }, keepNext: true, children: [] }),
      label(feld.label),
      ...text.slice(0, -1),
      new Paragraph({
        border: { bottom: { ...LINIE_FEIN, space: 4 } },
        children: [new TextRun({ text: feld.wert.split("\n").at(-1) ?? "", size: GROESSE.wert })],
      }),
    ];
  }

  /** Tabelle mit Kopfzeile; Word wiederholt den Kopf nach einem Seitenumbruch. */
  function tabelle(spalten: string[], zeilen: string[][], breitenMm: number[]): Table {
    const summe = breitenMm.reduce((a, b) => a + b, 0);
    const breiten = breitenMm.map((b) => Math.floor((b / summe) * INHALT_TW));
    const zellenRand = { top: 50, bottom: 50, left: 0, right: 57 };
    const kopf = new TableRow({
      tableHeader: true,
      cantSplit: true,
      children: spalten.map(
        (text, i) =>
          new TableCell({
            width: { size: breiten[i], type: WidthType.DXA },
            borders: { ...OHNE_RAHMEN, bottom: LINIE_STARK },
            margins: zellenRand,
            children: [
              new Paragraph({
                children: [new TextRun({ text, size: GROESSE.tabelleKopf, color: FARBE.inkSoft })],
              }),
            ],
          }),
      ),
    });
    const reihen = zeilen.map(
      (zeile) =>
        new TableRow({
          cantSplit: true,
          children: zeile.map(
            (text, i) =>
              new TableCell({
                width: { size: breiten[i], type: WidthType.DXA },
                borders: { ...OHNE_RAHMEN, bottom: LINIE_FEIN },
                margins: zellenRand,
                children: absaetze(text, { size: GROESSE.tabelle }),
              }),
          ),
        }),
    );
    return new Table({
      width: { size: INHALT_TW, type: WidthType.DXA },
      columnWidths: breiten,
      layout: TableLayoutType.FIXED,
      borders: TABELLE_OHNE_RAHMEN,
      rows: [kopf, ...reihen],
    });
  }

  // --- Deckblatt ------------------------------------------------------------

  function deckblatt(): FileChild[] {
    const inhalt: FileChild[] = [
      // Seitenkopf im Typenschild-Stil: starke obere Linie, Titel, Kunde, Datum.
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 16, color: FARBE.ink, space: 8 } },
        tabStops: [{ type: TabStopType.RIGHT, position: INHALT_TW }],
        children: [
          new TextRun({ text: modell.titel, bold: true, size: GROESSE.titel }),
          new TextRun({ text: "\t" }),
          new TextRun({ text: modell.zeitraum, size: GROESSE.wert, color: FARBE.inkSoft }),
        ],
      }),
      new Paragraph({
        border: { bottom: { ...LINIE_FEIN, space: 6 } },
        spacing: { after: 80 },
        children: [new TextRun({ text: modell.kunde, size: GROESSE.kunde })],
      }),
      feldRaster(modell.deckblatt),
      abschnitt(modell.uebersichtTitel),
    ];
    if (modell.uebersicht.zeilen.length === 0) {
      inhalt.push(hinweis(modell.keineBaender));
    } else {
      inhalt.push(tabelle(modell.uebersicht.spalten, modell.uebersicht.zeilen, UEBERSICHT_SPALTEN_MM));
    }
    inhalt.push(...feldLang(modell.notizen));
    return inhalt;
  }

  // --- Förderbänder ---------------------------------------------------------

  function band(b: BerichtModell["baender"][number]): FileChild[] {
    const inhalt: FileChild[] = [abschnitt(`${b.titel} · ${b.id}`), feldRaster(b.felder), ...feldLang(b.notizen)];

    inhalt.push(abschnitt(b.positionenTitel));
    if (b.positionen.length === 0) inhalt.push(hinweis(b.keinePositionen));
    for (const pos of b.positionen) {
      inhalt.push(...absaetze(pos.titel, { bold: true }), feldRaster([{ label: pos.produktLabel, wert: pos.produkt }, ...pos.felder]));
    }

    for (const foto of b.fotos) {
      const bild = fotos.get(foto.url);
      if (!bild) continue;
      inhalt.push(
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
    return inhalt;
  }

  return new Document({
    creator: "Skill Manager",
    title: `${modell.titel} · ${modell.kunde}`,
    styles: {
      default: {
        document: {
          run: { font: "Arial", size: GROESSE.wert, color: FARBE.ink },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: SEITE_BREITE_TW, height: SEITE_HOEHE_TW },
            margin: { top: RAND_TW, bottom: RAND_TW, left: RAND_TW, right: RAND_TW },
          },
        },
        children: [...deckblatt(), ...modell.baender.flatMap(band)],
      },
    ],
  });
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

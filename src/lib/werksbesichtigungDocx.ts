import {
  BorderStyle,
  Document,
  Footer,
  ImageRun,
  Packer,
  PageNumber,
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
import {
  UEBERSICHT_SPALTEN_MM,
  berichtFotosLaden,
  bildEinpassen,
  seiteVorlageTeile,
  type BerichtBand,
  type BerichtBild,
  type BerichtFeld,
  type BerichtModell,
  type BerichtPosition,
} from "@/lib/werksbesichtigungBericht";
import type { Sprache } from "@/lib/i18n/sprachen";

// Zeichnet das Berichtsmodell (lib/werksbesichtigungBericht.ts) als Word-
// Dokument - dieselbe Struktur und Reihenfolge wie das PDF.

// Farbwerte aus globals.css.
const FARBE = { ink: "15161A", inkSoft: "55575C", rule: "CFD1CC", annot: "3B6A95", signal: "E2632A" };

/** Ostasien-Schrift je Sprache (Word auf Windows und Mac bringt beide mit). */
const OSTASIEN_SCHRIFT: Partial<Record<Sprache, string>> = { zh: "Microsoft YaHei", ja: "Yu Gothic" };

/** Sprachangabe für Word (Rechtschreibprüfung, Ersatzschrift). */
const SPRACH_TAG: Record<Sprache, string> = {
  de: "de-DE",
  en: "en-GB",
  es: "es-ES",
  pt: "pt-PT",
  sv: "sv-SE",
  fi: "fi-FI",
  zh: "zh-CN",
  ja: "ja-JP",
  id: "id-ID",
  ms: "ms-MY",
  af: "af-ZA",
};

/** Twips (1/20 pt) je Millimeter. */
const TW = 56.6929;
const RAND_TW = Math.round(18 * TW);
const SEITE_BREITE_TW = 11906; // A4
const SEITE_HOEHE_TW = 16838;
const INHALT_TW = SEITE_BREITE_TW - 2 * RAND_TW;

// Schriftgrößen in halben Punkten (wie im PDF).
const GROESSE = { titel: 48, kunde: 26, bandNummer: 68, bandId: 40, produkt: 28, unterschrift: 16, fusszeile: 15, abschnitt: 22, label: 15, wert: 20, tabelle: 17, tabelleKopf: 14 };

const KEINE_LINIE: IBorderOptions = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const LINIE_FEIN: IBorderOptions = { style: BorderStyle.SINGLE, size: 4, color: FARBE.rule };
const LINIE_STARK: IBorderOptions = { style: BorderStyle.SINGLE, size: 6, color: FARBE.ink };
const OHNE_RAHMEN = { top: KEINE_LINIE, bottom: KEINE_LINIE, left: KEINE_LINIE, right: KEINE_LINIE };
const TABELLE_OHNE_RAHMEN = { ...OHNE_RAHMEN, insideHorizontal: KEINE_LINIE, insideVertical: KEINE_LINIE };
const LINIE_KARTE: IBorderOptions = { style: BorderStyle.SINGLE, size: 6, color: FARBE.rule };
/** Innenabstand der Positionskarte links (nach dem 3-mm-Streifen) und rechts. */
const KARTE_INNEN_LINKS = Math.round(4 * TW);
const KARTE_INNEN_RECHTS = Math.round(4 * TW);
/** Fotos: Spaltenbreite (Satzbreite 174 mm, 3 mm Abstand) und höchste Höhe wie im PDF. */
const FOTO_SPALTE_MM = 84;
const FOTO_MAX_HOEHE_MM = 85;
/** Linker Teil der Fußzeile: rund 95 Zeichen passen bei 7,5 pt neben "Seite x von y". */
const FUSSZEILE_MAX_ZEICHEN = 95;

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

  // Kleiner Absatz nach Tabellen: direkt aufeinanderfolgende Tabellen zieht
  // Word zu einer Tabelle zusammen (dabei ginge z.B. der Seitenumbruch vor
  // dem nächsten Bandkopf verloren).
  function abstandsAbsatz(): Paragraph {
    return new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: "", size: 12 })] });
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

  /**
   * Kopf der Bandseite: Nummer groß links, rechts Label und Förderband-ID in
   * Signalorange. "Seitenumbruch oberhalb" am ersten Absatz der Tabelle
   * beginnt die Bandseite auf einer neuen Seite.
   */
  function bandKopf(b: BerichtBand): Table {
    const nummerBreite = Math.round(24 * TW);
    const kopfRand = { top: { style: BorderStyle.SINGLE, size: 16, color: FARBE.ink }, bottom: LINIE_FEIN };
    return new Table({
      width: { size: INHALT_TW, type: WidthType.DXA },
      columnWidths: [nummerBreite, INHALT_TW - nummerBreite],
      layout: TableLayoutType.FIXED,
      borders: TABELLE_OHNE_RAHMEN,
      rows: [
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              width: { size: nummerBreite, type: WidthType.DXA },
              borders: { ...OHNE_RAHMEN, ...kopfRand },
              margins: { top: 100, bottom: 120, left: 0, right: 0 },
              children: [
                new Paragraph({
                  pageBreakBefore: true,
                  children: [new TextRun({ text: b.nummer, bold: true, size: GROESSE.bandNummer })],
                }),
              ],
            }),
            new TableCell({
              width: { size: INHALT_TW - nummerBreite, type: WidthType.DXA },
              borders: { ...OHNE_RAHMEN, ...kopfRand },
              margins: { top: 100, bottom: 120, left: 0, right: 0 },
              children: [
                label(b.idLabel),
                new Paragraph({ children: [new TextRun({ text: b.id, bold: true, size: GROESSE.bandId, color: FARBE.signal })] }),
              ],
            }),
          ],
        }),
      ],
    });
  }

  /**
   * Positionskarte: einzellige Tabelle mit Rahmen und 3 mm breitem linken
   * Rand in Signalorange. "Zeile nicht trennen" hält die Karte auf einer
   * Seite - außer sie ist voraussichtlich höher als eine Seite (sehr lange
   * Konfiguration); dann darf Word sie teilen, sonst würde der Rest
   * abgeschnitten.
   */
  function positionKarte(pos: BerichtPosition): FileChild[] {
    const [segment, verlagerung, konfiguration] = pos.felder;
    const breiteInnen = INHALT_TW - KARTE_INNEN_LINKS - KARTE_INNEN_RECHTS;
    const halbe = Math.floor(breiteInnen / 2);
    // Grobe Schätzung: rund 95 Zeichen je Zeile bei 10 pt auf Kartenbreite.
    const konfigZeilen = konfiguration.wert
      .split("\n")
      .reduce((summe, zeile) => summe + Math.max(1, Math.ceil(zeile.length / 95)), 0);
    const zuHoch = konfigZeilen > 45;

    const paar = new Table({
      width: { size: breiteInnen, type: WidthType.DXA },
      columnWidths: [halbe, breiteInnen - halbe],
      layout: TableLayoutType.FIXED,
      borders: TABELLE_OHNE_RAHMEN,
      rows: [
        new TableRow({
          cantSplit: true,
          children: [segment, verlagerung].map(
            (feld, i) =>
              new TableCell({
                width: { size: i === 0 ? halbe : breiteInnen - halbe, type: WidthType.DXA },
                borders: OHNE_RAHMEN,
                margins: { top: 0, bottom: 0, left: 0, right: 170 },
                children: [label(feld.label), ...absaetze(feld.wert)],
              }),
          ),
        }),
      ],
    });

    const karte = new Table({
      width: { size: INHALT_TW, type: WidthType.DXA },
      columnWidths: [INHALT_TW],
      layout: TableLayoutType.FIXED,
      rows: [
        new TableRow({
          cantSplit: !zuHoch,
          children: [
            new TableCell({
              width: { size: INHALT_TW, type: WidthType.DXA },
              borders: {
                top: LINIE_KARTE,
                right: LINIE_KARTE,
                bottom: LINIE_KARTE,
                left: { style: BorderStyle.SINGLE, size: 68, color: FARBE.signal },
              },
              margins: { top: 110, bottom: 110, left: KARTE_INNEN_LINKS, right: KARTE_INNEN_RECHTS },
              children: [
                new Paragraph({
                  keepNext: true,
                  spacing: { after: 100 },
                  children: [new TextRun({ text: pos.titel, bold: true, size: GROESSE.wert })],
                }),
                label(pos.produktLabel),
                new Paragraph({
                  keepNext: true,
                  spacing: { after: 140 },
                  children: [new TextRun({ text: pos.produkt, bold: true, size: GROESSE.produkt })],
                }),
                paar,
                new Paragraph({ spacing: { before: 140 }, keepNext: true, children: [] }),
                label(konfiguration.label),
                ...absaetze(konfiguration.wert),
              ],
            }),
          ],
        }),
      ],
    });
    return [karte, abstandsAbsatz()];
  }

  function band(b: BerichtBand): FileChild[] {
    const inhalt: FileChild[] = [bandKopf(b), feldRaster(b.felder), ...feldLang(b.notizen)];

    inhalt.push(abschnitt(b.positionenTitel));
    if (b.positionen.length === 0) inhalt.push(hinweis(b.keinePositionen));
    inhalt.push(...b.positionen.flatMap(positionKarte));

    inhalt.push(abschnitt(b.fotosTitel));
    if (b.fotos.length === 0) inhalt.push(hinweis(b.keineFotos));
    else inhalt.push(fotoRaster(b), abstandsAbsatz());
    return inhalt;
  }

  /**
   * Fotos des Bands im Raster mit zwei Spalten (randlose Tabelle), im echten
   * Seitenverhältnis und in der Höhe begrenzt. "Zeile nicht trennen" hält
   * Foto und Unterschrift zusammen. Fehlt ein Foto, steht dort ein Hinweis.
   */
  function fotoRaster(b: BerichtBand): Table {
    const spaltenBreite = Math.floor(INHALT_TW / 2);
    // ImageRun misst in Pixeln (96 dpi).
    const pxProMm = 96 / 25.4;
    const maxBreitePx = Math.floor((FOTO_SPALTE_MM) * pxProMm);
    const maxHoehePx = Math.floor(FOTO_MAX_HOEHE_MM * pxProMm);
    const reihen: TableRow[] = [];
    for (let i = 0; i < b.fotos.length; i += 2) {
      const paar = b.fotos.slice(i, i + 2);
      reihen.push(
        new TableRow({
          cantSplit: true,
          children: [0, 1].map((s) => {
            const foto = paar[s];
            const inhaltZelle: Paragraph[] = [];
            if (foto) {
              const bild = fotos.get(foto.url) ?? null;
              if (bild) {
                const masse = bildEinpassen(bild, maxBreitePx, maxHoehePx);
                inhaltZelle.push(
                  new Paragraph({
                    children: [
                      new ImageRun({
                        type: bild.format === "PNG" ? "png" : "jpg",
                        data: bild.daten,
                        transformation: { width: Math.round(masse.breite), height: Math.round(masse.hoehe) },
                      }),
                    ],
                  }),
                );
              } else {
                inhaltZelle.push(
                  new Paragraph({
                    // Kasten wie im PDF: Abstand zwischen Rahmen und Text oben/unten
                    // (Höchstwert 31 pt), Text eingerückt.
                    border: {
                      top: { ...LINIE_KARTE, space: 31 },
                      bottom: { ...LINIE_KARTE, space: 31 },
                      left: { ...LINIE_KARTE, space: 6 },
                      right: { ...LINIE_KARTE, space: 6 },
                    },
                    indent: { left: 170, right: 170 },
                    spacing: { before: 0, after: 0 },
                    children: [new TextRun({ text: modell.texte.fotoNichtVerfuegbar, color: FARBE.annot, size: GROESSE.wert })],
                  }),
                );
              }
              inhaltZelle.push(
                new Paragraph({
                  spacing: { before: 60 },
                  children: [new TextRun({ text: foto.unterschrift, size: GROESSE.unterschrift, color: FARBE.inkSoft })],
                }),
              );
            } else {
              inhaltZelle.push(new Paragraph(""));
            }
            return new TableCell({
              width: { size: spaltenBreite, type: WidthType.DXA },
              borders: OHNE_RAHMEN,
              margins: { top: 0, bottom: 200, left: 0, right: s === 0 ? 170 : 0 },
              children: inhaltZelle,
            });
          }),
        }),
      );
    }
    return new Table({
      width: { size: INHALT_TW, type: WidthType.DXA },
      columnWidths: [spaltenBreite, INHALT_TW - spaltenBreite],
      layout: TableLayoutType.FIXED,
      borders: TABELLE_OHNE_RAHMEN,
      rows: reihen,
    });
  }

  function gekuerzt(text: string, max: number) {
    return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
  }

  /**
   * Fußzeile auf jeder Seite; Seitenzahlen als Word-Felder (PAGE, NUMPAGES).
   * Ein sehr langer Kundenname wird gekürzt, damit die Seitenzahl in der
   * Zeile bleibt (Word misst nicht vorab, daher nach Zeichenzahl).
   */
  function fusszeile(): Footer {
    const lauf = { size: GROESSE.fusszeile, color: FARBE.inkSoft };
    return new Footer({
      children: [
        new Paragraph({
          border: { top: { ...LINIE_FEIN, space: 4 } },
          tabStops: [{ type: TabStopType.RIGHT, position: INHALT_TW }],
          children: [
            new TextRun({ ...lauf, text: gekuerzt(modell.texte.fusszeile, FUSSZEILE_MAX_ZEICHEN) }),
            new TextRun({ ...lauf, text: "\t" }),
            ...seiteVorlageTeile(modell.texte.seiteVorlage).map((teil) =>
              typeof teil === "string"
                ? new TextRun({ ...lauf, text: teil })
                : new TextRun({ ...lauf, children: [teil.feld === "x" ? PageNumber.CURRENT : PageNumber.TOTAL_PAGES] }),
            ),
          ],
        }),
      ],
    });
  }

  return new Document({
    creator: "Skill Manager",
    title: `${modell.titel} · ${modell.kunde}`,
    styles: {
      default: {
        document: {
          run: {
            // Arial für lateinische Schrift; für Chinesisch/Japanisch zusätzlich
            // eine Ostasien-Schrift (nicht eingebettet). Die Sprachangabe lässt
            // Word bei fehlender Schrift eine passende Ersatzschrift wählen.
            font: { ascii: "Arial", hAnsi: "Arial", cs: "Arial", eastAsia: OSTASIEN_SCHRIFT[modell.sprache] ?? "Arial" },
            // Bei zh/ja nur die Ostasien-Sprache setzen: Als Hauptsprache würde
            // Word auch lateinischen Text als Ostasien-Text setzen (andere
            // Schrift, Umbruch mitten im Wort).
            language: modell.cjk ? { eastAsia: SPRACH_TAG[modell.sprache] } : { value: SPRACH_TAG[modell.sprache] },
            size: GROESSE.wert,
            color: FARBE.ink,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: SEITE_BREITE_TW, height: SEITE_HOEHE_TW },
            margin: { top: RAND_TW, bottom: Math.round(22 * TW), left: RAND_TW, right: RAND_TW, footer: Math.round(10 * TW) },
          },
        },
        footers: { default: fusszeile() },
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

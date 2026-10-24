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
// Kompakter Satz der Bandseiten (U7, halbe Punkt): Text nie unter 8 pt,
// Beschriftungen 7 pt - wie im PDF.
const KOMPAKT = { kopf: 24, label: 14, wert: 17, notiz: 16, karteTitel: 18, vergleich: 16, unterschrift: 14 };

const GROESSE = { titel: 48, kunde: 26, bandNummer: 68, bandId: 40, produkt: 28, unterschrift: 16, fusszeile: 15, abschnitt: 22, label: 15, wert: 20, tabelle: 17, tabelleKopf: 14 };

const KEINE_LINIE: IBorderOptions = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const LINIE_FEIN: IBorderOptions = { style: BorderStyle.SINGLE, size: 4, color: FARBE.rule };
const LINIE_STARK: IBorderOptions = { style: BorderStyle.SINGLE, size: 6, color: FARBE.ink };
const OHNE_RAHMEN = { top: KEINE_LINIE, bottom: KEINE_LINIE, left: KEINE_LINIE, right: KEINE_LINIE };
const TABELLE_OHNE_RAHMEN = { ...OHNE_RAHMEN, insideHorizontal: KEINE_LINIE, insideVertical: KEINE_LINIE };
const LINIE_KARTE: IBorderOptions = { style: BorderStyle.SINGLE, size: 6, color: FARBE.rule };
/** Fotos (kompakt): drei je Zeile, höchste Höhe wie im PDF. */
const FOTO_SPALTEN = 3;
const FOTO_MAX_HOEHE_MM = 40;
/** Bildunterschrift einzeilig: so viele Zeichen passen bei 7 pt in eine Spalte. */
const FOTO_UNTERSCHRIFT_MAX_ZEICHEN = 42;
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
  function abstandsAbsatz(mitNaechstem = false): Paragraph {
    return new Paragraph({
      keepNext: mitNaechstem,
      spacing: { after: 0, line: 120 },
      children: [new TextRun({ text: "", size: 8 })],
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

  // --- Kompakter Satz der Bandseiten (viele Bänder je Bericht) --------------

  /** Kleine graue Beschriftung (7 pt), hält mit dem Folgenden zusammen. */
  function kleinesLabel(text: string, abstandDanach = 0): Paragraph {
    return new Paragraph({
      keepNext: true,
      spacing: { after: abstandDanach },
      children: [
        new TextRun({ text, size: KOMPAKT.label, color: FARBE.inkSoft, characterSpacing: modell.cjk ? 0 : 6 }),
      ],
    });
  }

  function alsLabel(text: string) {
    return modell.cjk ? text : text.toLocaleUpperCase(modell.sprache);
  }

  /**
   * Kompakter Bandkopf: schmale Kopfzeile mit Nummer und Förderband-ID (in
   * Signalorange), darunter die Bandwerte als Raster mit sechs Spalten
   * (Beschriftung über Wert), dann die Notizen in kleinerer Schrift,
   * vollständig. Alles hält mit dem Folgenden zusammen ("Absatz nicht vom
   * nächsten trennen"), damit der Kopf nie allein am Seitenende steht.
   */
  function bandKopf(b: BerichtBand, neueSeite: boolean): FileChild[] {
    const kopfzeile = new Paragraph({
      pageBreakBefore: neueSeite,
      keepNext: true,
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: FARBE.ink, space: 3 } },
      spacing: { before: neueSeite ? 0 : 200, after: 40 },
      children: [
        new TextRun({ text: `${b.nummer}  `, bold: true, size: KOMPAKT.kopf }),
        new TextRun({ text: b.id, bold: true, size: KOMPAKT.kopf, color: FARBE.signal }),
      ],
    });

    const spalten = Math.max(1, b.felder.length);
    const breite = Math.floor(INHALT_TW / spalten);
    const werte = new Table({
      width: { size: INHALT_TW, type: WidthType.DXA },
      columnWidths: b.felder.map(() => breite),
      layout: TableLayoutType.FIXED,
      borders: TABELLE_OHNE_RAHMEN,
      rows: [
        new TableRow({
          cantSplit: true,
          children: b.felder.map(
            (feld) =>
              new TableCell({
                width: { size: breite, type: WidthType.DXA },
                borders: { ...OHNE_RAHMEN, bottom: LINIE_FEIN },
                margins: { top: 0, bottom: 50, left: 0, right: 80 },
                children: [
                  kleinesLabel(feld.label),
                  new Paragraph({ keepNext: true, children: [new TextRun({ text: feld.wert, size: KOMPAKT.wert })] }),
                ],
              }),
          ),
        }),
      ],
    });

    const labelSpalte = Math.round(26 * TW);
    const notizen = new Table({
      width: { size: INHALT_TW, type: WidthType.DXA },
      columnWidths: [labelSpalte, INHALT_TW - labelSpalte],
      layout: TableLayoutType.FIXED,
      borders: TABELLE_OHNE_RAHMEN,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: labelSpalte, type: WidthType.DXA },
              borders: OHNE_RAHMEN,
              margins: { top: 40, bottom: 40, left: 0, right: 80 },
              children: [kleinesLabel(b.notizen.label)],
            }),
            new TableCell({
              width: { size: INHALT_TW - labelSpalte, type: WidthType.DXA },
              borders: OHNE_RAHMEN,
              margins: { top: 40, bottom: 40, left: 0, right: 0 },
              children: b.notizen.wert.split("\n").map(
                (zeile) => new Paragraph({ keepNext: true, children: [new TextRun({ text: zeile, size: KOMPAKT.notiz })] }),
              ),
            }),
          ],
        }),
      ],
    });

    // Abstandsabsätze zwischen den Tabellen (sonst zieht Word sie zusammen).
    return [kopfzeile, werte, abstandsAbsatz(true), notizen, abstandsAbsatz(true)];
  }

  /**
   * Kompakte Positionskarte: einzellige Tabelle mit Rahmen und 2 mm breitem
   * linken Rand in Signalorange - Inhalt wie im PDF: Positionsname und
   * "Produkt · Typ" in einer Zeile, die geltenden Felder als Paare in einer
   * Zeile, die Konfiguration und (mit Schalter) je Vergleichstreffer eine
   * Zeile in kleinerer Schrift. "Zeile nicht trennen" hält die Karte auf
   * einer Seite - außer sie ist voraussichtlich höher als eine Seite (sehr
   * lange Konfiguration); dann darf Word sie teilen, sonst würde der Rest
   * abgeschnitten.
   */
  function positionKarte(pos: BerichtPosition): FileChild[] {
    const konfiguration = pos.konfiguration;
    // Grobe Schätzung: rund 110 Zeichen je Zeile bei 8,5 pt auf Kartenbreite.
    const konfigZeilen = konfiguration.wert
      .split("\n")
      .reduce((summe, zeile) => summe + Math.max(1, Math.ceil(zeile.length / 110)), 0);
    const zuHoch = konfigZeilen > 60;
    const labelLauf = (text: string) =>
      new TextRun({ text, size: KOMPAKT.label, color: FARBE.inkSoft, characterSpacing: modell.cjk ? 0 : 6 });

    const inhalt: Paragraph[] = [
      new Paragraph({
        keepNext: true,
        children: [
          new TextRun({ text: pos.titel, bold: true, size: KOMPAKT.karteTitel }),
          new TextRun({ text: "    ", size: KOMPAKT.karteTitel }),
          labelLauf(pos.produktLabel),
          new TextRun({ text: ` ${pos.produkt}`, size: KOMPAKT.karteTitel }),
        ],
      }),
    ];
    if (pos.felder.length > 0) {
      inhalt.push(
        new Paragraph({
          keepNext: true,
          spacing: { before: 20 },
          children: pos.felder.flatMap((feld, i) => [
            ...(i > 0 ? [new TextRun({ text: "      ", size: KOMPAKT.wert })] : []),
            labelLauf(feld.label),
            new TextRun({ text: ` ${feld.wert}`, size: KOMPAKT.wert }),
          ]),
        }),
      );
    }
    inhalt.push(
      new Paragraph({
        spacing: { before: 20 },
        children: [
          labelLauf(konfiguration.label),
          ...konfiguration.wert
            .split("\n")
            .map((zeile, i) => new TextRun({ text: i === 0 ? ` ${zeile}` : zeile, size: KOMPAKT.wert, break: i > 0 ? 1 : undefined })),
        ],
      }),
    );
    // Vergleichbare Installationen (Schalter beim Export, nur mit Treffern).
    if (pos.vergleiche) {
      inhalt.push(
        new Paragraph({ keepNext: true, spacing: { before: 40 }, children: [labelLauf(pos.vergleiche.label)] }),
        ...pos.vergleiche.zeilen.map(
          (zeile) =>
            new Paragraph({
              children: [new TextRun({ text: zeile.kurz, size: KOMPAKT.vergleich, color: FARBE.inkSoft })],
            }),
        ),
      );
    }

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
                left: { style: BorderStyle.SINGLE, size: 45, color: FARBE.signal },
              },
              margins: { top: 60, bottom: 60, left: Math.round(3 * TW), right: Math.round(3 * TW) },
              children: inhalt,
            }),
          ],
        }),
      ],
    });
    return [karte, abstandsAbsatz()];
  }

  /**
   * Bänder laufen fortlaufend: nur das erste beginnt nach dem Deckblatt auf
   * einer neuen Seite. Kopf, Zwischenbeschriftung und erste Karte halten
   * zusammen ("Absatz nicht vom nächsten trennen" bis zur ersten Karte, die
   * selbst nicht geteilt wird) - der Kopf steht nie allein am Seitenende.
   */
  function band(b: BerichtBand, index: number): FileChild[] {
    const inhalt: FileChild[] = [...bandKopf(b, index === 0)];

    inhalt.push(kleinesLabel(alsLabel(b.positionenTitel), 40));
    if (b.positionen.length === 0) {
      inhalt.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: b.keinePositionen, size: KOMPAKT.notiz, color: FARBE.annot })],
        }),
      );
    }
    inhalt.push(...b.positionen.flatMap(positionKarte));

    // "Fotos" hält mit der ersten Fotozeile zusammen.
    inhalt.push(kleinesLabel(alsLabel(b.fotosTitel), 40));
    if (b.fotos.length === 0) {
      inhalt.push(
        new Paragraph({ children: [new TextRun({ text: b.keineFotos, size: KOMPAKT.notiz, color: FARBE.annot })] }),
      );
    }
    else inhalt.push(fotoRaster(b), abstandsAbsatz());
    return inhalt;
  }

  /**
   * Kompaktes Fotoraster (randlose Tabelle): drei Fotos je Zeile, im echten
   * Seitenverhältnis, höchstens FOTO_MAX_HOEHE_MM hoch (Hochformat wird
   * schmaler, nichts verzerrt). Bildunterschrift klein und einzeilig (bei
   * Überlänge gekürzt). "Zeile nicht trennen" hält Foto und Unterschrift
   * zusammen. Fehlt ein Foto, steht dort ein Hinweis.
   */
  function fotoRaster(b: BerichtBand): Table {
    const abstand = 170;
    const spaltenBreite = Math.floor(INHALT_TW / FOTO_SPALTEN);
    // ImageRun misst in Pixeln (96 dpi).
    const pxProMm = 96 / 25.4;
    const maxBreitePx = Math.floor(((spaltenBreite - abstand) / TW) * pxProMm);
    const maxHoehePx = Math.floor(FOTO_MAX_HOEHE_MM * pxProMm);
    const reihen: TableRow[] = [];
    for (let i = 0; i < b.fotos.length; i += FOTO_SPALTEN) {
      const gruppe = b.fotos.slice(i, i + FOTO_SPALTEN);
      reihen.push(
        new TableRow({
          cantSplit: true,
          children: Array.from({ length: FOTO_SPALTEN }, (_, s) => {
            const foto = gruppe[s];
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
                    // Kasten wie im PDF: Abstand zwischen Rahmen und Text, Text eingerückt.
                    border: {
                      top: { ...LINIE_KARTE, space: 18 },
                      bottom: { ...LINIE_KARTE, space: 18 },
                      left: { ...LINIE_KARTE, space: 4 },
                      right: { ...LINIE_KARTE, space: 4 },
                    },
                    indent: { left: 100, right: 100 },
                    spacing: { before: 0, after: 0 },
                    children: [new TextRun({ text: modell.texte.fotoNichtVerfuegbar, color: FARBE.annot, size: KOMPAKT.notiz })],
                  }),
                );
              }
              inhaltZelle.push(
                new Paragraph({
                  spacing: { before: 30 },
                  children: [
                    new TextRun({
                      text: gekuerzt(foto.unterschrift, FOTO_UNTERSCHRIFT_MAX_ZEICHEN),
                      size: KOMPAKT.unterschrift,
                      color: FARBE.inkSoft,
                    }),
                  ],
                }),
              );
            } else {
              inhaltZelle.push(new Paragraph(""));
            }
            return new TableCell({
              width: { size: spaltenBreite, type: WidthType.DXA },
              borders: OHNE_RAHMEN,
              margins: { top: 0, bottom: 120, left: 0, right: s < FOTO_SPALTEN - 1 ? abstand : 0 },
              children: inhaltZelle,
            });
          }),
        }),
      );
    }
    return new Table({
      width: { size: INHALT_TW, type: WidthType.DXA },
      columnWidths: Array.from({ length: FOTO_SPALTEN }, () => spaltenBreite),
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

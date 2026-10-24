import { jsPDF } from "jspdf";
import {
  UEBERSICHT_SPALTEN_MM,
  berichtFotosLaden,
  bildEinpassen,
  type BerichtBand,
  type BerichtBild,
  type BerichtFeld,
  type BerichtModell,
  type BerichtPosition,
} from "@/lib/werksbesichtigungBericht";

// Zeichnet das Berichtsmodell (lib/werksbesichtigungBericht.ts) als PDF.
// Alle Texte kommen fertig aus dem Modell; hier stehen nur Layout und
// Gestaltung (Typenschild Rev. 02, für den Druck auf weißem Papier).

type Rgb = readonly [number, number, number];

// Farbwerte aus globals.css.
const FARBE = {
  ink: [21, 22, 26], // --ink #15161a
  inkSoft: [85, 87, 92], // --ink-soft #55575c
  rule: [207, 209, 204], // --rule #cfd1cc
  annot: [59, 106, 149], // --annot #3b6a95
  signal: [226, 99, 42], // --signal #e2632a
} as const satisfies Record<string, Rgb>;

const MM_PRO_PT = 25.4 / 72;
const RAND = 18;
/** Unterkante des Inhalts; darunter steht die Fußzeile. */
const INHALT_UNTEN = 297 - 22;

/** Sperrung der Feldlabels (0,6 pt, wie in Word). */
const LABEL_SPERRUNG = 0.6 * MM_PRO_PT;

const GROESSE = {
  titel: 24,
  kunde: 13,
  bandNummer: 34,
  bandId: 20,
  produkt: 14,
  abschnitt: 11,
  label: 7.5,
  wert: 10,
  tabelle: 8.5,
  tabelleKopf: 7,
  vergleich: 8.5,
  unterschrift: 8,
  fusszeile: 7.5,
};

/**
 * Kompakter Satz der Bandseiten (U7, viele Bänder je Bericht): Text nie
 * unter 8 pt, Beschriftungen 7 pt, engerer Zeilenabstand.
 */
const KOMPAKT = {
  kopf: 12,
  label: 7,
  wert: 8.5,
  notiz: 8,
  karteTitel: 9,
  vergleich: 8,
  unterschrift: 7,
  zeilenfaktor: 1.2,
  labelSperrung: 0.3 * MM_PRO_PT,
};

/** Höchste Höhe eines Fotos in mm - ein Foto füllt nie die ganze Seite. */
const FOTO_MAX_HOEHE = 40;
const FOTO_PLATZHALTER_HOEHE = 20;
/** Fotos je Rasterzeile (kompakt). */
const FOTO_SPALTEN = 3;
/** Abstand zwischen den Positionskarten (kompakt). */
const KARTEN_ABSTAND = 2;
/** Abstand zwischen zwei Bändern im fortlaufenden Satz. */
const BAND_ABSTAND = 5;

// ---------------------------------------------------------------------------
// Schrift und Zeichen
// ---------------------------------------------------------------------------

/** CJK-Schriftdatei als Base64 (für jsPDF), nur für Chinesisch und Japanisch. */
export type CjkSchrift = string;

/**
 * Pfad der CJK-Schrift unter public/fonts/: Noto Sans SC bzw. JP Regular
 * (SIL OFL), vorab reduziert auf lateinische Zeichen, Satzzeichen, alle
 * Zeichen des Wörterbuchs und GB2312 (zh, 6763 Zeichen) bzw. Kana und
 * JIS X 0208 (ja, Ebene 1 und 2). Nur ein Schnitt, um den Download klein zu
 * halten - Fett wird für zh/ja mit einer dünnen Kontur nachgebildet.
 */
export function cjkSchriftDatei(sprache: "zh" | "ja"): string {
  return `/fonts/${sprache === "zh" ? "NotoSansSC" : "NotoSansJP"}-Regular-Teilmenge.ttf`;
}

const CJK_FAMILIE = "NotoCJK";

// Zeichen, die das Standard-Helvetica von jsPDF (WinAnsi) darstellen kann.
// Alles andere würde jsPDF still weglassen oder als Zeichensalat ausgeben.
const WINANSI_ZUSATZ = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
function istWinAnsi(zeichen: string): boolean {
  const code = zeichen.codePointAt(0) ?? 0;
  return (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WINANSI_ZUSATZ.includes(zeichen);
}

// Häufige Zeichen außerhalb von WinAnsi mit gleichwertigem Ersatz.
const LATEIN_ERSATZ: Record<string, string> = {
  "⌀": "Ø",
  "≤": "<=",
  "≥": ">=",
  "≈": "~",
  "−": "-",
  "‐": "-",
  "‑": "-",
  " ": " ",
  " ": " ",
  "​": "",
  "\t": " ",
};

/**
 * Ersetzt Zeichen, die die verwendete Schrift nicht enthält, sichtbar:
 * "?" bei Helvetica, "□" bei der CJK-Schrift. Nichts verschwindet still.
 */
function zeichenErsetzer(hatZeichen: ((zeichen: string) => boolean) | null): (text: string) => string {
  return (text) =>
    Array.from(text)
      .map((z) => {
        if (z === "\n") return z;
        if (!hatZeichen) {
          if (istWinAnsi(z)) return z;
          return LATEIN_ERSATZ[z] ?? "?";
        }
        if (hatZeichen(z)) return z;
        const ersatz = LATEIN_ERSATZ[z];
        if (ersatz !== undefined && Array.from(ersatz).every(hatZeichen)) return ersatz;
        return hatZeichen("□") ? "□" : "?";
      })
      .join("");
}

/** Wendet den Ersetzer auf alle Texte des Modells an (nicht auf Foto-URLs). */
function texteBereinigen<T>(wert: T, ersetzen: (text: string) => string, schluessel?: string): T {
  if (typeof wert === "string") return (schluessel === "url" ? wert : ersetzen(wert)) as T;
  if (Array.isArray(wert)) return wert.map((w) => texteBereinigen(w, ersetzen)) as T;
  if (wert && typeof wert === "object") {
    return Object.fromEntries(
      Object.entries(wert).map(([k, v]) => [k, texteBereinigen(v, ersetzen, k)]),
    ) as T;
  }
  return wert;
}

export function berichtPdfErstellen(
  eingabe: BerichtModell,
  fotos: Map<string, BerichtBild | null>,
  schriftDaten?: CjkSchrift | null,
): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const seitenBreite = doc.internal.pageSize.getWidth();
  const inhaltsBreite = seitenBreite - RAND * 2;
  const rechts = RAND + inhaltsBreite;

  // Chinesisch/Japanisch: CJK-Schrift einbetten (jsPDF bettet nur die
  // verwendeten Glyphen ein). Sie enthält auch lateinische Zeichen und
  // Ziffern, gemischte Texte brauchen daher keinen Schriftwechsel.
  let familie = "helvetica";
  let hatZeichen: ((zeichen: string) => boolean) | null = null;
  if (eingabe.cjk) {
    if (!schriftDaten) throw new Error("CJK-Schrift fehlt.");
    doc.addFileToVFS("NotoCJK-Regular.ttf", schriftDaten);
    doc.addFont("NotoCJK-Regular.ttf", CJK_FAMILIE, "normal", "Identity-H");
    doc.setFont(CJK_FAMILIE, "normal");
    const codeMap = (doc.getFont() as unknown as { metadata: { cmap: { unicode: { codeMap: Record<number, number> } } } })
      .metadata.cmap.unicode.codeMap;
    // jsPDF arbeitet mit UTF-16-Einheiten: Zeichen außerhalb der BMP (z.B.
    // Emoji) gelten immer als fehlend.
    hatZeichen = (z) => z.length === 1 && Boolean(codeMap[z.charCodeAt(0)]);
    familie = CJK_FAMILIE;
  }
  const modell = texteBereinigen(eingabe, zeichenErsetzer(hatZeichen));
  let y = RAND;

  // --- Grundbausteine -------------------------------------------------------

  // Zustand für nachgebildetes Fett (nur zh/ja, siehe textOben).
  let fettNachbilden = false;
  let textFarbe: Rgb = FARBE.ink;

  function schrift(stil: "normal" | "bold", groesse: number, farbe: Rgb = FARBE.ink) {
    fettNachbilden = familie === CJK_FAMILIE && stil === "bold";
    doc.setFont(familie, familie === CJK_FAMILIE ? "normal" : stil);
    doc.setFontSize(groesse);
    doc.setTextColor(farbe[0], farbe[1], farbe[2]);
    textFarbe = farbe;
  }

  function zeilenhoehe(groesse: number) {
    return groesse * MM_PRO_PT * 1.3;
  }

  /** Umbruch mit der aktuell gesetzten Schrift. */
  function umbrechen(text: string, breite: number): string[] {
    return doc.splitTextToSize(text, breite) as string[];
  }

  function linie(x1: number, x2: number, yPos: number, farbe: Rgb, staerke: number) {
    doc.setDrawColor(farbe[0], farbe[1], farbe[2]);
    doc.setLineWidth(staerke);
    doc.line(x1, yPos, x2, yPos);
  }

  function neueSeite() {
    doc.addPage();
    y = RAND;
  }

  function platzPruefen(benoetigt: number) {
    if (y + benoetigt > INHALT_UNTEN) neueSeite();
  }

  /** Text oben bündig an yOben setzen (jsPDF setzt sonst auf die Grundlinie). */
  function textOben(
    text: string | string[],
    x: number,
    yOben: number,
    optionen: { align?: "left" | "right"; charSpace?: number } = {},
  ) {
    if (fettNachbilden) {
      // Fett für zh/ja: Füllung plus Kontur in Textfarbe (rund 3 % der Schriftgröße).
      doc.setDrawColor(textFarbe[0], textFarbe[1], textFarbe[2]);
      doc.setLineWidth(doc.getFontSize() * MM_PRO_PT * 0.03);
      doc.text(text, x, yOben, { baseline: "top", lineHeightFactor: 1.3, renderingMode: "fillThenStroke", ...optionen });
      return;
    }
    doc.text(text, x, yOben, { baseline: "top", lineHeightFactor: 1.3, ...optionen });
  }

  // Feldlabel klein und grau, leicht gesperrt (Versalien liefert das Modell,
  // außer bei zh/ja). Die Sperrung kennt splitTextToSize nicht, daher etwas
  // schmaler umbrechen.
  function labelSetzen(text: string, x: number, yOben: number, breite: number) {
    schrift("normal", GROESSE.label, FARBE.inkSoft);
    const zeilen = umbrechen(text, modell.cjk ? breite : breite * 0.9);
    textOben(zeilen, x, yOben, { charSpace: modell.cjk ? 0 : LABEL_SPERRUNG });
    return zeilen.length * zeilenhoehe(GROESSE.label);
  }

  /** Abschnitt: starke Linie mit aufsitzendem Titel. */
  function abschnitt(titel: string, mindestens = 24) {
    platzPruefen(10 + mindestens);
    y += 4;
    linie(RAND, rechts, y, FARBE.ink, 0.3);
    schrift("bold", GROESSE.abschnitt);
    textOben(titel, RAND, y + 2);
    y += 2 + zeilenhoehe(GROESSE.abschnitt) + 2;
  }

  function hinweis(text: string) {
    schrift("normal", GROESSE.wert, FARBE.annot);
    const zeilen = umbrechen(text, inhaltsBreite);
    platzPruefen(zeilen.length * zeilenhoehe(GROESSE.wert) + 2);
    textOben(zeilen, RAND, y + 1);
    y += zeilen.length * zeilenhoehe(GROESSE.wert) + 3;
  }

  /** Raster aus Label/Wert-Zellen mit Trennlinien, zwei Spalten. */
  function feldRaster(felder: BerichtFeld[], spalten = 2) {
    const abstand = 6;
    const breite = (inhaltsBreite - abstand * (spalten - 1)) / spalten;
    for (let i = 0; i < felder.length; i += spalten) {
      const reihe = felder.slice(i, i + spalten).map((feld) => {
        schrift("normal", GROESSE.label);
        const label = umbrechen(feld.label, breite);
        schrift("normal", GROESSE.wert);
        const wert = umbrechen(feld.wert, breite);
        return { label, wert };
      });
      const hoehe =
        2 +
        Math.max(
          ...reihe.map((z) => z.label.length * zeilenhoehe(GROESSE.label) + 0.8 + z.wert.length * zeilenhoehe(GROESSE.wert)),
        ) +
        2;
      platzPruefen(hoehe);
      reihe.forEach((z, s) => {
        const x = RAND + s * (breite + abstand);
        const labelHoehe = labelSetzen(z.label.join(" "), x, y + 2, breite);
        schrift("normal", GROESSE.wert);
        textOben(z.wert, x, y + 2 + labelHoehe + 0.8);
      });
      y += hoehe;
      linie(RAND, rechts, y, FARBE.rule, 0.2);
    }
  }

  /** Langes Feld (Notizen): Label, dann Text über beliebig viele Seiten. */
  function feldLang(feld: BerichtFeld) {
    schrift("normal", GROESSE.wert);
    const zeilen = umbrechen(feld.wert, inhaltsBreite);
    const zh = zeilenhoehe(GROESSE.wert);
    platzPruefen(2 + zeilenhoehe(GROESSE.label) + 0.8 + Math.min(zeilen.length, 3) * zh);
    y += 2 + labelSetzen(feld.label, RAND, y + 2, inhaltsBreite) + 0.8;
    schrift("normal", GROESSE.wert);
    for (const zeile of zeilen) {
      if (y + zh > INHALT_UNTEN) {
        neueSeite();
        schrift("normal", GROESSE.wert);
      }
      textOben(zeile, RAND, y);
      y += zh;
    }
    y += 2;
    linie(RAND, rechts, y, FARBE.rule, 0.2);
  }

  /** Tabelle mit Kopfzeile; der Kopf wiederholt sich nach einem Seitenumbruch. */
  function tabelle(spalten: string[], zeilen: string[][], breiten: number[]) {
    const pad = 1.6;
    const xPos = breiten.map((_, i) => RAND + breiten.slice(0, i).reduce((a, b) => a + b, 0));

    function kopf() {
      schrift("normal", GROESSE.tabelleKopf);
      const zellen = spalten.map((s, i) => umbrechen(s, breiten[i] - 1));
      const hoehe = pad + Math.max(...zellen.map((z) => z.length)) * zeilenhoehe(GROESSE.tabelleKopf) + pad;
      platzPruefen(hoehe + 8);
      schrift("normal", GROESSE.tabelleKopf, FARBE.inkSoft);
      zellen.forEach((z, i) => textOben(z, xPos[i], y + pad));
      y += hoehe;
      linie(RAND, rechts, y, FARBE.ink, 0.3);
    }

    kopf();
    for (const zeile of zeilen) {
      schrift("normal", GROESSE.tabelle);
      const zellen = zeile.map((wert, i) => umbrechen(wert, breiten[i] - 1));
      const hoehe = pad + Math.max(...zellen.map((z) => z.length)) * zeilenhoehe(GROESSE.tabelle) + pad;
      if (y + hoehe > INHALT_UNTEN) {
        neueSeite();
        kopf();
      }
      schrift("normal", GROESSE.tabelle);
      zellen.forEach((z, i) => textOben(z, xPos[i], y + pad));
      y += hoehe;
      linie(RAND, rechts, y, FARBE.rule, 0.2);
    }
  }

  // --- Deckblatt ------------------------------------------------------------

  function deckblatt() {
    // Seitenkopf im Typenschild-Stil: starke obere Linie, Titel, Kunde, Datum.
    linie(RAND, rechts, y, FARBE.ink, 0.7);
    y += 5;
    schrift("normal", GROESSE.wert, FARBE.inkSoft);
    textOben(modell.zeitraum, rechts, y + 1, { align: "right" });
    schrift("bold", GROESSE.titel);
    const titelZeilen = umbrechen(modell.titel, inhaltsBreite - 45);
    textOben(titelZeilen, RAND, y);
    y += titelZeilen.length * zeilenhoehe(GROESSE.titel) + 1;
    schrift("normal", GROESSE.kunde);
    const kundeZeilen = umbrechen(modell.kunde, inhaltsBreite);
    textOben(kundeZeilen, RAND, y);
    y += kundeZeilen.length * zeilenhoehe(GROESSE.kunde) + 4;
    linie(RAND, rechts, y, FARBE.rule, 0.2);

    feldRaster(modell.deckblatt);

    abschnitt(modell.uebersichtTitel);
    if (modell.uebersicht.zeilen.length === 0) {
      hinweis(modell.keineBaender);
    } else {
      tabelle(modell.uebersicht.spalten, modell.uebersicht.zeilen, UEBERSICHT_SPALTEN_MM);
    }

    y += 4;
    feldLang(modell.notizen);
  }

  // --- Förderbänder ---------------------------------------------------------

  // --- Kompakter Satz der Bandseiten (viele Bänder je Bericht) --------------

  /** Zeilenhöhe im kompakten Satz (engerer Zeilenabstand). */
  function zhK(groesse: number) {
    return groesse * MM_PRO_PT * KOMPAKT.zeilenfaktor;
  }

  function textKompakt(text: string | string[], x: number, yOben: number, optionen: { charSpace?: number } = {}) {
    if (fettNachbilden) {
      doc.setDrawColor(textFarbe[0], textFarbe[1], textFarbe[2]);
      doc.setLineWidth(doc.getFontSize() * MM_PRO_PT * 0.03);
      doc.text(text, x, yOben, { baseline: "top", lineHeightFactor: KOMPAKT.zeilenfaktor, renderingMode: "fillThenStroke", ...optionen });
      return;
    }
    doc.text(text, x, yOben, { baseline: "top", lineHeightFactor: KOMPAKT.zeilenfaktor, ...optionen });
  }

  /** Text als Feldbeschriftung (Versalien bei lateinischer Schrift). */
  function alsLabel(text: string) {
    return modell.cjk ? text : text.toLocaleUpperCase(modell.sprache);
  }

  /** Kleine graue Beschriftung (7 pt); liefert die Höhe, zeichnet nur bei zeichnen = true. */
  function kleinesLabel(text: string, x: number, yOben: number, breite: number, zeichnen: boolean): number {
    schrift("normal", KOMPAKT.label, FARBE.inkSoft);
    const zeilen = umbrechen(text, modell.cjk ? breite : breite * 0.93);
    if (zeichnen) textKompakt(zeilen, x, yOben, { charSpace: modell.cjk ? 0 : KOMPAKT.labelSperrung });
    return zeilen.length * zhK(KOMPAKT.label);
  }

  /**
   * Kompakter Bandkopf: schmale Kopfzeile mit Nummer und Förderband-ID (in
   * Signalorange), darunter die Bandwerte als Raster mit sechs Spalten
   * (Beschriftung über Wert), dann die Notizen in kleinerer Schrift,
   * vollständig. zeichnen = false misst nur die Höhe (für "Bandkopf bleibt bei
   * der ersten Karte").
   */
  function bandKopf(b: BerichtBand, zeichnen: boolean): number {
    const start = y;
    let yy = y;
    if (zeichnen) linie(RAND, rechts, yy, FARBE.ink, 0.4);
    yy += 1.5;

    schrift("bold", KOMPAKT.kopf);
    const nummerBreite = doc.getTextWidth(b.nummer) + 3;
    const idZeilen = umbrechen(b.id, inhaltsBreite - nummerBreite);
    if (zeichnen) {
      textKompakt(b.nummer, RAND, yy);
      schrift("bold", KOMPAKT.kopf, FARBE.signal);
      textKompakt(idZeilen, RAND + nummerBreite, yy);
    }
    yy += idZeilen.length * zhK(KOMPAKT.kopf) + 1;

    const spalten = Math.max(1, b.felder.length);
    const abstand = 3;
    const breite = (inhaltsBreite - abstand * (spalten - 1)) / spalten;
    const zellen = b.felder.map((feld) => {
      const labelHoehe = kleinesLabel(feld.label, 0, 0, breite, false);
      schrift("normal", KOMPAKT.wert);
      return { feld, labelHoehe, wert: umbrechen(feld.wert, breite) };
    });
    const rasterHoehe = Math.max(0, ...zellen.map((z) => z.labelHoehe + 0.4 + z.wert.length * zhK(KOMPAKT.wert)));
    if (zeichnen) {
      zellen.forEach((z, i) => {
        const x = RAND + i * (breite + abstand);
        kleinesLabel(z.feld.label, x, yy, breite, true);
        schrift("normal", KOMPAKT.wert);
        textKompakt(z.wert, x, yy + z.labelHoehe + 0.4);
      });
    }
    yy += rasterHoehe + 1.2;
    if (zeichnen) linie(RAND, rechts, yy, FARBE.rule, 0.2);
    yy += 1.2;

    // Notizen: Beschriftung links, Text rechts daneben (8 pt), läuft bei Bedarf
    // über Seiten weiter und wird nie gekürzt.
    const labelSpalte = 26;
    const notizLabelHoehe = kleinesLabel(b.notizen.label, 0, 0, labelSpalte - 2, false);
    schrift("normal", KOMPAKT.notiz);
    const notizZeilen = umbrechen(b.notizen.wert, inhaltsBreite - labelSpalte);
    if (!zeichnen) return yy - start + Math.max(notizLabelHoehe, notizZeilen.length * zhK(KOMPAKT.notiz)) + 2;

    kleinesLabel(b.notizen.label, RAND, yy, labelSpalte - 2, true);
    schrift("normal", KOMPAKT.notiz);
    let zeileY = yy;
    for (const zeile of notizZeilen) {
      if (zeileY + zhK(KOMPAKT.notiz) > INHALT_UNTEN) {
        neueSeite();
        zeileY = y;
        schrift("normal", KOMPAKT.notiz);
      }
      textKompakt(zeile, RAND + labelSpalte, zeileY);
      zeileY += zhK(KOMPAKT.notiz);
    }
    y = Math.max(zeileY, yy + notizLabelHoehe) + 2;
    return y - start;
  }

  /** Kleine Zwischenbeschriftung im Band (z.B. "Positionen & Produkte", "Fotos"). */
  function bandAbschnitt(titel: string, zeichnen: boolean): number {
    const hoehe = kleinesLabel(alsLabel(titel), RAND, y, inhaltsBreite, zeichnen) + 1;
    if (zeichnen) y += hoehe;
    return hoehe;
  }

  /**
   * Kompakte Positionskarte: Rahmen, links 2 mm Streifen in Signalorange.
   *   Zeile 1: Positionsname und "Produkt · Typ" in einer Zeile, soweit es passt.
   *   Zeile 2: die zum Produkt geltenden Felder als Beschriftung-Wert-Paare
   *            nebeneinander (bei Platzmangel weitere Zeilen).
   *   Darunter die gewünschte Konfiguration (mehrzeilig) und - mit Schalter -
   *   je Vergleichstreffer eine einzeilige Zusammenfassung in kleinerer Schrift.
   * Die Höhe wird vorab berechnet; die Karte wird nicht über einen
   * Seitenumbruch geteilt. Nur eine Karte, die selbst höher als eine Seite ist
   * (sehr lange Konfiguration), läuft mit fortgesetztem Streifen weiter.
   * zeichnen = false misst nur die Höhe.
   */
  function positionKarte(pos: BerichtPosition, zeichnen = true): number {
    const streifen = 2;
    const pad = 1.8;
    const xInnen = RAND + streifen + 3;
    const breiteInnen = inhaltsBreite - streifen - 3 - 3;
    const zhWert = zhK(KOMPAKT.wert);
    const zhTitel = zhK(KOMPAKT.karteTitel);
    const zhLabel = zhK(KOMPAKT.label);
    const zhVergleich = zhK(KOMPAKT.vergleich);
    const sperrung = modell.cjk ? 0 : KOMPAKT.labelSperrung;

    function labelBreite(text: string) {
      schrift("normal", KOMPAKT.label);
      return doc.getTextWidth(text) + sperrung * text.length;
    }

    // Zeile 1: Titel (fett) · PRODUKT Produkt · Typ
    schrift("bold", KOMPAKT.karteTitel);
    const titelBreite = doc.getTextWidth(pos.titel);
    const produktLabelBreite = labelBreite(pos.produktLabel);
    schrift("normal", KOMPAKT.karteTitel);
    const produktBreite = doc.getTextWidth(pos.produkt);
    const einzeilig = titelBreite + 4 + produktLabelBreite + 1.5 + produktBreite <= breiteInnen;
    schrift("bold", KOMPAKT.karteTitel);
    const titelZeilen = einzeilig ? [pos.titel] : umbrechen(pos.titel, breiteInnen);
    schrift("normal", KOMPAKT.karteTitel);
    const produktZeilen = einzeilig ? [pos.produkt] : umbrechen(pos.produkt, breiteInnen - produktLabelBreite - 1.5);
    const zeile1Hoehe = einzeilig ? zhTitel : (titelZeilen.length + produktZeilen.length) * zhTitel;

    // Zeile 2: geltende Felder als Paare im Fließsatz.
    type Paar = { label: string; labelB: number; wert: string[]; x: number; zeile: number };
    const paare: Paar[] = [];
    let x = 0;
    let zeile = 0;
    for (const feld of pos.felder) {
      const labelB = labelBreite(feld.label);
      schrift("normal", KOMPAKT.wert);
      const wertB = doc.getTextWidth(feld.wert);
      const gesamt = labelB + 1.5 + wertB;
      if (x > 0 && x + gesamt > breiteInnen) {
        zeile += 1;
        x = 0;
      }
      const wert = gesamt > breiteInnen ? umbrechen(feld.wert, breiteInnen - labelB - 1.5) : [feld.wert];
      paare.push({ label: feld.label, labelB, wert, x, zeile });
      x += gesamt + 6;
      if (wert.length > 1) {
        zeile += wert.length - 1;
        x = breiteInnen; // nächstes Paar in neuer Zeile
      }
    }
    const zeile2Hoehe = paare.length > 0 ? (zeile + 1) * zhWert + 0.6 : 0;

    // Konfiguration: Beschriftung links, Text daneben.
    const konfigLabelSpalte = Math.min(50, labelBreite(pos.konfiguration.label) / 0.93 + 3);
    const konfigLabelHoehe = kleinesLabel(pos.konfiguration.label, 0, 0, konfigLabelSpalte, false);
    schrift("normal", KOMPAKT.wert);
    const konfigZeilen = umbrechen(pos.konfiguration.wert, breiteInnen - konfigLabelSpalte);

    // Vergleichbare Installationen: je Treffer eine (umbrechende) Zeile.
    const vergleichZeilen = (pos.vergleiche?.zeilen ?? []).map((z) => {
      schrift("normal", KOMPAKT.vergleich);
      return umbrechen(z.kurz, breiteInnen);
    });
    const fussHoehe =
      vergleichZeilen.length > 0
        ? 1 + zhLabel + vergleichZeilen.reduce((summe, z) => summe + z.length * zhVergleich, 0)
        : 0;

    const oben = pad + zeile1Hoehe + 0.8 + zeile2Hoehe;
    const konfigHoehe = (rest: number) => Math.max(konfigLabelHoehe, rest * zhWert);
    const gesamtHoehe = oben + konfigHoehe(konfigZeilen.length) + fussHoehe + pad;
    if (!zeichnen) return gesamtHoehe;

    function rahmen(yOben: number, hoehe: number) {
      doc.setDrawColor(FARBE.rule[0], FARBE.rule[1], FARBE.rule[2]);
      doc.setLineWidth(0.25);
      doc.rect(RAND, yOben, inhaltsBreite, hoehe, "S");
      doc.setFillColor(FARBE.signal[0], FARBE.signal[1], FARBE.signal[2]);
      doc.rect(RAND, yOben, streifen, hoehe, "F");
    }

    function kopfZeichnen(yOben: number) {
      let yy = yOben + pad;
      schrift("bold", KOMPAKT.karteTitel);
      textKompakt(titelZeilen, xInnen, yy);
      let produktX = xInnen;
      if (einzeilig) produktX = xInnen + titelBreite + 4;
      else yy += titelZeilen.length * zhTitel;
      // Beschriftung auf die Grundlinie des Produkts ausrichten (kleinere Schrift).
      kleinesLabel(pos.produktLabel, produktX, yy + (zhTitel - zhLabel) * 0.6, produktLabelBreite + 2, true);
      schrift("normal", KOMPAKT.karteTitel);
      textKompakt(produktZeilen, produktX + produktLabelBreite + 1.5, yy);
      yy += (einzeilig ? 1 : produktZeilen.length) * zhTitel + 0.8;
      for (const p of paare) {
        const py = yy + p.zeile * zhWert;
        kleinesLabel(p.label, xInnen + p.x, py + (zhWert - zhLabel) * 0.6, p.labelB + 2, true);
        schrift("normal", KOMPAKT.wert);
        textKompakt(p.wert, xInnen + p.x + p.labelB + 1.5, py);
      }
    }

    function konfigZeichnen(zeilen: string[], yOben: number, mitLabel: boolean) {
      if (mitLabel) kleinesLabel(pos.konfiguration.label, xInnen, yOben + (zhWert - zhLabel) * 0.6, konfigLabelSpalte, true);
      schrift("normal", KOMPAKT.wert);
      zeilen.forEach((z, i) => textKompakt(z, xInnen + konfigLabelSpalte, yOben + i * zhWert));
    }

    function fussZeichnen(yOben: number) {
      if (!pos.vergleiche || vergleichZeilen.length === 0) return;
      let yy = yOben + 1;
      kleinesLabel(pos.vergleiche.label, xInnen, yy, breiteInnen, true);
      yy += zhLabel;
      schrift("normal", KOMPAKT.vergleich, FARBE.inkSoft);
      for (const z of vergleichZeilen) {
        textKompakt(z, xInnen, yy);
        yy += z.length * zhVergleich;
      }
    }

    let rest = konfigZeilen;
    let erstes = true;
    for (;;) {
      const kopf = erstes ? oben : pad;
      const benoetigt = kopf + konfigHoehe(rest.length) + fussHoehe + pad;
      if (y + benoetigt <= INHALT_UNTEN) {
        rahmen(y, benoetigt);
        if (erstes) kopfZeichnen(y);
        konfigZeichnen(rest, y + kopf, erstes);
        fussZeichnen(y + kopf + konfigHoehe(rest.length));
        y += benoetigt + KARTEN_ABSTAND;
        return benoetigt;
      }
      const passtAufLeereSeite = benoetigt <= INHALT_UNTEN - RAND;
      const zuWenigPlatz = y + kopf + 3 * zhWert + pad > INHALT_UNTEN;
      if ((passtAufLeereSeite && y > RAND) || zuWenigPlatz) {
        neueSeite();
        continue;
      }
      // Karte ist höher als eine Seite: so viele Zeilen wie möglich, Rest folgt.
      const anzahl = Math.max(1, Math.floor((INHALT_UNTEN - y - kopf - pad) / zhWert));
      const hoehe = kopf + anzahl * zhWert + pad;
      rahmen(y, hoehe);
      if (erstes) kopfZeichnen(y);
      konfigZeichnen(rest.slice(0, anzahl), y + kopf, erstes);
      rest = rest.slice(anzahl);
      erstes = false;
      neueSeite();
    }
  }

  /** Kompakter Hinweis in einer Zeile (z.B. "Keine Positionen erfasst."). */
  function hinweisKompakt(text: string, zeichnen: boolean): number {
    schrift("normal", KOMPAKT.notiz, FARBE.annot);
    const zeilen = umbrechen(text, inhaltsBreite);
    const hoehe = zeilen.length * zhK(KOMPAKT.notiz) + 1.5;
    if (zeichnen) {
      platzPruefen(hoehe);
      textKompakt(zeilen, RAND, y);
      y += hoehe;
    }
    return hoehe;
  }

  /**
   * Bänder laufen fortlaufend: nur das erste beginnt nach dem Deckblatt auf
   * einer neuen Seite. Der Bandkopf bleibt immer bei seiner ersten
   * Positionskarte (bzw. dem Hinweis "Keine Positionen erfasst") - passt das
   * nicht mehr auf die Restseite, beginnt das Band auf der nächsten Seite.
   */
  function band(b: BerichtBand, index: number) {
    if (index === 0) neueSeite();
    else y += BAND_ABSTAND;

    const kopfHoehe = bandKopf(b, false) + bandAbschnitt(b.positionenTitel, false);
    const ersteHoehe =
      b.positionen.length > 0 ? positionKarte(b.positionen[0], false) : hinweisKompakt(b.keinePositionen, false);
    if (y > RAND && y + kopfHoehe + ersteHoehe > INHALT_UNTEN) neueSeite();

    bandKopf(b, true);
    bandAbschnitt(b.positionenTitel, true);
    if (b.positionen.length === 0) hinweisKompakt(b.keinePositionen, true);
    b.positionen.forEach((pos) => positionKarte(pos));

    fotoRaster(b);
  }

  /**
   * Kompaktes Fotoraster: drei Fotos je Zeile, im echten Seitenverhältnis,
   * höchstens FOTO_MAX_HOEHE hoch (Hochformat wird schmaler, nichts verzerrt
   * oder abgeschnitten). Bildunterschrift klein und einzeilig. Eine
   * Rasterzeile wird nicht über einen Seitenumbruch geteilt; die Beschriftung
   * "Fotos" bleibt bei der ersten Zeile. Fehlt ein Foto, steht dort ein
   * Hinweis, der Export läuft weiter.
   */
  function fotoRaster(b: BerichtBand) {
    if (b.fotos.length === 0) {
      const hoehe = bandAbschnitt(b.fotosTitel, false) + hinweisKompakt(b.keineFotos, false);
      platzPruefen(hoehe);
      bandAbschnitt(b.fotosTitel, true);
      hinweisKompakt(b.keineFotos, true);
      return;
    }
    const spaltenAbstand = 3;
    const spaltenBreite = (inhaltsBreite - spaltenAbstand * (FOTO_SPALTEN - 1)) / FOTO_SPALTEN;
    const zhUnterschrift = zhK(KOMPAKT.unterschrift);

    // Einzeilige Bildunterschrift, bei Überlänge mit "…" gekürzt.
    function unterschriftKuerzen(text: string): string {
      schrift("normal", KOMPAKT.unterschrift);
      if (doc.getTextWidth(text) <= spaltenBreite) return text;
      let kurz = text;
      while (kurz.length > 1 && doc.getTextWidth(`${kurz}…`) > spaltenBreite) kurz = kurz.slice(0, -1);
      return `${kurz.trimEnd()}…`;
    }

    const reihen: { foto: BerichtBand["fotos"][number]; bild: BerichtBild | null; masse: { breite: number; hoehe: number } }[][] = [];
    for (let i = 0; i < b.fotos.length; i += FOTO_SPALTEN) {
      reihen.push(
        b.fotos.slice(i, i + FOTO_SPALTEN).map((foto) => {
          const bild = fotos.get(foto.url) ?? null;
          const masse = bild
            ? bildEinpassen(bild, spaltenBreite, FOTO_MAX_HOEHE)
            : { breite: spaltenBreite, hoehe: FOTO_PLATZHALTER_HOEHE };
          return { foto, bild, masse };
        }),
      );
    }
    const reihenHoehe = (reihe: (typeof reihen)[number]) =>
      Math.max(...reihe.map((z) => z.masse.hoehe)) + 0.8 + zhUnterschrift + 2.5;

    // Beschriftung "Fotos" zusammen mit der ersten Zeile.
    platzPruefen(bandAbschnitt(b.fotosTitel, false) + reihenHoehe(reihen[0]));
    bandAbschnitt(b.fotosTitel, true);

    for (const reihe of reihen) {
      const hoehe = reihenHoehe(reihe);
      platzPruefen(hoehe);
      reihe.forEach((z, s) => {
        const x = RAND + s * (spaltenBreite + spaltenAbstand);
        let eingebettet = false;
        if (z.bild) {
          try {
            // Alias = URL: dasselbe Foto wird nur einmal eingebettet.
            doc.addImage(z.bild.daten, z.bild.format, x, y, z.masse.breite, z.masse.hoehe, z.foto.url, "FAST");
            eingebettet = true;
          } catch {
            eingebettet = false;
          }
        }
        if (!eingebettet) {
          const h = z.bild ? z.masse.hoehe : FOTO_PLATZHALTER_HOEHE;
          doc.setDrawColor(FARBE.rule[0], FARBE.rule[1], FARBE.rule[2]);
          doc.setLineWidth(0.25);
          doc.rect(x, y, z.masse.breite, h, "S");
          schrift("normal", KOMPAKT.notiz, FARBE.annot);
          const zeilen = umbrechen(modell.texte.fotoNichtVerfuegbar, z.masse.breite - 4);
          textKompakt(zeilen, x + 2, y + h / 2 - (zeilen.length * zhK(KOMPAKT.notiz)) / 2);
        }
        schrift("normal", KOMPAKT.unterschrift, FARBE.inkSoft);
        textKompakt(unterschriftKuerzen(z.foto.unterschrift), x, y + z.masse.hoehe + 0.8);
      });
      y += hoehe;
    }
  }

  /**
   * Fußzeile auf jeder Seite, erst nach dem Erzeugen aller Seiten gesetzt
   * (erst dann steht die Gesamtzahl fest). Ein sehr langer Kundenname wird
   * mit "…" gekürzt, damit er die Seitenzahl nicht überdeckt.
   */
  function fusszeilen() {
    const gesamt = doc.getNumberOfPages();
    for (let seite = 1; seite <= gesamt; seite++) {
      doc.setPage(seite);
      const yLinie = INHALT_UNTEN + 5;
      linie(RAND, rechts, yLinie, FARBE.rule, 0.2);
      schrift("normal", GROESSE.fusszeile, FARBE.inkSoft);
      const seitenText = modell.texte.seiteVorlage.replace("{x}", String(seite)).replace("{y}", String(gesamt));
      textOben(seitenText, rechts, yLinie + 1.8, { align: "right" });
      const maxBreite = inhaltsBreite - doc.getTextWidth(seitenText) - 8;
      let links = modell.texte.fusszeile;
      if (doc.getTextWidth(links) > maxBreite) {
        while (links.length > 1 && doc.getTextWidth(`${links}…`) > maxBreite) links = links.slice(0, -1);
        links = `${links.trimEnd()}…`;
      }
      textOben(links, RAND, yLinie + 1.8);
    }
  }

  deckblatt();
  modell.baender.forEach(band);
  fusszeilen();

  return doc;
}

async function alsBase64(url: string): Promise<string> {
  const antwort = await fetch(url);
  if (!antwort.ok) throw new Error(`Schrift nicht geladen: ${url}`);
  const bytes = new Uint8Array(await antwort.arrayBuffer());
  let binaer = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binaer += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binaer);
}

/**
 * Lädt die CJK-Schrift erst beim Export in Chinesisch oder Japanisch (statische
 * Dateien unter public/fonts/, nicht im Bundle) - die übrigen Sprachen laden
 * nichts zusätzlich.
 */
async function cjkSchriftLaden(sprache: BerichtModell["sprache"]): Promise<CjkSchrift | null> {
  if (sprache !== "zh" && sprache !== "ja") return null;
  return alsBase64(cjkSchriftDatei(sprache));
}

export async function werksbesichtigungAlsPdf(modell: BerichtModell) {
  const [fotos, schrift] = await Promise.all([berichtFotosLaden(modell), cjkSchriftLaden(modell.sprache)]);
  const doc = berichtPdfErstellen(modell, fotos, schrift);
  doc.save(`${modell.dateiname}.pdf`);
}

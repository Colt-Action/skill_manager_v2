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
  unterschrift: 8,
  fusszeile: 7.5,
};

/** Höchste Höhe eines Fotos in mm - ein Foto füllt nie die ganze Seite. */
const FOTO_MAX_HOEHE = 85;
const FOTO_PLATZHALTER_HOEHE = 30;

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

  /** Kopf der Bandseite: Nummer groß links, rechts Label und Förderband-ID in Signalorange. */
  function bandKopf(b: BerichtBand) {
    neueSeite();
    linie(RAND, rechts, y, FARBE.ink, 0.7);
    y += 4;
    schrift("bold", GROESSE.bandNummer);
    const nummerBreite = Math.max(doc.getTextWidth(b.nummer), 10) + 6;
    textOben(b.nummer, RAND, y);
    const nummerHoehe = GROESSE.bandNummer * MM_PRO_PT;

    const x = RAND + nummerBreite;
    const breite = inhaltsBreite - nummerBreite;
    const labelHoehe = labelSetzen(b.idLabel, x, y + 0.5, breite);
    schrift("bold", GROESSE.bandId, FARBE.signal);
    const idZeilen = umbrechen(b.id, breite);
    textOben(idZeilen, x, y + 0.5 + labelHoehe + 0.5);
    const idHoehe = 0.5 + labelHoehe + 0.5 + idZeilen.length * zeilenhoehe(GROESSE.bandId);

    y += Math.max(nummerHoehe, idHoehe) + 3;
    linie(RAND, rechts, y, FARBE.rule, 0.2);
  }

  /**
   * Positionskarte: Rahmen, links 3 mm Streifen in Signalorange. Die Höhe wird
   * vorab berechnet, damit die Karte nicht über einen Seitenumbruch geteilt
   * wird. Nur eine Karte, die selbst höher als eine ganze Seite ist (sehr
   * lange Konfiguration), läuft mit fortgesetztem Streifen auf der nächsten
   * Seite weiter.
   */
  function positionKarte(pos: BerichtPosition) {
    const streifen = 3;
    const pad = 3.5;
    const xInnen = RAND + streifen + 4;
    const breiteInnen = inhaltsBreite - streifen - 4 - 4;
    const spaltenAbstand = 6;
    const spaltenBreite = (breiteInnen - spaltenAbstand) / 2;
    // Geltende Felder des Produkts (0 bis 2, nebeneinander), dann Konfiguration.
    const paar = pos.felder;
    const konfiguration = pos.konfiguration;

    // Messen.
    schrift("bold", GROESSE.wert);
    const titelZeilen = umbrechen(pos.titel, breiteInnen);
    schrift("bold", GROESSE.produkt);
    const produktZeilen = umbrechen(pos.produkt, breiteInnen);
    schrift("normal", GROESSE.label);
    const labelH = zeilenhoehe(GROESSE.label);
    const zh = zeilenhoehe(GROESSE.wert);
    const paarZeilen = paar.map((f) => {
      schrift("normal", GROESSE.wert);
      return umbrechen(f.wert, spaltenBreite);
    });
    schrift("normal", GROESSE.wert);
    const konfigZeilen = umbrechen(konfiguration.wert, breiteInnen);
    // Zeile mit den geltenden Feldern entfällt ganz, wenn das Produkt keine hat.
    const paarHoehe = paar.length > 0 ? labelH + 0.8 + Math.max(...paarZeilen.map((z) => z.length)) * zh + 2.5 : 0;

    const kopfHoehe =
      pad +
      titelZeilen.length * zh +
      2 +
      labelH +
      0.8 +
      produktZeilen.length * zeilenhoehe(GROESSE.produkt) +
      2.5 +
      paarHoehe +
      labelH +
      0.8;

    function rahmen(yOben: number, hoehe: number) {
      doc.setDrawColor(FARBE.rule[0], FARBE.rule[1], FARBE.rule[2]);
      doc.setLineWidth(0.3);
      doc.rect(RAND, yOben, inhaltsBreite, hoehe, "S");
      doc.setFillColor(FARBE.signal[0], FARBE.signal[1], FARBE.signal[2]);
      doc.rect(RAND, yOben, streifen, hoehe, "F");
    }

    function kopfZeichnen(yOben: number) {
      let yy = yOben + pad;
      schrift("bold", GROESSE.wert);
      textOben(titelZeilen, xInnen, yy);
      yy += titelZeilen.length * zh + 2;
      yy += labelSetzen(pos.produktLabel, xInnen, yy, breiteInnen) + 0.8;
      schrift("bold", GROESSE.produkt);
      textOben(produktZeilen, xInnen, yy);
      yy += produktZeilen.length * zeilenhoehe(GROESSE.produkt) + 2.5;
      paar.forEach((f, i) => {
        const x = xInnen + i * (spaltenBreite + spaltenAbstand);
        labelSetzen(f.label, x, yy, spaltenBreite);
        schrift("normal", GROESSE.wert);
        textOben(paarZeilen[i], x, yy + labelH + 0.8);
      });
      yy += paarHoehe;
      labelSetzen(konfiguration.label, xInnen, yy, breiteInnen);
    }

    function zeilenZeichnen(zeilen: string[], yOben: number) {
      schrift("normal", GROESSE.wert);
      zeilen.forEach((zeile, i) => textOben(zeile, xInnen, yOben + i * zh));
    }

    let rest = konfigZeilen;
    let erstes = true;
    for (;;) {
      const oben = erstes ? kopfHoehe : pad;
      const benoetigt = oben + rest.length * zh + pad;
      if (y + benoetigt <= INHALT_UNTEN) {
        rahmen(y, benoetigt);
        if (erstes) kopfZeichnen(y);
        zeilenZeichnen(rest, y + oben);
        y += benoetigt + 4;
        return;
      }
      const passtAufLeereSeite = benoetigt <= INHALT_UNTEN - RAND;
      const zuWenigPlatz = y + oben + 3 * zh + pad > INHALT_UNTEN;
      if ((passtAufLeereSeite && y > RAND) || zuWenigPlatz) {
        neueSeite();
        continue;
      }
      // Karte ist höher als eine Seite: so viele Zeilen wie möglich, Rest folgt.
      const anzahl = Math.floor((INHALT_UNTEN - y - oben - pad) / zh);
      const hoehe = oben + anzahl * zh + pad;
      rahmen(y, hoehe);
      if (erstes) kopfZeichnen(y);
      zeilenZeichnen(rest.slice(0, anzahl), y + oben);
      rest = rest.slice(anzahl);
      erstes = false;
      neueSeite();
    }
  }

  function band(b: BerichtBand) {
    bandKopf(b);
    feldRaster(b.felder);
    feldLang(b.notizen);

    abschnitt(b.positionenTitel);
    if (b.positionen.length === 0) hinweis(b.keinePositionen);
    b.positionen.forEach(positionKarte);

    fotoRaster(b);
  }

  /**
   * Fotos des Bands im Raster mit zwei Spalten, im echten Seitenverhältnis
   * und in der Höhe begrenzt. Eine Rasterzeile wird nicht über einen
   * Seitenumbruch geteilt. Fehlt ein Foto, steht dort ein Hinweis.
   */
  function fotoRaster(b: BerichtBand) {
    abschnitt(b.fotosTitel, FOTO_MAX_HOEHE / 2);
    if (b.fotos.length === 0) {
      hinweis(b.keineFotos);
      return;
    }
    const abstand = 6;
    const spaltenBreite = (inhaltsBreite - abstand) / 2;
    const zhUnterschrift = zeilenhoehe(GROESSE.unterschrift);

    for (let i = 0; i < b.fotos.length; i += 2) {
      const zellen = b.fotos.slice(i, i + 2).map((foto) => {
        const bild = fotos.get(foto.url) ?? null;
        const masse = bild
          ? bildEinpassen(bild, spaltenBreite, FOTO_MAX_HOEHE)
          : { breite: spaltenBreite, hoehe: FOTO_PLATZHALTER_HOEHE };
        schrift("normal", GROESSE.unterschrift);
        return { foto, bild, masse, unterschrift: umbrechen(foto.unterschrift, spaltenBreite) };
      });
      const bildHoehe = Math.max(...zellen.map((z) => z.masse.hoehe));
      const hoehe = bildHoehe + 1.5 + Math.max(...zellen.map((z) => z.unterschrift.length)) * zhUnterschrift + 5;
      platzPruefen(hoehe);

      zellen.forEach((z, s) => {
        const x = RAND + s * (spaltenBreite + abstand);
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
          doc.setLineWidth(0.3);
          doc.rect(x, y, z.masse.breite, h, "S");
          schrift("normal", GROESSE.wert, FARBE.annot);
          const zeilen = umbrechen(modell.texte.fotoNichtVerfuegbar, z.masse.breite - 6);
          textOben(zeilen, x + 3, y + h / 2 - (zeilen.length * zeilenhoehe(GROESSE.wert)) / 2);
        }
        schrift("normal", GROESSE.unterschrift, FARBE.inkSoft);
        textOben(z.unterschrift, x, y + z.masse.hoehe + 1.5);
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

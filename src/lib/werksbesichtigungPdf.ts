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
};

/** Höchste Höhe eines Fotos in mm - ein Foto füllt nie die ganze Seite. */
const FOTO_MAX_HOEHE = 85;
const FOTO_PLATZHALTER_HOEHE = 30;

export function berichtPdfErstellen(modell: BerichtModell, fotos: Map<string, BerichtBild | null>): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const seitenBreite = doc.internal.pageSize.getWidth();
  const inhaltsBreite = seitenBreite - RAND * 2;
  const rechts = RAND + inhaltsBreite;
  const familie = "helvetica";
  let y = RAND;

  // --- Grundbausteine -------------------------------------------------------

  function schrift(stil: "normal" | "bold", groesse: number, farbe: Rgb = FARBE.ink) {
    doc.setFont(familie, stil);
    doc.setFontSize(groesse);
    doc.setTextColor(farbe[0], farbe[1], farbe[2]);
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
    const [segment, verlagerung, konfiguration] = pos.felder;

    // Messen.
    schrift("bold", GROESSE.wert);
    const titelZeilen = umbrechen(pos.titel, breiteInnen);
    schrift("bold", GROESSE.produkt);
    const produktZeilen = umbrechen(pos.produkt, breiteInnen);
    schrift("normal", GROESSE.label);
    const labelH = zeilenhoehe(GROESSE.label);
    const zh = zeilenhoehe(GROESSE.wert);
    const paarZeilen = [segment, verlagerung].map((f) => {
      schrift("normal", GROESSE.wert);
      return umbrechen(f.wert, spaltenBreite);
    });
    schrift("normal", GROESSE.wert);
    const konfigZeilen = umbrechen(konfiguration.wert, breiteInnen);

    const kopfHoehe =
      pad +
      titelZeilen.length * zh +
      2 +
      labelH +
      0.8 +
      produktZeilen.length * zeilenhoehe(GROESSE.produkt) +
      2.5 +
      labelH +
      0.8 +
      Math.max(...paarZeilen.map((z) => z.length)) * zh +
      2.5 +
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
      [segment, verlagerung].forEach((f, i) => {
        const x = xInnen + i * (spaltenBreite + spaltenAbstand);
        labelSetzen(f.label, x, yy, spaltenBreite);
        schrift("normal", GROESSE.wert);
        textOben(paarZeilen[i], x, yy + labelH + 0.8);
      });
      yy += labelH + 0.8 + Math.max(...paarZeilen.map((z) => z.length)) * zh + 2.5;
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

  deckblatt();
  modell.baender.forEach(band);

  return doc;
}

export async function werksbesichtigungAlsPdf(modell: BerichtModell) {
  const fotos = await berichtFotosLaden(modell);
  const doc = berichtPdfErstellen(modell, fotos);
  doc.save(`${modell.dateiname}.pdf`);
}

import { jsPDF } from "jspdf";
import { berichtFotosLaden, type BerichtBild, type BerichtFeld, type BerichtModell } from "@/lib/werksbesichtigungBericht";

// Zeichnet das Berichtsmodell (lib/werksbesichtigungBericht.ts) als PDF.
// Alle Texte kommen fertig aus dem Modell.
export function berichtPdfErstellen(modell: BerichtModell, fotos: Map<string, BerichtBild | null>): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const seitenBreite = doc.internal.pageSize.getWidth();
  const seitenHoehe = doc.internal.pageSize.getHeight();
  const rand = 18;
  const inhaltsBreite = seitenBreite - rand * 2;
  let y = rand;

  function platzPruefen(benoetigt: number) {
    if (y + benoetigt > seitenHoehe - rand) {
      doc.addPage();
      y = rand;
    }
  }

  function ueberschrift(text: string, groesse = 16) {
    platzPruefen(groesse * 0.6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(groesse);
    doc.text(text, rand, y);
    y += groesse * 0.6;
    doc.setFont("helvetica", "normal");
  }

  function zeile({ label, wert }: BerichtFeld) {
    doc.setFontSize(10);
    const zeilen: string[] = doc.splitTextToSize(wert, inhaltsBreite - 55);
    platzPruefen(zeilen.length * 5 + 1);
    doc.setFont("helvetica", "bold");
    doc.text(label, rand, y);
    doc.setFont("helvetica", "normal");
    doc.text(zeilen, rand + 55, y);
    y += zeilen.length * 5 + 1;
  }

  ueberschrift(`${modell.titel} – ${modell.kunde}`, 18);
  y += 2;
  modell.deckblatt.forEach(zeile);
  zeile(modell.notizen);

  for (const band of modell.baender) {
    y += 6;
    ueberschrift(`${band.titel} · ${band.id}`, 13);
    band.felder.forEach(zeile);
    zeile(band.notizen);

    if (band.positionen.length === 0) zeile({ label: band.positionenTitel, wert: band.keinePositionen });
    for (const pos of band.positionen) {
      y += 1;
      ueberschrift(pos.titel, 11);
      zeile({ label: pos.produktLabel, wert: pos.produkt });
      pos.felder.forEach(zeile);
    }

    const bildBreite = (inhaltsBreite - 4) / 2;
    const bildHoehe = bildBreite * 0.75;
    let spalte = 0;
    for (const foto of band.fotos) {
      const bild = fotos.get(foto.url);
      if (!bild) continue;
      platzPruefen(bildHoehe + 4);
      const x = rand + spalte * (bildBreite + 4);
      try {
        doc.addImage(bild.daten, bild.format, x, y, bildBreite, bildHoehe, undefined, "FAST");
      } catch {
        // Foto konnte nicht eingebettet werden (z.B. unbekanntes Format) - überspringen.
      }
      spalte += 1;
      if (spalte === 2) {
        spalte = 0;
        y += bildHoehe + 4;
      }
    }
    if (spalte === 1) y += bildHoehe + 4;
  }

  return doc;
}

export async function werksbesichtigungAlsPdf(modell: BerichtModell) {
  const fotos = await berichtFotosLaden(modell);
  const doc = berichtPdfErstellen(modell, fotos);
  doc.save(`${modell.dateiname}.pdf`);
}

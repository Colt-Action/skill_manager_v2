import { jsPDF } from "jspdf";
import type { FoerderbandEintragMitDetails, Werksbesichtigung } from "@/lib/supabase/types";

// Holt ein Foto von seiner öffentlichen Supabase-Storage-URL und wandelt es
// in eine Data-URL um, da jsPDF Bilder nicht direkt per URL einbetten kann.
async function bildAlsDataUrl(url: string): Promise<string | null> {
  try {
    const antwort = await fetch(url);
    if (!antwort.ok) return null;
    const blob = await antwort.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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

export async function werksbesichtigungAlsPdf(
  besuch: Werksbesichtigung,
  eintraege: FoerderbandEintragMitDetails[],
  datumFormatiert: string,
) {
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

  function zeile(label: string, wert: string | null | undefined) {
    if (!wert) return;
    platzPruefen(6);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, rand, y);
    doc.setFont("helvetica", "normal");
    doc.text(wert, rand + 40, y);
    y += 6;
  }

  function absatz(text: string) {
    if (!text.trim()) return;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const zeilen = doc.splitTextToSize(text, inhaltsBreite);
    platzPruefen(zeilen.length * 5 + 2);
    doc.text(zeilen, rand, y);
    y += zeilen.length * 5 + 2;
  }

  ueberschrift(`Werksbesichtigung – ${besuch.kunde}`, 18);
  y += 2;
  zeile("Kunde", besuch.kunde);
  zeile("Partner / Besucht mit", besuch.partner);
  zeile("Ort", besuch.ort);
  zeile("Datum", datumFormatiert);
  if (besuch.notizen.trim()) {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    platzPruefen(6);
    doc.text("Allgemeine Notizen", rand, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    absatz(besuch.notizen);
  }

  for (const eintrag of eintraege) {
    y += 6;
    platzPruefen(14);
    doc.setDrawColor(200);
    doc.line(rand, y - 4, seitenBreite - rand, y - 4);
    ueberschrift(eintrag.bezeichnung || "Förderband", 13);

    zeile("Material", eintrag.material === "Sonstiges" ? eintrag.material_sonstiges : eintrag.material);
    zeile("Bandbreite", eintrag.foerderbandbreite);
    zeile("Geschwindigkeit", eintrag.geschwindigkeit_ms != null ? `${eintrag.geschwindigkeit_ms.toFixed(1)} m/s` : null);
    zeile("Gurtverbindung", eintrag.belt_connection);
    zeile("Gurtzustand", eintrag.gurtzustand ? GURTZUSTAND_LABEL[eintrag.gurtzustand] : null);
    zeile("Schurren-Maße", eintrag.schurren_masse);

    for (const pos of eintrag.foerderband_positionen) {
      y += 1;
      const positionsLabel =
        pos.position === "freifeld" ? pos.position_freitext || "Freifeld" : (POSITION_LABEL[pos.position] ?? pos.position);
      zeile("Position", positionsLabel);
      zeile("Produkt-Empfehlung", pos.kategorien?.name ?? null);
      if (pos.konfiguration.trim()) {
        zeile("Konfiguration", pos.konfiguration);
      }
    }

    if (eintrag.notizen.trim()) {
      y += 1;
      absatz(eintrag.notizen);
    }

    if (eintrag.foerderband_fotos.length > 0) {
      y += 2;
      const bildBreite = (inhaltsBreite - 4) / 2;
      const bildHoehe = bildBreite * 0.75;
      let spalte = 0;
      for (const foto of eintrag.foerderband_fotos) {
        const dataUrl = await bildAlsDataUrl(foto.foto_url);
        if (!dataUrl) continue;
        platzPruefen(bildHoehe + 4);
        const x = rand + spalte * (bildBreite + 4);
        try {
          doc.addImage(dataUrl, "JPEG", x, y, bildBreite, bildHoehe, undefined, "FAST");
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
  }

  const dateiname = `Werksbesichtigung-${besuch.kunde.replace(/[^\p{L}\p{N}]+/gu, "-")}-${besuch.datum}.pdf`;
  doc.save(dateiname);
}

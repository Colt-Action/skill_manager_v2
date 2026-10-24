// Prüft einen Link aus einem Formularfeld (z.B. "Verknüpfung HOSCHiris DATA"),
// im Browser für die Meldung und auf dem Server vor dem Speichern.
// Leer ist erlaubt (url = null). Sonst nur http:// oder https:// mit einer
// gültigen Adresse; andere Schemata wie javascript: werden abgelehnt.
// Leerzeichen am Rand werden entfernt.
export function linkPruefen(roh: string | null | undefined): { ok: true; url: string | null } | { ok: false } {
  const wert = (roh ?? "").trim();
  if (!wert) return { ok: true, url: null };
  if (!/^https?:\/\//i.test(wert)) return { ok: false };
  try {
    const url = new URL(wert);
    if (url.protocol !== "http:" && url.protocol !== "https:") return { ok: false };
    // Gültige Adresse: Hostname mit mindestens einem Punkt (z.B. data.hosch.de).
    if (!url.hostname || !url.hostname.includes(".") || url.hostname.startsWith(".") || url.hostname.endsWith(".")) {
      return { ok: false };
    }
    return { ok: true, url: wert };
  } catch {
    return { ok: false };
  }
}

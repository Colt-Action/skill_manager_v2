import { WOERTERBUCH } from "./woerterbuch";
import { STANDARD_SPRACHE, type Sprache } from "./sprachen";

// Übersetzt einen Wörterbuch-Schlüssel in die gewünschte Sprache. Fehlt der
// Schlüssel für diese Sprache, wird auf Deutsch zurückgefallen; fehlt der
// Schlüssel komplett, wird der Schlüssel selbst angezeigt (auffällig genug,
// um beim Testen aufzufallen, aber die Seite bleibt benutzbar).
export function t(
  schluessel: string,
  sprache: Sprache = STANDARD_SPRACHE,
  variablen?: Record<string, string>,
): string {
  const eintrag = WOERTERBUCH[schluessel];
  let text = eintrag?.[sprache] ?? eintrag?.[STANDARD_SPRACHE] ?? schluessel;

  if (variablen) {
    for (const [name, wert] of Object.entries(variablen)) {
      text = text.replace(`{${name}}`, wert);
    }
  }

  return text;
}

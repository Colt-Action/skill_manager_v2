export type Sprache = "de" | "en" | "es" | "pt" | "sv" | "fi" | "zh" | "ja" | "id" | "ms" | "af";

export const STANDARD_SPRACHE: Sprache = "de";

// Eigenname jeder Sprache, wie er im Auswahl-Dropdown erscheint.
export const SPRACHEN: { code: Sprache; label: string }[] = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "sv", label: "Svenska" },
  { code: "fi", label: "Suomi" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "af", label: "Afrikaans" },
];

export function istGueltigeSprache(wert: string): wert is Sprache {
  return SPRACHEN.some((s) => s.code === wert);
}

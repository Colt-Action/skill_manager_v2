"use server";

import { createClient } from "@/lib/supabase/server";

// Wird aufgerufen, wenn eine Freitextsuche keine Treffer liefert. Das
// Ergebnis landet im Analytics-Dashboard, damit Trainer sehen, wonach
// Techniker suchen, ohne fündig zu werden.
export async function sucheOhneTrefferProtokollieren(suchbegriff: string) {
  const begriff = suchbegriff.trim();
  if (!begriff) return;

  const supabase = await createClient();
  await supabase.from("suchanfragen_ohne_treffer").insert({ suchbegriff: begriff });
}

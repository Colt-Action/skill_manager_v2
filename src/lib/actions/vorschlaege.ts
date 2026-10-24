"use server";

import { createClient } from "@/lib/supabase/server";
import { produktZurKategorie } from "@/lib/produktFelder";
import type { VorschlagReferenz } from "@/lib/referenzVorschlaege";
import type { Kategorie } from "@/lib/supabase/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Höchstens so viele Referenzen je Abfrage (neueste zuerst) - reicht für drei Vorschläge. */
const GRENZE = 200;

const SPALTEN =
  "id, erstellt_am, status, kategorie_id, teil_id, teile(kategorie_id), referenz_metadaten(material, material_sonstiges, foerderbandbreite, geschwindigkeit_ms, belt_connection, gurtzustand, land, abstreifsegment, verlagerung, ummantelung)";

/**
 * Lädt die Referenzen für "Vergleichbare Installationen": nur veröffentlichte
 * Referenzen der angegebenen Produkte (Ebene "produkt"), mit den für Abgleich
 * und Anzeige nötigen Feldern - ohne Titel. Berechtigung wie bei den übrigen
 * Referenzabfragen: eingeloggt, Sichtbarkeit regelt RLS (referenzen_select).
 * Ergebnis je Produkt-ID; Bewertung passiert im Browser
 * (lib/referenzVorschlaege.ts), auch mit noch ungespeicherten Bandwerten.
 */
export async function vorschlagReferenzenLaden(
  produktIds: string[],
): Promise<{ erfolg: true; referenzen: Record<string, VorschlagReferenz[]> } | { erfolg: false }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false };

  const ids = [...new Set(produktIds)].filter((id) => UUID.test(id)).slice(0, 20);
  if (ids.length === 0) return { erfolg: true, referenzen: {} };

  const { data: kategorienRoh, error: kategorieFehler } = await supabase
    .from("kategorien")
    .select("id, name, ebene, parent_kategorie_id");
  if (kategorieFehler) return { erfolg: false };
  const kategorien = (kategorienRoh ?? []) as Kategorie[];

  // Alle Kategorien unterhalb der Produkte (einschließlich der Produkte selbst).
  const unter = new Set(ids);
  let gewachsen = true;
  while (gewachsen) {
    gewachsen = false;
    for (const k of kategorien) {
      if (k.parent_kategorie_id && unter.has(k.parent_kategorie_id) && !unter.has(k.id)) {
        unter.add(k.id);
        gewachsen = true;
      }
    }
  }
  const kategorieIds = [...unter];

  // Wie im Referenzbereich zählt die eigene Kategorie, sonst die des Teils.
  const { data: teileRoh, error: teilFehler } = await supabase.from("teile").select("id").in("kategorie_id", kategorieIds);
  if (teilFehler) return { erfolg: false };
  const teilIds = (teileRoh ?? []).map((t) => t.id as string);

  const [mitKategorie, nurTeil] = await Promise.all([
    supabase
      .from("referenzen")
      .select(SPALTEN)
      .eq("status", "veroeffentlicht")
      .in("kategorie_id", kategorieIds)
      .order("erstellt_am", { ascending: false })
      .limit(GRENZE),
    teilIds.length > 0
      ? supabase
          .from("referenzen")
          .select(SPALTEN)
          .eq("status", "veroeffentlicht")
          .is("kategorie_id", null)
          .in("teil_id", teilIds)
          .order("erstellt_am", { ascending: false })
          .limit(GRENZE)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (mitKategorie.error || nurTeil.error) return { erfolg: false };

  const referenzen: Record<string, VorschlagReferenz[]> = Object.fromEntries(ids.map((id) => [id, []]));
  for (const ref of [...(mitKategorie.data ?? []), ...(nurTeil.data ?? [])] as unknown as VorschlagReferenz[]) {
    const teil = Array.isArray(ref.teile) ? ref.teile[0] : ref.teile;
    const produkt = produktZurKategorie(kategorien, ref.kategorie_id ?? teil?.kategorie_id ?? null);
    if (produkt && referenzen[produkt.id]) referenzen[produkt.id].push(ref);
  }
  return { erfolg: true, referenzen };
}

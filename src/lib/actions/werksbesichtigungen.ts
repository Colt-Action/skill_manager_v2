"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { FOERDERBAND_POSITIONEN, GURTZUSTAND_OPTIONEN } from "@/lib/werksbesichtigungOptionen";
import type {
  Aenderungen,
  BandFelder,
  BerichtFelder,
  PositionFelder,
  SpeicherErgebnis,
} from "@/lib/werksbesichtigungAenderungen";
import type { FoerderbandPosition, Gurtzustand, WerksbesichtigungStatus } from "@/lib/supabase/types";

// Scheitert ein Update/Delete an der Row Level Security, liefert PostgREST
// keinen Fehler, sondern ändert einfach 0 Zeilen. Deshalb zählen alle
// Update-/Löschaktionen die betroffenen Zeilen (count: "exact", bewusst ohne
// .select()/RETURNING, siehe werksbesichtigungErstellen) und melden nur dann
// Erfolg, wenn tatsächlich etwas geändert wurde.
const KEINE_ZEILE_BETROFFEN = "Keine Berechtigung oder Eintrag nicht mehr vorhanden.";

export async function werksbesichtigungErstellen(felder: {
  kunde: string;
  partner: string;
  ort: string;
  datum: string;
  datumBis: string | null;
  merkteamId: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };

  const kunde = felder.kunde.trim();
  if (!kunde) return { erfolg: false, fehler: "Bitte einen Kunden angeben." };

  // Die id wird bewusst vorab erzeugt statt über .select() nach dem Insert
  // zurückzuholen: Postgres prüft bei INSERT ... RETURNING zusätzlich die
  // SELECT-Policy im selben Statement, was bei einer Policy, die selbst
  // wieder über diese Tabelle liest (werksbesichtigung_sichtbar), fälschlich
  // mit einer RLS-Verletzung fehlschlägt - obwohl Insert und Sichtbarkeit für
  // sich genommen beide korrekt sind.
  const id = randomUUID();
  const { error } = await supabase.from("werksbesichtigungen").insert({
    id,
    ersteller_id: user.id,
    kunde,
    partner: felder.partner.trim() || null,
    ort: felder.ort.trim() || null,
    datum: felder.datum,
    datum_bis: felder.datumBis,
    merkteam_id: felder.merkteamId,
  });
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/werksbesichtigungen");
  return { erfolg: true, id };
}

// ----------------------------------------------------------------------------
// Zentrales Speichern: Bericht, Bänder und Positionen in einem Aufruf, aber
// ohne Transaktion - jeder Eintrag wird einzeln geschrieben und einzeln
// gemeldet. Es kommen nur geänderte Felder an (Overlay des
// WerksbesichtigungEditor). Alle Updates sind idempotent, ein erneuter Aufruf
// nach einem Teilfehler ist also gefahrlos.
// ----------------------------------------------------------------------------

function text(wert: unknown): string {
  return typeof wert === "string" ? wert : "";
}

function berichtSpalten(felder: Partial<BerichtFelder>): { spalten: Record<string, unknown>; fehler?: string } {
  const spalten: Record<string, unknown> = {};
  if ("kunde" in felder) {
    const kunde = text(felder.kunde).trim();
    if (!kunde) return { spalten, fehler: "Bitte einen Kunden angeben." };
    spalten.kunde = kunde;
  }
  if ("partner" in felder) spalten.partner = text(felder.partner).trim() || null;
  if ("ort" in felder) spalten.ort = text(felder.ort).trim() || null;
  if ("datum" in felder) {
    const datum = text(felder.datum);
    if (!datum) return { spalten, fehler: "Bitte ein Datum angeben." };
    spalten.datum = datum;
  }
  if ("datumBis" in felder) spalten.datum_bis = text(felder.datumBis) || null;
  if ("notizen" in felder) spalten.notizen = text(felder.notizen);
  return { spalten };
}

function bandSpalten(
  felder: Partial<BandFelder>,
  gespeicherteBezeichnung: string,
): { spalten: Record<string, unknown>; fehler?: string } {
  const spalten: Record<string, unknown> = {};
  // Die Förderband-ID ist Pflicht beim Speichern eines Bands - nicht beim
  // bloßen Anlegen (foerderbandEintragErstellen legt "" an). Geprüft wird der
  // Wert, der nach dem Speichern gelten würde, damit auch ein geändertes
  // Altband ohne ID abgelehnt wird; unveränderte Altbänder kommen gar nicht an.
  const bezeichnung = "bezeichnung" in felder ? text(felder.bezeichnung).trim() : gespeicherteBezeichnung.trim();
  if (!bezeichnung) return { spalten, fehler: "Bitte eine Förderband-ID angeben." };
  if ("bezeichnung" in felder) spalten.bezeichnung = bezeichnung;

  if ("material" in felder) {
    const material = text(felder.material);
    spalten.material = material || null;
    spalten.material_sonstiges = material === "Sonstiges" ? text(felder.materialSonstiges).trim() || null : null;
  } else if ("materialSonstiges" in felder) {
    spalten.material_sonstiges = text(felder.materialSonstiges).trim() || null;
  }
  if ("foerderbandbreite" in felder) spalten.foerderbandbreite = text(felder.foerderbandbreite) || null;
  if ("beltConnection" in felder) spalten.belt_connection = text(felder.beltConnection) || null;
  if ("gurtzustand" in felder) {
    const gurtzustand = text(felder.gurtzustand);
    if (gurtzustand && !GURTZUSTAND_OPTIONEN.includes(gurtzustand as Gurtzustand)) {
      return { spalten, fehler: "Ungültiger Gurtzustand." };
    }
    spalten.gurtzustand = gurtzustand || null;
  }
  if ("geschwindigkeit" in felder) {
    const wert = felder.geschwindigkeit;
    spalten.geschwindigkeit_ms = typeof wert === "number" && Number.isFinite(wert) && wert > 0 ? wert : null;
  }
  if ("schurrenMasse" in felder) spalten.schurren_masse = text(felder.schurrenMasse).trim() || null;
  if ("notizen" in felder) spalten.notizen = text(felder.notizen);
  return { spalten };
}

function positionSpalten(felder: Partial<PositionFelder>): { spalten: Record<string, unknown>; fehler?: string } {
  const spalten: Record<string, unknown> = {};
  if ("position" in felder) {
    const position = felder.position as FoerderbandPosition;
    if (!FOERDERBAND_POSITIONEN.includes(position)) return { spalten, fehler: "Ungültige Position." };
    spalten.position = position;
    spalten.position_freitext = position === "freifeld" ? text(felder.positionFreitext).trim() || null : null;
  } else if ("positionFreitext" in felder) {
    spalten.position_freitext = text(felder.positionFreitext).trim() || null;
  }
  if ("produktKategorieId" in felder) {
    spalten.produkt_kategorie_id = typeof felder.produktKategorieId === "string" ? felder.produktKategorieId : null;
  }
  if ("abstreifsegment" in felder) spalten.abstreifsegment = text(felder.abstreifsegment) || null;
  if ("verlagerung" in felder) spalten.verlagerung = text(felder.verlagerung) || null;
  if ("konfiguration" in felder) spalten.konfiguration = text(felder.konfiguration);
  return { spalten };
}

export async function werksbesichtigungSpeichern(id: string, aenderungen: Aenderungen): Promise<SpeicherErgebnis> {
  const supabase = await createClient();
  const ergebnis: SpeicherErgebnis = { gesamt: 0, ok: { bericht: false, baender: [], positionen: [] }, fehler: [] };

  const bericht = aenderungen.bericht ?? {};
  const baenderAenderungen = Object.entries(aenderungen.baender ?? {}).filter(([, f]) => Object.keys(f).length > 0);
  const positionenAenderungen = Object.entries(aenderungen.positionen ?? {}).filter(([, f]) => Object.keys(f).length > 0);

  // Bänder und Positionen dieses Berichts - für die Zugehörigkeitsprüfung,
  // die Nummern in Meldungen (gleiche Sortierung wie die Detailseite) und die
  // Förderband-ID-Prüfung bei Bändern, deren ID selbst nicht geändert wurde.
  const { data: baenderRoh, error: ladeFehler } = await supabase
    .from("foerderband_eintraege")
    .select("id, bezeichnung, foerderband_positionen(id)")
    .eq("werksbesichtigung_id", id)
    .order("reihenfolge", { ascending: true })
    .order("erstellt_am", { ascending: true })
    .order("reihenfolge", { referencedTable: "foerderband_positionen", ascending: true })
    .order("erstellt_am", { referencedTable: "foerderband_positionen", ascending: true });

  const baenderDieserBesichtigung = (baenderRoh ?? []) as {
    id: string;
    bezeichnung: string;
    foerderband_positionen: { id: string }[];
  }[];
  const bandInfo = new Map(baenderDieserBesichtigung.map((b, i) => [b.id, { nummer: i + 1, bezeichnung: b.bezeichnung }]));
  const positionInfo = new Map<string, { nummer: string; bandId: string }>();
  baenderDieserBesichtigung.forEach((band, bandIndex) => {
    band.foerderband_positionen.forEach((pos, posIndex) => {
      positionInfo.set(pos.id, { nummer: `Position ${posIndex + 1} an Förderband ${bandIndex + 1}`, bandId: band.id });
    });
  });
  const bandIdsDieserBesichtigung = baenderDieserBesichtigung.map((b) => b.id);

  // 1. Bericht
  if (Object.keys(bericht).length > 0) {
    ergebnis.gesamt += 1;
    const { spalten, fehler } = berichtSpalten(bericht);
    if (fehler) {
      ergebnis.fehler.push({ art: "bericht", id, nummer: "Allgemeine Angaben", meldung: fehler });
    } else {
      const { error, count } = await supabase
        .from("werksbesichtigungen")
        .update(spalten, { count: "exact" })
        .eq("id", id);
      if (error || count === 0) {
        ergebnis.fehler.push({
          art: "bericht",
          id,
          nummer: "Allgemeine Angaben",
          meldung: error?.message ?? KEINE_ZEILE_BETROFFEN,
        });
      } else {
        ergebnis.ok.bericht = true;
      }
    }
  }

  // 2. Bänder - nur über werksbesichtigung_id dieses Berichts
  for (const [bandId, felder] of baenderAenderungen) {
    ergebnis.gesamt += 1;
    const info = bandInfo.get(bandId);
    const nummer = info ? `Förderband ${info.nummer}` : "Förderband";
    if (ladeFehler || !info) {
      ergebnis.fehler.push({ art: "band", id: bandId, nummer, meldung: ladeFehler?.message ?? KEINE_ZEILE_BETROFFEN });
      continue;
    }
    const { spalten, fehler } = bandSpalten(felder, info.bezeichnung);
    if (fehler) {
      ergebnis.fehler.push({ art: "band", id: bandId, nummer, meldung: fehler });
      continue;
    }
    const { error, count } = await supabase
      .from("foerderband_eintraege")
      .update(spalten, { count: "exact" })
      .eq("id", bandId)
      .eq("werksbesichtigung_id", id);
    if (error || count === 0) {
      ergebnis.fehler.push({ art: "band", id: bandId, nummer, meldung: error?.message ?? KEINE_ZEILE_BETROFFEN });
    } else {
      ergebnis.ok.baender.push(bandId);
    }
  }

  // 3. Positionen - nur solche, die an einem Band dieses Berichts hängen
  for (const [positionId, felder] of positionenAenderungen) {
    ergebnis.gesamt += 1;
    const info = positionInfo.get(positionId);
    const nummer = info?.nummer ?? "Position";
    if (ladeFehler || !info) {
      ergebnis.fehler.push({
        art: "position",
        id: positionId,
        nummer,
        meldung: ladeFehler?.message ?? KEINE_ZEILE_BETROFFEN,
      });
      continue;
    }
    const { spalten, fehler } = positionSpalten(felder);
    if (fehler) {
      ergebnis.fehler.push({ art: "position", id: positionId, nummer, meldung: fehler });
      continue;
    }
    const { error, count } = await supabase
      .from("foerderband_positionen")
      .update(spalten, { count: "exact" })
      .eq("id", positionId)
      .in("foerderband_eintrag_id", bandIdsDieserBesichtigung);
    if (error || count === 0) {
      ergebnis.fehler.push({
        art: "position",
        id: positionId,
        nummer,
        meldung: error?.message ?? KEINE_ZEILE_BETROFFEN,
      });
    } else {
      ergebnis.ok.positionen.push(positionId);
    }
  }

  if (ergebnis.ok.bericht || ergebnis.ok.baender.length > 0 || ergebnis.ok.positionen.length > 0) {
    revalidatePath(`/werksbesichtigungen/${id}`);
    revalidatePath("/werksbesichtigungen");
  }
  return ergebnis;
}

export async function werksbesichtigungStatusSetzen(id: string, status: WerksbesichtigungStatus) {
  const supabase = await createClient();

  // Abschließen nur, wenn jedes Förderband eine Förderband-ID hat. Die
  // Nummer in der Meldung folgt derselben Sortierung wie die Detailseite
  // (reihenfolge, dann erstellt_am), damit das Band dort auffindbar ist.
  if (status === "abgeschlossen") {
    const { data: baender, error: ladeFehler } = await supabase
      .from("foerderband_eintraege")
      .select("bezeichnung, material, material_sonstiges, foerderbandbreite")
      .eq("werksbesichtigung_id", id)
      .order("reihenfolge", { ascending: true })
      .order("erstellt_am", { ascending: true });
    if (ladeFehler) return { erfolg: false, fehler: ladeFehler.message };

    const ohneId = (baender ?? []).flatMap((band, index) => {
      if (band.bezeichnung?.trim()) return [];
      const material = band.material === "Sonstiges" ? band.material_sonstiges || band.material : band.material;
      const merkmale = [material ? `Material ${material}` : null, band.foerderbandbreite].filter(Boolean);
      const zusatz = merkmale.length > 0 ? ` (${merkmale.join(", ")})` : "";
      return [`Förderband ${index + 1}${zusatz}: Förderband-ID fehlt`];
    });
    if (ohneId.length > 0) {
      return { erfolg: false, fehler: `Bericht nicht abgeschlossen. ${ohneId.join("; ")}.` };
    }
  }

  const { error, count } = await supabase
    .from("werksbesichtigungen")
    .update({ status }, { count: "exact" })
    .eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };
  if (count === 0) return { erfolg: false, fehler: KEINE_ZEILE_BETROFFEN };

  revalidatePath(`/werksbesichtigungen/${id}`);
  revalidatePath("/werksbesichtigungen");
  return { erfolg: true };
}

export async function werksbesichtigungLoeschen(id: string) {
  const supabase = await createClient();
  const { error, count } = await supabase.from("werksbesichtigungen").delete({ count: "exact" }).eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };
  if (count === 0) return { erfolg: false, fehler: KEINE_ZEILE_BETROFFEN };

  revalidatePath("/werksbesichtigungen");
  return { erfolg: true };
}

// Sucht Nutzer:innen nach Namen, um sie als Mitbearbeiter hinzuzufügen. Bei
// leerem Suchtext kommt die volle Liste aller verfügbaren Nutzer:innen
// zurück (als Auswahlliste, nicht nur als Tipp-Suche) - abzüglich Ersteller
// und bereits hinzugefügter Mitbearbeiter.
export async function werksbesichtigungNutzerSuchen(werksbesichtigungId: string, suchtext: string) {
  const supabase = await createClient();
  const begriff = suchtext.trim();

  const { data: besichtigung } = await supabase
    .from("werksbesichtigungen")
    .select("ersteller_id")
    .eq("id", werksbesichtigungId)
    .single();
  const { data: bestehende } = await supabase
    .from("werksbesichtigung_bearbeiter")
    .select("user_id")
    .eq("werksbesichtigung_id", werksbesichtigungId);

  const ausgeschlosseneIds = [
    ...(bestehende ?? []).map((b) => b.user_id),
    ...(besichtigung?.ersteller_id ? [besichtigung.ersteller_id] : []),
  ];

  let query = supabase.from("users").select("id, name").order("name").limit(50);
  if (begriff) query = query.ilike("name", `%${begriff}%`);
  if (ausgeschlosseneIds.length > 0) {
    query = query.not("id", "in", `(${ausgeschlosseneIds.join(",")})`);
  }
  const { data } = await query;
  return data ?? [];
}

export async function werksbesichtigungBearbeiterHinzufuegen(werksbesichtigungId: string, nutzerId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("werksbesichtigung_bearbeiter")
    .insert({ werksbesichtigung_id: werksbesichtigungId, user_id: nutzerId });
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true };
}

export async function werksbesichtigungBearbeiterEntfernen(werksbesichtigungId: string, nutzerId: string) {
  const supabase = await createClient();
  const { error, count } = await supabase
    .from("werksbesichtigung_bearbeiter")
    .delete({ count: "exact" })
    .eq("werksbesichtigung_id", werksbesichtigungId)
    .eq("user_id", nutzerId);
  if (error) return { erfolg: false, fehler: error.message };
  if (count === 0) return { erfolg: false, fehler: KEINE_ZEILE_BETROFFEN };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true };
}

// Nächste freie reihenfolge (max + 1), damit neue Bänder/Positionen
// zuverlässig hinten landen statt per Gleichstand bei 0.
async function naechsteReihenfolge(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tabelle: "foerderband_eintraege" | "foerderband_positionen",
  spalte: "werksbesichtigung_id" | "foerderband_eintrag_id",
  wert: string,
): Promise<number> {
  const { data } = await supabase
    .from(tabelle)
    .select("reihenfolge")
    .eq(spalte, wert)
    .order("reihenfolge", { ascending: false })
    .limit(1)
    .maybeSingle();
  return typeof data?.reihenfolge === "number" ? data.reihenfolge + 1 : 0;
}

export async function foerderbandEintragErstellen(werksbesichtigungId: string) {
  const supabase = await createClient();
  const id = randomUUID();
  const reihenfolge = await naechsteReihenfolge(supabase, "foerderband_eintraege", "werksbesichtigung_id", werksbesichtigungId);
  const { error } = await supabase
    .from("foerderband_eintraege")
    .insert({ id, werksbesichtigung_id: werksbesichtigungId, bezeichnung: "", reihenfolge });
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true, id };
}

export async function foerderbandEintragLoeschen(id: string, werksbesichtigungId: string) {
  const supabase = await createClient();
  const { error, count } = await supabase.from("foerderband_eintraege").delete({ count: "exact" }).eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };
  if (count === 0) return { erfolg: false, fehler: KEINE_ZEILE_BETROFFEN };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true };
}

export async function foerderbandPositionErstellen(foerderbandEintragId: string, werksbesichtigungId: string) {
  const supabase = await createClient();
  const id = randomUUID();
  const reihenfolge = await naechsteReihenfolge(supabase, "foerderband_positionen", "foerderband_eintrag_id", foerderbandEintragId);
  const { error } = await supabase
    .from("foerderband_positionen")
    .insert({ id, foerderband_eintrag_id: foerderbandEintragId, position: "freifeld", reihenfolge });
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true, id };
}

export async function foerderbandPositionLoeschen(id: string, werksbesichtigungId: string) {
  const supabase = await createClient();
  const { error, count } = await supabase.from("foerderband_positionen").delete({ count: "exact" }).eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };
  if (count === 0) return { erfolg: false, fehler: KEINE_ZEILE_BETROFFEN };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true };
}

export async function foerderbandFotoHinzufuegen(
  foerderbandEintragId: string,
  werksbesichtigungId: string,
  fotoUrl: string,
) {
  const supabase = await createClient();
  const id = randomUUID();
  const { error } = await supabase
    .from("foerderband_fotos")
    .insert({ id, foerderband_eintrag_id: foerderbandEintragId, foto_url: fotoUrl });
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true, id };
}

export async function foerderbandFotoEntfernen(fotoId: string, werksbesichtigungId: string) {
  const supabase = await createClient();
  const { error, count } = await supabase.from("foerderband_fotos").delete({ count: "exact" }).eq("id", fotoId);
  if (error) return { erfolg: false, fehler: error.message };
  if (count === 0) return { erfolg: false, fehler: KEINE_ZEILE_BETROFFEN };

  revalidatePath(`/werksbesichtigungen/${werksbesichtigungId}`);
  return { erfolg: true };
}

export async function hochgeladenerBerichtErstellen(felder: {
  kunde: string;
  ort: string;
  datum: string;
  dateiname: string;
  dateiUrl: string;
  merkteamId: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erfolg: false, fehler: "Nicht eingeloggt." };

  const kunde = felder.kunde.trim();
  if (!kunde) return { erfolg: false, fehler: "Bitte einen Kunden angeben." };

  const id = randomUUID();
  const { error } = await supabase.from("hochgeladene_berichte").insert({
    id,
    hochgeladen_von: user.id,
    kunde,
    ort: felder.ort.trim() || null,
    datum: felder.datum,
    dateiname: felder.dateiname,
    datei_url: felder.dateiUrl,
    merkteam_id: felder.merkteamId,
  });
  if (error) return { erfolg: false, fehler: error.message };

  revalidatePath("/werksbesichtigungen");
  return { erfolg: true, id };
}

export async function hochgeladenerBerichtAktualisieren(
  id: string,
  felder: {
    kunde: string;
    ort: string;
    datum: string;
    neueDatei?: { dateiname: string; dateiUrl: string; alteDateiUrl: string | null };
  },
) {
  const supabase = await createClient();
  const kunde = felder.kunde.trim();
  if (!kunde) return { erfolg: false, fehler: "Bitte einen Kunden angeben." };

  const { error, count } = await supabase
    .from("hochgeladene_berichte")
    .update(
      {
        kunde,
        ort: felder.ort.trim() || null,
        datum: felder.datum,
        ...(felder.neueDatei ? { dateiname: felder.neueDatei.dateiname, datei_url: felder.neueDatei.dateiUrl } : {}),
      },
      { count: "exact" },
    )
    .eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };
  if (count === 0) return { erfolg: false, fehler: KEINE_ZEILE_BETROFFEN };

  // Die alte Datei wird erst gelöscht, nachdem der Datenbank-Eintrag
  // erfolgreich auf die neue URL zeigt - sonst würde ein fehlgeschlagener
  // Löschversuch nie mehr nachgeholt, aber ein verwaistes altes Objekt in
  // der Storage ist unschädlich und kein Grund, die Aktion fehlschlagen zu
  // lassen.
  if (felder.neueDatei?.alteDateiUrl) {
    const pfad = felder.neueDatei.alteDateiUrl.split("/werksbesichtigung-berichte/")[1];
    if (pfad) await supabase.storage.from("werksbesichtigung-berichte").remove([pfad]);
  }

  revalidatePath("/werksbesichtigungen");
  return { erfolg: true };
}

export async function hochgeladenerBerichtLoeschen(id: string) {
  const supabase = await createClient();
  const { error, count } = await supabase.from("hochgeladene_berichte").delete({ count: "exact" }).eq("id", id);
  if (error) return { erfolg: false, fehler: error.message };
  if (count === 0) return { erfolg: false, fehler: KEINE_ZEILE_BETROFFEN };

  revalidatePath("/werksbesichtigungen");
  return { erfolg: true };
}

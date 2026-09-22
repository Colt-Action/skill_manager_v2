import { createClient } from "@/lib/supabase/server";
import { getAktuellerNutzer } from "@/lib/auth";
import WerksbesichtigungErstellenForm from "@/components/WerksbesichtigungErstellenForm";
import HochgeladenerBerichtForm from "@/components/HochgeladenerBerichtForm";
import WerksbesichtigungenUebersicht, { type BerichtEintrag } from "@/components/WerksbesichtigungenUebersicht";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { HochgeladenerBericht, Werksbesichtigung } from "@/lib/supabase/types";

interface MerkteamZeile {
  merkteams: { id: string; name: string } | { id: string; name: string }[] | null;
}

function einzeln<T>(wert: T | T[] | null | undefined): T | null {
  if (!wert) return null;
  return Array.isArray(wert) ? (wert[0] ?? null) : wert;
}

export default async function WerksbesichtigungenSeite() {
  const nutzer = await getAktuellerNutzer();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const [{ data: besichtigungen }, { data: berichteRoh }, { data: meineTeamsRoh }] = await Promise.all([
    supabase.from("werksbesichtigungen").select("*").order("datum", { ascending: false }),
    supabase.from("hochgeladene_berichte").select("*").order("datum", { ascending: false }),
    supabase.from("merkteam_mitglieder").select("merkteams(id, name)").eq("user_id", nutzer.id),
  ]);

  const meineTeams = ((meineTeamsRoh ?? []) as unknown as MerkteamZeile[])
    .map((z) => einzeln(z.merkteams))
    .filter((z): z is { id: string; name: string } => z !== null);

  const werksbesichtigungenListe = (besichtigungen ?? []) as Werksbesichtigung[];
  const berichteListe = (berichteRoh ?? []) as HochgeladenerBericht[];

  const eintraege: BerichtEintrag[] = [
    ...werksbesichtigungenListe.map((besuch) => ({
      id: besuch.id,
      kunde: besuch.kunde,
      ort: besuch.ort,
      datum: besuch.datum,
      datumBis: besuch.datum_bis,
      quelle: "skillmanager" as const,
      status: besuch.status,
      href: `/werksbesichtigungen/${besuch.id}`,
      darfLoeschen: false,
    })),
    ...berichteListe.map((bericht) => ({
      id: bericht.id,
      kunde: bericht.kunde,
      ort: bericht.ort,
      datum: bericht.datum,
      datumBis: null,
      quelle: "upload" as const,
      status: null,
      href: bericht.datei_url,
      darfLoeschen: bericht.hochgeladen_von === nutzer.id || nutzer.rolle === "admin" || nutzer.rolle === "superadmin",
    })),
  ].sort((a, b) => b.datum.localeCompare(a.datum));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">{t("werksbesichtigungen.eyebrow", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink">{t("werksbesichtigungen.titel", sprache)}</h1>
      <p className="mt-1 text-sm text-ink-soft">{t("werksbesichtigungen.untertitel", sprache)}</p>

      <WerksbesichtigungErstellenForm meineTeams={meineTeams} />
      <HochgeladenerBerichtForm meineTeams={meineTeams} />

      <WerksbesichtigungenUebersicht eintraege={eintraege} />
    </div>
  );
}

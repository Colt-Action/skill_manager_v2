import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import AdminReferenzenListe from "@/components/AdminReferenzenListe";
import EmptyState from "@/components/EmptyState";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { Kategorie, ReferenzMitDetails, Teil } from "@/lib/supabase/types";

const REFERENZ_SELECT =
  "*, teile(id, name, teilenummer, beschreibung, kategorie_id), kategorien(id, name, ebene, parent_kategorie_id), referenz_tags(tags(id, name, synonyme)), referenz_metadaten(*), referenz_video(*), referenz_foto(*), referenz_dokument(*), referenz_link(*), referenz_likes(user_id)";

// Analog zu /admin/videos, aber für den Referenzbereich (alle vier Typen:
// Video/Foto/Dokument/Link). Deckt seit Phase 22 auch die technischen
// Zusatzangaben (Material, Geschwindigkeit, ...) ab - vorher nur beim
// Hochladen erfassbar, nicht mehr nachträglich änderbar.
export default async function AdminAlleReferenzenSeite() {
  const nutzer = await getAktuellerAdminOderHoeher();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const [{ data: referenzen }, { data: kategorien }, { data: teile }] = await Promise.all([
    supabase
      .from("referenzen")
      .select(REFERENZ_SELECT)
      .eq("status", "veroeffentlicht")
      .order("erstellt_am", { ascending: false }),
    supabase.from("kategorien").select("*").order("name"),
    supabase.from("teile").select("*").order("name"),
  ]);

  const referenzenListe = (referenzen ?? []) as ReferenzMitDetails[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("nav.verwaltung", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        {t("admin.alleReferenzenBearbeiten", sprache)}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">{t("admin.alleReferenzenUntertitel", sprache)}</p>

      {referenzenListe.length === 0 ? (
        <EmptyState icon="🗂️" text={t("admin.pruefungLeer", sprache)} />
      ) : (
        <AdminReferenzenListe
          referenzen={referenzenListe}
          kategorien={(kategorien ?? []) as Kategorie[]}
          teile={(teile ?? []) as Teil[]}
        />
      )}
    </div>
  );
}

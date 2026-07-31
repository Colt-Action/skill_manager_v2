// Handgeschriebene TypeScript-Typen, die zu den Tabellen aus
// supabase/migrations/20260714000000_init.sql passen. Wenn sich das
// Datenbankschema ändert, bitte diese Typen mit anpassen.

export type Rolle = "superadmin" | "admin" | "techniker" | "zuschauer";
export type VideoStatus = "entwurf" | "pruefung" | "veroeffentlicht";
export type VideoTyp = "schulung" | "referenz";

export interface DbUser {
  id: string;
  name: string;
  rolle: Rolle;
  aktiv: boolean;
  avatar_url: string | null;
  standort: string | null;
  firma: string | null;
  onboarding_gesehen: boolean;
  sprache: string;
  erstellt_am: string;
}

export type KategorieEbene = "industrie" | "hersteller" | "produkt" | "kategorie" | "unterkategorie";

export interface Kategorie {
  id: string;
  name: string;
  ebene: KategorieEbene;
  parent_kategorie_id: string | null;
  zeigt_referenz_zusatzfelder: boolean;
  erstellt_am: string;
}

export interface Teil {
  id: string;
  name: string;
  teilenummer: string;
  beschreibung: string;
  qr_code_id: string;
  kategorie_id: string | null;
  erstellt_am: string;
}

export interface Video {
  id: string;
  titel: string;
  datei_url: string;
  thumbnail_url: string | null;
  dauer: number | null;
  beschreibung_schritte: string;
  teil_id: string | null;
  kategorie_id: string | null;
  status: VideoStatus;
  hochgeladen_von: string | null;
  erstellt_am: string;
  sprachen_verfuegbar: string[];
  aufrufe: number;
  loeschung_angefragt: boolean;
  video_typ: VideoTyp;
}

export interface ReferenzVideoDetails {
  video_id: string;
  material: string | null;
  material_sonstiges: string | null;
  geschwindigkeit_ms: number | null;
  foerderbandbreite: string | null;
  belt_connection: string | null;
  mechanical_splice_typ: string | null;
  runback_reversible: boolean;
  land: string | null;
  besonderheiten: string | null;
}

export interface TeilAnfrage {
  id: string;
  nutzer_id: string | null;
  notiz: string;
  bearbeitet: boolean;
  erstellt_am: string;
}

export interface Tag {
  id: string;
  name: string;
  synonyme: string[];
}

export interface VideoTag {
  video_id: string;
  tag_id: string;
}

export interface Feedback {
  id: string;
  video_id: string;
  user_id: string | null;
  hilfreich: boolean;
  erstellt_am: string;
}

export interface SucheOhneTreffer {
  id: string;
  suchbegriff: string;
  erstellt_am: string;
}

export interface Kommentar {
  id: string;
  video_id: string;
  user_id: string | null;
  text: string;
  erstellt_am: string;
}

export interface VideoLike {
  video_id: string;
  user_id: string;
  erstellt_am: string;
}

export interface VideoAnsicht {
  user_id: string;
  video_id: string;
  angesehen_am: string;
}

export interface Benachrichtigung {
  id: string;
  user_id: string;
  nachricht: string;
  link: string | null;
  gelesen: boolean;
  erstellt_am: string;
}

export interface Lernpfad {
  id: string;
  titel: string;
  beschreibung: string;
  erstellt_von: string | null;
  erstellt_am: string;
}

export interface LernpfadVideo {
  lernpfad_id: string;
  video_id: string;
  reihenfolge: number;
}

export interface Zugangscode {
  id: string;
  code: string;
  max_nutzungen: number | null;
  genutzt_anzahl: number;
  aktiv: boolean;
  erstellt_von: string | null;
  erstellt_am: string;
}

export interface Uebersetzung {
  id: string;
  tabelle: string;
  datensatz_id: string;
  feld: string;
  sprache: string;
  text: string;
  erstellt_am: string;
}

// Video mit den zusätzlichen Infos, die die Bibliotheks-Seite braucht
// (Teilename, Kategorie, Tags) – wird per JOIN aus Supabase geladen.
export interface VideoMitDetails extends Video {
  teile: Pick<Teil, "id" | "name" | "teilenummer" | "beschreibung" | "kategorie_id"> | null;
  kategorien: Pick<Kategorie, "id" | "name" | "ebene" | "parent_kategorie_id"> | null;
  video_tags: { tags: Pick<Tag, "id" | "name" | "synonyme"> }[];
  referenz_video_details?: ReferenzVideoDetails | ReferenzVideoDetails[] | null;
  video_likes?: Pick<VideoLike, "user_id">[];
}

// ============================================================================
// Referenzbereich (Phase 17): Video/Foto/Dokument/Link, alle mit denselben
// Sachfiltern durchsuchbar. Siehe supabase/migrations/*_phase17a_*.sql.
// ============================================================================

export type ReferenzTyp = "video" | "foto" | "dokument" | "link";

export interface Referenz {
  id: string;
  titel: string;
  beschreibung: string;
  typ: ReferenzTyp;
  kategorie_id: string | null;
  teil_id: string | null;
  status: VideoStatus;
  hochgeladen_von: string | null;
  erstellt_am: string;
}

export interface ReferenzMetadaten {
  referenz_id: string;
  material: string | null;
  material_sonstiges: string | null;
  geschwindigkeit_ms: number | null;
  foerderbandbreite: string | null;
  belt_connection: string | null;
  mechanical_splice_typ: string | null;
  runback_reversible: boolean;
  land: string | null;
  besonderheiten: string | null;
}

export interface ReferenzVideoInhalt {
  referenz_id: string;
  datei_url: string;
  thumbnail_url: string | null;
  dauer: number | null;
}

export interface ReferenzFotoInhalt {
  referenz_id: string;
  vorher_url: string | null;
  nachher_url: string | null;
}

export interface ReferenzDokumentInhalt {
  referenz_id: string;
  datei_url: string;
  dateiname: string;
  dateityp: "pdf" | "word";
  volltext: string;
}

export interface ReferenzLinkInhalt {
  referenz_id: string;
  url: string;
  quelle: string | null;
}

export interface ReferenzLike {
  referenz_id: string;
  user_id: string;
  erstellt_am: string;
}

export interface ReferenzKommentar {
  id: string;
  referenz_id: string;
  user_id: string | null;
  text: string;
  erstellt_am: string;
}

export interface ReferenzVerknuepfung {
  referenz_id_a: string;
  referenz_id_b: string;
  erstellt_von: string | null;
  erstellt_am: string;
}

// Referenz mit allen JOINs, die die Such-/Detailseiten brauchen. Nur das zum
// jeweiligen "typ" passende Inhaltsfeld ist tatsächlich gesetzt.
export interface ReferenzMitDetails extends Referenz {
  teile: Pick<Teil, "id" | "name" | "teilenummer" | "beschreibung" | "kategorie_id"> | null;
  kategorien: Pick<Kategorie, "id" | "name" | "ebene" | "parent_kategorie_id"> | null;
  referenz_tags: { tags: Pick<Tag, "id" | "name" | "synonyme"> }[];
  referenz_metadaten?: ReferenzMetadaten | ReferenzMetadaten[] | null;
  referenz_video?: ReferenzVideoInhalt | ReferenzVideoInhalt[] | null;
  referenz_foto?: ReferenzFotoInhalt | ReferenzFotoInhalt[] | null;
  referenz_dokument?: ReferenzDokumentInhalt | ReferenzDokumentInhalt[] | null;
  referenz_link?: ReferenzLinkInhalt | ReferenzLinkInhalt[] | null;
  referenz_likes?: Pick<ReferenzLike, "user_id">[];
}

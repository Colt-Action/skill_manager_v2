// Handgeschriebene TypeScript-Typen, die zu den Tabellen aus
// supabase/migrations/20260714000000_init.sql passen. Wenn sich das
// Datenbankschema ändert, bitte diese Typen mit anpassen.

export type Rolle = "superadmin" | "admin" | "techniker" | "zuschauer";
export type VideoStatus = "entwurf" | "pruefung" | "veroeffentlicht";

export interface DbUser {
  id: string;
  name: string;
  rolle: Rolle;
  aktiv: boolean;
  avatar_url: string | null;
  standort: string | null;
  erstellt_am: string;
}

export type KategorieEbene = "industrie" | "hersteller" | "produkt" | "kategorie";

export interface Kategorie {
  id: string;
  name: string;
  ebene: KategorieEbene;
  parent_kategorie_id: string | null;
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
  dauer: number | null;
  beschreibung_schritte: string;
  teil_id: string | null;
  status: VideoStatus;
  hochgeladen_von: string | null;
  erstellt_am: string;
  sprachen_verfuegbar: string[];
  aufrufe: number;
  loeschung_angefragt: boolean;
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

// Video mit den zusätzlichen Infos, die die Bibliotheks-Seite braucht
// (Teilename, Kategorie, Tags) – wird per JOIN aus Supabase geladen.
export interface VideoMitDetails extends Video {
  teile: Pick<Teil, "id" | "name" | "teilenummer" | "beschreibung" | "kategorie_id"> | null;
  video_tags: { tags: Pick<Tag, "id" | "name" | "synonyme"> }[];
}

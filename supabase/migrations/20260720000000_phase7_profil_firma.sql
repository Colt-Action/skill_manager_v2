-- ============================================================================
-- Phase 7: Profil-Ausbau – Firma/Abteilung
-- ============================================================================
-- Ergänzt das Nutzerprofil um ein freies Textfeld für Firma/Abteilung
-- (z. B. relevant, falls neben HOSCH-Mitarbeitern auch externe Partnerfirmen
-- Zugriff bekommen). Passwort-Änderung und Statistiken brauchen keine neuen
-- Spalten – die laufen über Supabase Auth bzw. bestehende Tabellen.
-- ============================================================================

alter table public.users add column if not exists firma text;

comment on column public.users.firma is
  'Firma/Abteilung des Nutzers, freies Textfeld (z. B. "HOSCH" oder Name einer Partnerfirma).';

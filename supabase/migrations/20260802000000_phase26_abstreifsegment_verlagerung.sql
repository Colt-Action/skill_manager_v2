-- Phase 26: zwei neue technische Zusatzfelder für Referenzen (Fotos/Videos/
-- Dokumente/Links im Referenzbereich) - Abstreifsegment und Verlagerung.
-- Werden beim Hochladen erfasst und im Referenzbereich als Filter genutzt.

alter table public.referenz_metadaten
  add column if not exists abstreifsegment text,
  add column if not exists verlagerung text;

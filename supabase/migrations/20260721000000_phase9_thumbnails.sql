-- ============================================================================
-- Phase 9: Performance – Video-Thumbnails
-- ============================================================================
-- Bisher haben Video-Karten in der Videothek jeweils das komplette Video als
-- <video>-Element geladen, nur um ein Standbild zu zeigen – das kostet bei
-- vielen Videos unnötig Ladezeit und Datenvolumen. Ab jetzt wird beim
-- Hochladen automatisch ein Vorschaubild (JPG) erzeugt und in einem eigenen
-- Storage-Bucket gespeichert; die Videothek zeigt nur noch dieses Bild.
-- Ältere, bereits hochgeladene Videos haben kein thumbnail_url – dafür bleibt
-- im Code ein Fallback auf die alte Video-Vorschau bestehen.
-- ============================================================================

alter table public.videos add column if not exists thumbnail_url text;

insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true)
on conflict (id) do nothing;

create policy "thumbnails_bucket_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'thumbnails');

create policy "thumbnails_bucket_select" on storage.objects
  for select to public
  using (bucket_id = 'thumbnails');

create policy "thumbnails_bucket_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'thumbnails' and (owner = auth.uid() or public.is_admin_oder_hoeher()));

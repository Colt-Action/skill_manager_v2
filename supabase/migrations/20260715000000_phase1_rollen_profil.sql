-- ============================================================================
-- Phase 1: Erweitertes Rollen-System, Profil, Nutzerverwaltung
-- ============================================================================
-- Neue Rollen: superadmin, admin (ersetzt "trainer_admin"), techniker, zuschauer
-- Neue Felder: aktiv (Nutzer deaktivieren statt löschen), avatar_url, standort
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Bestehende "trainer_admin"-Nutzer zu "admin" migrieren, neue Rollen erlauben
-- ----------------------------------------------------------------------------
alter table public.users drop constraint if exists users_rolle_check;

update public.users set rolle = 'admin' where rolle = 'trainer_admin';

alter table public.users
  add constraint users_rolle_check
  check (rolle in ('superadmin', 'admin', 'techniker', 'zuschauer'));

alter table public.users alter column rolle set default 'techniker';

-- ----------------------------------------------------------------------------
-- 2. Neue Spalten für users
-- ----------------------------------------------------------------------------
alter table public.users add column if not exists aktiv boolean not null default true;
alter table public.users add column if not exists avatar_url text;
alter table public.users add column if not exists standort text;

comment on column public.users.aktiv is
  'Deaktivierte Nutzer können sich nicht mehr einloggen, ihre Videos/Daten bleiben aber erhalten (kein Löschen bei Firmenaustritt).';

-- ----------------------------------------------------------------------------
-- 3. Hilfsfunktionen für die neuen Rollen (ersetzt is_trainer_admin)
-- ----------------------------------------------------------------------------
create or replace function public.is_admin_oder_hoeher()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and rolle in ('admin', 'superadmin')
  );
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and rolle = 'superadmin'
  );
$$;

-- Alte Funktion bleibt aus Kompatibilitätsgründen bestehen, zeigt jetzt aber
-- auf die neue Logik (falls sie noch irgendwo referenziert wird).
create or replace function public.is_trainer_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_admin_oder_hoeher();
$$;

-- ----------------------------------------------------------------------------
-- 4. Bestehende Policies auf die neue Funktion umstellen
-- ----------------------------------------------------------------------------
drop policy if exists "kategorien_write" on public.kategorien;
create policy "kategorien_write" on public.kategorien
  for all to authenticated
  using (public.is_admin_oder_hoeher())
  with check (public.is_admin_oder_hoeher());

drop policy if exists "teile_write" on public.teile;
create policy "teile_write" on public.teile
  for all to authenticated
  using (public.is_admin_oder_hoeher())
  with check (public.is_admin_oder_hoeher());

drop policy if exists "tags_update_delete" on public.tags;
create policy "tags_update_delete" on public.tags
  for update to authenticated
  using (public.is_admin_oder_hoeher())
  with check (public.is_admin_oder_hoeher());

drop policy if exists "tags_delete" on public.tags;
create policy "tags_delete" on public.tags
  for delete to authenticated using (public.is_admin_oder_hoeher());

drop policy if exists "video_tags_delete" on public.video_tags;
create policy "video_tags_delete" on public.video_tags
  for delete to authenticated using (
    public.is_admin_oder_hoeher()
    or exists (select 1 from public.videos v where v.id = video_id and v.hochgeladen_von = auth.uid())
  );

drop policy if exists "videos_select" on public.videos;
create policy "videos_select" on public.videos
  for select to authenticated using (
    status = 'veroeffentlicht'
    or hochgeladen_von = auth.uid()
    or public.is_admin_oder_hoeher()
  );

drop policy if exists "videos_update" on public.videos;
create policy "videos_update" on public.videos
  for update to authenticated
  using (
    public.is_admin_oder_hoeher()
    or (hochgeladen_von = auth.uid() and status <> 'veroeffentlicht')
  )
  with check (
    public.is_admin_oder_hoeher()
    or (hochgeladen_von = auth.uid() and status <> 'veroeffentlicht')
  );

drop policy if exists "videos_delete" on public.videos;
create policy "videos_delete" on public.videos
  for delete to authenticated using (public.is_admin_oder_hoeher());

drop policy if exists "feedback_select" on public.feedback;
create policy "feedback_select" on public.feedback
  for select to authenticated using (user_id = auth.uid() or public.is_admin_oder_hoeher());

drop policy if exists "suchanfragen_select" on public.suchanfragen_ohne_treffer;
create policy "suchanfragen_select" on public.suchanfragen_ohne_treffer
  for select to authenticated using (public.is_admin_oder_hoeher());

drop policy if exists "videos_bucket_delete" on storage.objects;
create policy "videos_bucket_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'videos' and (owner = auth.uid() or public.is_admin_oder_hoeher()));

-- Zuschauer dürfen keine Videos hochladen (Verteidigung auf DB-Ebene,
-- zusätzlich zur Prüfung in der Server Action).
drop policy if exists "videos_insert" on public.videos;
create policy "videos_insert" on public.videos
  for insert to authenticated with check (
    hochgeladen_von = auth.uid()
    and not exists (
      select 1 from public.users where id = auth.uid() and rolle = 'zuschauer'
    )
  );

-- Nur Superadmin darf Rollen anderer Nutzer ändern (users_update_own erlaubte
-- bisher jedem, seine eigene Zeile zu ändern, aber nicht die eigene Rolle -
-- jetzt ergänzen wir: Superadmin darf jede Zeile inkl. Rolle ändern).
drop policy if exists "users_update_admin" on public.users;
create policy "users_update_admin" on public.users
  for update to authenticated
  using (public.is_admin_oder_hoeher())
  with check (
    -- Admins (nicht Superadmin) dürfen keine Rolle auf admin/superadmin setzen
    -- oder ändern - das darf nur der Superadmin.
    public.is_superadmin()
    or (rolle in ('techniker', 'zuschauer'))
  );

-- ----------------------------------------------------------------------------
-- 5. Storage-Bucket für Profilbilder
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatare', 'avatare', true)
on conflict (id) do nothing;

drop policy if exists "avatare_bucket_insert" on storage.objects;
create policy "avatare_bucket_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatare');

drop policy if exists "avatare_bucket_select" on storage.objects;
create policy "avatare_bucket_select" on storage.objects
  for select to public
  using (bucket_id = 'avatare');

drop policy if exists "avatare_bucket_update" on storage.objects;
create policy "avatare_bucket_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatare' and owner = auth.uid());

drop policy if exists "avatare_bucket_delete" on storage.objects;
create policy "avatare_bucket_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatare' and owner = auth.uid());

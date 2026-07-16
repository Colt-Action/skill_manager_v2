-- ============================================================================
-- Phase 3: Löschanfragen, "Teil nicht gefunden"-Meldungen, Favoriten
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Löschanfragen für Videos
-- ----------------------------------------------------------------------------
-- Techniker können ihre eigenen Videos nicht direkt löschen, sondern nur
-- eine Löschung beantragen (auch für bereits veröffentlichte eigene
-- Videos). Erst wenn ein Admin/Superadmin das bestätigt, wird das Video
-- wirklich gelöscht. Welche Felder dabei geändert werden dürfen, steuern
-- die Server Actions der App; diese Policy regelt nur den Zeilenzugriff.
drop policy if exists "videos_update" on public.videos;
create policy "videos_update" on public.videos
  for update to authenticated
  using (hochgeladen_von = auth.uid() or public.is_admin_oder_hoeher())
  with check (hochgeladen_von = auth.uid() or public.is_admin_oder_hoeher());

alter table public.videos add column if not exists loeschung_angefragt boolean not null default false;

-- ----------------------------------------------------------------------------
-- 2. "Teil nicht gefunden"-Meldungen von Technikern
-- ----------------------------------------------------------------------------
create table if not exists public.teil_anfragen (
  id uuid primary key default gen_random_uuid(),
  nutzer_id uuid references public.users (id) on delete set null,
  notiz text not null,
  bearbeitet boolean not null default false,
  erstellt_am timestamptz not null default now()
);

alter table public.teil_anfragen enable row level security;

drop policy if exists "teil_anfragen_insert" on public.teil_anfragen;
create policy "teil_anfragen_insert" on public.teil_anfragen
  for insert to authenticated with check (nutzer_id = auth.uid());

drop policy if exists "teil_anfragen_select" on public.teil_anfragen;
create policy "teil_anfragen_select" on public.teil_anfragen
  for select to authenticated using (nutzer_id = auth.uid() or public.is_admin_oder_hoeher());

drop policy if exists "teil_anfragen_update" on public.teil_anfragen;
create policy "teil_anfragen_update" on public.teil_anfragen
  for update to authenticated
  using (public.is_admin_oder_hoeher())
  with check (public.is_admin_oder_hoeher());

-- ----------------------------------------------------------------------------
-- 3. Favoriten / Merkliste
-- ----------------------------------------------------------------------------
create table if not exists public.favoriten (
  video_id uuid not null references public.videos (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  erstellt_am timestamptz not null default now(),
  primary key (video_id, user_id)
);

alter table public.favoriten enable row level security;

drop policy if exists "favoriten_select" on public.favoriten;
create policy "favoriten_select" on public.favoriten
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "favoriten_insert" on public.favoriten;
create policy "favoriten_insert" on public.favoriten
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "favoriten_delete" on public.favoriten;
create policy "favoriten_delete" on public.favoriten
  for delete to authenticated using (user_id = auth.uid());

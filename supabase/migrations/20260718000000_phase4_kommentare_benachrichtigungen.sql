-- ============================================================================
-- Phase 4: Kommentare zu Videos, In-App-Benachrichtigungen
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Kommentare
-- ----------------------------------------------------------------------------
create table if not exists public.kommentare (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos (id) on delete cascade,
  user_id uuid references public.users (id) on delete set null,
  text text not null,
  erstellt_am timestamptz not null default now()
);

alter table public.kommentare enable row level security;

drop policy if exists "kommentare_select" on public.kommentare;
create policy "kommentare_select" on public.kommentare
  for select to authenticated using (true);

drop policy if exists "kommentare_insert" on public.kommentare;
create policy "kommentare_insert" on public.kommentare
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "kommentare_delete" on public.kommentare;
create policy "kommentare_delete" on public.kommentare
  for delete to authenticated using (user_id = auth.uid() or public.is_admin_oder_hoeher());

create index if not exists kommentare_video_idx on public.kommentare (video_id);

-- ----------------------------------------------------------------------------
-- 2. Benachrichtigungen
-- ----------------------------------------------------------------------------
create table if not exists public.benachrichtigungen (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  nachricht text not null,
  link text,
  gelesen boolean not null default false,
  erstellt_am timestamptz not null default now()
);

alter table public.benachrichtigungen enable row level security;

drop policy if exists "benachrichtigungen_select" on public.benachrichtigungen;
create policy "benachrichtigungen_select" on public.benachrichtigungen
  for select to authenticated using (user_id = auth.uid());

-- Einfügen dürfen alle eingeloggten Nutzer, aber nur für andere Nutzer (die
-- App erzeugt Benachrichtigungen im Auftrag von Aktionen wie "Freigegeben"
-- oder "Neuer Kommentar" - der Empfänger ist meist eine andere Person als
-- die auslösende).
drop policy if exists "benachrichtigungen_insert" on public.benachrichtigungen;
create policy "benachrichtigungen_insert" on public.benachrichtigungen
  for insert to authenticated with check (true);

drop policy if exists "benachrichtigungen_update" on public.benachrichtigungen;
create policy "benachrichtigungen_update" on public.benachrichtigungen
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists benachrichtigungen_user_idx on public.benachrichtigungen (user_id, gelesen);

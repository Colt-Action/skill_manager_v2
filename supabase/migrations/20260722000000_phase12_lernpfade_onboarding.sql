-- ============================================================================
-- Phase 12: Lernpfade & Onboarding
-- ============================================================================
-- Lernpfade gruppieren mehrere Videos in einer festen Reihenfolge, z.B.
-- "Neu bei HOSCH – Starter-Kurs". Nur Admin/Superadmin legen Lernpfade an,
-- alle eingeloggten Nutzer dürfen sie ansehen.
-- Das onboarding_gesehen-Flag merkt sich, ob ein Nutzer die kurze
-- Einführungstour beim ersten Login schon gesehen hat.
-- ============================================================================

create table public.lernpfade (
  id uuid primary key default gen_random_uuid(),
  titel text not null,
  beschreibung text default '',
  erstellt_von uuid references public.users (id) on delete set null,
  erstellt_am timestamptz not null default now()
);

create table public.lernpfad_videos (
  lernpfad_id uuid not null references public.lernpfade (id) on delete cascade,
  video_id uuid not null references public.videos (id) on delete cascade,
  reihenfolge integer not null default 0,
  primary key (lernpfad_id, video_id)
);

create index lernpfad_videos_reihenfolge_idx on public.lernpfad_videos (lernpfad_id, reihenfolge);

alter table public.lernpfade enable row level security;
alter table public.lernpfad_videos enable row level security;

create policy "lernpfade_select" on public.lernpfade
  for select to authenticated using (true);
create policy "lernpfade_write" on public.lernpfade
  for all to authenticated
  using (public.is_admin_oder_hoeher())
  with check (public.is_admin_oder_hoeher());

create policy "lernpfad_videos_select" on public.lernpfad_videos
  for select to authenticated using (true);
create policy "lernpfad_videos_write" on public.lernpfad_videos
  for all to authenticated
  using (public.is_admin_oder_hoeher())
  with check (public.is_admin_oder_hoeher());

alter table public.users add column if not exists onboarding_gesehen boolean not null default false;

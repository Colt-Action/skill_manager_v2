-- Phase 18: Merkteams - Videos wahlweise "nur für mich" oder in einem
-- geteilten Team merken. Ein Merkteam hat keine Rollen: alle Mitglieder
-- dürfen gleichberechtigt weitere Nutzer hinzufügen/entfernen, den Team-Namen
-- ändern und das Team löschen. Es gibt keine E-Mail-Einladungen - Mitglieder
-- werden ausschließlich aus bereits bestehenden App-Nutzern hinzugefügt.

-- ----------------------------------------------------------------------------
-- 1. Merkteams + Mitgliedschaft
-- ----------------------------------------------------------------------------
create table public.merkteams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  erstellt_von uuid references public.users (id) on delete set null,
  erstellt_am timestamptz not null default now()
);

create table public.merkteam_mitglieder (
  merkteam_id uuid not null references public.merkteams (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  beigetreten_am timestamptz not null default now(),
  primary key (merkteam_id, user_id)
);

alter table public.merkteams enable row level security;
alter table public.merkteam_mitglieder enable row level security;

-- Hilfsfunktion: prüft Mitgliedschaft, ohne dass sich merkteam_mitglieder-
-- Policies gegenseitig blockieren (SECURITY DEFINER umgeht RLS beim Check
-- selbst, die Policies bleiben trotzdem wirksam für die eigentliche Zeile).
create or replace function public.ist_merkteam_mitglied(p_merkteam_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.merkteam_mitglieder
    where merkteam_id = p_merkteam_id and user_id = auth.uid()
  );
$$;

create policy "merkteams_select" on public.merkteams
  for select to authenticated using (public.ist_merkteam_mitglied(id));

create policy "merkteams_insert" on public.merkteams
  for insert to authenticated with check (erstellt_von = auth.uid());

create policy "merkteams_update" on public.merkteams
  for update to authenticated
  using (public.ist_merkteam_mitglied(id))
  with check (public.ist_merkteam_mitglied(id));

create policy "merkteams_delete" on public.merkteams
  for delete to authenticated using (public.ist_merkteam_mitglied(id));

-- insert: entweder trägt sich jemand selbst ein (z.B. der Ersteller direkt
-- nach dem Anlegen des Teams), oder ein bestehendes Mitglied fügt eine
-- weitere Person hinzu.
create policy "merkteam_mitglieder_select" on public.merkteam_mitglieder
  for select to authenticated using (public.ist_merkteam_mitglied(merkteam_id));

create policy "merkteam_mitglieder_insert" on public.merkteam_mitglieder
  for insert to authenticated
  with check (user_id = auth.uid() or public.ist_merkteam_mitglied(merkteam_id));

create policy "merkteam_mitglieder_delete" on public.merkteam_mitglieder
  for delete to authenticated using (public.ist_merkteam_mitglied(merkteam_id));

-- ----------------------------------------------------------------------------
-- 2. Favoriten um Merkteam-Zuordnung erweitern
--    merkteam_id = null  -> weiterhin "nur für mich" (bisheriges Verhalten)
--    merkteam_id gesetzt -> für das ganze Team sichtbar/verwaltbar
-- ----------------------------------------------------------------------------
alter table public.favoriten drop constraint favoriten_pkey;
alter table public.favoriten add column id uuid not null default gen_random_uuid();
alter table public.favoriten add column merkteam_id uuid references public.merkteams (id) on delete cascade;
alter table public.favoriten add primary key (id);

create unique index favoriten_persoenlich_uniq on public.favoriten (video_id, user_id) where merkteam_id is null;
create unique index favoriten_team_uniq on public.favoriten (video_id, merkteam_id) where merkteam_id is not null;

drop policy if exists "favoriten_select" on public.favoriten;
create policy "favoriten_select" on public.favoriten
  for select to authenticated
  using (
    (merkteam_id is null and user_id = auth.uid())
    or (merkteam_id is not null and public.ist_merkteam_mitglied(merkteam_id))
  );

drop policy if exists "favoriten_insert" on public.favoriten;
create policy "favoriten_insert" on public.favoriten
  for insert to authenticated
  with check (
    (merkteam_id is null and user_id = auth.uid())
    or (merkteam_id is not null and public.ist_merkteam_mitglied(merkteam_id))
  );

drop policy if exists "favoriten_delete" on public.favoriten;
create policy "favoriten_delete" on public.favoriten
  for delete to authenticated
  using (
    (merkteam_id is null and user_id = auth.uid())
    or (merkteam_id is not null and public.ist_merkteam_mitglied(merkteam_id))
  );

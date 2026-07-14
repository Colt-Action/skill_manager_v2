-- ============================================================================
-- Skill Manager – Grundschema
-- ============================================================================
-- Diese Datei legt alle Tabellen, Beziehungen und Zugriffsregeln (Row Level
-- Security, kurz "RLS") für den Skill Manager an. RLS bedeutet: Supabase
-- prüft bei jeder Datenbankabfrage automatisch, ob der eingeloggte Nutzer
-- diese Zeile sehen/ändern darf. So brauchen wir im Code keine manuellen
-- Berechtigungsprüfungen.
-- ============================================================================

-- Erweiterung für UUID-Generierung (eindeutige IDs)
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Tabelle: users
-- Zusatzinformationen (Name, Rolle) zu jedem Supabase-Auth-Nutzer.
-- Die id ist bewusst identisch mit der id aus auth.users (Supabase-Login).
-- ----------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  rolle text not null default 'techniker' check (rolle in ('techniker', 'trainer_admin')),
  erstellt_am timestamptz not null default now()
);

comment on table public.users is 'Profil-Zusatzdaten je eingeloggtem Nutzer (Name, Rolle).';

-- Hilfsfunktion: prüft, ob der aktuell eingeloggte Nutzer Trainer/Admin ist.
-- "security definer" heißt: die Funktion darf die users-Tabelle auch dann
-- lesen, wenn die aufrufende Person selbst laut RLS nicht alles sehen dürfte.
-- Das verhindert, dass sich Policies gegenseitig blockieren.
create or replace function public.is_trainer_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and rolle = 'trainer_admin'
  );
$$;

-- Wenn sich jemand neu registriert (Supabase Auth), legen wir automatisch
-- eine passende Zeile in public.users an.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, rolle)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'rolle', 'techniker')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Tabelle: kategorien
-- Kategorien können hierarchisch verschachtelt werden (parent_kategorie_id).
-- ----------------------------------------------------------------------------
create table public.kategorien (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  maschinentyp text not null,
  parent_kategorie_id uuid references public.kategorien (id) on delete set null,
  erstellt_am timestamptz not null default now()
);

create index kategorien_parent_idx on public.kategorien (parent_kategorie_id);
create index kategorien_maschinentyp_idx on public.kategorien (maschinentyp);

-- ----------------------------------------------------------------------------
-- Tabelle: teile
-- Ein "Teil" ist ein konkretes Maschinenteil, für das es Videos gibt.
-- Jedes Teil bekommt eine eigene qr_code_id, über die der QR-Code erzeugt wird.
-- ----------------------------------------------------------------------------
create table public.teile (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  teilenummer text not null,
  qr_code_id text not null unique default encode(gen_random_bytes(8), 'hex'),
  kategorie_id uuid references public.kategorien (id) on delete set null,
  erstellt_am timestamptz not null default now()
);

create index teile_kategorie_idx on public.teile (kategorie_id);
create unique index teile_teilenummer_idx on public.teile (teilenummer);

-- ----------------------------------------------------------------------------
-- Tabelle: videos
-- ----------------------------------------------------------------------------
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  titel text not null,
  datei_url text not null,
  dauer integer, -- Dauer in Sekunden
  beschreibung_schritte text default '',
  teil_id uuid references public.teile (id) on delete set null,
  status text not null default 'entwurf' check (status in ('entwurf', 'pruefung', 'veroeffentlicht')),
  hochgeladen_von uuid references public.users (id) on delete set null,
  erstellt_am timestamptz not null default now(),
  -- Für spätere Mehrsprachigkeit vorbereitet, aktuell ungenutzt:
  sprachen_verfuegbar text[] not null default '{}',
  -- Einfacher Aufruf-Zähler fürs Analytics-Dashboard:
  aufrufe integer not null default 0
);

create index videos_teil_idx on public.videos (teil_id);
create index videos_status_idx on public.videos (status);

-- ----------------------------------------------------------------------------
-- Tabelle: tags (inkl. Synonyme) und n:m-Verknüpfung zu videos
-- ----------------------------------------------------------------------------
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  synonyme text[] not null default '{}'
);

create table public.video_tags (
  video_id uuid not null references public.videos (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (video_id, tag_id)
);

-- ----------------------------------------------------------------------------
-- Tabelle: feedback ("War das hilfreich?")
-- ----------------------------------------------------------------------------
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos (id) on delete cascade,
  user_id uuid references public.users (id) on delete set null,
  hilfreich boolean not null,
  erstellt_am timestamptz not null default now()
);

create index feedback_video_idx on public.feedback (video_id);

-- ----------------------------------------------------------------------------
-- Tabelle: suchanfragen_ohne_treffer (fürs Analytics-Dashboard)
-- ----------------------------------------------------------------------------
create table public.suchanfragen_ohne_treffer (
  id uuid primary key default gen_random_uuid(),
  suchbegriff text not null,
  erstellt_am timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security (RLS) aktivieren
-- ============================================================================
alter table public.users enable row level security;
alter table public.kategorien enable row level security;
alter table public.teile enable row level security;
alter table public.videos enable row level security;
alter table public.tags enable row level security;
alter table public.video_tags enable row level security;
alter table public.feedback enable row level security;
alter table public.suchanfragen_ohne_treffer enable row level security;

-- users: jeder eingeloggte Nutzer darf alle Profile lesen (für Namen-Anzeige),
-- aber nur sein eigenes Profil ändern. Rolle darf nur Trainer/Admin ändern.
create policy "users_select_all" on public.users
  for select to authenticated using (true);

create policy "users_update_own" on public.users
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and rolle = (select rolle from public.users where id = auth.uid()));

-- kategorien: lesen dürfen alle eingeloggten Nutzer, ändern nur Trainer/Admin.
create policy "kategorien_select" on public.kategorien
  for select to authenticated using (true);
create policy "kategorien_write" on public.kategorien
  for all to authenticated
  using (public.is_trainer_admin())
  with check (public.is_trainer_admin());

-- teile: wie kategorien.
create policy "teile_select" on public.teile
  for select to authenticated using (true);
create policy "teile_write" on public.teile
  for all to authenticated
  using (public.is_trainer_admin())
  with check (public.is_trainer_admin());

-- tags: alle dürfen lesen; anlegen dürfen alle eingeloggten Nutzer (z.B. beim
-- Hochladen neue Tags erzeugen), ändern/löschen nur Trainer/Admin.
create policy "tags_select" on public.tags
  for select to authenticated using (true);
create policy "tags_insert" on public.tags
  for insert to authenticated with check (true);
create policy "tags_update_delete" on public.tags
  for update to authenticated using (public.is_trainer_admin()) with check (public.is_trainer_admin());
create policy "tags_delete" on public.tags
  for delete to authenticated using (public.is_trainer_admin());

create policy "video_tags_select" on public.video_tags
  for select to authenticated using (true);
create policy "video_tags_insert" on public.video_tags
  for insert to authenticated with check (true);
create policy "video_tags_delete" on public.video_tags
  for delete to authenticated using (
    public.is_trainer_admin()
    or exists (select 1 from public.videos v where v.id = video_id and v.hochgeladen_von = auth.uid())
  );

-- videos: veröffentlichte Videos sieht jeder. Eigene Videos (egal welcher
-- Status) sieht man auch selbst. Trainer/Admin sehen alles.
create policy "videos_select" on public.videos
  for select to authenticated using (
    status = 'veroeffentlicht'
    or hochgeladen_von = auth.uid()
    or public.is_trainer_admin()
  );

-- Hochladen darf jeder eingeloggte Nutzer, aber nur für sich selbst.
create policy "videos_insert" on public.videos
  for insert to authenticated with check (hochgeladen_von = auth.uid());

-- Ändern dürfen: Trainer/Admin immer, Nutzer ihr eigenes Video nur solange
-- es noch nicht veröffentlicht ist.
create policy "videos_update" on public.videos
  for update to authenticated
  using (
    public.is_trainer_admin()
    or (hochgeladen_von = auth.uid() and status <> 'veroeffentlicht')
  )
  with check (
    public.is_trainer_admin()
    or (hochgeladen_von = auth.uid() and status <> 'veroeffentlicht')
  );

create policy "videos_delete" on public.videos
  for delete to authenticated using (public.is_trainer_admin());

-- feedback: jeder darf für sich selbst Feedback abgeben und sein eigenes
-- sehen; Trainer/Admin sehen alles fürs Analytics-Dashboard.
create policy "feedback_select" on public.feedback
  for select to authenticated using (user_id = auth.uid() or public.is_trainer_admin());
create policy "feedback_insert" on public.feedback
  for insert to authenticated with check (user_id = auth.uid());

-- suchanfragen_ohne_treffer: jeder darf eine Zeile anlegen (beim Suchen ohne
-- Treffer), lesen dürfen nur Trainer/Admin (Analytics).
create policy "suchanfragen_insert" on public.suchanfragen_ohne_treffer
  for insert to authenticated with check (true);
create policy "suchanfragen_select" on public.suchanfragen_ohne_treffer
  for select to authenticated using (public.is_trainer_admin());

-- ============================================================================
-- Datenbank-Funktion: Video-Aufruf zählen (für Analytics)
-- ============================================================================
create or replace function public.video_aufruf_zaehlen(p_video_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.videos set aufrufe = aufrufe + 1 where id = p_video_id;
$$;

grant execute on function public.video_aufruf_zaehlen(uuid) to authenticated;

-- ============================================================================
-- Storage: Bucket für Videodateien
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

-- Jeder eingeloggte Nutzer darf Videodateien hochladen.
create policy "videos_bucket_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'videos');

-- Videodateien sind öffentlich lesbar (der Skill Manager ist eine interne
-- Plattform ohne Internetzugriff von außen; der Bucket-Name allein ist nicht
-- erratbar genug, um als Zugriffsschutz zu gelten – für den MVP ausreichend).
create policy "videos_bucket_select" on storage.objects
  for select to public
  using (bucket_id = 'videos');

-- Löschen/Ersetzen nur durch Trainer/Admin oder den ursprünglichen Uploader.
create policy "videos_bucket_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'videos' and (owner = auth.uid() or public.is_trainer_admin()));

-- ============================================================================
-- Werksbesichtigung v2: mehrere Positionen+Produkte je Förderband,
-- Gurtzustand, Status (Entwurf/Abgeschlossen), hochgeladene Berichte.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Mehrere Positionen je Förderband-Eintrag (statt einer einzelnen Position
--    + einem Produkt direkt am Eintrag): an einem Förderband kann z.B. an
--    Kopftrommel UND Ablaufpunkt je ein anderes Produkt empfohlen werden.
-- ----------------------------------------------------------------------------
create table public.foerderband_positionen (
  id uuid primary key default gen_random_uuid(),
  foerderband_eintrag_id uuid not null references public.foerderband_eintraege (id) on delete cascade,
  position text not null check (position in ('kopftrommel', 'ablaufpunkt', 'waschbox', 'freifeld')),
  position_freitext text,
  produkt_kategorie_id uuid references public.kategorien (id) on delete set null,
  konfiguration text not null default '',
  reihenfolge integer not null default 0,
  erstellt_am timestamptz not null default now()
);

create index foerderband_positionen_eintrag_idx on public.foerderband_positionen (foerderband_eintrag_id);
create index foerderband_positionen_produkt_idx on public.foerderband_positionen (produkt_kategorie_id);

alter table public.foerderband_eintraege drop column if exists position;
alter table public.foerderband_eintraege drop column if exists produkt_kategorie_id;

-- Gurtzustand: unabhängig von der Gurtverbindung (belt_connection), die den
-- Verbindungstyp beschreibt - hier geht es um den optischen/technischen
-- Zustand des vorgefundenen Gurts.
alter table public.foerderband_eintraege
  add column if not exists gurtzustand text check (gurtzustand in ('neu', 'leicht', 'mittel', 'stark'));

alter table public.foerderband_positionen enable row level security;

create policy "foerderband_positionen_select" on public.foerderband_positionen
  for select to authenticated using (
    exists (
      select 1 from public.foerderband_eintraege f
      where f.id = foerderband_eintrag_id and public.werksbesichtigung_sichtbar(f.werksbesichtigung_id)
    )
  );

create policy "foerderband_positionen_write" on public.foerderband_positionen
  for all to authenticated
  using (
    exists (
      select 1 from public.foerderband_eintraege f
      where f.id = foerderband_eintrag_id and public.werksbesichtigung_bearbeitbar(f.werksbesichtigung_id)
    )
  )
  with check (
    exists (
      select 1 from public.foerderband_eintraege f
      where f.id = foerderband_eintrag_id and public.werksbesichtigung_bearbeitbar(f.werksbesichtigung_id)
    )
  );

-- ----------------------------------------------------------------------------
-- 2. Status: Entwurf (wird noch bearbeitet) / Abgeschlossen (Bericht fertig).
-- ----------------------------------------------------------------------------
alter table public.werksbesichtigungen
  add column if not exists status text not null default 'entwurf' check (status in ('entwurf', 'abgeschlossen'));

-- ----------------------------------------------------------------------------
-- 3. Hochgeladene Berichte: fertige Berichte (PDF/Word), die nicht mit dem
--    SkillManager-Notizwerkzeug erstellt wurden, aber gemeinsam mit den
--    SkillManager-Werksbesichtigungen in einer Übersicht auftauchen sollen.
-- ----------------------------------------------------------------------------
create table public.hochgeladene_berichte (
  id uuid primary key default gen_random_uuid(),
  hochgeladen_von uuid references public.users (id) on delete set null,
  kunde text not null,
  ort text,
  datum date not null default current_date,
  dateiname text not null,
  datei_url text not null,
  merkteam_id uuid references public.merkteams (id) on delete set null,
  erstellt_am timestamptz not null default now()
);

create index hochgeladene_berichte_hochgeladen_von_idx on public.hochgeladene_berichte (hochgeladen_von);
create index hochgeladene_berichte_merkteam_idx on public.hochgeladene_berichte (merkteam_id);

insert into storage.buckets (id, name, public)
values ('werksbesichtigung-berichte', 'werksbesichtigung-berichte', true)
on conflict (id) do nothing;

create policy "werksbesichtigung_berichte_bucket_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'werksbesichtigung-berichte');
create policy "werksbesichtigung_berichte_bucket_select" on storage.objects
  for select to public using (bucket_id = 'werksbesichtigung-berichte');
create policy "werksbesichtigung_berichte_bucket_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'werksbesichtigung-berichte' and (owner = auth.uid() or public.is_admin_oder_hoeher()));

alter table public.hochgeladene_berichte enable row level security;

create or replace function public.hochgeladener_bericht_sichtbar(p_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.hochgeladene_berichte b
    where b.id = p_id
      and (
        b.hochgeladen_von = auth.uid()
        or (b.merkteam_id is not null and public.ist_merkteam_mitglied(b.merkteam_id))
        or public.is_admin_oder_hoeher()
      )
  );
$$;

create policy "hochgeladene_berichte_select" on public.hochgeladene_berichte
  for select to authenticated using (public.hochgeladener_bericht_sichtbar(id));

create policy "hochgeladene_berichte_insert" on public.hochgeladene_berichte
  for insert to authenticated with check (hochgeladen_von = auth.uid());

create policy "hochgeladene_berichte_update" on public.hochgeladene_berichte
  for update to authenticated
  using (hochgeladen_von = auth.uid() or public.is_admin_oder_hoeher())
  with check (hochgeladen_von = auth.uid() or public.is_admin_oder_hoeher());

create policy "hochgeladene_berichte_delete" on public.hochgeladene_berichte
  for delete to authenticated
  using (hochgeladen_von = auth.uid() or public.is_admin_oder_hoeher());

-- ============================================================================
-- Werksbesichtigungen (Phase A des neuen Features)
-- ============================================================================
-- Digitale Notizen für Kundenbesuche: allgemeine Angaben zum Besuch, darin
-- beliebig viele Förderband-Einträge mit technischen Daten, jeweils eigenen
-- Fotos, optional verknüpft mit bestehenden Referenzen. Sichtbarkeit
-- team-basiert wie Merkteams, Bearbeitung nur Ersteller + freigeschaltete
-- Mitbearbeiter. Anlegen dürfen alle eingeloggten Nutzer (auch Zuschauer) -
-- anders als bei Video-/Referenz-Uploads.
--
-- Position der Förderband-Einträge und weitere feste Auswahllisten
-- (Material/Bandbreite/Gurtverbindung) sind bewusst fest im Code hinterlegt,
-- nicht über eine Datenbanktabelle admin-verwaltbar - analog zu
-- referenzvideoOptionen.ts.
--
-- Offline-Fähigkeit ist bewusst NICHT Teil dieser Migration, sondern eine
-- spätere, eigene Phase D.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Werksbesichtigungen + Mitbearbeiter
-- ----------------------------------------------------------------------------
create table public.werksbesichtigungen (
  id uuid primary key default gen_random_uuid(),
  ersteller_id uuid references public.users (id) on delete set null,
  kunde text not null,
  ort text,
  datum date not null default current_date,
  notizen text not null default '',
  merkteam_id uuid references public.merkteams (id) on delete set null,
  erstellt_am timestamptz not null default now()
);

create index werksbesichtigungen_ersteller_idx on public.werksbesichtigungen (ersteller_id);
create index werksbesichtigungen_merkteam_idx on public.werksbesichtigungen (merkteam_id);

create table public.werksbesichtigung_bearbeiter (
  werksbesichtigung_id uuid not null references public.werksbesichtigungen (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  hinzugefuegt_am timestamptz not null default now(),
  primary key (werksbesichtigung_id, user_id)
);

-- ----------------------------------------------------------------------------
-- 2. Förderband-Einträge (1:n zu einer Werksbesichtigung)
-- ----------------------------------------------------------------------------
create table public.foerderband_eintraege (
  id uuid primary key default gen_random_uuid(),
  werksbesichtigung_id uuid not null references public.werksbesichtigungen (id) on delete cascade,
  bezeichnung text not null,
  foerderbandbreite text,
  geschwindigkeit_ms numeric(4, 1),
  material text,
  material_sonstiges text,
  belt_connection text,
  schurren_masse text,
  position text not null check (position in ('kopftrommel', 'ablaufpunkt', 'waschbox', 'freifeld')),
  produkt_kategorie_id uuid references public.kategorien (id) on delete set null,
  notizen text not null default '',
  reihenfolge integer not null default 0,
  erstellt_am timestamptz not null default now()
);

create index foerderband_eintraege_besichtigung_idx on public.foerderband_eintraege (werksbesichtigung_id);
create index foerderband_eintraege_produkt_idx on public.foerderband_eintraege (produkt_kategorie_id);

-- ----------------------------------------------------------------------------
-- 3. Fotos je Förderband-Eintrag
-- ----------------------------------------------------------------------------
create table public.foerderband_fotos (
  id uuid primary key default gen_random_uuid(),
  foerderband_eintrag_id uuid not null references public.foerderband_eintraege (id) on delete cascade,
  foto_url text not null,
  erstellt_am timestamptz not null default now()
);

create index foerderband_fotos_eintrag_idx on public.foerderband_fotos (foerderband_eintrag_id);

-- ----------------------------------------------------------------------------
-- 4. Optionale Verknüpfung einzelner Förderband-Einträge mit Referenzen
-- ----------------------------------------------------------------------------
create table public.foerderband_referenz_verknuepfungen (
  foerderband_eintrag_id uuid not null references public.foerderband_eintraege (id) on delete cascade,
  referenz_id uuid not null references public.referenzen (id) on delete cascade,
  primary key (foerderband_eintrag_id, referenz_id)
);

-- ----------------------------------------------------------------------------
-- 5. Storage-Bucket für Fotos
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('werksbesichtigung-fotos', 'werksbesichtigung-fotos', true)
on conflict (id) do nothing;

create policy "werksbesichtigung_fotos_bucket_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'werksbesichtigung-fotos');
create policy "werksbesichtigung_fotos_bucket_select" on storage.objects
  for select to public using (bucket_id = 'werksbesichtigung-fotos');
create policy "werksbesichtigung_fotos_bucket_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'werksbesichtigung-fotos' and (owner = auth.uid() or public.is_admin_oder_hoeher()));

-- ----------------------------------------------------------------------------
-- 6. Row Level Security
-- ----------------------------------------------------------------------------
alter table public.werksbesichtigungen enable row level security;
alter table public.werksbesichtigung_bearbeiter enable row level security;
alter table public.foerderband_eintraege enable row level security;
alter table public.foerderband_fotos enable row level security;
alter table public.foerderband_referenz_verknuepfungen enable row level security;

-- Sichtbarkeit: Ersteller, freigeschaltete Mitbearbeiter, Mitglieder des
-- zugeordneten Merkteams (falls gesetzt), und Admins.
create or replace function public.werksbesichtigung_sichtbar(p_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.werksbesichtigungen w
    where w.id = p_id
      and (
        w.ersteller_id = auth.uid()
        or (w.merkteam_id is not null and public.ist_merkteam_mitglied(w.merkteam_id))
        or exists (
          select 1 from public.werksbesichtigung_bearbeiter b
          where b.werksbesichtigung_id = w.id and b.user_id = auth.uid()
        )
        or public.is_admin_oder_hoeher()
      )
  );
$$;

-- Bearbeitbarkeit: Ersteller, freigeschaltete Mitbearbeiter, Admins - NICHT
-- automatisch alle Merkteam-Mitglieder (Sichtbarkeit über das Team ist etwas
-- anderes als Schreibrecht).
create or replace function public.werksbesichtigung_bearbeitbar(p_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.werksbesichtigungen w
    where w.id = p_id
      and (
        w.ersteller_id = auth.uid()
        or exists (
          select 1 from public.werksbesichtigung_bearbeiter b
          where b.werksbesichtigung_id = w.id and b.user_id = auth.uid()
        )
        or public.is_admin_oder_hoeher()
      )
  );
$$;

create policy "werksbesichtigungen_select" on public.werksbesichtigungen
  for select to authenticated using (public.werksbesichtigung_sichtbar(id));

create policy "werksbesichtigungen_insert" on public.werksbesichtigungen
  for insert to authenticated with check (ersteller_id = auth.uid());

create policy "werksbesichtigungen_update" on public.werksbesichtigungen
  for update to authenticated
  using (public.werksbesichtigung_bearbeitbar(id))
  with check (public.werksbesichtigung_bearbeitbar(id));

create policy "werksbesichtigungen_delete" on public.werksbesichtigungen
  for delete to authenticated
  using (ersteller_id = auth.uid() or public.is_admin_oder_hoeher());

-- Mitbearbeiter-Zuordnung: nur der Ersteller (bzw. Admins) darf sie
-- verwalten; sehen dürfen sie alle, die die Werksbesichtigung sehen dürfen.
create policy "werksbesichtigung_bearbeiter_select" on public.werksbesichtigung_bearbeiter
  for select to authenticated using (public.werksbesichtigung_sichtbar(werksbesichtigung_id));

create policy "werksbesichtigung_bearbeiter_insert" on public.werksbesichtigung_bearbeiter
  for insert to authenticated
  with check (
    exists (
      select 1 from public.werksbesichtigungen w
      where w.id = werksbesichtigung_id
        and (w.ersteller_id = auth.uid() or public.is_admin_oder_hoeher())
    )
  );

create policy "werksbesichtigung_bearbeiter_delete" on public.werksbesichtigung_bearbeiter
  for delete to authenticated
  using (
    exists (
      select 1 from public.werksbesichtigungen w
      where w.id = werksbesichtigung_id
        and (w.ersteller_id = auth.uid() or public.is_admin_oder_hoeher())
    )
  );

-- Förderband-Einträge und Fotos: Sichtbarkeit/Bearbeitbarkeit hängt jeweils
-- an der übergeordneten Werksbesichtigung.
create policy "foerderband_eintraege_select" on public.foerderband_eintraege
  for select to authenticated using (public.werksbesichtigung_sichtbar(werksbesichtigung_id));

create policy "foerderband_eintraege_write" on public.foerderband_eintraege
  for all to authenticated
  using (public.werksbesichtigung_bearbeitbar(werksbesichtigung_id))
  with check (public.werksbesichtigung_bearbeitbar(werksbesichtigung_id));

create policy "foerderband_fotos_select" on public.foerderband_fotos
  for select to authenticated using (
    exists (
      select 1 from public.foerderband_eintraege f
      where f.id = foerderband_eintrag_id and public.werksbesichtigung_sichtbar(f.werksbesichtigung_id)
    )
  );

create policy "foerderband_fotos_write" on public.foerderband_fotos
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

create policy "foerderband_referenz_verknuepfungen_select" on public.foerderband_referenz_verknuepfungen
  for select to authenticated using (
    exists (
      select 1 from public.foerderband_eintraege f
      where f.id = foerderband_eintrag_id and public.werksbesichtigung_sichtbar(f.werksbesichtigung_id)
    )
  );

create policy "foerderband_referenz_verknuepfungen_write" on public.foerderband_referenz_verknuepfungen
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

-- ============================================================================
-- Phase 17a: Referenzbereich - Datengrundlage
-- ============================================================================
-- Der bisherige "Referenzvideos"-Bereich wird zum "Referenzbereich" erweitert:
-- statt nur Videos gibt es jetzt vier Inhaltstypen (Video, Foto, Dokument,
-- Link), die alle über dieselben Sachfilter (Material, Förderbandbreite,
-- Geschwindigkeit, Kategorie-Kaskade, ...) durchsucht werden können.
--
-- Dafür entsteht eine neue, zentrale Tabelle "referenzen" (der Eintrag an
-- sich: Titel, Typ, Kategorie, Freigabe-Status), an die sich - je nach Typ -
-- eine der vier Detail-Tabellen hängt (referenz_video/_foto/_dokument/_link).
-- Die Sachfilter-Felder liegen typübergreifend in "referenz_metadaten".
--
-- Bestehende Referenzvideos (videos.video_typ = 'referenz') werden in dieses
-- neue Schema KOPIERT (nicht verschoben) - die alten Zeilen in "videos",
-- "referenz_video_details", "video_likes", "video_tags" und "kommentare"
-- bleiben bewusst unangetastet stehen, damit nichts verloren geht, solange
-- die neue Oberfläche (Phase 17c) noch nicht fertig ist. Ein Aufräumen der
-- alten Zeilen ist ein späterer, separater Schritt, erst nachdem die neue
-- Referenzbereich-Seite produktiv läuft.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Zentrale Tabelle: referenzen
-- ----------------------------------------------------------------------------
create table public.referenzen (
  id uuid primary key default gen_random_uuid(),
  titel text not null,
  beschreibung text not null default '',
  typ text not null check (typ in ('video', 'foto', 'dokument', 'link')),
  kategorie_id uuid references public.kategorien (id) on delete set null,
  teil_id uuid references public.teile (id) on delete set null,
  status text not null default 'entwurf' check (status in ('entwurf', 'pruefung', 'veroeffentlicht')),
  hochgeladen_von uuid references public.users (id) on delete set null,
  erstellt_am timestamptz not null default now()
);

create index referenzen_typ_idx on public.referenzen (typ);
create index referenzen_status_idx on public.referenzen (status);
create index referenzen_kategorie_idx on public.referenzen (kategorie_id);
create index referenzen_teil_idx on public.referenzen (teil_id);

-- ----------------------------------------------------------------------------
-- 2. Sachfilter-Felder, typübergreifend (bisher: referenz_video_details)
-- ----------------------------------------------------------------------------
create table public.referenz_metadaten (
  referenz_id uuid primary key references public.referenzen (id) on delete cascade,
  material text,
  material_sonstiges text,
  geschwindigkeit_ms numeric(4, 1),
  foerderbandbreite text,
  belt_connection text,
  mechanical_splice_typ text,
  runback_reversible boolean not null default false,
  land text,
  besonderheiten text
);

-- ----------------------------------------------------------------------------
-- 3. Typ-spezifische Inhalte
-- ----------------------------------------------------------------------------
create table public.referenz_video (
  referenz_id uuid primary key references public.referenzen (id) on delete cascade,
  datei_url text not null,
  thumbnail_url text,
  dauer integer
);

-- Vorher/Nachher-Foto: beide Bilder optional (mind. eines sollte gesetzt
-- sein, das prüft die Server Action beim Anlegen).
create table public.referenz_foto (
  referenz_id uuid primary key references public.referenzen (id) on delete cascade,
  vorher_url text,
  nachher_url text
);

-- volltext enthält den beim Hochladen extrahierten Text (PDF/Word), damit
-- die Volltextsuche funktioniert, ohne dass Nutzer den Rohtext sehen.
create table public.referenz_dokument (
  referenz_id uuid primary key references public.referenzen (id) on delete cascade,
  datei_url text not null,
  dateiname text not null,
  dateityp text not null check (dateityp in ('pdf', 'word')),
  volltext text not null default ''
);

create table public.referenz_link (
  referenz_id uuid primary key references public.referenzen (id) on delete cascade,
  url text not null,
  quelle text
);

-- ----------------------------------------------------------------------------
-- 4. Tags, Likes, Kommentare (analog zu videos)
-- ----------------------------------------------------------------------------
create table public.referenz_tags (
  referenz_id uuid not null references public.referenzen (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (referenz_id, tag_id)
);

create table public.referenz_likes (
  referenz_id uuid not null references public.referenzen (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  erstellt_am timestamptz not null default now(),
  primary key (referenz_id, user_id)
);

create index referenz_likes_referenz_idx on public.referenz_likes (referenz_id);

create table public.referenz_kommentare (
  id uuid primary key default gen_random_uuid(),
  referenz_id uuid not null references public.referenzen (id) on delete cascade,
  user_id uuid references public.users (id) on delete set null,
  text text not null,
  erstellt_am timestamptz not null default now()
);

create index referenz_kommentare_referenz_idx on public.referenz_kommentare (referenz_id);

-- ----------------------------------------------------------------------------
-- 5. Verwandte Referenzen: manuell erstellte Verknüpfungen zwischen zwei
--    Einträgen (z.B. Vorher/Nachher-Foto + Video + Bericht zum selben Einbau).
--    Eine Zeile deckt beide Richtungen ab (a<->b), die App fragt beide Seiten
--    ab. Die kleinere ID steht immer in referenz_id_a (per Check erzwungen),
--    damit dieselbe Verknüpfung nicht doppelt angelegt werden kann.
-- ----------------------------------------------------------------------------
create table public.referenz_verknuepfungen (
  referenz_id_a uuid not null references public.referenzen (id) on delete cascade,
  referenz_id_b uuid not null references public.referenzen (id) on delete cascade,
  erstellt_von uuid references public.users (id) on delete set null,
  erstellt_am timestamptz not null default now(),
  primary key (referenz_id_a, referenz_id_b),
  constraint referenz_verknuepfungen_reihenfolge check (referenz_id_a < referenz_id_b)
);

create index referenz_verknuepfungen_b_idx on public.referenz_verknuepfungen (referenz_id_b);

-- ----------------------------------------------------------------------------
-- 6. Storage-Buckets für Fotos und Dokumente (Videos/Thumbnails nutzen die
--    bestehenden Buckets "videos"/"thumbnails" mit).
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('referenz-fotos', 'referenz-fotos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('referenz-dokumente', 'referenz-dokumente', true)
on conflict (id) do nothing;

create policy "referenz_fotos_bucket_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'referenz-fotos');
create policy "referenz_fotos_bucket_select" on storage.objects
  for select to public using (bucket_id = 'referenz-fotos');
create policy "referenz_fotos_bucket_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'referenz-fotos' and (owner = auth.uid() or public.is_admin_oder_hoeher()));

create policy "referenz_dokumente_bucket_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'referenz-dokumente');
create policy "referenz_dokumente_bucket_select" on storage.objects
  for select to public using (bucket_id = 'referenz-dokumente');
create policy "referenz_dokumente_bucket_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'referenz-dokumente' and (owner = auth.uid() or public.is_admin_oder_hoeher()));

-- ----------------------------------------------------------------------------
-- 7. Row Level Security
-- ----------------------------------------------------------------------------
alter table public.referenzen enable row level security;
alter table public.referenz_metadaten enable row level security;
alter table public.referenz_video enable row level security;
alter table public.referenz_foto enable row level security;
alter table public.referenz_dokument enable row level security;
alter table public.referenz_link enable row level security;
alter table public.referenz_tags enable row level security;
alter table public.referenz_likes enable row level security;
alter table public.referenz_kommentare enable row level security;
alter table public.referenz_verknuepfungen enable row level security;

-- referenzen: gleiche Sichtbarkeits-/Änderungsregeln wie bei videos.
create policy "referenzen_select" on public.referenzen
  for select to authenticated using (
    status = 'veroeffentlicht'
    or hochgeladen_von = auth.uid()
    or public.is_admin_oder_hoeher()
  );

create policy "referenzen_insert" on public.referenzen
  for insert to authenticated with check (
    hochgeladen_von = auth.uid()
    and not exists (
      select 1 from public.users u where u.id = auth.uid() and u.rolle = 'zuschauer'
    )
  );

create policy "referenzen_update" on public.referenzen
  for update to authenticated
  using (
    public.is_admin_oder_hoeher()
    or (hochgeladen_von = auth.uid() and status <> 'veroeffentlicht')
  )
  with check (
    public.is_admin_oder_hoeher()
    or (hochgeladen_von = auth.uid() and status <> 'veroeffentlicht')
  );

create policy "referenzen_delete" on public.referenzen
  for delete to authenticated using (public.is_admin_oder_hoeher());

-- Kleine Hilfsfunktion: darf der aktuelle Nutzer eine bestimmte Referenz
-- sehen/bearbeiten? Wird von den Detail-/Metadaten-Tabellen wiederverwendet,
-- statt die gleiche Bedingung fünfmal zu wiederholen.
create or replace function public.referenz_sichtbar(p_referenz_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.referenzen r
    where r.id = p_referenz_id
      and (
        r.status = 'veroeffentlicht'
        or r.hochgeladen_von = auth.uid()
        or public.is_admin_oder_hoeher()
      )
  );
$$;

create or replace function public.referenz_bearbeitbar(p_referenz_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.referenzen r
    where r.id = p_referenz_id
      and (
        public.is_admin_oder_hoeher()
        or (r.hochgeladen_von = auth.uid() and r.status <> 'veroeffentlicht')
      )
  );
$$;

-- referenz_metadaten / referenz_video / referenz_foto / referenz_dokument /
-- referenz_link: alle vier Detail-Tabellen bekommen dieselben vier Policies.
create policy "referenz_metadaten_select" on public.referenz_metadaten
  for select to authenticated using (public.referenz_sichtbar(referenz_id));
create policy "referenz_metadaten_insert" on public.referenz_metadaten
  for insert to authenticated with check (public.referenz_bearbeitbar(referenz_id));
create policy "referenz_metadaten_update" on public.referenz_metadaten
  for update to authenticated
  using (public.referenz_bearbeitbar(referenz_id)) with check (public.referenz_bearbeitbar(referenz_id));
create policy "referenz_metadaten_delete" on public.referenz_metadaten
  for delete to authenticated using (public.is_admin_oder_hoeher());

create policy "referenz_video_select" on public.referenz_video
  for select to authenticated using (public.referenz_sichtbar(referenz_id));
create policy "referenz_video_insert" on public.referenz_video
  for insert to authenticated with check (public.referenz_bearbeitbar(referenz_id));
create policy "referenz_video_update" on public.referenz_video
  for update to authenticated
  using (public.referenz_bearbeitbar(referenz_id)) with check (public.referenz_bearbeitbar(referenz_id));
create policy "referenz_video_delete" on public.referenz_video
  for delete to authenticated using (public.is_admin_oder_hoeher());

create policy "referenz_foto_select" on public.referenz_foto
  for select to authenticated using (public.referenz_sichtbar(referenz_id));
create policy "referenz_foto_insert" on public.referenz_foto
  for insert to authenticated with check (public.referenz_bearbeitbar(referenz_id));
create policy "referenz_foto_update" on public.referenz_foto
  for update to authenticated
  using (public.referenz_bearbeitbar(referenz_id)) with check (public.referenz_bearbeitbar(referenz_id));
create policy "referenz_foto_delete" on public.referenz_foto
  for delete to authenticated using (public.is_admin_oder_hoeher());

create policy "referenz_dokument_select" on public.referenz_dokument
  for select to authenticated using (public.referenz_sichtbar(referenz_id));
create policy "referenz_dokument_insert" on public.referenz_dokument
  for insert to authenticated with check (public.referenz_bearbeitbar(referenz_id));
create policy "referenz_dokument_update" on public.referenz_dokument
  for update to authenticated
  using (public.referenz_bearbeitbar(referenz_id)) with check (public.referenz_bearbeitbar(referenz_id));
create policy "referenz_dokument_delete" on public.referenz_dokument
  for delete to authenticated using (public.is_admin_oder_hoeher());

create policy "referenz_link_select" on public.referenz_link
  for select to authenticated using (public.referenz_sichtbar(referenz_id));
create policy "referenz_link_insert" on public.referenz_link
  for insert to authenticated with check (public.referenz_bearbeitbar(referenz_id));
create policy "referenz_link_update" on public.referenz_link
  for update to authenticated
  using (public.referenz_bearbeitbar(referenz_id)) with check (public.referenz_bearbeitbar(referenz_id));
create policy "referenz_link_delete" on public.referenz_link
  for delete to authenticated using (public.is_admin_oder_hoeher());

-- referenz_tags: lesen wie die Referenz selbst, ändern darf, wer die Referenz
-- bearbeiten darf (analog zu video_tags).
create policy "referenz_tags_select" on public.referenz_tags
  for select to authenticated using (public.referenz_sichtbar(referenz_id));
create policy "referenz_tags_insert" on public.referenz_tags
  for insert to authenticated with check (public.referenz_bearbeitbar(referenz_id));
create policy "referenz_tags_delete" on public.referenz_tags
  for delete to authenticated using (public.referenz_bearbeitbar(referenz_id));

-- referenz_likes: jeder eingeloggte Nutzer darf alle Likes sehen (für die
-- Anzeige der Gesamtzahl), aber nur seinen eigenen Like setzen/entfernen.
create policy "referenz_likes_select" on public.referenz_likes
  for select to authenticated using (true);
create policy "referenz_likes_insert" on public.referenz_likes
  for insert to authenticated with check (user_id = auth.uid());
create policy "referenz_likes_delete" on public.referenz_likes
  for delete to authenticated using (user_id = auth.uid());

-- referenz_kommentare: analog zu kommentare.
create policy "referenz_kommentare_select" on public.referenz_kommentare
  for select to authenticated using (public.referenz_sichtbar(referenz_id));
create policy "referenz_kommentare_insert" on public.referenz_kommentare
  for insert to authenticated with check (user_id = auth.uid());
create policy "referenz_kommentare_delete" on public.referenz_kommentare
  for delete to authenticated using (user_id = auth.uid() or public.is_admin_oder_hoeher());

-- referenz_verknuepfungen: sehen darf, wer mindestens eine der beiden
-- verlinkten Referenzen sehen darf. Anlegen/löschen darf, wer mindestens
-- eine der beiden Referenzen bearbeiten darf (Uploader vor Freigabe, oder
-- Admin/Superadmin jederzeit).
create policy "referenz_verknuepfungen_select" on public.referenz_verknuepfungen
  for select to authenticated using (
    public.referenz_sichtbar(referenz_id_a) or public.referenz_sichtbar(referenz_id_b)
  );
create policy "referenz_verknuepfungen_insert" on public.referenz_verknuepfungen
  for insert to authenticated with check (
    public.referenz_bearbeitbar(referenz_id_a) or public.referenz_bearbeitbar(referenz_id_b)
  );
create policy "referenz_verknuepfungen_delete" on public.referenz_verknuepfungen
  for delete to authenticated using (
    public.referenz_bearbeitbar(referenz_id_a) or public.referenz_bearbeitbar(referenz_id_b)
  );

-- ----------------------------------------------------------------------------
-- 8. Bestehende Referenzvideos in die neue Struktur übernehmen (kopieren,
--    nicht verschieben - siehe Hinweis oben).
-- ----------------------------------------------------------------------------
do $$
declare
  v record;
  neue_id uuid;
begin
  for v in
    select * from public.videos where video_typ = 'referenz'
  loop
    insert into public.referenzen (
      id, titel, beschreibung, typ, kategorie_id, teil_id, status, hochgeladen_von, erstellt_am
    ) values (
      v.id, v.titel, coalesce(v.beschreibung_schritte, ''), 'video', v.kategorie_id, v.teil_id,
      v.status, v.hochgeladen_von, v.erstellt_am
    )
    returning id into neue_id;

    insert into public.referenz_video (referenz_id, datei_url, thumbnail_url, dauer)
    values (neue_id, v.datei_url, v.thumbnail_url, v.dauer);

    insert into public.referenz_metadaten (
      referenz_id, material, material_sonstiges, geschwindigkeit_ms, foerderbandbreite,
      belt_connection, mechanical_splice_typ, runback_reversible, land, besonderheiten
    )
    select
      neue_id, d.material, d.material_sonstiges, d.geschwindigkeit_ms, d.foerderbandbreite,
      d.belt_connection, d.mechanical_splice_typ, d.runback_reversible, d.land, d.besonderheiten
    from public.referenz_video_details d
    where d.video_id = v.id;

    insert into public.referenz_tags (referenz_id, tag_id)
    select neue_id, vt.tag_id from public.video_tags vt where vt.video_id = v.id;

    insert into public.referenz_likes (referenz_id, user_id, erstellt_am)
    select neue_id, vl.user_id, vl.erstellt_am from public.video_likes vl where vl.video_id = v.id;
  end loop;
end $$;

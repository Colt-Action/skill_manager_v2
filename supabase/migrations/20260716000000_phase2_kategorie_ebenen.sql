-- ============================================================================
-- Phase 2: 5-stufige Kategorie-Struktur
-- ============================================================================
-- Neue Hierarchie: Industrie -> Hersteller -> Produkt -> Kategorie -> Teil
-- (bisher: Maschinentyp (Text) -> Kategorie -> Teil)
--
-- "kategorien" wird jetzt für die ersten vier Ebenen genutzt (über
-- parent_kategorie_id beliebig verschachtelt), die neue Spalte "ebene"
-- sagt, um welche der vier Ebenen es sich bei einer Zeile handelt.
-- "teile" hängt weiterhin an einer kategorien-Zeile mit ebene='kategorie'
-- und bekommt zusätzlich eine Beschreibung (die Teilenummer/ID-Nr. gibt
-- es als "teilenummer" schon aus Phase 0).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Neue Spalte "ebene"
-- ----------------------------------------------------------------------------
alter table public.kategorien add column if not exists ebene text;

-- Bestehende Zeilen (aus der ursprünglichen Struktur) sind alle auf der
-- untersten Ebene ("kategorie") - Teile hängen direkt an ihnen.
update public.kategorien set ebene = 'kategorie' where ebene is null;

alter table public.kategorien alter column ebene set not null;
alter table public.kategorien
  add constraint kategorien_ebene_check
  check (ebene in ('industrie', 'hersteller', 'produkt', 'kategorie'));

-- ----------------------------------------------------------------------------
-- 2. Bestehende Daten in die neue Hierarchie einhängen
-- ----------------------------------------------------------------------------
-- Für jeden bisherigen "maschinentyp"-Wert legen wir eine Industrie- und
-- eine Hersteller- und eine Produkt-Zeile an, und hängen die bestehende
-- Kategorie-Zeile darunter ein. So bleiben alle bestehenden Teile/Videos
-- gültig, auch wenn die alten Test-Daten nicht der neuen HOSCH-Struktur
-- entsprechen.
do $$
declare
  mtyp text;
  industrie_id uuid;
  hersteller_id uuid;
  produkt_id uuid;
begin
  for mtyp in select distinct maschinentyp from public.kategorien where maschinentyp is not null loop
    insert into public.kategorien (name, ebene, parent_kategorie_id)
    values (mtyp, 'industrie', null)
    returning id into industrie_id;

    insert into public.kategorien (name, ebene, parent_kategorie_id)
    values ('Allgemein', 'hersteller', industrie_id)
    returning id into hersteller_id;

    insert into public.kategorien (name, ebene, parent_kategorie_id)
    values ('Allgemein', 'produkt', hersteller_id)
    returning id into produkt_id;

    update public.kategorien
      set parent_kategorie_id = produkt_id
      where maschinentyp = mtyp and ebene = 'kategorie';
  end loop;
end $$;

alter table public.kategorien drop column if exists maschinentyp;

-- ----------------------------------------------------------------------------
-- 3. Teile: Beschreibung hinzufügen (Teilenummer/ID-Nr. gibt's schon)
-- ----------------------------------------------------------------------------
alter table public.teile add column if not exists beschreibung text not null default '';

-- ----------------------------------------------------------------------------
-- 4. Beispiel-Struktur: HOSCH (kann jederzeit über die Admin-Oberfläche
--    "Kategorien & Teile" erweitert/korrigiert werden)
-- ----------------------------------------------------------------------------
do $$
declare
  industrie_id uuid;
  hersteller_id uuid;
  p_abstreifer uuid;
  p_lenkrolle uuid;
  p_dicht uuid;
  p_digital uuid;
  k_a uuid;
begin
  insert into public.kategorien (name, ebene, parent_kategorie_id)
  values ('Maschinenbau', 'industrie', null)
  returning id into industrie_id;

  insert into public.kategorien (name, ebene, parent_kategorie_id)
  values ('HOSCH', 'hersteller', industrie_id)
  returning id into hersteller_id;

  insert into public.kategorien (name, ebene, parent_kategorie_id) values
    ('Abstreifer', 'produkt', hersteller_id) returning id into p_abstreifer;
  insert into public.kategorien (name, ebene, parent_kategorie_id) values
    ('Lenkrolle/-station', 'produkt', hersteller_id) returning id into p_lenkrolle;
  insert into public.kategorien (name, ebene, parent_kategorie_id) values
    ('Dichtleistensystem', 'produkt', hersteller_id) returning id into p_dicht;
  insert into public.kategorien (name, ebene, parent_kategorie_id) values
    ('Digitales', 'produkt', hersteller_id) returning id into p_digital;

  insert into public.kategorien (name, ebene, parent_kategorie_id)
  values ('A', 'kategorie', p_abstreifer) returning id into k_a;
  insert into public.kategorien (name, ebene, parent_kategorie_id) values
    ('B', 'kategorie', p_abstreifer),
    ('C', 'kategorie', p_abstreifer),
    ('D', 'kategorie', p_abstreifer),
    ('HD-PU', 'kategorie', p_abstreifer),
    ('HD0X', 'kategorie', p_abstreifer),
    ('RG1', 'kategorie', p_lenkrolle),
    ('RRG1', 'kategorie', p_lenkrolle),
    ('RRV-1', 'kategorie', p_lenkrolle),
    ('FD-x', 'kategorie', p_dicht),
    ('HOSCHiris DATA', 'kategorie', p_digital),
    ('HOSCHiris DETECT', 'kategorie', p_digital),
    ('HOSCHiris DISCOVER', 'kategorie', p_digital),
    ('HOSCHiris BeltScanner', 'kategorie', p_digital);

  -- Ein Beispiel-Teil, damit die Struktur direkt testbar ist. Bitte über
  -- "Kategorien & Teile" in der Admin-Oberfläche durch echte Teile ersetzen
  -- bzw. ergänzen.
  insert into public.teile (name, teilenummer, beschreibung, kategorie_id)
  values ('Beispiel-Abstreifer A', 'A-0001', 'Platzhalter - bitte durch echten Teil ersetzen.', k_a);
end $$;

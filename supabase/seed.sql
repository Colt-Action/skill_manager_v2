-- Optionale Testdaten, damit du die App nach der Einrichtung gleich
-- ausprobieren kannst (Filterleiste, Upload-Zuordnung, QR-Codes).
-- Kann gefahrlos mehrfach ausgeführt werden.

insert into public.kategorien (id, name, maschinentyp, parent_kategorie_id) values
  ('00000000-0000-0000-0000-000000000001', 'Antrieb', 'CNC-Fräse', null),
  ('00000000-0000-0000-0000-000000000002', 'Hydraulik', 'CNC-Fräse', null),
  ('00000000-0000-0000-0000-000000000003', 'Steuerung', 'Verpackungsanlage', null)
on conflict (id) do nothing;

insert into public.teile (id, name, teilenummer, kategorie_id) values
  ('00000000-0000-0000-0000-000000000101', 'Servomotor Achse X', 'SM-2201', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000102', 'Hydraulikventil V2', 'HV-3390', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000103', 'Bedienpanel SPS', 'BP-1042', '00000000-0000-0000-0000-000000000003')
on conflict (id) do nothing;

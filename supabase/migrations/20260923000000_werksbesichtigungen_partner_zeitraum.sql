-- ----------------------------------------------------------------------------
-- Werksbesichtigung: Partner-Feld ("besucht mit") und Zeitraum statt nur
-- Einzeldatum (datum = Beginn, datum_bis = optionales Ende).
-- ----------------------------------------------------------------------------
alter table public.werksbesichtigungen
  add column if not exists partner text,
  add column if not exists datum_bis date;

-- ----------------------------------------------------------------------------
-- Insert-Policy erneut anlegen (idempotent), falls sie auf der Datenbank
-- fehlt oder von einer älteren, abweichenden Version stammt.
-- ----------------------------------------------------------------------------
drop policy if exists "werksbesichtigungen_insert" on public.werksbesichtigungen;
create policy "werksbesichtigungen_insert" on public.werksbesichtigungen
  for insert to authenticated with check (ersteller_id = auth.uid());

-- Temporäre Diagnose-Funktion, um zu prüfen, was die Datenbank bei einem
-- Insert tatsächlich als auth.uid() der aktuellen Sitzung sieht. Wird
-- entfernt, sobald das Werksbesichtigung-RLS-Problem geklärt ist.
create or replace function public.debug_auth_uid()
returns uuid
language sql
stable
security invoker
as $$
  select auth.uid();
$$;

grant execute on function public.debug_auth_uid() to authenticated;

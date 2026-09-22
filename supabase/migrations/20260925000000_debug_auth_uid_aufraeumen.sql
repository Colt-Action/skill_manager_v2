-- Aufräumen: die temporäre Diagnose-Funktion aus der vorherigen Migration
-- wird nicht mehr benötigt, die eigentliche Ursache (INSERT ... RETURNING
-- + selbstreferenzierende RLS-Policy) ist gefunden und im Anwendungscode
-- behoben.
drop function if exists public.debug_auth_uid();

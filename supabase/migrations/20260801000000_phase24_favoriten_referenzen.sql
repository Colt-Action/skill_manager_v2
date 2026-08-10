-- Phase 24: Merkliste auch für Referenzbereich-Inhalte (Video/Foto/Dokument/
-- Link), nicht nur für Schulungsvideos. Bisher war favoriten.video_id eine
-- Pflichtspalte, die zwingend auf public.videos zeigte - Referenzen leben
-- aber in einer eigenen Tabelle (public.referenzen). Statt einer separaten
-- Tabelle wird favoriten um eine zweite, ebenfalls optionale Fremdschlüssel-
-- Spalte referenz_id erweitert; ein Check stellt sicher, dass immer genau
-- eines von beidem gesetzt ist.

alter table public.favoriten add column referenz_id uuid references public.referenzen (id) on delete cascade;
alter table public.favoriten alter column video_id drop not null;

alter table public.favoriten add constraint favoriten_genau_ein_ziel
  check (
    (video_id is not null and referenz_id is null)
    or (video_id is null and referenz_id is not null)
  );

drop index if exists public.favoriten_persoenlich_uniq;
drop index if exists public.favoriten_team_uniq;

create unique index favoriten_video_persoenlich_uniq on public.favoriten (video_id, user_id)
  where merkteam_id is null and video_id is not null;
create unique index favoriten_video_team_uniq on public.favoriten (video_id, merkteam_id)
  where merkteam_id is not null and video_id is not null;
create unique index favoriten_referenz_persoenlich_uniq on public.favoriten (referenz_id, user_id)
  where merkteam_id is null and referenz_id is not null;
create unique index favoriten_referenz_team_uniq on public.favoriten (referenz_id, merkteam_id)
  where merkteam_id is not null and referenz_id is not null;

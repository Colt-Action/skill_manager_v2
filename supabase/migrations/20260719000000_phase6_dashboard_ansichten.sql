-- ============================================================================
-- Phase 6: Dashboard – "Zuletzt angesehen"
-- ============================================================================
-- Damit das neue persönliche Dashboard zeigen kann, welche Videos ein Nutzer
-- zuletzt angeschaut hat, merken wir uns pro Nutzer und Video den letzten
-- Ansehen-Zeitpunkt. Ein Video taucht dadurch nur einmal in der Liste auf
-- (Zeitstempel wird bei erneutem Ansehen einfach aktualisiert).
-- ============================================================================

create table public.video_ansichten (
  user_id uuid not null references public.users (id) on delete cascade,
  video_id uuid not null references public.videos (id) on delete cascade,
  angesehen_am timestamptz not null default now(),
  primary key (user_id, video_id)
);

create index video_ansichten_user_zeit_idx on public.video_ansichten (user_id, angesehen_am desc);

alter table public.video_ansichten enable row level security;

create policy "video_ansichten_select" on public.video_ansichten
  for select to authenticated using (user_id = auth.uid());

create policy "video_ansichten_insert" on public.video_ansichten
  for insert to authenticated with check (user_id = auth.uid());

create policy "video_ansichten_update" on public.video_ansichten
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Merkt sich (bzw. aktualisiert), dass der aktuelle Nutzer dieses Video
-- gerade angesehen hat. Wird von der Video-Detailseite "fire and forget"
-- aufgerufen, analog zu video_aufruf_zaehlen.
create or replace function public.video_angesehen_merken(p_video_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.video_ansichten (user_id, video_id, angesehen_am)
  values (auth.uid(), p_video_id, now())
  on conflict (user_id, video_id) do update set angesehen_am = now();
end;
$$;

grant execute on function public.video_angesehen_merken(uuid) to authenticated;

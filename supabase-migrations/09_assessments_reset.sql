create extension if not exists pgcrypto;

-- Archive any legacy table so we do not lose data
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'assessments'
  ) then
    execute format(
      'alter table public.assessments rename to assessments_old_%s',
      to_char(now(), 'YYYYMMDDHH24MISS')
    );
  end if;
end$$;

-- Recreate a clean, unambiguous table
create table if not exists public.assessments (
  user_id    text primary key,
  answers    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

do $$
begin
  if not exists (
    select 1 from information_schema.triggers
    where event_object_table = 'assessments' and trigger_name = 'assessments_set_updated'
  ) then
    create trigger assessments_set_updated
    before update on public.assessments
    for each row execute function public.tg_set_updated_at();
  end if;
end$$;

-- Deterministic RPC for insert-or-update
create or replace function public.assessments_save(p_user_id text, p_answers jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.assessments (user_id, answers)
  values (p_user_id, p_answers)
  on conflict (user_id)
  do update set answers = excluded.answers, updated_at = now();
$$;



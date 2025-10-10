-- 07_providers.sql
create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  status text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
  created_by text,                        -- clerk user id (submitter) optional

  -- identity
  name text,               -- primary contact name
  business_name text,      -- brand/trade name
  type text not null,      -- 'agent' | 'lender' | 'property_manager' | 'other'
  email text,
  phone text,
  website text,
  calendly text,

  -- coverage & attributes
  state text,              -- primary state (2-letter) e.g., 'TX'
  city text,
  zip text,
  stations text[] default '{}', -- e.g., {'Fort Cavazos','JBSA'}
  coverage_states text[] default '{}',
  military_friendly boolean default true,
  spouse_owned boolean default false,
  va_expert boolean default false,

  -- compliance / notes
  license_id text,         -- e.g., NMLS, RE license
  notes text
);

create index if not exists providers_status_idx on public.providers(status);
create index if not exists providers_type_idx   on public.providers(type);
create index if not exists providers_state_idx  on public.providers(state);
create index if not exists providers_text_idx   on public.providers using gin (to_tsvector('simple',
  coalesce(name,'') || ' ' || coalesce(business_name,'') || ' ' || coalesce(city,'') || ' ' || coalesce(notes,'')
));

-- optional: a slim view for public/consumer reads (we'll still hit via service role)
create or replace view public.providers_public as
select
  id, created_at, type, name, business_name, email, phone, website, calendly,
  state, city, zip, stations, coverage_states,
  military_friendly, spouse_owned, va_expert, notes, license_id
from public.providers
where status = 'approved';

-- RLS (service role bypasses; keep it strict anyway)
alter table public.providers enable row level security;

-- Allow no direct anon selects; we'll read via server with service role.
-- (If you DO want client Supabase reads later, add safe SELECT on status='approved')

-- Keep an updated_at trigger
create or replace function public.tg_set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists providers_set_updated on public.providers;
create trigger providers_set_updated before update on public.providers
for each row execute function public.tg_set_updated_at();

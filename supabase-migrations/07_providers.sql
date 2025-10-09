-- 07_providers.sql
create table if not exists public.providers (
  id bigserial primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null,
  business_name text,
  type text not null, -- 'agent', 'lender', 'property_manager', 'other'
  location text, -- City, State or coverage area
  phone text,
  email text,
  website text,
  military_friendly boolean default true,
  description text,
  specialties text[], -- Array of specialties
  verified boolean default false,
  active boolean default true
);

create index if not exists providers_type_idx on public.providers(type);
create index if not exists providers_location_idx on public.providers(location);
create index if not exists providers_active_idx on public.providers(active);


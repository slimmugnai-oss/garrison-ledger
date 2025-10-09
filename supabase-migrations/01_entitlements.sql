-- 01_entitlements.sql
-- ENTITLEMENTS maps subscription -> app access
-- Adapted for Clerk authentication (user_id is TEXT, not UUID)

create table if not exists public.entitlements (
  user_id text primary key references public.profiles(id) on delete cascade,
  tier text not null check (tier in ('free','premium')) default 'free',
  status text not null check (status in ('none','active','past_due','canceled')) default 'none',
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  updated_at timestamptz default now()
);

alter table public.entitlements enable row level security;

-- Users can read their own entitlement
create policy "entitlements_read_self"
on public.entitlements for select
to authenticated
using (user_id = (select id from profiles where id = auth.jwt() ->> 'sub'));

-- SERVICE ROLE (webhook) can insert/update; no insert/update policy for normal users
-- This will be handled by the Stripe webhook with service role key

-- Convenience view returns a clean boolean
create or replace view public.v_user_access as
select
  e.user_id,
  (e.status = 'active' and e.tier = 'premium') as is_premium
from public.entitlements e;

-- Optional: saved models for persistence
create table if not exists public.saved_models (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(id) on delete cascade,
  tool text not null check (tool in ('sdp','tsp','house')),
  input jsonb not null,
  output jsonb,
  created_at timestamptz default now()
);

alter table public.saved_models enable row level security;

create policy "saved_models_owner_read"
on public.saved_models for select
to authenticated
using (user_id = (select id from profiles where id = auth.jwt() ->> 'sub'));

create policy "saved_models_owner_write"
on public.saved_models for insert, update, delete
to authenticated
using (user_id = (select id from profiles where id = auth.jwt() ->> 'sub'))
with check (user_id = (select id from profiles where id = auth.jwt() ->> 'sub'));

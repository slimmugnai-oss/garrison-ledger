-- LES AUDITOR ENHANCEMENT V1: SPECIAL PAYS CATALOG + CZTE
-- Migration: 20250128_special_pays_v1.sql
-- Date: 2025-01-28
-- Purpose: Add catalog-based special pays system and CZTE deployment tracking

-- ============================================================================
-- SPECIAL PAY CATALOG TABLE
-- ============================================================================
-- Master list of all supported special pay codes
-- Supports both flat_monthly (with default amounts) and rate_table (needs lookup)

create table if not exists special_pay_catalog (
  code text primary key,
  name text not null,
  calc_method text not null check (calc_method in ('flat_monthly', 'rate_table')),
  default_amount_cents int,
  rules jsonb default '{}'::jsonb,
  effective_from date default '2020-01-01',
  effective_to date default '2100-01-01',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- USER SPECIAL PAY ASSIGNMENTS TABLE
-- ============================================================================
-- Tracks which special pays each user receives (catalog-based system)
-- Complements existing user_profiles fields for SDAP/HFP/FSA/FLPP

create table if not exists user_special_pay_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  code text not null references special_pay_catalog(code),
  amount_override_cents int,
  start_date date not null default current_date,
  end_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS policies for user_special_pay_assignments
alter table user_special_pay_assignments enable row level security;

create policy "user_special_pay_assignments_owner"
  on user_special_pay_assignments for all
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

-- Indexes for performance
create index if not exists idx_user_special_pay_assignments_user_id 
  on user_special_pay_assignments(user_id);

create index if not exists idx_user_special_pay_assignments_code 
  on user_special_pay_assignments(code);

create index if not exists idx_user_special_pay_assignments_active 
  on user_special_pay_assignments(user_id, start_date, end_date)
  where end_date is null;

-- ============================================================================
-- ADD CZTE DEPLOYMENT FLAG TO USER PROFILES
-- ============================================================================
-- Simple boolean flag for v1 - tracks if user is currently deployed to CZTE location
-- Full deployment table with date tracking deferred to v2

alter table user_profiles
add column if not exists currently_deployed_czte boolean default false;

-- ============================================================================
-- SEED CATALOG WITH 10 SPECIAL PAYS
-- ============================================================================
-- 4 existing (SDAP, IDP, FSA, FLPP) + 6 new (SEA, FLIGHT, SUB, DIVE, JUMP, HDP)

insert into special_pay_catalog (code, name, calc_method, default_amount_cents, rules) values
  ('SDAP', 'Special Duty Assignment Pay', 'flat_monthly', 15000, '{"typical_range": [15000, 45000], "description": "Varies by skill identifier"}'),
  ('IDP', 'Imminent Danger or Hostile Fire Pay', 'flat_monthly', 22500, '{"statutory_amount": 22500, "description": "$225/month for service in designated hostile fire or imminent danger zones"}'),
  ('FSA', 'Family Separation Allowance', 'flat_monthly', 25000, '{"statutory_amount": 25000, "description": "$250/month when separated from family due to military orders"}'),
  ('FLPP', 'Foreign Language Proficiency Pay', 'flat_monthly', 30000, '{"typical_range": [10000, 50000], "description": "Varies by language proficiency level and language criticality"}'),
  ('SEA', 'Sea Pay', 'rate_table', null, '{"description": "Career Sea Pay - requires rate table lookup by paygrade and sea duty months", "deferred": "v2"}'),
  ('FLIGHT', 'Flight Pay', 'rate_table', null, '{"description": "Aviation Career Incentive Pay (ACIP) - requires rate table lookup by years of aviation service", "deferred": "v2"}'),
  ('SUB', 'Submarine Pay', 'rate_table', null, '{"description": "Submarine Duty Pay - requires rate table lookup by paygrade and submarine qualification", "deferred": "v2"}'),
  ('DIVE', 'Dive Pay', 'rate_table', null, '{"description": "Diving Duty Pay - requires rate table lookup by paygrade and dive qualification level", "deferred": "v2"}'),
  ('JUMP', 'Parachute Pay', 'rate_table', null, '{"description": "Parachute Duty Pay - typically $150-$225/month based on jump status", "deferred": "v2"}'),
  ('HDP', 'Hardship Duty Pay', 'flat_monthly', 10000, '{"typical_range": [5000, 15000], "description": "Varies by location hardship level"}')
on conflict (code) do nothing;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

comment on table special_pay_catalog is 'Master catalog of all supported special pay codes with calculation methods';
comment on table user_special_pay_assignments is 'User assignments for catalog-based special pays (complements user_profiles legacy fields)';
comment on column user_profiles.currently_deployed_czte is 'Simple boolean flag indicating Combat Zone Tax Exclusion eligibility (v1 - full deployment tracking in v2)';

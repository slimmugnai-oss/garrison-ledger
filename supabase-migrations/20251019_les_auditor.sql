-- LES & PAYCHECK AUDITOR - DATABASE SCHEMA
-- Created: 2025-01-19
-- Purpose: Store uploaded LES PDFs, parsed line items, expected pay calculations, and audit flags
-- Security: RLS enabled on all tables; server APIs use service role + explicit user_id checks

-- =============================================================================
-- 1. STORAGE BUCKET (for raw LES PDFs)
-- =============================================================================

-- Create private bucket for LES files (no public access)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'les_raw',
  'les_raw',
  false,  -- private only
  5242880, -- 5MB (from SSOT)
  array['application/pdf']
)
on conflict (id) do nothing;

-- RLS: Users can only access their own files (enforced via server-side signed URLs)
create policy "Users can upload their own LES files"
  on storage.objects for insert
  with check (
    bucket_id = 'les_raw' and
    auth.role() = 'authenticated'
  );

create policy "Users can delete their own LES files"
  on storage.objects for delete
  using (
    bucket_id = 'les_raw' and
    auth.role() = 'authenticated'
  );

-- =============================================================================
-- 2. LES UPLOADS TABLE (metadata about uploaded files)
-- =============================================================================

create table if not exists les_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,  -- Clerk user ID
  
  -- Upload metadata
  uploaded_at timestamptz not null default now(),
  original_filename text not null,
  mime_type text not null default 'application/pdf',
  size_bytes integer not null,
  storage_path text not null,  -- user/<userId>/<yyyy-mm>/<uuid>.pdf
  
  -- LES period
  month integer not null check (month between 1 and 12),
  year integer not null check (year between 2020 and 2099),
  
  -- Parse status
  parsed_ok boolean not null default false,
  parsed_at timestamptz,
  parsed_summary jsonb,  -- { totalsBySection, allowancesByCode, deductionsByCode }
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for fast lookups
create index on les_uploads (user_id, year desc, month desc);
create index on les_uploads (user_id, created_at desc);
create index on les_uploads (parsed_ok) where not parsed_ok;

-- Normalize user_id to text for consistency
alter table les_uploads alter column user_id type text;

-- RLS: Users can only see their own uploads
alter table les_uploads enable row level security;

create policy "Users can view their own uploads"
  on les_uploads for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own uploads"
  on les_uploads for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update their own uploads"
  on les_uploads for update
  using (auth.role() = 'authenticated');

create policy "Users can delete their own uploads"
  on les_uploads for delete
  using (auth.role() = 'authenticated');

-- =============================================================================
-- 3. LES LINES TABLE (parsed line items from LES)
-- =============================================================================

create table if not exists les_lines (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references les_uploads(id) on delete cascade,
  
  -- Line item data
  line_code text not null,  -- BAH, BAS, COLA, SDAP, etc.
  description text not null,
  amount_cents integer not null check (amount_cents >= 0),  -- Always positive, section determines debit/credit
  section text not null check (section in ('ALLOWANCE', 'DEDUCTION', 'ALLOTMENT', 'TAX', 'OTHER')),
  raw text,  -- Original line text for debugging
  
  created_at timestamptz not null default now()
);

-- Indexes for fast queries
create index on les_lines (upload_id);
create index on les_lines (line_code);
create index on les_lines (section);

-- RLS: Inherit access from parent upload
alter table les_lines enable row level security;

create policy "Users can view lines from their own uploads"
  on les_lines for select
  using (
    exists (
      select 1 from les_uploads
      where les_uploads.id = les_lines.upload_id
      and auth.role() = 'authenticated'
    )
  );

-- =============================================================================
-- 4. EXPECTED PAY SNAPSHOTS TABLE (computed expected values)
-- =============================================================================

create table if not exists expected_pay_snapshot (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  upload_id uuid references les_uploads(id) on delete cascade,
  
  -- Snapshot period
  month integer not null check (month between 1 and 12),
  year integer not null check (year between 2020 and 2099),
  
  -- Profile inputs (at time of snapshot)
  paygrade text not null,  -- E01-E09, O01-O10, W01-W05
  mha_or_zip text,
  with_dependents boolean not null default false,
  yos integer,  -- Years of service
  
  -- Expected values (in cents)
  expected_bah_cents integer,
  expected_bas_cents integer,
  expected_cola_cents integer,
  expected_specials jsonb,  -- [{ code, cents }, ...]
  expected_taxes jsonb,     -- { federalCents, stateCents, ... } (future)
  
  -- Metadata
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Indexes
create index on expected_pay_snapshot (user_id, year desc, month desc);
create index on expected_pay_snapshot (upload_id);

-- RLS: Users can only see their own snapshots
alter table expected_pay_snapshot enable row level security;

create policy "Users can view their own snapshots"
  on expected_pay_snapshot for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own snapshots"
  on expected_pay_snapshot for insert
  with check (auth.role() = 'authenticated');

-- =============================================================================
-- 5. PAY FLAGS TABLE (discrepancies found during audit)
-- =============================================================================

create table if not exists pay_flags (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references les_uploads(id) on delete cascade,
  
  -- Flag details
  severity text not null check (severity in ('red', 'yellow', 'green')),
  flag_code text not null,  -- BAH_MISMATCH, BAS_MISSING, COLA_STOPPED, etc.
  message text not null,  -- BLUF explanation
  suggestion text not null,  -- Concrete next step for service member
  ref_url text,  -- Link to DFAS/resource hub
  delta_cents integer,  -- Expected - Actual (positive = underpaid, negative = overpaid)
  
  -- Metadata
  created_at timestamptz not null default now()
);

-- Indexes
create index on pay_flags (upload_id);
create index on pay_flags (severity);
create index on pay_flags (flag_code);

-- RLS: Inherit access from parent upload
alter table pay_flags enable row level security;

create policy "Users can view flags from their own uploads"
  on pay_flags for select
  using (
    exists (
      select 1 from les_uploads
      where les_uploads.id = pay_flags.upload_id
      and auth.role() = 'authenticated'
    )
  );

-- =============================================================================
-- 6. ADMIN ANALYTICS VIEW (non-RLS for admin dashboard)
-- =============================================================================

create or replace view les_uploads_summary as
select
  u.user_id,
  u.year,
  u.month,
  count(*) as uploads,
  sum(case when u.parsed_ok then 1 else 0 end) as parsed_count,
  sum(case when f.severity = 'red' then 1 else 0 end) as red_flags,
  sum(case when f.severity = 'yellow' then 1 else 0 end) as yellow_flags,
  sum(case when f.severity = 'green' then 1 else 0 end) as green_flags,
  sum(coalesce(f.delta_cents, 0)) as total_delta_cents,
  max(u.uploaded_at) as last_upload
from les_uploads u
left join pay_flags f on f.upload_id = u.id
group by u.user_id, u.year, u.month;

-- =============================================================================
-- 7. UPDATED_AT TRIGGER (auto-update timestamps)
-- =============================================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_les_uploads_updated_at
  before update on les_uploads
  for each row
  execute function update_updated_at_column();

-- =============================================================================
-- 8. COMMENTS (documentation in database)
-- =============================================================================

comment on table les_uploads is 'Metadata for uploaded LES PDFs';
comment on table les_lines is 'Parsed line items from LES (allowances, deductions, etc.)';
comment on table expected_pay_snapshot is 'Computed expected pay values based on profile and BAH/BAS/COLA tables';
comment on table pay_flags is 'Discrepancies found between actual LES and expected pay';
comment on column les_uploads.parsed_summary is 'JSON summary of parsed totals by section';
comment on column expected_pay_snapshot.expected_specials is 'Array of special pays: [{ code, cents }]';
comment on column pay_flags.delta_cents is 'Expected - Actual (positive = underpaid, negative = overpaid)';

-- =============================================================================
-- 9. GRANT PERMISSIONS (if using custom roles)
-- =============================================================================

-- Note: Supabase auto-grants permissions for authenticated users
-- Additional grants can be added here if needed for specific roles

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Verify tables created
do $$
begin
  assert (select count(*) from information_schema.tables where table_name in ('les_uploads', 'les_lines', 'expected_pay_snapshot', 'pay_flags')) = 4,
    'LES Auditor tables not created';
  raise notice 'LES Auditor migration completed successfully';
end $$;


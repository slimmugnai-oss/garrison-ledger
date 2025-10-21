-- LES AUDITOR - RLS POLICY SECURITY FIX
-- Created: 2025-10-20
-- Purpose: Fix overly permissive RLS policies that only check auth.role()
--          Add proper user_id validation to prevent cross-user data access
-- Priority: CRITICAL SECURITY FIX

-- =============================================================================
-- 1. FIX LES_UPLOADS RLS POLICIES
-- =============================================================================

-- Drop existing overly permissive policies
drop policy if exists "Users can view their own uploads" on les_uploads;
drop policy if exists "Users can insert their own uploads" on les_uploads;
drop policy if exists "Users can update their own uploads" on les_uploads;
drop policy if exists "Users can delete their own uploads" on les_uploads;

-- Create secure policies with user_id validation
create policy "Users can view their own uploads"
  on les_uploads for select
  using (auth.uid()::text = user_id);

create policy "Users can insert their own uploads"
  on les_uploads for insert
  with check (auth.uid()::text = user_id);

create policy "Users can update their own uploads"
  on les_uploads for update
  using (auth.uid()::text = user_id);

create policy "Users can delete their own uploads"
  on les_uploads for delete
  using (auth.uid()::text = user_id);

-- =============================================================================
-- 2. FIX LES_LINES RLS POLICIES
-- =============================================================================

-- Drop existing policy
drop policy if exists "Users can view lines from their own uploads" on les_lines;

-- Create secure policy with proper join validation
create policy "Users can view lines from their own uploads"
  on les_lines for select
  using (
    exists (
      select 1 from les_uploads
      where les_uploads.id = les_lines.upload_id
      and les_uploads.user_id = auth.uid()::text
    )
  );

-- =============================================================================
-- 3. FIX EXPECTED_PAY_SNAPSHOT RLS POLICIES
-- =============================================================================

-- Drop existing policies
drop policy if exists "Users can view their own snapshots" on expected_pay_snapshot;
drop policy if exists "Users can insert their own snapshots" on expected_pay_snapshot;

-- Create secure policies
create policy "Users can view their own snapshots"
  on expected_pay_snapshot for select
  using (auth.uid()::text = user_id);

create policy "Users can insert their own snapshots"
  on expected_pay_snapshot for insert
  with check (auth.uid()::text = user_id);

-- =============================================================================
-- 4. FIX PAY_FLAGS RLS POLICIES
-- =============================================================================

-- Drop existing policy
drop policy if exists "Users can view flags from their own uploads" on pay_flags;

-- Create secure policy
create policy "Users can view flags from their own uploads"
  on pay_flags for select
  using (
    exists (
      select 1 from les_uploads
      where les_uploads.id = pay_flags.upload_id
      and les_uploads.user_id = auth.uid()::text
    )
  );

-- =============================================================================
-- 5. FIX STORAGE BUCKET POLICIES
-- =============================================================================

-- Drop existing overly permissive storage policies
drop policy if exists "Users can upload their own LES files" on storage.objects;
drop policy if exists "Users can delete their own LES files" on storage.objects;

-- Create secure storage policies with path validation
create policy "Users can upload their own LES files"
  on storage.objects for insert
  with check (
    bucket_id = 'les_raw' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = 'user' and
    (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "Users can view their own LES files"
  on storage.objects for select
  using (
    bucket_id = 'les_raw' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = 'user' and
    (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "Users can delete their own LES files"
  on storage.objects for delete
  using (
    bucket_id = 'les_raw' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = 'user' and
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- =============================================================================
-- 6. VERIFY POLICIES
-- =============================================================================

do $$
declare
  policy_count integer;
begin
  -- Count LES-related policies
  select count(*) into policy_count
  from pg_policies
  where tablename in ('les_uploads', 'les_lines', 'expected_pay_snapshot', 'pay_flags');
  
  assert policy_count >= 8, 'LES Auditor RLS policies not created correctly';
  
  raise notice 'LES Auditor RLS security fix completed successfully';
  raise notice 'Total policies created: %', policy_count;
end $$;

-- =============================================================================
-- MIGRATION COMPLETE - SECURITY HARDENED
-- =============================================================================


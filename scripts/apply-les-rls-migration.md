# Apply LES Auditor RLS Security Migration

**Date:** 2025-10-21  
**Priority:** CRITICAL  
**Migration File:** `supabase-migrations/20251020_les_auditor_rls_fix.sql`

---

## What This Migration Does

Fixes critical security vulnerability in LES Auditor RLS policies. The original policies only checked `auth.role() = 'authenticated'` without validating user_id, potentially allowing cross-user data access.

**Tables affected:**
- `les_uploads` (4 policies updated)
- `les_lines` (1 policy updated)
- `expected_pay_snapshot` (2 policies updated)
- `pay_flags` (1 policy updated)
- `storage.objects` for `les_raw` bucket (3 policies updated)

---

## Before You Begin

### Prerequisites ✅
- [ ] Admin access to Supabase Dashboard
- [ ] Database backup created (recommended)
- [ ] No active LES uploads in progress
- [ ] Read the migration file completely

### Backup First! (RECOMMENDED)
1. Go to Supabase Dashboard → Database → Backups
2. Click "Create Backup" or verify recent backup exists
3. Note backup timestamp: _________________

---

## Step-by-Step Application

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your **Garrison Ledger** project
3. Click **SQL Editor** in left sidebar
4. Click **New Query**

### Step 2: Load Migration File
**Option A: Copy from file**
1. Open `supabase-migrations/20251020_les_auditor_rls_fix.sql`
2. Copy entire contents (lines 1-146)
3. Paste into SQL Editor

**Option B: Upload file**
1. Click "Upload SQL file" in SQL Editor
2. Select `20251020_les_auditor_rls_fix.sql`
3. Confirm file loaded correctly

### Step 3: Review Migration
**DO NOT SKIP THIS STEP!**

Scroll through the migration and verify:
- [ ] All DROP statements use `if exists` (safe)
- [ ] All CREATE statements check for existing records
- [ ] Verification block is at end (lines 127-140)
- [ ] No unexpected tables/changes

### Step 4: Execute Migration
1. Click **Run** button (or press Cmd/Ctrl + Enter)
2. Wait for execution to complete (should take 2-5 seconds)
3. Check output panel at bottom

### Step 5: Verify Success
**Expected output:**
```
DROP POLICY
DROP POLICY
... (multiple DROP statements)
CREATE POLICY
CREATE POLICY
... (multiple CREATE statements)
NOTICE: LES Auditor RLS security fix completed successfully
NOTICE: Total policies created: 8
```

**If you see:**
- ✅ "NOTICE: LES Auditor RLS security fix completed successfully" → SUCCESS
- ❌ Any ERROR messages → STOP and see troubleshooting below

### Step 6: Test RLS Policies
Run these verification queries:

```sql
-- Test 1: Check policies exist
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('les_uploads', 'les_lines', 'expected_pay_snapshot', 'pay_flags')
ORDER BY tablename, cmd;

-- Expected: 8 policies total
-- - les_uploads: 4 policies (select, insert, update, delete)
-- - les_lines: 1 policy (select)
-- - expected_pay_snapshot: 2 policies (select, insert)
-- - pay_flags: 1 policy (select)
```

**Result count:** _______ (should be 8)

```sql
-- Test 2: Check storage policies
SELECT * FROM storage.policies 
WHERE bucket_id = 'les_raw';

-- Expected: 3 policies (insert, select, delete)
```

**Result count:** _______ (should be 3)

---

## Verification Checklist

After migration applied:

### Database Checks
- [ ] 8 RLS policies exist on LES tables
- [ ] 3 storage policies exist for `les_raw` bucket
- [ ] All policies include `auth.uid()::text = user_id` check
- [ ] No policies still using generic `auth.role()` check
- [ ] Verification query completed successfully

### Functional Tests
- [ ] Log in as test user
- [ ] Upload LES (should work)
- [ ] View audit history (should only see own uploads)
- [ ] Try accessing another user's upload via direct URL (should FAIL)
- [ ] Verify storage files isolated by user_id path

---

## Troubleshooting

### Error: "policy already exists"
**Cause:** Migration was partially applied before  
**Fix:**
```sql
-- Drop all policies and re-run migration
DROP POLICY IF EXISTS "Users can view their own uploads" ON les_uploads;
DROP POLICY IF EXISTS "Users can insert their own uploads" ON les_uploads;
-- ... repeat for all policies ...
-- Then re-run full migration
```

### Error: "table does not exist"
**Cause:** LES Auditor tables not created yet  
**Fix:** Run base migration first: `supabase-migrations/20251019_les_auditor.sql`

### Error: "permission denied"
**Cause:** Insufficient privileges  
**Fix:** Ensure you're using service role key or database admin

### Migration runs but no NOTICE output
**Cause:** Postgres version or client doesn't show NOTICE  
**Fix:** Manually verify policies exist with verification queries

---

## Rollback (If Needed)

If something goes wrong, you can rollback to original (LESS SECURE) policies:

```sql
-- WARNING: This rollback reverts to INSECURE policies
-- Only use for emergency rollback

-- Les uploads (back to auth.role check)
DROP POLICY IF EXISTS "Users can view their own uploads" ON les_uploads;
CREATE POLICY "Users can view their own uploads"
  ON les_uploads FOR SELECT
  USING (auth.role() = 'authenticated');

-- (Repeat for all tables... but NOT RECOMMENDED)
```

**IMPORTANT:** Insecure policies should only be temporary. Re-apply fix ASAP.

---

## Post-Migration

### Update Documentation
- [ ] Mark this migration as APPLIED in project notes
- [ ] Update SYSTEM_STATUS.md (LES Auditor security: ✅ Hardened)
- [ ] Notify team that migration was applied

### Monitor
- [ ] Check error logs for next 24 hours
- [ ] Verify no user reports of access issues
- [ ] Confirm upload functionality working normally

---

## Migration Status

**Applied:** ☐ Yes  ☐ No  
**Date Applied:** _________________  
**Applied By:** _________________  
**Verification Tests Passed:** ☐ Yes  ☐ No  
**Issues Encountered:** _________________  

---

## Support

If you encounter issues:
1. Check troubleshooting section above
2. Review Supabase logs (Dashboard → Logs)
3. Restore from backup if critical
4. Document issue for team review

---

**Migration File Path:**  
`supabase-migrations/20251020_les_auditor_rls_fix.sql`

**Related Documentation:**  
- `docs/active/LES_AUDITOR_DIAGNOSTIC_2025-10-21.md`
- `LES_AUDITOR_IMPLEMENTATION_COMPLETE.md`
- `SYSTEM_STATUS.md`


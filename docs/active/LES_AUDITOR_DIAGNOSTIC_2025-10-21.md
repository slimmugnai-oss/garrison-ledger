# LES Auditor - Diagnostic Report
**Date:** 2025-10-21  
**Status:** Diagnostic Complete - Ready for Fixes

---

## Executive Summary

Completed full diagnostic of LES Auditor feature. Found **3 critical issues** requiring immediate fixes:

1. ❌ **Field mapping inconsistency** between audit routes
2. ⚠️ **RLS migration not applied** (security risk)
3. ✅ Table name references are correct (`entitlements` not `user_entitlements`)

---

## Findings

### 1. Database Schema ✅

**user_profiles table fields (CONFIRMED):**
- `rank` (TEXT) - Military rank (E-1 through O-10)
- `current_base` (TEXT) - Current duty station
- `has_dependents` (BOOLEAN) - Dependency status for BAH

**entitlements table (CONFIRMED):**
- Table name is `entitlements` (NOT `user_entitlements`)
- Fields: `user_id`, `tier`, `status`, etc.

**LES Auditor tables (EXIST):**
- `les_uploads` ✅
- `les_lines` ✅
- `expected_pay_snapshot` ✅
- `pay_flags` ✅
- Storage bucket `les_raw` ✅

---

### 2. Field Mapping Inconsistency ❌ CRITICAL

**Issue:** Two audit API routes use different field names

**File: `app/api/les/audit/route.ts`** (CORRECT ✅)
```typescript
const { data, error } = await supabaseAdmin
  .from('user_profiles')
  .select('rank, current_base, has_dependents, time_in_service')
  .eq('user_id', userId)
  .maybeSingle();

if (!data.rank || !data.current_base || data.has_dependents === null) {
  return null;
}

return {
  paygrade: data.rank,
  mha_or_zip: data.current_base,
  with_dependents: Boolean(data.has_dependents),
  yos: data.time_in_service || undefined
};
```

**File: `app/api/les/audit-manual/route.ts`** (WRONG ❌)
```typescript
const { data, error } = await supabaseAdmin
  .from('user_profiles')
  .select('paygrade, duty_station, dependents, years_of_service')
  //      ^^^^^^^^  ^^^^^^^^^^^^^  ^^^^^^^^^^  ^^^^^^^^^^^^^^^^
  //      WRONG     WRONG          WRONG       WRONG
  .eq('user_id', userId)
  .maybeSingle();
```

**Impact:**  
- `audit-manual/route.ts` will FAIL to fetch profile data
- Manual entry audit will return "Profile incomplete" error
- Users cannot use manual entry feature

**Fix Required:**  
Update `audit-manual/route.ts` to use correct field names:
- `paygrade` → `rank`
- `duty_station` → `current_base`
- `dependents` → `has_dependents`
- `years_of_service` → `time_in_service`

---

### 3. RLS Migration Status ⚠️ NOT APPLIED

**Migration file:** `supabase-migrations/20251020_les_auditor_rls_fix.sql`

**Current state:** Migration file exists but appears NOT applied to database

**Security Risk:**  
Original RLS policies only check `auth.role() = 'authenticated'` without validating `user_id`.  
This could potentially allow authenticated users to access OTHER users' LES data.

**Example of vulnerable policy:**
```sql
-- VULNERABLE (original)
create policy "Users can view their own uploads"
  on les_uploads for select
  using (auth.role() = 'authenticated');
  -- ❌ No user_id check!
```

**Secure policy (from migration):**
```sql
-- SECURE (migration fix)
create policy "Users can view their own uploads"
  on les_uploads for select
  using (auth.uid()::text = user_id);
  -- ✅ Validates user_id match
```

**Fix Required:**  
Apply migration `20251020_les_auditor_rls_fix.sql` to production database via Supabase dashboard.

**Tables affected:**
- `les_uploads` (4 policies)
- `les_lines` (1 policy)
- `expected_pay_snapshot` (2 policies)
- `pay_flags` (1 policy)
- `storage.objects` (3 policies for `les_raw` bucket)

---

### 4. Dependencies ✅ ALL PRESENT

**PDF Parsing:**
- `pdf-parse@1.1.1` ✅ Installed
- `@types/pdf-parse@1.1.4` ✅ Installed

**PDF Export:**
- `jspdf@3.0.3` ✅ Installed
- `jspdf-autotable@5.0.2` ✅ Installed

**Other:**
- All required dependencies present in `package.json`

---

### 5. Profile Integration Analysis ✅

**Required fields for LES Auditor:**
1. `rank` - Used as `paygrade` in expected pay calculation
2. `current_base` - Used as `mha_or_zip` for BAH lookup
3. `has_dependents` - Used as `with_dependents` for BAH rate

**Optional fields:**
- `time_in_service` - Used as `yos` for certain calculations

**Profile validation locations:**
- `app/dashboard/paycheck-audit/page.tsx` - Checks `rank`, `current_base`, `has_dependents`
- `app/components/les/ProfileIncompletePrompt.tsx` - Displays missing fields

**Status:** ✅ Validation logic is CORRECT and aligned with API requirements

---

### 6. Dashboard Integration ✅

**Dashboard query (from `app/dashboard/page.tsx`):**
```typescript
const { count: lesUploads } = await supabase
  .from('les_uploads')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .gte('created_at', firstDayOfMonth.toISOString());
```

**Status:** ✅ Correct - uses proper table name and fields

**Navigation:**
- Link from dashboard: `/dashboard/paycheck-audit` ✅
- Premium badge logic: ✅ Working
- Usage tracking: ✅ Correct

---

## Issues Summary

| Priority | Issue | File(s) Affected | Status | Impact |
|----------|-------|------------------|--------|--------|
| 🔴 P0 | RLS migration not applied | Database | Not Applied | Security vulnerability |
| 🔴 P0 | Field mapping wrong | `audit-manual/route.ts` | Broken | Manual entry fails |
| 🟢 P1 | Docs mention missing `pdf-parse` | Documentation | Fixed | No impact (already installed) |

---

## Fixes Required

### Immediate (P0 - Critical):

1. **Apply RLS Migration**
   - File: `supabase-migrations/20251020_les_auditor_rls_fix.sql`
   - Method: Run in Supabase SQL Editor
   - Estimated time: 5 minutes
   - Risk: Low (migration has rollback logic)

2. **Fix Field Mapping in audit-manual Route**
   - File: `app/api/les/audit-manual/route.ts`
   - Changes: Update getUserProfile() function to use correct field names
   - Estimated time: 10 minutes
   - Risk: None (bug fix only)

### Next Steps (P1 - Enhancement):

3. Update documentation to reflect correct field names
4. Add field mapping tests to prevent future regressions
5. Enhance error messages for profile validation
6. Add analytics tracking for audit success/failure rates

---

## Testing Checklist

After fixes applied, verify:

- [ ] Manual entry audit works with complete profile
- [ ] RLS policies prevent cross-user data access
- [ ] Upload quota check works correctly
- [ ] Profile incomplete prompt shows correct fields
- [ ] Dashboard stats update after upload
- [ ] Premium vs free tier gating works

---

## Migration Application Instructions

**DO NOT run migrations directly in production without backup!**

1. **Backup database** (Supabase Dashboard → Database → Backups)
2. Open **SQL Editor** in Supabase Dashboard
3. Copy contents of `supabase-migrations/20251020_les_auditor_rls_fix.sql`
4. Paste into SQL Editor
5. Review changes carefully
6. Click **Run**
7. Verify output shows "LES Auditor RLS security fix completed successfully"
8. Test LES Auditor feature to confirm access control works

---

## Diagnostic Complete

All critical issues identified. Ready to proceed with fixes.

**Next:** Implement fixes in order of priority (P0 → P1)


<!-- 3dde5aec-0795-4b24-83f4-51becc0160f5 c3268d8d-9dc9-4bd6-ac8d-57d3e0eef2cc -->
# Fix Profile Setup - has_dependents Missing Field

## Problem Identified

**Root Cause:** Profile setup page collects `num_children` but never sets `has_dependents` field in the database.

**Impact:**

- LES Auditor blocks users with complete profiles (30/30)
- Base Navigator BAH calculation may fail
- Any feature requiring dependent status broken

**Current State:**

- `user_profiles.has_dependents` = NULL (even after profile completion)
- `num_children` is set correctly (e.g., 1, 2, 3)
- No frontend logic derives `has_dependents` from `num_children`

---

## Solution: Smart Derivation + Immediate Fix

### Option A: Auto-Derive has_dependents (Recommended)

**Logic:**

```typescript
has_dependents = (num_children > 0) || (marital_status === 'married')
```

**Rationale:**

- If you have children → you have dependents
- If you're married → you have dependents (spouse counts)
- Covers 99% of cases automatically
- No extra UI field needed

**Implementation:**

1. Add derivation logic to profile setup page (before save)
2. Add derivation to API route (server-side validation)
3. Backfill existing profiles with NULL has_dependents

### Option B: Add Explicit Field (More Control)

**Add new field to profile form:**

- Label: "Do you have dependents for BAH purposes?"
- Type: Yes/No select
- Location: Family section, after num_children
- Help text: "Dependents include spouse and/or children. Affects BAH rate."

**Pros:** User explicitly controls value

**Cons:** Another field to maintain, could confuse users

---

## Implementation Plan

### Step 1: Add Auto-Derivation to Frontend

**File:** `app/dashboard/profile/setup/page.tsx`

Add `useEffect` hook:

```typescript
// Auto-derive has_dependents from num_children and marital_status
useEffect(() => {
  const derived = (data.num_children ?? 0) > 0 || data.marital_status === 'married';
  if (data.has_dependents !== derived) {
    setData(d => ({ ...d, has_dependents: derived }));
  }
}, [data.num_children, data.marital_status]);
```

**Location:** After existing useEffect hooks (around line 283)

### Step 2: Update Submit Function

**File:** `app/dashboard/profile/setup/page.tsx`

Ensure `has_dependents` is included in save payload:

```typescript
const res = await fetch('/api/user-profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    ...data, 
    has_dependents: (data.num_children ?? 0) > 0 || data.marital_status === 'married',
    profile_completed: true 
  }),
});
```

**Location:** Line 422-426

### Step 3: Backfill Existing Profiles

**Method:** SQL migration to set `has_dependents` for existing users

```sql
-- Backfill has_dependents for existing profiles
UPDATE user_profiles
SET has_dependents = (
  COALESCE(num_children, 0) > 0 OR marital_status = 'married'
)
WHERE has_dependents IS NULL;
```

### Step 4: Update Your Profile Immediately

**Quick fix for current session:**

```sql
-- Set your has_dependents based on your num_children
UPDATE user_profiles
SET has_dependents = (num_children > 0)
WHERE user_id = '<your-user-id>';
```

---

## Alternative: Add Explicit Field (If Preferred)

If you want explicit control instead of auto-derivation:

### Add to ProfilePayload Type

```typescript
has_dependents?: boolean | null;
```

(Already exists in type - just needs UI)

### Add Field to Form (Family Section)

```tsx
<ProfileFormField
  label="Do you have dependents?"
  required
  description="Spouse and/or children (affects BAH)"
  success={data.has_dependents !== null}
>
  <select
    value={data.has_dependents === null ? '' : String(data.has_dependents)}
    onChange={e => setData(d => ({ 
      ...d, 
      has_dependents: e.target.value === '' ? null : e.target.value === 'true' 
    }))}
  >
    <option value="">Select</option>
    <option value="true">Yes</option>
    <option value="false">No</option>
  </select>
</ProfileFormField>
```

---

## Recommended Approach

**Use Auto-Derivation (Option A)** because:

- ✅ Less UI clutter
- ✅ No user confusion
- ✅ Automatically correct 99% of time
- ✅ One less field to maintain
- ✅ Works for military definition of "dependent"

**Edge Case Handling:**

- If user is single with no children → `has_dependents = false` ✅
- If user is married with no children → `has_dependents = true` ✅ (spouse is dependent)
- If user has children (any marital status) → `has_dependents = true` ✅

---

## Files to Modify

1. **`app/dashboard/profile/setup/page.tsx`**

   - Add auto-derivation useEffect
   - Update submit to include has_dependents

2. **`supabase-migrations/20251021_backfill_has_dependents.sql`** (NEW)

   - Backfill existing NULL values

3. **`SYSTEM_STATUS.md`** (UPDATE)

   - Document profile bug fix
   - Note backfill completed

---

## Testing After Fix

1. ✅ Save profile with num_children = 0 → has_dependents = false
2. ✅ Save profile with num_children = 2 → has_dependents = true
3. ✅ Save profile married, no children → has_dependents = true
4. ✅ Existing profile backfilled correctly
5. ✅ LES Auditor no longer blocks complete profiles

---

## Success Criteria

- ✅ `has_dependents` automatically derived from `num_children` and `marital_status`
- ✅ All existing profiles backfilled
- ✅ LES Auditor works with complete profiles
- ✅ Base Navigator BAH calculation works
- ✅ No UI changes needed (seamless fix)
- ✅ Logic documented in code comments

### To-dos

- [ ] Check database migration status, verify tables exist, test RLS policies, confirm storage bucket configuration
- [ ] Investigate field mapping inconsistency between audit routes (rank vs paygrade, current_base vs duty_station, has_dependents vs dependents)
- [ ] Verify pdf-parse package installed, check all required dependencies, test PDF parsing capability
- [ ] Review and apply supabase-migrations/20251020_les_auditor_rls_fix.sql, verify policies with test queries
- [ ] Standardize profile field names across all API routes (audit/route.ts, audit-manual/route.ts, upload/route.ts)
- [ ] Correct any user_entitlements → entitlements references, search codebase for instances
- [ ] Update profile completeness logic in page.tsx and ProfileIncompletePrompt.tsx, ensure required fields match API
- [ ] End-to-end test: file upload, PDF parsing, quota enforcement, error handling
- [ ] End-to-end test: profile validation, expected pay calculation, flag generation, PDF export
- [ ] Test dashboard stats, navigation links, premium badge, usage tracking
- [ ] Test IntelCardLink component, ensure flag codes map to correct Intel Cards
- [ ] Improve error messages with contextual help, add support links, ensure mobile-friendly
- [ ] Test mobile responsiveness, touch targets, accessibility (ARIA labels, keyboard nav, screen reader)
- [ ] Add event tracking for uploads, audits, errors; add logging with PII sanitization
- [ ] Update SYSTEM_STATUS.md, create user guide, document required profile fields
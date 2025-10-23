<!-- 88f3ec67-6b10-45cb-be65-9946951e1ffe 85f149ed-d72a-4fca-bbda-313bddc9f52f -->
# LES Auditor Critical Bug Fixes

## BUG #1: FICA/Medicare Percentage Calculations Wrong

**User Report:**

- Entered $6.20 for FICA → System says "0.19% of taxable gross"
- Entered $1.45 for Medicare → System says "0.04% of taxable gross"

**Root Cause:**

The comparison logic is calculating percentages correctly ($6.20 / $3500 = 0.19%), but there's a fundamental issue:

**Two possible causes:**

1. User entered dollars when they have $0 base pay (taxable base = 0 or very small)
2. User misunderstands what to enter (should enter actual FICA dollar amount like $217, not $6.20)
3. taxable_bases are being computed incorrectly (most likely)

**Investigation needed:**

Check what `params.taxable_bases.oasdi` actually contains in the comparison. It should be the sum of Base Pay + OCONUS COLA + taxable specials.

**Fix in `lib/les/compare.ts` (lines 943-982):**

Add debug logging or validation to ensure taxable_bases is correct. If taxable base is suspiciously low (< $1000), flag it.

---

## BUG #2: Copy Button Non-Functional

**User Report:** Copy button next to flags doesn't work, user doesn't care about it

**Fix:** Remove copy button entirely

**File:** `app/components/les/LesAuditAlwaysOn.tsx` (lines 807-811)

**Change:**

```tsx
// REMOVE:
{tier === "premium" && (
  <button className="flex-shrink-0 text-sm text-blue-600 hover:text-blue-700">
    Copy
  </button>
)}
```

---

## BUG #3: Delta Symbol (Δ) Confusing

**User Report:** "what's the triangle icon next to $30.47"

**Issue:** Using Δ (Greek delta) is not clear for non-technical users

**Fix:** Change to plain English

**File:** `lib/les/compare.ts` or wherever net pay message is generated

**Change:**

```tsx
// BEFORE:
"Expected $4475.53, got $4506.00 (Δ $30.47)"

// AFTER:
"Expected $4475.53, got $4506.00 (difference: $30.47)"
```

---

## BUG #4: "Generate PDF" Button Still Showing

**User Report:** Button still says "Generate PDF"

**Investigation:** Check if my change to "Save Audit" was actually deployed

**File:** `app/components/les/LesAuditAlwaysOn.tsx` line 761

**Expected:** Should say "Save Audit"

**Reported:** Still says "Generate PDF"

**Action:** Verify current button text and ensure it's "Save Audit" only

---

## BUG #5: Load Audit Completely Broken

**User Report:**

- Alert shows "Loaded audit from Invalid Date undefined"
- Nothing loads into form fields
- Actually clears everything instead

**Root Causes:**

### Issue 5A: Invalid Date

Line 340:

```tsx
new Date(audit.month, 0).toLocaleString("default", { month: "long" })
```

Problem: `new Date(month, 0)` creates January (month 0) of year `month`. Wrong!

**Fix:**

```tsx
new Date(2000, audit.month - 1).toLocaleString("default", { month: "long" })
```

### Issue 5B: Fields Not Loading

Lines 325-338 use `findAmount()` but the API response might not have a `lines` array, or it's structured differently.

**Investigation needed:**

- Check actual structure of `/api/les/audit/[id]` response
- Verify `audit.lines` exists and has correct structure
- Check if line_code field name matches

### Issue 5C: Clears Everything

If the API fails or returns unexpected data, all `findAmount()` calls return 0, which sets all fields to 0.

**Fix:**

- Validate API response before setting state
- Show error if audit can't be loaded
- Don't clear fields if load fails

**File:** `app/components/les/LesAuditAlwaysOn.tsx` lines 313-345

---

## Priority Order

1. Fix Load Audit (most broken)
2. Fix FICA/Medicare calculations (wrong results)
3. Remove copy button (simple)
4. Fix delta symbol (simple)
5. Verify PDF button text (simple)

## Implementation Steps

1. Read `/api/les/audit/[id]/route.ts` to see actual response structure
2. Fix `handleLoadAudit` date parsing and field loading
3. Investigate taxable_bases calculation in comparison
4. Remove copy button
5. Change Δ to "difference:"
6. Verify button text

### To-dos

- [x] Create lib/auth/subscription.ts with tier checking and policy functions
- [x] Create lib/les/paywall.ts with result masking logic
- [x] Create POST /api/les/audit/compute (real-time, tier-aware)
- [x] Create POST /api/les/audit/save (premium-only, PDF generation)
- [x] Create useLesAudit hook with debounced computation
- [x] Create PremiumCurtain component for masked features
- [x] Refactor PaycheckAuditClient to split-panel always-on design
- [ ] Update review packet and OpenAPI with new architecture
<!-- 88f3ec67-6b10-45cb-be65-9946951e1ffe f2e17c94-8359-4448-a9df-88f90a8dcae4 -->
# LES Auditor - Comprehensive Audit Fix Plan

## Executive Summary

The LES Auditor has **critical tax calculation errors** that make it unreliable for users. Tax calculations are being performed on non-taxable allowances (BAH/BAS), FICA doesn't account for annual wage base, and federal/state taxes are over-simplified. This plan addresses all issues in priority order.

## Critical Issues Found

### Priority 1: CRITICAL - Tax Base Calculation (BROKEN)

**Problem:** BAH and BAS are being included in taxable gross pay

- **Location:** `lib/les/expected.ts` lines 115-119
- **Current (WRONG):**
  ```typescript
  const grossPayCents = (expected.base_pay_cents || 0) +
                        (expected.bah_cents || 0) +      // ❌ NOT TAXABLE
                        (expected.bas_cents || 0) +      // ❌ NOT TAXABLE
                        (expected.cola_cents || 0) +
                        (expected.specials?.reduce(...) || 0);
  ```

- **Correct Formula:**
  ```typescript
  const taxableGrossCents = (expected.base_pay_cents || 0) +
                            (expected.cola_cents || 0) +
                            (expected.specials?.reduce(...) || 0);
  const totalPayCents = taxableGrossCents + 
                        (expected.bah_cents || 0) + 
                        (expected.bas_cents || 0);
  ```

- **Impact:** ALL tax calculations (FICA, Medicare, Federal, State) are wrong
- **Fix Time:** 30 minutes

### Priority 2: CRITICAL - FICA Wage Base Logic (BROKEN)

**Problem:** FICA calculated on monthly pay vs annual wage base

- **Location:** `lib/les/expected.ts` line 430
- **Current Logic:** Compares single month's pay to annual $176,100 limit
- **Why Wrong:** FICA wage base is cumulative (YTD earnings)
- **Correct Approach:** Need YTD tracking or simplified estimate
- **Impact:** High earners will see incorrect FICA estimates
- **Fix Time:** 1 hour (if using simplified approach)

### Priority 3: MAJOR - Federal/State Tax (OVER-SIMPLIFIED)

**Problem:** Tax calculations don't use real tax brackets

- **Location:** `lib/les/expected.ts` lines 444-483
- **Issues:**

  1. No standard deduction
  2. Flat percentage instead of brackets
  3. Ignores W-4 allowances
  4. Wrong annualization for mid-year

- **Impact:** Tax estimates off by $50-500/month
- **Recommendation:** Add clear disclaimer "ROUGH ESTIMATE - Use actual LES value"
- **Fix Time:** 2 hours (add disclaimers + improve estimates)

### Priority 4: IMPORTANT - Missing Data Verification

**Problem:** No validation that data is current for 2025

- **Tables to Verify:**

  1. `bah_rates` - Are these 2025 rates?
  2. `payroll_tax_constants` - Is FICA wage base $176,100?
  3. `state_tax_rates` - Are these 2025 rates?
  4. BAS in `lib/ssot.ts` - Is enlisted $460.25, officer $316.98?

- **Fix Time:** 1 hour to audit + varies to fix

### Priority 5: IMPORTANT - Missing Validations

**Problem:** No sanity checks on user inputs

- **Missing Checks:**

  1. Rank vs YOS (E01 can't have 20 YOS)
  2. BAH dependent rate > no-dependent rate
  3. Base pay within expected range for rank
  4. Net pay reasonableness ($1K-$15K/month)

- **Fix Time:** 2 hours

---

## Phase 1: Critical Tax Fixes (MUST DO FIRST)

### Task 1.1: Fix Taxable Gross Calculation

**File:** `lib/les/expected.ts`

Change lines 115-149 to separate taxable vs total pay:

```typescript
// Calculate TAXABLE gross (excludes BAH/BAS)
const taxableGrossCents = (expected.base_pay_cents || 0) +
                          (expected.cola_cents || 0) +
                          (expected.specials?.reduce((sum, sp) => sum + sp.cents, 0) || 0);

// Calculate TOTAL pay (includes non-taxable allowances)
const totalPayCents = taxableGrossCents +
                      (expected.bah_cents || 0) +
                      (expected.bas_cents || 0);

// Deductions calculated on TOTAL pay (TSP is on total)
const deductions = await computeDeductions(userId, totalPayCents);

// Taxes calculated on TAXABLE gross ONLY
const taxes = await computeTaxes(userId, taxableGrossCents, year);

// Net Pay = Total Pay - Deductions - Taxes
expected.net_pay_cents = totalPayCents - totalDeductions - totalTaxes;
```

**Also Update:** `computeDeductions()` to receive `totalPayCents` (line 351)

**Also Update:** `computeTaxes()` to receive `taxableGrossCents` (line 405)

### Task 1.2: Add Tax Base Disclaimer to UI

**File:** `app/components/les/LesManualEntryTabbed.tsx`

Add warning message in Taxes tab:

```tsx
<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
  <div className="flex items-start gap-3">
    <Icon name="AlertTriangle" className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
    <div className="text-sm">
      <p className="font-semibold text-amber-900 mb-1">Tax Estimates Are Rough Approximations</p>
      <p className="text-amber-800">
        Federal and state tax calculations are simplified estimates. For accurate validation,
        enter your <strong>actual tax withholding from your LES</strong> in the fields below.
        Tax estimates depend on W-4 settings, YTD earnings, and state-specific rules.
      </p>
    </div>
  </div>
</div>
```

### Task 1.3: Fix FICA Calculation

**File:** `lib/les/expected.ts` lines 428-430

**Option A: Simplified (Recommended for MVP):**

```typescript
// FICA (Social Security) - 6.2% up to wage base
// Simplified: Calculate as if no YTD (will overestimate for high earners mid-year)
// User should override with actual LES value
const ficaRate = parseFloat(taxConstants.fica_rate as string); // 0.062
const monthlyFicaWageBase = Math.floor(taxConstants.fica_wage_base_cents / 12); // ~$14,675/month
const ficaTaxableAmount = Math.min(taxableGrossCents, monthlyFicaWageBase);
result.fica_cents = Math.round(ficaTaxableAmount * ficaRate);
```

**Option B: YTD Tracking (Better but complex):**

- Add `ytd_earnings_cents` field to user profile or track in `les_uploads`
- Calculate cumulative FICA base
- More accurate but requires additional data

### Task 1.4: Update Comparison Thresholds

**File:** `lib/les/compare.ts`

Update tax comparison thresholds since they're estimates:

```typescript
// Line 243: Federal tax has high threshold since it's an estimate
if (Math.abs(delta) > 10000) { // $100 threshold (was $50)

// Line 254: State tax also gets higher threshold  
if (Math.abs(delta) > 5000) { // $50 threshold (was $20)
```

---

## Phase 2: Data Verification & Fixes

### Task 2.1: Verify BAS Rates in SSOT

**File:** `lib/ssot.ts` lines 249-251

**Check Official 2025 Rates:**

- Officer: $316.98/month (31698 cents) ✓
- Enlisted: $460.25/month (46025 cents) - **VERIFY THIS**

Current SSOT shows `46025` which matches official 2025 rate.

**Action:** Visit https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/BAS/ and confirm

### Task 2.2: Verify BAH Rates Table

**Query to Run:**

```sql
SELECT MAX(effective_date) as latest_rate_date,
       COUNT(*) as total_rates,
       COUNT(DISTINCT mha) as unique_locations
FROM bah_rates;
```

**Expected:** `effective_date` should be 2025-01-01 or later

**If Outdated:** Need to import 2025 BAH rates from DFAS BAH Calculator

### Task 2.3: Verify Tax Constants

**Query to Run:**

```sql
SELECT * FROM payroll_tax_constants WHERE effective_year = 2025;
```

**Expected Values for 2025:**

- `fica_rate`: 0.062 (6.2%)
- `fica_wage_base_cents`: 17610000 ($176,100)
- `medicare_rate`: 0.0145 (1.45%)

**If Missing:** Create migration to insert 2025 tax constants

### Task 2.4: Verify State Tax Rates

**Query to Run:**

```sql
SELECT COUNT(*) FROM state_tax_rates WHERE effective_year = 2025;
```

**Expected:** At least 51 rows (50 states + DC)

**If Outdated:** Update state tax rates for 2025

### Task 2.5: Create Data Freshness Monitoring

**New File:** `app/api/admin/data-sources/freshness/route.ts`

API endpoint that checks:

```typescript
// Pseudo-code
const checks = {
  bah_rates: await checkBahFreshness(), // Should be current year
  military_pay: await checkPayTablesFreshness(),
  tax_constants: await checkTaxConstantsFreshness(),
  state_taxes: await checkStateTaxFreshness()
};
```

Add to admin dashboard at `/dashboard/admin/data-sources` (already exists)

---

## Phase 3: Add Validations

### Task 3.1: Rank vs YOS Validation

**File:** `lib/les/expected.ts` (new function)

```typescript
function validateRankYOS(paygrade: string, yos: number): { valid: boolean; error?: string } {
  // E01-E04 max 3 years before auto-promotion
  if (paygrade.startsWith('E0') && ['E01','E02','E03','E04'].includes(paygrade)) {
    if (yos > 6) return { valid: false, error: 'Junior enlisted with over 6 YOS unlikely' };
  }
  
  // O10 requires minimum 20 years
  if (paygrade === 'O10' && yos < 20) {
    return { valid: false, error: 'O10 requires minimum 20 years of service' };
  }
  
  // Add more rules as needed
  return { valid: true };
}
```

Call before `buildExpectedSnapshot()` in audit route

### Task 3.2: BAH Dependent Rate Validation

**File:** `lib/les/compare.ts`

Add check after BAH lookup:

```typescript
// If user has dependents, BAH should be higher than no-dependent rate
if (expected.with_dependents) {
  const noDependentRate = await getBahRate(paygrade, mha, false);
  if (noDependentRate && actualBAH < noDependentRate) {
    flags.push(createBAHDependentRateWarning());
  }
}
```

### Task 3.3: Net Pay Reasonableness Check

**File:** `lib/les/compare.ts`

Add after net pay calculation:

```typescript
// Sanity check: Net pay should be between $1,000 and $15,000/month
if (actualNetPay > 0) {
  if (actualNetPay < 100000) { // Less than $1,000
    flags.push(createNetPayTooLowWarning(actualNetPay));
  } else if (actualNetPay > 1500000) { // More than $15,000
    flags.push(createNetPayTooHighWarning(actualNetPay));
  }
}
```

---

## Phase 4: UX Improvements

### Task 4.1: Add "Expected vs Actual" Explainer

**File:** `app/components/les/LesManualEntryTabbed.tsx`

Add info icon next to auto-filled values:

```tsx
<div className="flex items-center gap-2">
  <span className="text-sm text-gray-600">Expected: ${expectedValue}</span>
  <button 
    onClick={() => setShowExplainer(true)}
    className="text-blue-600 hover:text-blue-800"
  >
    <Icon name="HelpCircle" className="h-4 w-4" />
  </button>
</div>
```

### Task 4.2: Add Links to Official Sources

**File:** `app/components/les/LesFlags.tsx`

For each flag, add "Learn More" link to official source:

- BAH flags → DFAS BAH Calculator
- BAS flags → DFAS BAS rates
- FICA/Medicare → IRS tax info
- Base pay → DFAS pay tables

### Task 4.3: Improve Error Messages

**File:** `lib/les/compare.ts`

Make all flag messages more specific:

**Before:**

```typescript
message: `BAH mismatch: Received $${actual}, expected $${expected}`
```

**After:**

```typescript
message: `BAH mismatch for ${paygrade} ${depStatus} at ${location}: Received $${actual}, expected $${expected} (2025 rate). Delta: ${delta > 0 ? 'SHORT' : 'OVER'} $${Math.abs(delta)}.`
```

---

## Phase 5: Optional Enhancements

### Task 5.1: Add TSP Contribution Limits

**File:** `lib/les/expected.ts`

```typescript
// Check TSP annual limit ($23,500 for 2025)
const TSP_ANNUAL_LIMIT_2025 = 2350000; // cents
const monthlyTspMax = Math.floor(TSP_ANNUAL_LIMIT_2025 / 12); // ~$1,958/month

if (result.tsp_cents && result.tsp_cents > monthlyTspMax) {
  // User is over-contributing (catch-up contributions?)
  // Add flag or warning
}
```

### Task 5.2: Add Month-over-Month Comparison

**New Feature:** Show how allowances changed from previous month

**Files:**

- `app/api/les/history/route.ts` - Get user's previous audits
- `app/components/les/LesHistory.tsx` - Display trends

### Task 5.3: Replace Hardcoded Dental Premium

**File:** `lib/les/expected.ts` line 391

**Current:** Hardcoded $14/month

**Better:** Look up from profile or ask user to enter actual premium

```typescript
// Option 1: Add dental_premium_cents to user_profiles
if (profile.has_dental_insurance && profile.dental_premium_cents) {
  result.dental_cents = profile.dental_premium_cents;
}

// Option 2: Just leave it out and let user enter manually
// Option 3: Add TRICARE Dental premium table to database
```

---

## Implementation Order (Recommended)

### Week 1: Critical Fixes

1. Fix taxable gross calculation (Task 1.1) - **30 min**
2. Add tax disclaimer UI (Task 1.2) - **15 min**
3. Fix FICA calculation (Task 1.3) - **1 hour**
4. Update comparison thresholds (Task 1.4) - **15 min**
5. **Deploy and test** - **1 hour**

**Total Week 1: ~3 hours**

### Week 2: Data Verification

1. Verify BAS rates (Task 2.1) - **15 min**
2. Verify BAH rates (Task 2.2) - **30 min**
3. Verify tax constants (Task 2.3) - **30 min**
4. Verify state tax rates (Task 2.4) - **30 min**
5. Update any stale data - **varies**

**Total Week 2: ~2-4 hours**

### Week 3: Validations

1. Add rank vs YOS validation (Task 3.1) - **1 hour**
2. Add BAH dependent rate check (Task 3.2) - **30 min**
3. Add net pay sanity check (Task 3.3) - **30 min**
4. Test all validations - **1 hour**

**Total Week 3: ~3 hours**

### Week 4: UX Polish

1. Add expected vs actual explainer (Task 4.1) - **1 hour**
2. Add links to official sources (Task 4.2) - **30 min**
3. Improve error messages (Task 4.3) - **1 hour**

**Total Week 4: ~2.5 hours**

---

## Testing Checklist

After each phase, test with these scenarios:

### Test Case 1: Junior Enlisted with Dependents

- **Rank:** E01 (Private)
- **YOS:** 1 year
- **Location:** Fort Hood, TX (TX191)
- **Dependents:** Yes
- **Expected BAH:** ~$1,800/month
- **Expected BAS:** $460.25/month
- **Expected Base Pay:** ~$2,300/month

### Test Case 2: Mid-Grade Officer

- **Rank:** O03 (Captain)
- **YOS:** 8 years
- **Location:** San Diego, CA
- **Dependents:** No
- **Expected:** Higher FICA, California state tax, higher base pay

### Test Case 3: High Earner Near FICA Limit

- **Rank:** O06 (Colonel)
- **YOS:** 22 years
- **Expected:** Should hit FICA wage base around month 9-10

---

## Success Metrics

After all fixes are complete:

1. **Tax Accuracy:** Tax calculations based on correct taxable income (excludes BAH/BAS)
2. **FICA Accuracy:** Simplified monthly calculation with clear disclaimer
3. **Data Currency:** All 2025 rates verified and documented
4. **Validation Coverage:** 90% of invalid inputs caught before audit
5. **User Confidence:** Clear disclaimers on estimates, links to official sources
6. **Error Rate:** <5% of audits produce incorrect flags

---

## Files to Modify

### Critical Path (Week 1):

1. `lib/les/expected.ts` - Fix tax base calculation
2. `lib/les/compare.ts` - Update thresholds
3. `app/components/les/LesManualEntryTabbed.tsx` - Add disclaimers

### Data Verification (Week 2):

1. `lib/ssot.ts` - Verify BAS rates
2. Database queries - Verify all tables
3. Migrations (if needed) - Update stale data

### Validations (Week 3):

1. `lib/les/expected.ts` - Add validation functions
2. `app/api/les/audit-manual/route.ts` - Call validations
3. `lib/les/compare.ts` - Add new flag creators

### UX Polish (Week 4):

1. `app/components/les/LesManualEntryTabbed.tsx` - Add help text
2. `app/components/les/LesFlags.tsx` - Improve messages
3. `lib/les/compare.ts` - Better flag descriptions

---

## Documentation Updates Needed

1. **README update:** Note tax calculations are estimates
2. **User Guide:** Explain when to override auto-filled values
3. **Admin Guide:** Data source update procedures
4. **SYSTEM_STATUS.md:** Document LES Auditor limitations

---

## Questions for User

Before starting implementation:

1. **FICA Calculation:** Use simplified monthly estimate (Option A) or implement YTD tracking (Option B)?
2. **Data Verification:** Can you provide access to verify 2025 rates against official sources?
3. **Deployment:** Fix all critical issues in one release, or deploy incrementally?
4. **Testing:** Do you have sample LES documents to test against?

### To-dos

- [ ] Add special_pays JSONB column to user_profiles table and create migration
- [ ] Add MHA override field UI to profile setup page
- [ ] Add special pays checkboxes and configuration UI to profile setup
- [ ] Create reusable CurrencyInput component with auto-fill indicator
- [ ] Expand LesManualEntry form to include special pays and base pay fields
- [ ] Create database tables for base pay, SDAP, and special pay rates
- [ ] Create seed script and populate 2025 DFAS pay rate tables
- [ ] Add computeSpecialPays() and computeBasePay() to expected.ts
- [ ] Add special pays and base pay validation to compare.ts
- [ ] Update audit-manual and expected-values API routes to handle special pays
- [ ] Implement graceful error handling for missing rate data with clear messaging
- [ ] Test all scenarios: no special pays, with special pays, MHA override, partial data
- [ ] Update user guides and SYSTEM_STATUS with special pays support
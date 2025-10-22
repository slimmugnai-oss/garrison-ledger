<!-- 88f3ec67-6b10-45cb-be65-9946951e1ffe 85f149ed-d72a-4fca-bbda-313bddc9f52f -->
# LES Auditor V1 Hardening (Manual-Entry)

## Overview

Seven critical hardening tasks to fix TSP prefill logic, expand flag coverage, improve user input handling, ensure example consistency, and enhance testing infrastructure.

---

## Task 1: Fix TSP Calculation & Update Examples

### Problem

Currently computing TSP from total pay (includes BAH/BAS). Should use BASIC PAY only by default.

### Changes Required

**File: `lib/les/expected.ts`**

- Locate TSP computation in `computeDeductions()` or prefill logic
- Change from: `totalPayCents * tspPercent`
- Change to: `basePayCents * tspPercent`
- Add optional toggles for special/incentive pay sources (default: false)
- Add JSDoc: "TSP prefill assumes % of BASIC PAY only; user can override"

**File: `app/components/les/LesManualEntryTabbed.tsx`**

- Update TSP help text to:
  ```tsx
  helpText="TSP prefill assumes % of BASIC PAY; edit if you elected other sources"
  ```


**File: `review/les-auditor/fixtures/happy_path_e5_fthood.request.json`**

- Change TSP from current value to: `17500` (cents = $175)
- Add DENTAL line: `{"code": "DENTAL", "description": "TRICARE Dental", "amount_cents": 1400}`

**File: `review/les-auditor/fixtures/happy_path_e5_fthood.response.json`**

- Recalculate `total_deductions`: TSP $175 + SGLI $27 + Dental $14 = $216
- Recalculate `computed_net` and `net_delta`
- Update `mathProof` string to reflect new totals

**File: `review/les-auditor/api.openapi.yaml`**

- Update embedded example in `AuditRequest` schema to include DENTAL line
- Update `AuditResponse` example with recomputed totals
- Ensure mathProof string matches new calculations

**File: `review/les-auditor/LES_Auditor_Review_Packet.md`**

- Find references to "TSP (5%) = $288.00"
- Replace with "$175.00" (5% of $3,500 base pay)
- Update all downstream sums in examples

---

## Task 2: Implement New Flag Types

### New Flags to Add

**File: `app/types/les.ts` (or flag type definition)**

```typescript
| 'PROMO_NOT_REFLECTED'    // Red: Promotion not reflected in base pay
| 'BAH_PARTIAL_OR_DIFF'    // Yellow: Partial BAH or mid-month change
| 'CZTE_INFO'              // Green: Combat zone tax exclusion detected
```

**File: `lib/les/compare.ts`**

Add flag creators:

```typescript
function createPromoNotReflectedFlag(promoDate: Date, auditPeriod: Date): PayFlag {
  return {
    severity: 'red',
    flag_code: 'PROMO_NOT_REFLECTED',
    message: `Promotion to [rank] effective ${promoDate} not reflected in base pay`,
    suggestion: 'Contact finance office immediately. Promotion pay should retroactively adjust.',
    ref_url: 'https://www.dfas.mil/militarymembers/payentitlements/Pay-Computations/'
  };
}

function createBAHPartialOrDiffFlag(expected: number, actual: number, pcsMonth: boolean): PayFlag {
  return {
    severity: 'yellow',
    flag_code: 'BAH_PARTIAL_OR_DIFF',
    message: `BAH shows ${actual/100} (expected ${expected/100}). ${pcsMonth ? 'Mid-month PCS may cause prorated amount.' : 'Small variance detected.'}`,
    suggestion: pcsMonth 
      ? 'Verify prorated BAH for PCS month is correct. Next month should show full new rate.'
      : 'Verify duty station and dependent status match profile.',
    delta_cents: expected - actual
  };
}

function createCZTEInfoFlag(fedTax: number): PayFlag {
  return {
    severity: 'green',
    flag_code: 'CZTE_INFO',
    message: `Combat Zone Tax Exclusion detected (Fed tax: $${fedTax/100})`,
    suggestion: 'No action needed. CZTE exempts federal income tax while in combat zone. FICA/Medicare still apply.',
    ref_url: 'https://www.irs.gov/publications/p3'
  };
}
```

Add logic in `compareDetailed()`:

```typescript
// Check for promotion not reflected
if (profile.promoDate && profile.promoDate < auditDate) {
  if (actualBasePay === expectedBasePayBeforePromo) {
    flags.push(createPromoNotReflectedFlag(profile.promoDate, auditDate));
  }
}

// Check for partial/different BAH (PCS month)
if (expectedBAH > 0 && actualBAH > 0) {
  const delta = Math.abs(expectedBAH - actualBAH);
  if (delta > 500 && delta < 10000 && profile.pcsMonth) {
    flags.push(createBAHPartialOrDiffFlag(expectedBAH, actualBAH, true));
  }
}

// Check for CZTE
if (actualFedTax < 1000 && (actualFICA > 0 || actualMedicare > 0)) {
  flags.push(createCZTEInfoFlag(actualFedTax));
}
```

---

## Task 3: Request Canonicalization

### Problem

Users enter "MEDICARE HI", "FED TAX", "SOC SEC" instead of canonical codes.

**File: `app/api/les/audit/route.ts` (or audit-manual/route.ts)**

Add normalization before validation:

```typescript
const CODE_ALIASES: Record<string, string> = {
  'MEDICARE HI': 'MEDICARE',
  'FED TAX': 'TAX_FED',
  'FITW': 'TAX_FED',
  'STATE TAX': 'TAX_STATE',
  'SITW': 'TAX_STATE',
  'SOC SEC': 'FICA',
  'OASDI': 'FICA',
  'SOCIAL SECURITY': 'FICA',
  'BASIC PAY': 'BASEPAY',
  'BASE PAY': 'BASEPAY',
  'BAH W/DEP': 'BAH',
  'BAH W/O DEP': 'BAH',
  // Add more as discovered
};

function normalizeLineCode(userCode: string): string {
  const upper = userCode.toUpperCase().trim();
  return CODE_ALIASES[upper] || userCode;
}

// Apply before validation
requestBody.actual.allowances = requestBody.actual.allowances.map(line => ({
  ...line,
  code: normalizeLineCode(line.code)
}));
// Repeat for taxes, deductions, etc.
```

---

## Task 4: Example Consistency

### Update All Examples

**New Fixtures to Create:**

1. `review/les-auditor/fixtures/fica_wage_base.request.json`

   - High earner (O-6, 20 YOS)
   - Base pay: $11,000
   - YTD earnings exceed $176,100
   - FICA should stop

2. `review/les-auditor/fixtures/fica_wage_base.response.json`

   - Yellow flag: FICA_WAGEBASE_HIT
   - Medicare continues

3. `review/les-auditor/fixtures/promo_not_reflected.request.json`

   - E-4 promoted to E-5 last month
   - Base pay still showing E-4 rate

4. `review/les-auditor/fixtures/promo_not_reflected.response.json`

   - Red flag: PROMO_NOT_REFLECTED

5. `review/les-auditor/fixtures/medicare_hi_only.request.json`

   - User entered "MEDICARE HI" instead of "MEDICARE"

6. `review/les-auditor/fixtures/medicare_hi_only.response.json`

   - Code normalized to MEDICARE
   - Green flag: MEDICARE_PCT_CORRECT

**File: `review/les-auditor/api.openapi.yaml`**

- Add `externalValue` references for new fixtures
- Update existing examples to match recalculated totals

---

## Task 5: Expand Unit Tests

**File: `__tests__/lib/les/expected.test.ts` (NEW)**

```typescript
describe('expected.ts - TSP calculation', () => {
  it('computes TSP from basic pay only (not total pay)', () => {
    const result = computeDeductions({
      basePayCents: 350000,  // $3,500
      bahCents: 180000,      // $1,800
      basCents: 46025,       // $460.25
      tspPercent: 0.05       // 5%
    });
    
    expect(result.tsp_cents).toBe(17500); // 5% of $3,500 = $175
  });
});
```

**File: `__tests__/lib/les/compare.test.ts`**

Add tests:

```typescript
it('flags PROMO_NOT_REFLECTED when promotion date passed but pay unchanged', () => {
  const result = compareDetailed({
    profile: {
      promoDate: new Date('2025-09-01'),
      expectedNewBasePay: 425000
    },
    auditDate: new Date('2025-10-01'),
    actualLines: [
      { code: 'BASEPAY', amount_cents: 350000 } // Still old pay
    ]
  });
  
  const flag = result.flags.find(f => f.flag_code === 'PROMO_NOT_REFLECTED');
  expect(flag).toBeDefined();
  expect(flag.severity).toBe('red');
});

it('flags BAH_PARTIAL_OR_DIFF yellow when PCS month detected', () => {
  const result = compareDetailed({
    expected: { bah_cents: 200000 },
    profile: { pcsMonth: true },
    actualLines: [
      { code: 'BAH', amount_cents: 185000 } // $150 short (partial month)
    ]
  });
  
  const flag = result.flags.find(f => f.flag_code === 'BAH_PARTIAL_OR_DIFF');
  expect(flag).toBeDefined();
  expect(flag.severity).toBe('yellow');
});

it('shows CZTE_INFO when fed tax near zero but FICA/Medicare present', () => {
  const result = compareDetailed({
    actualLines: [
      { code: 'TAX_FED', amount_cents: 0 },
      { code: 'FICA', amount_cents: 21700 },
      { code: 'MEDICARE', amount_cents: 5075 }
    ]
  });
  
  const flag = result.flags.find(f => f.flag_code === 'CZTE_INFO');
  expect(flag).toBeDefined();
  expect(flag.severity).toBe('green');
});

it('generates correct mathProof format (snapshot test)', () => {
  const result = compareDetailed({ /* ... */ });
  
  expect(result.mathProof).toMatchSnapshot();
  // Ensures no formatting regressions
});
```

---

## Task 6: RLS Smoke Test in CI

**File: `.github/workflows/test.yml` (or create if missing)**

Add step:

```yaml
- name: RLS Smoke Test
  run: |
    supabase db execute --file review/les-auditor/sql/rls_smoke_test.sql
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

If test fails (contains ❌), CI should fail.

---

## Task 7: Documentation & UX Clarity

**File: `review/les-auditor/LES_Auditor_Review_Packet.md`**

Add clarity section:

```markdown
### What We Prefill vs What You Enter

**Auto-Filled (from official DFAS tables):**
- Base Pay (by rank + YOS)
- BAH (by location + dependents)
- BAS (by officer/enlisted)
- COLA (by location)

**You Must Enter (from YOUR LES):**
- Federal Tax (varies by W-4, YTD, exemptions)
- State Tax (51 different state systems)
- FICA (we validate ~6.2%)
- Medicare (we validate ~1.45%)
- TSP (default prefill = % of BASIC PAY; override if you elected other sources)
- Dental (varies by plan)
- Net Pay (we validate math)
```

**File: `app/components/les/LesManualEntryTabbed.tsx`**

Update help text:

```tsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
  <Icon name="Info" className="h-5 w-5 text-blue-600" />
  <p className="text-sm text-blue-900">
    <strong>What we prefill:</strong> Only authoritative values (Base Pay, BAH, BAS, COLA).
  </p>
  <p className="text-sm text-blue-800">
    <strong>What you enter:</strong> Taxes, TSP, Dental from YOUR LES. 
    TSP default = % of BASIC PAY; override if you elected contributions from other pays.
  </p>
</div>
```

---

## Implementation Order

1. Fix TSP calculation logic in `lib/les/expected.ts`
2. Update fixtures with corrected TSP ($175) and add DENTAL
3. Recalculate all example totals (fixtures, OpenAPI, review packet)
4. Add new flag types to types and `lib/les/compare.ts`
5. Implement canonicalization in API route
6. Create new fixtures (fica_wage_base, promo, medicare_hi)
7. Write unit tests for new features
8. Add RLS test to CI
9. Update documentation and UI help text

---

## Acceptance Criteria

**Existing Fixture (Updated):**

- `happy_path_e5_fthood` passes with:
  - TSP = $175 (5% of $3,500 base pay)
  - Dental = $14
  - Total deductions = $216
  - Recomputed net pay
  - mathProof string matches

**New Fixtures:**

- `promo_not_reflected` shows RED flag with suggestion
- `fica_wage_base` shows YELLOW advisory, Medicare continues
- `medicare_hi_only` canonicalizes to MEDICARE, passes

**Tests:**

- All unit tests pass (`npm test`)
- Acceptance tests pass (`npm run test:fixtures`)
- CI RLS smoke test passes

**Documentation:**

- Review packet clarifies prefill vs manual entry
- UI help text explains TSP = % of BASIC PAY
- OpenAPI examples validate and match fixtures

### To-dos

- [ ] Global search/replace uploadId → auditId across all files
- [ ] Add LineItem.code enum to OpenAPI and server validation
- [ ] Implement 50/day rate limit on POST /les/audit
- [ ] Write unit tests for codes.ts and compare.ts
- [ ] Create fixture test runner and save outputs to runs/
- [ ] Add helper text, data freshness badges, math proof
- [ ] Create GET /api/les/data-freshness endpoint
- [ ] Run RLS smoke test and save output
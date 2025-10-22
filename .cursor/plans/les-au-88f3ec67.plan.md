<!-- 88f3ec67-6b10-45cb-be65-9946951e1ffe 85f149ed-d72a-4fca-bbda-313bddc9f52f -->
# LES Auditor - Final Production Lockdown

## Overview

Eight critical tasks to lock down the LES Auditor for production: consistent naming, schema validation, rate limiting, comprehensive testing, UI polish, and security verification.

---

## Task 1: Rename uploadId → auditId (Consistency)

**Files to Update:**

- `app/api/les/audit-manual/route.ts` - Response returns `auditId` not `uploadId`
- `app/api/les/audit/[id]/clone/route.ts` - Response returns `auditId` 
- `app/types/les.ts` - Type definitions
- `review/les-auditor/api.openapi.yaml` - Schema property name
- `review/les-auditor/fixtures/*.response.json` - Update both response files
- Any client code referencing `uploadId`

**Search Pattern:** `grep -r "uploadId" --include="*.ts" --include="*.tsx" --include="*.yaml" --include="*.json"`

---

## Task 2: Line Code Enum Validation

### OpenAPI Schema Update

**File:** `review/les-auditor/api.openapi.yaml`

Change LineItem.code to enum:

```yaml
code:
  type: string
  enum:
    - BASEPAY
    - BAH
    - BAS
    - COLA
    - SDAP
    - HFP
    - FSA
    - FLPP
    - TAX_FED
    - TAX_STATE
    - FICA
    - MEDICARE
    - SGLI
    - DENTAL
    - TSP
    - ALLOTMENT
    - DEBT
    - ADJUSTMENT
    - OTHER
```

### Server Validation

**File:** `lib/les/codes.ts`

Add validation function:

```typescript
export function validateAndNormalizeCode(code: string): {
  code: string;
  warning?: PayFlag;
} {
  if (isValidLineCode(code)) {
    return { code };
  }
  
  // Unknown code → default to OTHER with warning
  return {
    code: 'OTHER',
    warning: {
      severity: 'yellow',
      flag_code: 'UNKNOWN_CODE',
      message: `Unrecognized line code: ${code}`,
      suggestion: 'Review this entry for typos. Code has been categorized as OTHER.'
    }
  };
}
```

**File:** `app/api/les/audit/route.ts`

Add validation on line item insert.

---

## Task 3: Rate Limiting

### Documentation

**File:** `review/les-auditor/api.openapi.yaml`

Add to POST /les/audit description:

```yaml
description: |
  ...existing...
  
  **Rate Limit:** 50 audits per day per user. Returns 429 if exceeded.
```

### Implementation

**File:** `app/api/les/audit/route.ts`

Add before processing:

```typescript
import { checkAndIncrement } from '@/lib/rate-limit';

// Check rate limit (50/day)
const { allowed, remaining } = await checkAndIncrement(
  user.id,
  '/api/les/audit',
  50
);

if (!allowed) {
  return NextResponse.json(
    { error: 'Rate limit exceeded. Max 50 audits per day.' },
    { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
  );
}
```

### Test

**File:** `__tests__/api/les/audit-ratelimit.test.ts`

Create integration test that calls endpoint 51 times, expects 429 on #51.

---

## Task 4: Unit Tests

### File 1: `__tests__/lib/les/codes.test.ts`

```typescript
import { computeTaxableBases, getLineCodeDefinition } from '@/lib/les/codes';

describe('codes.ts', () => {
  describe('computeTaxableBases', () => {
    it('excludes BAH and BAS from all tax bases', () => {
      const lines = [
        { code: 'BASEPAY', amount_cents: 350000 },
        { code: 'BAH', amount_cents: 180000 },
        { code: 'BAS', amount_cents: 46025 }
      ];
      
      const bases = computeTaxableBases(lines);
      
      expect(bases.fed).toBe(350000);
      expect(bases.state).toBe(350000);
      expect(bases.oasdi).toBe(350000);
      expect(bases.medicare).toBe(350000);
    });
    
    it('includes HFP in FICA/Medicare but not Fed/State', () => {
      const lines = [
        { code: 'BASEPAY', amount_cents: 350000 },
        { code: 'HFP', amount_cents: 22500 }
      ];
      
      const bases = computeTaxableBases(lines);
      
      expect(bases.fed).toBe(350000);
      expect(bases.state).toBe(350000);
      expect(bases.oasdi).toBe(372500);
      expect(bases.medicare).toBe(372500);
    });
  });
});
```

### File 2: `__tests__/lib/les/compare.test.ts`

```typescript
import { compareDetailed } from '@/lib/les/compare';

describe('compare.ts', () => {
  describe('compareDetailed', () => {
    it('flags BAH mismatch when delta > $5', () => {
      const result = compareDetailed({
        expected: { bah_cents: 195000 },
        taxable_bases: { fed: 0, state: 0, oasdi: 0, medicare: 0 },
        actualLines: [
          { line_code: 'BAH', amount_cents: 165000, section: 'ALLOWANCE' }
        ],
        netPayCents: 0
      });
      
      const bahFlag = result.flags.find(f => f.flag_code === 'BAH_MISMATCH');
      expect(bahFlag).toBeDefined();
      expect(bahFlag?.severity).toBe('red');
      expect(bahFlag?.delta_cents).toBe(30000);
    });
    
    it('passes FICA check when 6.2%', () => {
      const result = compareDetailed({
        expected: {},
        taxable_bases: { fed: 0, state: 0, oasdi: 350000, medicare: 0 },
        actualLines: [
          { line_code: 'FICA', amount_cents: 21700, section: 'TAX' }
        ],
        netPayCents: 0
      });
      
      const ficaFlag = result.flags.find(f => f.flag_code === 'FICA_PCT_CORRECT');
      expect(ficaFlag).toBeDefined();
    });
    
    it('net math ±$1 passes, ±$1.01 fails', () => {
      // Pass case
      const pass = compareDetailed({
        expected: {},
        taxable_bases: { fed: 0, state: 0, oasdi: 0, medicare: 0 },
        actualLines: [
          { line_code: 'BASEPAY', amount_cents: 100000, section: 'ALLOWANCE' }
        ],
        netPayCents: 99900 // $1 diff
      });
      
      expect(pass.flags.find(f => f.flag_code === 'NET_MATH_VERIFIED')).toBeDefined();
      
      // Fail case
      const fail = compareDetailed({
        expected: {},
        taxable_bases: { fed: 0, state: 0, oasdi: 0, medicare: 0 },
        actualLines: [
          { line_code: 'BASEPAY', amount_cents: 100000, section: 'ALLOWANCE' }
        ],
        netPayCents: 99899 // $1.01 diff
      });
      
      expect(fail.flags.find(f => f.flag_code === 'NET_MATH_MISMATCH')).toBeDefined();
    });
  });
});
```

### CI Integration

**File:** `.github/workflows/test.yml` or package.json script

Ensure `npm test` runs on PR/push with coverage threshold.

---

## Task 5: Acceptance Test Runner

**File:** `scripts/test-les-fixtures.ts`

```typescript
import { readFileSync } from 'fs';

async function testFixture(name: string) {
  const request = JSON.parse(
    readFileSync(`review/les-auditor/fixtures/${name}.request.json`, 'utf-8')
  );
  
  const response = await fetch('http://localhost:3000/api/les/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  
  const result = await response.json();
  
  // Save to runs/
  writeFileSync(
    `review/les-auditor/runs/${name}.response.json`,
    JSON.stringify(result, null, 2)
  );
  
  return result;
}

async function main() {
  // Test happy path
  const happy = await testFixture('happy_path_e5_fthood');
  assert(happy.flags.every(f => f.severity === 'green'));
  assert(happy.summary.net_delta <= 100);
  
  // Test BAH mismatch
  const bah = await testFixture('bah_mismatch_e6_pcs');
  assert(bah.flags.some(f => f.flag_code === 'BAH_MISMATCH' && f.delta_cents === 30000));
  
  console.log('✅ All acceptance tests passed');
}
```

**Add to package.json:**

```json
"test:fixtures": "ts-node scripts/test-les-fixtures.ts"
```

---

## Task 6: UI Polish

### Tax Field Helper Text

**File:** `app/components/les/LesManualEntryTabbed.tsx`

Update tax section (Tab 3) to add prominent note:

```tsx
<div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
  <p className="text-sm text-amber-900">
    <strong>Enter exactly what appears on your LES.</strong> We do NOT estimate 
    federal/state taxes in v1. You provide the actual values, we validate the percentages.
  </p>
</div>
```

### Data Freshness Badge

**File:** `app/components/les/LesManualEntryTabbed.tsx`

Add next to auto-filled allowances:

```tsx
<div className="text-xs text-gray-500 mt-1">
  ✓ From official 2025 DFAS tables (effective {effectiveDate})
</div>
```

### Math Proof Panel

Already exists in `AuditDetailClient.tsx` - ensure it's also in main results view.

---

## Task 7: Data Freshness Endpoint

**File:** `app/api/les/data-freshness/route.ts` (NEW)

```typescript
export async function GET() {
  const { data: payTables } = await supabase
    .from('military_pay_tables')
    .select('effective_date')
    .order('effective_date', { ascending: false })
    .limit(1);
    
  const { data: bah } = await supabase
    .from('bah_rates')
    .select('effective_date')
    .order('effective_date', { ascending: false })
    .limit(1);
    
  return NextResponse.json({
    pay_tables: payTables?.[0]?.effective_date || null,
    bah: bah?.[0]?.effective_date || null,
    bas: '2025-01-01', // From SSOT
    cola_conus: '2025-01-01',
    cola_oconus: '2025-01-01'
  });
}
```

**Usage in UI:** Display badge "Data as of {date}"

---

## Task 8: Security Validation

### Run RLS Test

```bash
supabase db execute --file review/les-auditor/sql/rls_smoke_test.sql > review/les-auditor/rls_run.txt
```

### Verify Soft Delete in Search

**File:** `app/api/les/audit/search/route.ts`

Ensure `.is('deleted_at', null)` is present in query.

Add test case in acceptance script.

---

## Implementation Order

1. Rename uploadId → auditId (global search/replace)
2. Add LineItem.code enum to OpenAPI
3. Add code validation in server
4. Implement rate limiting
5. Write unit tests
6. Create acceptance test runner
7. Polish UI with helper text and badges
8. Create data freshness endpoint
9. Run RLS test and save output
10. Run all tests and save results to review/

---

## Deliverables

**New Files:**

- `__tests__/lib/les/codes.test.ts`
- `__tests__/lib/les/compare.test.ts`
- `scripts/test-les-fixtures.ts`
- `app/api/les/data-freshness/route.ts`
- `review/les-auditor/runs/happy_path_e5_fthood.response.json`
- `review/les-auditor/runs/bah_mismatch_e6_pcs.response.json`
- `review/les-auditor/rls_run.txt`

**Modified Files:**

- `review/les-auditor/api.openapi.yaml` (enum codes, rate limit note, auditId)
- `review/les-auditor/fixtures/*.response.json` (auditId)
- `lib/les/codes.ts` (validation function)
- `app/api/les/audit/route.ts` (rate limit, code validation)
- `app/components/les/LesManualEntryTabbed.tsx` (UI polish)
- All files with `uploadId` references

**Coverage Target:** >70% on `lib/les/*`

### To-dos

- [ ] Global search/replace uploadId → auditId across all files
- [ ] Add LineItem.code enum to OpenAPI and server validation
- [ ] Implement 50/day rate limit on POST /les/audit
- [ ] Write unit tests for codes.ts and compare.ts
- [ ] Create fixture test runner and save outputs to runs/
- [ ] Add helper text, data freshness badges, math proof
- [ ] Create GET /api/les/data-freshness endpoint
- [ ] Run RLS smoke test and save output
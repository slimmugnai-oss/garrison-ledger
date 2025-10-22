<!-- 88f3ec67-6b10-45cb-be65-9946951e1ffe b0e51da6-a39b-4ea0-94db-34354445c200 -->
# LES Auditor - Complete Enhancement Plan

## Overview

Transform LES Auditor into a production-grade audit management system with proper library structure, enhanced manual entry, history features, and accurate tax validation. Maintains backward compatibility with existing les_uploads/pay_flags tables.

---

## PHASE 1: Database Schema Enhancement

### Migration 1: Enhance Existing Tables

**File:** `supabase-migrations/20251023_les_auditor_enhancements.sql`

```sql
-- PART 1: Add soft delete and audit metadata (backward compatible)
ALTER TABLE les_uploads 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS audit_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS audit_status text DEFAULT 'completed' 
    CHECK (audit_status IN ('draft', 'completed', 'archived')),
  ADD COLUMN IF NOT EXISTS profile_snapshot jsonb DEFAULT '{}'::jsonb;

-- PART 2: Add denormalized flag counts for performance
ALTER TABLE les_uploads
  ADD COLUMN IF NOT EXISTS red_flags_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS yellow_flags_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS green_flags_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_delta_cents integer DEFAULT 0;

-- PART 3: Enhance les_lines with taxability tracking
ALTER TABLE les_lines
  ADD COLUMN IF NOT EXISTS section text DEFAULT 'ALLOWANCE'
    CHECK (section IN ('ALLOWANCE','DEDUCTION','ALLOTMENT','TAX','DEBT','ADJUSTMENT')),
  ADD COLUMN IF NOT EXISTS taxability jsonb DEFAULT '{"fed":false,"state":false,"oasdi":false,"medicare":false}'::jsonb;

-- Backfill section based on line_code patterns
UPDATE les_lines SET section = 
  CASE 
    WHEN line_code IN ('BASEPAY', 'BAH', 'BAS', 'COLA', 'SDAP', 'HFP', 'FSA', 'FLPP') THEN 'ALLOWANCE'
    WHEN line_code IN ('TAX_FED', 'TAX_STATE', 'FICA', 'MEDICARE') THEN 'TAX'
    WHEN line_code IN ('SGLI', 'DENTAL', 'TSP') THEN 'DEDUCTION'
    WHEN line_code LIKE 'ALLOTMENT_%' THEN 'ALLOTMENT'
    WHEN line_code = 'DEBT' THEN 'DEBT'
    WHEN line_code = 'ADJUSTMENT' THEN 'ADJUSTMENT'
    ELSE 'ALLOWANCE'
  END
WHERE section IS NULL;

-- PART 4: Enhance expected_pay_snapshot with taxable bases
ALTER TABLE expected_pay_snapshot
  ADD COLUMN IF NOT EXISTS taxable_bases jsonb DEFAULT '{"fed":0,"state":0,"oasdi":0,"medicare":0}'::jsonb;

-- PART 5: Add indexes for filtering and performance
CREATE INDEX IF NOT EXISTS idx_les_uploads_deleted 
  ON les_uploads (user_id, deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_les_uploads_status 
  ON les_uploads (user_id, audit_status);
CREATE INDEX IF NOT EXISTS idx_les_lines_section 
  ON les_lines (upload_id, section);

-- PART 6: Update RLS to exclude soft-deleted
DROP POLICY IF EXISTS "Users can view their own uploads" ON les_uploads;
CREATE POLICY "Users can view their own uploads"
  ON les_uploads FOR SELECT
  USING (auth.role() = 'authenticated' AND (deleted_at IS NULL OR deleted_at > now()));

-- PART 7: Create trigger to auto-update flag counts
CREATE OR REPLACE FUNCTION update_audit_flag_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE les_uploads
  SET 
    red_flags_count = (SELECT COUNT(*) FROM pay_flags WHERE upload_id = NEW.upload_id AND severity = 'red'),
    yellow_flags_count = (SELECT COUNT(*) FROM pay_flags WHERE upload_id = NEW.upload_id AND severity = 'yellow'),
    green_flags_count = (SELECT COUNT(*) FROM pay_flags WHERE upload_id = NEW.upload_id AND severity = 'green'),
    total_delta_cents = (SELECT COALESCE(SUM(delta_cents), 0) FROM pay_flags WHERE upload_id = NEW.upload_id),
    audit_completed_at = CASE 
      WHEN (SELECT COUNT(*) FROM pay_flags WHERE upload_id = NEW.upload_id) > 0 
      THEN now() 
      ELSE audit_completed_at 
    END,
    audit_status = 'completed'
  WHERE id = NEW.upload_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_flag_counts_trigger ON pay_flags;
CREATE TRIGGER update_flag_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON pay_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_flag_counts();

-- PART 8: Backfill flag counts for existing audits
UPDATE les_uploads u
SET 
  red_flags_count = (SELECT COUNT(*) FROM pay_flags WHERE upload_id = u.id AND severity = 'red'),
  yellow_flags_count = (SELECT COUNT(*) FROM pay_flags WHERE upload_id = u.id AND severity = 'yellow'),
  green_flags_count = (SELECT COUNT(*) FROM pay_flags WHERE upload_id = u.id AND severity = 'green'),
  total_delta_cents = (SELECT COALESCE(SUM(delta_cents), 0) FROM pay_flags WHERE upload_id = u.id)
WHERE red_flags_count IS NULL;

COMMENT ON COLUMN les_uploads.profile_snapshot IS 'Snapshot of user profile at audit time: {paygrade, yos, mha, withDependents, specials}';
COMMENT ON COLUMN les_lines.section IS 'Line item category: ALLOWANCE, DEDUCTION, ALLOTMENT, TAX, DEBT, ADJUSTMENT';
COMMENT ON COLUMN les_lines.taxability IS 'Taxability flags: {fed, state, oasdi, medicare}';
COMMENT ON COLUMN expected_pay_snapshot.taxable_bases IS 'Computed taxable income bases: {fed, state, oasdi, medicare} in cents';
```

---

## PHASE 2: Library Structure (Server-Side)

### 2.1 Line Item Codes Registry

**File:** `lib/les/codes.ts` (NEW)

```typescript
/**
 * LES LINE ITEM CODES
 * Canonical registry of known LES line codes with metadata
 */

export interface LineCodeDefinition {
  section: 'ALLOWANCE' | 'DEDUCTION' | 'ALLOTMENT' | 'TAX' | 'DEBT' | 'ADJUSTMENT';
  description: string;
  taxability: {
    fed: boolean;      // Federal income tax
    state: boolean;    // State income tax
    oasdi: boolean;    // FICA/Social Security (6.2%)
    medicare: boolean; // Medicare (1.45%)
  };
}

export const LINE_CODES: Record<string, LineCodeDefinition> = {
  // ALLOWANCES (Income)
  BASEPAY: {
    section: 'ALLOWANCE',
    description: 'Base Pay',
    taxability: { fed: true, state: true, oasdi: true, medicare: true }
  },
  BAH: {
    section: 'ALLOWANCE',
    description: 'Basic Allowance for Housing',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },
  BAS: {
    section: 'ALLOWANCE',
    description: 'Basic Allowance for Subsistence',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },
  COLA: {
    section: 'ALLOWANCE',
    description: 'Cost of Living Allowance',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },
  SDAP: {
    section: 'ALLOWANCE',
    description: 'Special Duty Assignment Pay',
    taxability: { fed: true, state: true, oasdi: true, medicare: true }
  },
  HFP: {
    section: 'ALLOWANCE',
    description: 'Hostile Fire Pay / Imminent Danger Pay',
    taxability: { fed: false, state: false, oasdi: true, medicare: true }
  },
  FSA: {
    section: 'ALLOWANCE',
    description: 'Family Separation Allowance',
    taxability: { fed: true, state: true, oasdi: true, medicare: true }
  },
  FLPP: {
    section: 'ALLOWANCE',
    description: 'Foreign Language Proficiency Pay',
    taxability: { fed: true, state: true, oasdi: true, medicare: true }
  },

  // TAXES
  TAX_FED: {
    section: 'TAX',
    description: 'Federal Income Tax',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },
  TAX_STATE: {
    section: 'TAX',
    description: 'State Income Tax',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },
  FICA: {
    section: 'TAX',
    description: 'FICA (Social Security Tax)',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },
  MEDICARE: {
    section: 'TAX',
    description: 'Medicare Tax',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },

  // DEDUCTIONS
  SGLI: {
    section: 'DEDUCTION',
    description: 'SGLI Life Insurance',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },
  DENTAL: {
    section: 'DEDUCTION',
    description: 'Dental Premium',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },
  TSP: {
    section: 'DEDUCTION',
    description: 'Thrift Savings Plan',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },

  // ALLOTMENTS
  ALLOTMENT: {
    section: 'ALLOTMENT',
    description: 'Allotment',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },

  // DEBTS
  DEBT: {
    section: 'DEBT',
    description: 'Debt Payment',
    taxability: { fed: false, state: false, oasdi: false, medicare: false }
  },

  // ADJUSTMENTS
  ADJUSTMENT: {
    section: 'ADJUSTMENT',
    description: 'Pay Adjustment',
    taxability: { fed: true, state: true, oasdi: true, medicare: true } // Usually taxable
  }
};

export function getLineCodeDefinition(code: string): LineCodeDefinition {
  return LINE_CODES[code] || LINE_CODES.ADJUSTMENT; // Default to adjustment
}

export function computeTaxableBases(lines: Array<{code: string; amount_cents: number}>): {
  fed: number;
  state: number;
  oasdi: number;
  medicare: number;
} {
  const bases = { fed: 0, state: 0, oasdi: 0, medicare: 0 };
  
  for (const line of lines) {
    const def = getLineCodeDefinition(line.code);
    if (def.section !== 'ALLOWANCE') continue; // Only allowances count toward taxable income
    
    if (def.taxability.fed) bases.fed += line.amount_cents;
    if (def.taxability.state) bases.state += line.amount_cents;
    if (def.taxability.oasdi) bases.oasdi += line.amount_cents;
    if (def.taxability.medicare) bases.medicare += line.amount_cents;
  }
  
  return bases;
}
```

### 2.2 Expected Pay Computation

**File:** `lib/les/expected.ts` (ENHANCE EXISTING)

Add new export function:

```typescript
/**
 * BUILD EXPECTED PAY SNAPSHOT
 * Computes expected pay values from official tables
 * 
 * @param profile - User profile snapshot
 * @param asOfDate - Date for which to compute (defaults to first of current month)
 * @returns Expected values and taxable bases
 */
export async function buildExpectedSnapshot(profile: {
  paygrade: string;
  yos: number;
  mhaOrZip: string;
  withDependents: boolean;
  specials: {
    sdap?: boolean;
    hfp?: boolean;
    fsa?: boolean;
    flpp?: boolean;
  };
}, asOfDate?: Date): Promise<{
  expected: {
    basepay_cents: number;
    bah_cents: number;
    bas_cents: number;
    cola_cents: number;
    specials: Array<{code: string; cents: number; taxability: any}>;
  };
  taxable_bases: {
    fed: number;
    state: number;
    oasdi: number;
    medicare: number;
  };
}> {
  const date = asOfDate || new Date();
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  
  // Build expected values (reuse existing logic)
  const expected = await buildExpectedPaySnapshot(
    profile.user_id, 
    date.getMonth() + 1, 
    date.getFullYear()
  );

  // Compute taxable bases using codes.ts
  const lines = [
    { code: 'BASEPAY', amount_cents: expected.base_pay_cents || 0 },
    { code: 'BAH', amount_cents: expected.bah_cents || 0 },
    { code: 'BAS', amount_cents: expected.bas_cents || 0 },
    { code: 'COLA', amount_cents: expected.cola_cents || 0 },
    ...(expected.specials || []).map(s => ({ code: s.code, amount_cents: s.cents }))
  ];

  const taxable_bases = computeTaxableBases(lines);

  return {
    expected: {
      basepay_cents: expected.base_pay_cents || 0,
      bah_cents: expected.bah_cents || 0,
      bas_cents: expected.bas_cents || 0,
      cola_cents: expected.cola_cents || 0,
      specials: expected.specials || []
    },
    taxable_bases
  };
}
```

### 2.3 Comparison Engine

**File:** `lib/les/compare.ts` (ENHANCE EXISTING - add these functions)

```typescript
import { getLineCodeDefinition, computeTaxableBases } from './codes';

/**
 * COMPREHENSIVE COMPARISON
 * Compares expected vs actual with detailed validation
 */
export function compareDetailed(params: {
  expected: {
    basepay_cents: number;
    bah_cents: number;
    bas_cents: number;
    cola_cents: number;
    specials: Array<{code: string; cents: number}>;
  };
  taxable_bases: {
    fed: number;
    state: number;
    oasdi: number;
    medicare: number;
  };
  actualLines: Array<{
    code: string;
    amount_cents: number;
    section: string;
  }>;
  netPayCents: number;
}): {
  flags: Array<{
    severity: 'red' | 'yellow' | 'green';
    flag_code: string;
    message: string;
    suggestion: string;
    ref_url?: string;
    delta_cents?: number;
  }>;
  summary: {
    total_allowances: number;
    total_deductions: number;
    total_taxes: number;
    total_allotments: number;
    total_debts: number;
    total_adjustments: number;
    computed_net: number;
    actual_net: number;
    net_delta: number;
  };
  mathProof: string;
} {
  const flags = [];
  
  // Group actual lines by section
  const bySection = {
    ALLOWANCE: actualLines.filter(l => l.section === 'ALLOWANCE'),
    TAX: actualLines.filter(l => l.section === 'TAX'),
    DEDUCTION: actualLines.filter(l => l.section === 'DEDUCTION'),
    ALLOTMENT: actualLines.filter(l => l.section === 'ALLOTMENT'),
    DEBT: actualLines.filter(l => l.section === 'DEBT'),
    ADJUSTMENT: actualLines.filter(l => l.section === 'ADJUSTMENT')
  };

  // Helper to find line
  const findLine = (code: string) => actualLines.find(l => l.code === code);

  // 1. BAH Check
  const actualBAH = findLine('BAH')?.amount_cents || 0;
  const expectedBAH = params.expected.bah_cents;
  if (Math.abs(actualBAH - expectedBAH) > 500) { // $5 threshold
    flags.push({
      severity: 'red',
      flag_code: 'BAH_MISMATCH',
      message: `BAH discrepancy: Expected $${(expectedBAH/100).toFixed(2)}, got $${(actualBAH/100).toFixed(2)}`,
      suggestion: 'Verify your MHA code matches your duty station and dependent status. Contact finance office.',
      delta_cents: expectedBAH - actualBAH,
      ref_url: 'https://www.defensetravel.dod.mil/site/bahCalc.cfm'
    });
  }

  // 2. BAS Check
  const actualBAS = findLine('BAS')?.amount_cents || 0;
  const expectedBAS = params.expected.bas_cents;
  if (actualBAS === 0 && expectedBAS > 0) {
    flags.push({
      severity: 'red',
      flag_code: 'BAS_MISSING',
      message: `BAS missing: Expected $${(expectedBAS/100).toFixed(2)}`,
      suggestion: 'All service members receive BAS. Check your LES or contact finance.',
      delta_cents: expectedBAS
    });
  }

  // 3. FICA Percentage Check
  const actualFICA = findLine('FICA')?.amount_cents || 0;
  const oasdiBase = params.taxable_bases.oasdi;
  if (oasdiBase > 0 && actualFICA > 0) {
    const ficaPercent = (actualFICA / oasdiBase) * 100;
    if (ficaPercent < 6.1 || ficaPercent > 6.3) {
      flags.push({
        severity: 'yellow',
        flag_code: 'FICA_PCT_OUT_OF_RANGE',
        message: `FICA is ${ficaPercent.toFixed(2)}% but should be ~6.2%`,
        suggestion: 'FICA should be 6.2% of taxable pay (excludes BAH/BAS). Verify taxable gross or check for wage base limit.',
        delta_cents: Math.round(oasdiBase * 0.062) - actualFICA
      });
    }
  }

  // 4. Medicare Percentage Check
  const actualMedicare = findLine('MEDICARE')?.amount_cents || 0;
  const medicareBase = params.taxable_bases.medicare;
  if (medicareBase > 0 && actualMedicare > 0) {
    const medicarePercent = (actualMedicare / medicareBase) * 100;
    if (medicarePercent < 1.40 || medicarePercent > 1.50) {
      flags.push({
        severity: 'yellow',
        flag_code: 'MEDICARE_PCT_OUT_OF_RANGE',
        message: `Medicare is ${medicarePercent.toFixed(2)}% but should be ~1.45%`,
        suggestion: 'Medicare should be 1.45% of taxable pay. Verify your LES or contact finance.',
        delta_cents: Math.round(medicareBase * 0.0145) - actualMedicare
      });
    }
  }

  // 5. Net Pay Math Check
  const totalAllowances = bySection.ALLOWANCE.reduce((sum, l) => sum + l.amount_cents, 0);
  const totalTaxes = bySection.TAX.reduce((sum, l) => sum + l.amount_cents, 0);
  const totalDeductions = bySection.DEDUCTION.reduce((sum, l) => sum + l.amount_cents, 0);
  const totalAllotments = bySection.ALLOTMENT.reduce((sum, l) => sum + l.amount_cents, 0);
  const totalDebts = bySection.DEBT.reduce((sum, l) => sum + l.amount_cents, 0);
  const totalAdjustments = bySection.ADJUSTMENT.reduce((sum, l) => sum + l.amount_cents, 0);

  const computedNet = totalAllowances - totalTaxes - totalDeductions - totalAllotments - totalDebts + totalAdjustments;
  const netDelta = Math.abs(computedNet - params.netPayCents);

  if (netDelta > 100) { // $1 threshold
    flags.push({
      severity: 'red',
      flag_code: 'NET_MATH_MISMATCH',
      message: `Net pay math doesn't balance: Expected $${(computedNet/100).toFixed(2)}, got $${(params.netPayCents/100).toFixed(2)}`,
      suggestion: 'Review all line items for data entry errors. Net = Allowances - Taxes - Deductions - Allotments - Debts + Adjustments',
      delta_cents: computedNet - params.netPayCents
    });
  }

  // 6. Green flag if no issues
  if (flags.length === 0) {
    flags.push({
      severity: 'green',
      flag_code: 'ALL_VERIFIED',
      message: 'Paycheck verified! All allowances match expected values and math checks out.',
      suggestion: 'No action needed. Your pay is correct.'
    });
  }

  const summary = {
    total_allowances: totalAllowances,
    total_deductions: totalDeductions,
    total_taxes: totalTaxes,
    total_allotments: totalAllotments,
    total_debts: totalDebts,
    total_adjustments: totalAdjustments,
    computed_net: computedNet,
    actual_net: params.netPayCents,
    net_delta: netDelta
  };

  const mathProof = `
Allowances:    $${(totalAllowances/100).toFixed(2)}
- Taxes:       $${(totalTaxes/100).toFixed(2)}
- Deductions:  $${(totalDeductions/100).toFixed(2)}
- Allotments:  $${(totalAllotments/100).toFixed(2)}
- Debts:       $${(totalDebts/100).toFixed(2)}
+ Adjustments: $${(totalAdjustments/100).toFixed(2)}
= Net Pay:     $${(computedNet/100).toFixed(2)} (${netDelta <= 100 ? '✓' : '✗'})
  `.trim();

  return { flags, summary, mathProof };
}
```

---

## PHASE 3: Enhanced API Endpoints

### 3.1 Comprehensive Audit Endpoint

**File:** `app/api/les/audit/route.ts` (ENHANCE EXISTING)

Modify POST handler to use new comparison logic:

```typescript
import { buildExpectedSnapshot, compareDetailed } from '@/lib/les/compare';
import { getLineCodeDefinition } from '@/lib/les/codes';

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { month, year, profile, actual, net_pay_cents } = body;

  // Create audit record
  const { data: upload } = await supabase
    .from('les_uploads')
    .insert({
      user_id: user.id,
      entry_type: 'manual',
      month,
      year,
      profile_snapshot: profile,
      audit_status: 'draft'
    })
    .select()
    .single();

  // Insert actual lines with proper section and taxability
  const lines = [
    ...actual.allowances.map(a => ({
      ...a,
      upload_id: upload.id,
      section: 'ALLOWANCE',
      taxability: getLineCodeDefinition(a.code).taxability
    })),
    ...actual.taxes.map(t => ({
      ...t,
      upload_id: upload.id,
      section: 'TAX',
      taxability: { fed: false, state: false, oasdi: false, medicare: false }
    })),
    ...actual.deductions.map(d => ({
      ...d,
      upload_id: upload.id,
      section: 'DEDUCTION',
      taxability: { fed: false, state: false, oasdi: false, medicare: false }
    })),
    ...(actual.allotments || []).map(a => ({
      ...a,
      upload_id: upload.id,
      section: 'ALLOTMENT',
      taxability: { fed: false, state: false, oasdi: false, medicare: false }
    }))
  ];

  await supabase.from('les_lines').insert(lines);

  // Build expected values
  const { expected, taxable_bases } = await buildExpectedSnapshot(profile);

  // Save expected snapshot
  await supabase.from('expected_pay_snapshot').insert({
    audit_id: upload.id,
    expected,
    taxable_bases
  });

  // Run comparison
  const { flags, summary, mathProof } = compareDetailed({
    expected,
    taxable_bases,
    actualLines: lines,
    netPayCents: net_pay_cents
  });

  // Save flags
  await supabase.from('pay_flags').insert(
    flags.map(f => ({ ...f, upload_id: upload.id }))
  );

  return NextResponse.json({ summary, flags, mathProof, expected });
}
```

### 3.2-3.6: History Management APIs

(Keep all 5 API routes from original plan: detail, delete, clone, export, search)

---

## PHASE 4: Enhanced Manual Entry UI

### 4.1 Improve Existing Manual Entry

**File:** `app/components/les/LesManualEntryTabbed.tsx` (ENHANCE)

Add:

- Profile snapshot capture (paygrade, yos, mha, dependents, specials)
- Expected values shown next to each input
- Section-based organization (Allowances, Taxes, Deductions, Allotments)
- Real-time taxable base calculation display
- "What counts as taxable?" explainer

### 4.2 New Results Component

**File:** `app/components/les/LesResults.tsx` (NEW)

- Large verdict card (green/yellow/red based on worst flag)
- Flag list with severity badges
- "Copy to clipboard" for each suggestion
- Collapsible math proof section
- Delta highlighting
- Next steps CTA

---

## PHASE 5: History Features

(Keep all from original plan)

### 5.1 Audit Detail Page

**File:** `app/dashboard/paycheck-audit/[id]/page.tsx` (NEW)

### 5.2 Comparison Page

**File:** `app/dashboard/paycheck-audit/compare/page.tsx` (NEW)

### 5.3 Enhanced History List

**File:** `app/dashboard/paycheck-audit/PaycheckAuditClient.tsx` (MODIFY)

Add search, filter, delete buttons, clickable items

---

## PHASE 6: Testing & Fixtures

### 6.1 Test Fixtures

**Files:** `lib/les/fixtures/` (NEW)

- `happy_path_e5_fthood.json` - Perfect audit, all green
- `bah_missing_e6_pcs.json` - Missing BAH after PCS
- `fica_pct_warning.json` - FICA percentage out of range

### 6.2 Unit Tests

**File:** `__tests__/lib/les/compare.test.ts` (NEW)

Test:

- BAH mismatch detection
- BAS missing detection
- FICA percentage validation
- Medicare percentage validation
- Net pay math validation
- Green path (no issues)

---

## Implementation Order

1. Database migration (enhance existing tables)
2. Library structure (codes.ts, enhanced expected.ts, enhanced compare.ts)
3. Enhanced audit API endpoint
4. History management APIs (5 routes)
5. Enhanced manual entry UI
6. New results component
7. Audit detail page
8. Comparison page
9. Test fixtures and unit tests
10. Integration testing

---

## Files to Create

**New Files (20):**

- `supabase-migrations/20251023_les_auditor_enhancements.sql`
- `lib/les/codes.ts`
- `lib/les/fixtures/happy_path_e5_fthood.json`
- `lib/les/fixtures/bah_missing_e6_pcs.json`
- `lib/les/fixtures/fica_pct_warning.json`
- `app/api/les/audit/[id]/route.ts`
- `app/api/les/audit/[id]/delete/route.ts`
- `app/api/les/audit/[id]/clone/route.ts`
- `app/api/les/audit/[id]/export/route.ts`
- `app/api/les/audit/search/route.ts`
- `app/dashboard/paycheck-audit/[id]/page.tsx`
- `app/dashboard/paycheck-audit/[id]/AuditDetailClient.tsx`
- `app/dashboard/paycheck-audit/compare/page.tsx`
- `app/dashboard/paycheck-audit/compare/ComparisonClient.tsx`
- `app/components/les/LesResults.tsx`
- `app/components/les/FlagCard.tsx`
- `app/components/les/PayBreakdownTable.tsx`
- `app/components/les/MathProof.tsx`
- `__tests__/lib/les/codes.test.ts`
- `__tests__/lib/les/compare.test.ts`

**Modified Files (5):**

- `lib/les/expected.ts` (add buildExpectedSnapshot export)
- `lib/les/compare.ts` (add compareDetailed function)
- `app/api/les/audit/route.ts` (use new comparison logic)
- `app/components/les/LesManualEntryTabbed.tsx` (enhance UI)
- `app/dashboard/paycheck-audit/PaycheckAuditClient.tsx` (add history features)
- `package.json` (add jsPDF)

---

## Backward Compatibility

- Existing les_uploads records work unchanged
- New columns have defaults and are nullable
- Existing pay_flags records work unchanged
- RLS policies enhanced, not replaced
- Trigger backfills flag counts for existing audits
- Section backfill handles existing les_lines

---

## Key Differences from Original Spec

1. **Reuse existing tables** (les_uploads, not paycheck_audits) for backward compatibility
2. **Enhance not replace** - add columns to existing schema
3. **Keep file upload support** - entry_type column differentiates manual vs upload
4. **Maintain all existing RLS policies** - just enhance them
5. **Add history features** not in original spec (view, delete, compare, export)

---

## Testing Checklist

Manual Entry & Validation:

- [ ] Enter E5 @ Fort Hood with deps → all expected values auto-fill correctly
- [ ] Enter actual values matching expected → GREEN verdict
- [ ] Enter BAH $100 too low → RED flag with delta and suggestion
- [ ] Enter FICA at 4% → YELLOW flag about percentage
- [ ] Math doesn't balance → RED flag with breakdown

History Features:

- [ ] View audit detail page → all data displays
- [ ] Delete audit → soft deletes, disappears from list
- [ ] Re-audit → clones to new manual entry
- [ ] Compare two months → shows differences
- [ ] Export PDF → downloads correctly
- [ ] Search/filter → works as expected

Data Integrity:

- [ ] Trigger auto-updates flag counts
- [ ] RLS policies enforce user isolation
- [ ] Taxable bases compute correctly
- [ ] Section categorization works

### To-dos

- [ ] Create and apply database migration to enhance existing tables
- [ ] Create lib/les/codes.ts with line code registry and taxability logic
- [ ] Enhance lib/les/expected.ts with buildExpectedSnapshot export
- [ ] Enhance lib/les/compare.ts with compareDetailed function
- [ ] Enhance audit API to use new comparison logic
- [ ] Create 5 history management API routes (detail, delete, clone, export, search)
- [ ] Enhance manual entry UI with profile snapshot and taxable base display
- [ ] Create new LesResults component with verdict, flags, math proof
- [ ] Create audit detail page with full view and actions
- [ ] Create month-to-month comparison page
- [ ] Enhance history list with search, filter, delete
- [ ] Create test fixtures for happy path and error scenarios
- [ ] Write unit tests for codes, expected, and compare functions
- [ ] Test entire flow end-to-end with real data
<!-- 88f3ec67-6b10-45cb-be65-9946951e1ffe 85f149ed-d72a-4fca-bbda-313bddc9f52f -->
# LES Auditor - Always-On Audit with Server-Side Paywall

## Overview

Major UX/Architecture refactor: Remove "Run Audit" button, implement real-time always-on audit with split-panel UI, add proper server-side paywall with masking for free users.

---

## Phase 1: Subscription & Tier Infrastructure

### Create Tier System

**File: `lib/auth/subscription.ts` (NEW)**

```typescript
export type Tier = 'free' | 'premium' | 'staff';

export async function getUserTier(userId: string): Promise<Tier> {
  // Check user_profiles or stripe_subscriptions table
  const { data } = await supabase
    .from('user_profiles')
    .select('subscription_tier')
    .eq('user_id', userId)
    .single();
  
  return data?.subscription_tier || 'free';
}

export function getLesAuditPolicy(tier: Tier) {
  return {
    monthlyQuota: tier === 'premium' ? Infinity : 1,
    maxVisibleFlags: tier === 'premium' ? Infinity : 2,
    showExactVariance: tier !== 'free',
    showWaterfall: tier === 'premium',
    allowPdf: tier === 'premium',
    allowHistory: tier === 'premium',
    allowCopyTemplates: tier === 'premium'
  };
}
```

### Update Database Schema

**Migration:** Add `subscription_tier` to `user_profiles` if not exists

**Migration:** Update `api_quota` to support monthly scopes

---

## Phase 2: Pure Business Logic (Client + Server Reusable)

### Make Comparison Pure

**File: `lib/les/compute.ts` (NEW - extracted from compare.ts)**

```typescript
/**
 * Pure computation - no I/O, can run client-side or server-side
 */
export function computeLesAudit(params: {
  expected: ExpectedSnapshot;
  actual: ActualEntry;
}): {
  flags: PayFlag[];
  totals: {
    expected_net: number;
    actual_net: number;
    variance: number;
    varianceBucket: '0-5' | '5-50' | '>50';
  };
  waterfall: WaterfallRow[];
  confidence: 'high' | 'medium' | 'low';
} {
  // Move compareDetailed logic here
  // Make it pure (no database calls)
  // Return structured result
}
```

### Policy Masking

**File: `lib/les/paywall.ts` (NEW)**

```typescript
export function applyAuditMasking(
  fullResult: AuditResult,
  policy: ReturnType<typeof getLesAuditPolicy>
): MaskedAuditResult {
  return {
    flags: fullResult.flags.slice(0, policy.maxVisibleFlags),
    hiddenFlagCount: Math.max(0, fullResult.flags.length - policy.maxVisibleFlags),
    totals: {
      expected_net: policy.showExactVariance ? fullResult.totals.expected_net : null,
      actual_net: fullResult.totals.actual_net,
      variance: policy.showExactVariance ? fullResult.totals.variance : null,
      varianceBucket: fullResult.totals.varianceBucket // Always show bucket
    },
    waterfall: policy.showWaterfall ? fullResult.waterfall : [],
    confidence: fullResult.confidence,
    pdfUrl: null, // Never in compute response
    requiresUpgrade: !policy.showExactVariance
  };
}
```

---

## Phase 3: New API Routes

### Compute Endpoint (Real-Time)

**File: `app/api/les/audit/compute/route.ts` (NEW)**

```typescript
export async function POST(req: NextRequest) {
  // 1. Auth
  const { userId } = await auth();
  if (!userId) return 401;
  
  // 2. Get tier
  const tier = await getUserTier(userId);
  const policy = getLesAuditPolicy(tier);
  
  // 3. Parse request
  const { month, year, profile, actual } = await req.json();
  
  // 4. Build expected (server-only - uses DFAS tables)
  const expected = await buildExpectedSnapshot(profile, { month, year });
  
  // 5. Compute comparison (pure function)
  const fullResult = computeLesAudit({ expected, actual });
  
  // 6. Apply masking based on tier
  const masked = applyAuditMasking(fullResult, policy);
  
  // 7. Analytics (sampled for free users)
  if (tier === 'premium' || Math.random() < 0.1) {
    await analytics.track('les_auto_audit_compute', { tier, flagCount: fullResult.flags.length });
  }
  
  return NextResponse.json(masked);
}
```

### Save & PDF Endpoint (Premium Only)

**File: `app/api/les/audit/save/route.ts` (NEW)**

```typescript
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return 401;
  
  const tier = await getUserTier(userId);
  const policy = getLesAuditPolicy(tier);
  
  // Check quota (monthly for free, unlimited for premium)
  const { allowed } = await checkMonthlyQuota(userId, 'les_audit', policy.monthlyQuota);
  if (!allowed) {
    return NextResponse.json(
      { 
        error: 'PAYWALL',
        requiresUpgrade: true,
        feature: 'les_audit',
        quota: { period: 'month', limit: policy.monthlyQuota, used: policy.monthlyQuota }
      },
      { status: 402 }
    );
  }
  
  // Premium-only features
  if (!policy.allowPdf) {
    return NextResponse.json(
      { error: 'PAYWALL', requiresUpgrade: true, feature: 'pdf_export' },
      { status: 402 }
    );
  }
  
  // Persist audit
  const auditId = await persistAudit({ userId, month, year, expected, actual, flags });
  
  // Generate PDF
  const pdfUrl = await generateAuditPDF(auditId);
  
  return NextResponse.json({ auditId, pdfUrl, saved: true });
}
```

---

## Phase 4: UI Component Refactor

### New Component Structure

```
LesAuditPage (container)
├── LesInputPanel (left - collapsible groups)
│   ├── MonthYearPicker
│   ├── EntitlementsGroup (4/4 complete)
│   ├── DeductionsGroup (3/3 complete)
│   └── TaxesGroup (4/4 complete)
└── LesReportPanel (right - always visible)
    ├── SummaryHeader (Expected, Actual, Variance)
    ├── ConfidenceBadge (High/Medium/Low)
    ├── FlagList (prioritized, with premium curtain)
    ├── VarianceWaterfall (premium only, blurred for free)
    └── ActionBar (Save PDF, Start New Month)
```

### Real-Time Computation Hook

**File: `app/hooks/useLesAudit.ts` (NEW)**

```typescript
export function useLesAudit(inputs: AuditInputs) {
  const [result, setResult] = useState<MaskedAuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Debounced computation
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!inputs.month || !inputs.year) return;
      
      setLoading(true);
      const response = await fetch('/api/les/audit/compute', {
        method: 'POST',
        body: JSON.stringify(inputs)
      });
      
      const data = await response.json();
      setResult(data);
      setLoading(false);
    }, 400); // 400ms debounce
    
    return () => clearTimeout(timer);
  }, [inputs]);
  
  return { result, loading };
}
```

### Premium Curtain Component

**File: `app/components/paywall/PremiumCurtain.tsx` (NEW)**

```typescript
export function PremiumCurtain({ 
  children, 
  feature, 
  tier,
  hiddenCount 
}: Props) {
  if (tier === 'premium') return children;
  
  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/90">
        <div className="text-center p-6 max-w-md">
          <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2">
            {hiddenCount} More Findings Locked
          </h3>
          <p className="text-gray-600 mb-4">
            Upgrade to see exact amounts, all flags, and export to PDF
          </p>
          <button className="btn-primary">
            Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Phase 5: Remove Old Flow

### Files to Refactor/Delete

- **Refactor:** `app/dashboard/paycheck-audit/PaycheckAuditClient.tsx`
        - Remove tabs, replace with split panel
        - Remove "Run Complete Audit" button
        - Add debounced auto-computation

- **Delete:** Old audit trigger logic
- **Keep:** History panel (but gate behind premium)

---

## Phase 6: Analytics & Monitoring

### New Events

```typescript
// Real-time computation
'les_auto_audit_compute' - { tier, flagCount, hiddenCount, duration_ms }

// Paywall interactions
'paywall_impression' - { feature: 'les_audit', tier, where }
'paywall_cta_click' - { feature, tier, hiddenCount }
'paywall_block_402' - { feature, tier, quota }

// Conversions
'les_audit_save_pdf' - { tier, flagCount, variance }
'upgrade_from_les_audit' - { tier: 'free', hiddenCount }
```

---

## Phase 7: Documentation Updates

### Update Review Packet

**File: `review/les-auditor/LES_Auditor_Review_Packet.md`**

- Add "Always-On Audit" section
- Document tier policies
- Update API contract for `/compute` and `/save` endpoints
- Add paywall enforcement details

### Update OpenAPI Spec

- Add `POST /api/les/audit/compute` endpoint
- Add `POST /api/les/audit/save` endpoint
- Document 402 PAYWALL response
- Add tier policy schemas

---

## Implementation Order

1. Create `lib/auth/subscription.ts` (tier checking)
2. Create `lib/les/compute.ts` (pure business logic)
3. Create `lib/les/paywall.ts` (masking logic)
4. Create `POST /api/les/audit/compute` (real-time endpoint)
5. Create `POST /api/les/audit/save` (PDF generation)
6. Create `useLesAudit` hook (debounced computation)
7. Create `PremiumCurtain` component
8. Refactor `PaycheckAuditClient` (split panel UI)
9. Update analytics events
10. Update documentation

---

## Acceptance Criteria

**Free User Experience:**

- ✅ Can enter data and see audit compute in real-time
- ✅ Sees variance bucket (">$50 red") but not exact amount
- ✅ Sees top 2 flags only, "+5 more locked" chip
- ✅ Waterfall blurred with upgrade CTA
- ✅ Cannot save PDF or view history
- ✅ Receives 402 PAYWALL when quota exceeded

**Premium User Experience:**

- ✅ Sees exact variance dollar amounts
- ✅ Sees all flags with full details
- ✅ Can save audit and generate PDF
- ✅ Can view full history
- ✅ Unlimited audits per month

**Technical:**

- ✅ No exact values leaked to free users (server-side masking)
- ✅ Pure computation functions (testable, reusable)
- ✅ Debounced real-time updates (400ms)
- ✅ Analytics tracking paywall interactions

### To-dos

- [ ] Global search/replace uploadId → auditId across all files
- [ ] Add LineItem.code enum to OpenAPI and server validation
- [ ] Implement 50/day rate limit on POST /les/audit
- [ ] Write unit tests for codes.ts and compare.ts
- [ ] Create fixture test runner and save outputs to runs/
- [ ] Add helper text, data freshness badges, math proof
- [ ] Create GET /api/les/data-freshness endpoint
- [ ] Run RLS smoke test and save output
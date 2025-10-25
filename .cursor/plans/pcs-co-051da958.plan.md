<!-- 051da958-9aa2-4058-97d4-630083f26d6c b68d3961-4bc4-446f-85f5-a4f860fbfeea -->
# PCS Copilot Comprehensive Transformation Plan

## Executive Summary

Transform PCS Copilot from current basic state to **LES Auditor-level excellence** with:

- **Manual-first data entry** (safer, more accurate than OCR)
- **Real-time validation** with JTR rules
- **API integration** for live JTR rates
- **Full RAG AI integration** (embedded help + personalized advice)
- **Mobile-optimized** manual entry experience
- **100% data accuracy** with official sources

---

## Current State Assessment

### What Exists (✅ Foundation Complete)

1. **Database Schema** - 7 tables with RLS (pcs_claims, pcs_claim_documents, pcs_claim_items, pcs_claim_checks, pcs_entitlement_snapshots, jtr_rules, pcs_analytics)
2. **Basic UI** - Claims list, claim detail page, upload modal
3. **API Endpoints** - claim CRUD, estimate, check, upload, package
4. **JTR Rules** - 10 seeded rules in database
5. **Calculation Engine** - DLA, TLE, MALT, Per Diem, PPM logic
6. **Premium Gating** - Free users see paywall

### Critical Gaps vs LES Auditor Standard

1. **❌ No manual entry system** - Currently relies on OCR only
2. **❌ No real-time validation** - Checks only run on demand
3. **❌ No smart auto-population** - Missing BAH/DLA lookup from profile
4. **❌ No AI explanations** - No Gemini-powered guidance for errors
5. **❌ No provenance tracking** - Missing data source transparency
6. **❌ Limited JTR coverage** - Only 10 rules (need 50+)
7. **❌ No mobile optimization** - Desktop-first design
8. **❌ No RAG integration** - Missing Ask Assistant connection
9. **❌ No admin dashboard** - Can't monitor usage/accuracy
10. **❌ No testing suite** - No validation test harness

---

## Strategic Decisions (Based on User Input)

### 1. Manual Entry vs OCR (✅ Manual Primary)

**Decision:** Manual entry as primary input method

**Rationale:**

- **Accuracy:** LES Auditor shows manual entry achieves 99%+ accuracy
- **Cost:** $0 vs $0.0001-0.002 per document for OCR
- **User Control:** Service members verify as they type
- **Speed:** Pre-filled fields faster than OCR correction
- **Trust:** Military audience prefers control over automation

**Implementation:**

- Build comprehensive manual entry forms (similar to LES Auditor)
- Pre-populate from user profile (rank, dependents, bases)
- Auto-calculate entitlements with JTR formulas
- Optional: Keep OCR as "Extract from Photo" helper (Phase 2)

### 2. RAG AI Integration (✅ All Four Levels)

**Decision:** Full integration across all touchpoints

**Four Integration Points:**

1. **Embedded Help Widget** - Contextual PCS questions within interface
2. **Deep Data Integration** - Ask Assistant queries user's claim data
3. **Quick Templates** - Pre-filled questions ("How much is my DLA?")
4. **Smart Recommendations** - Proactive suggestions based on claim status

### 3. Mobile Strategy (✅ Equal Priority)

**Decision:** Mobile-first manual entry with desktop parity

**Mobile UX:**

- Large touch targets (44px minimum)
- Numeric keyboards for dollar inputs
- Progressive disclosure (one section at a time)
- Sticky save button
- Optimistic UI updates

**Desktop UX:**

- Split-panel design (input left, preview right)
- Keyboard shortcuts
- Bulk import from CSV
- Multi-tab support

### 4. JTR Data Management (✅ API + Admin)

**Decision:** Hybrid approach - API scraping + admin oversight

**JTR Rate Sources:**

1. **Defense Travel Management Office (DTMO)** - Per diem rates
2. **DFAS** - DLA rates, MALT rates
3. **Joint Travel Regulations PDF** - Full rule text (quarterly scrape)
4. **Admin Override** - Manual correction if API fails

**Update Cadence:**

- **Daily:** Per diem rates (API)
- **Weekly:** MALT/DLA verification (API)
- **Quarterly:** Full JTR rule refresh (manual review)
- **Annually:** Major JTR revision (full audit)

---

## Phase 1: Manual Entry Foundation (Weeks 1-2)

### 1.1 Database Enhancements

**New Tables:**

```sql
-- JTR rate cache with provenance
CREATE TABLE jtr_rates_cache (
  id UUID PRIMARY KEY,
  rate_type TEXT, -- 'per_diem', 'dla', 'malt', 'tle'
  effective_date DATE,
  expiration_date DATE,
  rate_data JSONB,
  source_url TEXT,
  last_verified TIMESTAMPTZ,
  verification_status TEXT
);

-- Claim templates for common PCS types
CREATE TABLE pcs_claim_templates (
  id UUID PRIMARY KEY,
  template_name TEXT,
  description TEXT,
  scenario JSONB, -- Common PCS scenario
  default_items JSONB -- Pre-filled line items
);

-- Manual entry audit trail
CREATE TABLE pcs_manual_entry_log (
  id UUID PRIMARY KEY,
  claim_id UUID,
  user_id TEXT,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  change_reason TEXT,
  changed_at TIMESTAMPTZ
);
```

**Schema Modifications:**

- Add `entry_method` to pcs_claims ('manual', 'ocr', 'imported')
- Add `validation_status` to pcs_claim_items ('valid', 'warning', 'error')
- Add `confidence_scores` JSONB to pcs_entitlement_snapshots
- Add `jtr_rule_version` to track which rules were used

### 1.2 Manual Entry UI Components

**Split-Panel Interface (Desktop):**

```
┌─────────────────────────────────────────────────────┐
│  LEFT PANEL (Input)       │  RIGHT PANEL (Preview)  │
│  ─────────────────────    │  ─────────────────────  │
│  ✓ Basic Info             │  📊 Live Estimates      │
│  ✓ Travel Details         │  ⚠️  Validation Flags   │
│  ✓ Lodging Expenses       │  💰 Total Estimate      │
│  ✓ Travel Costs           │  📋 JTR Citations       │
│  ✓ Weight & Distance      │  🎯 Readiness Score     │
│  ─────────────────────    │  ─────────────────────  │
│  [Save Draft] [Continue]  │  [Export PDF]           │
└─────────────────────────────────────────────────────┘
```

**Mobile Wizard Flow:**

```
Step 1: Basic Info
  ├─ PCS Orders Date
  ├─ Departure/Arrival Dates
  ├─ Origin → Destination
  └─ [Next: Travel Method]

Step 2: Travel Method
  ├─ PPM / Government / Mixed
  ├─ Dependents Traveling
  ├─ Weight Estimate
  └─ [Next: Lodging]

Step 3: Lodging (TLE)
  ├─ Origin Nights
  ├─ Destination Nights
  ├─ Daily Rate
  └─ [Next: Travel Costs]

Step 4: Travel Costs
  ├─ MALT Distance (auto)
  ├─ Per Diem Days (auto)
  ├─ Fuel Receipts
  └─ [Next: Review]

Step 5: Review & Submit
  ├─ Estimated Total
  ├─ Validation Status
  └─ [Submit Claim]
```

**Key UI Features:**

- **Auto-population** from user profile (rank, branch, dependents, current base)
- **Smart defaults** (calculate distance, estimate per diem days)
- **Inline validation** (red border + error message)
- **Real-time calculation** (update totals as user types)
- **Progress indicator** (5/10 fields complete)
- **Save draft** (auto-save every 30 seconds)
- **JTR tooltips** (hover to see rule citation)

### 1.3 Smart Auto-Population

**Profile-Driven Pre-Fill:**

```typescript
// When user creates claim, auto-populate:
{
  rank_at_pcs: userProfile.rank,
  branch: userProfile.branch,
  origin_base: userProfile.current_base,
  dependents_count: userProfile.num_children || 0,
  
  // Auto-calculate DLA from rank + dependents
  dla_estimate: getDLARate(rank, hasDependents),
  
  // Estimate MALT from base locations
  estimated_distance: calculateDistance(origin, destination),
  estimated_malt: distance * 0.18,
  
  // Estimate per diem from travel days
  estimated_per_diem: travelDays * getPerDiemRate(zipCode)
}
```

**Intelligent Defaults:**

- TLE days: 5 (origin) + 5 (destination)
- Travel days: Math.ceil(distance / 350 miles)
- Weight allowance: JTR table lookup by rank
- PPM payment: 95% of GCC estimate

### 1.4 Real-Time Validation Engine

**Validation Layers:**

**Layer 1: Field-Level (Instant)**

```typescript
// As user types
- PCS orders date must be within 6 months
- Departure < Arrival (date logic)
- TLE days ≤ 10 per location
- Weight ≤ authorized allowance
- Lodging rate ≤ locality max
```

**Layer 2: Cross-Field (On blur)**

```typescript
// When user leaves section
- Travel days match departure/arrival span
- Per diem days = travel days + TLE days
- MALT distance matches origin/destination
- Total receipts ≤ authorized amounts
```

**Layer 3: JTR Compliance (On save)**

```typescript
// Before saving claim
- All required documents flagged if missing
- Duplicate detection (same vendor/date/amount)
- Dates within PCS window (orders ±10 days)
- Rate compliance (not exceeding JTR max)
```

**Validation UI:**

```
┌─────────────────────────────────────────┐
│ ⚠️  3 Warnings Found                    │
├─────────────────────────────────────────┤
│ 🔴 CRITICAL                             │
│ • Missing PCS orders date               │
│   → Required for all claims             │
│                                         │
│ 🟡 WARNING                              │
│ • TLE at origin: 12 days (max 10)      │
│   → Excess 2 days not reimbursable     │
│ • Lodging rate $187 exceeds locality   │
│   max of $165 for ZIP 98433            │
│                                         │
│ 💡 Need help fixing these?              │
│ [Ask Military Expert] [JTR Citation]   │
└─────────────────────────────────────────┘
```

---

## Phase 2: JTR Intelligence & Accuracy (Weeks 3-4)

### 2.1 JTR API Integration

**Data Sources to Integrate:**

**1. DTMO Per Diem API**

```typescript
// https://www.defensetravel.dod.mil/site/perdiemCalc.cfm
interface PerDiemRate {
  zipCode: string;
  city: string;
  state: string;
  effectiveDate: string;
  lodgingRate: number; // Max lodging
  mealRate: number; // M&IE
  totalRate: number; // Lodging + M&IE
}

// Update frequency: Daily
// Cache TTL: 24 hours
// Fallback: Standard CONUS ($166/day)
```

**2. DFAS Pay Tables API**

```typescript
// DLA rates by rank
interface DLARate {
  payGrade: string; // E1-E9, O1-O10
  withDependents: boolean;
  amount: number;
  effectiveDate: string;
  citation: string; // JTR 050302.B
}

// Update frequency: Annually (January)
// Cache TTL: 1 year
// Fallback: Last known rates
```

**3. MALT Rate Tracking**

```typescript
// Current IRS mileage rate
interface MALTRate {
  ratePerMile: number; // $0.67 (2025)
  effectiveDate: string;
  source: 'IRS' | 'DoD';
  citation: string;
}

// Update frequency: Annually (January)
// Cache TTL: 1 year
// Verification: Cross-check IRS.gov
```

**4. Weight Allowance Tables**

```typescript
interface WeightAllowance {
  payGrade: string;
  withDependents: boolean;
  maxWeight: number; // pounds
  proGearWeight: number; // additional
  citation: string; // JTR 054703
}

// Update frequency: Rarely (JTR revisions)
// Cache TTL: Indefinite
// Manual review: Quarterly
```

### 2.2 JTR Rules Expansion

**Expand from 10 → 50+ Rules:**

**Core Entitlements (Priority 1):**

- ✅ DLA (Dislocation Allowance)
- ✅ TLE (Temporary Lodging Expense)
- ✅ MALT (Mileage Allowance)
- ✅ Per Diem (M&IE)
- ✅ PPM (Personally Procured Move)
- 🆕 AOP (Advance Operating Allowance)
- 🆕 HHT (House Hunting Trip)
- 🆕 SIT (Storage in Transit)
- 🆕 NTS (Non-Temporary Storage)
- 🆕 Mobile Home Transport

**Travel Allowances (Priority 2):**

- 🆕 POV Transport (Ship car)
- 🆕 Pet Transport
- 🆕 Trailer Transport
- 🆕 Dependent Travel Separate
- 🆕 En Route Travel Days

**Dependent Allowances (Priority 3):**

- 🆕 Dependent Per Diem
- 🆕 Dependent Lodging
- 🆕 Dependent MALT
- 🆕 Unaccompanied Baggage

**Special Circumstances (Priority 4):**

- 🆕 OCONUS to CONUS variations
- 🆕 Overseas Housing Allowance (OHA)
- 🆕 Living Quarters Allowance (LQA)
- 🆕 Alaska/Hawaii COLA
- 🆕 Post Allowance

### 2.3 Calculation Engine Enhancements

**Enhance lib/pcs/jtr-rules.ts:**

```typescript
// Current: Basic DLA lookup
export function getDLARate(rank: string, hasDependents: boolean) {
  // Simple lookup
}

// Enhanced: Version-aware with provenance
export function getDLARate(
  rank: string, 
  hasDependents: boolean,
  effectiveDate: Date,
  options?: { includeProvenance: boolean }
) {
  // 1. Get rate for specific date (handle JTR changes)
  const rate = getRateForDate('dla', rank, effectiveDate);
  
  // 2. Apply dependent multiplier
  const multiplier = hasDependents ? 2 : 1;
  const amount = rate.baseAmount * multiplier;
  
  // 3. Return with provenance
  return {
    amount,
    rateUsed: rate.baseAmount,
    multiplier,
    effectiveDate: rate.effectiveDate,
    citation: rate.citation,
    source: rate.source,
    lastVerified: rate.lastVerified,
    confidence: rate.verificationStatus === 'verified' ? 100 : 80
  };
}
```

**Add Confidence Scoring:**

```typescript
interface ConfidenceScore {
  overall: number; // 0-100
  factors: {
    hasOrders: boolean; // +20 points
    hasWeighTickets: boolean; // +20 points
    datesVerified: boolean; // +15 points
    ratesFromAPI: boolean; // +15 points
    distanceVerified: boolean; // +15 points
    receiptsComplete: boolean; // +15 points
  };
  level: 'excellent' | 'good' | 'fair' | 'needs_work';
  recommendations: string[];
}
```

### 2.4 Data Provenance Tracking

**Provenance Popover (Like Base Navigator):**

```
┌─────────────────────────────────────────┐
│ 📊 Data Source: DLA Rate                │
├─────────────────────────────────────────┤
│ Amount: $2,469                          │
│ Effective: Jan 1, 2025                  │
│ Source: DFAS Pay Tables API             │
│ Last Verified: 2 hours ago              │
│ Cache TTL: 365 days                     │
│                                         │
│ Citation: JTR 050302.B                  │
│ → E5-E6 with dependents                 │
│                                         │
│ [View Official Source ↗]                │
└─────────────────────────────────────────┘
```

**Implementation:**

- Add `data_sources` JSONB field to pcs_entitlement_snapshots
- Track every rate used in calculation
- Link to official source URLs
- Show last verification timestamp
- Flag stale data (>30 days for critical rates)

---

## Phase 3: AI-Powered Intelligence (Weeks 5-6)

### 3.1 RAG AI Integration (Level 1: Embedded Help)

**Context-Aware Help Widget:**

```
┌─────────────────────────────────────────┐
│ 💬 PCS Questions?                       │
├─────────────────────────────────────────┤
│ Quick answers based on your claim:     │
│                                         │
│ • "What's my DLA for E-5 w/ family?"   │
│ • "How many TLE days can I claim?"     │
│ • "What's reimbursable for lodging?"   │
│ • "Do I need receipts for per diem?"   │
│                                         │
│ [Ask Custom Question]                   │
└─────────────────────────────────────────┘
```

**Location:** Sticky bottom-right corner, expandable

**Context Passed to Ask Assistant:**

```typescript
const claimContext = {
  rank: 'E-5',
  branch: 'Army',
  hasDependents: true,
  pcsType: 'CONUS to CONUS',
  distance: 2500,
  currentSection: 'lodging' // What user is working on
};

// Ask Assistant uses context for personalized answers
```

### 3.2 RAG AI Integration (Level 2: Deep Data Access)

**Allow Ask Assistant to Query Claim Data:**

**New API Endpoint:**

```typescript
// /api/ask/pcs-context
// Returns sanitized claim data for AI context

export async function GET(req: Request) {
  const { userId } = await auth();
  
  // Get active claim
  const claim = await getActivePCSClaim(userId);
  
  // Sanitize and return context
  return {
    claimId: claim.id,
    pcsType: claim.travel_method,
    rank: claim.rank_at_pcs,
    dependents: claim.dependents_count,
    distance: claim.estimated_distance,
    currentStatus: claim.status,
    completionPercentage: claim.completion_percentage,
    estimatedTotal: claim.entitlements?.total,
    validationIssues: claim.validation_flags,
    // NO PII: names, addresses, SSN, etc.
  };
}
```

**Example Queries:**

- "Based on my PCS, what's my maximum TLE?"

→ AI knows rank/dependents/location

- "Why is my readiness score only 65%?"

→ AI sees validation flags

- "How much more can I claim?"

→ AI compares estimated vs entered

### 3.3 RAG AI Integration (Level 3: Smart Templates)

**Pre-filled Question Templates:**

**In PCS Copilot UI:**

```
┌─────────────────────────────────────────┐
│ 💡 Common Questions                     │
├─────────────────────────────────────────┤
│ [How much is my DLA?]                   │
│ → Auto-filled with your rank/status    │
│                                         │
│ [What can I claim for lodging?]         │
│ → TLE rules for your PCS type          │
│                                         │
│ [Do I need weigh tickets for PPM?]     │
│ → Requirements for your scenario       │
│                                         │
│ [How do I maximize my reimbursement?]  │
│ → Personalized recommendations         │
└─────────────────────────────────────────┘
```

**Implementation:**

- Detect claim context (rank, PCS type, status)
- Pre-fill variables in question templates
- One-click to ask (no typing needed)
- Answer opens in side panel (no navigation away)

### 3.4 RAG AI Integration (Level 4: Proactive Recommendations)

**Smart Suggestions Based on Claim Analysis:**

**Trigger Points:**

1. **After initial claim creation:**

   - "💡 Don't forget to claim DLA! You're entitled to $2,469."

2. **When distance entered:**

   - "💡 That's a long drive! Consider claiming en route per diem for 7 days."

3. **When TLE days = 0:**

   - "⚠️ Most service members need temporary lodging. Did you use a hotel?"

4. **When claim readiness < 70:**

   - "🎯 3 quick fixes will boost your readiness score to 95%:"
   - "  1. Add PCS orders date"
   - "  2. Verify lodging doesn't exceed 10 days"
   - "  3. Check MALT distance calculation"

**Implementation:**

```typescript
// Analyze claim and generate recommendations
const recommendations = await analyzeClaimWithAI(claim);

// Show as dismissible cards
recommendations.forEach(rec => {
  showNotification({
    type: rec.severity, // 'tip', 'warning', 'error'
    title: rec.title,
    message: rec.message,
    action: rec.suggestedFix ? {
      label: 'Fix Now',
      handler: () => navigateTo(rec.fixUrl)
    } : null
  });
});
```

### 3.5 AI-Powered Explanations (Like LES Auditor)

**When Validation Flags Triggered:**

**Example: TLE Days Exceeded**

```
⚠️ Warning: TLE at origin exceeds 10 days (12 entered)

[Show AI Explanation]

💬 AI Explanation:
"The Joint Travel Regulations (JTR 054205) limit Temporary
Lodging Expense (TLE) to 10 days at your origin and 10 days
at your destination, for a maximum of 20 total days. You've
entered 12 days at your origin base, which means 2 days
won't be reimbursable.

This is a common issue when service members need extra
time for house hunting or waiting for housing to become
available. While the extra days won't be reimbursed through
TLE, you might be eligible for:
1. House Hunting Trip (HHT) allowance if authorized
2. Per diem for those days instead of lodging reimbursement
3. Request for exception to policy (rare, needs commander approval)

For your claim, I recommend either:
• Reduce to 10 days and claim the other 2 as personal expense
• Split into HHT (if you were house hunting those days)
• Check if your orders authorize extended TLE

Need help with any of these options? Just ask!"

[View JTR 054205] [Ask Follow-up Question]
```

**Prompt Template:**

```typescript
const prompt = `
You are a military financial expert explaining a PCS claim validation issue.

Context:
- Rank: ${claim.rank_at_pcs}
- Issue: ${validationFlag.category}
- Details: ${validationFlag.description}

Explain in 4-6 sentences:
1. Why this is flagged (JTR rule)
2. Common reasons this happens
3. Whether it's fixable or just advisory
4. Specific next steps for this service member

Tone: Helpful, reassuring, knowledgeable (not condescending)
Citations: Include JTR paragraph references
Action: End with clear next step
`;
```

---

## Phase 4: Mobile Excellence (Weeks 7-8)

### 4.1 Mobile-First Manual Entry

**Progressive Wizard Design:**

**Step 1: Basic Info**

```
┌─────────────────────────┐
│ 🚁 Create PCS Claim     │
├─────────────────────────┤
│                         │
│ Claim Name              │
│ ┌─────────────────────┐ │
│ │ Fort Hood to JBLM   │ │
│ └─────────────────────┘ │
│                         │
│ PCS Orders Date         │
│ ┌─────────────────────┐ │
│ │ 📅 Mar 15, 2025     │ │
│ └─────────────────────┘ │
│                         │
│ ✓ Auto-filled from      │
│   your profile:         │
│   • Rank: E-5           │
│   • Branch: Army        │
│   • Origin: Fort Hood   │
│                         │
│ [Continue →]            │
└─────────────────────────┘
```

**Key Mobile UX Features:**

- **One field at a time focus** (reduces cognitive load)
- **Smart keyboard types** (numeric for dollars, date picker)
- **Autocomplete** (bases, cities)
- **Voice input** (for receipts: "Motel 6, $87, March 10")
- **Sticky progress bar** (5/12 sections complete)
- **Swipe navigation** (swipe right for next)
- **Auto-save** (every field change)

### 4.2 Touch-Optimized Components

**Large Touch Targets:**

```css
/* All interactive elements */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

/* Inputs */
input, select {
  height: 56px;
  font-size: 16px; /* Prevent zoom on iOS */
  border-radius: 12px;
}

/* Buttons */
button {
  height: 56px;
  font-size: 18px;
  font-weight: 600;
}
```

**Mobile Navigation:**

```
┌─────────────────────────┐
│ ← Back    PCS Claim     │ ← Sticky header
├─────────────────────────┤
│                         │
│ [Current Section]       │
│                         │
│ (Scrollable content)    │
│                         │
├─────────────────────────┤
│ [Save Draft] [Next →]   │ ← Sticky footer
└─────────────────────────┘
```

### 4.3 Offline Capability (PWA)

**Progressive Web App Features:**

- **Service Worker** (cache claim data)
- **Offline editing** (sync when online)
- **Add to Home Screen** (feels like native app)
- **Push notifications** (deadline reminders)

**Implementation:**

```typescript
// Service worker caches claim drafts
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/pcs/claim')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});

// Background sync when connection restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pcs-claim') {
    event.waitUntil(syncClaimToServer());
  }
});
```

---

## Phase 5: Admin & Monitoring (Week 9)

### 5.1 Admin Dashboard Integration

**Add to Existing Admin Dashboard:**

**New Tab: "PCS Copilot"**

```
┌─────────────────────────────────────────┐
│ COMMAND CENTER │ PERSONNEL │ PCS COPILOT│
├─────────────────────────────────────────┤
│ 📊 Overview                             │
│ ├─ Active Claims: 47                    │
│ ├─ Avg Completion: 68%                  │
│ ├─ Avg Estimate: $8,247                 │
│ └─ Total Savings: $387,609              │
│                                         │
│ 📈 Usage Trends (Last 30 Days)          │
│ [Line chart: Claims created over time]  │
│                                         │
│ ⚠️  Top Validation Issues                │
│ 1. TLE days exceeded (23 claims)       │
│ 2. Missing PCS orders date (18)        │
│ 3. MALT distance mismatch (12)         │
│                                         │
│ 🎯 Conversion Funnel                    │
│ • Started claim: 150                    │
│ • Completed profile: 89 (59%)           │
│ • Added expenses: 67 (45%)              │
│ • Ready to submit: 47 (31%)             │
│                                         │
│ 💰 Revenue Impact                       │
│ • Premium upgrades attributed: 23       │
│ • Avg savings per claim: $8,247         │
│ • User satisfaction (survey): 4.7/5     │
└─────────────────────────────────────────┘
```

### 5.2 Data Quality Monitoring

**Admin Tools:**

**1. JTR Rate Health Check**

```typescript
// Verify all rates are current
const healthCheck = {
  dla_rates: {
    lastUpdate: '2025-01-01',
    nextUpdate: '2026-01-01',
    status: 'current',
    source: 'DFAS API'
  },
  per_diem_rates: {
    lastUpdate: '2025-10-24',
    nextUpdate: '2025-10-25',
    status: 'current',
    source: 'DTMO API'
  },
  malt_rate: {
    lastUpdate: '2025-01-01',
    nextUpdate: '2026-01-01',
    status: 'current',
    source: 'IRS.gov'
  }
};
```

**2. Claim Accuracy Audit**

```typescript
// Spot-check random claims for calculation accuracy
const auditSample = await getRandomClaims(10);

auditSample.forEach(claim => {
  // Recalculate with current rates
  const recalculated = calculateEntitlements(claim);
  
  // Compare to stored estimate
  const variance = Math.abs(recalculated.total - claim.total);
  
  if (variance > 50) {
    flagForReview({
      claimId: claim.id,
      reason: 'Calculation variance > $50',
      expected: recalculated.total,
      actual: claim.total
    });
  }
});
```

**3. User Feedback Collection**

```typescript
// After claim submission, survey users
const survey = {
  question: "How accurate were our estimates?",
  options: [
    "Very accurate (within $100)",
    "Fairly accurate (within $500)",
    "Somewhat off (within $1000)",
    "Way off (>$1000 difference)"
  ],
  followUp: "What did we miss?" // Free text
};
```

### 5.3 Performance Metrics Dashboard

**Track Key Metrics:**

**1. User Engagement**

- Claims started per week
- Completion rate (draft → ready)
- Time to completion (median)
- Return usage (multiple claims)

**2. Accuracy Metrics**

- Estimate vs actual variance
- Validation flag accuracy
- User-reported issues
- Recalculation frequency

**3. Financial Impact**

- Avg savings per claim
- Total savings platform-wide
- Premium conversion attributed
- Cost per claim (AI + API)

**4. Technical Health**

- API success rate (JTR sources)
- Cache hit rate (per diem)
- Error rate (validations)
- Response time (calculations)

---

## Phase 6: Testing & Quality Assurance (Week 10)

### 6.1 Test Data Generation

**Create Comprehensive Test Scenarios:**

**1. Common PCS Scenarios**

```typescript
const testScenarios = [
  {
    name: 'E-5 Army CONUS PPM with family',
    rank: 'E-5',
    branch: 'Army',
    origin: 'Fort Hood, TX',
    destination: 'JBLM, WA',
    distance: 1845,
    dependents: 2,
    travelMethod: 'ppm',
    expectedDLA: 3086,
    expectedMALT: 332,
    expectedPerDiem: 1050,
    expectedPPM: 6500
  },
  // ... 50+ scenarios
];
```

**2. Edge Cases**

```typescript
const edgeCases = [
  'OCONUS to CONUS (different rate tables)',
  'Partial DITY (mixed move)',
  'TLE at one location only',
  'No dependents but married',
  'Retirement PCS (different rules)',
  'Separated PCS (family travels later)',
  'Alaska/Hawaii (special COLA)',
  'Government quarters (no BAH)',
];
```

### 6.2 Validation Test Suite

**Automated Testing:**

```typescript
describe('PCS Entitlement Calculator', () => {
  describe('DLA Calculation', () => {
    it('should calculate correct DLA for E-5 with dependents', async () => {
      const result = calculateDLA('E-5', true, new Date('2025-03-15'));
      expect(result.amount).toBe(3086);
      expect(result.citation).toBe('JTR 050302.B');
    });
    
    it('should use correct rate for effective date', async () => {
      // 2024 rates vs 2025 rates
      const result2024 = calculateDLA('E-5', true, new Date('2024-12-15'));
      const result2025 = calculateDLA('E-5', true, new Date('2025-01-15'));
      expect(result2025.amount).toBeGreaterThan(result2024.amount);
    });
  });
  
  describe('Validation Engine', () => {
    it('should flag TLE exceeding 10 days at origin', async () => {
      const claim = createTestClaim({ tleDaysOrigin: 12 });
      const flags = await validateClaim(claim);
      expect(flags).toContainEqual(
        expect.objectContaining({
          category: 'tle_limit_exceeded',
          severity: 'warning'
        })
      );
    });
    
    it('should not flag TLE under 10 days', async () => {
      const claim = createTestClaim({ tleDaysOrigin: 8 });
      const flags = await validateClaim(claim);
      expect(flags).not.toContainEqual(
        expect.objectContaining({ category: 'tle_limit_exceeded' })
      );
    });
  });
});
```

### 6.3 User Acceptance Testing

**Beta Test with Real Users:**

**Phase 1: Internal (Week 10)**

- Admin team creates 10 real claims
- Test all entry methods (manual, template)
- Verify calculations against actual LES
- Document any issues

**Phase 2: Select Beta (Week 11)**

- Invite 25 premium users (upcoming PCS)
- Provide detailed feedback form
- Track completion rate and satisfaction
- Fix critical bugs before public launch

**Phase 3: Public Launch (Week 12)**

- Announce via email to all premium users
- Add banner to dashboard
- Monitor error logs and support tickets
- Collect testimonials

---

## Success Criteria (Definition of Done)

### Minimum Viable Product (MVP)

- ✅ Manual entry for all 5 entitlement types (DLA, TLE, MALT, Per Diem, PPM)
- ✅ Real-time validation with JTR rules
- ✅ Auto-population from user profile
- ✅ Split-panel desktop UI
- ✅ Mobile-optimized wizard flow
- ✅ JTR API integration (per diem, DLA, MALT)
- ✅ Embedded RAG AI help widget
- ✅ AI-powered validation explanations
- ✅ Provenance tracking for all rates
- ✅ Admin dashboard monitoring
- ✅ 50+ test scenarios passing
- ✅ Zero TypeScript errors
- ✅ Mobile responsive (375px - 1920px)
- ✅ Accessibility (WCAG AA)
- ✅ Performance (LCP < 2.5s)

### Production Readiness Checklist

- [ ] Database migrations applied to production
- [ ] JTR API keys configured in Vercel
- [ ] Rate cache populated (per diem, DLA, MALT)
- [ ] 50+ JTR rules seeded
- [ ] Test scenarios 100% passing
- [ ] Admin dashboard live
- [ ] Error monitoring configured
- [ ] User feedback form active
- [ ] Documentation complete
- [ ] Security audit passed

### Excellence Benchmarks (vs LES Auditor)

- **Accuracy:** 99%+ calculation accuracy (validated against actual claims)
- **User Experience:** < 5 minutes to complete claim (faster than manual spreadsheet)
- **Validation:** 95%+ of errors caught before submission
- **Mobile Usage:** 60%+ of claims created on mobile
- **AI Helpfulness:** 4.5+/5 rating on AI explanations
- **Conversion Impact:** 30%+ of premium upgrades attributed to PCS Copilot
- **Cost Efficiency:** < $0.05 per claim (AI + API costs)

---

## Post-Launch Roadmap (Phase 7+)

### Advanced Features (Month 2-3)

- **OCR as Helper** - "Extract from photo" button for receipts (optional)
- **CSV Import** - Bulk import from spreadsheet
- **Email-to-Claim** - Forward receipts to unique email address
- **Claim Templates** - Save common scenarios as templates
- **Multi-claim Comparison** - Compare estimates across duty stations
- **Branch-Specific Workflows** - Army vs Navy vs AF variations
- **Office-Specific Quirks** - "Finance at Fort Hood requires X"

### Community Features (Month 4-6)

- **Community Insights** - Anonymous data: "92% of Fort Hood claims for DLA were approved"
- **Success Stories** - Testimonials with dollar amounts saved
- **Q&A Forum** - Military families help each other
- **Expert Review** - Optional paid review by CFP before submission

### Enterprise Features (Month 7-12)

- **Commander Dashboard** - Track unit-wide PCS success rate
- **Bulk Processing** - Process multiple claims for unit deploying
- **API Access** - Third-party integration (base legal, finance offices)
- **White-label** - License to military services

---

## Implementation Timeline

**Week 1-2:** Phase 1 (Manual Entry Foundation)

- Database enhancements
- Manual entry UI (desktop + mobile)
- Smart auto-population
- Real-time validation

**Week 3-4:** Phase 2 (JTR Intelligence)

- API integrations (DTMO, DFAS)
- JTR rules expansion (50+)
- Calculation engine enhancements
- Data provenance tracking

**Week 5-6:** Phase 3 (AI Integration)

- Embedded help widget
- Deep data access for Ask Assistant
- Smart question templates
- Proactive recommendations
- AI-powered explanations

**Week 7-8:** Phase 4 (Mobile Excellence)

- Mobile-first wizard
- Touch-optimized components
- Offline capability (PWA)
- Performance optimization

**Week 9:** Phase 5 (Admin & Monitoring)

- Admin dashboard integration
- Data quality monitoring
- Performance metrics

**Week 10:** Phase 6 (Testing & QA)

- Test data generation
- Validation test suite
- Internal beta testing

**Week 11:** Beta launch (select users)

**Week 12:** Public launch (all premium users)

---

## Cost Analysis

### Development Costs (One-Time)

- **Engineering:** 10 weeks × $0 (internal)
- **JTR API Research:** 20 hours × $0
- **Test Data Creation:** 10 hours × $0
- **Beta User Incentives:** $500 (25 users × $20 credits)
- **Total:** ~$500

### Operational Costs (Ongoing)

- **AI Costs (per claim):**
  - Validation explanations: ~$0.01 (Gemini 2.5 Flash)
  - RAG queries: ~$0.001 per question
  - Total AI: ~$0.02 per claim
- **API Costs (per claim):**
  - DTMO per diem: Free (public API)
  - DFAS rates: Free (public data)
  - Distance calculation: ~$0.001 (Google Maps)
  - Total API: ~$0.001 per claim
- **Storage:** ~$0.001 per claim (Supabase)
- **Total Cost per Claim:** ~$0.02

### Revenue Impact

- **Avg Savings per Claim:** $8,247 (based on industry data)
- **Premium Upgrade Attribution:** 30% (conservative)
- **Monthly Premium Upgrades:** ~15 users
- **Monthly Revenue Impact:** $150 (15 × $9.99)
- **Annual Revenue Impact:** $1,800
- **Margin:** 99% ($0.02 cost vs $9.99 revenue)

### ROI

- **Development Investment:** $500
- **Payback Period:** 3.3 months
- **Year 1 ROI:** 260%

---

## Risk Mitigation

### Technical Risks

1. **JTR API Downtime**

   - Mitigation: Cache last-known rates, fallback to manual override

2. **Calculation Errors**

   - Mitigation: Comprehensive test suite, admin spot-checks

3. **Mobile Performance**

   - Mitigation: Lazy loading, service worker caching

4. **Database Migration Issues**

   - Mitigation: Test on staging first, have rollback plan

### Business Risks

1. **User Adoption**

   - Mitigation: Beta test with real users, iterate based on feedback

2. **Accuracy Concerns**

   - Mitigation: Provenance tracking, "verify with finance" disclaimers

3. **Support Burden**

   - Mitigation: Comprehensive help docs, AI assistant handles common questions

4. **Competition**

   - Mitigation: First-mover advantage, superior UX, RAG AI integration

---

## Documentation Deliverables

### User Documentation

1. **Quick Start Guide** - "Create your first PCS claim in 5 minutes"
2. **Field-by-Field Help** - Tooltips for every input
3. **JTR Explainer** - Plain English guide to entitlements
4. **FAQs** - 50+ common questions
5. **Video Tutorials** - Screen recordings of full workflow

### Developer Documentation

1. **Architecture Diagram** - System design overview
2. **API Documentation** - All endpoints with examples
3. **Database Schema** - ERD with relationships
4. **Testing Guide** - How to run test suite
5. **Deployment Guide** - Step-by-step launch process

### Admin Documentation

1. **Monitoring Dashboard** - What to watch
2. **Data Quality Checks** - Monthly audit procedures
3. **User Support** - How to handle common issues
4. **Rate Update Process** - Quarterly JTR refresh
5. **Incident Response** - What to do when things break

---

## Conclusion

This comprehensive plan transforms PCS Copilot from its current basic state to **LES Auditor-level excellence**:

**Key Improvements:**

1. **Manual-first entry** (safer, more accurate than OCR)
2. **Real-time validation** (catch errors as users type)
3. **JTR API integration** (always current rates)
4. **Full RAG AI support** (embedded help + personalized advice)
5. **Mobile-optimized** (60%+ of users on mobile)
6. **100% data accuracy** (official sources + provenance)
7. **Admin monitoring** (quality assurance)
8. **Comprehensive testing** (50+ scenarios)

**Expected Outcomes:**

- **User Satisfaction:** 4.5+/5 (matching LES Auditor)
- **Completion Rate:** 70%+ (up from ~30% current)
- **Accuracy:** 99%+ (validated against actual claims)
- **Premium Upgrades:** +30% attributed to PCS Copilot
- **Support Tickets:** <5% (AI handles most questions)
- **Mobile Usage:** 60%+ (mobile-first design)

This is a **production-grade, enterprise-quality tool** that will become the #1 reason military families upgrade to premium.

### To-dos

- [ ] Database enhancements: Add jtr_rates_cache, pcs_claim_templates, pcs_manual_entry_log tables + schema modifications
- [ ] Build manual entry UI: Split-panel desktop interface + mobile wizard with auto-population
- [ ] Implement real-time validation engine: Field-level, cross-field, and JTR compliance checks
- [ ] Integrate JTR APIs: DTMO per diem, DFAS rates, MALT tracking, weight allowances
- [ ] Expand JTR rules from 10 to 50+: Core entitlements, travel allowances, dependent allowances, special circumstances
- [ ] Enhance calculation engine: Version-aware rates, confidence scoring, provenance tracking
- [ ] RAG AI Level 1: Embedded help widget with context-aware questions
- [ ] RAG AI Level 2: Deep data integration - Allow Ask Assistant to query claim data
- [ ] RAG AI Level 3: Smart question templates with pre-filled variables
- [ ] RAG AI Level 4: Proactive recommendations based on claim analysis
- [ ] AI-powered validation explanations using Gemini 2.5 Flash
- [ ] Mobile-first progressive wizard with touch-optimized components
- [ ] PWA implementation: Offline capability, service worker, background sync
- [ ] Admin dashboard integration: PCS Copilot tab with usage metrics and data quality monitoring
- [ ] Comprehensive testing: 50+ test scenarios, validation tests, edge cases
- [ ] Complete documentation: User guides, developer docs, admin procedures
- [ ] Beta testing with select users, collect feedback, fix critical bugs
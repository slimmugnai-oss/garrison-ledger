# Calculator & Profile Integration Audit

**Date:** 2025-10-21  
**Purpose:** Comprehensive audit of all tools/calculators vs profile fields

---

## CRITICAL FINDING 🚨

**ALL CALCULATORS ARE STANDALONE** - None fetch profile data for auto-fill!

**Current User Experience:**
- User completes profile (rank, base, dependents, etc.)
- User goes to TSP Calculator → manually enters age, balance
- User goes to House Hacking → manually enters BAH
- User goes to PCS Planner → manually enters rank, dependents again
- **Result:** User enters same data 10+ times across different tools!

**Opportunity:** Add profile auto-population to every calculator

---

## Tool-by-Tool Analysis

### Premium Tools

**1. LES Auditor** ✅ AUTO-POPULATES
- **Profile Fields Used:** paygrade, mha_code, has_dependents
- **Status:** Working perfectly - manual entry pre-fills from profile
- **Rating:** EXCELLENT

**2. Base Navigator** ✅ PROFILE-AWARE
- **Profile Fields Used:** paygrade, mha_code, has_dependents, num_children
- **Status:** Uses profile for BAH comparisons
- **Rating:** GOOD

**3. PCS Copilot** ⚠️ PARTIALLY INTEGRATED
- **Profile Fields Used:** rank, branch (from API route)
- **Frontend:** Requires manual rank/dependency selection
- **Opportunity:** Could auto-fill from profile.paygrade, profile.has_dependents
- **Rating:** NEEDS IMPROVEMENT

**4. TDY Voucher** (Not audited in detail)
- **Likely Needs:** paygrade (for per diem rates)
- **Status:** Unknown - needs code review
- **Rating:** UNKNOWN

**5. Collaborate** (Not a calculator)
- Profile sharing feature - not relevant to this audit

---

### Free Calculators

**6. TSP Calculator** ❌ NO PROFILE INTEGRATION
- **Current:** User manually enters age, retire age, balance, contribution
- **Could Auto-Fill From Profile:**
  - age (from profile.age or profile.birth_year)
  - retire age (from profile.retirement_age_target)
  - current balance (from profile.tsp_balance_range - use midpoint)
  - years of service (from profile.time_in_service_months)
- **Opportunity:** HUGE UX improvement
- **Rating:** NEEDS PROFILE INTEGRATION

**7. SDP Calculator** ❌ NO PROFILE INTEGRATION
- **Current:** User manually enters deposit amount, deployment months, base pay
- **Could Auto-Fill From Profile:**
  - base pay (can derive from profile.paygrade using military pay tables)
  - deployment months (if we add a field OR derive from deployment_count)
- **Profile Field Question:** deployment_count NOT USED currently
- **Opportunity:** MEDIUM UX improvement
- **Rating:** NEEDS PROFILE INTEGRATION

**8. House Hacking Calculator** ❌ NO PROFILE INTEGRATION
- **Current:** User manually enters BAH, price, rates, etc.
- **Could Auto-Fill From Profile:**
  - BAH (derive from profile.paygrade + profile.mha_code + profile.has_dependents)
  - Location context (from profile.current_base)
- **Profile Field Question:** bah_amount field REMOVED (good - we derive it)
- **Opportunity:** HIGH UX improvement (BAH is critical field)
- **Rating:** NEEDS PROFILE INTEGRATION

**9. PCS Planner** ❌ NO PROFILE INTEGRATION
- **Current:** User manually enters rank, dependents for DLA/entitlements
- **Could Auto-Fill From Profile:**
  - rank (from profile.paygrade)
  - dependency status (from profile.has_dependents)
  - DLA rate (lookup from rank + dependents)
  - Weight allowance (lookup from rank)
- **Opportunity:** HUGE UX improvement
- **Rating:** NEEDS PROFILE INTEGRATION

**10. On-Base Savings** ❌ NO PROFILE INTEGRATION
- **Current:** User manually enters monthly spending categories
- **Could Auto-Fill From Profile:**
  - Sales tax rate (from profile.current_base state)
  - Maybe family size context from num_children
- **Opportunity:** LOW UX improvement (mostly user-specific spending)
- **Rating:** MINOR BENEFIT

**11. Career/Salary Calculator** ❌ NO PROFILE INTEGRATION
- **Current:** User manually enters current salary, location, etc.
- **Could Auto-Fill From Profile:**
  - Current location (from profile.current_base)
  - Age (from profile.age)
- **Opportunity:** MEDIUM UX improvement
- **Rating:** NEEDS PROFILE INTEGRATION

---

## PROFILE FIELD UTILIZATION MATRIX

| Field | LES | Base Nav | PCS Cop | TDY | TSP | SDP | House | PCS Plan | OnBase | Career | TOTAL |
|-------|-----|----------|---------|-----|-----|-----|-------|----------|--------|--------|-------|
| **paygrade** (computed) | ✅ | ✅ | ✅ | ? | - | ✅ | ✅ | ✅ | - | - | **7** |
| **mha_code** (computed) | ✅ | ✅ | - | - | - | - | ✅ | - | - | - | **3** |
| **has_dependents** (computed) | ✅ | ✅ | ✅ | - | - | - | ✅ | ✅ | - | - | **5** |
| **rank_category** (computed) | ✅ | - | - | - | - | - | - | - | - | - | **1** |
| **time_in_service_months** | - | - | - | - | ✅ | - | - | - | - | - | **1** |
| **age** | - | - | - | - | ✅ | - | - | - | - | ✅ | **2** |
| **branch** | - | - | ✅ | - | - | - | - | - | - | - | **1** |
| **current_base** | - | ✅ | - | - | - | - | ✅ | - | ✅ | ✅ | **4** |
| **next_base** | - | - | - | - | - | - | - | ✅ | - | - | **1** |
| **pcs_date** | - | - | - | - | - | - | - | ✅ | - | - | **1** |
| **num_children** | - | ✅ | - | - | - | - | - | - | ✅ | - | **2** |
| **marital_status** | - | - | - | - | - | - | - | - | - | - | **0** |
| **spouse_military** | - | - | - | - | - | - | - | - | - | - | **0** |
| **has_efmp** | - | - | - | - | - | - | - | - | - | - | **0** |
| **tsp_balance_range** | - | - | - | - | ✅ | - | - | - | - | - | **1** |
| **debt_amount_range** | - | - | - | - | - | - | - | - | - | - | **0** |
| **housing_situation** | - | - | - | - | - | - | ✅ | - | - | - | **1** |
| **owns_rental_properties** | - | - | - | - | - | - | ✅ | - | - | - | **1** |
| **retirement_age_target** | - | - | - | - | ✅ | - | - | - | - | - | **1** |
| **long_term_goal** | - | - | - | - | - | - | - | - | - | - | **0** |
| **financial_priorities** | - | - | - | - | - | - | - | - | - | - | **0** |
| **deployment_count** | - | - | - | - | - | ❓ | - | - | - | - | **0-1** |

---

## KEY INSIGHTS

### High-Value Fields (Used by 3+ Tools)
1. **paygrade** (7 tools) - KEEP ✅
2. **has_dependents** (5 tools) - KEEP ✅
3. **current_base** (4 tools) - KEEP ✅
4. **mha_code** (3 tools) - KEEP ✅

### Medium-Value Fields (Used by 1-2 Tools)
5. **age** (2 tools) - KEEP ✅
6. **num_children** (2 tools) - KEEP ✅
7. **time_in_service_months** (1 tool) - KEEP ✅
8. **tsp_balance_range** (1 tool) - KEEP ✅
9. **retirement_age_target** (1 tool) - KEEP ✅
10. **next_base, pcs_date** (1 tool) - KEEP ✅
11. **housing_situation, owns_rental_properties** (1 tool) - KEEP ✅

### Zero-Value Fields (NOT Used by Any Tool)
12. **marital_status** - Only used to compute has_dependents ✅
13. **spouse_military** - Not used ⚠️
14. **has_efmp** - Not used ⚠️
15. **debt_amount_range** - Not used ⚠️
16. **long_term_goal** - Not used ⚠️
17. **financial_priorities** - Not used ⚠️
18. **deployment_count** - Not used (unless SDP needs it) ⚠️

---

## CRITICAL OPPORTUNITY: AUTO-POPULATION

**Problem:** Users re-enter the same data across 6 calculators

**Solution:** Add profile fetch to each calculator

### Implementation Pattern (Example: TSP Calculator)

```typescript
// In TspModeler.tsx
useEffect(() => {
  fetch('/api/user-profile')
    .then(res => res.json())
    .then(profile => {
      if (profile) {
        // Auto-fill from profile if not already saved
        setAge(profile.age || 30);
        setRet(profile.retirement_age_target || 60);
        
        // Convert tsp_balance_range to number
        const balanceMidpoint = getTSPBalanceMidpoint(profile.tsp_balance_range);
        setBal(balanceMidpoint || 50000);
      }
    });
}, []);
```

### Calculators Needing This (Priority Order)

1. **PCS Planner** - HIGH (rank, dependents required for entitlements)
2. **House Hacking** - HIGH (BAH is critical input)
3. **TSP Calculator** - MEDIUM (age, balance, retire age)
4. **Career Calculator** - MEDIUM (age, location)
5. **On-Base Savings** - LOW (sales tax rate from location)
6. **SDP Calculator** - LOW (base pay from paygrade)

---

## PROFILE OPTIMIZATION RECOMMENDATIONS

### REMOVE (3-5 fields)

**High Confidence Removals:**
1. **deployment_count** - SDP calculator doesn't use it ❌
2. **debt_amount_range** - No calculator uses it ❌
3. **long_term_goal** - Not used functionally ❌
4. **financial_priorities** - Not used functionally ❌

**Consider Removing:**
5. **spouse_military** - Not used by any tool ⚠️
6. **has_efmp** - Not used by any tool ⚠️

**Keep marital_status** - Needed to compute has_dependents

### KEEP (All essential fields verified)

**Core Identity:**
- service_status, branch, rank, component
- paygrade, rank_category (computed)
- age, years_of_service, time_in_service_months

**Location:**
- current_base, next_base, pcs_date
- mha_code, duty_location_type (computed)

**Family:**
- marital_status (computes has_dependents)
- num_children
- has_dependents (computed)

**Financial:**
- tsp_balance_range (TSP calculator)
- housing_situation (house hacking)
- owns_rental_properties (house hacking)
- retirement_age_target (TSP/retirement calculators)

### ADD (If beneficial)

**Consider Adding:**
1. **military_retirement_system** - "BRS" vs "High-3"
   - Used by: Retirement calculator, TSP calculator
   - Can derive from service date (BRS started 2018)
   - Or just ask: "Are you under BRS or legacy High-3?"

2. **current_state** - Extract from current_base
   - Used by: On-base savings (sales tax), Career calculator
   - Can derive from current_base → state

---

## FINAL OPTIMIZED PROFILE (Proposed)

### Section 1: Military (5 fields, 3 visible)
- service_status
- branch
- rank → derives paygrade, rank_category
- component
- years_of_service → derives time_in_service_months

### Section 2: Location (3 fields, 2 visible)
- current_base → derives mha_code, duty_location_type, state
- next_base (optional)
- pcs_date (optional)

### Section 3: Family (3 fields, 2 visible)
- marital_status
- num_children → derives has_dependents
- ~~has_efmp~~ (REMOVE - not used)
- ~~spouse_military~~ (REMOVE - not used)

### Section 4: Financial (4 fields)
- tsp_balance_range
- housing_situation
- owns_rental_properties
- retirement_age_target

### Section 5: Goals (Optional - can skip entirely)
- ~~long_term_goal~~ (REMOVE)
- ~~financial_priorities~~ (REMOVE)
- ~~debt_amount_range~~ (REMOVE)
- ~~deployment_count~~ (REMOVE)

**Total: 15 visible fields + 6 computed = 21 fields (vs 43 current)**

---

## IMPLEMENTATION ROADMAP

### Phase 1: Remove Confirmed Unused Fields (30 min)
1. deployment_count - Not used by SDP or any tool
2. debt_amount_range - Not used
3. long_term_goal - Not used
4. financial_priorities - Not used
5. spouse_military - Not used
6. has_efmp - Not used

**Result:** 6 fewer questions, cleaner profile

### Phase 2: Add Profile Auto-Population (4 hours)
1. PCS Planner - Auto-fill rank, dependents (HIGH priority)
2. House Hacking - Auto-fill BAH from computed values (HIGH)
3. TSP Calculator - Auto-fill age, balance, retire age (MEDIUM)
4. Career Calculator - Auto-fill location, age (MEDIUM)
5. On-Base Savings - Auto-fill state tax rate (LOW)
6. SDP Calculator - Auto-fill base pay from paygrade (LOW)

### Phase 3: Testing (1 hour)
- Verify each calculator auto-fills correctly
- Verify manual override works
- Verify saved scenarios still work

### Phase 4: Documentation (30 min)
- Update calculator docs with "Auto-fills from your profile"
- Update profile docs with "Used by: TSP, House Hacking, etc."

**Total Time: 6 hours**

---

## ANSWERS TO YOUR QUESTIONS

### Q1: Does deployment_count make sense?
**Answer: NO - REMOVE IT**
- SDP calculator doesn't use it (checked code)
- No other tool uses it
- Adds friction with no functional benefit
- If SDP needs deployment context later, ask "Deployed to combat zone?" Y/N

### Q2: Can we derive BAH instead of asking user?
**Answer: YES - Already doing this!**
- We compute: paygrade + mha_code + has_dependents
- Can lookup exact BAH from bah_rates table
- House Hacking should auto-fill BAH, not ask user
- **bah_amount field removal was CORRECT**

### Q3: What about spouse_military and has_efmp?
**Answer: REMOVE BOTH - Not used by any tool**
- spouse_military: Collected but never used
- has_efmp: Collected but never used
- Can add back if future feature needs them

---

## RECOMMENDATION

**IMMEDIATE ACTIONS:**

1. **Remove 6 more fields** (deployment_count, debt_amount_range, long_term_goal, financial_priorities, spouse_military, has_efmp)
2. **Add profile auto-population** to 6 calculators (prioritize PCS Planner, House Hacking, TSP)
3. **Result:** 15-question profile + 6 auto-fills = Perfect UX

**BENEFITS:**
- Shorter profile (15 vs 20 questions currently, 30+ originally)
- Auto-fill everywhere (one-time setup, works across all tools)
- Only keep fields with functional value
- Massive UX improvement

Ready to implement when approved!


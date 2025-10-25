# Profile Final Optimization - Implementation Plan

**Date:** 2025-10-21  
**Status:** Ready to Execute

---

## AUDIT COMPLETE - KEY FINDINGS

### Critical Discovery
**ALL FREE CALCULATORS ARE STANDALONE** - They don't auto-fill from profile!

**Current UX:**
- User fills 20-question profile
- Then manually re-enters same data in every calculator
- TSP: Enters age, retire age (already in profile!)
- House Hacking: Enters BAH (we can compute from profile!)
- PCS Planner: Enters rank, dependents (already in profile!)

**Opportunity:** Add auto-population = 10x better UX

---

## PHASE 1: Remove 6 More Unused Fields ✅ READY

**Fields to Remove:**
1. ❌ **deployment_count** - SDP doesn't use it
2. ❌ **debt_amount_range** - No tool uses it
3. ❌ **long_term_goal** - Not used functionally
4. ❌ **financial_priorities** - Not used functionally
5. ❌ **spouse_military** - Not used by any tool
6. ❌ **has_efmp** - Not used by any tool

**Keep marital_status** - Needed to compute has_dependents ✅

**Database Migration:**
```sql
ALTER TABLE user_profiles DROP COLUMN IF EXISTS
  deployment_count,
  debt_amount_range,
  long_term_goal,
  financial_priorities,
  spouse_military,
  has_efmp;
```

**UI Changes:**
- Remove from ProfilePayload type
- Remove from profile form UI
- Remove from section completion calculator

**Result:** Profile reduced to **14 visible questions + 6 computed = 20 total fields**

---

## PHASE 2: Add Auto-Population to Calculators ✅ READY

### Priority 1: PCS Planner (Critical)
**Currently:** User manually selects rank + dependency status  
**Should Be:** Auto-fill from profile.paygrade + profile.has_dependents  

**Implementation:**
```typescript
// app/components/tools/PcsFinancialPlanner.tsx
useEffect(() => {
  fetch('/api/user-profile')
    .then(res => res.json())
    .then(profile => {
      if (profile.paygrade) {
        setRankGroup(profile.paygrade); // E-5, O-3, etc.
      }
      if (profile.has_dependents !== null) {
        setDependencyStatus(profile.has_dependents ? 'with' : 'without');
      }
    });
}, []);
```

### Priority 2: House Hacking (Critical)
**Currently:** User manually enters BAH  
**Should Be:** Auto-compute from paygrade + mha_code + has_dependents

**Implementation:**
```typescript
// app/components/tools/HouseHack.tsx
useEffect(() => {
  fetch('/api/user-profile')
    .then(res => res.json())
    .then(profile => {
      if (profile.paygrade && profile.mha_code) {
        // Fetch actual BAH from bah_rates table
        fetch(`/api/bah?paygrade=${profile.paygrade}&mha=${profile.mha_code}&dependents=${profile.has_dependents}`)
          .then(r => r.json())
          .then(bah => {
            if (bah.rate) setBah(bah.rate);
          });
      }
    });
}, []);
```

### Priority 3: TSP Calculator (High)
**Currently:** User manually enters age, retire age, balance  
**Should Be:** Auto-fill from profile

**Implementation:**
```typescript
// app/components/tools/TspModeler.tsx
useEffect(() => {
  fetch('/api/user-profile')
    .then(res => res.json())
    .then(profile => {
      if (profile.age) setAge(profile.age);
      if (profile.retirement_age_target) setRet(profile.retirement_age_target);
      if (profile.tsp_balance_range) {
        const midpoint = getTSPMidpoint(profile.tsp_balance_range);
        setBal(midpoint);
      }
    });
}, []);

function getTSPMidpoint(range: string): number {
  const map = {
    '0-25k': 12500,
    '25k-50k': 37500,
    '50k-100k': 75000,
    '100k-200k': 150000,
    '200k+': 250000
  };
  return map[range] || 50000;
}
```

### Priority 4-6: Other Calculators (Medium-Low)
Similar patterns for Career Calculator, On-Base Savings, SDP

---

## FINAL PROFILE SCHEMA (14 Visible Questions)

### Required Questions (10)
1. Service Status
2. Branch
3. Rank → derives paygrade, rank_category
4. Component
5. Years of Service → derives time_in_service_months
6. Age
7. Current Base → derives mha_code, duty_location_type
8. Marital Status
9. Number of Children → derives has_dependents
10. Next Base (optional for PCS planning)

### Optional Questions (4)
11. PCS Date (optional)
12. TSP Balance Range (for TSP calculator)
13. Housing Situation (for house hacking)
14. Retirement Age Target (for retirement planning)

**Auto-Derived (Hidden - 6 fields):**
- paygrade, rank_category, mha_code, duty_location_type, has_dependents, time_in_service_months

**Total: 14 visible + 6 computed = 20 fields**  
**Down from: 43 fields currently, 63+ originally**

---

## BENEFITS

**User Experience:**
- ✅ 14-question profile (vs 30+ originally)
- ✅ One-time setup, auto-fills everywhere
- ✅ No re-entering rank/BAH/age across tools
- ✅ 2-minute profile completion (vs 5-10 min)

**Data Quality:**
- ✅ Computed fields can't have user errors
- ✅ Only fields with functional value
- ✅ Consistent data across all tools

**Performance:**
- ✅ 53% smaller database (20 vs 43 fields)
- ✅ Faster queries, better indexes
- ✅ Less data to validate/sync

---

## EXECUTION PLAN

**Step 1:** Remove 6 unused fields (database + UI)  
**Step 2:** Add profile fetch to 6 calculators  
**Step 3:** Add BAH API endpoint for house hacking  
**Step 4:** Test all 11 tools end-to-end  
**Step 5:** Update documentation  

**Time Estimate:** 6-8 hours total

**Ready to execute!**


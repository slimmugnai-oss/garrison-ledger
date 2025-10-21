# Profile Field Usage Audit - What Each Tool Actually Needs

**Date:** 2025-10-21  
**Purpose:** Determine which profile fields are actually used by tools vs collected but unused

---

## Tool-by-Tool Field Requirements

### LES Auditor ✅ VERIFIED
**Required:**
- rank → paygrade (E01-E09, O01-O10)
- current_base → mha_code (for BAH lookup)
- has_dependents (affects BAH rate: with/without)

**Optional:**
- time_in_service (some calculations, not critical)

**Status:** Now works with fallback values

---

### Base Navigator
**Required:**
- rank/paygrade (for BAH comparison)
- has_dependents (for BAH rate)
- current_base (starting point)

**Nice to Have:**
- num_children (for school ratings feature - premium)
- children ages (school grade level filtering?)

**Investigation Needed:** Do we use children ages or just count?

---

### PCS Copilot  
**Required (from PCS estimate code):**
- rank (for DLA/MALT rates)
- branch (service-specific rules)

**From claim, not profile:**
- dependent_count (entered per move, not from profile)
- origin/destination (entered per move)

**Status:** Uses minimal profile data

---

### TDY Copilot
**Likely Required:**
- rank (for per diem rates)

**Investigation Needed:** Check actual usage

---

### Calculators (TSP, SDP, House Hacking, etc.)
**Finding:** Standalone tools, user enters data each session
**Profile Usage:** None (don't pre-fill from profile)

**Opportunity:** COULD pre-fill from profile for better UX

---

## Fields by Usage Category

### Category A: CRITICAL (Used by Multiple Tools)
1. rank + paygrade (computed)
2. branch
3. current_base + mha_code (computed)
4. has_dependents (computed)
5. marital_status (derives has_dependents)
6. num_children (derives has_dependents + schools)

### Category B: USED (Single Tool or Feature)
7. component (military type)
8. time_in_service_months (retirement planning)
9. next_base, pcs_date (PCS Copilot)
10. children array (school ages - if Base Navigator uses)
11. housing_situation (Base Navigator, house hacking)
12. tsp_balance_range (could pre-fill calculators)
13. spouse_military (dual military households)

### Category C: COLLECTED BUT NEVER USED
14. ❌ clearance_level
15. ❌ mos_afsc_rate
16. ❌ deployment_status
17. ❌ last_deployment_date
18. ❌ spouse_age
19. ❌ spouse_career_field
20. ❌ spouse_service_status
21. ❌ education_level
22. ❌ timezone
23. ❌ urgency_level
24. ❌ communication_pref
25. ❌ spouse_employed (not used)

### Category D: CONTEXTUAL (Financial Health Only)
26. debt_amount_range
27. ❌ emergency_fund_range
28. monthly_income_range
29. tsp_allocation
30. owns_rental_properties
31. bah_amount (can derive from rank+base+deps)
32. career_interests
33. financial_priorities
34. long_term_goal
35. retirement_age_target
36. content_difficulty_pref
37. deployment_count (maybe for SDP)
38. pcs_count

---

## Aggressive Consolidation Plan

### Minimal Required Profile (10 questions)

**Must Answer (10 fields):**
1. Branch (dropdown)
2. Rank (dropdown) → derives paygrade, rank_category
3. Component (Active/Reserve/Guard)
4. Years of Service (number) → derives time_in_service_months
5. Current Base (autocomplete) → derives mha_code, duty_location_type
6. Marital Status (dropdown)
7. Number of Children (number) → derives has_dependents
8. EFMP Enrolled (yes/no)
9. Next Base (optional - for PCS planning)
10. PCS Date (optional - for PCS planning)

**Auto-Derived (Hidden from User):**
- paygrade
- rank_category  
- mha_code
- duty_location_type
- has_dependents
- time_in_service_months

**Optional Section "Financial Context" (Can Skip):**
- TSP Balance Range
- Debt Range
- Housing Situation
- Financial Priorities

**Remove Entirely (11+ fields):**
- All spouse details except marital_status
- All education fields
- All deployment history
- clearance, MOS, timezone, etc.

---

## Recommendation

**AGGRESSIVE approach:**
1. Keep only 10 core questions (military identity + basic family)
2. Make financial section optional (4-5 questions, can skip)
3. Remove 15+ unused fields
4. Add 6 auto-derived computed fields

**Result:**
- User sees: ~10 required + 5 optional = 15 questions max
- Down from: 30+ questions
- 50% shorter profile form
- Retains all data needed by tools

**Trade-off:**
- Lose some "nice to have" context (spouse age, education level)
- Gain: Faster onboarding, higher completion rate
- Can always add fields back if new features need them

---

## Next Step

Verify these questions before proceeding:
1. Base Navigator school feature - uses children ages or just count?
2. Any calculator pre-fills from profile?
3. Is spouse_employed used anywhere?
4. Is deployment_count used by SDP?

Once verified, implement the aggressive consolidation.


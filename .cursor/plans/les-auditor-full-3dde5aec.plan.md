<!-- 3dde5aec-0795-4b24-83f4-51becc0160f5 9af9eda3-d591-4e96-94c2-4a51b3f90166 -->
# Profile & Calculator Integration - Complete Audit

## Goal

Ensure every calculator and tool can auto-fill from the profile with the exact fields needed. Remove unused fields, add missing fields if needed.

---

## Phase 1: Tool-by-Tool Field Requirements Audit

### Premium Tools (Mission Critical)

**1. LES Auditor** ✅ DONE

- Needs: paygrade, mha_code, has_dependents
- Status: Working perfectly with computed fields

**2. Base Navigator** ✅ DONE

- Needs: paygrade, mha_code, has_dependents, num_children
- Status: Working with computed fields

**3. PCS Copilot**

- Check: What fields does it need from profile?
- Verify: Does it auto-populate or require manual entry?
- File: `app/api/pcs/*`, `app/dashboard/pcs-copilot/*`

**4. TDY Voucher**

- Check: What fields does it need?
- Verify: Receipt processing, per diem calculations
- File: `app/dashboard/tdy-voucher/*`

**5. Collaborate/Share**

- Check: What profile data is shared with spouse?
- Verify: Spouse collaboration features
- File: `app/dashboard/collaborate/*`

### Free Calculators (User Retention)

**6. TSP Calculator** (Free tool)

- Check: Does it need: paygrade, time_in_service, tsp_balance_range?
- Verify: Auto-fill for BRS matching calculations
- File: `app/dashboard/tools/tsp-modeler/*`

**7. SDP Calculator** (Free tool)

- Check: **CRITICAL** - Does it need deployment_count?
- Verify: Combat zone deployment context
- File: `app/dashboard/tools/sdp-strategist/*`

**8. House Hacking Calculator** (Free tool)

- Check: Does it need: bah_amount, housing_situation, location?
- Verify: Can derive BAH from paygrade+mha_code instead?
- File: `app/dashboard/tools/house-hacking/*`

**9. PCS Planner** (Free tool)

- Check: Does it need: rank, next_base, pcs_date, dependents?
- Verify: DLA/MALT/Per Diem calculations
- File: `app/dashboard/tools/pcs-planner/*`

**10. On-Base Savings Calculator** (Free tool)

- Check: What does it need?
- Verify: Commissary/exchange savings calculations
- File: `app/dashboard/tools/on-base-savings/*`

**11. Retirement Calculator** (Free tool)

- Check: Does it need: time_in_service, tsp_balance, retirement_age_target?
- Verify: High-3 vs BRS calculations
- File: `app/dashboard/tools/salary-calculator/*` or separate?

---

## Phase 2: Field Gap Analysis

For each tool, document:

- **Required fields**: Must have to function
- **Optional fields**: Enhance UX with auto-fill
- **Missing fields**: Need to add to profile
- **Unused fields**: Safe to remove

### Expected Findings

**Likely KEEP:**

- paygrade, mha_code (computed) - Used by multiple tools
- has_dependents (computed) - BAH calculations
- time_in_service_months - Retirement, TSP
- tsp_balance_range - TSP calculator
- housing_situation - House hacking
- next_base, pcs_date - PCS tools
- retirement_age_target - Retirement calculator

**Likely REMOVE:**

- deployment_count - UNLESS SDP calculator uses it
- owns_rental_properties - UNLESS house hacking uses it
- debt_amount_range - Not used by calculators

**Possibly ADD:**

- current_bah_monthly - If house hacking needs actual amount (can derive from paygrade+mha though)
- military_retirement_system - "BRS" vs "High-3" for retirement calculator

---

## Phase 3: Auto-Population Implementation

For each calculator that needs profile data:

### Pattern A: Server-Side Pre-Fill

```typescript
// In calculator page.tsx (Server Component)
const profile = await getProfileData(userId);
return <CalculatorClient initialData={{
  paygrade: profile.paygrade,
  bah: calculateBAH(profile.paygrade, profile.mha_code, profile.has_dependents)
}} />;
```

### Pattern B: Client-Side Fetch

```typescript
// In calculator client component
useEffect(() => {
  fetch('/api/user-profile')
    .then(res => res.json())
    .then(profile => setDefaultValues(profile));
}, []);
```

### Pattern C: Computed Values

```typescript
// Derive complex values
const bah = useMemo(() => {
  return calculateBAHFromProfile(profile);
}, [profile.paygrade, profile.mha_code, profile.has_dependents]);
```

---

## Phase 4: Profile Optimization

After audit, create final profile schema:

### Minimal Required Profile (Optimized)

**Military Identity:**

- service_status, branch, rank
- component, time_in_service_months
- paygrade (computed), rank_category (computed)

**Location:**

- current_base, next_base, pcs_date
- mha_code (computed), duty_location_type (computed)

**Family:**

- marital_status, num_children, has_efmp
- spouse_military, has_dependents (computed)

**Financial:**

- tsp_balance_range
- housing_situation
- [deployment_count?] - Depends on SDP audit

**Goals:**

- long_term_goal, retirement_age_target
- financial_priorities

**System:**

- profile_completed, created_at, updated_at

---

## Phase 5: Testing Checklist

For each calculator:

- [ ] Opens without errors
- [ ] Profile data auto-fills correctly
- [ ] Manual override works
- [ ] Calculations are accurate
- [ ] Saves/loads user scenarios

---

## Success Criteria

- ✅ All 11+ tools can auto-populate from profile
- ✅ Profile has ONLY fields used by at least one tool
- ✅ Zero manual data entry for returning users
- ✅ Profile form ≤ 20 questions
- ✅ All computed fields working

---

## Deliverables

1. **Tool Requirements Matrix** - Spreadsheet showing which tool needs which field
2. **Profile Schema Final** - Optimized list of fields to keep
3. **Auto-Population Guide** - How each tool pulls profile data
4. **Migration Plan** - Any new fields to add or remove

---

## Questions to Answer

1. **SDP Calculator**: Does it need deployment_count? Or just "Have you deployed to combat zone?" Y/N?
2. **House Hacking**: Does it need bah_amount field, or can we compute from paygrade+mha?
3. **Retirement Calculator**: Does it need to know BRS vs High-3? Or derive from service date?
4. **All Calculators**: Should they save scenarios to profile, or separate table?

Ready to execute this audit when you approve!

### To-dos

- [x] Database migration status verified - RLS migration exists but not applied, all tables exist
- [x] Field mapping investigation complete - documented inconsistencies and fixed
- [x] pdf-parse@1.1.1 confirmed installed in package.json
- [x] RLS migration reviewed and documented - Application guide created, verification queries included, waiting for manual database application
- [x] Standardize profile field names across all API routes - FIXED: Updated audit-manual/route.ts to use rank/current_base/has_dependents/time_in_service
- [x] Correct any user_entitlements → entitlements references - FIXED: Changed user_entitlements to entitlements in audit-manual/route.ts getUserTier()
- [x] Profile completeness logic verified - page.tsx and ProfileIncompletePrompt.tsx use correct fields (rank, current_base, has_dependents)
- [x] Testing checklist created - Comprehensive test scenarios documented in LES_AUDITOR_TESTING_CHECKLIST.md - Pending manual execution
- [x] Test scenarios documented - Profile validation, audit calculation, PDF export all have detailed test cases
- [x] Dashboard integration verified in code - Ready for live testing on Vercel deployment
- [x] IntelCardLink verified - Component uses correct flag-to-card mapping, tested BAH/BAS/COLA links
- [x] Error messages already contextual with helpful suggestions - Verified in PaycheckAuditClient.tsx
- [x] Mobile and accessibility testing scenarios documented in LES_AUDITOR_TESTING_CHECKLIST.md - Ready for manual testing
- [x] Analytics tracking exists in audit-manual/route.ts - Logging with PII sanitization already implemented
- [x] Documentation complete - SYSTEM_STATUS.md updated, LES_AUDITOR_USER_GUIDE.md created, diagnostic report created
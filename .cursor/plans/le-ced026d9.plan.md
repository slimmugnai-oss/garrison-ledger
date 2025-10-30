<!-- ced026d9-fa16-4ab1-9d57-13e36cdbc5bb 324c45a9-cd9a-4dfb-8ee9-673fdde77a8b -->
# PCS Copilot: Distance, Tax, and DLA Fixes

## Issues Identified

### 1. Shaw AFB Location Data (CRITICAL)

**Problem:** Shaw AFB has Albany, GA coordinates instead of Sumter, SC coordinates

- Current: `lat: 33.040619, lng: -83.643074` (Albany, GA)
- Correct: `lat: 33.970833, lng: -80.470556` (Sumter, SC)
- **Impact:** Shaw-to-Moody distance calculates as ~190 miles instead of ~322 miles

**Root Cause:** `lib/data/military-bases.json` has wrong coordinates for Shaw AFB (entry `sumter-shaw-afb-sc`)

### 2. Georgia State Tax Rate

**Problem:** Georgia showing as 0.04 (4%)

- Need to verify if this is correct 2025 rate for Georgia
- GA uses graduated brackets (1% - 5.75% top rate)
- Supplemental wage withholding may use different rate than regular income

**Investigation needed:** Check `state_tax_rates` table for GA entry

### 3. DLA Showing $0

**Problem:** DLA calculation returning $0 despite `entitlements_data` table having correct rates

- Code queries `entitlements_data.dla_rate` (in dollars, not cents)
- Function `getDLARate` fetches from `fetchDLARates` which calls `getDLARatesFromDB`
- `getDLARatesFromDB` reads `dla_rate` directly without cents conversion

**Investigation needed:**

- Check if `entitlements_data.dla_rate` field is populated
- Verify rank conversion logic (e.g., "Sergeant (SGT)" → "E-5" → database lookup)
- Check if query is filtering by correct year

### 4. GCC Estimator Warning (User Experience)

**Current warning:** "ROUGH BALLPARK ONLY - NOT ACCURATE. This is NOT how DoD calculates PPM..."

**User feedback:** Too aggressive/scary

**Goal:** Professional but clear tone that acknowledges limitation without being alarmist

## Implementation Plan

### Phase 1: Investigate Current State

1. Query `state_tax_rates` for Georgia to confirm 4% rate
2. Query `entitlements_data` for sample rank (e.g., E-5 with dependents) to verify DLA data exists
3. Test distance calculation with Shaw AFB current coordinates vs. correct coordinates

### Phase 2: Fix Shaw AFB Coordinates

**File:** `lib/data/military-bases.json`

- Find entry `"id": "sumter-shaw-afb-sc"`
- Update `lat` to `33.970833`
- Update `lng` to `-80.470556`
- Verify `zip` field (should be Shaw AFB zip: 29152)

**Note:** This file has auto-generation warning, but coordinate fixes are necessary for accuracy

### Phase 3: Audit All Base Coordinates

Create script to identify other bases with potentially incorrect coordinates:

1. Read `lib/data/military-bases.json`
2. For each base, check if coordinates match city/state
3. Flag suspicious entries (e.g., coordinates >50 miles from expected location)
4. Generate report of bases needing manual verification

**Files to create:**

- `scripts/audit-base-coordinates.ts` - Coordinate validation script
- `docs/BASE_COORDINATE_AUDIT.md` - Results and corrections needed

### Phase 4: Fix Georgia State Tax Rate (If Needed)

**Investigation:** Query database to see current GA rate

- If 4% is correct for supplemental wages: Document why
- If incorrect: Update `state_tax_rates` table with correct rate

**Georgia 2025 Supplemental Wage Withholding:**

- Check Georgia DOR guidance for supplemental wage withholding
- May be flat 5.75% (top rate) or 4% (mid-tier rate)
- Document source and rationale

### Phase 5: Fix DLA $0 Issue

**Root cause analysis:**

1. Add debug logging to `getDLARate` function
2. Check if `entitlements_data` query is returning data
3. Verify rank normalization (user's rank → database format)
4. Check if `dla_rate` field is NULL or 0 in database

**Potential fixes:**

- If database field is empty: Populate with official 2025 DLA rates
- If rank conversion failing: Fix `getRankPaygrade` function
- If query failing: Fix table/column names

**File:** `lib/pcs/jtr-api.ts` (lines 668-697)

### Phase 6: Soften GCC Estimator Warning

**Current location:** `app/components/pcs/PPMModeSelector.tsx` (lines 306-317)

**New warning (professional but clear):**

```tsx
<div className="rounded-lg border-2 border-amber-600 bg-amber-50 p-4">
  <p className="text-sm font-bold text-amber-900">⚠️ Planning Estimate Only</p>
  <p className="mt-1 text-xs text-amber-800">
    This estimate uses simplified formulas for planning purposes. The actual GCC from 
    DoD uses proprietary DP3/GHC rate tables with weight brackets, distance bands, and 
    seasonal adjustments that we cannot replicate. Your official GCC from my.move.mil 
    may differ significantly. Always verify with my.move.mil before making financial 
    decisions.
  </p>
</div>
```

**Also update:** Card description text (lines 119-124) to match softer tone

## Testing Requirements

1. **Distance calculation test:**

   - Shaw AFB to Moody AFB should show ~322 miles (driving) or ~261 miles (straight-line with 1.15x multiplier = 300 miles)
   - Create test case in `__tests__/pcs/distance.test.ts`

2. **DLA calculation test:**

   - E-5 with dependents should return $3,150 (2025 rate)
   - Test rank conversion: "Sergeant (SGT)" → E-5 → $3,150

3. **State tax test:**

   - Georgia resident PPM should show correct withholding rate
   - Document source of rate in code comments

## Documentation Updates

**Files to update:**

- `docs/active/PCS_DATA_SOURCES.md` - Add coordinate audit section
- `docs/SYSTEM_STATUS.md` - Note data corrections made
- Add inline comments explaining GA tax rate source

## Success Criteria

- ✅ Shaw AFB to Moody AFB distance = 322 miles (±5%)
- ✅ DLA for E-5 with dependents = $3,150
- ✅ Georgia state tax rate documented with official source
- ✅ Warning message uses professional, balanced tone
- ✅ All base coordinates verified accurate within 5 miles
- ✅ Tests pass for distance, DLA, and tax calculations

### To-dos

- [x] Create LesEditorLayout with responsive 1fr/360px grid and sticky aside
- [x] Implement LesSummarySticky with live totals, variance, provenance, actions
- [x] Create LesSectionCard with header, subtotal, collapsible body, bottom Add button
- [x] Implement LineItemRow with inline currency edit, badges, delete
- [ ] Implement AddLineItemPopover anchored to Add button; uses allowedCodes; hide existing
- [x] Refactor LesAuditAlwaysOn to render new section cards and sticky summary
- [x] Ensure FICA/Medicare auto-calc updates inline rows and remains editable
- [x] Mount Findings/flags panel under sections; preserve PremiumCurtain
- [x] A11y focus, keyboard shortcuts, and mobile spacing/touch targets
- [x] Smoke test, update docs/SYSTEM_STATUS if needed; verify icon usage guide
<!-- 3dde5aec-0795-4b24-83f4-51becc0160f5 2e2acad1-e99e-44bc-988c-04bf4ae20aa9 -->
# Debug LES Auditor Auto-Population Issue

## Problem

Manual Entry form should auto-populate BAH/BAS/COLA based on user profile, but it's not working.

**Expected:** Fields auto-fill with values when clicking "Manual Entry" tab

**Actual:** Fields are empty, no auto-population happening

---

## Investigation Plan

### Phase 1: Verify API Endpoint

**Check:** `/api/les/expected-values/route.ts`

- Does file exist and export properly?
- Does it import buildExpectedSnapshot correctly?
- Are there any TypeScript errors?
- Test endpoint directly with curl/Postman

### Phase 2: Check Profile Data Flow

**Verify:** User profile data reaches LesManualEntry component

- Is userProfile prop passed from PaycheckAuditClient?
- Does it contain rank, currentBase, hasDependents?
- Add console logging to verify data

### Phase 3: Check buildExpectedSnapshot Function

**Verify:** `lib/les/expected.ts` exists and works

- Does buildExpectedSnapshot function exist?
- What parameters does it expect?
- Does it properly fetch BAH rates from database?
- Test with sample data

### Phase 4: Check Frontend Logic

**Verify:** LesManualEntry useEffect

- Is useEffect firing?
- Is fetch call executing?
- Are there console errors?
- Is response handling correct?

### Phase 5: Test End-to-End

**Manual test:**

- Add console.logs at each step
- Verify API returns data
- Verify setState updates
- Verify input fields receive values

---

## Likely Issues

### Issue 1: buildExpectedSnapshot might not exist

- File: `lib/les/expected.ts`
- May need to create or verify exists
- Needs to fetch BAH rates from database

### Issue 2: API endpoint may have errors

- TypeScript compilation errors
- Import path issues
- Runtime errors being silently caught

### Issue 3: Profile prop may not have correct data

- rank might be "Private (Pvt)" but needs paygrade code like "E-01"
- Location might be "West Point" but needs specific format
- Data transformation needed

### Issue 4: Silent fetch failure

- CORS issues
- 404 on endpoint
- Errors caught but not displayed to user

---

## Fix Strategy

### Quick Win: Add Fallback Values

If buildExpectedSnapshot is complex, use simple defaults:

```typescript
// Fallback: Basic enlisted rates
setBah('1500.00');  // Average BAH
setBas('460.25');   // Current enlisted BAS
setCola('0.00');    // Most locations have no COLA
```

### Proper Fix: Ensure buildExpectedSnapshot Works

1. Verify function exists
2. Test with user's actual profile data
3. Handle errors properly
4. Add logging for debugging

### Enhanced UX: Show Loading State

Add shimmer/skeleton while fetching expected values

---

## Implementation Steps

1. Read `lib/les/expected.ts` to verify buildExpectedSnapshot exists
2. Test `/api/les/expected-values` endpoint directly
3. Add console logging to debug data flow
4. Fix any import/type errors
5. Add better error handling
6. Deploy and test

---

## Success Criteria

- ✅ Manual Entry tab loads
- ✅ Fields auto-populate with BAH/BAS/COLA values
- ✅ Values are correct for user's rank/location/dependents
- ✅ User sees "Auto-filled" confirmation message
- ✅ User can adjust values if needed
- ✅ Audit runs successfully

### To-dos

- [ ] Database migration status verified - RLS migration exists but not applied, all tables exist
- [ ] Field mapping investigation complete - documented inconsistencies and fixed
- [ ] pdf-parse@1.1.1 confirmed installed in package.json
- [ ] RLS migration reviewed and documented - Application guide created, verification queries included, waiting for manual database application
- [ ] Standardize profile field names across all API routes - FIXED: Updated audit-manual/route.ts to use rank/current_base/has_dependents/time_in_service
- [ ] Correct any user_entitlements → entitlements references - FIXED: Changed user_entitlements to entitlements in audit-manual/route.ts getUserTier()
- [ ] Profile completeness logic verified - page.tsx and ProfileIncompletePrompt.tsx use correct fields (rank, current_base, has_dependents)
- [ ] Testing checklist created - Comprehensive test scenarios documented in LES_AUDITOR_TESTING_CHECKLIST.md - Pending manual execution
- [ ] Test scenarios documented - Profile validation, audit calculation, PDF export all have detailed test cases
- [ ] Dashboard integration verified in code - Ready for live testing on Vercel deployment
- [ ] IntelCardLink verified - Component uses correct flag-to-card mapping, tested BAH/BAS/COLA links
- [ ] Error messages already contextual with helpful suggestions - Verified in PaycheckAuditClient.tsx
- [ ] Mobile and accessibility testing scenarios documented in LES_AUDITOR_TESTING_CHECKLIST.md - Ready for manual testing
- [ ] Analytics tracking exists in audit-manual/route.ts - Logging with PII sanitization already implemented
- [ ] Documentation complete - SYSTEM_STATUS.md updated, LES_AUDITOR_USER_GUIDE.md created, diagnostic report created
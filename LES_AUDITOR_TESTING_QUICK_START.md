# LES Auditor - Quick Testing Guide

**Date:** 2025-10-21  
**Status:** Ready for Testing

---

## 🚀 Quick Start Testing

### Test 1: Basic Manual Entry (5 minutes)

1. **Navigate to LES Auditor**
   ```
   https://your-domain.com/dashboard/paycheck-audit
   ```

2. **Expected:** Form should auto-fill with your expected pay
   - BAH (based on your rank, location, dependents)
   - BAS (based on your rank category)
   - Base Pay (based on your rank and years of service)
   - Special pays (if configured in profile)

3. **Action:** Enter your actual October 2025 LES values
   - Override any auto-filled values that don't match
   - Leave special pays blank if you don't receive them

4. **Click:** "Run Paycheck Audit"

5. **Expected Results:**
   - Green flags for correct amounts
   - Red flags for significant discrepancies
   - Yellow flags for minor variances or unable to verify

---

### Test 2: Configure Special Pays (10 minutes)

1. **Navigate to Profile Setup**
   ```
   https://your-domain.com/dashboard/profile/setup
   ```

2. **Scroll to Section 7: Special Pays & Allowances**
   - If your base MHA wasn't found, you'll see a yellow alert
   - Option to enter MHA code override

3. **Configure Your Special Pays**
   - SDAP: Select Yes/No, enter monthly amount if Yes
   - HFP/IDP: Select Yes if deployed to hostile area
   - FSA: Select Yes if separated from family
   - FLPP: Select Yes if receiving language pay

4. **Save Profile**

5. **Go Back to LES Auditor**
   - Form should now auto-fill your special pays
   - Verify amounts match your LES
   - Run audit

---

### Test 3: Override Auto-Filled Values (2 minutes)

1. **Open LES Auditor** (should be auto-filled)

2. **Click on an auto-filled field** (green badge)
   - Change the value
   - Notice green badge disappears
   - Field turns white

3. **Run Audit**
   - Audit uses your override value
   - Should show correct comparison

---

### Test 4: Mobile Experience (5 minutes)

1. **Open on Phone**
   ```
   Mobile: https://your-domain.com/dashboard/paycheck-audit
   ```

2. **Check:**
   - Form is responsive
   - Currency inputs work
   - Green badges visible
   - Submit button accessible
   - Results readable

---

## 📋 Checklist

### Profile Configuration
- [ ] Profile Section 7 loads without errors
- [ ] MHA override field works (if base not found)
- [ ] SDAP Yes/No toggles work
- [ ] SDAP amount input works (stores in cents)
- [ ] HFP/IDP toggle works (defaults to $225)
- [ ] FSA toggle works (defaults to $250)
- [ ] FLPP toggle works with amount input
- [ ] Profile saves successfully
- [ ] Special pays persist after save

### Manual Entry Form
- [ ] Form loads with auto-fill
- [ ] BAH shows green badge if auto-filled
- [ ] BAS shows green badge if auto-filled
- [ ] COLA shows if applicable
- [ ] Special pays section shows if configured
- [ ] Base Pay shows with green badge
- [ ] Override removes green badge
- [ ] Month/Year selectors work
- [ ] Submit button enabled with complete profile
- [ ] Form submits successfully

### Audit Results
- [ ] Flags display correctly (red/yellow/green)
- [ ] Messages are clear and actionable
- [ ] Suggestions are specific
- [ ] Delta calculations are accurate
- [ ] Totals match expected
- [ ] "New Audit" button resets form
- [ ] Can run multiple audits

### Edge Cases
- [ ] User with no special pays (section doesn't show)
- [ ] User with multiple special pays (all show)
- [ ] Base not found (MHA override works)
- [ ] Partial data (some fields auto-fill, others don't)
- [ ] Override behavior (can change auto-filled values)
- [ ] Mobile experience (touch-friendly)

---

## 🐛 What to Watch For

### Potential Issues

1. **Auto-Fill Fails**
   - Check browser console for API errors
   - Check Vercel logs for `/api/les/expected-values` errors
   - Verify profile has all required fields

2. **Special Pays Don't Show**
   - Verify profile has `receives_X = true`
   - Check that amounts are set in cents
   - Refresh page to re-fetch expected values

3. **Audit Fails**
   - Check browser console
   - Check Vercel logs for `/api/les/audit-manual` errors
   - Verify input values are valid numbers

4. **Flags Seem Wrong**
   - Compare expected vs actual amounts manually
   - Check that profile data is up-to-date
   - Verify rate tables have correct data for your rank/location

---

## 🔍 Debugging

### Check Auto-Fill API Response
```javascript
// Open browser console on Manual Entry page
// Watch Network tab for /api/les/expected-values
// Should return:
{
  "bah": 245000,  // Your expected BAH in cents
  "bas": 46066,   // Your expected BAS in cents
  "base_pay": 318600,  // Your expected base pay in cents
  // ... special pays if configured
}
```

### Check Profile Data
```javascript
// API call to check your profile
fetch('/api/user-profile')
  .then(r => r.json())
  .then(console.log);

// Should show:
{
  "receives_sdap": true/false,
  "sdap_monthly_cents": 45000,
  // ... other special pays
  "mha_code": "NY349",
  "mha_code_override": null,
  // ... rest of profile
}
```

---

## ✅ Success Indicators

### You'll Know It's Working When:
1. ✅ Profile Section 7 loads without errors
2. ✅ Manual entry form shows green badges on auto-filled fields
3. ✅ Values match your expected pay
4. ✅ Audit completes in < 3 seconds
5. ✅ Flags are accurate (match your actual pay status)
6. ✅ You can override any value
7. ✅ Special pays validate if configured
8. ✅ Base pay validates against pay tables

---

## 📞 If Something Breaks

1. **Check Browser Console** - Look for errors
2. **Check Vercel Logs** - Look for API failures
3. **Check Profile Completeness** - Ensure all required fields are set
4. **Try Different Values** - Test with known-good data
5. **Check Documentation** - Reference implementation doc for details

---

**Ready to test!** Start with Test 1 (Basic Manual Entry) and work through the scenarios.


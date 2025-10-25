# 🧪 LES AUDITOR - COMPLETE TESTING GUIDE

**Purpose:** Test the LES Auditor end-to-end with sample data  
**Sample LES:** `public/test-data/mock-les-e5-with-deps.pdf` (provided by user)  
**Time:** 15 minutes  

---

## 🎯 TEST SCENARIOS

### Test Case 1: E05 with Dependents (Fort Hood, TX)

**Profile Setup:**
- **Rank:** E05 (Sergeant / Staff Sergeant)
- **Paygrade:** E05
- **Years of Service:** 8 years
- **Current Base:** Fort Hood, TX (TX191)
- **Dependents:** Yes (spouse + 2 children)
- **TSP:** 5% contribution
- **SGLI:** $400,000 coverage
- **State:** Texas (no state income tax)
- **Filing Status:** Married Filing Jointly

**Expected Values (2025 DFAS Rates):**
- **Base Pay:** ~$3,500/month (E05 @ 8 YOS)
- **BAH:** ~$1,800/month (Fort Hood with deps)
- **BAS:** $460.25/month (enlisted)
- **COLA:** $0 (Fort Hood doesn't have COLA)
- **Total Pay:** ~$5,760/month

**Tax Calculations:**
- **Taxable Gross:** $3,500 (Base Pay only - excludes BAH/BAS)
- **FICA (6.2%):** ~$217/month
- **Medicare (1.45%):** ~$51/month
- **Federal Tax:** ~$350/month (depends on W-4)
- **State Tax:** $0 (Texas)

**Deductions:**
- **TSP (5% of total):** ~$288/month
- **SGLI ($400K):** ~$27/month
- **Dental:** ~$14/month

**Expected Net Pay:**
```
Total Pay:      $5,760.25
Deductions:     -$329.00  (TSP $288 + SGLI $27 + Dental $14)
Taxes:          -$618.00  (FICA $217 + Medicare $51 + Fed $350)
──────────────────────────
Net Pay:        $4,813.25
```

---

## 📋 TESTING PROCEDURE

### Step 1: Setup Profile

1. Go to `/dashboard/profile/setup`
2. Complete all required sections:

**Personal Info:**
- Name: John Doe
- Email: test@example.com
- Has dependents: Yes
- Number of children: 2

**Military Info:**
- Branch: Army
- Rank: Sergeant (E05)
- Paygrade: E05
- Current Base: Fort Hood, TX
- Time in Service: 96 months (8 years)

**Financial Info:**
- Filing Status: Married Filing Jointly
- State of Residence: TX

**LES Setup (Optional Section 7):**
- Receives SDAP: No
- Receives HFP/IDP: No
- Receives FSA: No
- Receives FLPP: No

**Deductions (Optional Section 8):**
- TSP Contribution: 5%
- TSP Type: Traditional
- SGLI Coverage: $400,000
- Has Dental: Yes
- W-4 Allowances: 0

3. Save profile

---

### Step 2: Navigate to LES Auditor

1. Go to `/dashboard/paycheck-audit`
2. Click "Manual Entry" tab
3. Select month/year (e.g., October 2025)

---

### Step 3: Verify Auto-Fill Works

**Should Auto-Fill:**
- ✅ Base Pay: $3,500.00 (or close - depends on exact YOS)
- ✅ BAH: ~$1,800 (Fort Hood with deps)
- ✅ BAS: $460.25 (enlisted)
- ✅ COLA: $0.00 (no COLA for Fort Hood)
- ✅ TSP: ~$288 (5% of total)
- ✅ SGLI: ~$27 ($400K coverage)

**Should NOT Auto-Fill (Manual Entry Only):**
- ❌ Federal Tax
- ❌ State Tax
- ❌ FICA
- ❌ Medicare
- ❌ Dental
- ❌ Net Pay

---

### Step 4: Enter Tax Values Manually

Go to **"Taxes" tab** and enter:

- Federal Income Tax: $350.00
- State Tax: $0.00 (Texas)
- FICA: $217.00
- Medicare: $51.00

Go to **"Deductions" tab** and verify/enter:

- Dental: $14.00 (or enter actual if different)

Go to **"Summary" tab** and enter:

- Net Pay: $4,813.25

---

### Step 5: Run Audit

Click **"Run Complete Audit"** button

**Expected Results:**

✅ **BAH Verified:** $1,800 matches expected rate for E05 with deps at Fort Hood  
✅ **BAS Verified:** $460.25 matches official 2025 enlisted BAS  
✅ **Base Pay Verified:** Matches pay table for E05 @ 8 YOS  
✅ **COLA:** Correctly $0 (Fort Hood has no COLA)  
✅ **TSP Verified:** 5% of total pay calculated correctly  
✅ **SGLI Verified:** $27 matches $400K coverage premium  
✅ **FICA Percentage Check:** $217 = 6.2% of $3,500 taxable ✅  
✅ **Medicare Percentage Check:** $51 = 1.45% of $3,500 taxable ✅  
✅ **Net Pay Math Check:** $5,760 - $329 - $618 = $4,813 ✅ MATCH!  

---

## 🧪 ADDITIONAL TEST CASES

### Test Case 2: Junior Officer No Dependents (California)

**Profile:**
- Rank: O02 (First Lieutenant)
- YOS: 3 years
- Base: Camp Pendleton, CA
- Dependents: No
- State: California

**Expected:**
- Base Pay: ~$5,500
- BAH: ~$2,500 (CA rates higher)
- BAS: $316.98 (officer)
- Taxable Gross: $5,500
- FICA: ~$341 (6.2% of $5,500)
- Medicare: ~$80 (1.45% of $5,500)
- State Tax: ~$300-400 (California has state tax)

**Validation Points:**
- BAH should be higher (CA vs TX)
- BAS should be officer rate ($316.98 not $460.25)
- State tax should be > $0 (California)

---

### Test Case 3: Senior Enlisted with Special Pays

**Profile:**
- Rank: E07 (Sergeant First Class)
- YOS: 16 years
- Base: Fort Bragg, NC
- Dependents: Yes
- Receives SDAP: Yes, $300/month
- Receives HFP/IDP: Yes, $225/month (deployment)

**Expected:**
- Base Pay: ~$4,800
- BAH: ~$1,900
- BAS: $460.25
- SDAP: $300
- HFP/IDP: $225
- **Taxable Gross:** $5,325 (Base $4,800 + SDAP $300 + HFP $225)
- FICA: ~$330 (6.2% of $5,325)
- Medicare: ~$77 (1.45% of $5,325)

**Validation Points:**
- Special pays should auto-fill from profile
- Taxable gross includes special pays
- FICA/Medicare calculated on taxable gross (includes specials)

---

## ✅ WHAT TO VERIFY

### Auto-Fill Accuracy:
- [ ] BAH matches DFAS calculator for rank + location + dependents
- [ ] BAS matches official rate (officer vs enlisted)
- [ ] Base Pay matches pay table for rank + YOS
- [ ] COLA correct (most CONUS = $0, some high-cost areas have COLA)
- [ ] TSP calculated from user's % on total pay
- [ ] SGLI premium matches coverage amount

### Manual Entry Works:
- [ ] Can enter Federal tax
- [ ] Can enter State tax
- [ ] Can enter FICA
- [ ] Can enter Medicare
- [ ] Can enter Dental premium
- [ ] Can enter Net pay

### Validation Logic:
- [ ] FICA percentage validated (~6.2%)
- [ ] Medicare percentage validated (~1.45%)
- [ ] Net pay math validated (Total - Deductions - Taxes)
- [ ] Green flags for correct values
- [ ] Yellow flags for minor variances
- [ ] Red flags for major issues

### Edge Cases:
- [ ] No COLA location (should show $0, not error)
- [ ] No special pays (should skip those fields)
- [ ] No state tax (TX, FL, WA) - should accept $0
- [ ] Override auto-filled value (should work)

---

## 🐛 COMMON ISSUES TO WATCH FOR

### Issue: Auto-Fill Not Working
**Cause:** Profile incomplete (missing paygrade, mha_code, or has_dependents)  
**Fix:** Complete profile setup, ensure all required fields filled

### Issue: BAH Not Found
**Cause:** Base not in base-mha-map.json or MHA code not in bah_rates table  
**Fix:** Use MHA override field in profile, or add base to mapping

### Issue: Base Pay Not Auto-Filling
**Cause:** Missing time_in_service_months in profile  
**Fix:** Add time in service to profile (computed as time_in_service_months)

### Issue: FICA Percentage Warning
**Cause:** User entered FICA that's not ~6.2% of taxable gross  
**Expected:** May be correct if user hit wage base or has deployment exemptions  
**Action:** Verify taxable gross calculation

---

## 📊 SAMPLE TEST DATA

### E05 @ 8 YOS, Fort Hood, With Dependents (Full Example)

**Manual Entry Values:**

**Tab 1 - Entitlements:**
- Base Pay: $3,500.00
- BAH: $1,800.00
- BAS: $460.25
- COLA: $0.00

**Tab 2 - Deductions:**
- TSP: $288.00
- SGLI: $27.00
- Dental: $14.00

**Tab 3 - Taxes:**
- Federal Tax: $350.00
- State Tax: $0.00
- FICA: $217.00
- Medicare: $51.00

**Tab 4 - Summary:**
- Net Pay: $4,813.25

**Expected Audit Results:**

```
✅ BASE PAY VERIFIED: $3,500.00 matches E05 @ 8 YOS
✅ BAH VERIFIED: $1,800.00 matches TX191 E05 with dependents
✅ BAS VERIFIED: $460.25 matches enlisted rate
✅ COLA VERIFIED: $0.00 correct (no COLA for Fort Hood)
✅ TSP VERIFIED: $288.00 = 5% of total pay
✅ SGLI VERIFIED: $27.00 matches $400K coverage
✅ FICA PERCENTAGE: $217.00 = 6.20% of taxable gross ✅
✅ MEDICARE PERCENTAGE: $51.00 = 1.46% of taxable gross ✅
✅ NET PAY VERIFIED: Math checks out! $5,760.25 - $329 - $618 = $4,813.25 ✅

🎯 PAYCHECK VERIFIED - No discrepancies found!
```

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying LES Auditor to real users:

- [ ] Run `npm run check-data-freshness` - All sources current?
- [ ] Test with E01-E04 (junior enlisted)
- [ ] Test with E05-E09 (senior enlisted)
- [ ] Test with O01-O06 (officers)
- [ ] Test with dependents vs no dependents
- [ ] Test CONUS vs OCONUS (if OCONUS COLA data available)
- [ ] Test with special pays (SDAP, HFP/IDP)
- [ ] Test no-state-tax states (TX, FL, WA, AK, NV, SD, TN, WY)
- [ ] Test state-tax states (CA, NY, VA, NC, etc.)
- [ ] Test profile with MHA override
- [ ] Verify RLS policies (users can only see their own audits)
- [ ] Verify tier gating (Free: 1/month, Premium: unlimited)

---

## 📊 EXPECTED BEHAVIOR

### Scenario: Everything Correct
**User Action:** Enters all values correctly from LES  
**System Response:** All green flags, "Paycheck verified!"  
**User Outcome:** Confidence their pay is correct

### Scenario: Missing Allowance
**User Action:** BAH is $0 on their LES  
**System Response:** 🚨 Red flag "BAH missing - expected $1,800 for your rank and location"  
**User Outcome:** Action item to contact finance office

### Scenario: Incorrect FICA Percentage
**User Action:** Enters FICA $150 (should be $217 for $3,500 taxable)  
**System Response:** ⚠️ Yellow flag "FICA is 4.3% but should be ~6.2%"  
**User Outcome:** Re-check LES or verify if wage base hit

### Scenario: Net Pay Doesn't Match
**User Action:** Math doesn't add up (typo in entry)  
**System Response:** 🚨 "Net pay variance: Expected $4,813, you entered $4,500"  
**User Outcome:** Review all entries for data entry errors

---

## 🔧 DATA SOURCE VERIFICATION

### Before Testing, Verify Data:

**Option 1: Terminal Command**
```bash
npm run check-data-freshness
```

**Option 2: Admin Dashboard**
1. Go to `/dashboard/admin/data-sources`
2. Click "Run Freshness Check" button
3. Review results in new tab

**Expected Output:**
```
✅ BAH Rates - Current (16,368 rates for 2025)
✅ Military Pay Tables - Current (282 rates, effective 2025-04-01)
✅ BAS Rates - Current (Officer $316.98, Enlisted $460.25)
✅ Tax Constants - Current (FICA $176,100 wage base)
✅ SGLI Premiums - Current (8 coverage tiers)
⚠️ COLA Rates - May need Q4 2025 update (check DTMO)
```

If all ✅ → Data is good, proceed with testing  
If any 🚨 → Update data before testing

---

## 🎓 MANUAL TESTING WALKTHROUGH

### Full End-to-End Test (15 minutes):

**Minute 1-3: Profile Setup**
1. Navigate to `/dashboard/profile/setup`
2. Fill in all 8 sections (Personal, Military, Financial, LES Setup)
3. Use test case values above
4. Click "Save Profile"

**Minute 4-5: Navigate to Auditor**
1. Go to `/dashboard/paycheck-audit`
2. Verify "Manual Entry" tab is selected
3. Select month/year: October 2025

**Minute 6-8: Verify Auto-Fill (Tab 1: Entitlements)**
- Check Base Pay auto-filled: ~$3,500
- Check BAH auto-filled: ~$1,800
- Check BAS auto-filled: $460.25
- Check COLA auto-filled: $0.00
- Check TSP auto-filled: ~$288
- Check SGLI auto-filled: ~$27

**Minute 9-10: Enter Deductions (Tab 2)**
- Verify TSP: $288 (already auto-filled)
- Verify SGLI: $27 (already auto-filled)
- Enter Dental: $14.00 (manual)

**Minute 11-12: Enter Taxes (Tab 3)**
- Enter Federal Tax: $350.00
- Enter State Tax: $0.00
- Enter FICA: $217.00
- Enter Medicare: $51.00

**Minute 13-14: Enter Net Pay (Tab 4: Summary)**
- Verify calculated net: $4,813.25
- Enter actual net pay: $4,813.25
- Should show green "Math checks out!"

**Minute 15: Run Audit**
- Click "Run Complete Audit"
- Wait 2-3 seconds
- Review results

**Expected:** All green flags, no discrepancies

---

## 🎯 SUCCESS CRITERIA

### Functional Requirements:
- ✅ Profile integration works (auto-fills from profile)
- ✅ Manual entry works (all 17 fields)
- ✅ Tabbed UI works (4 tabs, navigation smooth)
- ✅ Auto-fill indicators show (green badges)
- ✅ Override works (can modify auto-filled values)
- ✅ Audit runs successfully (generates flags)
- ✅ Results display properly (flags + summary)

### Validation Requirements:
- ✅ BAH validates against official table
- ✅ BAS validates against official rate
- ✅ Base Pay validates against pay table
- ✅ COLA validates (present or absent correctly)
- ✅ FICA percentage validated (~6.2%)
- ✅ Medicare percentage validated (~1.45%)
- ✅ Net pay math validated
- ✅ Rank vs YOS sanity check works

### User Experience:
- ✅ Clear instructions ("Enter actual values from LES")
- ✅ Helpful field labels and descriptions
- ✅ Tax disclaimer visible (blue info box)
- ✅ Real-time calculation summary
- ✅ Green flags for correct values
- ✅ Actionable suggestions for issues

---

## 🐛 DEBUGGING TIPS

### If Auto-Fill Doesn't Work:

**Check 1: Profile Completeness**
```sql
SELECT paygrade, mha_code, has_dependents, time_in_service_months 
FROM user_profiles 
WHERE user_id = 'your-user-id';
```

All fields should be populated. If any NULL → complete profile.

**Check 2: MHA Code Lookup**
```sql
SELECT * FROM bah_rates 
WHERE mha = 'TX191' 
AND paygrade = 'E05' 
AND with_dependents = true
AND effective_date = '2025-01-01';
```

Should return 1 row with rate_cents. If empty → MHA code wrong or not in table.

**Check 3: Base Pay Lookup**
```sql
SELECT * FROM military_pay_tables
WHERE paygrade = 'E05'
AND years_of_service <= 8
ORDER BY years_of_service DESC
LIMIT 1;
```

Should return highest YOS ≤ 8 for E05. If empty → pay tables not loaded.

### If Validation Fails:

**Check: Taxable Gross Calculation**
- Should be: Base Pay + COLA + Special Pays
- Should NOT include: BAH, BAS
- Example: $3,500 (base) + $0 (COLA) = $3,500 taxable

**Check: FICA Calculation**
- Should be: 6.2% of taxable gross
- Example: $3,500 × 0.062 = $217

**Check: Total Pay Calculation**
- Should be: Taxable Gross + BAH + BAS
- Example: $3,500 + $1,800 + $460.25 = $5,760.25 total

---

## 📋 ADMIN TOOLS

### Monitor Data Sources:
- **Dashboard:** `/dashboard/admin/data-sources`
- **Freshness Check:** Click "Run Freshness Check" button
- **Terminal:** `npm run check-data-freshness`

### Update Data:
- **BAH Rates:** Use existing `scripts/import-bah-final.ts`
- **Pay Tables:** `npm run import-pay-tables <csv-file>`
- **BAS Rates:** Manually edit `lib/ssot.ts` lines 249-251
- **Tax Constants:** Create migration with new year values

---

## 🎯 PASS/FAIL CRITERIA

### Must Pass:
- ✅ Auto-fill works for all allowances (BAH, BAS, Base Pay)
- ✅ Manual entry works for all tax fields
- ✅ FICA percentage validation works
- ✅ Medicare percentage validation works
- ✅ Net pay math check works
- ✅ Flags display with correct severity (green/yellow/red)
- ✅ Actionable suggestions provided for each flag
- ✅ No console errors
- ✅ No database errors
- ✅ Tier gating works (Free: 1/month)

### Nice to Have:
- ⚠️ Special pays auto-fill (if configured)
- ⚠️ Override auto-filled values
- ⚠️ Rank vs YOS warnings (if unusual)
- ⚠️ Net pay reasonableness warnings

---

## 🚀 READY TO TEST

**Start here:**
1. `/dashboard/profile/setup` - Complete profile
2. `/dashboard/paycheck-audit` - Run audit
3. Use values from Test Case 1 above

**Data verified:** ✅ All 2025 sources current  
**Code deployed:** ✅ Latest changes live  
**Complexity:** ✅ LOW (simple, maintainable)  

**Let's validate this thing works!** 🎯


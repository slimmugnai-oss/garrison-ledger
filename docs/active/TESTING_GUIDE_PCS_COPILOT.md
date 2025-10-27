# PCS Copilot Testing Guide

**Version:** 2.0 (Post-Implementation)  
**Date:** October 27, 2025  
**Status:** Ready for User Testing

---

## ✅ **WHAT TO TEST**

### Test 1: Auto-Distance Calculation (2 minutes)
```
1. Create new claim → Manual entry
2. Origin: "Fort Bragg"
3. Destination: "JBLM"
4. ✅ EXPECT: Distance auto-fills to ~2,850 miles within 1-2 seconds
5. ✅ CHECK: Console log shows "Auto-calculated distance"
```

### Test 2: Auto-Travel Days (1 minute)
```
1. Departure: 2025-06-01
2. Arrival: 2025-06-05
3. ✅ EXPECT: per_diem_days auto-fills to 5
4. ✅ CHECK: Console log shows "Auto-calculated travel days: 5"
```

### Test 3: TLE Rate Suggestions (3 minutes)
```
1. Continue to Lodging step
2. Wait 2-3 seconds

✅ EXPECT:
- Origin TLE rate: ~$107 (Fort Bragg NC)
- Destination TLE rate: ~$150 (JBLM WA)

✅ CHECK: Console shows "Auto-filled origin/dest TLE rate"
```

### Test 4: PPM Withholding Calculator (5 minutes)
```
1. Scroll to PPM section
2. ✅ VERIFY: Disclaimer appears with checkbox
3. Check checkbox
4. Choose "I Have My GCC from MilMove"
5. Enter:
   - GCC: $8,500
   - Moving costs: $1,200
   - Fuel: $800
   - Labor: $300
   - Tolls: $100
6. Click "Calculate PPM Payout & Withholding"

✅ VERIFY BREAKDOWN:
- Gross: $8,500
- Deductions: -$2,400
- Taxable: $6,100
- Federal (22%): -$1,342
- WA State (0%): $0
- FICA (6.2%): -$378
- Medicare (1.45%): -$88
- NET PAYOUT: $6,692

✅ VERIFY DISCLAIMERS:
- "NOT tax advice" visible
- Links to IRS.gov and Military OneSource
- Can adjust withholding rates
```

### Test 5: State Tax Variations (3 minutes)
```
Test different states:

Fort Bragg (NC) → Fort Hood (TX):
✅ TX: 0% state tax

Fort Bragg → Camp Pendleton (CA):
✅ CA: ~9.3% state tax

Fort Bragg → Fort Liberty (NC):
✅ NC: ~4.75% state tax
```

### Test 6: Estimator Mode (2 minutes)
```
Reset PPM section
Choose "Planning Estimate"

✅ VERIFY:
- Shows weight: 8,000 lbs
- Shows distance: 2,850 miles
- Calculates: ~$11,400 estimated GCC
- Shows ±30% variance
- Bold warning: "PLANNING ESTIMATE ONLY"
- Link to move.mil
```

### Test 7: Complete E2E Flow (5 minutes)
```
1. Complete full wizard (all steps)
2. Click "Download Claim Package (PDF)"

✅ VERIFY:
- Claim saves to database
- Snapshot appears in pcs_entitlement_snapshots
- PDF downloads
- Refresh page → claim shows on list
- Total entitlement correct on claim card
```

---

## 📊 **EXPECTED RESULTS**

### All Auto-Calculations Should Work:
- Distance: ~2,850 miles (Fort Bragg → JBLM)
- Travel days: 5 days (Jun 1-5)
- TLE origin: $107/night (NC rate)
- TLE dest: $150/night (WA rate)
- Per diem: $166/day (standard CONUS)

### PPM Withholding (GCC $8,500):
- Gross: $8,500
- After expenses ($2,400): $6,100 taxable
- Federal (22%): -$1,342
- State (varies by destination)
- FICA (6.2%): -$378
- Medicare (1.45%): -$88
- **Net: ~$6,400-6,700** (depending on state)

---

## ✅ **SUCCESS CRITERIA**

### All Pass:
- [x] Build passes (no TypeScript errors)
- [x] Deployed to Vercel
- [ ] Distance auto-calculates
- [ ] Travel days auto-calculate
- [ ] TLE rates auto-suggest
- [ ] PPM calculator shows withholding
- [ ] Disclaimers appear
- [ ] PDF downloads successfully

---

**Test and report back!** 🚀


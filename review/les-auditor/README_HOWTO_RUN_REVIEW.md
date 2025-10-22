# HOW TO RUN LES AUDITOR REVIEW

**Time Required:** 15-30 minutes  
**Prerequisites:** Postman (or curl), Supabase CLI (optional for RLS test)  

---

## QUICK START (15 Minutes)

### Step 1: Read the Review Packet (5 min)

Open and skim: **`LES_Auditor_Review_Packet.md`**

**Focus on:**
- Section 1: Scope & Assumptions (understand manual-only approach)
- Section 3: Taxability & Math (understand tax base logic)
- Section 4: Flags Catalog (know what each flag means)
- Section 10: Quick Review Checklist (your testing guide)

---

### Step 2: Import Postman Collection (2 min)

**Option A: Postman Desktop**
1. Open Postman
2. File → Import
3. Select `postman_collection.json`
4. Collection "LES Auditor API" appears in left sidebar

**Option B: cURL (if no Postman)**
- Use the cURL examples in Section 5 of the review packet
- Replace `YOUR_CLERK_JWT` with actual token

**Get Clerk JWT Token:**
1. Open https://garrisonledger.com in browser
2. Sign in
3. Open DevTools → Network tab
4. Make any authenticated request
5. Copy `Authorization: Bearer ...` token
6. Paste into Postman variable `clerk_jwt_token`

---

### Step 3: Run Happy Path Test (3 min)

**In Postman:**
1. Open "Run Audit - Happy Path (E05 Fort Hood)"
2. Verify request body matches `fixtures/happy_path_e5_fthood.request.json`
3. Click "Send"

**Expected Response:**
- Status: 200 OK
- 3 green flags
- `mathProof` ends with "✓"
- `net_delta` ≤ 100

**Compare with:** `fixtures/happy_path_e5_fthood.response.json`

✅ **PASS** if response matches expected  
❌ **FAIL** if red flags appear or math doesn't balance

---

### Step 4: Run BAH Mismatch Test (3 min)

**In Postman:**
1. Open "Run Audit - BAH Mismatch (E06 PCS)"
2. Click "Send"

**Expected Response:**
- Status: 200 OK
- 1 red flag: `BAH_MISMATCH`
  * `delta_cents`: 30000 ($300)
  * Message includes "Expected $1,950.00, got $1,650.00"
- 1 red flag: `NET_MATH_MISMATCH`
- 2 green flags: `FICA_PCT_CORRECT`, `MEDICARE_PCT_CORRECT`

**Compare with:** `fixtures/bah_mismatch_e6_pcs.response.json`

✅ **PASS** if flags match expected  
❌ **FAIL** if BAH mismatch not detected

---

### Step 5: Verify Data Freshness (2 min)

**Option A: Admin UI (easiest)**
1. Go to: https://garrisonledger.com/dashboard/admin/data-sources
2. Click: "Run Freshness Check" button
3. New tab opens with color-coded status

**Expected:**
- ✅ BAH Rates: Current (16,368 rates for 2025)
- ✅ Military Pay Tables: Current (282 rates for 2025)
- ✅ BAS Rates: Current (Officer $316.98, Enlisted $460.25)
- ✅ All other sources: Current

**Option B: Terminal**
```bash
cd /path/to/garrison-ledger
npm run check-data-freshness
```

✅ **PASS** if all sources show ✅ for 2025  
⚠️ **INVESTIGATE** if any show 🚨 stale

---

### Step 6: (Optional) RLS Security Test (5 min)

**Requires:** Supabase CLI installed

**Run:**
```bash
supabase db execute --file review/les-auditor/sql/rls_smoke_test.sql
```

**Expected Output:**
```
TEST 1 PASSED: User A created audit
TEST 2 PASSED: User A inserted line item
TEST 3 PASSED: User A can read their own audit
TEST 4 PASSED: User B cannot see User A audit
TEST 5 PASSED: Soft delete works
TEST 6 PASSED: Soft-deleted audit correctly excluded
ALL RLS SMOKE TESTS PASSED!
```

✅ **PASS** if all 6 tests pass  
❌ **CRITICAL FAIL** if User B can see User A's data (RLS broken)

---

## DETAILED REVIEW (30+ Minutes)

### Code Review Areas

**1. Taxability Logic (`lib/les/codes.ts`)**
- Review LINE_CODES object (lines 34-120)
- Verify BAH/BAS are `{fed: false, state: false, oasdi: false, medicare: false}`
- Verify HFP is `{fed: false, state: false, oasdi: true, medicare: true}`
- Review `computeTaxableBases()` function (lines 163-193)
- Confirm only ALLOWANCE section items count toward bases

**2. Comparison Engine (`lib/les/compare.ts`)**
- Review `compareDetailed()` function (lines 688-940)
- Verify FICA threshold: `if (ficaPercent < 6.1 || ficaPercent > 6.3)`
- Verify Medicare threshold: `if (medicarePercent < 1.40 || medicarePercent > 1.50)`
- Verify net pay formula includes all 6 sections
- Verify delta calculations: `expectedBAH - actualBAH`

**3. Database Migration (`supabase-migrations/`)**
- Review migration applied: `les_auditor_enhancements`
- Verify trigger function (lines 70-94)
- Verify RLS policies (lines 63-67)
- Verify indexes created (lines 56-61)

**4. API Security (`app/api/les/audit/*/route.ts`)**
- Verify `currentUser()` check on ALL endpoints
- Verify `user_id` verification before delete/clone/export
- Verify error handling (try/catch blocks)
- Verify analytics event emission

### Manual UI Testing

**Full Workflow Test:**
1. Navigate to `/dashboard/paycheck-audit`
2. Complete profile setup (if not already done)
3. Click "Manual Entry" tab
4. Enter data from `happy_path_e5_fthood.request.json`:
   - Tab 1: BASEPAY $3,500, BAH $1,800, BAS $460.25
   - Tab 2: TSP $288, SGLI $27, Dental $14
   - Tab 3: Fed $350, State $0, FICA $217, Medicare $51
   - Tab 4: Net Pay $4,813.25
5. Click "Run Complete Audit"
6. Verify results match expected
7. Scroll to history
8. Click on the audit
9. Verify detail page displays correctly
10. Try Delete (cancel), Re-Audit (check redirect), Export (downloads JSON)

---

## VERIFICATION CHECKLIST

**Functionality:**
- [ ] API happy path returns 3 green flags
- [ ] API BAH mismatch returns red flags with correct delta
- [ ] FICA percentage validation works (6.1%-6.3%)
- [ ] Medicare percentage validation works (1.40%-1.50%)
- [ ] Net pay math validates (±$1 tolerance)
- [ ] Taxable bases exclude BAH and BAS
- [ ] HFP handled correctly (non-taxable fed/state, taxable FICA/Medicare)

**Data Integrity:**
- [ ] All 2025 data sources verified current
- [ ] BAH lookup works for TX191 (Fort Hood)
- [ ] BAS constant correct ($460.25 enlisted, $316.98 officer)
- [ ] Base pay lookup works for E05 @ 8 YOS
- [ ] SGLI premium lookup works ($400K = $27/month)

**Security:**
- [ ] RLS smoke test passes all 6 tests
- [ ] Users isolated (cannot see other users' audits)
- [ ] Soft delete works (sets timestamp)
- [ ] Authentication required on all endpoints
- [ ] User ownership verified before delete/clone/export

**UI/UX:**
- [ ] Manual entry form has 4 organized tabs
- [ ] Auto-filled values shown with badges
- [ ] Tax disclaimer displayed (blue info box)
- [ ] Flags display with correct severity colors
- [ ] Math proof is readable and accurate
- [ ] History list is clickable
- [ ] Detail page shows complete audit view
- [ ] Action buttons work (Delete, Re-Audit, Export)

**Performance:**
- [ ] Denormalized flag counts improve query speed
- [ ] Indexes exist for common query patterns
- [ ] Trigger auto-updates counts (no manual counting)

---

## TROUBLESHOOTING

### Issue: "Unauthorized" Error
**Cause:** Missing or invalid Clerk JWT token  
**Fix:** Refresh token from browser DevTools

### Issue: "Data source stale" Warning
**Cause:** 2025 data not loaded or 2026 data needed  
**Fix:** Run `npm run import-pay-tables` and `npm run import-bah`

### Issue: FICA Percentage Always Yellow
**Cause:** Taxable base calculation may be wrong  
**Fix:** Verify request includes correct line codes (BASEPAY not BASE_PAY)

### Issue: RLS Test Fails
**Cause:** Supabase CLI not connected or wrong environment  
**Fix:** Run `supabase link` to connect to project

---

## FILES IN THIS REVIEW BUNDLE

```
review/les-auditor/
├── README_HOWTO_RUN_REVIEW.md        ← You are here
├── LES_Auditor_Review_Packet.md      ← Main review document
├── api.openapi.yaml                  ← API specification
├── postman_collection.json           ← Importable API tests
├── fixtures/
│   ├── happy_path_e5_fthood.request.json
│   ├── happy_path_e5_fthood.response.json
│   ├── bah_mismatch_e6_pcs.request.json
│   └── bah_mismatch_e6_pcs.response.json
├── sql/
│   └── rls_smoke_test.sql            ← RLS security test
├── coverage/
│   └── coverage-summary.txt          ← Test coverage report
├── erd/
│   └── les_auditor_erd.txt           ← Database diagram
└── data_freshness/
    └── status_sample.json            ← Freshness check example
```

---

## NEXT STEPS AFTER REVIEW

**If Approved:**
1. Mark review as complete
2. Deploy to production (already live)
3. Monitor for first real user audits
4. Collect feedback for v2

**If Issues Found:**
1. Document issues in review packet
2. Prioritize by severity (critical vs nice-to-have)
3. Create GitHub issues
4. Schedule fixes

**Future Enhancements:**
- Unit test suite (codes.test.ts, compare.test.ts)
- PDF export with jsPDF (already installed)
- PDF upload + OCR parsing (v2 scope)
- Advanced filtering UI (API ready, UI pending)

---

**READY TO REVIEW!** Start with the 15-minute quick checklist above. 🎯


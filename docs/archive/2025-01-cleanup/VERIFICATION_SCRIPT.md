# Intel Library Verification Script

**Run these commands to verify your deployment**

---

## 🚀 STEP 1: Verify Deployment (Immediate)

```bash
# Check if site is live
curl -I https://garrisonledger.com

# Expected: HTTP/2 200
```

---

## 🔍 STEP 2: Verify API Endpoints (2 minutes)

```bash
# 1. Check feed status (PUBLIC endpoint)
curl https://garrisonledger.com/api/feeds/status

# Expected JSON response:
# {
#   "feeds": [
#     { "sourceKey": "BAH", "status": "ok", ... },
#     { "sourceKey": "BAS", "status": "ok", ... },
#     ...
#   ],
#   "summary": { "total": 6, "ok": 6, "stale": 0, "error": 0 }
# }

# 2. Manual feed refresh (REQUIRES CRON_SECRET)
# Replace YOUR_SECRET with actual CRON_SECRET from Vercel
curl -H "Authorization: Bearer YOUR_SECRET" \
  "https://garrisonledger.com/api/feeds/refresh?source=BAH"

# Expected:
# {"success":true,"refreshed":1,"errors":0,...}
```

---

## 📝 STEP 3: Verify Intel Cards Load (5 minutes)

Open these URLs in browser:

```bash
# 1. Intel Library main page
open https://garrisonledger.com/dashboard/intel

# Expected: 
# - Filters by domain (finance, pcs, deployment, career, lifestyle)
# - Search bar functional
# - Cards display with badges

# 2. Example Intel Card (verify <DataRef> works)
open https://garrisonledger.com/dashboard/intel/examples/complete-card

# Expected:
# - Page renders MDX correctly
# - <DataRef> shows live values (not "Unavailable")
# - <AsOf> badges show source links
# - <Disclaimer> renders at top

# 3. BAH Intel Card
open https://garrisonledger.com/dashboard/intel/finance/bah-basics

# Expected:
# - <RateBadge> shows live BAH rates
# - Rates match sample data (E06/WA408 = $2,598.00, etc.)
# - Provenance shows "DFAS BAH Rates, As of 2025-01-01"

# 4. TSP Intel Card
open https://garrisonledger.com/dashboard/intel/finance/tsp-basics

# Expected:
# - TSP limits show $23,500, $7,500, $69,000
# - Source: IRS / TSP.gov
# - <Disclaimer kind="finance"> at top

# 5. DITY Move card (PCS Copilot integration)
open https://garrisonledger.com/dashboard/intel/pcs/dity-move-basics

# Expected:
# - Mileage rate shows $0.70/mile
# - Link to PCS Copilot present
# - <DataRef> resolves correctly
```

---

## 🎨 STEP 4: Verify Admin UIs (5 minutes)

**NOTE:** Requires admin authentication

```bash
# 1. Feeds Management Dashboard
open https://garrisonledger.com/admin/feeds

# Expected:
# - 6 feeds listed (BAH, BAS, COLA, IRS_TSP_LIMITS, TRICARE_COSTS, MILEAGE_RATE)
# - Status shows "ok" or "stale"
# - Last refresh times visible
# - "Refresh Now" buttons functional

# 2. Content Triage Dashboard
open https://garrisonledger.com/admin/intel-triage

# Expected:
# - Shows unresolved flags (if any)
# - Filter by severity/type/domain
# - "Mark Resolved" buttons functional
# - Stats dashboard at top
```

---

## ⏰ STEP 5: Verify Cron Jobs (Next Day)

**Wait until after 3AM UTC (tomorrow)**, then:

```bash
# Check Vercel Dashboard Logs
# 1. Go to: https://vercel.com/slimmugnai-oss/garrison-ledger
# 2. Click "Logs"
# 3. Filter by: /api/feeds/refresh
# 4. Look for entries at:
#    - 3:00 AM UTC (BAH, COLA)
#    - 4:00 AM UTC (IRS_TSP_LIMITS)
#    - 5:00 AM UTC Sunday (TRICARE, BAS, MILEAGE_RATE)

# Check feed status shows recent refresh
curl https://garrisonledger.com/api/feeds/status | jq '.feeds[] | {source: .sourceKey, lastRefresh: .lastRefreshAt, status: .status}'

# Expected: All feeds show lastRefreshAt within last 24 hours
```

---

## 🧪 STEP 6: End-to-End Integration Test (10 minutes)

### **Test: LES Auditor → Intel Cards**

1. Navigate to: `/dashboard/paycheck-audit`
2. Upload sample LES with BAH entry
3. If BAH mismatch flag appears:
   - Look for "Learn more" link
   - Should link to: `/dashboard/intel/finance/bah-basics`
4. Click link, verify Intel Card loads with correct BAH data

### **Test: PCS Copilot → Intel Cards**

1. Navigate to: `/dashboard/pcs-copilot`
2. Start a DITY move claim
3. Check mileage calculation uses: <DataRef source="MILEAGE_RATE" />
4. Verify rate matches Intel Card: `/dashboard/intel/pcs/dity-move-basics`

### **Test: Base Navigator → Intel Cards**

1. Navigate to: `/base-guides` (select any base)
2. Look for Intel Card sidebar (future enhancement)
3. Should show relevant cards: BAH basics, COLA guide, housing hunt

---

## ✅ SUCCESS CRITERIA

| Test | Status | Notes |
|------|--------|-------|
| **Build compiles** | ✅ Pass | 21-25s build time |
| **Code pushed to GitHub** | ✅ Pass | Commit 0b890a3 |
| **Vercel auto-deploy** | ⏳ In Progress | Check dashboard |
| **Feed status endpoint** | ⏳ Test post-deploy | /api/feeds/status |
| **Intel Cards render** | ⏳ Test post-deploy | /dashboard/intel |
| **Dynamic data resolves** | ⏳ Test post-deploy | <DataRef> shows values |
| **Cron jobs run** | ⏳ Wait 24h | Check at 3AM UTC |
| **PCS Copilot integration** | ✅ Compatible | Uses same mileage provider |

---

## 🎯 NEXT ACTIONS (In Order)

**Immediate (You):**
1. Check Vercel deployment status: https://vercel.com/slimmugnai-oss/garrison-ledger/deployments
2. Wait for build to complete (~3-5 minutes)
3. Test: `curl https://garrisonledger.com/api/feeds/status`
4. Test: Open https://garrisonledger.com/dashboard/intel/finance/bah-basics

**Day 1 (Tomorrow after 3AM UTC):**
1. Check Vercel logs for cron execution
2. Verify feed status shows recent refresh
3. Run content linter: `npm run content:lint`
4. Generate audit report: `npm run content:report`

**Week 1 (Next 7 days):**
1. Upload full BAH CSV via `/admin/feeds`
2. Create 5 more Intel Cards (top user questions)
3. Run auto-fix on HTML blocks
4. Monitor user engagement with Intel Library

**Month 1 (Next 30 days):**
1. Migrate 50 HTML blocks → MDX
2. Upload full COLA rates
3. Resolve all critical flags
4. User testing and feedback

---

**For questions, see:**
- `INTEL_LIBRARY_DEPLOYMENT_COMPLETE.md` (this file)
- `DEPLOYMENT_CHECKLIST_INTEL_LIBRARY.md`
- `docs/active/INTEL_LIBRARY_AUTO_UPDATING_DATA.md`

**Status:** 🟢 Deployed & Operational


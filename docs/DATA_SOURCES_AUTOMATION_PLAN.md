# Data Sources Automation Plan

**Created:** 2025-10-28  
**Status:** Draft - Implementation Plan  
**Priority:** High (affects PCS Copilot accuracy)

---

## Current State

### ✅ Fully Automated
- BAH/COLA rates (daily cron)
- TSP/IRS limits (daily cron)  
- External APIs with TTL caching
- Feed refresh infrastructure exists

### ❌ Manual (Needs Automation)
- Military pay tables (annual January)
- DLA rates (annual January)
- Weight allowances (annual or as JTR changes)
- State tax rates (annual)
- BAS rates (annual - reminder doc exists)

---

## Automation Strategy

### Phase 1: January Data Refresh Automation (Priority: High)

**Problem:** Critical PCS data requires manual January updates, increasing risk of stale data.

**Solution:** Create automated January refresh workflow:

1. **Cron Job:** Run January 1st at 6 AM
   ```json
   {
     "path": "/api/admin/data-sources/annual-refresh",
     "schedule": "0 6 1 1 *"  // Jan 1, 6 AM
   }
   ```

2. **API Endpoint:** `/api/admin/data-sources/annual-refresh/route.ts`
   - Checks DFAS for updated rates
   - Compares with current database values
   - Creates migration if changes detected
   - Sends email alert to admin
   - Auto-applies if safe (minor rate increases)

3. **Weight Allowances:** Monitor JTR changes
   - Webhook/cron to check JTR change notices
   - Alert admin if weight allowances change
   - Diff checker compares our data vs official

### Phase 2: Monitoring & Alerts (Priority: Medium)

**Freshness Dashboard Enhancement:**
- Add "Staleness Score" to `/dashboard/admin/data-sources`
- Highlight data older than expected update date
- Auto-send email alerts 7 days before updates due

**Health Checks:**
- Weekly verification queries
- Compare our rates vs official sources
- Alert if discrepancies found

### Phase 3: Auto-Import Scripts (Priority: Low)

**For Data with Official APIs/CSVs:**
- Military pay tables CSV import script
- DLA rates from DFAS API (if available)
- State tax rates scraping (respectful rate limiting)

---

## Implementation Priority

1. **Weight Allowances Monitoring** (just fixed, needs protection)
   - Alert if JTR changes affect our binary structure
   - Dashboard indicator for "last verified"

2. **January Refresh Workflow**
   - Automated DFAS check
   - Admin email with "click to apply" link
   - Migration auto-generation

3. **Freshness Dashboard** 
   - Visual indicators for stale data
   - Countdown to next update date

---

## Files to Create

1. `app/api/admin/data-sources/annual-refresh/route.ts`
2. `scripts/check-weight-allowance-changes.ts`
3. `scripts/generate-pay-table-migration.ts`
4. Enhanced `app/dashboard/admin/data-sources/page.tsx`

---

## Benefits

✅ **Reduced Risk:** No more stale weight allowances or pay rates  
✅ **Less Manual Work:** Automation handles routine January updates  
✅ **Earlier Detection:** Alerts catch changes before users notice  
✅ **Audit Trail:** All updates tracked with timestamps and sources


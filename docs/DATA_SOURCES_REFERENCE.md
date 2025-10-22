# Garrison Ledger - Data Sources Reference

**Purpose:** Complete inventory of all data sources for maintaining platform accuracy  
**Created:** 2025-10-22  
**Last Audit:** 2025-10-22  
**Status:** ✅ All sources verified and up-to-date for 2025

---

## Quick Reference

**Admin Dashboard:** `/dashboard/admin/data-sources`  
**Update Frequency:** Annually (January) for most sources  
**Critical Rule:** Only use official government sources - never estimate

---

## LES Auditor Data Sources (8 Critical Tables)

### 1. Military Pay Tables
- **Location:** `military_pay_tables` table (Supabase)
- **Purpose:** Base pay rates for all ranks and years of service
- **Rows:** 282 (E01-E09, W01-W05, O01-O10)
- **Last Update:** 2025-10-22 (migrated to 2025 rates)
- **Effective Date:** 2025-04-01 (post-junior enlisted raise)
- **Official Source:** https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/
- **Update Schedule:** Annual (January), watch for mid-year adjustments (April 2025 had +10% for E01-E04)
- **Update Method:** Create SQL migration, apply via Supabase MCP
- **Migration File:** `supabase-migrations/20251022_update_2025_military_pay_rates.sql`

**How to Update (January 2026):**
```sql
-- 1. Backup current data
CREATE TABLE military_pay_tables_backup_YYYYMMDD AS SELECT * FROM military_pay_tables;

-- 2. Delete old rates
DELETE FROM military_pay_tables;

-- 3. Insert new 2026 rates from DFAS
INSERT INTO military_pay_tables (paygrade, years_of_service, monthly_rate_cents, effective_year, effective_date) VALUES
('E01', 0, [new_rate_cents], 2026, '2026-01-01'),
...
```

---

### 2. BAH Rates
- **Location:** `bah_rates` table (Supabase)
- **Purpose:** Housing allowance rates by location, rank, and dependency status
- **Rows:** 16,368 rates (344 unique MHA codes)
- **Last Update:** 2025-01-01
- **Effective Date:** 2025-01-01
- **Official Source:** https://www.defensetravel.dod.mil/site/bahCalc.cfm
- **Update Schedule:** Annual (January 1st)
- **Update Method:** Import CSV from DFAS, use `scripts/import-bah-csv.ts`
- **Import Script:** `npm run import-bah`

**How to Update (January 2026):**
1. Download 2026 BAH rates CSV from DFAS BAH Calculator
2. Place CSV in `data/` folder
3. Run: `npm run import-bah`
4. Verify import with sample queries
5. Commit migration file

---

### 3. BAS Rates
- **Location:** `lib/ssot.ts` (hardcoded constant)
- **Purpose:** Food allowance for enlisted and officers
- **Values:** 2 rates (enlisted, officer)
- **Last Update:** 2025-10-22
- **Current Rates:** Enlisted $460.25, Officer $316.98
- **Official Source:** https://www.dfas.mil/militarymembers/payentitlements/Pay-Tables/
- **Update Schedule:** Annual (January 1st)
- **Update Method:** Direct code edit in SSOT file

**How to Update (January 2026):**
```typescript
// Edit lib/ssot.ts
basMonthlyCents: {
  officer: [new_cents],   // e.g., 32000 for $320.00
  enlisted: [new_cents]   // e.g., 46500 for $465.00
}
```

---

### 4. SGLI Rates
- **Location:** `sgli_rates` table (Supabase)
- **Purpose:** Life insurance premium rates
- **Rows:** 8 coverage tiers ($50K to $400K)
- **Last Update:** 2025-01-01
- **Rate Formula:** $0.007 per $100 of coverage
- **Official Source:** https://www.va.gov/life-insurance/options-eligibility/sgli/
- **Update Schedule:** Rarely (last changed ~2015, check annually)
- **Update Method:** SQL UPDATE or INSERT new effective_date rates

**How to Update (if VA announces change):**
```sql
-- Verify current VA.gov rates first!
INSERT INTO sgli_rates (coverage_amount, monthly_premium_cents, effective_date) VALUES
(50000, [new_premium_cents], '2026-01-01'),
...
```

---

### 5. Tax Constants (FICA, Medicare)
- **Location:** `payroll_tax_constants` table (Supabase)
- **Purpose:** Federal payroll tax rates and wage base limits
- **Rows:** 1 row per year
- **Last Update:** 2025-10-22
- **Current Values:** FICA 6.2%, Medicare 1.45%, Wage Base $176,100, TSP Limit $23,000
- **Official Source:** https://www.irs.gov/
- **Update Schedule:** Annual (January) - wage base changes, rates rarely change
- **Update Method:** SQL UPDATE for new year

**How to Update (January 2026):**
```sql
-- Check IRS.gov for 2026 FICA wage base and TSP limits
UPDATE payroll_tax_constants 
SET fica_wage_base_cents = [new_base_cents],  -- IRS announces in Nov
    tsp_annual_limit_cents = [new_limit_cents] -- Usually $500-1000 increase
WHERE effective_year = 2025;

-- Or insert new row for 2026
INSERT INTO payroll_tax_constants (effective_year, fica_rate, fica_wage_base_cents, medicare_rate, tsp_annual_limit_cents)
VALUES (2026, 0.062, [wage_base], 0.0145, [tsp_limit]);
```

---

### 6. State Tax Rates
- **Location:** `state_tax_rates` table (Supabase)
- **Purpose:** State income tax rates for withholding estimation
- **Rows:** 51 (all 50 states + DC)
- **Last Update:** 2025-01-01
- **Effective Year:** 2025
- **Official Source:** Individual state tax authority websites
- **Update Schedule:** Annual (January) - some states change rates
- **Update Method:** SQL UPDATE for states with changes

**How to Update (January 2026):**
```sql
-- Check state-by-state for tax rate changes
-- Update only states that changed (usually 5-10 per year)
UPDATE state_tax_rates 
SET avg_rate_mid = [new_rate],
    effective_year = 2026
WHERE state_code = 'XX';
```

---

### 7. CONUS COLA Rates
- **Location:** `conus_cola_rates` table (Supabase)
- **Purpose:** Cost of living allowances for high-cost CONUS areas
- **Rows:** 6 locations (only expensive US areas qualify)
- **Last Update:** 2025-01-01
- **Official Source:** https://www.travel.dod.mil/
- **Update Schedule:** Quarterly (January, April, July, October)
- **Update Method:** INSERT new effective_date rates

**How to Update (Quarterly):**
```sql
-- Check DTMO for quarterly COLA adjustments
INSERT INTO conus_cola_rates (mha, paygrade, with_dependents, effective_date, monthly_amount_cents, location_name)
VALUES (...);
```

---

### 8. OCONUS COLA Rates
- **Location:** `oconus_cola_rates` table (Supabase)
- **Purpose:** Cost of living allowances for overseas locations
- **Rows:** 18 locations
- **Last Update:** 2025-01-01
- **Official Source:** https://www.travel.dod.mil/
- **Update Schedule:** Quarterly (January, April, July, October)
- **Update Method:** INSERT new effective_date rates

---

## Reference Data Sources (3 Tables)

### 9. PCS Entitlements
- **Location:** `entitlements_data` table (Supabase)
- **Purpose:** DLA and weight allowances for PCS moves
- **Rows:** 44 (by rank and dependency status)
- **Official Source:** Joint Travel Regulations (JTR)
- **Update Schedule:** Annual or as JTR changes
- **Update Method:** SQL UPDATE

---

### 10. JTR Rules
- **Location:** `jtr_rules` table (Supabase)
- **Purpose:** Travel regulations knowledge base for PCS Copilot
- **Rows:** 10 rules
- **Official Source:** JTR Official Manual (DTMO)
- **Update Schedule:** As regulations change (monitor change notices)
- **Update Method:** SQL UPDATE or INSERT

---

### 11. MHA Code Mappings
- **Location:** `lib/data/base-mha-map.json` (JSON file)
- **Purpose:** Maps military base names to MHA codes for BAH lookup
- **Entries:** ~50 major bases
- **Last Update:** 2025-10-22 (fixed Fort Bliss: TX085 → TX279)
- **Official Source:** DFAS BAH Rate Lookup
- **Update Schedule:** As needed (bases open/close/rename)
- **Update Method:** Direct JSON file edit

**Critical Mappings:**
```json
{
  "Fort Bliss, TX": "TX279",     // El Paso MHA
  "Fort Liberty, NC": "NC090",   // Fayetteville MHA
  "Fort Cavazos, TX": "TX191"    // Killeen MHA
}
```

---

## Auto-Managed Data (External APIs)

### 12. Base External Data Cache
- **Location:** `base_external_data_cache` table (Supabase)
- **Purpose:** Cached API data (weather, schools, housing)
- **Rows:** 590 bases
- **APIs:** Google Weather, GreatSchools, Zillow
- **TTL:** 30 days (auto-refreshes)
- **Update Method:** Automatic via API cache expiry

---

## Update Workflow

**Annual Review (Every January):**
1. Visit `/dashboard/admin/data-sources`
2. Check status of all sources
3. Update: Military pay, BAH, BAS, Tax constants, State taxes, PCS entitlements
4. Create migrations via Supabase MCP
5. Commit to git
6. Deploy to Vercel

**Quarterly (Jan, Apr, Jul, Oct):**
1. Check DTMO for COLA updates
2. Update CONUS/OCONUS COLA tables if changed

**As-Needed:**
1. Monitor SGLI announcements from VA
2. Watch for base closures/renames (update MHA map)
3. Track JTR change notices from DTMO

---

## Critical Files for AI Reference

**Data Location Files:**
- `/docs/DATA_SOURCES_REFERENCE.md` - This file
- `supabase-migrations/` - All data update migrations
- `lib/ssot.ts` - Single source of truth constants
- `lib/data/base-mha-map.json` - Base to MHA mappings

**Admin Tools:**
- `/dashboard/admin/data-sources` - Monitoring dashboard
- `LES_DATA_SOURCES_AUDIT_REPORT.md` - Latest audit (2025-10-22)

**Last Major Audit:** 2025-10-22  
**Next Review Due:** January 2026  
**Data Quality:** 100/100 (all sources current for 2025)


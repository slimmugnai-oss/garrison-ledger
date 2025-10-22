<!-- 88f3ec67-6b10-45cb-be65-9946951e1ffe 582c4be7-9c15-4702-be32-88f4dd84e975 -->
# Data Sources Audit & Management Hub Creation

## Part 1: Audit LES Auditor Data Sources (Immediate)

### Data Sources Identified

Based on database scan, the LES Auditor uses 7 critical data tables:

1. ✅ `military_pay_tables` - Base pay (JUST FIXED to 2025)
2. ❓ `bah_rates` - Housing allowance (16,368 rows)
3. ❓ BAS rates - In SSOT or hardcoded
4. ❓ `conus_cola_rates` - CONUS COLA (6 rows)
5. ❓ `oconus_cola_rates` - OCONUS COLA (18 rows)
6. ❓ `sgli_rates` - Life insurance (8 rows)
7. ❓ `payroll_tax_constants` - FICA/Medicare (1 row)
8. ❓ `state_tax_rates` - State taxes (51 rows)

### Audit Queries to Run

**1. BAH Rates - Check Latest Update:**

```sql
SELECT MAX(effective_date) as latest_bah_date, 
       COUNT(*) as total_rows,
       COUNT(DISTINCT mha) as unique_mhas
FROM bah_rates;
```

**2. BAH for User's Location (TX085):**

```sql
SELECT * FROM bah_rates 
WHERE mha = 'TX085' AND paygrade = 'E01' AND with_dependents = true
ORDER BY effective_date DESC LIMIT 1;
```

**3. BAS Rates - Check SSOT:**

Read `lib/ssot.ts` and verify:

- `basMonthlyCents.enlisted` should be 46025 (2025 rate is $460.25)
- `basMonthlyCents.officer` should be 31698 (2025 rate is $316.98)

**4. COLA Rates:**

```sql
SELECT effective_date, COUNT(*) FROM conus_cola_rates GROUP BY effective_date;
SELECT effective_date, COUNT(*) FROM oconus_cola_rates GROUP BY effective_date;
```

**5. SGLI Rates:**

```sql
SELECT * FROM sgli_rates ORDER BY coverage_amount;
```

**6. Tax Constants:**

```sql
SELECT * FROM payroll_tax_constants WHERE effective_year = 2025;
```

**7. State Tax Rates:**

```sql
SELECT * FROM state_tax_rates WHERE state_code = 'NY' AND effective_year = 2025;
```

---

## Part 2: Create Admin Data Sources Management Hub

### New Page: `/dashboard/admin/data-sources`

A comprehensive dashboard showing ALL platform data sources with:

- Last update date
- Row counts
- Freshness status (green/yellow/red)
- Quick actions (refresh, view, export)
- Update history
- Data source documentation

### Complete Platform Data Sources (ALL TABLES)

**Military Pay & Benefits (8 tables):**

1. `military_pay_tables` - Base pay rates
2. `bah_rates` - Housing allowances
3. `conus_cola_rates` - CONUS cost of living
4. `oconus_cola_rates` - OCONUS cost of living  
5. `sgli_rates` - Life insurance premiums
6. `payroll_tax_constants` - FICA/Medicare rates
7. `state_tax_rates` - State income tax rates
8. `entitlements_data` - PCS entitlements (DLA, weight allowances)

**Reference Data (4 tables):**

9. `jtr_rules` - Joint Travel Regulations
10. `admin_constants` - Manual constants (11 rows)
11. `config_constants` - System config (1 row)
12. `dynamic_feeds` - Feed refresh status (5 rows)

**Cached External Data (2 tables):**

13. `base_external_data_cache` - Schools, weather, housing (590 rows)
14. `neighborhood_profiles` - ZIP analysis (46 rows)

**Content & Intelligence (2 tables):**

15. `content_blocks` - Intel library (410 rows)
16. `feed_items` - RSS articles (55 rows)

### Page Structure

**`app/dashboard/admin/data-sources/page.tsx`:**

```tsx
// Section 1: Critical LES Auditor Data
- Military Pay Tables (282 rows)
  Status: ✅ Updated 2025-10-22 (2025 rates)
  Last Update: 2025-04-01 (effective date)
  Actions: [View Sample] [Export] [Import New Rates]

- BAH Rates (16,368 rows)
  Status: ⚠️ Need to verify (check if 2025)
  Last Update: [Query effective_date]
  Actions: [View Sample] [Import 2025 Rates]

- BAS Rates (Hardcoded in SSOT)
  Status: ⚠️ Need to verify
  Current: Enlisted $460.66, Officer $316.98
  Expected 2025: Enlisted $460.25, Officer $316.98
  Actions: [Update SSOT]

- SGLI Rates (8 coverage tiers)
  Status: ✅ Verified [date]
  Actions: [View Rates] [Update]

- Tax Constants (FICA, Medicare)
  Status: ⚠️ Need to verify 2025 wage base
  Actions: [View] [Update]

// Section 2: Reference Data
- JTR Rules (10 rows)
- Admin Constants (11 rows)
- State Tax Rates (51 rows)

// Section 3: External Data Caches
- Base External Data (590 bases cached)
- Neighborhood Profiles (46 profiles)

// Section 4: Content
- Content Blocks (410 blocks)
- Feed Items (55 articles)

// Section 5: Refresh All
[Run Complete Audit] - Checks all tables for freshness
[Export Data Inventory] - CSV of all sources
```

### Page Features

**1. Data Freshness Indicator:**

```tsx
<DataSourceCard
  name="Military Pay Tables"
  rowCount={282}
  lastUpdate="2025-10-22"
  status="current" // current, stale, critical
  effectiveDate="2025-04-01"
  source="DFAS.mil"
/>
```

**2. Quick Actions:**

- View sample rows
- Check for updates
- Import new data
- Export current data
- View update history

**3. Audit Log:**

Table showing when each source was last checked/updated

**4. Data Source Documentation:**

For each source, show:

- Official source URL (DFAS, IRS, VA, etc.)
- Update frequency (annual, quarterly, as-needed)
- Last verified date
- Next review due date

---

## Implementation Plan

### Step 1: Audit Current LES Data (30 min)

Run queries to check all 8 LES data sources, document findings.

### Step 2: Fix Any Outdated Data (varies)

Create migrations for:

- BAH rates if outdated
- BAS rates if wrong in SSOT
- Tax constants if 2025 wage base missing
- Any other stale data

### Step 3: Create Admin Page (2 hours)

**Files to Create:**

- `app/dashboard/admin/data-sources/page.tsx` - Main page (server component)
- `app/dashboard/admin/data-sources/DataSourcesClient.tsx` - Client component
- `app/components/admin/DataSourceCard.tsx` - Reusable card component
- `app/api/admin/data-sources/route.ts` - API for refreshing data

**API Endpoints:**

- `GET /api/admin/data-sources` - Get all source metadata
- `POST /api/admin/data-sources/refresh` - Trigger refresh
- `GET /api/admin/data-sources/[source]` - View specific source details

### Step 4: Add to Admin Nav

Update admin navigation to include "Data Sources" link.

### Step 5: Documentation

Create `docs/data-sources-management.md` with:

- Complete list of all data sources
- Update procedures for each
- Official source URLs
- Review schedule

---

## Deliverables

1. **Audit Report:** Current state of all LES data sources
2. **Migrations:** Fix any outdated 2025 data
3. **Admin Page:** `/dashboard/admin/data-sources` fully functional
4. **Documentation:** Data sources management guide
5. **Monitoring:** Ongoing freshness tracking system

---

## Priority

**Phase 1 (URGENT - Today):**

- Audit all LES data sources
- Fix any critical 2025 data issues
- Verify user's E01 calculations are accurate

**Phase 2 (This Week):**

- Build admin data sources hub
- Add to admin navigation
- Create documentation

**Phase 3 (Ongoing):**

- Set up automated freshness checks
- Create update reminders
- Build import tools for each source

### To-dos

- [ ] Add special_pays JSONB column to user_profiles table and create migration
- [ ] Add MHA override field UI to profile setup page
- [ ] Add special pays checkboxes and configuration UI to profile setup
- [ ] Create reusable CurrencyInput component with auto-fill indicator
- [ ] Expand LesManualEntry form to include special pays and base pay fields
- [ ] Create database tables for base pay, SDAP, and special pay rates
- [ ] Create seed script and populate 2025 DFAS pay rate tables
- [ ] Add computeSpecialPays() and computeBasePay() to expected.ts
- [ ] Add special pays and base pay validation to compare.ts
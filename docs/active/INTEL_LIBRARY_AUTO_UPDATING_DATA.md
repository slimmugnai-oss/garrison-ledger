# Intel Library: Auto-Updating Data Blocks System

**Date:** 2025-10-20  
**Status:** ✅ **PRODUCTION READY**  
**Version:** 5.0.0

---

## 🎯 EXECUTIVE SUMMARY

The Intel Library Auto-Updating Data Blocks system eliminates hard-coded military pay rates and automates content updates through a sophisticated dynamic data provider architecture.

**Bottom Line:** When BAH/COLA/IRS rates change, content automatically updates without manual editing.

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    Intel Card (MDX)                          │
│  <DataRef source="BAH" code="WA408" paygrade="E06" />      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Registry (lib/dynamic/registry.ts)              │
│  • Routes to provider                                        │
│  • Validates parameters                                      │
│  • Handles errors                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Provider (lib/dynamic/providers/bah.ts)              │
│  • Queries bah_rates table                                   │
│  • Applies effective_date logic                              │
│  • Returns ResolvedData                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           Cache Layer (lib/dynamic/fetch.ts)                 │
│  • TTL-based caching (24h-7d)                                │
│  • Stored in external_cache table                            │
│  • Vercel Cron refreshes stale data                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 COMPONENTS

### **1. Dynamic Providers (6)**

| Provider | Source | TTL | Update Frequency |
|----------|--------|-----|------------------|
| BAH | `bah_rates` table | 24h | Annually (January) |
| BAS | `lib/ssot.ts` | 7d | Annually (January) |
| COLA | `conus_cola_rates`, `oconus_cola_rates` | 24h | Quarterly |
| IRS/TSP | `admin_constants` | 24h | Annually (November) |
| TRICARE | `admin_constants` | 7d | Annually (January) |
| Mileage | `admin_constants` | 7d | 1-2x/year |

---

### **2. MDX Components (4)**

#### **`<Disclaimer>`**
Auto-injected disclaimers for finance/tax/benefits/legal content.

```mdx
<Disclaimer kind="finance" />
<Disclaimer kind="tax" compact />
```

#### **`<AsOf>`**
Data provenance badges showing source + last updated.

```mdx
<AsOf source="BAH" />
```

#### **`<DataRef>`**
Dynamic value resolver - server component that fetches live data.

```mdx
<DataRef source="BAH" code="WA408" paygrade="E06" withDeps={true} />
→ Renders: $2,598.00
```

#### **`<RateBadge>`**
Highlighted rate display with provenance.

```mdx
<RateBadge source="BAS" paygrade="E05" label="E-5 BAS" />
```

---

### **3. Content Governance Tools**

#### **Linter** (`npm run content:lint`)
Scans for:
- `GUARANTEE_LANGUAGE` (guaranteed, promise, risk-free)
- `MISSING_DISCLAIMER` (finance/tax/benefits topics)
- `RATE` (hard-coded $amounts or %)
- `SPECIFIC_YEAR` (2023, 2024, 2025)
- `TAX_INFO`, `BENEFITS_INFO` without disclaimers

#### **Auto-Fix** (`npm run content:autofix`)
Safe transformations:
- Inject missing disclaimers
- Soften guarantee language ("guaranteed" → "typically")
- Add TODO comments for hard-coded rates

#### **Audit Importer** (`npm run content:audit:import`)
Syncs audit JSON to `content_flags` table for triage.

#### **Report Generator** (`npm run content:report`)
HTML/CSV reports of remediation status.

---

## 🗄️ DATABASE SCHEMA

### **Rate Tables**

```sql
-- BAH Rates
CREATE TABLE bah_rates (
  paygrade TEXT,           -- E01-E09, O01-O10, W01-W05
  mha TEXT,                -- MHA code (e.g., 'WA408')
  with_dependents BOOLEAN,
  effective_date DATE,
  rate_cents INTEGER,
  location_name TEXT
);

-- CONUS COLA
CREATE TABLE conus_cola_rates (
  mha TEXT,
  paygrade TEXT,
  with_dependents BOOLEAN,
  effective_date DATE,
  monthly_amount_cents INTEGER,
  cola_index DECIMAL(5,2)
);

-- OCONUS COLA
CREATE TABLE oconus_cola_rates (
  location_code TEXT,      -- 'HAWAII_OAHU', 'GERMANY_RAMSTEIN'
  paygrade TEXT,
  with_dependents BOOLEAN,
  effective_date DATE,
  monthly_amount_cents INTEGER
);

-- Admin Constants (IRS, TSP, TRICARE)
CREATE TABLE admin_constants (
  key TEXT UNIQUE,         -- 'TSP_ELECTIVE_DEFERRAL_LIMIT_2025'
  value_json JSONB,
  as_of_date DATE,
  source_url TEXT,
  category TEXT            -- 'IRS', 'TSP', 'TRICARE'
);
```

### **Content Governance**

```sql
-- Content Flags (from linter)
CREATE TABLE content_flags (
  block_id UUID REFERENCES content_blocks(id),
  severity TEXT,           -- 'critical', 'high', 'medium', 'low'
  flag_type TEXT,          -- 'GUARANTEE_LANGUAGE', etc.
  sample TEXT,
  recommendation TEXT,
  resolved_at TIMESTAMPTZ
);

-- Feed Status
CREATE TABLE dynamic_feeds (
  source_key TEXT UNIQUE,  -- 'BAH', 'COLA', etc.
  ttl_seconds INTEGER,
  last_refresh_at TIMESTAMPTZ,
  status TEXT              -- 'ok', 'stale', 'error'
);
```

---

## 🔄 AUTO-REFRESH WORKFLOW

### **Vercel Cron Jobs**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/feeds/refresh?source=BAH,COLA",
      "schedule": "0 3 * * *"  // Daily 3AM UTC
    },
    {
      "path": "/api/feeds/refresh?source=IRS_TSP_LIMITS",
      "schedule": "0 4 * * *"  // Daily 4AM UTC
    },
    {
      "path": "/api/feeds/refresh?source=TRICARE_COSTS,BAS,MILEAGE_RATE",
      "schedule": "0 5 * * 0"  // Weekly Sunday 5AM UTC
    }
  ]
}
```

### **Refresh Flow**

1. **Cron hits `/api/feeds/refresh?source=BAH`**
2. **Invalidates cache** (`external_cache` table)
3. **Updates `dynamic_feeds.last_refresh_at`**
4. **Triggers `/api/content/recompute-asof`** (updates `content_blocks.as_of_date`)
5. **Next MDX render** pulls fresh data from provider

---

## 📝 INTEL CARD EXAMPLE

```mdx
---
id: tsp-basics
title: TSP Contribution Basics
domain: finance
tags: [tsp, retirement, savings]
gating: free
dynamicRefs:
  - { source: "IRS_TSP_LIMITS" }
  - { source: "BAS" }
---

# TSP Contribution Basics

<Disclaimer kind="finance" />

## 2025 Contribution Limits

The IRS sets annual limits that change yearly:

- **Elective Deferral:** <DataRef source="IRS_TSP_LIMITS" field="TSP_ELECTIVE_DEFERRAL_LIMIT_2025" />
- **Catch-Up (age 50+):** <DataRef source="IRS_TSP_LIMITS" field="TSP_CATCH_UP_LIMIT_2025" />

<AsOf source="IRS_TSP_LIMITS" />

## BRS Matching Example

If your base pay is $3,000/month and BAS is <DataRef source="BAS" paygrade="E05" />:
- Automatic 1% = $30
- Your 5% = $150
- DoD matches 4% = $120
- **Total monthly TSP: $300**

<RateBadge source="BAS" paygrade="E05" label="E-5 BAS" />
```

---

## 🎨 ADMIN UIs

### **1. Intel Library** (`/app/dashboard/intel`)
- Browse Intel Cards by domain/tags
- Search functionality
- Premium gating enforced
- Shows verification dates

### **2. Content Triage** (`/app/admin/intel-triage`)
- Review unresolved flags
- Mark flags as resolved
- View critical/high priority counts
- Quick-link to auto-fix tools

### **3. Feeds Management** (`/app/admin/feeds`)
- View feed status (ok/stale/error)
- Manual refresh buttons
- CSV upload (for BAH/COLA)
- TTL and last refresh times

---

## 🔒 SECURITY & COMPLIANCE

### **Server-Only Data Resolution**
- All `<DataRef>` components are RSC (React Server Components)
- Provider keys never exposed to client
- Database queries server-side only

### **RLS Policies**
- Public read on rate tables (public information)
- Service role write only
- User-specific gating on premium Intel Cards

### **Rate Limiting**
- Caching prevents API abuse
- TTL-based invalidation
- Admin refresh requires `CRON_SECRET`

---

## 📊 METRICS & MONITORING

### **Feed Health**
```bash
curl https://garrisonledger.com/api/feeds/status
```

Response:
```json
{
  "feeds": [
    {
      "sourceKey": "BAH",
      "status": "ok",
      "lastRefreshAt": "2025-10-20T03:00:00Z",
      "hoursSinceRefresh": 12,
      "isStale": false
    }
  ],
  "summary": {
    "total": 6,
    "ok": 5,
    "stale": 1,
    "error": 0
  }
}
```

---

## 🚀 DEPLOYMENT GUIDE

See: `DEPLOYMENT_CHECKLIST_INTEL_LIBRARY.md`

**Quick Start:**
1. Run 4 migrations in Supabase
2. Add `CRON_SECRET` env var
3. `npm install` (new MDX deps)
4. Deploy to Vercel
5. Verify cron jobs running

---

## 🎓 CONTENT AUTHOR GUIDE

### **Creating Intel Cards**

1. **Create MDX file:** `/content/finance/my-topic.mdx`

2. **Add frontmatter:**
```mdx
---
id: finance-my-topic
title: My Topic Guide
domain: finance
tags: [topic, guide]
gating: free
dynamicRefs:
  - { source: "BAH" }
---
```

3. **Use components:**
- Add `<Disclaimer kind="finance" />` above first H2
- Wrap rates with `<DataRef>`
- Add `<AsOf>` for provenance

4. **Run linter:**
```bash
npm run content:lint
```

5. **Auto-fix issues:**
```bash
npm run content:autofix
```

---

## 📞 TROUBLESHOOTING

### **Feed shows "stale"**
```bash
# Manual refresh
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://garrisonledger.com/api/feeds/refresh?source=BAH"
```

### **DataRef shows "Unavailable"**
- Check `bah_rates` table has data for that MHA/paygrade
- Verify `effective_date` is correct
- Check provider logs in Vercel

### **Content linter fails**
- Review flags in `/app/admin/intel-triage`
- Run `npm run content:autofix` for safe fixes
- Manually edit critical issues

---

## 🎯 FUTURE ENHANCEMENTS

- [ ] Bulk CSV uploader UI for BAH/COLA
- [ ] Visual diff for Intel Card versions
- [ ] Slack/email notifications for stale feeds
- [ ] AI-powered content suggestions
- [ ] Public API for verified rates

---

**STATUS:** ✅ Production Ready  
**For Support:** See `INTEL_LIBRARY_IMPLEMENTATION_STATUS.md`


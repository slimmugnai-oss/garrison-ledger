# ⚡ GARRISON LEDGER - QUICK REFERENCE

**Use this for instant context when talking to new AI agents.**

---

## 🗺️ SITEMAP: 32 Pages, 9 Categories

**View live:** `/dashboard/admin?tab=sitemap`

- **Home & Core** (2): `/`, `/about`
- **Dashboard** (2): `/dashboard`, `/dashboard/admin`
- **Profile** (1): `/profile`
- **Premium Tools** (5): LES Auditor, PCS Copilot, Base Navigator, TDY Copilot, Intel Library
- **Calculators** (6): TSP, PCS Planner, House Hacking, Career, On-Base Savings, SDP
- **Resources** (3): Listening Post, Directory, Refer & Earn
- **Toolkits** (4): PCS Hub, Career Hub, Deployment, On-Base Shopping
- **Upgrade & Contact** (3): `/upgrade`, `/contact`, `/success`
- **Legal** (4): Terms, Privacy, Disclaimer, Licenses

---

## 🗄️ DATABASE: 32 Tables, 4 Subsystems

**View status:** `/dashboard/admin?tab=ops` → Data Sources

### Core User (5 tables)
`users`, `user_profiles`, `user_assessments`, `assessments`, `user_plans`

### Admin (8 tables)
`admin_actions`, `system_alerts`, `error_logs`, `user_tags`, `feature_flags`, `system_config`, `site_pages`, `page_health_checks`

### Premium Tools (11 tables)
`les_uploads`, `les_audits`, `les_flags`, `expected_pay_snapshot`, `pcs_copilot_sessions`, `pcs_copilot_scenarios`, `navigator_locations`, `navigator_preferences`, `base_external_data_cache`, `tdy_sessions`, `tdy_scenarios`

### Data Sources (13 tables)
`military_pay_tables`, `bah_rates`, `sgli_rates`, `payroll_tax_constants`, `state_tax_rates`, `conus_cola_rates`, `oconus_cola_rates`, `base_external_data_cache`, `neighborhood_profiles`, `entitlements_data`, `jtr_rules`, `content_blocks`, `feed_items`

### Analytics (4 tables)
`calculator_sessions`, `calculator_completions`, `feature_usage`, `conversion_events`

---

## 🎯 ADMIN DASHBOARD: 6 Tabs

**Access:** `/dashboard/admin` (Keyboard: 1-6)

1. **Command Center** - Overview metrics, alerts, activity
2. **Intel** - Revenue, Engagement, Tools analytics
3. **Personnel** - User search, suspend, entitlements
4. **Assets** - Content management, Listening Post
5. **Ops Status** - Data Sources, API Health, Error Logs, Configuration
6. **Sitemap** - Overview, Pages, Health Checks, Analytics, Broken Links

---

## 🔌 ADMIN APIs: 29 Routes

### User: `/api/admin/users/*`
- `search`, `[userId]`, `[userId]/suspend`, `[userId]/entitlement`

### Analytics: `/api/admin/analytics/*`
- `revenue`, `users`, `engagement`, `tools`, `conversion-funnel`, `calculator-rates`

### System: `/api/admin/*`
- `data-sources`, `data-sources/test`, `data-sources/refresh`
- `error-logs`, `feature-flags`, `system-config`

### Sitemap: `/api/admin/sitemap/*`
- `route`, `check-health`, `analytics`, `sync-analytics`, `broken-links`, `extract-metadata`

---

## 📊 DATA SOURCES: 4 Subsystems

**Reference:** `docs/DATA_SOURCES_REFERENCE.md`

### 1. LES Auditor Data
- `military_pay_tables` - Annual from DFAS
- `bah_rates` - Annual from DFAS (16,368 rows)
- `sgli_rates` - Rarely from VA.gov
- `payroll_tax_constants` - Annual from IRS
- `state_tax_rates` - Annual from states
- `conus_cola_rates` - Quarterly from DTMO
- `oconus_cola_rates` - Quarterly from DTMO
- `lib/data/base-mha-map.json` - Base MHA codes

### 2. Base Navigator Data
- `base_external_data_cache` - 30-day auto-refresh
- APIs: OpenWeatherMap, GreatSchools, Zillow (RapidAPI)

### 3. PCS Copilot Data
- `entitlements_data` - Annual from JTR
- `jtr_rules` - As regulations change

### 4. Content Data
- `content_blocks` - 410 hand-curated
- `feed_items` - Daily RSS

---

## 📁 MUST-READ DOCS

1. **SYSTEM_STATUS.md** - Current system state (READ FIRST)
2. **.cursorrules** - Master AI instructions
3. **docs/AI_AGENT_ONBOARDING_GUIDE.md** - Complete platform reference
4. **docs/DATA_SOURCES_REFERENCE.md** - All data sources
5. **lib/ssot.ts** - Single Source of Truth

---

## 🚀 ONBOARDING NEW AI AGENTS

**Copy-paste this:**

```
Working on Garrison Ledger (military financial intelligence platform).

Quick context:
• Sitemap: 32 pages (view at /dashboard/admin?tab=sitemap)
• Database: 32 tables (view at /dashboard/admin?tab=ops)
• Admin: 6 tabs, 29 API routes
• Data: 4 subsystems (LES Auditor, Base Navigator, PCS Copilot, Content)

Read first:
1. SYSTEM_STATUS.md (current state)
2. docs/AI_AGENT_ONBOARDING_GUIDE.md (complete reference)
3. .cursorrules (dev standards)

Key: Military audience = no-BS, direct, 100% accurate data only.
```

---

## 💡 COMMON QUESTIONS

**Q: What pages exist?**  
→ 32 pages in 9 categories. See Sitemap section above or `/dashboard/admin?tab=sitemap`

**Q: What tables exist?**  
→ 32 tables in 5 groups. See Database section above or `docs/DATA_SOURCES_REFERENCE.md`

**Q: What admin features?**  
→ 6-tab dashboard. See Admin section above or `docs/admin/ADMIN_DASHBOARD_COMPLETE.md`

**Q: Where does data come from?**  
→ 4 subsystems with official sources. See Data Sources above or `/dashboard/admin?tab=ops`

**Q: What APIs can I use?**  
→ 29 admin routes. See Admin APIs above or `SYSTEM_STATUS.md` lines 197-258

---

**Full Reference:** `docs/AI_AGENT_ONBOARDING_GUIDE.md` (detailed version)  
**System State:** `SYSTEM_STATUS.md` (current truth)  
**Dev Standards:** `.cursorrules` (master rules)  

**Last Updated:** 2025-10-22


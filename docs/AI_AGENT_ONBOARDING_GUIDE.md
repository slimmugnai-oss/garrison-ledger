# 🤖 AI AGENT ONBOARDING GUIDE - GARRISON LEDGER

## 📋 USE THIS WHEN TALKING TO NEW AI AGENTS

When starting a conversation with a new AI assistant, paste this quick reference to give them instant platform visibility.

---

## 🗺️ COMPLETE SITEMAP (32 Pages)

**All pages are tracked in Admin Dashboard → Sitemap Tab (Press 6)**

Access the live sitemap: `/dashboard/admin?tab=sitemap`

### 9 Categories:

#### 1. 🏠 Home & Core (2 pages)
- `/` - Home page
- `/about` - About page

#### 2. 📱 Dashboard (2 pages)
- `/dashboard` - Main dashboard
- `/dashboard/admin` - Admin command center (**6 tabs**)

#### 3. 👤 Profile (1 page)
- `/profile` - User profile (14 questions, auto-fills calculators)

#### 4. 👑 Premium Tools (5 pages)
- `/dashboard/les-auditor` - LES Auditor (catch pay errors)
- `/dashboard/pcs-copilot` - PCS Copilot (maximize DITY profit)
- `/dashboard/base-navigator` - Base Navigator (find neighborhoods)
- `/dashboard/tdy-copilot` - TDY Copilot (travel vouchers)
- `/dashboard/intel-library` - Intel Library (live financial data)

#### 5. 🧮 Calculators (6 pages)
- `/tools/tsp-calculator` - TSP Calculator (auto-fills from profile)
- `/tools/pcs-planner` - PCS Planner (auto-fills entitlements)
- `/tools/house-hacking` - House Hacking (auto-fills BAH)
- `/tools/career-analyzer` - Career Analyzer (retirement projections)
- `/tools/on-base-savings` - On-Base Savings (commissary/exchange)
- `/tools/sdp-strategist` - SDP Strategist (deployment savings)

#### 6. 📚 Resources (3 pages)
- `/listening-post` - Listening Post (curated RSS feeds)
- `/directory` - Military Finance Directory
- `/refer` - Refer & Earn (referral program)

#### 7. 🛠️ Toolkits (4 pages)
- `/toolkits/pcs-hub` - PCS Hub (complete PCS resource)
- `/toolkits/career-hub` - Career Hub (military career planning)
- `/toolkits/deployment` - Deployment Toolkit
- `/toolkits/on-base-shopping` - On-Base Shopping Guide

#### 8. 💎 Upgrade & Contact (3 pages)
- `/upgrade` - Premium upgrade page
- `/contact` - Contact form
- `/success` - Payment success page

#### 9. ⚖️ Legal (4 pages)
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy
- `/disclaimer` - Disclaimer
- `/licenses` - Open Source Licenses

---

## 🗄️ COMPLETE DATABASE SCHEMA (32 Tables)

**All tables viewable in Admin Dashboard → Ops Status Tab → Data Sources**

### Core User & Auth (5 tables)
```
users                - User accounts (Clerk sync)
user_profiles        - 37 columns (14 editable, 6 computed, 17 system)
                       Computed: paygrade, mha_code, rank_category, 
                                duty_location_type, has_dependents, 
                                time_in_service_months
user_assessments     - Old assessment system
assessments          - Legacy (backward compat)
user_plans           - Generated financial plans (deprecated)
```

### Admin & Monitoring (8 tables)
```
admin_actions        - Audit trail of admin operations
system_alerts        - System-wide monitoring alerts
error_logs           - Centralized error logging with grouping
user_tags            - User segmentation tags
feature_flags        - 10 feature flags for gradual rollout
system_config        - 6 system configs (JSON key-value)
site_pages           - 32 pages with health status & analytics
page_health_checks   - Historical health check logs
```

### Premium Tools (11 tables)
```
# LES Auditor
les_uploads          - Uploaded LES PDFs
les_audits           - Audit results
les_flags            - Pay discrepancies detected
expected_pay_snapshot - What pay should be

# PCS Copilot
pcs_copilot_sessions - PCS planning sessions
pcs_copilot_scenarios - Move scenarios

# Base Navigator
navigator_locations  - Saved base preferences
navigator_preferences - User neighborhood criteria
base_external_data_cache - Weather/housing/schools (30-day TTL)
neighborhood_profiles - ZIP code analysis

# TDY Copilot
tdy_sessions         - TDY planning sessions
tdy_scenarios        - Travel scenarios
```

### Intel Library & Data (13 tables)
```
# LES Auditor Data (See docs/DATA_SOURCES_REFERENCE.md)
military_pay_tables  - Base pay (E01-O10) - Annual DFAS update
bah_rates            - 16,368 housing allowance rates - Annual
sgli_rates           - Life insurance (8 tiers) - Rarely
payroll_tax_constants - FICA/Medicare - Annual IRS
state_tax_rates      - 51 states - Annual
conus_cola_rates     - CONUS COLA - Quarterly DTMO
oconus_cola_rates    - OCONUS COLA - Quarterly DTMO

# Base Navigator Data
base_external_data_cache - External API data (30-day auto-refresh)
neighborhood_profiles - ZIP analysis

# PCS Copilot Data
entitlements_data    - DLA, weight allowances - Annual JTR
jtr_rules            - Joint Travel Regulations

# Content Data
content_blocks       - 410 hand-curated blocks
feed_items           - RSS articles
```

### Analytics & Tracking (4 tables)
```
calculator_sessions  - Calculator usage tracking
calculator_completions - Completion rates
feature_usage        - Feature engagement
conversion_events    - Funnel tracking
admin_analytics_view - Materialized view (aggregated metrics)
```

### Collaboration (2 tables)
```
spouse_connections   - Spouse account linking
shared_plans         - Plan sharing between spouses
```

### Storage (2 tables + 2 buckets)
```
document_binder      - File metadata
contact_submissions  - Support tickets

# Supabase Storage Buckets:
documents            - Document binder files
les-uploads          - LES PDF files
```

---

## 🎯 ADMIN DASHBOARD FEATURES (6 Tabs)

**Access:** `/dashboard/admin` (Admin-only, keyboard shortcuts 1-6)

### Tab 1: 🛡️ Command Center (Press 1)
**Overview metrics and system health**
- MRR, total users, premium users, conversion rate
- New signups (7d), new premium (7d)
- Activation rate, support tickets
- System alerts panel (dismissible)
- Recent activity feed
- Quick actions

### Tab 2: 📈 Intel (Press 2)
**Analytics dashboard with 3 sub-tabs:**

#### Sub-tab: Revenue
- MRR trends chart (30-day)
- Active subscriptions breakdown (monthly/annual)
- ARPU (Average Revenue Per User)
- Revenue growth rate

#### Sub-tab: Engagement
- DAU/WAU/MAU metrics
- Streak analytics (current, longest, total days)
- Badge counts (earned vs available)
- Top streakers leaderboard (top 10)

#### Sub-tab: Tools
- LES Auditor usage (uploads, audits, flags, success rate)
- PCS Copilot usage (sessions, scenarios, avg session time)
- TDY Copilot usage (sessions, scenarios, completion rate)
- Category breakdowns

### Tab 3: 👥 Personnel (Press 3)
**User management interface**
- Advanced user search (name, email, rank)
- Filters: tier, status, date range
- Bulk actions: suspend, delete, export
- User detail modal:
  - Full profile view
  - Activity timeline
  - Payment history
  - Support tickets
- Admin actions:
  - Suspend/unsuspend user
  - Adjust entitlement (free/premium)
  - View audit trail

### Tab 4: 📚 Assets (Press 4)
**Content management**
- Content blocks curation (410 blocks)
- Listening Post feed management
- Content governance workflow
- Version tracking

### Tab 5: ⚙️ Ops Status (Press 5)
**System monitoring with 4 sub-tabs:**

#### Sub-tab: Data Sources
**Real-time external data monitoring:**
- BAH rates (16,368 rows, annual update from DFAS)
- CONUS COLA (quarterly from DTMO)
- OCONUS COLA (quarterly from DTMO)
- Weather data (OpenWeatherMap, 1-day cache)
- Housing data (Zillow via RapidAPI, 30-day cache)
- Schools data (GreatSchools, 30-day cache, premium-only)

**Features:**
- Visual freshness indicators (🟢 Fresh, 🟡 Stale, 🔴 Critical)
- Last update timestamps
- Test connection button
- Force refresh button

#### Sub-tab: API Health
- Real-time endpoint monitoring
- Response time tracking
- Error rate alerts
- Uptime percentage

#### Sub-tab: Error Logs
**Centralized error viewer:**
- Filter by: level (error/warn/info), source, time range
- Grouped view (similar errors collapsed)
- Stack trace viewer
- Error frequency counts
- Search by message

#### Sub-tab: Configuration
**System control panel:**

**Feature Flags (10 flags):**
1. `pcs_copilot_enabled` - PCS Copilot on/off
2. `les_auditor_enabled` - LES Auditor on/off
3. `base_navigator_enabled` - Base Navigator on/off
4. `tdy_copilot_enabled` - TDY Copilot on/off
5. `intel_library_enabled` - Intel Library on/off
6. `calculator_auto_fill` - Calculator auto-population
7. `premium_trial_enabled` - 14-day trial on/off
8. `referral_program_enabled` - Referral system on/off
9. `maintenance_mode` - Site-wide maintenance
10. `new_user_signups_enabled` - Registration on/off

**System Config (6 configs):**
1. `system` - General system settings
2. `features` - Feature-specific configs
3. `email` - Email templates & settings
4. `analytics` - Analytics configuration
5. `ai` - AI model settings (Gemini params)
6. `external_apis` - API keys & rate limits

**Features:**
- Toggle flags instantly (no deployment)
- Edit JSON configs in real-time
- Audit trail of all changes

### Tab 6: 🗺️ Sitemap (Press 6)
**Complete platform visibility with 5 sub-tabs:**

#### Sub-tab: Overview
**Visual category tree:**
- 9 expandable categories
- Color-coded health indicators (🟢🟡🔴⚫)
- Per-category stats (pages, healthy, warnings, errors)
- Individual page details with tier badges
- Response times displayed
- Quick overview metrics:
  - Total pages (32)
  - Healthy pages count
  - Pages needing attention
  - Average response time

#### Sub-tab: Pages
**Detailed page table:**
- Sortable columns: path, title, category, tier, health, response, views
- Filterable by: category, tier, health status
- Searchable: path or title
- Pagination (25 per page)
- Tier badges (public/free/premium/admin)
- Health status badges (color-coded)

#### Sub-tab: Health Checks
**Automated monitoring:**
- Run health check button (checks all 32 pages)
- Sync analytics button (updates view counts)
- Health breakdown cards:
  - Healthy (🟢)
  - Warning (🟡)
  - Error (🔴)
  - Unknown (⚫)
- Error pages list (highlighted red)
- Warning pages list (highlighted amber)
- Response time tracking
- Last check timestamp

**Health Check Process:**
1. Pings all 32 pages (HEAD requests)
2. Measures response times
3. Checks HTTP status codes
4. Updates database
5. Logs all checks
6. Takes ~30-60 seconds

**Health Status Logic:**
- 🟢 Healthy: Response < 2s, HTTP 200
- 🟡 Warning: Response 2-5s, minor issues
- 🔴 Error: Response > 5s, HTTP 404/500, timeout
- ⚫ Unknown: Not yet checked

#### Sub-tab: Analytics
**Intelligent insights with 6 sections:**

**1. Top Pages (🏆)**
- Top 10 by 30d views
- Medal rankings (🥇🥈🥉)
- View counts displayed

**2. Low Traffic Pages (📉)**
- < 10 views in 30 days
- Flagged for promotion or archival
- Sorted by lowest traffic

**3. Slow Pages (🐌)**
- Response time > 2 seconds
- Flagged for optimization
- Shows actual response times

**4. Outdated Content (📅)**
- Not updated in 90+ days
- Flagged for content refresh
- Shows days since update

**5. Pages Needing Attention (⚠️)**
Multi-criteria detection flags pages if:
- ❌ Old (90+ days)
- ❌ Low traffic (< 10 views/30d)
- ❌ High bounce (> 70%)
- ❌ Slow (> 3s response)

Shows all issues as badges per page.

**6. Category Performance (📊)**
- Pages per category
- Total views per category
- Avg response time per category
- Identifies strongest/weakest categories

**Analytics Sync:**
- Queries `analytics_events` table
- Aggregates page views (7d and 30d)
- Calculates bounce rates
- Updates `site_pages` table

#### Sub-tab: Broken Links
- ⏳ Placeholder for Phase 2
- Future: Link checker, 404 detection

---

## 🔌 COMPLETE API ENDPOINTS (29 Admin Routes)

### User Management (5)
```
GET    /api/admin/data                           - Overview metrics
GET    /api/admin/users/search                   - Search users
GET    /api/admin/users/[userId]                 - User details
PATCH  /api/admin/users/[userId]                 - Update user
POST   /api/admin/users/[userId]/suspend         - Suspend/unsuspend
POST   /api/admin/users/[userId]/entitlement     - Adjust tier
```

### Analytics (6)
```
GET    /api/admin/analytics/revenue              - Revenue data
GET    /api/admin/analytics/users                - User demographics
GET    /api/admin/analytics/engagement           - DAU/MAU, streaks
GET    /api/admin/analytics/tools                - Tools usage
GET    /api/admin/analytics/conversion-funnel    - Funnel metrics
GET    /api/admin/analytics/calculator-rates     - Calculator completion
```

### System Monitoring (7)
```
GET    /api/admin/data-sources                   - Data source status
POST   /api/admin/data-sources/test              - Test connection
POST   /api/admin/data-sources/refresh           - Force refresh
GET    /api/admin/error-logs                     - Error log viewer
GET    /api/admin/feature-flags                  - Get flags
POST   /api/admin/feature-flags                  - Update flags
GET    /api/admin/system-config                  - Get configs
POST   /api/admin/system-config                  - Update configs
```

### Sitemap Management (7)
```
GET    /api/admin/sitemap                        - Get all pages
POST   /api/admin/sitemap/check-health           - Run health checks
GET    /api/admin/sitemap/analytics              - Page analytics
POST   /api/admin/sitemap/sync-analytics         - Sync from events
GET    /api/admin/sitemap/broken-links           - Link checker (future)
POST   /api/admin/sitemap/extract-metadata       - Extract page meta
```

### Content & Support (4)
```
GET    /api/admin/content-pending                - Content review queue
POST   /api/admin/content-reject                 - Reject content
POST   /api/admin/audit-content                  - Content audit
GET    /api/admin/tickets                        - Support tickets
POST   /api/admin/check-freshness                - Data freshness check
```

---

## 📁 KEY FILES & DOCUMENTATION

### Must-Read Documentation
```
SYSTEM_STATUS.md                      - Current system state (ALWAYS READ FIRST)
.cursorrules                          - Master AI agent instructions
docs/DATA_SOURCES_REFERENCE.md        - All data sources explained
lib/ssot.ts                           - Single Source of Truth module
```

### Admin Documentation
```
docs/admin/ADMIN_DASHBOARD_COMPLETE.md         - All 6 phases guide
docs/admin/SITEMAP_SYSTEM.md                   - Sitemap system guide
docs/admin/ADMIN_DASHBOARD_PHASES_4_5_COMPLETE.md
docs/admin/ADMIN_DASHBOARD_FINAL_EXECUTION_REPORT.md
```

### Feature Documentation (docs/active/)
```
LES_AUDITOR_FINAL_SUMMARY.md          - LES Auditor complete guide
BASE_NAVIGATOR_API_SETUP.md           - API configuration
PCS_COPILOT_COMPLETE.md               - PCS tool documentation
INTEL_LIBRARY_AUTO_UPDATING_DATA.md   - Dynamic data system
BASE_GUIDES_ELITE_UX.md               - Base guides system
```

### Vendor Documentation (docs/vendors/)
```
weather.md         - Google Weather API (via RapidAPI)
housing.md         - Zillow Market Data (via RapidAPI)
greatschools.md    - GreatSchools API
```

### Development Guides
```
docs/DEVELOPMENT_WORKFLOW.md          - Standard development process
docs/ICON_USAGE_GUIDE.md              - Icon restrictions & safe icons
CHANGELOG.md                          - Version history
```

---

## 🎯 DATA SOURCES & UPDATE SCHEDULES

**CRITICAL: All data must be from official sources. Never guess or estimate.**

### LES Auditor Data (See docs/DATA_SOURCES_REFERENCE.md)
```
military_pay_tables     - Base pay (E01-O10)
                          Update: Annually from DFAS.mil
                          
bah_rates              - Housing allowance (16,368 rows)
                         Update: Annually from DFAS BAH Calculator
                         
lib/ssot.ts            - BAS rates (basMonthlyCents)
                         Update: Annually from DFAS
                         Officer: $316.98
                         Enlisted: $460.25
                         
sgli_rates             - Life insurance (8 tiers)
                         Update: Rarely from VA.gov
                         
payroll_tax_constants  - FICA/Medicare
                         Update: Annually from IRS.gov
                         FICA: 6.2%
                         Medicare: 1.45%
                         
state_tax_rates        - 51 states
                         Update: Annually from state authorities
                         
conus_cola_rates       - CONUS COLA
                         Update: Quarterly from DTMO
                         
oconus_cola_rates      - OCONUS COLA
                         Update: Quarterly from DTMO
                         
lib/data/base-mha-map.json - Base to MHA mapping
                             Update: When bases open/close/rename
```

### Base Navigator Data (Real-time APIs)
```
base_external_data_cache - Weather/Schools/Housing
                           Auto-refresh: 30-day TTL
                           Sources:
                           - Google Weather (via RapidAPI)
                           - GreatSchools API
                           - Zillow (via RapidAPI)
```

### PCS Copilot Data
```
entitlements_data      - DLA, weight allowances
                         Update: Annually from JTR
                         
jtr_rules              - Joint Travel Regulations
                         Update: As regulations change
```

### Content Data
```
content_blocks         - 410 hand-curated blocks
                         Update: Manual curation
                         
feed_items             - RSS articles
                         Update: Daily from feeds
```

**Admin Dashboard View:**
`/dashboard/admin?tab=ops` → Data Sources sub-tab shows all 4 subsystems with status monitoring.

---

## 🚀 QUICK START CHECKLIST FOR NEW AGENTS

When starting work on Garrison Ledger:

1. ✅ **Read SYSTEM_STATUS.md** - Get current system state
2. ✅ **Read .cursorrules** - Understand development standards
3. ✅ **Review this onboarding guide** - Platform structure
4. ✅ **Check Admin Dashboard** - Live system health (`/dashboard/admin`)
5. ✅ **Review relevant docs** - Feature-specific guides in `docs/active/`

### Understanding the Platform
- **Sitemap:** 32 pages across 9 categories
- **Database:** 32 tables (5 user, 8 admin, 11 tools, 13 data, 4 analytics, 2 collab)
- **Admin Dashboard:** 6 tabs, 15+ sub-tabs, 21 API endpoints
- **Data Sources:** 4 distinct subsystems (LES Auditor, Base Navigator, PCS Copilot, Content)

### Key Principles
- **Military Audience:** No-BS, direct, professional tone
- **Data Integrity:** 100% accurate, official sources only
- **SSOT:** All facts from `lib/ssot.ts`
- **Security:** RLS on all tables, secrets protected
- **Mobile-First:** 60-70% mobile traffic

---

## 🎖️ MILITARY AUDIENCE STANDARDS

**Before implementing ANY feature, verify:**
1. ✅ Respects military values (no-BS, direct, professional)
2. ✅ Builds trust (realistic guarantees, no hype)
3. ✅ Serves the user (clarity, no tricks)
4. ✅ Professional presentation (no childish emojis in UI)

**If any fail → DO NOT IMPLEMENT IT.**

---

## 📊 CURRENT SYSTEM METRICS

**As of System Status v5.5.0:**
- **Build:** 130+ pages generated
- **API Routes:** 117 total (29 admin)
- **Database:** 32 tables, RLS enabled
- **Premium Tools:** 5 elite tools
- **Calculators:** 6 world-class tools
- **Intel Cards:** 12 production cards
- **Base Guides:** 203 bases (163 CONUS, 40 OCONUS)
- **Cost per User:** $0.35/month (96.5% margin)
- **AI System:** Gemini 2.0 Flash ($0.02/plan)

---

## 💡 COMMON SCENARIOS

### "What pages exist on the platform?"
→ **32 pages tracked in Sitemap** (see section above)
→ Access: `/dashboard/admin?tab=sitemap`

### "What database tables do we have?"
→ **32 tables total** (see schema section above)
→ Admin view: `/dashboard/admin?tab=ops` → Data Sources

### "What admin features are available?"
→ **6-tab dashboard** with 15+ sub-tabs (see features section above)
→ Access: `/dashboard/admin`

### "Where does our data come from?"
→ **4 data subsystems** (see data sources section above)
→ Reference doc: `docs/DATA_SOURCES_REFERENCE.md`
→ Admin view: `/dashboard/admin?tab=ops` → Data Sources

### "What APIs can I use?"
→ **29 admin API routes** (see endpoints section above)
→ Plus 117 total platform routes
→ Reference: `SYSTEM_STATUS.md` lines 197-258

---

## 🔗 QUICK LINKS

**Live Platform:**
- Main Site: `https://garrisonledger.com`
- Admin Dashboard: `https://garrisonledger.com/dashboard/admin`

**Key Documentation:**
- System Status: `SYSTEM_STATUS.md`
- Master Rules: `.cursorrules`
- Data Reference: `docs/DATA_SOURCES_REFERENCE.md`
- Admin Guide: `docs/admin/ADMIN_DASHBOARD_COMPLETE.md`

**Development:**
- GitHub: (Private repository)
- Deployment: Vercel Dashboard
- Database: Supabase Dashboard

---

**Last Updated:** 2025-10-22  
**Version:** 1.0.0  
**Status:** ✅ Production Reference Guide  

---

## 📝 EXAMPLE ONBOARDING MESSAGE FOR NEW AGENTS

Copy-paste this when starting with a new AI agent:

```
Hi! I'm working on Garrison Ledger, a military financial intelligence platform.

Quick context:
• Platform: 32 pages across 9 categories (tracked in admin sitemap)
• Database: 32 tables (5 user, 8 admin, 11 tools, 13 data, 4 analytics)
• Admin Dashboard: 6 tabs with complete operational intelligence
• Data Sources: 4 subsystems (LES Auditor, Base Navigator, PCS Copilot, Content)

Before we start:
1. Read docs/AI_AGENT_ONBOARDING_GUIDE.md (this file)
2. Read SYSTEM_STATUS.md for current state
3. Follow .cursorrules for development standards

The admin dashboard at /dashboard/admin has everything:
• Tab 6 (Sitemap): All 32 pages with health monitoring
• Tab 5 (Ops Status): All data sources with freshness tracking
• Tab 3 (Personnel): User management
• Tab 2 (Intel): Analytics (revenue, engagement, tools)

Key principle: Military audience = no-BS, direct, 100% accurate data only.

Let's start. [Your question/task here]
```

---

**This guide should be your first reference when onboarding new AI agents to the Garrison Ledger project.**


# 🏗️ GARRISON LEDGER - PLATFORM ARCHITECTURE

**Visual overview of how all systems connect.**

---

## 📐 HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GARRISON LEDGER PLATFORM                      │
│                   Military Financial Intelligence                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
        ┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
        │   32 PAGES     │  │  32 TABLES  │  │  6 ADMIN TABS   │
        │  (9 Categories)│  │(4 Subsystems)│  │ (Command Center)│
        └───────┬────────┘  └──────┬──────┘  └────────┬────────┘
                │                   │                   │
                └───────────────────┼───────────────────┘
                                    ▼
                        ┌───────────────────────┐
                        │   ADMIN DASHBOARD     │
                        │  /dashboard/admin     │
                        └───────────────────────┘
```

---

## 🗺️ SITEMAP ARCHITECTURE (32 Pages → 9 Categories)

```
GARRISON LEDGER (/)
│
├─ 🏠 HOME & CORE (2 pages)
│  ├─ / (home)
│  └─ /about
│
├─ 📱 DASHBOARD (2 pages)
│  ├─ /dashboard (user dashboard)
│  └─ /dashboard/admin (admin command center) ⭐
│
├─ 👤 PROFILE (1 page)
│  └─ /profile (14 questions → auto-fills 4 calculators)
│
├─ 👑 PREMIUM TOOLS (4 pages) 💎
│  ├─ /dashboard/paycheck-audit (catch pay errors)
│  ├─ /dashboard/pcs-copilot (maximize DITY profit)
│  ├─ /dashboard/navigator (find neighborhoods)
│  └─ /dashboard/ask (military expert assistant)
│
├─ 🧮 CALCULATORS (6 pages) 🆓+💎
│  ├─ /tools/tsp-calculator ⭐ auto-fill
│  ├─ /tools/pcs-planner ⭐ auto-fill
│  ├─ /tools/house-hacking ⭐ auto-fill
│  ├─ /tools/career-analyzer ⭐ auto-fill
│  ├─ /tools/on-base-savings
│  └─ /tools/sdp-strategist
│
├─ 📚 RESOURCES (3 pages) 🆓
│  ├─ /listening-post (curated RSS)
│  ├─ /directory (finance resources)
│  └─ /refer (referral program)
│
├─ 🛠️ TOOLKITS (4 pages) 🆓
│  ├─ /toolkits/pcs-hub
│  ├─ /toolkits/career-hub
│  ├─ /toolkits/deployment
│  └─ /toolkits/on-base-shopping
│
├─ 💎 UPGRADE & CONTACT (3 pages)
│  ├─ /upgrade (pricing)
│  ├─ /contact (support)
│  └─ /success (payment confirmation)
│
└─ ⚖️ LEGAL (4 pages)
   ├─ /terms
   ├─ /privacy
   ├─ /disclaimer
   └─ /licenses

LEGEND:
🆓 = Public/Free tier
💎 = Premium only
⭐ = Auto-fills from profile
```

---

## 🗄️ DATABASE ARCHITECTURE (32 Tables → 4 Subsystems)

```
DATABASE (Supabase PostgreSQL)
│
├─ 👥 CORE USER & AUTH (5 tables)
│  ├─ users (Clerk sync)
│  ├─ user_profiles (37 columns: 14 editable + 6 computed + 17 system)
│  │                  ├─ Computed: paygrade, mha_code, rank_category
│  │                  ├─ Computed: duty_location_type, has_dependents
│  │                  └─ Computed: time_in_service_months
│  ├─ user_assessments (new)
│  ├─ assessments (legacy)
│  └─ user_plans (deprecated)
│
├─ 🛡️ ADMIN & MONITORING (8 tables)
│  ├─ admin_actions (audit trail)
│  ├─ system_alerts (monitoring)
│  ├─ error_logs (centralized errors)
│  ├─ user_tags (segmentation)
│  ├─ feature_flags (10 flags)
│  ├─ system_config (6 configs)
│  ├─ site_pages (32 pages tracked) ⭐
│  └─ page_health_checks (history) ⭐
│
├─ 👑 PREMIUM TOOLS (11 tables)
│  ├─ LES AUDITOR (4 tables)
│  │  ├─ les_uploads
│  │  ├─ les_audits
│  │  ├─ les_flags
│  │  └─ expected_pay_snapshot
│  │
│  ├─ PCS COPILOT (2 tables)
│  │  ├─ pcs_copilot_sessions
│  │  └─ pcs_copilot_scenarios
│  │
│  ├─ BASE NAVIGATOR (3 tables)
│  │  ├─ navigator_locations
│  │  ├─ navigator_preferences
│  │  └─ base_external_data_cache (weather/housing/schools)
│  │
│  └─ TDY COPILOT (2 tables)
│     ├─ tdy_sessions
│     └─ tdy_scenarios
│
└─ 📊 DATA SOURCES (13 tables) - 4 SUBSYSTEMS ⭐
   │
   ├─ 💵 LES AUDITOR DATA (9 tables)
   │  ├─ military_pay_tables (E01-O10, annual DFAS)
   │  ├─ bah_rates (16,368 rows, annual DFAS)
   │  ├─ sgli_rates (8 tiers, VA.gov)
   │  ├─ payroll_tax_constants (FICA/Medicare, annual IRS)
   │  ├─ state_tax_rates (51 states, annual)
   │  ├─ conus_cola_rates (quarterly DTMO)
   │  ├─ oconus_cola_rates (quarterly DTMO)
   │  └─ lib/data/base-mha-map.json (base MHA codes)
   │
   ├─ 🗺️ BASE NAVIGATOR DATA (2 sources)
   │  ├─ base_external_data_cache (30-day auto-refresh)
   │  │  ├─ OpenWeatherMap API
   │  │  ├─ GreatSchools API
   │  │  └─ Zillow API (via RapidAPI)
   │  └─ neighborhood_profiles (ZIP analysis)
   │
   ├─ ✈️ PCS COPILOT DATA (2 tables)
   │  ├─ entitlements_data (DLA, weights, annual JTR)
   │  └─ jtr_rules (Joint Travel Regulations)
   │
   └─ 📝 CONTENT DATA (2 tables)
      ├─ content_blocks (410 hand-curated)
      └─ feed_items (RSS articles, daily)

LEGEND:
⭐ = New in Admin Dashboard Phase 6
```

---

## 🎯 ADMIN DASHBOARD ARCHITECTURE (6 Tabs)

```
ADMIN DASHBOARD (/dashboard/admin)
│
├─ TAB 1: 🛡️ COMMAND CENTER (Press 1)
│  ├─ Overview Metrics (MRR, users, conversion, activation)
│  ├─ System Alerts Panel (dismissible, severity levels)
│  ├─ Recent Activity Feed (last 10 actions)
│  └─ Quick Actions (user search, data refresh, etc.)
│
├─ TAB 2: 📈 INTEL (Press 2) - 3 SUB-TABS
│  ├─ 💰 Revenue Analytics
│  │  ├─ MRR trends chart (30-day)
│  │  ├─ Subscriptions breakdown (monthly/annual)
│  │  ├─ ARPU & growth rate
│  │  └─ API: /api/admin/analytics/revenue
│  │
│  ├─ 🎯 Engagement Analytics
│  │  ├─ DAU/WAU/MAU metrics
│  │  ├─ Streak analytics (current, longest, total)
│  │  ├─ Badge counts (earned vs available)
│  │  ├─ Top streakers leaderboard (top 10)
│  │  └─ API: /api/admin/analytics/engagement
│  │
│  └─ 🛠️ Tools Analytics
│     ├─ LES Auditor usage (uploads, audits, flags, success rate)
│     ├─ PCS Copilot usage (sessions, scenarios, avg time)
│     ├─ Base Navigator usage (searches, external API calls)
│     └─ API: /api/admin/analytics/tools
│
├─ TAB 3: 👥 PERSONNEL (Press 3)
│  ├─ User Search & Filters (name, email, rank)
│  ├─ Advanced Filters (tier, status, date range)
│  ├─ User Detail Modal (profile, activity, payments, tickets)
│  ├─ Admin Actions:
│  │  ├─ Suspend/unsuspend user
│  │  ├─ Adjust entitlement (free/premium)
│  │  └─ View audit trail
│  └─ APIs: /api/admin/users/*
│
├─ TAB 4: 📚 ASSETS (Press 4)
│  ├─ Content Management (410 blocks)
│  ├─ Listening Post Feeds (RSS curation)
│  ├─ Content Governance (review workflow)
│  └─ Version Tracking
│
├─ TAB 5: ⚙️ OPS STATUS (Press 5) - 4 SUB-TABS
│  ├─ 💾 Data Sources
│  │  ├─ BAH rates (16,368 rows, annual DFAS)
│  │  ├─ CONUS COLA (quarterly DTMO)
│  │  ├─ OCONUS COLA (quarterly DTMO)
│  │  ├─ Weather (OpenWeatherMap, 1-day cache)
│  │  ├─ Housing (Zillow RapidAPI, 30-day cache)
│  │  ├─ Schools (GreatSchools, 30-day cache, premium)
│  │  ├─ Visual freshness indicators (🟢🟡🔴)
│  │  └─ API: /api/admin/data-sources
│  │
│  ├─ 🔌 API Health
│  │  ├─ Real-time endpoint monitoring
│  │  ├─ Response time tracking
│  │  └─ Error rate alerts
│  │
│  ├─ 📝 Error Logs
│  │  ├─ Filter by: level, source, time
│  │  ├─ Grouped view (collapse similar errors)
│  │  ├─ Stack trace viewer
│  │  └─ API: /api/admin/error-logs
│  │
│  └─ ⚙️ Configuration
│     ├─ Feature Flags (10 flags, instant toggle)
│     │  ├─ pcs_copilot_enabled
│     │  ├─ les_auditor_enabled
│     │  ├─ base_navigator_enabled
│     │  ├─ calculator_auto_fill
│     │  ├─ premium_trial_enabled
│     │  └─ ... (5 more)
│     │
│     └─ System Config (6 configs, JSON editor)
│        ├─ system (general settings)
│        ├─ features (feature-specific)
│        ├─ email (templates & settings)
│        ├─ analytics (tracking config)
│        ├─ ai (Gemini parameters)
│        └─ external_apis (keys & rate limits)
│
└─ TAB 6: 🗺️ SITEMAP (Press 6) - 5 SUB-TABS ⭐ NEW
   ├─ 📊 Overview
   │  ├─ Summary metrics (total, healthy, needs attention, avg response)
   │  ├─ Expandable category tree (9 categories)
   │  ├─ Color-coded health (🟢🟡🔴⚫)
   │  ├─ Per-category breakdown
   │  └─ API: /api/admin/sitemap
   │
   ├─ 📄 Pages
   │  ├─ Detailed table (32 pages)
   │  ├─ Sortable columns (path, title, category, tier, health, response, views)
   │  ├─ Filterable (category, tier, health)
   │  ├─ Searchable (path/title)
   │  └─ Pagination (25 per page)
   │
   ├─ 🏥 Health Checks
   │  ├─ Run Health Check button (pings all 32 pages)
   │  ├─ Sync Analytics button (updates view counts)
   │  ├─ Health breakdown (🟢🟡🔴⚫)
   │  ├─ Error pages list (highlighted red)
   │  ├─ Warning pages list (highlighted amber)
   │  └─ API: /api/admin/sitemap/check-health
   │
   ├─ 📈 Analytics
   │  ├─ Top 10 pages (🥇🥈🥉 medals)
   │  ├─ Low traffic pages (< 10 views/30d)
   │  ├─ Slow pages (> 2s response)
   │  ├─ Outdated content (> 90 days)
   │  ├─ Pages needing attention (multi-criteria)
   │  ├─ Category performance breakdown
   │  └─ API: /api/admin/sitemap/analytics
   │
   └─ 🔗 Broken Links
      └─ Placeholder for Phase 2

LEGEND:
⭐ = New in Phase 6
```

---

## 🔌 API ARCHITECTURE (29 Admin Routes)

```
/api/admin/*
│
├─ USER MANAGEMENT (6 routes)
│  ├─ GET    /data                           → Overview metrics
│  ├─ GET    /users/search                   → Search users
│  ├─ GET    /users/[userId]                 → User details
│  ├─ PATCH  /users/[userId]                 → Update user
│  ├─ POST   /users/[userId]/suspend         → Suspend/unsuspend
│  └─ POST   /users/[userId]/entitlement     → Adjust tier
│
├─ ANALYTICS (6 routes)
│  ├─ GET    /analytics/revenue              → MRR, subscriptions, ARPU
│  ├─ GET    /analytics/users                → Demographics, growth
│  ├─ GET    /analytics/engagement           → DAU/MAU, streaks, badges
│  ├─ GET    /analytics/tools                → LES/PCS/TDY usage
│  ├─ GET    /analytics/conversion-funnel    → Funnel metrics
│  └─ GET    /analytics/calculator-rates     → Calculator completion
│
├─ SYSTEM MONITORING (8 routes)
│  ├─ GET    /data-sources                   → Data source status
│  ├─ POST   /data-sources/test              → Test connection
│  ├─ POST   /data-sources/refresh           → Force refresh
│  ├─ GET    /error-logs                     → Error log viewer
│  ├─ GET    /feature-flags                  → Get flags
│  ├─ POST   /feature-flags                  → Update flags
│  ├─ GET    /system-config                  → Get configs
│  └─ POST   /system-config                  → Update configs
│
├─ SITEMAP MANAGEMENT (7 routes) ⭐
│  ├─ GET    /sitemap                        → Get all pages (32)
│  ├─ POST   /sitemap/check-health           → Run health checks
│  ├─ GET    /sitemap/analytics              → Page analytics
│  ├─ POST   /sitemap/sync-analytics         → Sync from events
│  ├─ GET    /sitemap/broken-links           → Link checker
│  └─ POST   /sitemap/extract-metadata       → Extract page meta
│
└─ CONTENT & SUPPORT (4 routes)
   ├─ GET    /content-pending                → Review queue
   ├─ POST   /content-reject                 → Reject content
   ├─ POST   /audit-content                  → Content audit
   ├─ GET    /tickets                        → Support tickets
   └─ POST   /check-freshness                → Data freshness

TOTAL: 29 admin API routes
```

---

## 📊 DATA FLOW DIAGRAM

```
USER INPUT
    │
    ├─ Profile Setup (14 questions)
    │      │
    │      ├─ Auto-compute 6 fields
    │      │  (paygrade, mha_code, rank_category,
    │      │   duty_location_type, has_dependents,
    │      │   time_in_service_months)
    │      │
    │      └─ Stores in: user_profiles
    │
    ├─ Calculator Usage
    │      │
    │      ├─ Auto-fills from profile ⭐
    │      │  (TSP, PCS Planner, House Hacking, Career)
    │      │
    │      ├─ Looks up from database
    │      │  (BAH rates, pay tables, COLA)
    │      │
    │      └─ Tracks in: calculator_sessions
    │
    ├─ Premium Tool Usage
    │      │
    │      ├─ LES Auditor
    │      │  ├─ Upload → les_uploads
    │      │  ├─ Parse → Extract data
    │      │  ├─ Validate → Compare to pay tables
    │      │  ├─ Flag → les_flags
    │      │  └─ Audit → les_audits
    │      │
    │      ├─ PCS Copilot
    │      │  ├─ Session → pcs_copilot_sessions
    │      │  ├─ Scenarios → pcs_copilot_scenarios
    │      │  └─ Lookup → entitlements_data, jtr_rules
    │      │
    │      ├─ Base Navigator
    │      │  ├─ Preferences → navigator_preferences
    │      │  ├─ Locations → navigator_locations
    │      │  └─ External APIs → base_external_data_cache
    │      │     ├─ Weather (1-day cache)
    │      │     ├─ Housing (30-day cache)
    │      │     └─ Schools (30-day cache)
    │
    └─ Admin Dashboard Access
           │
           ├─ Tab 1: Command Center
           │  └─ Queries: user_profiles, entitlements, contact_submissions
           │
           ├─ Tab 2: Intel (Analytics)
           │  └─ Queries: Aggregated views, time-series data
           │
           ├─ Tab 3: Personnel
           │  └─ CRUD: user_profiles, entitlements, admin_actions
           │
           ├─ Tab 4: Assets
           │  └─ Queries: content_blocks, feed_items
           │
           ├─ Tab 5: Ops Status
           │  ├─ Data Sources: Check freshness of all data tables
           │  ├─ Error Logs: Query error_logs
           │  └─ Configuration: feature_flags, system_config
           │
           └─ Tab 6: Sitemap
              ├─ Overview: site_pages (all 32)
              ├─ Health Checks: HEAD requests → page_health_checks
              └─ Analytics: analytics_events → site_pages
```

---

## 🔄 EXTERNAL DATA REFRESH CYCLES

```
EXTERNAL DATA SOURCES
│
├─ OFFICIAL GOVERNMENT SOURCES (Manual Updates)
│  │
│  ├─ ANNUAL (January)
│  │  ├─ military_pay_tables (DFAS.mil)
│  │  ├─ bah_rates (DFAS BAH Calculator)
│  │  ├─ lib/ssot.ts BAS (DFAS)
│  │  ├─ payroll_tax_constants (IRS.gov)
│  │  └─ state_tax_rates (State authorities)
│  │
│  ├─ QUARTERLY (Jan/Apr/Jul/Oct)
│  │  ├─ conus_cola_rates (DTMO)
│  │  └─ oconus_cola_rates (DTMO)
│  │
│  ├─ RARELY (As Needed)
│  │  ├─ sgli_rates (VA.gov)
│  │  ├─ entitlements_data (JTR)
│  │  ├─ jtr_rules (DOD)
│  │  └─ lib/data/base-mha-map.json (Base changes)
│  │
│  └─ VERIFICATION
│     └─ npm run check-data-freshness (semi-automated)
│
└─ EXTERNAL APIs (Auto-Refresh)
   │
   ├─ 1-DAY CACHE
   │  └─ Weather (OpenWeatherMap)
   │
   ├─ 30-DAY CACHE
   │  ├─ Housing (Zillow via RapidAPI)
   │  └─ Schools (GreatSchools)
   │
   └─ DAILY REFRESH
      └─ RSS Feeds (feed_items)

MONITORING:
→ Admin Dashboard → Ops Status Tab → Data Sources
→ Visual freshness indicators (🟢 Fresh, 🟡 Stale, 🔴 Critical)
```

---

## 🎯 USER JOURNEY FLOW

```
NEW USER JOURNEY
│
├─ 1. SIGN UP (/sign-up)
│      │
│      └─ Creates: users, user_profiles (Clerk)
│
├─ 2. PROFILE SETUP (/profile)
│      │
│      ├─ Answers 14 questions
│      │  (rank, branch, base, dependents, etc.)
│      │
│      ├─ System auto-computes 6 fields
│      │  (paygrade, mha_code, rank_category, etc.)
│      │
│      └─ Unlocks: Calculator auto-fill
│
├─ 3. EXPLORE FREE TOOLS
│      │
│      ├─ Try Calculators (6 tools)
│      │  ├─ TSP Calculator ⭐ auto-fill
│      │  ├─ PCS Planner ⭐ auto-fill
│      │  ├─ House Hacking ⭐ auto-fill
│      │  └─ Career Analyzer ⭐ auto-fill
│      │
│      ├─ Browse Resources
│      │  ├─ Listening Post (RSS feeds)
│      │  ├─ Directory (resources)
│      │  └─ Refer & Earn
│      │
│      └─ Explore Toolkits
│         ├─ PCS Hub
│         ├─ Career Hub
│         ├─ Deployment
│         └─ On-Base Shopping
│
├─ 4. UPGRADE TO PREMIUM (/upgrade)
│      │
│      ├─ See Premium Value Prop
│      ├─ Choose Plan (monthly $9.99 or annual $99)
│      ├─ Stripe Checkout
│      │
│      └─ Creates: entitlements (tier: premium, status: active)
│
└─ 5. USE PREMIUM TOOLS
       │
       ├─ LES Auditor
       │  ├─ Upload LES PDF
       │  ├─ Get instant audit
       │  └─ Catch pay errors
       │
       ├─ PCS Copilot
       │  ├─ Plan next move
       │  ├─ Calculate DITY profit
       │  └─ Compare scenarios
       │
       ├─ Base Navigator
       │  ├─ Explore bases
       │  ├─ See weather/housing/schools
       │  └─ Find perfect neighborhood
       │
       └─ Ask Military Expert (Premium Features)
          ├─ Advanced data cards
          ├─ Historical trends
          └─ Custom analysis

LEGEND:
⭐ = Auto-fills from profile
```

---

## 🔐 SECURITY ARCHITECTURE

```
SECURITY LAYERS
│
├─ AUTHENTICATION (Clerk)
│  ├─ User sessions
│  ├─ JWT tokens
│  └─ Webhook sync → users table
│
├─ AUTHORIZATION
│  ├─ Entitlements check (free/premium)
│  ├─ Admin role check (ADMIN_USER_IDS)
│  └─ Feature flags (gradual rollout)
│
├─ ROW LEVEL SECURITY (Supabase RLS)
│  ├─ All 32 tables have RLS policies
│  ├─ Users can only access their own data
│  ├─ Admin bypass with service role key
│  └─ Verified: auth.uid()::text = user_id
│
├─ API SECURITY
│  ├─ Server-side API key protection
│  ├─ Environment variables (never committed)
│  ├─ Rate limiting (ready, not enforced yet)
│  └─ Input validation on all endpoints
│
├─ SECRET SCANNING
│  ├─ Pre-commit hook (blocks commits)
│  ├─ CI/CD scanner (fails builds)
│  ├─ Auto-masking: npm run secret-scan --fix
│  └─ Script: scripts/secret-scan.ts
│
└─ FILE UPLOAD SECURITY
   ├─ 5MB max file size
   ├─ PDF-only for LES uploads
   ├─ Virus scanning (via Supabase)
   └─ RLS on storage buckets
```

---

## 📈 METRICS & MONITORING

```
MONITORING SYSTEMS
│
├─ USER METRICS
│  ├─ Total users (user_profiles count)
│  ├─ Premium users (entitlements where tier=premium, status=active, stripe_subscription_id NOT NULL)
│  ├─ Conversion rate (premium/total * 100)
│  ├─ Activation rate (profiles_completed/total * 100)
│  ├─ New signups (7d)
│  └─ New premium (7d)
│
├─ REVENUE METRICS
│  ├─ MRR (premium_users * $9.99)
│  ├─ ARR (MRR * 12)
│  ├─ ARPU (MRR / total_users)
│  └─ Growth rate (month-over-month)
│
├─ ENGAGEMENT METRICS
│  ├─ DAU/WAU/MAU (daily/weekly/monthly active)
│  ├─ Streaks (current, longest, total days)
│  ├─ Badges (earned vs available)
│  └─ Top streakers (leaderboard)
│
├─ TOOLS METRICS
│  ├─ LES Auditor (uploads, audits, flags, success rate)
│  ├─ PCS Copilot (sessions, scenarios, avg time)
│  ├─ Base Navigator (searches, API calls, cache hits)
│  └─ Calculators (sessions, completions, conversion)
│
├─ SYSTEM HEALTH
│  ├─ Site Pages (32 pages, health status)
│  ├─ API Endpoints (response times)
│  ├─ Database Queries (performance)
│  ├─ External APIs (freshness, uptime)
│  └─ Error Logs (frequency, severity)
│
└─ DATA FRESHNESS
   ├─ BAH rates (last updated, next due)
   ├─ COLA rates (last updated, next due)
   ├─ Pay tables (last updated, next due)
   ├─ External cache (weather, housing, schools TTL)
   └─ Automated checks: npm run check-data-freshness

ALL MONITORED IN: /dashboard/admin (6 tabs)
```

---

## 🎯 QUICK NAVIGATION GUIDE

**Need to:**

✅ **See all pages?**  
→ `/dashboard/admin?tab=sitemap` (Tab 6)

✅ **Check data freshness?**  
→ `/dashboard/admin?tab=ops` → Data Sources (Tab 5)

✅ **View analytics?**  
→ `/dashboard/admin?tab=intel` (Tab 2) → Revenue/Engagement/Tools

✅ **Manage users?**  
→ `/dashboard/admin?tab=personnel` (Tab 3)

✅ **Check system health?**  
→ `/dashboard/admin?tab=sitemap` → Health Checks (Tab 6)

✅ **Toggle features?**  
→ `/dashboard/admin?tab=ops` → Configuration → Feature Flags (Tab 5)

✅ **Review errors?**  
→ `/dashboard/admin?tab=ops` → Error Logs (Tab 5)

✅ **See top pages?**  
→ `/dashboard/admin?tab=sitemap` → Analytics (Tab 6)

---

**Last Updated:** 2025-10-22  
**Version:** 1.0.0  
**Status:** ✅ Complete Platform Architecture Reference  

---

**Related Docs:**
- Quick Reference: `docs/QUICK_REFERENCE.md`
- AI Onboarding: `docs/AI_AGENT_ONBOARDING_GUIDE.md`
- System Status: `SYSTEM_STATUS.md`
- Data Sources: `docs/DATA_SOURCES_REFERENCE.md`


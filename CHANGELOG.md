# 📋 GARRISON LEDGER - CHANGELOG

> **Complete version history of major features, improvements, and system changes.**  
> For current system status, see [`SYSTEM_STATUS.md`](SYSTEM_STATUS.md)

---

## **Version 6.1.0** - 2025-10-29

### 🔄 **Strategic Pivot: TDY Copilot Removal**

**Status:** ✅ Complete

**Why This Change:**
- Focusing on 4 core premium tools that deliver maximum value
- Streamlined user experience and messaging
- Resource optimization for core features
- Clearer value proposition: LES Auditor, PCS Copilot, Base Navigator, Ask Assistant

**Changes Made:**
- ✅ Removed TDY Copilot from homepage, dashboard, and upgrade pages
- ✅ Updated all "5 premium tools" references to "4 premium tools"
- ✅ Deleted `/app/api/tdy/` directory (8 API routes)
- ✅ Deleted `/app/components/tdy/` directory (5 UI components)
- ✅ Deleted `/app/dashboard/tdy-voucher/` directory (3 page files)
- ✅ Deleted `/lib/tdy/` directory (6 library files)
- ✅ Deleted `/app/types/tdy.ts` type definitions
- ✅ Created database migration to drop `tdy_trips` and `tdy_items` tables
- ✅ Updated email templates (OnboardingWelcome, OnboardingPremium)
- ✅ Updated SSOT with TDY as removed feature
- ✅ Updated pricing pages and feature comparison tables

**Database Migration:**
- Created `supabase-migrations/20251029114034_remove_tdy_tables.sql`
- Drops `tdy_items` and `tdy_trips` tables with CASCADE
- ⚠️ Destructive migration - backs up recommended before applying

**Impact:**
- Cleaner marketing message
- Reduced API surface area (98 routes → 90 routes)
- Simplified dashboard UI (4 tool cards in 2x2 grid)
- Better focus on high-value tools

---

## **Version 6.0.1** - 2025-10-23

### 🌐 **Domain Migration: app.familymedia.com → garrisonledger.com**

**Status:** ✅ Code Complete (External Services Pending)

**Why This Matters:**
- Professional military-focused brand identity
- Better SEO for military search queries
- Established before user acquisition begins
- Clean domain name (memorable, trustworthy)

**Code Changes:**
- ✅ Updated `lib/seo-config.ts` - Site URL and contact email
- ✅ Updated `lib/email-templates.tsx` - Base URL fallback
- ✅ Updated all 5 email templates with www domain defaults
  - `emails/WeeklyDigest.tsx`
  - `emails/PCSChecklist.tsx`
  - `emails/OnboardingWelcome.tsx`
  - `emails/OnboardingFeatures.tsx`
  - `emails/OnboardingPremium.tsx`
- ✅ Created comprehensive migration documentation
- ✅ Updated README.md with new domain
- ✅ Added CHANGELOG entry

**External Services to Update:**
- ⏳ Cloudflare DNS configuration (CNAME records)
- ⏳ Vercel domain addition and SSL provisioning
- ⏳ Clerk authentication allowed origins
- ⏳ Stripe webhook endpoint update
- ⏳ Supabase site URL and redirect URLs
- ⏳ Google Cloud Console API authorized origins
- ⏳ Environment variables (NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_APP_URL)

**Migration Approach:**
- Clean cutover (no real users affected)
- 301 redirects from old domain
- Environment variable based (easy rollback)
- Comprehensive testing checklist

**Documentation:**
- Created `docs/DOMAIN_MIGRATION_2025-10-23.md` with complete migration guide
- Step-by-step external service configuration
- Testing checklist (authentication, payments, APIs, email)
- Rollback plan for emergency

**Timeline:** 2-3 hours total  
**Risk Level:** LOW (only test accounts exist)

**See:** [`docs/DOMAIN_MIGRATION_2025-10-23.md`](docs/DOMAIN_MIGRATION_2025-10-23.md) for complete details

---

## **Version 5.1.0** - 2025-10-20 (Evening Session)

### 🎨 **Major UI Enhancements & API Fixes**

**✅ Base Navigator Improvements:**
- Fixed Zillow API key inconsistency in housing integration
- Implemented real OpenWeatherMap weather integration (replacing placeholder)
- Real comfort index calculation (temperature, humidity, precipitation)
- 24-hour caching for weather data
- Graceful fallbacks for missing API keys
- Created comprehensive setup guide

**✅ Home Page Redesign:**
- Dark military aesthetic hero (slate-900 gradient)
- Increased headline size (5xl → 7xl)
- Gradient text effect on "Intelligence Platform"
- Trust badge with Shield icon
- Dual CTA buttons (Start Free Trial + See Tools)
- Redesigned premium tool cards (larger, clickable, hover animations)
- Direct links to each tool
- Side-by-side pricing cards with annual plan highlight
- Better trust signals and mobile responsive design

**✅ Navigation Enhancement:**
- New "Premium Tools" dropdown between Dashboard and Calculators
- 5 premium tools featured with color coding and badges
- Renamed "Core Tools" → "Calculators" for clarity
- Added to both desktop and mobile navigation
- Active state highlighting and smooth animations

**Files Modified:** 6 files  
**New Documentation:** 2 files (`SESSION_FIXES_COMPLETE.md`, `BASE_NAVIGATOR_API_SETUP.md`)

---

## **Version 5.0.0** - 2025-10-20

### 📚 **Intel Library Revolution - Auto-Updating Data Blocks**

**Status:** ✅ Production - Fully Operational

**Major Features:**
- **Zero Hard-Coded Rates:** All BAH/BAS/COLA/IRS/TSP/TRICARE values now dynamic
- **Auto-Updating System:** Admin uploads CSV → Content updates instantly
- **Provenance Tracking:** Every data point shows source + as-of date
- **Content Governance:** Linter catches guarantee language, missing disclaimers
- **PCS Copilot Integration:** Seamless integration via shared providers

**Technical Implementation:**
- **Database:** 7 new tables (`bah_rates`, `conus_cola_rates`, `oconus_cola_rates`, `admin_constants`, `content_flags`, `content_versions`, `dynamic_feeds`)
- **Providers:** 6 dynamic data providers (BAH, BAS, COLA, IRS, TRICARE, Mileage)
- **MDX Components:** 4 server components (`Disclaimer`, `AsOf`, `DataRef`, `RateBadge`)
- **Content Tools:** 5 CLI tools (lint, autofix, audit, report, depublish)
- **Admin UIs:** 3 dashboards (Intel Library, Triage, Feeds Management)
- **API Routes:** 3 endpoints (refresh, status, recompute-asof)
- **Cron Jobs:** 3 Vercel jobs (daily BAH/COLA, daily IRS, weekly TRICARE/BAS)

**Intel Cards Launched:** 6 production cards with live data

**Documentation:** 4 comprehensive docs in `docs/active/`

---

## **Version 4.2.0** - 2025-01-19

### 💰 **LES & Paycheck Auditor - Core Complete**

**Status:** 🟡 Core Logic Complete, UI Development Pending

**Features Built:**
- **Database Schema:** 5 tables + storage bucket + admin view (271 lines SQL)
- **Business Logic:** 4 modules (codes, parse, expected, compare) - 900+ lines
- **API Routes:** 3 endpoints (upload, audit, history)
- **Type System:** Complete TypeScript (400+ lines)
- **SSOT Integration:** Feature config + BAS constants + thresholds

**Core Functionality:**
- Upload LES PDF (5MB max)
- Parse line items (BAH, BAS, COLA, special pays)
- Compare actual vs expected pay
- Generate actionable flags with BLUF messaging
- Tier gating: Free (1/month), Premium (unlimited)
- Factual-only policy (no guessing if data unavailable)

**Flag Types:**
- **Red (Critical):** BAH mismatch, BAS missing, COLA stopped
- **Yellow (Warning):** COLA unexpected, minor variance, verification needed
- **Green (All Clear):** Allowances verified correct

**Security & Privacy:**
- Server-side only parsing (never client-exposed)
- Private storage with RLS
- User ownership validation
- No synthetic data (factual-only)

**Pending:**
- [ ] Install `pdf-parse` dependency
- [ ] Create UI components
- [ ] Add navigation entry
- [ ] End-to-end testing

---

## **Version 4.1.0** - 2025-01-19

### 🔒 **Security & Data Integrity Overhaul**

**✅ Single Source of Truth (SSOT):**
- Created `lib/ssot.ts` - canonical source for all system facts
- All metrics, costs, and feature statuses centralized
- Documentation now references SSOT instead of hardcoded values
- Automatic validation of environment variables
- Helper functions for accessing configs safely

**✅ Security Baseline:**
- **Secret Scanner** (`scripts/secret-scan.ts`):
  - Scans codebase for exposed API keys, tokens, credentials
  - Auto-masking capability (`npm run secret-scan -- --fix`)
  - Pre-commit hook blocks commits with secrets
  - CI/CD integration (fails build if secrets detected)
  
**✅ Secrets Remediated:**
- Google Weather API key masked
- GreatSchools API key masked
- All documentation updated with masked placeholders
- Full audit documented in `SECURITY_NOTICE_REMEDIATION.md`

**✅ Generated Metrics:**
- **Metrics Generator** (`scripts/generate-metrics.ts`):
  - Auto-counts pages, API routes, bases, components
  - Exports `generated/metrics.json`
  - CI-ready for automated documentation updates
  - Zero manual metric updates required

---

## **Version 4.0.0** - 2025-01-19

### 🗺️ **Base Guides Elite - World-Class UX Overhaul**

**Status:** ✅ Complete - 203 Bases Worldwide

**Major Improvements:**
- **Elite Visual Design:** Military-grade cards with professional layout
- **Smart Sorting:** Distance-based + favorites + recents
- **Enhanced Search:** Real-time filtering, fuzzy matching
- **Quick Stats:** Key metrics visible at a glance
- **Mobile-First:** Touch-optimized, responsive cards
- **Performance:** Virtualization for large lists

**Base Coverage:**
- CONUS: 163 bases
- OCONUS: 40 bases
- Total: 203 bases worldwide

**Data Quality:**
- Factual-only policy (no synthetic data)
- Real BAH rates from DFAS
- Official base information
- Live weather integration
- Real housing market data

**UX Features:**
- Favorites system
- Recently viewed tracking
- Distance calculator
- Filter by branch
- Filter by region
- Filter by country

---

## **Version 3.5.0** - 2025-01-19

### 🌤️ **External Data APIs Deployed**

**Weather Integration:**
- Provider: Google Weather API (via RapidAPI)
- Coverage: All 203 bases
- Cache: 24 hours
- Data: Temperature, conditions, comfort index
- Fallback: Graceful degradation if API unavailable

**Housing Integration:**
- Provider: Zillow Market Data (via RapidAPI)
- Coverage: CONUS bases with housing markets
- Cache: 30 days
- Data: Median rent, median sale price, market trends
- Attribution: Zillow branding required

**Schools Integration:**
- Provider: GreatSchools API
- Coverage: CONUS bases near schools
- Cache: 30 days
- Tier: Premium-only
- Data: School ratings, reviews, demographics

**Provenance UI:**
- Every external data card shows source
- Last fetched timestamp (absolute, not relative)
- Cache TTL displayed
- Attribution links to official sources

**Documentation:** 3 vendor docs in `docs/vendors/`

---

## **Version 3.0.0** - 2025-01-19

### 💰 **AI Cost Optimization Complete - 97% Reduction**

**Migration: GPT-4o → Gemini 2.0 Flash**

**Cost Impact:**
- **Before:** $0.25 per plan (GPT-4o)
- **After:** $0.02 per plan (Gemini 2.0 Flash)
- **Savings:** 97% cost reduction

**Quality Impact:**
- Maintained or improved plan quality
- Faster generation times
- Same 8-10 block selection
- Better narrative coherence
- JTR-powered accuracy

**Profitability:**
- Cost per user: $0.35/month
- Premium revenue: $9.99/month
- Profit margin: 96.5%
- At 5,000 users: $578,400/year profit

**System Updates:**
- Updated all API routes to use Gemini
- Migrated prompt engineering
- Added cost tracking
- Updated SSOT with new pricing

---

## **Version 2.5.0** - 2025-01-19

### 🚁 **PCS Money Copilot - 100% Complete**

**Status:** ✅ Premium-Exclusive, Fully Operational

**Core Features:**
- JTR-powered calculations (Joint Travel Regulations)
- DITY move profit optimizer
- Weight-based reimbursement calculator
- Storage vs. shipping comparison
- Timeline & checklist generation
- Personalized recommendations

**Technical Implementation:**
- 2 database tables (`pcs_copilot_sessions`, `pcs_copilot_scenarios`)
- 5 API endpoints
- 8 UI components
- Integration with Base Navigator
- Integration with Intel Library

**Business Logic:**
- Accurate DITY move profit calculations
- PPM (Personally Procured Move) estimator
- DLA (Dislocation Allowance) calculator
- Advance pay calculations
- Storage cost comparisons

**Premium Gating:**
- Free: Limited preview
- Premium: Full access, unlimited scenarios

---

## **Version 2.0.0** - 2025-01-18

### 🎨 **Navbar Transformation - World-Class UX Upgrade**

**Major Changes:**
- Completely redesigned navigation structure
- 4 focused dropdowns (Tools, Resources, Learn, Community)
- Premium Tools section with color coding
- Mobile-first hamburger menu
- Active state highlighting
- Smooth animations and transitions

**Desktop Navigation:**
- Mega menu dropdowns
- Icon-enhanced menu items
- Visual hierarchy improvements
- Keyboard navigation support

**Mobile Navigation:**
- Full-screen overlay
- Touch-optimized tap targets (44px+)
- Collapsible sections
- Smooth slide animations

**Accessibility:**
- ARIA labels on all interactive elements
- Keyboard shortcuts
- Screen reader optimized
- Focus management

---

## **Version 1.9.0** - 2025-01-17

### 🎉 **Complete Site-Wide Brand Alignment**

**Color System Overhaul:**
- Removed dark mode complexity
- Light-mode-only semantic system
- WCAG AA compliant (4.5:1 text, 3:1 UI)
- 40+ utility classes
- Military-professional aesthetic

**Results:**
- 3,525 automated fixes across 115+ files
- Eliminated 3,238 hardcoded Tailwind colors
- Improved contrast ratios
- Consistent visual language
- Easier maintenance

**Documentation:**
- Color system guide
- Component usage examples
- Contrast checker script
- Automated fixer script

---

## **Version 1.8.0** - 2025-01-17

### 📊 **Calculator Masterplan Complete**

**6 World-Class Calculators Delivered:**

1. **TSP Calculator**
   - Retirement projections
   - Compound interest calculations
   - Contribution recommendations
   - BRS vs High-3 comparison

2. **BAH Calculator**
   - Zip code lookup
   - Rank-based rates
   - Dependent status
   - Real DFAS data

3. **BAS Calculator**
   - Officer vs Enlisted rates
   - Monthly projections
   - Official DFAS rates

4. **Mileage Reimbursement**
   - PCS travel cost calculator
   - DFAS rate integration
   - Multi-leg trip support

5. **DITY Move Calculator**
   - Profit estimator
   - Weight-based calculations
   - PPM vs full service comparison

6. **TDY Calculator**
   - Per diem calculations
   - Lodging reimbursement
   - Travel day M&IE (75% rule)

**Shared Features:**
- Professional UI/UX
- Mobile-responsive
- Save & share functionality
- PDF export (Premium)
- Analytics tracking
- Keyboard shortcuts

**Database:**
- 2 tables (`calculator_sessions`, `calculator_completions`)
- User history tracking
- Completion analytics
- Conversion funnel data

---

## **Version 1.7.0** - 2025-01-17

### 🏠 **Home Page Optimization Complete**

**Authenticity Fixes:**
- Removed fake testimonial counts
- Removed synthetic user numbers
- Added realistic trust signals
- Factual-only messaging
- Transparent value proposition

**Content Improvements:**
- BLUF headline structure
- Clear benefit statements
- Realistic use cases
- Military-specific language
- No hype or exaggeration

**Visual Enhancements:**
- Professional hero section
- Clear CTA hierarchy
- Trust badge placement
- Social proof (when available)
- Mobile-optimized layout

---

## **Version 1.6.0** - 2025-01-17

### 📱 **Mobile Optimization Breakthrough**

**Touch Targets:**
- Minimum 44px tap targets (WCAG AAA)
- Generous spacing between interactive elements
- Bottom navigation accessible
- Thumb-friendly layouts

**Performance:**
- Fast loading on 3G networks (<5s)
- Progressive enhancement
- Offline capability (PWA ready)
- Lazy loading images

**Responsive Design:**
- Mobile-first approach
- Portrait optimization
- Landscape support
- Tablet breakpoints

**Testing:**
- iOS Safari verified
- Android Chrome verified
- Various screen sizes tested
- Touch gesture support

---

## **Version 1.5.0** - 2025-01-17

### 💎 **Three-Tier Pricing Model Implemented**

**Pricing Structure:**

| Tier | Monthly | Annual | Plan Generations |
|------|---------|--------|------------------|
| **Free** | $0 | - | 1/month |
| **Premium** | $9.99 | $99 | 10/month |
| **Pro** | $24.99 | $249 | 30/month |

**Value Proposition:**
- **Free:** 1 AI plan, 2 blocks visible, basic calculators
- **Premium:** 10 plans, full content (8-10 blocks), all tools, 5GB storage
- **Pro:** 30 plans, white-glove support, unlimited storage, API access

**Margin Protection:**
- Premium: 30% margin minimum
- Pro: 16% margin minimum
- All tiers profitable or acceptable CAC
- Sustainable at scale

**At Scale (5,000 Users):**
- Revenue: $32,475/month
- AI Cost: $24,300/month (before Gemini migration)
- Profit: $8,175/month (25% margin)
- Annual Profit: $98,100

---

## **Version 1.4.0** - 2025-01-17

### 🚀 **Phase 2 Enhanced Functionality**

**Dynamic Question Engine:**
- 10+ contextual follow-up questions
- Rule-based triggers (NO AI calls!)
- Deployment, debt, TSP, housing, career contexts
- Better assessment quality
- Zero additional AI cost

**Plan Versioning:**
- Version numbering (v1, v2, v3...)
- Archives last 5 versions
- Regeneration count tracking
- Last updated display
- Version badge on plans

**Calculator Integration:**
- Direct deep-links from plans
- Analytics tracking on clicks
- Conversion tracking
- Tool usage optimization

**Spouse Plan Sharing:**
- Share with connected spouse
- Optional message support
- Permission control
- Collaborative planning

---

## **Version 1.3.0** - 2025-01-17

### 💰 **AI Cost Optimization - Phase 1**

**Dashboard AI Caching (96% reduction):**
- 24-hour cache per user
- Reduces from $0.90/month to $0.03/month
- Savings: $0.87 per user per month

**Natural Search Caching (70% hit rate):**
- 7-day cache for common queries
- Normalized query matching
- Hit count tracking
- Reduces AI calls by 70%

**Tier-Based Rate Limits:**
- Natural Search: 5/10/20 per day by tier
- AI Explainer: 5/15/30 per day by tier
- Quota tracking system

**Cost Reduction:**
- Free: $17.85/month → $4.23/month (76% reduction)
- Premium: $40.20/month → $13.53/month max (66% reduction)
- Pro: $102.00/month → $31.53/month max (69% reduction)

**Database Tables:**
- `ai_recommendation_cache` (24hr cache)
- `natural_search_cache` (7-day cache)
- `ai_usage_quotas` (daily tracking)

---

## **Version 1.2.0** - 2025-01-17

### 🗄️ **Database Architecture Expansion**

**New Tables Added:**
- **Intel Library:** `bah_rates`, `conus_cola_rates`, `oconus_cola_rates`, `admin_constants`
- **Content Governance:** `content_flags`, `content_versions`, `dynamic_feeds`
- **LES Auditor:** `les_uploads`, `les_audits`, `les_flags`, `les_admin_view`
- **PCS Copilot:** `pcs_copilot_sessions`, `pcs_copilot_scenarios`
- **Base Navigator:** `navigator_locations`, `navigator_preferences`
- **TDY Copilot:** `tdy_sessions`, `tdy_scenarios`

**Total Tables:** 28 (up from 10)

**Security:**
- RLS policies on all tables
- User ownership validation
- Service role policies
- Clerk-compatible auth

---

## **Version 1.1.0** - 2025-01-17

### 🎯 **Admin Analytics & Conversion Funnel**

**Admin Dashboard:**
- Calculator completion rates (bar charts)
- Conversion funnel visualization
- Top features by usage (pie chart)
- Real-time insights
- PostgreSQL-powered analytics

**Event Tracking:**
- Page views
- Calculator starts
- Calculator completions
- Plan generations
- Upgrade clicks
- Feature usage

**Materialized View:**
- `admin_analytics_view` for fast queries
- Daily refresh
- Aggregated metrics
- Performance optimized

---

## **Version 1.0.0** - 2025-01-16

### 🎉 **Initial Production Launch**

**Core Features:**
- User authentication (Clerk)
- User profiles
- Assessment system
- AI plan generation (GPT-4o)
- 410 hand-curated content blocks
- Basic calculators
- Premium subscription (Stripe)

**Tech Stack:**
- Next.js 15
- React 19
- TypeScript 5.x
- Tailwind CSS
- Supabase PostgreSQL
- Vercel deployment

**Business Model:**
- Free tier: 1 plan/month
- Premium tier: $9.99/month
- Stripe integration
- Webhook handling

---

## 🔄 **Data Accuracy & Policy Changes**

### **Base Comparison Removed (2025-01-19)**
**Reason:** Factual-only policy  
**Impact:** Removed synthetic comparison scores  
**Replacement:** Individual base guides with official data only

**Before:**
- Side-by-side base comparison with generated scores
- Synthetic "quality of life" ratings
- Estimated cost comparisons

**After:**
- Individual base pages with official data only
- Real BAH rates from DFAS
- Live weather from OpenWeatherMap
- Real housing prices from Zillow
- Official school ratings from GreatSchools
- "Unavailable" shown when data missing

### **Natural Search Removed (2025-01-18)**
**Reason:** Cost optimization  
**Impact:** Removed AI-powered content search  
**Replacement:** Traditional search + filters

**Savings:** ~$5-10/user/month in AI costs

---

## 📊 **Key Metrics Evolution**

| Metric | v1.0 (Jan 16) | v3.0 (Jan 19) | v5.1 (Oct 20) |
|--------|---------------|---------------|---------------|
| **AI Cost/Plan** | $0.25 | $0.02 | $0.02 |
| **Margin** | 75% | 96.5% | 96.5% |
| **Pages** | 50 | 100 | 130+ |
| **API Routes** | 50 | 98 | 117 |
| **Database Tables** | 10 | 22 | 28 |
| **Calculators** | 3 | 6 | 6 |
| **Premium Tools** | 0 | 3 | 5 |
| **Base Guides** | 0 | 203 | 203 |
| **Intel Cards** | 0 | 6 | 12 |

---

## 🎯 **Lessons Learned**

### **What Worked**
✅ Gemini migration (97% cost savings)  
✅ Factual-only policy (builds trust)  
✅ Premium tool focus (clear value)  
✅ SSOT module (single source of truth)  
✅ Content governance (quality control)  
✅ Military aesthetic (authentic branding)  

### **What Changed**
🔄 GPT-4o → Gemini (cost optimization)  
🔄 Dark mode → Light mode only (simplicity)  
🔄 Base comparison → Individual guides (accuracy)  
🔄 Natural search → Traditional search (cost)  
🔄 Three tiers → Two tiers (simplicity - Future: may add Pro)  

### **What's Next**
🚀 LES Auditor launch  
🚀 Scale to 1,000 premium users  
🚀 Referral program  
🚀 Plan versioning  
🚀 Content management admin  

---

**For current system status, see [`SYSTEM_STATUS.md`](SYSTEM_STATUS.md)**  
**For full historical logs, see [`docs/archive/SYSTEM_STATUS_HISTORY_*.md`](docs/archive/)**


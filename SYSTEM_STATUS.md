# GARRISON LEDGER - SYSTEM STATUS

**Last Updated:** 2025-10-26  
**Version:** 4.0.0 (from ssot.ts)  
**Environment:** Production

---

## 🎯 PRODUCTION FEATURES (from sitemap.ts)

### Public Pages
- **Homepage** (`/`) - Tools-first landing page
- **Sign In/Up** (`/sign-in`, `/sign-up`) - Clerk authentication
- **Privacy & Disclosures** (`/privacy`, `/disclosures`) - Legal compliance

### Hub Pages (Public, High-Value Content)
- **PCS Hub** (`/pcs-hub`) - PCS planning resources
- **Career Hub** (`/career-hub`) - Military career guidance
- **Deployment** (`/deployment`) - Deployment preparation
- **On-Base Shopping** (`/on-base-shopping`) - Shopping guides
- **Base Guides** (`/base-guides`) - 203 bases (163 CONUS, 40 OCONUS)

### Premium Tools (Dashboard - Auth Required)

#### 1. **LES Auditor** (`/dashboard/paycheck-audit`) - BETA
- **Status:** Beta testing
- **Tier:** Free + Premium
- **Free:** 1 upload/month, 5MB max, PDF only
- **Premium:** Unlimited uploads
- **Features:** OCR processing, pay error detection, LES validation

#### 2. **Ask Assistant** (`/dashboard/ask`) - ACTIVE
- **Status:** Production stable
- **Tier:** All tiers
- **Free:** 5 questions/month, 3072 tokens
- **Premium:** 50 questions/month, 6144 tokens
- **Credit packs:** 25/$1.99, 100/$5.99, 250/$9.99
- **Features:** RAG-enabled with pgvector, official data queries

#### 3. **PCS Copilot** (`/dashboard/pcs-copilot`) - ACTIVE
- **Status:** Production stable
- **Tier:** Premium exclusive
- **Features:** 
  - DITY calculations and entitlements
  - OCR document processing
  - Assignment planner (base comparison)
  - Claim management and validation

#### 4. **Base Navigator** (`/dashboard/navigator`) - ACTIVE
- **Status:** Production stable
- **Tier:** Premium exclusive
- **Features:**
  - External data: Weather (Google), Housing (Zillow), Schools (GreatSchools)
  - 30-day cache with provenance tracking
  - Neighborhood analysis

#### 5. **TDY Voucher** (`/dashboard/tdy-voucher`) - ACTIVE
- **Status:** Production stable
- **Tier:** All tiers
- **Features:** Per diem calculations, voucher generation

### Core Calculators (Dashboard Tools)
- **TSP Modeler** (`/dashboard/tools/tsp-modeler`)
- **SDP Strategist** (`/dashboard/tools/sdp-strategist`)
- **House Hacking Calculator** (`/dashboard/tools/house-hacking`)
- **Salary Calculator** (`/dashboard/tools/salary-calculator`)
- **PCS Planner** (`/dashboard/tools/pcs-planner`)
- **On-Base Savings** (`/dashboard/tools/on-base-savings`)

### Deprecated/Removed Features
- **Intel Library** → Ask Assistant (deprecated 2025-01-23)
- **Base Comparison Feature** (removed, factual-only policy)
- **Natural Search** (removed, cost optimization)

---

## 🗄️ DATA SYSTEMS (4 Subsystems)

### 1. **LES Auditor Data** - Annual/Quarterly Updates
- `military_pay_tables` - Base pay (E01-O10)
- `bah_rates` - Housing allowance (14,352 rates)
- `sgli_rates` - Life insurance premiums
- `payroll_tax_constants` - FICA/Medicare rates
- `state_tax_rates` - State tax information
- `conus_cola_rates` / `oconus_cola_rates` - Cost of living

### 2. **Base Navigator Data** - External APIs, 30-day Auto-refresh
- `base_external_data_cache` - Weather, schools, housing data
- `neighborhood_profiles` - ZIP analysis
- **Sources:** Google Weather, Zillow (RapidAPI), GreatSchools

### 3. **PCS Copilot Data** - Annual Updates
- `entitlements_data` - DLA, weight allowances
- `jtr_rules` - Joint Travel Regulations
- **Sources:** JTR, DFAS, DTMO

### 4. **Content Data** - Hand-curated
- `content_blocks` - 410 expert content blocks
- `feed_items` - RSS articles

---

## 🤖 AI MODELS & COSTS (from ssot.ts)

### Primary Models
- **Provider:** Google Gemini 2.5 Flash
- **Plan generation:** $0.02/plan
- **Ask Assistant:** RAG-enabled with text-embedding-3-small
- **PCS OCR:** $0.0003/document

### Cost Structure
- **Per user monthly:** $0.35 (AI + API costs)
- **Margin:** 96.5%
- **Weather API:** $0.10 per 1000 requests
- **Housing API:** $0.50 per 1000 requests
- **Schools API:** $0.25 per 1000 requests

---

## 🛠️ TECH STACK

### Core Framework
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS
- **Hosting:** Vercel

### Authentication & Database
- **Auth:** Clerk (with Supabase user sync via webhook)
- **Database:** Supabase (PostgreSQL + pgvector)
- **RLS:** Row Level Security enabled on all tables

### Payments & Integrations
- **Payments:** Stripe
- **APIs:** Google Weather, Zillow (RapidAPI), GreatSchools
- **AI:** Google Gemini 2.5 Flash

---

## 💰 PRICING (from ssot.ts)

### Subscription
- **Premium Monthly:** $9.99/month
- **Premium Annual:** $99/year (20% savings)

### Ask Assistant Credit Packs
- **25 Questions:** $1.99 (7.96¢ per question)
- **100 Questions:** $5.99 (5.99¢ per question)
- **250 Questions:** $9.99 (3.996¢ per question)

---

## 📊 KEY METRICS (from ssot.ts)

### Platform Scale
- **Pages:** 130
- **API Routes:** 98
- **Military Bases:** 203 (163 CONUS, 40 OCONUS)
- **BAH Rates:** 14,352 (2025)
- **Content Blocks:** 410

### Performance Targets
- **Page Load:** < 3 seconds
- **Core Web Vitals:** LCP < 2.5s, FID < 0.1s, CLS < 0.1
- **Bundle Size:** < 200KB first load, < 50KB per route
- **Mobile:** < 5s load on 3G

---

## 📚 DOCUMENTATION MAP

### Active Operational Docs (`docs/active/`)
- `ASK_ASSISTANT_FEATURE.md` - Ask Assistant implementation
- `PCS_COPILOT_ARCHITECTURE_MAP.md` - Comprehensive PCS system guide
- `LES_AUDITOR_*` - Testing, implementation, user guides
- `BASE_NAVIGATOR_*` - Setup, API, troubleshooting
- `PREMIUM_TOOL_AUDIT_TEMPLATE.md` - Tool evaluation framework
- `REAL_DATA_COLLECTION_PLAN.md` - Data sourcing strategy
- `AI_COST_*` - Cost monitoring and analysis
- `MOBILE_*` - Mobile optimization guides
- `ANNUAL_BAS_UPDATE_REMINDER.md` - Recurring maintenance

### Master References
- `lib/ssot.ts` - Single Source of Truth for all constants
- `app/sitemap.ts` - Production routes and priorities
- `docs/DATA_SOURCES_REFERENCE.md` - Data source details
- `docs/MILITARY_AUDIENCE_GUIDE.md` - Audience psychology
- `docs/CLERK_SUPABASE_INTEGRATION.md` - Auth integration

### Archived Docs (`docs/archive/`)
- Historical audits and session notes
- Completed migrations and implementations
- Deprecated feature documentation
- Project management artifacts

---

## 🔒 SECURITY & COMPLIANCE

### Data Protection
- **RLS Policies:** All user data protected by Row Level Security
- **Authentication:** Clerk integration with Supabase user sync
- **API Security:** Rate limiting and authentication on all endpoints
- **Encryption:** At rest and in transit

### Compliance
- **WCAG Level:** AA accessibility compliance
- **Data Policy:** Factual-only, provenance required
- **Military Standards:** Professional, no-BS approach

---

## 🚀 DEPLOYMENT & MONITORING

### Deployment
- **Platform:** Vercel (automatic deployments)
- **Environment:** Production environment active
- **CI/CD:** GitHub integration with automated builds

### Monitoring
- **Error Tracking:** Comprehensive error logging
- **Performance:** Core Web Vitals monitoring
- **Analytics:** User engagement and conversion tracking
- **Health Checks:** Automated system health monitoring

---

## 📞 SUPPORT & CONTACT

### Support Channels
- **Email:** support@garrisonledger.com
- **Founder:** hello@garrisonledger.com
- **Team:** Veteran-founded, military spouse team

### External Resources
- **DFAS:** https://www.dfas.mil
- **DoDEA:** https://www.dodea.edu
- **TSP:** https://www.tsp.gov
- **VA:** https://www.va.gov

---

## 🔄 MAINTENANCE SCHEDULE

### Regular Updates
- **BAH Rates:** Annual (January)
- **BAS Rates:** Annual (January)
- **JTR Rates:** Quarterly
- **Military Bases:** As needed (openings/closures)
- **External Data:** 30-day cache refresh

### System Maintenance
- **Database:** Regular backups and optimization
- **Security:** Regular security audits
- **Performance:** Continuous monitoring and optimization

---

**This document serves as the single source of truth for Garrison Ledger's current system state. It should be updated whenever significant changes are made to features, infrastructure, or documentation.**

**Last verification:** All active features cross-referenced with `app/sitemap.ts` and `lib/ssot.ts`

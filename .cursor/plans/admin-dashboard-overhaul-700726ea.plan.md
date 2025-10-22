<!-- 700726ea-b07c-40ad-8677-1f9b5dfe7b81 75ba50b8-ff63-4027-9b3f-9ceefc2aeddc -->
# Admin Dashboard - Sitemap & Site Health Audit System

## 🎯 Overview

Create a **comprehensive sitemap and site monitoring system** in the admin dashboard that provides complete visibility into all 30+ pages, their health status, analytics, and interconnections.

---

## 📊 Current Site Inventory (30+ Pages)

### Home & Core (2)

- `/` - Home page
- `/dashboard` - Main dashboard

### Dashboard Pages (2)

- `/dashboard/binder` - Document Binder
- `/dashboard/settings` - Settings

### Profile (1)

- `/dashboard/profile/setup` - Profile Setup

### Premium Tools (5)

- `/dashboard/paycheck-audit` - LES Auditor
- `/dashboard/pcs-copilot` - PCS Copilot
- `/dashboard/navigator` - Base Navigator
- `/dashboard/tdy-voucher` - TDY Copilot
- `/dashboard/intel` - Intel Library

### Calculators (6)

- `/dashboard/tools/tsp-modeler` - TSP Calculator
- `/dashboard/tools/sdp-strategist` - SDP Strategist
- `/dashboard/tools/house-hacking` - House Hacking
- `/dashboard/tools/pcs-planner` - PCS Planner
- `/dashboard/tools/on-base-savings` - On-Base Savings
- `/dashboard/tools/salary-calculator` - Salary Calculator

### Resources (3)

- `/dashboard/listening-post` - Listening Post
- `/dashboard/directory` - Directory
- `/dashboard/referrals` - Referrals

### Toolkits (4)

- `/pcs-hub` - PCS Hub
- `/career-hub` - Career Hub
- `/deployment` - Deployment
- `/on-base-shopping` - On-Base Shopping

### Upgrade & Contact (3)

- `/dashboard/upgrade` - Upgrade
- `/contact` - Contact
- `/dashboard/support` - Support

### Legal (4)

- `/disclosures` - Disclosures
- `/privacy` - Privacy Policy
- `/privacy/cookies` - Cookies Policy
- `/privacy/do-not-sell` - Do Not Sell

### Admin (2)

- `/dashboard/admin` - Admin Dashboard
- `/dashboard/admin/briefing` - Admin Briefing

---

## 🗄️ Database Schema

### New Table: `site_pages`

```sql
CREATE TABLE site_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  tier_required TEXT, -- 'free', 'premium', or null for public
  description TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'deprecated', 'beta'
  last_updated TIMESTAMP,
  last_audit TIMESTAMP,
  health_status TEXT, -- 'healthy', 'warning', 'error', 'unknown'
  response_time_ms INTEGER,
  error_count_7d INTEGER DEFAULT 0,
  view_count_7d INTEGER DEFAULT 0,
  view_count_30d INTEGER DEFAULT 0,
  avg_time_on_page_seconds INTEGER,
  bounce_rate DECIMAL(5,2),
  conversion_rate DECIMAL(5,2),
  dependencies JSONB, -- Related pages, APIs, external services
  meta_tags JSONB, -- SEO metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_site_pages_category ON site_pages(category);
CREATE INDEX idx_site_pages_status ON site_pages(status);
CREATE INDEX idx_site_pages_tier ON site_pages(tier_required);
CREATE INDEX idx_site_pages_health ON site_pages(health_status);
```

### New Table: `page_health_checks`

```sql
CREATE TABLE page_health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES site_pages(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL, -- 'availability', 'performance', 'seo', 'links'
  status TEXT NOT NULL, -- 'pass', 'fail', 'warning'
  response_time_ms INTEGER,
  error_message TEXT,
  details JSONB,
  checked_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_health_checks_page ON page_health_checks(page_id);
CREATE INDEX idx_health_checks_status ON page_health_checks(status);
```

---

## 🎨 Admin Dashboard Integration

### New Tab: "Sitemap" (6th main tab)

**Location:** `/dashboard/admin?tab=sitemap`

**Sub-tabs:**

1. **Overview** - Visual sitemap with health status
2. **Pages** - Detailed table of all pages
3. **Health Checks** - Automated health monitoring
4. **Analytics** - Page performance metrics
5. **Broken Links** - 404 detector

---

## 📋 Phase 1: Sitemap Database & Seed

### 1.1 Create Database Tables

- Migration: `20251022_sitemap_tables.sql`
- Tables: `site_pages`, `page_health_checks`
- RLS policies for admin access

### 1.2 Seed Site Pages

- Script: `scripts/seed-sitemap.ts`
- Populate all 30+ pages from the list
- Categories: Home, Dashboard, Premium, Calculators, Resources, Toolkits, Upgrade, Contact, Legal, Admin
- Add tier requirements (free/premium)
- Initial descriptions

### 1.3 Page Metadata Extraction

- Script to scan `app/` directory
- Extract page titles from metadata
- Extract descriptions from page headers
- Auto-detect tier requirements from middleware

---

## 📋 Phase 2: Health Check System

### 2.1 Availability Checker

- API: `POST /api/admin/sitemap/check-health`
- Ping all pages (internal fetch)
- Record response times
- Detect 404s, 500s
- Update `health_status` field

### 2.2 Performance Monitoring

- Check Core Web Vitals per page
- Lighthouse scores (via API or manual)
- Bundle size analysis
- Time to First Byte (TTFB)

### 2.3 Broken Link Detector

- Scan each page for internal links
- Validate all hrefs
- Flag broken links
- Suggest fixes (e.g., redirects)

### 2.4 SEO Health Checks

- Meta title present & length
- Meta description present & length
- Open Graph tags
- Canonical URLs
- Structured data (schema.org)

---

## 📋 Phase 3: Analytics Integration

### 3.1 Page View Tracking

- Query `analytics_events` for page views
- Aggregate by path
- Calculate 7d and 30d view counts
- Store in `site_pages.view_count_*`

### 3.2 Engagement Metrics

- Average time on page
- Bounce rate per page
- Conversion rate (e.g., profile setup → premium)
- Exit pages

### 3.3 User Flow Analysis

- Track common navigation paths
- Entry pages → Exit pages
- Identify drop-off points
- Suggest navigation improvements

---

## 📋 Phase 4: Admin UI Components

### 4.1 Sitemap Overview Component

**Visual tree structure:**

- Hierarchical display (Home → Dashboard → Tools)
- Color-coded health status (🟢 Healthy, 🟡 Warning, 🔴 Error)
- Click to expand categories
- Quick stats per category

### 4.2 Pages Table Component

**Detailed table with:**

- Path, Title, Category, Tier
- Health Status badge
- Response time
- 7d views
- Last updated date
- Actions (Edit, View, Health Check)

**Filters:**

- By category
- By tier (free/premium)
- By health status
- By view count (sort)

### 4.3 Health Dashboard Component

**Real-time health overview:**

- Total pages by health status
- Average response time
- Error count (7d)
- Recent health checks
- "Run Full Health Check" button

### 4.4 Analytics Dashboard Component

**Page performance:**

- Top 10 pages by views
- Bottom 10 pages (low traffic)
- Pages with high bounce rate
- Pages with slow load times
- Conversion funnels

### 4.5 Broken Links Component

**Link health:**

- List of broken internal links
- Source page → Broken link
- Suggested fixes
- Auto-fix options (redirects)

---

## 📋 Phase 5: Intelligent Insights

### 5.1 Outdated Content Detection

**Flag pages as outdated if:**

- No updates in 90+ days
- Low view count (< 10 views/30d)
- High bounce rate (> 70%)
- Slow load time (> 3s)

**Action items:**

- List of pages needing review
- Suggested improvements
- Archive vs Update decision

### 5.2 Navigation Optimization

**Analyze user flows:**

- Identify orphaned pages (no incoming links)
- Suggest cross-linking opportunities
- Recommend navigation menu updates
- Highlight high-exit pages

### 5.3 Content Gap Analysis

**Identify missing pages:**

- Compare sitemap to competitor sites
- Check for common military finance topics
- Suggest new calculator ideas
- Recommend new toolkit pages

### 5.4 Performance Recommendations

**Automated suggestions:**

- Pages needing code splitting
- Images needing optimization
- Slow API calls to cache
- Bundle size reductions

---

## 📋 Phase 6: Automation & Monitoring

### 6.1 Scheduled Health Checks

**Cron jobs:**

- Daily: Availability checks (all pages)
- Weekly: Performance audits (Lighthouse)
- Monthly: Broken link detection
- Real-time: Error log monitoring

### 6.2 Alert System

**Notify admins when:**

- Page returns 404 or 500
- Response time > 5 seconds
- Error count spikes (10+ in 1 hour)
- Page views drop 50%+ week-over-week

### 6.3 Auto-Healing

**Automatic fixes:**

- Broken link redirects (suggest & apply)
- Cached responses for slow pages
- Image optimization triggers
- Dead code elimination

---

## 🎨 UI/UX Design

### Sitemap Tab Layout

```
┌─────────────────────────────────────────────────────┐
│  SITEMAP - Garrison Ledger Platform                │
│  ┌──────┬──────┬──────────┬──────────┬───────────┐ │
│  │ Over │Pages │  Health  │Analytics │   Links   │ │
│  │ view │      │  Checks  │          │           │ │
│  └──────┴──────┴──────────┴──────────┴───────────┘ │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📊 Platform Overview                               │
│  ┌─────────────────────────────────────────────┐  │
│  │ 30 Total Pages | 🟢 28 Healthy | 🟡 2 Warning │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  🏠 Home & Core (2)                                 │
│    🟢 / - Home                                      │
│    🟢 /dashboard - Dashboard                        │
│                                                     │
│  🛠️ Premium Tools (5)                              │
│    🟢 /dashboard/paycheck-audit - LES Auditor       │
│    🟡 /dashboard/pcs-copilot - PCS Copilot (slow)   │
│    🟢 /dashboard/navigator - Base Navigator         │
│    ...                                              │
│                                                     │
│  [Expand all categories...]                         │
└─────────────────────────────────────────────────────┘
```

### Health Status Colors

- 🟢 **Healthy**: Response < 2s, no errors, updated < 90d
- 🟡 **Warning**: Response 2-5s, minor issues, updated 90-180d
- 🔴 **Error**: Response > 5s, 404/500, or updated > 180d
- ⚫ **Unknown**: Not yet checked

---

## 📊 API Endpoints

### Sitemap Management

- `GET /api/admin/sitemap` - Get all pages
- `GET /api/admin/sitemap/[id]` - Get page details
- `PUT /api/admin/sitemap/[id]` - Update page metadata
- `POST /api/admin/sitemap/check-all` - Run full health check

### Health Checks

- `POST /api/admin/sitemap/check-health` - Check specific page
- `GET /api/admin/sitemap/health-history` - Get check history
- `GET /api/admin/sitemap/broken-links` - Get broken links

### Analytics

- `GET /api/admin/sitemap/analytics` - Page analytics summary
- `GET /api/admin/sitemap/user-flows` - Navigation paths
- `GET /api/admin/sitemap/insights` - AI-generated insights

---

## 🎯 Success Metrics

**Upon completion:**

- ✅ All 30+ pages tracked in database
- ✅ Health status for every page
- ✅ Analytics integration working
- ✅ Automated daily health checks
- ✅ Visual sitemap in admin dashboard
- ✅ Outdated content flagged
- ✅ Broken link detection working
- ✅ Performance recommendations generated

**Business Impact:**

- 100% visibility into platform health
- Proactive error detection (before users report)
- Data-driven content strategy
- Optimized navigation based on user flows
- Faster time to identify and fix issues

---

## 📚 Documentation

**Create:**

- `docs/admin/SITEMAP_SYSTEM.md` - Complete sitemap guide
- `docs/admin/HEALTH_CHECKS.md` - Health check documentation
- Update `SYSTEM_STATUS.md` with sitemap feature

---

## 🚀 Implementation Order

1. **Week 1**: Database schema + seed script
2. **Week 2**: Health check system + API endpoints
3. **Week 3**: Admin UI components (Sitemap tab)
4. **Week 4**: Analytics integration + insights
5. **Week 5**: Automation + alerts + polish

**Total Effort:** ~3-4 weeks for complete implementation

---

## 💡 Future Enhancements

- **A/B Testing Tracker**: Which pages are being tested
- **Canary Deployments**: Gradual page rollouts
- **Version History**: Track page changes over time
- **Content Calendar**: Schedule page updates
- **SEO Optimizer**: Automated SEO recommendations
- **Mobile vs Desktop**: Split health checks by device
- **Geographic Performance**: Page speed by region

---

## 🎖️ Summary

This sitemap system transforms the admin dashboard into a **mission control center** for the entire platform. You'll have:

✅ **Complete Visibility** - Every page tracked and monitored

✅ **Health Intelligence** - Proactive error detection

✅ **Analytics Integration** - Data-driven decisions

✅ **Automation** - Daily checks, alerts, auto-healing

✅ **Insights** - Outdated content, navigation optimization

✅ **Professional** - Enterprise-grade site management

**Ready to build?** This is a comprehensive, production-grade sitemap and health monitoring system worthy of Garrison Ledger's standards.

### To-dos

- [ ] Create database migration for site_pages and page_health_checks tables with RLS policies
- [ ] Build seed script to populate all 30+ pages with metadata (categories, tiers, descriptions)
- [ ] Create page metadata extraction script (scan app/ directory for titles, descriptions)
- [ ] Build health check system: availability, performance, SEO, broken links
- [ ] Create API endpoints: sitemap CRUD, health checks, analytics, user flows
- [ ] Build SitemapTab component with 5 sub-tabs (Overview, Pages, Health, Analytics, Links)
- [ ] Create visual sitemap tree with hierarchical structure and health status colors
- [ ] Build pages table with filters (category, tier, health, views) and search
- [ ] Integrate analytics: query analytics_events for page views, bounce rate, time on page
- [ ] Build intelligent insights: outdated content detection, navigation optimization, performance recommendations
- [ ] Create automation: scheduled health checks (daily/weekly/monthly), alert system, auto-healing
- [ ] Write comprehensive documentation: SITEMAP_SYSTEM.md, HEALTH_CHECKS.md, update SYSTEM_STATUS.md
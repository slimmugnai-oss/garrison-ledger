# 🗺️ SITEMAP & SITE HEALTH AUDIT SYSTEM

## 📋 Executive Summary

The **Sitemap System** provides complete visibility into all 30 platform pages, tracking their health, performance, and analytics. Built to ensure the Garrison Ledger platform remains fast, functional, and optimized for military families.

**Status:** ✅ **COMPLETE - Phase 1 Deployed**  
**Date:** October 22, 2025

---

## 🎯 Purpose

**Problem:** No centralized view of all platform pages, their health status, or performance metrics.

**Solution:** A comprehensive sitemap system integrated into the admin dashboard that:
- ✅ **Tracks all 30 pages** across 9 categories
- ✅ **Monitors health status** (🟢 Healthy, 🟡 Warning, 🔴 Error)
- ✅ **Checks availability** with automated health checks
- ✅ **Analyzes performance** (response times, load speeds)
- ✅ **Integrates analytics** (page views, bounce rates)
- ✅ **Identifies issues** proactively before users report them

---

## 📊 Platform Sitemap (30 Pages)

### Home & Core (2 pages)
1. `/` - Home page (Public)
2. `/dashboard` - Main dashboard (Free tier)

### Dashboard Pages (2 pages)
3. `/dashboard/binder` - Document Binder (Premium)
4. `/dashboard/settings` - Settings (Free tier)

### Profile (1 page)
5. `/dashboard/profile/setup` - Profile Setup (Free tier)

### Premium Tools (4 pages)
6. `/dashboard/paycheck-audit` - LES Auditor (Premium)
7. `/dashboard/pcs-copilot` - PCS Copilot (Premium)
8. `/dashboard/navigator` - Base Navigator (Premium)
9. `/dashboard/ask` - Ask Military Expert (Premium)

### Calculators (6 pages)
11. `/dashboard/tools/tsp-modeler` - TSP Calculator (Free)
12. `/dashboard/tools/sdp-strategist` - SDP Strategist (Free)
13. `/dashboard/tools/house-hacking` - House Hacking Calculator (Free)
14. `/dashboard/tools/pcs-planner` - PCS Planner (Free)
15. `/dashboard/tools/on-base-savings` - On-Base Savings Calculator (Free)
16. `/dashboard/tools/salary-calculator` - Military Salary Calculator (Free)

### Resources (3 pages)
17. `/dashboard/listening-post` - Listening Post (Free)
18. `/dashboard/directory` - Base Directory (Free)
19. `/dashboard/referrals` - Referral Program (Free)

### Toolkits (4 pages)
20. `/pcs-hub` - PCS Hub (Public)
21. `/career-hub` - Career Hub (Public)
22. `/deployment` - Deployment Toolkit (Public)
23. `/on-base-shopping` - On-Base Shopping Guide (Public)

### Upgrade & Contact (3 pages)
24. `/dashboard/upgrade` - Upgrade to Premium (Free)
25. `/contact` - Contact Us (Public)
26. `/dashboard/support` - Support (Free)

### Legal (4 pages)
27. `/disclosures` - Disclosures (Public)
28. `/privacy` - Privacy Policy (Public)
29. `/privacy/cookies` - Cookie Policy (Public)
30. `/privacy/do-not-sell` - Do Not Sell My Information (Public)

### Admin (2 pages)
31. `/dashboard/admin` - Admin Dashboard (Admin only)
32. `/dashboard/admin/briefing` - Admin Briefing (Admin only)

**Total: 31 pages** (30 user-facing + 1 admin briefing)

---

## 🗄️ Database Schema

### Table: `site_pages`

**Purpose:** Central registry of all platform pages

**Columns:**
- `id` (UUID, PK) - Unique identifier
- `path` (TEXT, UNIQUE) - URL path (e.g., `/dashboard`)
- `title` (TEXT) - Page title
- `category` (TEXT) - Category grouping
- `tier_required` (TEXT) - Access level: `free`, `premium`, `admin`, or NULL for public
- `description` (TEXT) - Page description
- `status` (TEXT) - `active`, `deprecated`, or `beta`
- `health_status` (TEXT) - `healthy`, `warning`, `error`, `unknown`
- `response_time_ms` (INTEGER) - Last measured response time
- `error_count_7d` (INTEGER) - Errors in last 7 days
- `view_count_7d` (INTEGER) - Page views (7 days)
- `view_count_30d` (INTEGER) - Page views (30 days)
- `avg_time_on_page_seconds` (INTEGER) - Average session duration
- `bounce_rate` (DECIMAL) - Percentage of single-page sessions
- `conversion_rate` (DECIMAL) - Conversion to premium
- `dependencies` (JSONB) - APIs, data sources, external services
- `meta_tags` (JSONB) - SEO metadata
- `last_updated` (TIMESTAMP) - Last content update
- `last_audit` (TIMESTAMP) - Last health check
- `created_at`, `updated_at` (TIMESTAMP) - Record timestamps

**Indexes:**
- `idx_site_pages_category` on `category`
- `idx_site_pages_status` on `status`
- `idx_site_pages_tier` on `tier_required`
- `idx_site_pages_health` on `health_status`

**RLS Policies:**
- Public read access (for health checks)
- Admin-only write access

---

### Table: `page_health_checks`

**Purpose:** Historical log of all health checks

**Columns:**
- `id` (UUID, PK) - Unique identifier
- `page_id` (UUID, FK) - References `site_pages(id)`
- `check_type` (TEXT) - `availability`, `performance`, `seo`, `links`
- `status` (TEXT) - `pass`, `fail`, `warning`
- `response_time_ms` (INTEGER) - Measured response time
- `error_message` (TEXT) - Error details if failed
- `details` (JSONB) - Full check results
- `checked_at` (TIMESTAMP) - When check was performed

**Indexes:**
- `idx_health_checks_page` on `page_id`
- `idx_health_checks_status` on `status`

---

## 🔌 API Endpoints

### Sitemap Management

#### `GET /api/admin/sitemap`
**Purpose:** Get all pages with health status

**Response:**
```json
{
  "pages": [...],
  "categorized": {
    "Home & Core": [...],
    "Premium Tools": [...]
  },
  "stats": {
    "total": 32,
    "healthy": 28,
    "warning": 2,
    "error": 1,
    "unknown": 1,
    "avgResponseTime": 450
  }
}
```

---

### Health Checks

#### `POST /api/admin/sitemap/check-health`
**Purpose:** Run health check on specific page or all pages

**Request Body:**
```json
{
  "pageId": "uuid",  // Check specific page
  // OR
  "checkAll": true   // Check all pages
}
```

**Response:**
```json
{
  "path": "/dashboard",
  "status": "pass",
  "healthStatus": "healthy",
  "responseTime": 450,
  "errorMessage": null
}
```

**What it checks:**
- **Availability:** HTTP status code (200 = pass)
- **Performance:** Response time (< 2s = healthy, 2-5s = warning, > 5s = error)
- **Logging:** Records check in `page_health_checks` table
- **Updates:** Updates `health_status` and `response_time_ms` in `site_pages`

---

### Analytics

#### `GET /api/admin/sitemap/analytics`
**Purpose:** Get page performance analytics

**Response:**
```json
{
  "topPages": [...],          // Top 10 by views
  "bottomPages": [...],       // Bottom 10 (low traffic)
  "slowPages": [...],         // Slow load times
  "highBouncePages": [...],   // High bounce rate
  "outdatedPages": [...],     // No updates in 90+ days
  "needsAttention": [...],    // Multiple criteria
  "categoryStats": {...},     // Stats by category
  "summary": {
    "totalPages": 32,
    "totalViews30d": 15420,
    "avgResponseTime": 450,
    "outdatedCount": 3,
    "needsAttentionCount": 5
  }
}
```

---

## 🎨 Admin Dashboard Integration

### Access

**URL:** `https://app.familymedia.com/dashboard/admin?tab=sitemap`

**Keyboard Shortcut:** Press `6` to jump to Sitemap tab

---

### Tab Structure

#### Tab 6: **Sitemap** 🗺️

**Sub-tabs:**

1. **📊 Overview** - Visual sitemap with health status
   - Total pages, healthy/warning/error counts
   - Expandable category tree
   - Color-coded health indicators
   - Quick stats per category

2. **📄 Pages** - Detailed table of all pages
   - Sortable/filterable table
   - Path, title, category, tier, health status
   - Response time, view counts
   - Search and filter capabilities

3. **🏥 Health Checks** - Health monitoring system
   - Health status breakdown
   - "Run Health Check" button (checks all pages)
   - Error and warning pages list
   - Last check timestamp

4. **📈 Analytics** - Page performance metrics
   - Top 10 pages by views
   - Low traffic pages
   - High bounce rate pages
   - Slow loading pages
   - Outdated content detection

5. **🔗 Broken Links** - Link health (placeholder for Phase 2)
   - Future: Broken link scanner
   - Future: Auto-fix suggestions

---

## 💡 Health Status Logic

### 🟢 Healthy
**Criteria:**
- Response time < 2 seconds
- HTTP 200 status
- No errors in last 7 days
- Content updated within 90 days

### 🟡 Warning
**Criteria:**
- Response time 2-5 seconds
- OR content not updated 90-180 days
- OR high bounce rate (> 70%)

### 🔴 Error
**Criteria:**
- Response time > 5 seconds
- OR HTTP 404/500 status
- OR errors in last 7 days
- OR content not updated > 180 days

### ⚫ Unknown
**Status:**
- Page not yet checked

---

## 🚀 How to Use

### Run Health Check

1. Go to Admin Dashboard → Sitemap tab (Press `6`)
2. Click "Health Checks" sub-tab
3. Click "Run Health Check" button
4. Wait for all 30 pages to be checked (~30-60 seconds)
5. Review results (healthy/warning/error breakdown)

### View Page Details

1. Go to "Pages" sub-tab
2. Sort by any column (health, views, response time)
3. Filter by category, tier, or health status
4. Click page to see full details

### Identify Issues

1. Go to "Overview" sub-tab
2. Look for 🟡 or 🔴 indicators
3. Expand categories with issues
4. Click "Health Checks" for detailed errors

### Monitor Performance

1. Go to "Analytics" sub-tab
2. Review top pages by views
3. Check bottom pages (low traffic)
4. Identify slow pages (> 2s response)
5. Flag outdated content (90+ days old)

---

## 📈 Analytics Integration

### Page View Tracking

**Data Source:** `analytics_events` table

**Metrics Calculated:**
- 7-day view count
- 30-day view count
- Average time on page
- Bounce rate (single-page sessions)

**Update Frequency:** Real-time via analytics events

---

### Conversion Tracking

**Key Funnels:**
- Profile setup → Premium upgrade
- Calculator usage → Premium upgrade
- Tool trial → Subscription

**Stored in:** `conversion_rate` column per page

---

## 🔧 Maintenance

### Daily Tasks
- Health checks run automatically (future: cron job)
- Error counts updated from `error_logs` table
- View counts updated from `analytics_events`

### Weekly Tasks
- Review pages with warning status
- Investigate slow pages (> 2s)
- Check low traffic pages (< 10 views/week)

### Monthly Tasks
- Audit outdated content (90+ days old)
- Review navigation optimization suggestions
- Plan content updates based on analytics

---

## 🎯 Success Metrics

### Platform Health
- **Target:** 90%+ pages healthy status
- **Current:** Check admin dashboard for real-time stats

### Performance
- **Target:** Avg response time < 1 second
- **Current:** Check "Health Checks" sub-tab

### Content Freshness
- **Target:** < 5 pages outdated (90+ days)
- **Current:** Check "Analytics" sub-tab

---

## 🔮 Future Phases

### Phase 2: Advanced Health Checks (Not Yet Implemented)
- SEO health checks (meta tags, Open Graph)
- Broken link detection
- Lighthouse score integration
- Mobile vs desktop performance split

### Phase 3: Automation (Not Yet Implemented)
- Scheduled cron jobs (daily checks)
- Alert system (email/Slack notifications)
- Auto-healing (broken link redirects)

### Phase 4: Advanced Analytics (Not Yet Implemented)
- User flow analysis (entry → exit pages)
- Content gap identification
- Navigation optimization suggestions
- A/B testing tracking

---

## 📚 Technical Details

### Dependencies

**Page Tracking:**
- `site_pages` table - 32 rows
- Categories: 9 (Home & Core, Dashboard, Profile, Premium Tools, Calculators, Resources, Toolkits, Upgrade & Contact, Legal, Admin)
- Tiers: Public, Free, Premium, Admin

**Health Checks:**
- Internal fetch using Next.js API routes
- HEAD requests to minimize bandwidth
- Response time tracking via `Date.now()`
- Results logged to `page_health_checks`

**Analytics:**
- Queries `analytics_events` for view counts
- Aggregates by path
- Calculates bounce rate and avg session duration

---

## 🎖️ Admin Dashboard Navigation

**Tab:** Sitemap (Tab 6)
**Shortcut:** Press `6`
**URL:** `/dashboard/admin?tab=sitemap`

**Sub-tabs:**
- Overview → Visual category tree
- Pages → Detailed table
- Health Checks → Monitoring system
- Analytics → Performance metrics
- Broken Links → Link health (future)

---

## 💼 Use Cases

### 1. Daily Health Check
**Scenario:** Ensure platform is running smoothly

**Steps:**
1. Open Sitemap tab
2. Check Overview for any 🔴 or 🟡 indicators
3. Click "Health Checks" → "Run Health Check"
4. Review results for errors

**Frequency:** Daily (or automated via cron)

---

### 2. Identify Outdated Content
**Scenario:** Find pages needing updates

**Steps:**
1. Go to Analytics sub-tab
2. Review "Outdated Pages" section
3. Click pages last updated > 90 days ago
4. Plan content refresh

**Frequency:** Monthly

---

### 3. Performance Optimization
**Scenario:** Find slow pages

**Steps:**
1. Go to Analytics sub-tab
2. Review "Slow Pages" section (> 2s response)
3. Investigate causes (API calls, large images, etc.)
4. Implement fixes (caching, code splitting, image optimization)

**Frequency:** Weekly

---

### 4. Traffic Analysis
**Scenario:** Understand page popularity

**Steps:**
1. Go to Analytics sub-tab
2. Review "Top Pages" and "Bottom Pages"
3. Identify low-traffic premium tools
4. Plan marketing or feature improvements

**Frequency:** Weekly

---

## 🚀 Deployment

### Database Migration
✅ **COMPLETE:** `20251022_sitemap_tables.sql` applied

**Created:**
- `site_pages` table with 32 rows
- `page_health_checks` table (empty, populated on first check)
- 6 indexes for performance
- RLS policies for security

### Seed Data
✅ **COMPLETE:** All 30 pages seeded via SQL

**Categories:**
- Home & Core: 2 pages
- Dashboard: 2 pages
- Profile: 1 page
- Premium Tools: 4 pages
- Calculators: 6 pages
- Resources: 3 pages
- Toolkits: 4 pages
- Upgrade & Contact: 3 pages
- Legal: 4 pages
- Admin: 2 pages

---

## 📊 Monitoring Dashboard

### Real-Time Stats (Overview Sub-Tab)

**Displayed Metrics:**
- Total pages
- Healthy pages (🟢)
- Warnings (🟡)
- Errors (🔴)
- Unknown status (⚫)
- Average response time

**Category Breakdown:**
- Each category shows health distribution
- Expandable to see individual pages
- Click to view page details

---

### Health Check Results

**What Gets Checked:**
- ✅ **Availability:** Page returns HTTP 200
- ✅ **Response Time:** < 2s (healthy), 2-5s (warning), > 5s (error)
- ✅ **Error Detection:** Check for 404, 500, timeouts
- ⏳ **SEO Checks:** (Phase 2) Meta tags, Open Graph
- ⏳ **Broken Links:** (Phase 2) Internal link validation

**Check Frequency:**
- Manual: Click "Run Health Check" button
- Automated: (Phase 3) Daily cron job

---

## 🎖️ Best Practices

### 1. Regular Health Checks
**Recommendation:** Run full health check daily or after deployments

**Why:** Catch issues before users report them

### 2. Monitor Slow Pages
**Recommendation:** Investigate any page with > 2s response time

**Common Fixes:**
- Add caching for API calls
- Optimize images
- Implement code splitting
- Use ISR (Incremental Static Regeneration)

### 3. Keep Content Fresh
**Recommendation:** Update pages every 60-90 days

**Why:**
- SEO benefits (search engines favor fresh content)
- User trust (outdated info damages credibility)
- Accuracy (military pay/benefits change annually)

### 4. Analyze Traffic Patterns
**Recommendation:** Review top/bottom pages monthly

**Action Items:**
- Promote low-traffic valuable tools
- Improve navigation to hidden gems
- Archive truly unused pages

---

## 🎯 Success Criteria

✅ **Complete Visibility** - All 30 pages tracked  
✅ **Health Monitoring** - Automated checks working  
✅ **Performance Tracking** - Response times recorded  
✅ **Analytics Integration** - View counts updating  
✅ **Admin UI** - Sitemap tab functional  
✅ **Documentation** - Complete guide available

**Status:** Phase 1 Complete 🎖️

---

## 📞 Support

**For Issues:**
- Check error logs: Admin Dashboard → Ops Status → Error Logs
- Review health checks: Admin Dashboard → Sitemap → Health Checks
- Contact dev team with page ID and error details

**For Questions:**
- See `docs/admin/ADMIN_DASHBOARD_COMPLETE.md`
- Review this guide (SITEMAP_SYSTEM.md)

---

**Document Version:** 1.0.0  
**Last Updated:** October 22, 2025  
**Status:** ✅ COMPLETE (Phase 1)  
**Author:** Garrison Ledger Development Team


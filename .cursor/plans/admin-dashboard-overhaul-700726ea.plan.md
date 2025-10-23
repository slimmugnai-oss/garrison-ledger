<!-- 700726ea-b07c-40ad-8677-1f9b5dfe7b81 1eb2f803-e4b6-4c61-999a-51020fba1099 -->
# Admin Dashboard Audit & Critical Fixes

## Overview

Complete audit and fixes for admin dashboard to ensure all features work correctly, remove legacy features, add missing functionality, and clarify Listening Post vs Intelligence Briefing systems.

---

## 1. Users Tab - Add Email & Names

**Issue:** Users table only shows user_id, rank, branch - missing email and names

**Fix:**

- Modify `app/api/admin/users/search/route.ts` to join with Clerk user data or fetch emails
- Update `app/dashboard/admin/tabs/UsersTab.tsx` to add columns:
- Email address (from Clerk or user_profiles if stored)
- First name (from Clerk)
- Last name (from Clerk)
- Update CSV export to include email and names

**Files to modify:**

- `app/api/admin/users/search/route.ts`
- `app/dashboard/admin/tabs/UsersTab.tsx`

---

## 2. Feature Flags - Remove Legacy Features

**Issue:** Feature flags showing removed/legacy features:

- AI Plan Generation (legacy, phased out with assessments)
- Natural Search (removed Jan 2025)
- Spouse Collaboration (not fully functional)

**Fix:**

### 2.1 Database Cleanup

- Create migration to DELETE these 3 flags from `feature_flags` table
- Keep only active features: LES Auditor, PCS Copilot, Base Navigator, TDY Copilot, Document Binder, Streak Gamification, Email Campaigns

### 2.2 Code Cleanup

- Remove any code references to these features
- Clean up spouse collaboration page `/dashboard/collaborate/page.tsx` (archive or delete)
- Verify no broken links to removed features

**Files affected:**

- `supabase-migrations/20251023_remove_legacy_flags.sql` (new)
- `app/dashboard/collaborate/page.tsx` (delete or archive)
- Search codebase for references

---

## 3. Revenue Tab - Fix $0 Display

**Issue:** Revenue showing when no sales have been made

**Investigation:**

- Check `app/api/admin/analytics/revenue/route.ts` line 85-92
- Verify query against `entitlements` table with `tier='premium'` and `status='active'`
- Ensure $0 MRR is displayed when premiumUsers = 0 (not placeholder data)

**Fix:**

- Add validation to ensure only REAL data is shown
- If premiumUsers = 0, display "$0.00 MRR" clearly
- Add disclaimer if in testing/dev mode

**Files to modify:**

- `app/api/admin/analytics/revenue/route.ts` (verify logic)
- `app/dashboard/admin/tabs/AnalyticsTab.tsx` (add dev disclaimer if needed)

---

## 4. Remove "Charts Coming in Phase 4" Placeholders

**Issue:** AnalyticsTab.tsx lines 233 and 310 show "Charts coming in Phase 4" messages

**Fix:**

- DELETE these placeholder messages (all 6 phases are complete!)
- Revenue and Users sub-tabs are fully functional with charts
- Remove the blue info boxes at lines 231-236 and 308-313

**Files to modify:**

- `app/dashboard/admin/tabs/AnalyticsTab.tsx`

---

## 5. Content Blocks API - Display 410 Content Blocks

**Issue:** Content tab shows empty table with TODO comment at line 71-74

**Fix:**

### 5.1 Create API Endpoint

- New file: `app/api/admin/content-blocks/route.ts`
- Query `content_blocks` table from Supabase
- Support filters: status (active/deprecated), domain (finance/pcs/deployment/etc)
- Return: id, title, domain, status, content_rating, last_reviewed_at, view_count, created_at

### 5.2 Update Content Tab UI

- Remove TODO comment
- Fetch from new API endpoint
- Display all 410 blocks in DataTable
- Add filters for domain and status
- Show content rating, last review date

**Files to create:**

- `app/api/admin/content-blocks/route.ts`

**Files to modify:**

- `app/dashboard/admin/tabs/ContentTab.tsx`

---

## 6. Support Tickets - Add Prominent Link

**Issue:** Support tickets exist at `/dashboard/admin/support` but not discoverable in admin dashboard

**Fix:**

- Add "View Support Tickets" button in Overview tab Alerts section
- Add link in header or navigation area of admin dashboard
- Option: Add MetricCard in Overview showing "New Tickets" count with click-through

**Files to modify:**

- `app/dashboard/admin/tabs/OverviewTab.tsx` (add support link/button)
- Consider adding to `app/dashboard/admin/page.tsx` header area

---

## 7. Listening Post vs Intelligence Briefing - Clarify Systems

**Current Confusion:**

- Listening Post: User-facing page at `/dashboard/listening-post` (RSS feed reader)
- Intelligence Briefing Pipeline: Admin tool at `/dashboard/admin/briefing` (content curation)
- Content tab has "Listening Post" sub-tab that's confusing

**Fix:**

### 7.1 Rename Admin Sub-Tab

- Change Content tab sub-tab from "📡 Listening Post" to "📰 Feed Items" or "📰 RSS Articles"
- This sub-tab should show aggregated RSS articles from the Listening Post feed

### 7.2 Clarify Intelligence Briefing

- Keep `/dashboard/admin/briefing` as separate dedicated page (already exists)
- This curates new **content blocks** (410 hand-curated expert blocks)
- Different from Listening Post which aggregates external RSS feeds

### 7.3 Add Listening Post Refresh

- Listening Post currently fetches RSS feeds on page load
- Add admin capability to manually refresh/fetch new stories
- Option: Cron job to auto-fetch daily (requires Vercel Cron or similar)

**Investigation needed:**

- How does Listening Post currently fetch stories? (Check `/dashboard/listening-post/page.tsx`)
- Is there a `feed_items` table or is it real-time fetch?
- Create API endpoint to trigger refresh if needed

**Files to check:**

- `app/dashboard/listening-post/page.tsx`
- `app/dashboard/admin/tabs/ContentTab.tsx` (rename sub-tab)
- `app/dashboard/admin/briefing/page.tsx` (verify separate system)

---

## 8. Page Visit Analytics - Verification

**Question:** Is page visit analytics working?

**Audit:**

- Check if `analytics_events` table is being populated
- Verify `app/api/admin/sitemap/sync-analytics/route.ts` works
- Test: Visit some pages, then check if sitemap analytics updates
- Check if Google Analytics is sending events to our database

**Files to audit:**

- `app/api/admin/sitemap/sync-analytics/route.ts`
- `app/api/admin/sitemap/analytics/route.ts`
- Verify analytics_events table has recent data

---

## 9. Comprehensive System Audit

### 9.1 All 6 Admin Tabs Functional?

- ✅ Overview
- ✅ Analytics (Revenue, Users, Engagement, Tools)
- ✅ Users
- ✅ Content (verify after content blocks API added)
- ✅ System
- ✅ Sitemap

### 9.2 All API Endpoints Working?

- Test each admin API route
- Verify authentication (admin user ID check)
- Check error handling

### 9.3 Database Tables Healthy?

- `site_pages` - 32 pages with metadata
- `page_health_checks` - health check history
- `feature_flags` - cleaned up legacy flags
- `content_blocks` - 410 blocks accessible
- `analytics_events` - tracking page views

### 9.4 Pre-Build Automation Working?

- Verify metadata extraction runs on deploy
- Check Vercel build logs for "Updated: 32/32"

### 9.5 Mobile Responsiveness?

- Test all tabs on mobile viewport
- Verify tables are scrollable
- Check all buttons are tap-friendly

---

## Success Criteria

After completion:

✅ Users tab shows email addresses and names
✅ Legacy feature flags removed (AI Plan Generation, Natural Search, Spouse Collaboration)
✅ Revenue displays accurate $0 when no sales exist
✅ No "Charts coming in Phase 4" placeholders
✅ Content Blocks API working, displaying 410 blocks
✅ Support tickets link prominent in admin dashboard
✅ Listening Post vs Intelligence Briefing clearly separated
✅ Page analytics verified working
✅ All 6 tabs fully functional
✅ All 22+ API endpoints tested and working
✅ Mobile responsive
✅ Zero TypeScript errors
✅ Documentation updated

---

## Implementation Order

1. **Quick Wins** (30 min)

- Remove "Charts coming" placeholders
- Add support tickets link

2. **Database Cleanup** (30 min)

- Remove 3 legacy feature flags
- Verify revenue data accuracy

3. **Content Blocks API** (1 hour)

- Create API endpoint
- Update Content tab UI

4. **Users Enhancement** (1 hour)

- Add email/name columns
- Update CSV export

5. **Listening Post Clarification** (1 hour)

- Rename admin sub-tab
- Investigate feed refresh mechanism
- Add manual refresh capability if needed

6. **Comprehensive Audit** (2 hours)

- Test all tabs, APIs, features
- Mobile testing
- Analytics verification

**Total Time:** ~6 hours for complete audit and fixes

### To-dos

- [ ] Add email addresses and first/last names to Users tab table and CSV export
- [ ] Create migration to remove AI Plan Generation, Natural Search, Spouse Collaboration from feature_flags table
- [ ] Archive or delete /dashboard/collaborate page and clean up code references
- [ ] Audit revenue API to ensure $0 MRR displays correctly when no premium users exist
- [ ] Delete 'Charts coming in Phase 4' placeholder messages from AnalyticsTab.tsx
- [ ] Create /api/admin/content-blocks endpoint to fetch 410 content blocks from database
- [ ] Update Content tab to display content blocks with filters for domain and status
- [ ] Add prominent Support Tickets link/button in admin dashboard Overview tab
- [ ] Rename Content tab 'Listening Post' sub-tab to 'Feed Items' or 'RSS Articles' for clarity
- [ ] Investigate how Listening Post fetches RSS feeds and add manual refresh capability
- [ ] Audit page visit analytics to ensure analytics_events table is populating correctly
- [ ] Test all 6 tabs, 22+ API endpoints, mobile responsiveness, and verify zero errors
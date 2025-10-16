# 🔧 GARRISON LEDGER - ADMIN GUIDE

**Last Updated:** 2025-01-16  
**Version:** 1.0.0  
**Status:** Complete & Operational

---

## 📋 TABLE OF CONTENTS

1. [Getting Started](#getting-started)
2. [Admin Dashboard Overview](#admin-dashboard-overview)
3. [Daily Operations](#daily-operations)
4. [System Monitoring](#system-monitoring)
5. [Content Management](#content-management)
6. [User Management](#user-management)
7. [Support & Tickets](#support--tickets)
8. [AI Monitoring & Costs](#ai-monitoring--costs)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)

---

## 🚀 GETTING STARTED

### **Admin Access Setup**

1. **Get Your Clerk User ID:**
   ```
   1. Log in to your account
   2. Go to Dashboard
   3. Check browser console: user.id
   4. Or check Clerk Dashboard → Users
   ```

2. **Add Your User ID to Admin List:**
   ```typescript
   // File: app/dashboard/admin/page.tsx
   const ADMIN_USER_IDS = [
     'your_clerk_user_id_here',  // Replace with your actual ID
     // Add more admin IDs as needed
   ];
   ```

3. **Access Admin Dashboard:**
   ```
   Navigate to: https://yoursite.com/dashboard/admin
   ```

### **Required Permissions**

Ensure you have access to:
- ✅ Vercel Dashboard (deployment & logs)
- ✅ Supabase Dashboard (database & RLS)
- ✅ Clerk Dashboard (user authentication)
- ✅ Stripe Dashboard (payments)
- ✅ OpenAI Dashboard (AI costs)

---

## 🎛️ ADMIN DASHBOARD OVERVIEW

### **Dashboard Sections**

| Section | Purpose | Priority |
|---------|---------|----------|
| **System Health** | Monitor uptime, performance, errors | 🔴 Critical |
| **Content Curation** | Manage Listening Post & content blocks | 🟡 High |
| **User Management** | View users, analytics, engagement | 🟢 Medium |
| **Support Tickets** | Handle contact submissions | 🟡 High |
| **Provider Directory** | Manage vetted providers | 🟢 Medium |
| **AI Monitoring** | Track AI usage & costs | 🟡 High |

### **Quick Stats Dashboard**

Monitor these key metrics daily:
- **Total Users:** Free + Premium breakdown
- **Plans Today:** Daily plan generation count + AI costs
- **New Tickets:** Support requests requiring attention
- **Feed Items:** Content curation queue size

---

## 📅 DAILY OPERATIONS

### **Morning Routine (5-10 minutes)**

```
☐ Check System Health dashboard (100/100 score)
☐ Review new support tickets (respond within 24 hours)
☐ Check AI costs (should be ~$0.02 per plan)
☐ Monitor Vercel deployment status
☐ Review feed items queue (Listening Post)
```

### **Weekly Tasks (30-60 minutes)**

```
☐ Curate Listening Post items (promote 5-10 articles)
☐ Review user engagement metrics
☐ Check content block quality scores
☐ Verify premium subscriptions active
☐ Review Stripe revenue dashboard
☐ Backup important data (Supabase)
```

### **Monthly Tasks (2-4 hours)**

```
☐ Review all system metrics and trends
☐ Audit content blocks for freshness
☐ Update provider directory
☐ Review AI usage and optimize prompts
☐ Check for dependency updates
☐ Review and close old support tickets
☐ Analyze user churn and retention
☐ Update documentation as needed
```

---

## 🔍 SYSTEM MONITORING

### **Health Checks**

**Core Systems (Check Daily):**
1. **AI Master Curator** - Plan generation working?
2. **Assessment System** - Users completing assessments?
3. **Content Library** - 410 blocks, 100% metadata?
4. **Binder System** - File uploads working?
5. **Contact System** - Tickets being created?

**Performance Metrics:**
- **Core Web Vitals:** LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Bundle Size:** < 200KB first load
- **Image Optimization:** Next.js Image working
- **Database Queries:** < 100ms average response

**Security Checks:**
- **Authentication:** Clerk working, no unauthorized access
- **RLS Policies:** All tables protected
- **API Security:** Rate limiting active
- **Input Validation:** No injection vulnerabilities

### **Monitoring Tools**

| Tool | What to Monitor | Frequency |
|------|-----------------|-----------|
| **Vercel Dashboard** | Deployments, errors, logs | Daily |
| **Supabase Dashboard** | Database size, queries, RLS | Weekly |
| **Clerk Dashboard** | User signups, auth issues | Weekly |
| **Stripe Dashboard** | Revenue, subscriptions, refunds | Daily |
| **OpenAI Dashboard** | API usage, costs, rate limits | Daily |

### **Alert Thresholds**

Set up alerts for:
- ⚠️ **Error rate > 1%** (check Vercel logs)
- ⚠️ **AI cost > $10/day** (check OpenAI dashboard)
- ⚠️ **Database size > 80%** (check Supabase)
- ⚠️ **Support ticket age > 48 hours** (check admin dashboard)
- ⚠️ **Stripe failed payments** (check Stripe dashboard)

---

## 📚 CONTENT MANAGEMENT

### **Listening Post Workflow**

**Purpose:** Curate new content from RSS feeds to grow the Knowledge Graph

**Daily Process:**
1. Navigate to `/dashboard/admin/briefing`
2. Review "New" feed items (should be 5-10 per day)
3. For each relevant item:
   - Click "Auto-Curate" to enrich with AI (Gemini)
   - Review AI-generated metadata
   - Edit if needed (title, domain, difficulty, keywords)
   - Mark as "Approved" when ready
4. For approved items:
   - Click "Promote to Content Block"
   - This creates a new content block with full metadata
5. Archive or reject irrelevant items

**Quality Standards:**
- **Rating:** Aim for 3.5+ (top-rated for AI)
- **Metadata:** 100% coverage (domain, difficulty, audience, etc.)
- **SEO Keywords:** 4-5 relevant keywords
- **Freshness:** 90+ score (content < 30 days old)

### **Content Block Management**

**Audit Content Quarterly:**
```sql
-- Check content freshness
SELECT COUNT(*) as total,
       AVG(content_rating) as avg_rating,
       AVG(freshness_score) as avg_freshness
FROM content_blocks
WHERE content_rating >= 3.5;
```

**Update Old Content:**
- Content > 1 year old: Review for accuracy
- Freshness < 60: Update or archive
- Rating < 3.0: Improve or remove

**Metadata Best Practices:**
- **Domain:** finance, pcs, career, deployment, lifestyle
- **Difficulty:** beginner, intermediate, advanced
- **Audience:** enlisted, officer, spouse, transitioning
- **Tags:** 5-8 specific, relevant tags
- **Topics:** 3-5 main topics covered

---

## 👥 USER MANAGEMENT

### **User Analytics**

**Key Metrics to Track:**
- **Total Users:** Growth rate (target: +10% month-over-month)
- **Premium Conversion:** % of free users upgrading (target: 5-10%)
- **Churn Rate:** Premium cancellations (target: < 5% monthly)
- **Engagement:** Plans generated, library views, tool usage
- **Retention:** 7-day, 30-day, 90-day active users

**User Queries (Supabase SQL Editor):**

```sql
-- Total users by tier
SELECT 
  CASE 
    WHEN e.tier = 'premium' THEN 'Premium'
    ELSE 'Free'
  END as user_tier,
  COUNT(*) as count
FROM user_profiles up
LEFT JOIN entitlements e ON up.user_id = e.user_id
GROUP BY user_tier;

-- Plans generated this month
SELECT COUNT(*) as plans_this_month
FROM user_plans
WHERE created_at >= date_trunc('month', NOW());

-- Most active users (by plan generation)
SELECT up.user_id, COUNT(*) as plan_count
FROM user_plans up
WHERE up.created_at >= NOW() - INTERVAL '30 days'
GROUP BY up.user_id
ORDER BY plan_count DESC
LIMIT 10;

-- Premium users with issues
SELECT u.user_id, e.status, e.current_period_end
FROM entitlements e
JOIN user_profiles u ON u.user_id = e.user_id
WHERE e.tier = 'premium' 
AND e.status != 'active';
```

### **User Support**

**Common User Issues:**
1. **Can't generate plan:** Check profile completion
2. **Premium not working:** Verify Stripe subscription status
3. **Binder upload fails:** Check file size (< 10MB free, < 100MB premium)
4. **Assessment broken:** Check browser console errors
5. **Library limit reached:** Verify rate limiting (5/day free)

**Troubleshooting Steps:**
1. Check user's entitlement status in Supabase
2. Verify Clerk authentication working
3. Check recent error logs in Vercel
4. Test feature in incognito mode
5. Check Stripe subscription if premium issue

---

## 🎫 SUPPORT & TICKETS

### **Ticket Management Workflow**

**Ticket Priorities:**
- 🔴 **High:** Premium users, payment issues, system errors
- 🟡 **Medium:** Feature requests, general questions
- 🟢 **Low:** Suggestions, feedback

**Response Time Targets:**
- **High Priority:** < 4 hours
- **Medium Priority:** < 24 hours
- **Low Priority:** < 48 hours

**Ticket SQL Queries:**

```sql
-- New tickets requiring attention
SELECT ticket_id, name, email, subject, urgency, created_at
FROM contact_submissions
WHERE status = 'new'
ORDER BY created_at DESC;

-- Tickets by urgency
SELECT urgency, COUNT(*) as count
FROM contact_submissions
WHERE status != 'closed'
GROUP BY urgency;

-- Resolved tickets (last 30 days)
SELECT COUNT(*) as resolved,
       AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_hours
FROM contact_submissions
WHERE status = 'resolved'
AND created_at >= NOW() - INTERVAL '30 days';
```

**Ticket Response Templates:**

Save these in a document for quick responses:

```markdown
## Welcome Email
Thank you for contacting Garrison Ledger! Your ticket ID is {TICKET_ID}.
We typically respond within {TIMEFRAME}. A member of our team will review 
your inquiry and get back to you shortly.

## Plan Generation Issue
I see you're having trouble generating your personalized plan. Let me help:
1. Ensure your profile is at least 70% complete
2. Complete the assessment (takes ~5 minutes)
3. Wait ~30 seconds after assessment for plan generation
If you still have issues, please reply with any error messages you see.

## Premium Subscription Issue
Thank you for being a premium member! I'll check your subscription status.
Can you confirm: 1) Email used for payment, 2) Last 4 digits of card?
I'll investigate and resolve this within 24 hours.

## Resolution Email
Your ticket {TICKET_ID} has been resolved. If you have any other questions
or if the issue persists, please don't hesitate to reach out!
```

---

## 🤖 AI MONITORING & COSTS

### **AI Usage Tracking**

**Current AI Costs:**
- **Plan Generation:** ~$0.02 per plan (GPT-4o-mini)
- **AI Explainer:** ~$0.01 per explanation (GPT-4o-mini)
- **Content Curation:** ~$0.001 per item (Gemini 2.0 Flash)

**Daily Budget Expectations:**
- **10 plans/day:** $0.20
- **20 plans/day:** $0.40
- **50 plans/day:** $1.00
- **100 plans/day:** $2.00

**Monthly Budget:**
- **Target:** < $50/month for AI costs
- **Alert:** > $100/month indicates issue

### **Cost Optimization**

**GPT-4o-mini Best Practices:**
1. **Keep context focused:** Use only top-rated blocks (187)
2. **Limit tokens:** Max 200 blocks analyzed per plan
3. **Optimize prompts:** Remove unnecessary instructions
4. **Cache results:** Store plans, don't regenerate unnecessarily

**Monitoring Queries:**

```sql
-- Plans generated today
SELECT COUNT(*) as plans_today,
       COUNT(*) * 0.02 as estimated_cost_usd
FROM user_plans
WHERE created_at >= CURRENT_DATE;

-- Plans per user (check for abuse)
SELECT user_id, COUNT(*) as plan_count
FROM user_plans
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY user_id
HAVING COUNT(*) > 10
ORDER BY plan_count DESC;

-- Daily plan generation trend
SELECT DATE(created_at) as date,
       COUNT(*) as plans,
       COUNT(*) * 0.02 as cost_usd
FROM user_plans
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### **Rate Limiting**

**Current Limits:**
- **Assessment:** 1/week (free), 3/day (premium)
- **Library:** 5/day (free), unlimited (premium)
- **AI Explainer:** Preview (free), full (premium)

**Check Rate Limits:**

```sql
-- API quota usage (last 24 hours)
SELECT route, user_id, SUM(count) as total_requests
FROM api_quota
WHERE day = CURRENT_DATE
GROUP BY route, user_id
HAVING SUM(count) > 50
ORDER BY total_requests DESC;
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### **Core Web Vitals**

**Target Metrics:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

**Monitor Performance:**
1. Use Chrome DevTools Lighthouse
2. Check Vercel Analytics
3. Use WebPageTest.org
4. Monitor Core Web Vitals in Search Console

**Optimization Checklist:**
- ✅ Next.js Image optimization enabled
- ✅ Bundle size < 200KB first load
- ✅ Server Components where possible
- ✅ Database queries indexed
- ✅ Images lazy-loaded
- ✅ Code splitting enabled
- ✅ Static generation for marketing pages

### **Database Optimization**

**Supabase Best Practices:**
1. **Use Indexes:** All foreign keys and frequently queried columns
2. **Enable RLS:** All user tables must have RLS policies
3. **Connection Pooling:** Use Supabase connection pooler
4. **Query Optimization:** Use `.select()` to limit columns returned
5. **Pagination:** Use `.range()` for large result sets

**Slow Query Check:**

```sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### **Caching Strategy**

**What to Cache:**
- Static pages: ISR (Incremental Static Regeneration)
- API responses: Redis or in-memory cache
- Images: Next.js Image automatic caching
- Content blocks: Static generation

**What NOT to Cache:**
- User-specific data
- Authentication tokens
- Real-time data
- Premium content checks

---

## 🔧 TROUBLESHOOTING

### **Common Issues**

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Build fails** | Vercel deployment error | Check build logs, TypeScript errors |
| **Database timeout** | Slow queries, timeouts | Check indexes, optimize queries |
| **Auth not working** | Users can't log in | Check Clerk configuration |
| **Premium not active** | Users report no access | Check Stripe webhook, entitlements |
| **AI generation fails** | Plans not generating | Check OpenAI API key, rate limits |
| **Images not loading** | Broken images | Check Supabase storage, Next.js config |

### **Emergency Procedures**

**Site Down:**
1. Check Vercel status page
2. Check recent deployments
3. Rollback to last working version
4. Check error logs in Vercel
5. Alert users via social media/email

**Database Issues:**
1. Check Supabase status page
2. Check connection limits
3. Verify RLS policies
4. Check recent migrations
5. Contact Supabase support if needed

**AI Costs Spiking:**
1. Check OpenAI dashboard for usage spike
2. Check rate limiting working
3. Look for abusive users
4. Temporarily disable plan generation if needed
5. Investigate root cause

### **Debugging Tools**

**Vercel:**
- Runtime logs: Real-time error tracking
- Build logs: Deployment issues
- Analytics: Performance metrics

**Supabase:**
- SQL Editor: Run custom queries
- Table Editor: View/edit data
- Auth Logs: Authentication issues
- Storage: File upload problems

**Browser DevTools:**
- Console: JavaScript errors
- Network: API request failures
- Performance: Load time analysis
- Lighthouse: Core Web Vitals

---

## ✅ BEST PRACTICES

### **Security**

1. **Never commit secrets:** Use environment variables
2. **Verify RLS policies:** Test with different user roles
3. **Rate limit everything:** Prevent abuse
4. **Validate all inputs:** Server-side validation
5. **Keep dependencies updated:** Run `npm audit` weekly
6. **Monitor failed auth attempts:** Check Clerk logs
7. **Backup database regularly:** Supabase daily backups

### **Performance**

1. **Use Server Components:** Default to RSC, Client only when needed
2. **Optimize images:** Always use Next.js Image
3. **Lazy load:** Dynamic imports for heavy components
4. **Monitor bundle size:** Keep under 200KB
5. **Database indexes:** Index all foreign keys
6. **Cache static content:** Use ISR where possible
7. **Minimize JavaScript:** Less client-side code = faster

### **Content**

1. **Quality over quantity:** Better to have 400 great blocks than 500 mediocre
2. **Keep metadata complete:** 100% coverage required for AI
3. **Update regularly:** Content < 6 months old is best
4. **Verify accuracy:** Military info changes frequently
5. **SEO keywords:** 4-5 per block for discoverability

### **User Experience**

1. **Response times:** Support tickets < 24 hours
2. **Clear error messages:** Help users fix issues themselves
3. **Mobile-first:** Test on mobile devices regularly
4. **Accessibility:** WCAG AA compliance
5. **Loading states:** Show progress, never leave users wondering

---

## 📞 SUPPORT CONTACTS

### **Service Providers**

| Service | Dashboard | Support | Critical Issues |
|---------|-----------|---------|-----------------|
| **Vercel** | [Dashboard](https://vercel.com/dashboard) | support@vercel.com | Twitter @vercel |
| **Supabase** | [Dashboard](https://supabase.com/dashboard) | support@supabase.com | Discord |
| **Clerk** | [Dashboard](https://dashboard.clerk.com) | support@clerk.com | Status page |
| **Stripe** | [Dashboard](https://dashboard.stripe.com) | support@stripe.com | Phone support |
| **OpenAI** | [Dashboard](https://platform.openai.com) | help@openai.com | API status |

### **Documentation Links**

- **Next.js:** https://nextjs.org/docs
- **Supabase:** https://supabase.com/docs
- **Clerk:** https://clerk.com/docs
- **Stripe:** https://stripe.com/docs
- **OpenAI:** https://platform.openai.com/docs

---

## 🎯 QUICK REFERENCE

### **Daily Checklist**
```
☐ Check system health (100/100?)
☐ Review new tickets (respond same day)
☐ Monitor AI costs (~$0.02/plan)
☐ Check deployment status (Vercel)
```

### **Weekly Checklist**
```
☐ Curate 5-10 feed items
☐ Review user metrics
☐ Check premium subscriptions
☐ Verify backups running
```

### **Monthly Checklist**
```
☐ Audit content freshness
☐ Review AI usage trends
☐ Update provider directory
☐ Close old tickets
☐ Update documentation
```

---

## 🏆 CONCLUSION

This admin guide provides everything you need to run Garrison Ledger efficiently. Focus on:

1. **Daily monitoring:** Quick checks keep things running smoothly
2. **User support:** Fast responses build trust
3. **Content quality:** Better content = better AI plans
4. **Cost management:** Monitor AI usage to stay in budget
5. **Performance:** Keep the site fast and accessible

**Remember:** The platform is production-ready with 100/100 health. Your job is to maintain that excellence through consistent monitoring and proactive management.

For questions or updates to this guide, update the documentation and SYSTEM_STATUS.md accordingly.

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-01-16  
**Next Review:** 2025-02-16


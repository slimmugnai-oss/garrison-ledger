# 🎯 ADMIN QUICK REFERENCE CARD

**Print or bookmark this page for daily use!**

---

## 🚀 DAILY ADMIN CHECKLIST (5 minutes)

```
☐ Go to /dashboard/admin
☐ Check Quick Stats:
  - Total Users (growing?)
  - Plans Today (< $2 AI cost?)
  - New Tickets (any urgent?)
  - Feed Items (< 50?)
☐ Click "Support Tickets"
  - Respond to high priority (< 4hrs)
  - Respond to medium priority (< 24hrs)
☐ Monitor AI costs (< $10/day)
```

---

## 📊 ADMIN DASHBOARD MAP

| Page | URL | Use For |
|------|-----|---------|
| **Main** | `/dashboard/admin` | Quick overview |
| **Health** | `/dashboard/admin/health` | 100/100 monitoring |
| **Users** | `/dashboard/admin/users` | Analytics |
| **Support** | `/dashboard/admin/support` | Tickets |
| **AI** | `/dashboard/admin/ai-monitoring` | Costs |
| **Content** | `/dashboard/admin/briefing` | Curation |
| **Providers** | `/dashboard/admin/providers` | Directory |

---

## 🎯 KEY METRICS TO WATCH

### **Daily:**
- ✅ New tickets: Respond same day
- ✅ AI costs: Should match plan count × $0.02
- ✅ System health: 100/100 green

### **Weekly:**
- ✅ User growth: +10% month-over-month target
- ✅ Premium conversion: 5-10% target
- ✅ Feed items: Curate 5-10 articles

### **Monthly:**
- ✅ Total AI costs: < $50
- ✅ Churn rate: < 5%
- ✅ Content freshness: Avg > 80

---

## 🚨 ALERT THRESHOLDS

| Metric | Normal | Alert | Critical |
|--------|--------|-------|----------|
| **AI Cost/Day** | < $2 | > $10 | > $50 |
| **AI Cost/Month** | < $50 | > $100 | > $200 |
| **Error Rate** | 0% | > 1% | > 5% |
| **Support Response** | < 24h | > 48h | > 72h |
| **System Health** | 100/100 | < 90/100 | < 80/100 |

---

## 🔗 EXTERNAL DASHBOARDS

| Service | URL | Use For |
|---------|-----|---------|
| **Vercel** | [vercel.com/dashboard](https://vercel.com/dashboard) | Deployments, logs, errors |
| **Supabase** | [supabase.com/dashboard](https://supabase.com/dashboard) | Database, RLS, storage |
| **Clerk** | [dashboard.clerk.com](https://dashboard.clerk.com) | Users, auth issues |
| **Stripe** | [dashboard.stripe.com](https://dashboard.stripe.com) | Revenue, subscriptions |
| **OpenAI** | [platform.openai.com](https://platform.openai.com) | AI usage, costs, limits |

---

## 💡 QUICK SQL QUERIES

### **Today's Stats:**
```sql
-- Plans generated today
SELECT COUNT(*) as plans, COUNT(*) * 0.02 as cost
FROM user_plans
WHERE created_at >= CURRENT_DATE;
```

### **User Breakdown:**
```sql
-- User tiers
SELECT 
  COALESCE(e.tier, 'free') as tier,
  COUNT(*) as count
FROM user_profiles up
LEFT JOIN entitlements e ON up.user_id = e.user_id
GROUP BY tier;
```

### **Support Tickets:**
```sql
-- New tickets
SELECT COUNT(*) as new_tickets
FROM contact_submissions
WHERE status = 'new';
```

---

## 🛠️ TROUBLESHOOTING SHORTCUTS

| Problem | Quick Fix |
|---------|-----------|
| **Build failed** | Check Vercel → Logs → TypeScript errors |
| **User can't log in** | Check Clerk → Recent activity |
| **Premium not working** | Check Stripe → Customer → Subscription |
| **AI generation fails** | Check OpenAI → Usage → Rate limits |
| **Slow queries** | Check Supabase → Database → Indexes |

---

## 📞 EMERGENCY CONTACTS

| Emergency | Action | Contact |
|-----------|--------|---------|
| **Site Down** | Rollback deployment | Vercel support |
| **Database Issue** | Check status | Supabase support |
| **Payment Issue** | Check webhook logs | Stripe support |
| **Auth Problem** | Check integration | Clerk support |
| **AI Outage** | Check API status | OpenAI status |

---

## ✅ WEEKLY ADMIN TASKS

**Every Monday Morning:**
```
☐ Review last week's metrics
☐ Check AI costs vs budget
☐ Curate 5-10 feed items
☐ Close resolved tickets
☐ Plan content updates
```

**Every Friday:**
```
☐ Review week's performance
☐ Check upcoming content needs
☐ Verify backups running
☐ Plan next week's priorities
```

---

## 🎯 SUCCESS METRICS

**Keep These Green:**
- ✅ Health Score: 100/100
- ✅ Response Time: < 24hrs
- ✅ AI Budget: < $50/mo
- ✅ Uptime: > 99.9%
- ✅ User Growth: +10% MoM

---

## 📚 FULL DOCUMENTATION

- **ADMIN_GUIDE.md** - Complete guide (6,500+ lines)
- **QUICK_START.md** - 5-minute setup
- **SYSTEM_STATUS.md** - System state
- **DEVELOPMENT_WORKFLOW.md** - Dev procedures

---

**Last Updated:** 2025-01-16  
**Admin System Version:** 2.9.0  
**Print this page for daily reference!** 🖨️


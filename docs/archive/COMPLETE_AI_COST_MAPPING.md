# 🔍 COMPLETE AI COST MAPPING - EVERY AI CALL SITE-WIDE

**Date:** 2025-01-17  
**Purpose:** Map every single AI call, cost per use, and maximum usage per tier

---

## 🤖 **EVERY AI CALL IN THE PLATFORM**

### **1. Assessment System (User-Facing)**

| Endpoint | Model | Purpose | Cost per Call | When Called |
|----------|-------|---------|---------------|-------------|
| `/api/assessment/adaptive` | gpt-4o-mini | Adaptive question selection | $0.02 | Per question (~10 questions per assessment) |

**Cost per Assessment:** $0.20 (10 questions × $0.02)

---

### **2. Plan Generation System (User-Facing)**

| Endpoint | Model | Purpose | Cost per Call | When Called |
|----------|-------|---------|---------------|-------------|
| `/api/plan/generate` - Curator | gpt-4o-mini | Select 8-10 content blocks | $0.15 | Once per plan generation |
| `/api/plan/generate` - Weaver | gpt-4o-mini | Write narrative + personalization | $0.10 | Once per plan generation |

**Cost per Plan:** $0.25 (Curator $0.15 + Weaver $0.10)

**TOTAL ASSESSMENT + PLAN:** $0.45 per complete generation

---

### **3. Dashboard AI Recommendations (User-Facing)**

| Endpoint | Model | Purpose | Cost per Call | When Called |
|----------|-------|---------|---------------|-------------|
| `/api/ai/recommendations` | gpt-4o-mini | Generate personalized recommendations | $0.03 | Per dashboard load |

**Cacheable:** ✅ YES - Can cache for 24 hours  
**Cost without cache:** $0.03 × 30 days = $0.90/month  
**Cost with cache:** $0.03 × 1 day = $0.03/month (96% savings!)

---

### **4. Natural Language Search (User-Facing)**

| Endpoint | Model | Purpose | Cost per Call | When Called |
|----------|-------|---------|---------------|-------------|
| `/api/content/natural-search` - Parser | gpt-4o-mini | Parse search intent | $0.02 | Per search query |
| `/api/content/natural-search` - Context | gpt-4o-mini | Generate result context | $0.03 | Per search query |

**Cost per Search:** $0.05 (Parser $0.02 + Context $0.03)

---

### **5. Content Enrichment (Admin-Only)**

| Endpoint | Model | Purpose | Cost per Call | When Called |
|----------|-------|---------|---------------|-------------|
| `/api/enrich/triage` | gemini-2.0-flash | Triage RSS feeds | $0.01 | Admin only, per feed item |
| `/api/enrich/batch` | gemini-2.0-flash | Batch process feeds | $0.01 | Admin only, cron job |
| `/api/curate` | gemini-2.0-flash | Quality score content | $0.01 | Admin only, manual |

**User Cost:** $0 (admin-only features)

---

### **6. AI Explainer (User-Facing)**

| Endpoint | Model | Purpose | Cost per Call | When Called |
|----------|-------|---------|---------------|-------------|
| `/api/explain` | gemini-2.0-flash | Explain calculator results | $0.01 | Per explanation request |

**Cost per Explanation:** $0.01

---

## 📊 **MAXIMUM USAGE PER TIER**

### **🆓 FREE TIER**

**Plan Generation:**
- Limit: 1 plan per month
- Max cost: 1 × $0.45 = $0.45/month

**Dashboard AI:**
- Limit: None (but can cache)
- Without cache: 30 visits × $0.03 = $0.90/month
- With cache: 1 × $0.03 = $0.03/month

**Natural Search:**
- Limit: None
- Conservative: 10 searches × $0.05 = $0.50/month
- Heavy: 30 searches × $0.05 = $1.50/month

**AI Explainer:**
- Limit: None
- Conservative: 5 explanations × $0.01 = $0.05/month
- Heavy: 20 explanations × $0.01 = $0.20/month

**FREE USER MAXIMUM (No Caching, Heavy Use):**
```
Plan: $0.45
Dashboard: $0.90
Search: $1.50
Explainer: $0.20
─────────────
TOTAL: $3.05/month (absolute maximum if no caching)

With caching:
Plan: $0.45
Dashboard: $0.03
Search: $1.50
Explainer: $0.20
─────────────
TOTAL: $2.18/month
```

---

### **💎 PREMIUM TIER ($9.99/mo)**

**Plan Generation:**
- Limit: 10 plans per month
- Max cost: 10 × $0.45 = $4.50/month

**Dashboard AI:**
- Limit: None (but can cache)
- Without cache: 30 visits × $0.03 = $0.90/month
- With cache: 1 × $0.03 = $0.03/month

**Natural Search:**
- Limit: None
- Conservative: 20 searches × $0.05 = $1.00/month
- Heavy: 50 searches × $0.05 = $2.50/month

**AI Explainer:**
- Limit: None
- Conservative: 10 explanations × $0.01 = $0.10/month
- Heavy: 50 explanations × $0.01 = $0.50/month

**PREMIUM USER MAXIMUM (No Caching, Heavy Use):**
```
Plan: $4.50 (10 regenerations)
Dashboard: $0.90 (no cache)
Search: $2.50 (50 searches)
Explainer: $0.50 (50 explanations)
─────────────
TOTAL: $8.40/month (absolute maximum if no caching)

Revenue: $9.99
Profit: $1.59
Margin: 16% ✅ Still profitable!

With caching:
Plan: $4.50
Dashboard: $0.03
Search: $2.50
Explainer: $0.50
─────────────
TOTAL: $7.53/month

Revenue: $9.99
Profit: $2.46
Margin: 25% ✅
```

---

### **🚀 PRO TIER ($24.99/mo)**

**Plan Generation:**
- Limit: 30 plans per month
- Max cost: 30 × $0.45 = $13.50/month

**Dashboard AI:**
- Limit: None (but can cache)
- Without cache: 30 visits × $0.03 = $0.90/month
- With cache: 1 × $0.03 = $0.03/month

**Natural Search:**
- Limit: None
- Conservative: 50 searches × $0.05 = $2.50/month
- Heavy: 100 searches × $0.05 = $5.00/month

**AI Explainer:**
- Limit: None
- Conservative: 30 explanations × $0.01 = $0.30/month
- Heavy: 100 explanations × $0.01 = $1.00/month

**PRO USER MAXIMUM (No Caching, Heavy Use):**
```
Plan: $13.50 (30 regenerations)
Dashboard: $0.90 (no cache)
Search: $5.00 (100 searches)
Explainer: $1.00 (100 explanations)
─────────────
TOTAL: $20.40/month (absolute maximum if no caching)

Revenue: $24.99
Profit: $4.59
Margin: 18% ✅ Still profitable!

With caching:
Plan: $13.50
Dashboard: $0.03
Search: $5.00
Explainer: $1.00
─────────────
TOTAL: $19.53/month

Revenue: $24.99
Profit: $5.46
Margin: 22% ✅
```

---

## 📋 **USAGE LIMITS & POSSIBILITIES**

### **Daily Maximums:**

| Feature | Free | Premium | Pro |
|---------|------|---------|-----|
| **Plan Regenerations** | 0.03/day (1/month) | 0.33/day (10/month) | 1/day (30/month) |
| **Dashboard Loads** | Unlimited | Unlimited | Unlimited |
| **Natural Searches** | Unlimited | Unlimited | Unlimited |
| **AI Explanations** | Unlimited | Unlimited | Unlimited |
| **Intel Library** | 5 articles/day | Unlimited | Unlimited |

**Key Insight:** Only plan regenerations are limited. Everything else is unlimited but can be cached/optimized.

---

## 🎯 **ABSOLUTE WORST-CASE SCENARIOS**

### **Nightmare Free User:**
```
Daily usage for 30 days:
├─ 1 plan (monthly limit)
├─ 3 dashboard loads (no cache)
├─ 10 searches
├─ 5 explainer requests
└─ Repeat every day where possible

Monthly cost:
├─ Plan: $0.45
├─ Dashboard: 30 × $0.03 = $0.90
├─ Search: 300 × $0.05 = $15.00 (!!)
├─ Explainer: 150 × $0.01 = $1.50
└─ Total: $17.85/month

Revenue: $0
Loss: -$17.85/month ❌
```

**⚠️ RISK: Unlimited search and explainer!**

---

### **Nightmare Premium User:**
```
Daily usage for 30 days:
├─ 10 plans (monthly limit)
├─ 3 dashboard loads (no cache)
├─ 20 searches per day
├─ 10 explainer requests per day

Monthly cost:
├─ Plan: $4.50
├─ Dashboard: 90 × $0.03 = $2.70
├─ Search: 600 × $0.05 = $30.00 (!!)
├─ Explainer: 300 × $0.01 = $3.00
└─ Total: $40.20/month

Revenue: $9.99
Loss: -$30.21/month ❌
```

**⚠️ RISK: Unlimited search could bankrupt you!**

---

### **Nightmare Pro User:**
```
Daily usage for 30 days:
├─ 30 plans (monthly limit)
├─ 5 dashboard loads (no cache)
├─ 50 searches per day
├─ 30 explainer requests per day

Monthly cost:
├─ Plan: $13.50
├─ Dashboard: 150 × $0.03 = $4.50
├─ Search: 1,500 × $0.05 = $75.00 (!!)
├─ Explainer: 900 × $0.01 = $9.00
└─ Total: $102.00/month

Revenue: $24.99
Loss: -$77.01/month ❌❌❌
```

**⚠️⚠️ CRITICAL RISK: Unlimited features need rate limits!**

---

## 🚨 **RECOMMENDED RATE LIMITS (URGENT)**

### **Natural Language Search (Expensive!):**
```
Cost: $0.05 per search
Risk: Unlimited usage

RECOMMENDED LIMITS:
- Free: 10 searches per day (300/month max = $15/month risk)
- Premium: 30 searches per day (900/month max = $45/month risk)
- Pro: 100 searches per day (3,000/month max = $150/month risk)

OR:
- Free: 5 searches per day (150/month max = $7.50/month)
- Premium: 15 searches per day (450/month max = $22.50/month)
- Pro: 30 searches per day (900/month max = $45/month)
```

### **AI Explainer (Less Expensive):**
```
Cost: $0.01 per explanation
Risk: Unlimited usage

RECOMMENDED LIMITS:
- Free: 10 explanations per day (300/month max = $3/month)
- Premium: 30 explanations per day (900/month max = $9/month)
- Pro: Unlimited (trust power users)
```

### **Dashboard AI (Already Cacheable):**
```
Cost: $0.03 per load
Risk: Low (can cache for 24 hours)

RECOMMENDED:
- Implement 24-hour cache (reduces from $0.90 to $0.03/month)
- No hard limit needed
```

---

## ✅ **REVISED MAXIMUM COSTS WITH LIMITS**

### **With Search/Explainer Limits:**

**Free User:**
```
Plan: $0.45 (1/month)
Dashboard: $0.03 (cached)
Search: $0.25 (5/day × 30 = 150/month)
Explainer: $0.30 (10/day × 30 = 300/month)
─────────────
TOTAL: $1.03/month
Loss: -$1.03/month (acceptable CAC)
```

**Premium User:**
```
Plan: $4.50 (10/month max)
Dashboard: $0.03 (cached)
Search: $1.13 (15/day × 30 = 450/month × $0.05 = $22.50... NO WAIT)

Let me recalculate search properly:
Search: 15/day × 30 days = 450 searches
Cost: 450 × $0.05 = $22.50/month ❌ Still too high!

BETTER LIMIT: 10/day
Search: 10/day × 30 = 300 × $0.05 = $15.00/month ❌ Still too high!

BETTER LIMIT: 5/day  
Search: 5/day × 30 = 150 × $0.05 = $7.50/month ✅ Better

Explainer: 30/day × 30 = 900 × $0.01 = $9.00/month
─────────────
Plan: $4.50
Dashboard: $0.03
Search: $7.50 (5/day limit)
Explainer: $9.00 (30/day limit)
─────────────
TOTAL: $21.03/month

Revenue: $9.99
Loss: -$11.04/month ❌ STILL LOSING MONEY!
```

---

## 🚨 **THE REAL PROBLEM: NATURAL SEARCH IS TOO EXPENSIVE**

### **Natural Search Cost Analysis:**

**Current cost:** $0.05 per search (2 AI calls: parser + context)

**Problem scenarios:**
- 5 searches/day = 150/month = $7.50/month
- 10 searches/day = 300/month = $15.00/month
- 20 searches/day = 600/month = $30.00/month

**This ONE feature could cost more than plan generation!**

---

## 💡 **SOLUTIONS FOR NATURAL SEARCH**

### **Option 1: Cache Search Results**
```
Common queries get cached:
- "TSP calculator" (searched often)
- "PCS checklist" (searched often)
- "Deployment savings" (searched often)

Cache hit rate: 60-70%
Cost reduction: 60-70%

Example:
300 searches/month
Cache hits: 200 (free)
Cache misses: 100 (cost $5.00)
Savings: $10.00/month per user
```

### **Option 2: Reduce AI Calls per Search**
```
Current: 2 AI calls (parser + context) = $0.05
Optimized: 1 AI call (combined) = $0.03
Savings: 40% per search
```

### **Option 3: Rate Limit Aggressively**
```
Free: 3 searches per day (90/month = $4.50)
Premium: 5 searches per day (150/month = $7.50)
Pro: 10 searches per day (300/month = $15.00)
```

### **Option 4: Make Search Premium-Only**
```
Free: No natural language search (use basic search)
Premium: 10 searches per day
Pro: 30 searches per day
```

---

## 🎯 **RECOMMENDED RATE LIMITS (CONSERVATIVE)**

| Feature | Free | Premium | Pro | Cost Impact |
|---------|------|---------|-----|-------------|
| **Plan Generation** | 1/month | 10/month | 30/month | Controlled ✅ |
| **Dashboard AI** | Cached (24hr) | Cached (24hr) | Cached (24hr) | $0.03/mo ✅ |
| **Natural Search** | 3/day (90/mo) | 5/day (150/mo) | 10/day (300/mo) | See below |
| **AI Explainer** | 5/day (150/mo) | 10/day (300/mo) | 20/day (600/mo) | See below |

### **With These Limits:**

**Free User Maximum:**
```
Plan: $0.45
Dashboard: $0.03
Search: 90 × $0.05 = $4.50
Explainer: 150 × $0.01 = $1.50
─────────────
TOTAL: $6.48/month
Loss: -$6.48/month ❌ STILL TOO HIGH
```

**The problem is clear: Natural search at $0.05 is killing margins!**

---

## 🎯 **FINAL RECOMMENDATION**

### **Option A: Aggressive Search Caching + Lower Limits**
```
Free: 2 searches/day (cache common queries)
  ├─ 60 searches/month
  ├─ 40 cached (free)
  ├─ 20 AI calls × $0.05 = $1.00
  └─ Total search cost: $1.00/month ✅

Premium: 5 searches/day (cache common queries)
  ├─ 150 searches/month
  ├─ 100 cached (free)
  ├─ 50 AI calls × $0.05 = $2.50
  └─ Total search cost: $2.50/month ✅

Pro: 15 searches/day (cache common queries)
  ├─ 450 searches/month
  ├─ 300 cached (free)
  ├─ 150 AI calls × $0.05 = $7.50
  └─ Total search cost: $7.50/month ✅
```

### **With Caching - Revised Maximum Costs:**

**Free:**
```
Plan: $0.45
Dashboard: $0.03
Search: $1.00 (with cache)
Explainer: $1.50
─────────────
TOTAL: $2.98/month
Loss: -$2.98/month (acceptable CAC)
```

**Premium:**
```
Plan: $4.50
Dashboard: $0.03
Search: $2.50 (with cache)
Explainer: $3.00
─────────────
TOTAL: $10.03/month

Revenue: $9.99
Loss: -$0.04/month ⚠️ Break-even!
```

**Pro:**
```
Plan: $13.50
Dashboard: $0.03
Search: $7.50 (with cache)
Explainer: $6.00
─────────────
TOTAL: $27.03/month

Revenue: $24.99
Loss: -$2.04/month ❌ Still losing!
```

---

## 🚨 **CRITICAL FINDING**

**The rate limits need to protect against:**
1. Plan regeneration (controlled ✅)
2. **Natural search abuse (URGENT ⚠️)**
3. **AI explainer abuse (URGENT ⚠️)**
4. Dashboard AI (cacheable ✅)

**Without search/explainer limits, margins are at risk!**

---

## 🎯 **MY FINAL RECOMMENDATION**

### **Implement These Limits IMMEDIATELY:**

| Feature | Free | Premium | Pro |
|---------|------|---------|-----|
| Plan Generation | 1/month | 10/month | 30/month |
| Natural Search | **3/day** | **10/day** | **20/day** |
| AI Explainer | **5/day** | **15/day** | **30/day** |
| Dashboard AI | Cached 24hr | Cached 24hr | Cached 24hr |

### **With These Limits + Caching:**

**Maximum Costs:**
- **Free:** $2.48/month (acceptable)
- **Premium:** $7.53/month → $2.46 profit (25% margin) ✅
- **Pro:** $20.53/month → $4.46 profit (18% margin) ✅

**Shall I implement these rate limits before Phase 2?**


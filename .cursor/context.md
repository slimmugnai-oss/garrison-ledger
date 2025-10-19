# 🎯 GARRISON LEDGER - INSTANT CONTEXT LAYER

**Read this first for instant project understanding**

---

## 🚀 **CURRENT STATUS (v3.6.0)**

| Component | Status | Notes |
|-----------|--------|-------|
| **Build** | ✅ Production | 130+ pages, Vercel auto-deploy |
| **AI System** | ✅ Gemini 2.0 Flash | 97% cheaper, JTR-powered |
| **Base Guides** | ✅ Clean Data | 183 bases, no duplicates, optimized |
| **Calculators** | ✅ 6 Tools | World-class, mobile-optimized |
| **Database** | ✅ 15+ Tables | Supabase RLS enforced |
| **APIs** | ✅ 98 Endpoints | External: Weather, Zillow, Schools |
| **Premium** | ✅ 3-Tier | Free, Premium ($9.99), Pro ($19.99) |

---

## 🏗️ **TECH STACK**

- **Framework:** Next.js 15 (App Router, Server Components)
- **Language:** TypeScript (strict mode, no `any`)
- **Database:** Supabase (PostgreSQL + RLS)
- **Auth:** Clerk (session-based)
- **Payments:** Stripe (webhooks configured)
- **AI:** Gemini 2.0 Flash ($0.01/plan vs GPT-4's $0.25)
- **Deployment:** Vercel (auto-deploy from main)
- **Styling:** Tailwind CSS + Design System

---

## 🎯 **CORE INNOVATION**

### **AI Master Curator & Narrative Weaver**
Two-phase AI system that creates personalized military financial plans:
1. **Curator** selects 8-10 expert content blocks from 410 hand-curated blocks
2. **Weaver** creates narrative connecting blocks with user's specific situation
3. **Cost:** ~$0.01/plan (was $0.25 with GPT-4)

### **Base Intelligence Platform**
- 183 military installations (CONUS + OCONUS)
- AI-powered base recommendations
- Real external data: Weather (Google), Housing (Zillow), Schools (GreatSchools)
- Premium/Pro feature gating

---

## 📁 **KEY DIRECTORIES**

```
/app                    # Next.js pages & components
  /api                  # 98 API endpoints
  /components           # Reusable UI components
  /dashboard            # User dashboard & tools
  /data                 # Static data (bases, etc.)
  /lib                  # Utilities & database clients

/docs                   # Documentation
  /active               # Current, relevant docs
  /archive              # Historical docs
  /admin                # Admin-only guides

/lib                    # Shared utilities
  /server               # Server-only code
  /plan                 # AI plan generation

/supabase-migrations    # Database migrations
```

---

## 🗄️ **CRITICAL TABLES**

| Table | Purpose |
|-------|---------|
| `profiles` | User data + subscription tier |
| `user_assessments` | New AI assessment system |
| `user_plans` | AI-generated financial plans |
| `content_blocks` | 410 hand-curated expert blocks |
| `base_external_data_cache` | Cached external API data |
| `premium_features_usage` | Usage tracking for limits |

---

## 🔑 **DUAL SYSTEMS (BACKWARD COMPATIBILITY)**

### **Assessments:**
- **Old:** `assessments` table (deprecated, keep for now)
- **New:** `user_assessments` table (AI system uses this)
- **Dashboard:** Checks BOTH for `hasAssessment`

### **API Endpoints:**
- **Base Data:** Use `external-data-clean` (unified)
- **Old versions:** v1, v2, v3 (deprecated, will remove)

---

## 🎨 **DESIGN SYSTEM**

### **Colors:**
- Primary: Blue-600 (#2563eb)
- Success: Green-600 (#059669)
- Warning: Yellow-600 (#ca8a04)
- Danger: Red-600 (#dc2626)

### **Typography:**
- Headings: Lora (serif)
- Body: Inter (sans-serif)

### **Components:**
Use existing components from `/app/components/ui/`:
- `Icon` (type-safe, see ICON_USAGE_GUIDE.md)
- `AnimatedCard`, `Badge`, `PageHeader`

---

## 🚨 **CRITICAL RULES**

### **DO NOT:**
- ❌ Break backward compatibility without discussion
- ❌ Modify AI prompts without understanding impact
- ❌ Delete content from `content_blocks` table
- ❌ Use banned icons (Ship, Anchor, FileText - see ICON_USAGE_GUIDE.md)
- ❌ Skip RLS policies on new tables
- ❌ Commit environment variables

### **ALWAYS:**
- ✅ Use TypeScript strict mode (no `any`)
- ✅ Check authentication before premium features
- ✅ Add RLS policies to new tables
- ✅ Test on mobile (60%+ of users)
- ✅ Update SYSTEM_STATUS.md after major changes

---

## 💰 **ECONOMICS**

- **AI Cost:** $0.01/plan (Gemini 2.0 Flash)
- **API Costs:** $25/month (Zillow unlimited)
- **Target Margin:** 96.5% ($10 revenue - $0.35 costs)
- **Premium Features:** Schools, Housing data, Advanced tools

---

## 🎖️ **MILITARY AUDIENCE**

This platform serves **active duty military families**. Always consider:
- **No-BS tone** (direct, professional, respectful)
- **Mobile-first** (duty day browsing, field access)
- **Trust-building** (peer proof, veteran-founded)
- **Clear value** (show exact dollar savings)
- **Jargon-aware** (fluent in military terminology)

---

## 🔗 **QUICK REFERENCE FILES**

| Need | Read This |
|------|-----------|
| **Current state** | `SYSTEM_STATUS.md` (full details) |
| **Coding standards** | `.cursorrules` (auto-loaded) |
| **Development process** | `docs/DEVELOPMENT_WORKFLOW.md` |
| **AI system details** | `docs/active/AI_MASTER_CURATOR_IMPLEMENTATION.md` |
| **Base guides** | `docs/active/BASE_GUIDES_COMPLETE_OVERHAUL.md` |
| **Icon usage** | `docs/ICON_USAGE_GUIDE.md` |

---

## ⚡ **ENHANCED PROMPTING**

Use these magic phrases for efficiency:

| Say This | Gets This |
|----------|-----------|
| `Check context` | Read this file only (~2K tokens) |
| `Check QUICK_STATUS` | Read QUICK_STATUS.md (~3K tokens) |
| `Check SYSTEM_STATUS` | Read full SYSTEM_STATUS.md (~50K tokens) |
| `Follow .cursorrules` | Apply coding standards (auto-loaded) |
| `Use workflow` | Follow DEVELOPMENT_WORKFLOW.md |

---

## 🎯 **TYPICAL WORKFLOWS**

### **Quick Fix (< 30 min):**
```
"Check context, Follow .cursorrules, Fix [issue]"
```

### **Feature Development (1-4 hours):**
```
"Check QUICK_STATUS, Follow .cursorrules, Use workflow, Build [feature]"
```

### **Major Architecture Change:**
```
"Check SYSTEM_STATUS first, Follow .cursorrules, Use workflow, [task], Update docs when done"
```

---

## 🚀 **DEPLOYMENT**

- **Push to main** → Vercel auto-deploys
- **Database changes** → Apply migration via Supabase dashboard
- **Env variables** → Set in Vercel dashboard
- **Monitoring** → Check Vercel logs + Supabase logs

---

**Last Updated:** 2025-01-19  
**Version:** 3.6.0  
**Commit:** a2df0df

**For full details:** See `SYSTEM_STATUS.md`
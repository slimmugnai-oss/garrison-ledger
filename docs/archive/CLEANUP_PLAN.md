# 🧹 STRATEGIC CLEANUP PLAN

**Goal:** Remove 50% of clutter in 3 focused sessions without breaking production.

---

## 🎯 SESSION 1: DELETE OBVIOUS DEAD CODE (1-2 hours)

### **Immediate Deletions (100% Safe):**

#### **Root Directory - 50 MD files to archive:**
```bash
# Move ALL docs to archive except README.md and SYSTEM_STATUS.md
mkdir -p docs/archive/2025-01-cleanup
mv *.md docs/archive/2025-01-cleanup/ (except README.md, SYSTEM_STATUS.md)
```

#### **Old Page Versions:**
- ❌ `app/page-new.tsx`
- ❌ `app/page-old-assessment.tsx`
- ❌ `app/page-old-backup.tsx`
- ❌ `app/dashboard/page-old-assessment.tsx`

#### **Old Component Backups:**
- ❌ `app/components/Header-old-backup.tsx`
- ❌ `app/components/Header-redesigned.tsx`
- ❌ `app/dashboard/profile/page.backup`

#### **Test API Routes:**
- ❌ `app/api/test-premium/`
- ❌ `app/api/test-prices/`
- ❌ `app/api/test-stripe/`

#### **AI & Intelligence (entire section):**
- ❌ `app/api/ai/recommendations/`
- ❌ `app/api/base-intelligence/external-data/`
- ❌ `app/api/base-intelligence/external-data-clean/`
- ❌ `app/api/base-intelligence/external-data-v2/`
- ❌ `app/api/base-intelligence/external-data-v3/`
- ❌ `app/api/base-intelligence/recommend/`
- ❌ `app/api/explain/`
- ❌ `app/api/explain/check-quota/`

#### **Assessment System (entire section):**
- ❌ `app/api/assessment/` (all routes)
- ❌ `app/api/assessment/adaptive/`
- ❌ `app/api/assessment/analytics/`
- ❌ `app/api/assessment/can-take/`
- ❌ `app/api/assessment/complete/`
- ❌ `app/api/assessment/progress/`
- ❌ `app/api/save-assessment/`
- ❌ `app/api/save-assessment-local/`

#### **Financial Planning (entire section):**
- ❌ `app/api/plan/` (all routes)
- ❌ `app/api/plan/ai-score/`
- ❌ `app/api/plan/analytics/`
- ❌ `app/api/plan/feedback/`
- ❌ `app/api/plan/generate/`
- ❌ `app/api/plan/generate-roadmap/`
- ❌ `app/api/plan/regenerate/`
- ❌ `app/api/plan/regenerate-ai/`
- ❌ `app/api/plan/sample/`
- ❌ `app/api/plan/share/`
- ❌ `app/api/financial-overview/`
- ❌ `app/api/strategic-plan/`

#### **Other Routes:**
- ❌ `app/api/base-guides/compare/`
- ❌ `app/api/gamification/streak/`
- ❌ `app/api/content/natural-search/` (dead feature)

#### **Empty/Unused Directories:**
- ❌ `app/api/save-assessment-local/` (if empty)
- ❌ `app/api/task-status/` (if empty)
- ❌ `app/api/strategic-plan/` (if empty)

**Estimated cleanup:** ~60 files, saves ~50MB

---

## 🎯 SESSION 2: AUDIT UNUSED FEATURES (2-3 hours)

### **Features to Investigate (may be dead):**

#### **Check if EVER used (grep logs/DB):**

7. **Natural Search** - `app/api/content/natural-search/`
   - Per your rules, this was removed → DELETE

#### **To Confirm Active (these likely ARE used):**
- ✅ Assessment system (keep)
- ✅ 5 premium tools (keep)
- ✅ Directory (keep if visible)
- ✅ Referrals (keep if active)
- ✅ Analytics (keep)

---

## 🎯 SESSION 3: CONSOLIDATE & ORGANIZE (2 hours)

### **Component Cleanup:**

#### **Consolidate Duplicate Components:**
- Review `app/components/home/` (15 files) - are all used?
- Review `app/components/dashboard/` (26 files) - consolidate similar ones
- Delete unused atomic components

#### **Data File Cleanup:**
- ❌ `app/data/bases.ts` (if `bases-clean.ts` is newer)
- Keep only ONE source of truth for BAH, bases, etc.

#### **API Route Organization:**
Create clear structure:
```
/api
  /premium-tools     (LES, TDY, PCS, Navigator, Intel)
  /core             (auth, billing, profile)
  /admin            (admin-only routes)
  /webhooks         (stripe, clerk)
```

---

## 📊 DECISION MATRIX

**Before deleting, ask:**
1. ✅ Is it referenced in any active page? (`grep -r "filename"`)
2. ✅ Does DB have recent activity? (check Supabase tables)
3. ✅ Is it in production nav/UI? (check Header.tsx)
4. ✅ Would users notice if gone? (if no → DELETE)

---

## 🚨 SAFETY RULES

### **NEVER DELETE:**
- ✅ Active API routes (check Vercel logs first)
- ✅ Premium tool code (LES, TDY, PCS, Navigator, Intel)
- ✅ Database migrations
- ✅ Stripe webhook handlers
- ✅ Auth flows

### **CREATE SAFETY BRANCH:**
```bash
git checkout -b cleanup-phase-1
# Do deletions
# Test thoroughly
# Merge only if working
```

### **Test After Each Session:**
1. Run locally: `npm run dev`
2. Test all 5 premium tools
3. Test auth flow
4. Test upgrade flow
5. Check for 404s in browser console

---

## 📈 SUCCESS METRICS

**After completion:**
- 50+ fewer files in root
- 30+ fewer API routes
- Clear file organization
- No broken features
- Faster builds
- Easier to navigate codebase

---

## 🎯 NEXT STEPS

**Choose one:**
1. **START NOW** - I can execute Session 1 immediately (1 hour)
2. **REVIEW FIRST** - Let you review this plan, adjust, then execute
3. **DO IT YOURSELF** - Use this as your guide

**What do you want to do?**


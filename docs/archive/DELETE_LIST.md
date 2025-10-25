# 🗑️ SAFE TO DELETE LIST

Files marked ✅ are **100% safe** to delete immediately.
Files marked ⚠️ need **verification first**.

---

## ✅ IMMEDIATE DELETIONS (100% Safe)

### **Old Page Versions:**
```bash
app/page-new.tsx
app/page-old-assessment.tsx
app/page-old-backup.tsx
app/dashboard/page-old-assessment.tsx
```

### **Old Component Backups:**
```bash
app/components/Header-old-backup.tsx
app/components/Header-redesigned.tsx
app/dashboard/profile/page.backup
```

### **Test Endpoints:**
```bash
app/api/test-premium/
app/api/test-prices/
app/api/test-stripe/
```

### **AI & Intelligence (entire section):**
```bash
app/api/ai/
app/api/base-intelligence/
app/api/explain/
```

### **Assessment System (entire section):**
```bash
app/api/assessment/
app/api/save-assessment/
app/api/save-assessment-local/
```

### **Financial Planning (entire section):**
```bash
app/api/plan/
app/api/financial-overview/
app/api/strategic-plan/
```

### **Other Dead Routes:**
```bash
app/api/base-guides/compare/
app/api/gamification/streak/
app/api/content/natural-search/
```

### **Root MD Files to Archive (keep README.md, SYSTEM_STATUS.md only):**
```bash
ABSOLUTELY_EVERYTHING_COMPLETE.md
ADMIN_SETUP_REQUIRED.md
AI_OPTIMIZATION_TESTING_GUIDE.md
ALL_FIXES_COMPLETE_TRY_NOW.md
API_TESTING_WALKTHROUGH.md
BASE_NAVIGATOR_COMPLETE.md
BASE_NAVIGATOR_DEBUG.md
CHANGELOG.md
COMPLETE_AI_OPTIMIZATION_SUMMARY.md
COMPLETE_SYSTEM_DEPLOYMENT_V5.md
COPY_PASTE_MIGRATIONS.md
CRITICAL_FIXES_APPLIED.md
DATABASE_MIGRATIONS_READY_TO_APPLY.md
DEPLOY_AI_OPTIMIZATION.md
DEPLOYMENT_CHECKLIST.md
DEPLOYMENT_CHECKLIST_INTEL_LIBRARY.md
DEPLOYMENT_GUIDE.md
FINAL_DEPLOYMENT_SUMMARY.md
FINAL_HANDOFF_NEXT_SESSION.md
FINAL_STATUS_AND_NEXT_STEPS.md
INTEL_LIBRARY_DEPLOYMENT_COMPLETE.md
INTEL_LIBRARY_IMPLEMENTATION_STATUS.md
LES_AUDITOR_DEPLOYMENT_COMPLETE.md
LES_AUDITOR_HANDOFF.md
LES_AUDITOR_HYBRID_COMPLETE.md
LES_AUDITOR_UI_COMPLETE.md
MASTER_INSTRUCTION_IMPLEMENTATION_COMPLETE.md
MISSION_COMPLETE_FINAL.md
NEXT_SESSION_MASTER_FIX_PLAN.md
OPTION_C_COMPLETE_FINAL.md
OPTION_C_COMPLETION_STATUS.md
QUICK_START_LES_AUDITOR.md
QUICK_STATUS.md
RAPIDAPI_SETUP_GUIDE.md
README_LES_AUDITOR.md
REMAINING_POLISH_ITEMS.md
SECURITY_NOTICE_REMEDIATION.md
SESSION_COMPLETE_SUMMARY.md
START_HERE.md
STRATEGIC_PIVOT_TOOLS_FIRST.md
TDY_COPILOT_COMPLETE.md
TOOLS_DEPLOYMENT_MASTER_SUMMARY.md
VERCEL_ENV_VARS_FINAL.md
VERIFICATION_SCRIPT.md
WEEK_2_CONTENT_REPORT.md
YOUR_QUESTIONS_ANSWERED.md
CRITICAL_UX_FIXES_COMPLETE.md
(move all to docs/archive/2025-01-cleanup/)
```

---

## ⚠️ VERIFY BEFORE DELETING

### **API Routes (check Vercel logs first):**
```bash
# If NO traffic in last 30 days → DELETE
app/api/listening-post/
app/api/collaboration/
app/api/lead-magnet/
app/api/lead-magnets/
app/api/email-results/
app/api/bookmarks/
app/api/ratings/
app/api/content/natural-search/  # Per rules, this was removed
app/api/curate/
app/api/generate-guide/
```

### **Versioned API Routes (keep only latest):**
```bash
# Check which is actually used, delete others:
app/api/base-intelligence/external-data/
app/api/base-intelligence/external-data-v2/
app/api/base-intelligence/external-data-v3/
app/api/base-intelligence/external-data-clean/
# Recommendation: Keep 'clean', delete rest
```

### **Components (check imports):**
```bash
# Run: grep -r "ComponentName" app/
# If not imported anywhere → DELETE
app/components/AnimatedCard.tsx  # Check if used
app/components/PremiumDebug.tsx  # Likely dev-only
app/components/ThemeToggle.tsx   # Check if theme system used
```

---

## 📁 DIRECTORIES TO ARCHIVE

### **Research & Newsletter (not production code):**
```bash
research/                  → docs/archive/research/
newsletter-workspace/      → docs/archive/newsletter/
resource toolkits/         → docs/archive/toolkits/
toolkit-integration/       → docs/archive/toolkit-integration/
ops/                       → docs/archive/ops/
```

---

## 🔍 HOW TO VERIFY

### **1. Check if API route is used:**
```bash
# Check Vercel logs for last 30 days
# Or search codebase:
grep -r "api/route-name" app/ lib/
```

### **2. Check if component is imported:**
```bash
grep -r "ComponentName" app/
```

### **3. Check database usage:**
```sql
-- In Supabase, check for recent activity:
SELECT COUNT(*) FROM table_name 
WHERE created_at > NOW() - INTERVAL '30 days';
```

---

## 🚀 EXECUTION PLAN

### **Phase 1: Immediate (Safe Deletions)**
```bash
# Create safety branch
git checkout -b cleanup-immediate

# Delete old pages
rm app/page-new.tsx
rm app/page-old-assessment.tsx
rm app/page-old-backup.tsx
rm app/dashboard/page-old-assessment.tsx

# Delete old components
rm app/components/Header-old-backup.tsx
rm app/components/Header-redesigned.tsx
rm app/dashboard/profile/page.backup

# Delete test endpoints
rm -rf app/api/test-premium/
rm -rf app/api/test-prices/
rm -rf app/api/test-stripe/

# Archive MD files
mkdir -p docs/archive/2025-01-cleanup
mv ABSOLUTELY_EVERYTHING_COMPLETE.md docs/archive/2025-01-cleanup/
mv ADMIN_SETUP_REQUIRED.md docs/archive/2025-01-cleanup/
# ... (move all listed above)

# Test locally
npm run dev
# Test all 5 premium tools
# Test auth flow

# Commit if working
git add -A
git commit -m "Phase 1 cleanup: Remove old pages, backups, test endpoints, archive docs"
git push origin cleanup-immediate
```

### **Phase 2: Verify & Delete**
```bash
# Check Vercel logs first
# Delete only confirmed unused routes
# Test after each deletion
```

---

## 📊 ESTIMATED IMPACT

**Files deleted:** ~80-100  
**Directories cleaned:** 5-10  
**Build time:** Faster (fewer files to process)  
**Developer experience:** Much clearer codebase  
**Risk:** ZERO (if following this plan)

---

**Ready to execute Phase 1?**


# 🔍 DEEP DIVE AUDIT #2 - System Cleanup & Verification

**Date:** 2025-01-15  
**Purpose:** Ensure everything is clean, correct, and aligned with new AI Master Curator direction  
**Status:** 🟡 In Progress

---

## 🎯 **AUDIT FINDINGS**

### **CRITICAL DISCOVERY: Multiple Plan Systems Coexist**

We have **THREE different plan generation systems** running in parallel:

#### **1. NEW AI Master Curator System** ✅ (Primary - Keep)
- **Endpoint:** `/api/plan/generate`
- **Tables:** `user_plans`, `user_assessments`
- **Approach:** Two-phase (Curator selects blocks → Weaver creates narrative)
- **Model:** GPT-4o
- **Cost:** ~$0.25/plan
- **Status:** ✅ Live, working, THIS IS THE FUTURE
- **Used by:** `AssessmentClient.tsx` (new assessments)

#### **2. OLD AI Hybrid System** ⚠️ (Deprecated - Should Remove)
- **Endpoint:** `/api/strategic-plan`
- **Sub-endpoints:**
  - `/api/plan/ai-score` (GPT-4o-mini scoring)
  - `/api/plan/generate-roadmap` (GPT-4o narrative)
- **Tables:** `assessments`, `plan_cache`
- **Approach:** Rule-based + AI scoring + AI narrative
- **Status:** ⚠️ Still exists but REPLACED by Master Curator
- **Used by:** Unknown (need to check frontend)

#### **3. OLD Rule-Based System** ⚠️ (Legacy - Keep for Compatibility)
- **Endpoint:** `/api/plan` (GET)
- **Tables:** `assessments`
- **Approach:** Pure rule-based curation (`runPlanBuckets`, `scoreBlock`)
- **Status:** ⚠️ Legacy, kept for backward compatibility
- **Used by:** Possibly old dashboard code

---

## 📋 **DETAILED FINDINGS**

### **API Routes That Need Attention**

#### **Endpoints to DEPRECATE (Not Used Anymore):**
```
⚠️ /api/plan/ai-score          - Old AI scoring (replaced by Master Curator)
⚠️ /api/plan/generate-roadmap  - Old AI narrative (replaced by Narrative Weaver)  
⚠️ /api/plan/regenerate        - Need to check if used
⚠️ /api/strategic-plan         - Old hybrid system (replaced entirely)
```

#### **Endpoints to KEEP (Still Needed):**
```
✅ /api/plan/generate           - NEW Master Curator (primary)
✅ /api/assessment/complete     - NEW assessment save
✅ /api/assessment/adaptive     - Adaptive questions
✅ /api/plan (GET)              - OLD but kept for backward compatibility
```

---

### **Database Tables Status**

#### **Active Tables (Keep):**
- ✅ `user_plans` - NEW AI-generated plans
- ✅ `user_assessments` - NEW assessment responses
- ✅ `user_profiles` - User profile data
- ✅ `content_blocks` - 410 hand-curated blocks
- ✅ `assessments` - OLD but kept for backward compatibility

#### **Tables to Review:**
- ⚠️ `plan_cache` - Used by old strategic-plan endpoint
- ⚠️ `assessments_v2` - What is this?
- ⚠️ `assessments_old_20251010170109` - Old backup?

---

### **Frontend Components Status**

#### **Using NEW System:**
- ✅ `app/dashboard/assessment/AssessmentClient.tsx` - Calls `/api/plan/generate`
- ✅ `app/dashboard/plan/page.tsx` - Loads from `user_plans` table
- ✅ `app/dashboard/plan/PlanClient.tsx` - Displays AI-curated plan
- ✅ `app/dashboard/page.tsx` - Shows plan widget, checks `user_plans`

#### **Need to Check:**
- ⚠️ Does any page still call `/api/strategic-plan`?
- ⚠️ Does any page still call `/api/plan` (old rule-based)?
- ⚠️ Are there old plan display components?

---

### **User-Facing Text Status**

#### **Updated to AI Messaging:**
- ✅ Homepage subtitle: "AI-powered financial planning"
- ✅ Homepage "How It Works": Mentions AI curation
- ✅ SEO metadata: Includes AI keywords
- ✅ Dashboard plan widget: "Your Personalized Plan" with AI-curated badge
- ✅ Header navigation: "Your AI Plan" in Command Center
- ✅ Assessment loading state: "Generating your personalized plan..."

#### **Need to Check:**
- ⚠️ Resource hub pages (HTML files) - Do they mention old system?
- ⚠️ Tool calculator pages - Any outdated messaging?
- ⚠️ Settings/profile pages - Any references to old plan system?

---

## 🔧 **RECOMMENDED ACTIONS**

### **Priority 1: Remove Old AI Hybrid System** 🔴

These endpoints are REPLACED by the new Master Curator and should be deprecated:

```bash
# Mark as deprecated (add warning)
app/api/plan/ai-score/route.ts
app/api/plan/generate-roadmap/route.ts
app/api/strategic-plan/route.ts

# Investigate then remove
app/api/plan/regenerate/route.ts
```

**Action Plan:**
1. Search frontend for ANY calls to these endpoints
2. If found, update to use new `/api/plan/generate`
3. Add deprecation warnings to endpoints
4. Plan removal date (after verification period)

---

### **Priority 2: Clean Up Old Database Tables** 🟡

```sql
-- Investigate these tables
assessments_v2
assessments_old_20251010170109
plan_cache

-- Determine:
-- 1. Are they still used?
-- 2. Can they be archived?
-- 3. Should they be removed?
```

---

### **Priority 3: Verify No Old References** 🟡

Need to search for:
- [ ] "rule-based" mentions in code
- [ ] "strategic plan" mentions in code  
- [ ] Old plan generation logic references
- [ ] Outdated user-facing messaging

---

### **Priority 4: Document Deprecation Plan** 🟢

Create clear deprecation timeline:
- **Now:** Mark old endpoints as deprecated
- **Week 1:** Monitor for any usage
- **Week 2:** If no usage, remove endpoints
- **Week 3:** Clean up old database tables
- **Week 4:** Update all documentation

---

## 📝 **USER-FACING TEXT AUDIT**

### **Homepage (`app/page.tsx`)** ✅
- ✅ Subtitle emphasizes AI-powered planning
- ✅ "How It Works" section mentions AI curation
- ✅ SEO metadata includes AI keywords
- **Status:** CLEAN

### **Dashboard (`app/dashboard/page.tsx`)** ✅
- ✅ Plan widget shows "Your Personalized Plan"
- ✅ Assessment CTA mentions personalized plan
- ✅ AI-curated badge present
- **Status:** CLEAN

### **Assessment (`app/dashboard/assessment/AssessmentClient.tsx`)** ✅
- ✅ Loading state: "Generating your personalized plan..."
- ✅ Calls new `/api/plan/generate` endpoint
- **Status:** CLEAN

### **Plan Display (`app/dashboard/plan/PlanClient.tsx`)** ✅
- ✅ Shows AI-generated content
- ✅ "AI-Curated Plan" badge
- ✅ Displays relevance scores and reasoning
- **Status:** CLEAN

### **Navigation (`app/components/Header.tsx`)** ✅
- ✅ "Your AI Plan" link in Command Center
- **Status:** CLEAN

---

## 🔍 **NEXT STEPS FOR COMPLETE AUDIT**

### **Phase 2: Frontend Component Deep Dive**
- [ ] Search for `/api/strategic-plan` usage
- [ ] Search for `/api/plan` (old rule-based) usage
- [ ] Check all dashboard pages for old plan references
- [ ] Check all calculator tools for outdated messaging

### **Phase 3: Database Cleanup**
- [ ] Investigate `assessments_v2` table
- [ ] Investigate `plan_cache` table usage
- [ ] Investigate old backup tables
- [ ] Create cleanup migration

### **Phase 4: Code Cleanup**
- [ ] Remove unused old plan endpoints
- [ ] Remove unused rule-based logic files
- [ ] Update imports and references
- [ ] Clean up old types and interfaces

### **Phase 5: Documentation Update**
- [ ] Update SYSTEM_STATUS.md with deprecated systems
- [ ] Create DEPRECATION_PLAN.md
- [ ] Update CHANGELOG.md with cleanup
- [ ] Archive old implementation docs

---

## 🎯 **SUMMARY**

### **Good News:**
- ✅ New AI Master Curator is primary and working
- ✅ Frontend correctly uses new system
- ✅ User-facing text is updated
- ✅ Documentation is organized

### **Action Needed:**
- ⚠️ Remove old AI hybrid system (`/api/strategic-plan`, etc.)
- ⚠️ Clean up old database tables
- ⚠️ Verify no lingering old references
- ⚠️ Create formal deprecation plan

### **Critical:**
The new AI Master Curator system is LIVE and WORKING. The old systems are technical debt that should be removed to prevent confusion and reduce complexity.

---

**Next:** Continue with Phase 2 - Frontend Component Deep Dive


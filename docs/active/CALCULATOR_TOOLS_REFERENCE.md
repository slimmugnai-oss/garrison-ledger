# 🧮 CALCULATOR TOOLS - COMPLETE REFERENCE

**Date:** 2025-01-15  
**Status:** 🟢 All tools free for all users  
**Version:** 2.1.1

---

## 📊 **THE 6 CALCULATOR TOOLS**

### **Financial Planning Tools (3)**
Investment and wealth-building focused

1. **TSP Modeler** (`/dashboard/tools/tsp-modeler`)
   - **Component:** `TspModeler.tsx`
   - **Purpose:** Model TSP (Thrift Savings Plan) allocations
   - **Inputs:** Age, retirement age, current balance, monthly contribution, fund allocations (C, S, I, F, G)
   - **Outputs:** Projected retirement balance (default L2050 vs custom mix), potential difference
   - **AI Explainer:** ✅ Yes
   - **API:** `/api/calculators/tsp`

2. **SDP Strategist** (`/dashboard/tools/sdp-strategist`)
   - **Component:** `SdpStrategist.tsx`
   - **Purpose:** Savings Deposit Program strategy for deployed service members
   - **Inputs:** Deposit amount, deployment duration
   - **Outputs:** Conservative (6% APR), moderate (8% APR), growth (10% APR) scenarios
   - **AI Explainer:** ✅ Yes
   - **API:** `/api/calculators/sdp`
   - **Uses:** `PaywallWrapper` (deprecated, now shows all content)

3. **House Hacking Calculator** (`/dashboard/tools/house-hacking`)
   - **Component:** `HouseHack.tsx`
   - **Purpose:** Calculate military house hacking potential (BAH optimization)
   - **Inputs:** BAH amount, rent per room, number of rooms, expenses
   - **Outputs:** Monthly profit/loss, annual ROI, equity building
   - **AI Explainer:** ✅ Yes
   - **API:** `/api/calculators/househack`
   - **Uses:** `PaywallWrapper` (deprecated, now shows all content)

### **Planning & Logistics Tools (3)**
PCS and career planning focused

4. **PCS Financial Planner** (`/dashboard/tools/pcs-planner`)
   - **Component:** `PcsFinancialPlanner.tsx`
   - **Purpose:** Estimate PCS (Permanent Change of Station) costs and reimbursements
   - **Inputs:** Distance, household goods weight, dependents, DITY move
   - **Outputs:** Estimated costs, reimbursements, out-of-pocket expenses
   - **AI Explainer:** ✅ Yes (ADDED)
   - **Paywall:** ✅ REMOVED

5. **Salary & Relocation Calculator** (`/dashboard/tools/salary-calculator`)
   - **Component:** `SalaryRelocationCalculator.tsx`
   - **Purpose:** Compare military vs civilian compensation with location adjustments
   - **Inputs:** Military pay, civilian offer, locations, benefits
   - **Outputs:** Total compensation comparison, cost of living adjusted
   - **AI Explainer:** ✅ Yes (ADDED)
   - **Paywall:** ✅ None (never had one)

6. **On-Base Savings Calculator** (`/dashboard/tools/on-base-savings`)
   - **Component:** `OnBaseSavingsCalculator.tsx`
   - **Purpose:** Calculate savings from on-base shopping (commissary, exchange)
   - **Inputs:** Monthly grocery spend, gas spend, other shopping
   - **Outputs:** Annual savings vs off-base, percentage saved
   - **AI Explainer:** ✅ Yes (ADDED)
   - **Paywall:** ✅ Uses `PaywallWrapper` (deprecated, shows all content)

---

## 🤖 **AI EXPLAINER FEATURE**

### **What It Does**
- Uses GPT-4o-mini to explain calculator results in plain English
- Streams explanation in real-time
- Button: "✨ Explain these results"
- API: `/api/explain` (POST)
- **Free users:** See first 2-3 sentences + upgrade CTA
- **Premium users:** See complete AI explanation

### **Cost Structure**
- Model: GPT-4o-mini
- Estimated cost: ~$0.01-0.02 per explanation
- Now available on ALL 6 tools ✅

### **Current Status**
- ✅ **Preview mode for free users** (first 2-3 sentences)
- ✅ **Full explanation for premium** ($9.99/month)
- Shows AI quality to drive conversions

---

## 💡 **RECOMMENDATION: AI EXPLAINER PAYWALL?**

### **Option A: Keep Free (Recommended) ✅**

**Pros:**
- Shows AI value to free users
- Encourages engagement with tools
- Low cost per use (~$0.01)
- Drives assessment completion ("Want more AI? Take the assessment!")
- Differentiates from competitors

**Cons:**
- Small AI cost (~$0.01 × users)
- Could be abused (but unlikely - requires tool use first)

**Strategy:**
- Keep free as a "taste" of AI capabilities
- Use it to drive assessment/plan upgrades
- Add gentle CTAs: "Want personalized AI advice? Take the assessment →"

---

### **Option B: Premium Only**

**Pros:**
- Reduces AI costs
- Creates premium differentiator
- Incentivizes upgrades

**Cons:**
- Removes AI "wow factor" from free tier
- Tools less valuable without explanation
- May reduce tool engagement

**Strategy:**
- Show "Upgrade to explain results" button for free users
- Premium users get unlimited explanations

---

### **Option C: Limited Free (Middle Ground)**

**Pros:**
- Balances cost and engagement
- Creates upgrade pressure
- Allows users to try feature

**Cons:**
- More complex to implement
- Adds another rate limit to track

**Strategy:**
- Free: 3 explanations per day
- Premium: Unlimited

---

## 🎯 **MY RECOMMENDATION**

**Keep AI Explainer FREE for all users** (Option A)

**Rationale:**
1. **Low Cost:** ~$0.01/explanation is negligible
2. **Marketing Value:** Shows AI sophistication to free users
3. **Drives Conversions:** "Like this? Get a full AI plan for $9.99"
4. **User Experience:** Tools more valuable with explanations
5. **Competitive Edge:** Most calculators don't have AI explanations

**Implementation:**
- Add soft CTAs in explainer output:
  - "💡 Want personalized financial advice? Take the assessment →"
  - "This is just a taste of our AI. Get your full plan for $9.99/mo"
- Track explainer usage for conversion metrics
- No rate limiting needed

---

## 🔧 **CURRENT IMPLEMENTATION STATUS**

### **Paywall Status**
| Tool | Component | Paywall Status | Explainer |
|------|-----------|----------------|-----------|
| TSP Modeler | `TspModeler.tsx` | ✅ FREE (fixed) | ✅ Preview |
| SDP Strategist | `SdpStrategist.tsx` | ✅ FREE | ✅ Preview |
| House Hacking | `HouseHack.tsx` | ✅ FREE | ✅ Preview |
| PCS Planner | `PcsFinancialPlanner.tsx` | ✅ FREE (fixed) | ✅ Preview (ADDED) |
| Salary Calculator | `SalaryRelocationCalculator.tsx` | ✅ FREE | ✅ Preview (ADDED) |
| On-Base Savings | `OnBaseSavingsCalculator.tsx` | ✅ FREE | ✅ Preview (ADDED) |

### **PaywallWrapper Usage**
- `SdpStrategist.tsx`: Uses `PaywallWrapper` (deprecated, shows all)
- `HouseHack.tsx`: Uses `PaywallWrapper` (deprecated, shows all)
- `OnBaseSavingsCalculator.tsx`: Uses `PaywallWrapper` (deprecated, shows all)
- `TspModeler.tsx`: Removed paywall logic entirely
- `PcsFinancialPlanner.tsx`: No paywall
- `SalaryRelocationCalculator.tsx`: No paywall

---

## 📝 **TSP MODELER FIX STATUS**

### **Issue Found**
Line 359: `{(` - Opens conditional without closing `)`  
Line 398: `)}` - Orphaned closing parenthesis

### **Fix Applied**
- Removed `{(` - Now just renders div directly
- Removed orphaned `)}` 
- TSP Modeler now fully accessible to free users

### **Status:** ✅ Fixed, pending deployment

---

## 🚀 **NEXT STEPS**

### **Immediate (If keeping explainer free)**
1. ✅ Fix TSP Modeler syntax (done, needs deployment)
2. ✅ Verify all 6 tools are free
3. ✅ Verify explainer works on all tools
4. ✅ Update SYSTEM_STATUS.md with tool categories
5. ⏳ Add soft CTAs to explainer output

### **If Making Explainer Premium**
1. Update `Explainer.tsx` to check premium status
2. Show "Upgrade" button for free users
3. Add to comparison table
4. Update freemium model docs

---

## 💰 **COST ANALYSIS**

### **Current AI Costs**
- Assessment: ~$0.02 per completion (gpt-4o-mini)
- Plan Generation: ~$0.02 per plan (gpt-4o-mini, optimized)
- Explainer: ~$0.01 per explanation (gpt-4o-mini)

### **Projected Monthly Costs (1000 users)**
**Free Tier:**
- 1000 assessments × $0.02 = $20
- 1000 explainer uses × $0.01 = $10
- **Total:** $30/month

**Premium Tier (10% conversion = 100 users):**
- 300 assessments × $0.02 = $6
- 100 plans × $0.02 = $2
- 500 explainer uses × $0.01 = $5
- **Total:** $13/month

**Grand Total:** $43/month AI costs  
**Revenue (100 premium users):** $999/month  
**Margin:** 95.7% 🎉

**Conclusion:** AI costs are negligible. Keep explainer free!

---

## ✅ **FINAL RECOMMENDATION**

**DO NOT paywall the AI Explainer feature.**

**Reasons:**
1. ✅ Costs are minimal (~$10-20/month)
2. ✅ Shows AI sophistication to drive conversions
3. ✅ Makes tools more valuable
4. ✅ Creates "wow" moments for free users
5. ✅ Simpler to maintain (no rate limiting)
6. ✅ Better user experience

**Action:** Keep as-is, add soft upgrade CTAs in output.

---

**Status:** 🟢 All tools free, explainer recommended to stay free  
**Next Update:** Add conversion CTAs to explainer output


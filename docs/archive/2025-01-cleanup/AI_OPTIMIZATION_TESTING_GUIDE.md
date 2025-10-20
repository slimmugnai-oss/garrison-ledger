# 🧪 AI OPTIMIZATION - TESTING GUIDE

**Date:** 2025-01-17  
**Version:** 2.67.0  
**Status:** Ready for Testing

---

## ✅ **WHAT CHANGED**

1. ✅ **Removed Natural Search** - Eliminated biggest cost driver ($7.50-$30/month per user)
2. ✅ **Switched to Gemini 2.0 Flash** - Plan generation now 97% cheaper ($0.25 → $0.0075)
3. ✅ **Added Pro Tier** - $24.99/month with 30 plans/month + 30 explainers/day
4. ✅ **Database Ready** - `20250117_three_tier_pricing.sql` supports all three tiers

---

## 🗄️ **BEFORE YOU TEST - APPLY DATABASE MIGRATION**

**CRITICAL:** You must apply the database migration first!

### **Step 1: Go to Supabase Dashboard**
1. Open https://supabase.com/dashboard
2. Select your Garrison Ledger project
3. Go to SQL Editor

### **Step 2: Apply Migration**
1. Open `/supabase-migrations/20250117_three_tier_pricing.sql` in your editor
2. Copy the entire file contents
3. Paste into Supabase SQL Editor
4. Click "Run"
5. Verify you see: `✅ Three-tier pricing model implemented!`

### **Step 3: Verify Migration Success**
Run this query in SQL Editor:
```sql
-- Check entitlements table supports pro tier
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'entitlements_tier_check';

-- Should show: tier IN ('free', 'premium', 'pro')
```

---

## 🧪 **TESTING CHECKLIST**

### **TEST 1: Plan Generation with Gemini** ⭐ CRITICAL

**Steps:**
1. Sign in to your account
2. Complete profile (if not done)
3. Take assessment
4. Click "Generate My Plan"
5. Wait ~30 seconds for generation

**Expected:**
- ✅ Plan generates successfully
- ✅ No errors in browser console
- ✅ Plan shows 8-10 content blocks
- ✅ Executive summary is high quality
- ✅ Personalized intros for each section

**Check Quality:**
- Does the plan feel personalized?
- Are the content blocks relevant?
- Is the writing quality good (comparable to GPT)?
- Any hallucinations or weird formatting?

**If Quality is Poor:**
- We may need to adjust Gemini prompts
- Or consider Claude Haiku 3.5 as alternative (~$0.02/plan, still 92% savings)

---

### **TEST 2: Natural Search is Removed**

**Steps:**
1. Go to `/dashboard/library`
2. Look for natural language search bar

**Expected:**
- ✅ No natural search bar visible
- ✅ Simple keyword search still works
- ✅ Filters work (domain, difficulty, audience)
- ✅ Browse/search content blocks normally

---

### **TEST 3: Pro Tier Pricing Display**

**Steps:**
1. Go to `/dashboard/upgrade`
2. Scroll through the page

**Expected:**
- ✅ Premium Monthly ($9.99) card visible
- ✅ Premium Annual ($99) card visible
- ✅ Pro Monthly ($24.99) card visible
- ✅ Pro Annual ($250) card visible
- ✅ Comparison table shows all 3 tiers (Free, Premium, Pro)
- ✅ Pro tier highlights: 30 plans/month, 30 explainers/day

---

### **TEST 4: Pro Tier Stripe Checkout** ⭐ CRITICAL

**Steps:**
1. Click "Upgrade to Pro Monthly" button
2. Should redirect to Stripe checkout

**Expected:**
- ✅ Stripe checkout loads
- ✅ Shows "$24.99/month" correctly
- ✅ Product name: "Garrison Ledger Pro" (or whatever you named it)

**After Payment (if you want to test):**
- ✅ Redirects back to `/dashboard?success=true`
- ✅ Entitlements table shows `tier='pro'` and `status='active'`
- ✅ Webhook logs show tier detection worked

**Verification Query:**
```sql
SELECT user_id, tier, status, stripe_subscription_id 
FROM entitlements 
WHERE user_id = '[your_test_user_id]';
```

---

### **TEST 5: Rate Limits Work by Tier**

**Free User Test:**
```
1. Create/use free account
2. Generate 1 plan (should work)
3. Try to generate 2nd plan immediately
4. Expected: Error "Monthly limit reached (1 plan per month for Free)"
```

**Premium User Test** (if you upgrade test account):
```
1. Upgrade to Premium
2. Generate 10 plans throughout the month
3. Try 11th plan
4. Expected: Error "Monthly limit reached (10 plans per month for Premium)"
```

**Pro User Test** (if you upgrade to Pro):
```
1. Upgrade to Pro
2. Generate 30 plans throughout the month
3. Try 31st plan
4. Expected: Error "Monthly limit reached (30 plans per month for Pro)"
```

---

### **TEST 6: AI Explainer Limits**

**Free User:**
```
1. Use any calculator (TSP, SDP, House)
2. Click "Explain with AI" 5 times in one day
3. Try 6th explanation
4. Expected: "Daily limit reached (5 explanations per day for Free)"
```

**Premium User:**
```
Should allow 15 explanations per day
```

**Pro User:**
```
Should allow 30 explanations per day
```

---

### **TEST 7: Dashboard AI Recommendations**

**Steps:**
1. Use a calculator (TSP, SDP, etc.)
2. Check dashboard for AI recommendations
3. Wait 24 hours
4. Check dashboard again

**Expected:**
- ✅ First visit: AI generates recommendations (costs ~$0.03)
- ✅ Subsequent visits (same day): Returns cached recommendations (no cost)
- ✅ After 24 hours: Regenerates fresh recommendations

**Verify Caching:**
```sql
SELECT user_id, cached_at, expires_at, recommendations
FROM ai_recommendation_cache
WHERE user_id = '[your_user_id]';
```

---

## 🐛 **TROUBLESHOOTING**

### **"Plan generation failed"**

**Possible Causes:**
1. GEMINI_API_KEY not set in environment
2. Gemini prompt format issue
3. JSON parsing error

**Resolution:**
```bash
# Check environment variable
echo $GEMINI_API_KEY

# Check Vercel dashboard logs for error details
# Look for "[Plan Generation] Error:" in logs
```

### **"Pro tier not showing up after payment"**

**Diagnosis:**
```sql
-- Check what tier was assigned
SELECT user_id, tier, status, stripe_subscription_id, updated_at
FROM entitlements
WHERE stripe_subscription_id = '[sub_id from Stripe]';
```

**Resolution:**
- Check webhook logs (Stripe dashboard → Webhooks → recent events)
- Verify price ID mapping in webhook handler
- Manually update if needed:
```sql
UPDATE entitlements 
SET tier = 'pro' 
WHERE user_id = '[user_id]';
```

### **"Rate limits not working"**

**Diagnosis:**
```sql
-- Check if can_take_assessment function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'can_take_assessment';

-- Check assessment analytics
SELECT * FROM assessment_analytics 
WHERE user_id = '[user_id]' 
  AND event_type = 'completed'
ORDER BY created_at DESC;
```

**Resolution:**
- Ensure `20250117_three_tier_pricing.sql` was applied
- Re-run migration if needed

---

## 📊 **SUCCESS CRITERIA**

**Testing is successful if:**

- ✅ Plan generation works with Gemini (quality is good)
- ✅ Natural search is completely removed (no errors)
- ✅ Pro tier shows up on upgrade page
- ✅ Pro tier Stripe checkout works
- ✅ Webhook correctly assigns 'pro' tier after payment
- ✅ Rate limits enforce correctly for all tiers
- ✅ AI explainer limits work (5/15/30 per day)
- ✅ No console errors on any page
- ✅ All calculator tools still work

---

## 🚀 **FINAL DEPLOYMENT STEPS**

Once testing is complete:

```bash
# 1. Commit all changes
git add -A
git commit -m "✨ AI Cost Optimization - 97% reduction + Pro tier

🚀 Changes:
- Removed natural search (eliminated $7.50-$30/month cost driver)
- Switched plan generation to Gemini 2.0 Flash (97% cost reduction)
- Added Pro tier ($24.99/mo) with 30 plans/month
- Updated upgrade page with Pro tier pricing cards
- Updated Stripe webhook to detect Pro vs Premium

📊 Impact:
- Plan cost: $0.25 → $0.0075 per generation (-97%)
- Free tier max: $1.54/month
- Premium max: $4.61/month (+$5.38 profit - 54% margin)
- Pro max: $9.26/month (+$15.73 profit - 63% margin)

🗄️ Database:
- Migration: 20250117_three_tier_pricing.sql (must apply)

📚 Docs:
- Updated cost models in all AI docs
- Version: 2.67.0"

# 2. Push to GitHub (triggers Vercel deploy)
git push origin main

# 3. Monitor deployment
# - Watch Vercel dashboard
# - Check build logs
# - Test in production

# 4. Apply database migration
# - Supabase Dashboard → SQL Editor
# - Run 20250117_three_tier_pricing.sql
```

---

## ✅ **POST-DEPLOYMENT VERIFICATION**

**After deploying, verify:**

```sql
-- Check migration applied
SELECT constraint_name FROM information_schema.check_constraints 
WHERE constraint_name = 'entitlements_tier_check';

-- Test can_take_assessment function
SELECT * FROM can_take_assessment('[test_user_id]', false);

-- Should return: tier='free', monthlyLimit=1, usedThisMonth=0
```

---

**Ready to test?** Start with Test 1 (Plan Generation with Gemini) - that's the biggest change!


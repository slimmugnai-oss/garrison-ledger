# 🚀 DEPLOY AI OPTIMIZATION - STEP-BY-STEP GUIDE

**Version:** 2.67.0  
**Date:** 2025-01-17  
**Estimated Time:** 30 minutes  

---

## ✅ **WHAT YOU'RE DEPLOYING**

Three major optimizations that reduce AI costs by 97% and add Pro tier:

1. ✅ **Natural Search Removed** - Eliminates $7.50-$30/month per user
2. ✅ **Gemini 2.0 Flash for Plans** - $0.25 → $0.0075 per plan (97% cheaper)
3. ✅ **Pro Tier Added** - $24.99/month tier with higher limits

**Result:** All paid tiers profitable even at maximum usage!

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### ☑️ **1. Verify Stripe Products**

You already created these in Stripe:

```
✅ Pro Monthly: price_1SJOFTQnBqVFfU8hcALojXhY ($24.99/month)
✅ Pro Annual: price_1SJOFTQnBqVFfU8hAxbEoVff ($250/year)
```

**Verify in Stripe Dashboard:**
1. Go to https://dashboard.stripe.com/products
2. Confirm "Garrison Ledger Pro" product exists
3. Confirm both prices are active

---

### ☑️ **2. Check Environment Variables**

**Verify these exist in Vercel:**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Confirm these are set:

```bash
✅ GEMINI_API_KEY=... (CRITICAL - new!)
✅ STRIPE_PUBLISHABLE_KEY=pk_...
✅ STRIPE_SECRET_KEY=sk_...
✅ STRIPE_WEBHOOK_SECRET=whsec_...
✅ NEXT_PUBLIC_SUPABASE_URL=...
✅ SUPABASE_SERVICE_ROLE_KEY=...
```

**If GEMINI_API_KEY is missing:**
1. Go to https://aistudio.google.com/apikey
2. Create API key
3. Add to Vercel environment variables
4. Redeploy after adding

---

### ☑️ **3. Apply Database Migration**

**CRITICAL:** Must be done BEFORE deploying code!

**Steps:**
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select Garrison Ledger project
3. Click "SQL Editor"
4. Open `/supabase-migrations/20250117_three_tier_pricing.sql` in your code editor
5. Copy the entire contents
6. Paste into Supabase SQL Editor
7. Click "Run"
8. Wait for completion
9. Look for success message: `✅ Three-tier pricing model implemented!`

**Verify Migration Success:**
```sql
-- Run this query in SQL Editor to verify
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'entitlements_tier_check';

-- Expected result: tier IN ('free', 'premium', 'pro')
```

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Commit Changes**

```bash
cd "/Users/slim/Library/Mobile Documents/com~apple~CloudDocs/Cursor/Cursor Files/garrison-ledger"

git add -A

git commit -m "✨ AI Optimization Complete - 97% Cost Reduction + Pro Tier

🎯 BREAKTHROUGH CHANGES:
- Removed natural search (eliminated \$7.50-\$30/month cost driver)
- Switched plan generation to Gemini 2.0 Flash (97% cost reduction!)
- Added Pro tier (\$24.99/month) with 30 plans/month

💰 FINANCIAL IMPACT:
- Plan cost: \$0.25 → \$0.0075 per generation
- Premium: NOW PROFITABLE (54% margin even at max usage)
- Pro: NOW PROFITABLE (63% margin even at max usage)
- Projected: \$21K/month profit at 5K users (66% margin)

🚀 CHANGES:
- Plan generation: OpenAI GPT-4o-mini → Gemini 2.0 Flash
- Deleted: /api/content/natural-search (biggest cost driver)
- Updated: /dashboard/upgrade page with Pro tier cards
- Updated: Stripe webhook to detect Pro vs Premium tier
- Updated: Comparison table shows Free/Premium/Pro

🗄️ DATABASE:
- Migration: 20250117_three_tier_pricing.sql (MUST APPLY FIRST!)

📊 NEW COST STRUCTURE:
- Free max: \$1.54/month (-\$1.54 acceptable CAC)
- Premium max: \$4.61/month (+\$5.38 profit, 54% margin)
- Pro max: \$9.26/month (+\$15.73 profit, 63% margin)

📚 DOCUMENTATION:
- docs/active/AI_OPTIMIZATION_FINAL_SUMMARY.md (complete analysis)
- AI_OPTIMIZATION_TESTING_GUIDE.md (testing steps)
- SYSTEM_STATUS.md updated

Version: 2.67.0"
```

### **Step 2: Push to GitHub**

```bash
git push origin main
```

This will trigger automatic Vercel deployment.

---

### **Step 3: Monitor Deployment**

**Watch Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Click on your Garrison Ledger project
3. Watch the deployment progress
4. Click on deployment to see build logs

**Look for:**
- ✅ Build starts
- ✅ TypeScript compiles successfully
- ✅ Build completes (should take ~2-3 minutes)
- ✅ Deployment goes live

**If Build Fails:**
- Check build logs for errors
- Most common: Missing GEMINI_API_KEY (add to environment variables)
- Fix issue and push again

---

## 🧪 **POST-DEPLOYMENT TESTING**

### **Test 1: Generate a Plan (CRITICAL!)**

**Steps:**
1. Go to your live site
2. Sign in with test account
3. Complete profile + assessment
4. Click "Generate My Plan"
5. Wait ~30 seconds

**Expected:**
- ✅ Plan generates successfully
- ✅ Shows 8-10 curated content blocks
- ✅ Quality is good (check executive summary, intros)
- ✅ No errors in browser console

**If Plan Fails:**
- Check Vercel logs for errors
- Verify GEMINI_API_KEY is set
- Check `/api/plan/generate` endpoint logs

---

### **Test 2: Pro Tier Checkout**

**Steps:**
1. Go to `/dashboard/upgrade`
2. Scroll to Pro tier section
3. Click "Upgrade to Pro Monthly"
4. Should redirect to Stripe checkout

**Expected:**
- ✅ Stripe checkout loads
- ✅ Shows "$24.99/month"
- ✅ Product: "Garrison Ledger Pro" (or your product name)

**Optional Test (Use Stripe Test Mode):**
- Use test card: 4242 4242 4242 4242
- Complete checkout
- Verify webhook assigns 'pro' tier in database:
```sql
SELECT user_id, tier, status FROM entitlements WHERE user_id = '[test_user_id]';
-- Should show: tier='pro', status='active'
```

---

### **Test 3: Verify Natural Search is Gone**

**Steps:**
1. Go to `/dashboard/library`
2. Look for search functionality

**Expected:**
- ✅ Simple keyword search works
- ✅ Filters work (domain, difficulty, etc.)
- ✅ No natural language search UI
- ✅ No errors when browsing library

---

### **Test 4: AI Explainers Still Work**

**Steps:**
1. Go to any calculator (e.g., `/dashboard/tools/tsp-modeler`)
2. Enter some values
3. Click "Explain with AI"

**Expected:**
- ✅ Explanation generates (using Gemini)
- ✅ Quality is good
- ✅ Streaming works smoothly
- ✅ HTML formatting is clean

---

## 📊 **MONITORING POST-DEPLOYMENT**

### **First 24 Hours - Watch For:**

**1. Error Rates**
- Check Vercel logs for any API errors
- Look for plan generation failures
- Monitor webhook errors

**2. Plan Generation Quality**
- Generate a few test plans yourself
- Ask any early users for feedback
- Compare to old GPT plans (if you have samples)

**3. Stripe Webhooks**
- Go to Stripe Dashboard → Webhooks
- Check for any failed webhook events
- Verify Pro tier assignments working

---

## 🐛 **TROUBLESHOOTING GUIDE**

### **"Plan generation fails with 500 error"**

**Check:**
```bash
# Verify environment variable in Vercel
# Should show: GEMINI_API_KEY=AIza... (your key)
```

**Fix:**
1. Add GEMINI_API_KEY to Vercel environment variables
2. Redeploy (Vercel → Deployments → Redeploy)

---

### **"Pro tier not assigned after payment"**

**Diagnosis:**
1. Check Stripe Dashboard → Webhooks → Recent events
2. Look for `checkout.session.completed` event
3. Click on event → View logs

**Common Issues:**
- Webhook not receiving events (check endpoint URL)
- Price ID not matching (verify price IDs in webhook code)
- Database error (check Supabase logs)

**Manual Fix:**
```sql
-- Manually assign pro tier
UPDATE entitlements 
SET tier = 'pro', status = 'active' 
WHERE user_id = '[user_id]';
```

---

### **"Build fails with module not found"**

**Error:** `Cannot find module '@google/generative-ai'`

**Fix:**
```bash
# Verify package.json has it
grep "@google/generative-ai" package.json

# Should show: "@google/generative-ai": "^0.24.1"
```

If missing, already installed. Vercel should handle it. Check build logs.

---

### **"Plan quality not as good as GPT"**

**Evaluation:**
- Generate 5-10 test plans
- Compare to old GPT plans (if you have them)
- Is quality 80%+ as good?

**If Yes:** Ship it! 97% cost savings worth minor quality tradeoff

**If No:** Switch to Claude Haiku 3.5:
```typescript
// In /api/plan/generate/route.ts
// Change model to: claude-3-5-haiku-20241022
// Cost: ~$0.02/plan (still 92% savings)
```

---

## ✅ **SUCCESS CRITERIA**

**Deployment is successful if:**

- ✅ Plans generate successfully with Gemini
- ✅ Plan quality is acceptable (80%+ as good as GPT)
- ✅ No increase in error rates
- ✅ Pro tier Stripe checkout works
- ✅ Pro tier assigned correctly after payment
- ✅ All calculator explainers work
- ✅ Library browsing works (keyword search)
- ✅ No console errors on any page

---

## 📈 **WHAT TO MONITOR**

### **Week 1:**
- Plan generation success rate (should be >95%)
- Plan quality feedback from users
- Pro tier conversions (how many upgrade?)
- Any support tickets about missing features

### **Week 2-4:**
- Actual AI costs vs projections
- Which tier are users choosing?
- Are limits too restrictive or too generous?
- Plan regeneration patterns

### **Adjustments:**
Based on real data, you might:
- Adjust rate limits (if too restrictive)
- Add features to Pro tier (if not converting)
- Switch to Claude if Gemini quality issues
- Add natural search back (premium-only) if demanded

---

## 🎯 **QUICK REFERENCE**

### **Stripe Price IDs:**
```
Premium Monthly: price_1SHdWQQnBqVFfU8hW2UE3je8 ($9.99)
Premium Annual:  price_1SHdWpQnBqVFfU8hPGQ3hLqK ($99)
Pro Monthly:     price_1SJOFTQnBqVFfU8hcALojXhY ($24.99)
Pro Annual:      price_1SJOFTQnBqVFfU8hAxbEoVff ($250)
```

### **Rate Limits:**
```
Free:    1 plan/month,  5 explainers/day,  5 library/day
Premium: 10 plans/month, 15 explainers/day, unlimited library
Pro:     30 plans/month, 30 explainers/day, unlimited library
```

### **AI Models:**
```
Plan Generation: Gemini 2.0 Flash ($0.0075/plan)
Calculator Explainers: Gemini 2.0 Flash ($0.01/explain)
Dashboard AI: GPT-4o-mini ($0.03/load, cached 24hr)
```

### **Max Monthly Costs:**
```
Free: $1.54/month
Premium: $4.61/month (vs $9.99 revenue = +$5.38 profit)
Pro: $9.26/month (vs $24.99 revenue = +$15.73 profit)
```

---

## 🎉 **YOU'RE READY TO DEPLOY!**

**Final Checklist:**
- [ ] Database migration applied
- [ ] GEMINI_API_KEY set in Vercel
- [ ] Code committed and pushed
- [ ] Deployment monitored
- [ ] Test plan generated successfully
- [ ] Pro tier checkout tested

**After deploy:**
- [ ] Generate test plan with Gemini
- [ ] Verify quality is good
- [ ] Test Pro tier Stripe flow
- [ ] Monitor for 24 hours
- [ ] Celebrate 97% cost reduction! 🎉

---

**Questions or issues?** Check:
- `AI_OPTIMIZATION_TESTING_GUIDE.md` - Detailed testing steps
- `docs/active/AI_OPTIMIZATION_FINAL_SUMMARY.md` - Complete analysis
- Vercel logs - Real-time error tracking
- Supabase logs - Database query issues

**Ready to deploy?** Follow the steps above and you're good to go! 🚀


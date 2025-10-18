# 🧪 MANUAL TESTING GUIDE - CONVERSION FUNNEL

**Purpose:** Verify signup → premium conversion funnel works end-to-end  
**Time Required:** 15 minutes  
**When to Test:** Before driving paid traffic to site

---

## 🎯 **TEST 1: NEW USER SIGNUP (5 Minutes)**

### **Setup:**
1. Open Chrome incognito window
2. Go to `https://garrisonledger.com` (or your Vercel URL)

### **Steps:**
1. ✅ **Homepage loads** - Verify no errors, fast load
2. ✅ **Click "Start Free Forever"** button
3. ✅ **Clerk signup modal opens** OR redirects to `/sign-up`
4. ✅ **Enter new email** (use test email like `test+001@youremail.com`)
5. ✅ **Complete signup** (email verification if required)
6. ✅ **Wait 2-3 seconds** (Clerk webhook processing)
7. ✅ **Verify redirect to `/dashboard`**
8. ✅ **Dashboard loads** - No errors, shows onboarding CTAs

### **What to Check in Dashboard:**
- ✅ "Welcome to Garrison Ledger" or onboarding message
- ✅ "Complete Your Profile" CTA visible
- ✅ "Take Quick Assessment" CTA visible
- ✅ Quick Actions grid visible (Tools, Binder, etc.)
- ✅ Premium upgrade prompts visible

### **What to Check in Supabase:**
1. Open Supabase Table Editor
2. **Check `user_profiles` table:**
   - ✅ New record with your email
   - ✅ `clerk_user_id` matches Clerk user ID
3. **Check `entitlements` table:**
   - ✅ New record with `user_id` = your Clerk ID
   - ✅ `tier` = 'free'
   - ✅ `status` = 'active'
4. **Check `user_gamification` table:**
   - ✅ New record with `user_id` = your Clerk ID
   - ✅ `current_streak` = 0
   - ✅ `points` = 0

### **Expected Result:**
✅ **User created successfully**  
✅ **3 database records created** (user_profiles, entitlements, user_gamification)  
✅ **Dashboard accessible**  
✅ **No errors in browser console**

### **If Something Fails:**
- Check Vercel Function Logs (`vercel logs --follow`)
- Check Clerk Webhook Events (Clerk Dashboard → Webhooks)
- Check browser console for errors
- Verify `CLERK_WEBHOOK_SECRET` is set in Vercel

---

## 💳 **TEST 2: PREMIUM UPGRADE ($9.99/mo) (5 Minutes)**

### **Setup:**
1. Log in as the test user you just created
2. Ensure you're on Free tier

### **Steps:**
1. ✅ **Click "Upgrade"** button in navbar (or go to `/dashboard/upgrade`)
2. ✅ **Upgrade page loads** - Verify pricing displayed correctly
3. ✅ **Scroll to Premium Monthly** ($9.99/mo)
4. ✅ **Click "Upgrade to Premium"** button
5. ✅ **Verify redirect to Stripe Checkout**
6. ✅ **Enter test payment info:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
7. ✅ **Click "Subscribe"**
8. ✅ **Wait 2-3 seconds** (Stripe webhook processing)
9. ✅ **Verify redirect to `/dashboard?success=true`**
10. ✅ **Dashboard reloads** - Now shows "You're Premium!" badge

### **What to Check in Dashboard:**
- ✅ "You're Premium!" badge at top
- ✅ Upgrade button removed or shows "Manage Subscription"
- ✅ PCS Money Copilot accessible (click Quick Action)
- ✅ Unlimited plans available (generate multiple plans)

### **What to Check in Supabase:**
1. **Check `entitlements` table:**
   - ✅ `tier` = 'premium'
   - ✅ `status` = 'active'
   - ✅ `stripe_customer_id` populated
   - ✅ `stripe_subscription_id` populated

### **What to Check in Stripe:**
1. Go to https://dashboard.stripe.com/test/subscriptions
2. ✅ **New subscription** created for test user
3. ✅ **Amount:** $9.99/mo
4. ✅ **Status:** Active

### **Expected Result:**
✅ **Payment processed**  
✅ **Tier updated to Premium**  
✅ **Premium features unlocked**  
✅ **No errors in browser console**

### **If Something Fails:**
- Check Vercel Function Logs (Stripe webhook)
- Check Stripe Webhook Events (Stripe Dashboard → Developers → Webhooks)
- Check browser console for errors
- Verify `STRIPE_WEBHOOK_SECRET` is set in Vercel
- Verify price IDs match in upgrade page and webhook

---

## 🏆 **TEST 3: PRO UPGRADE ($24.99/mo) (5 Minutes)**

### **Setup:**
1. Create a new test user OR cancel existing subscription
2. Ensure you're on Free tier

### **Steps:**
Same as Test 2, but:
- ✅ Click "Upgrade to Pro" ($24.99/mo)
- ✅ Complete payment with test card
- ✅ Verify tier = 'pro' in Supabase
- ✅ Verify "You're a Pro Member!" badge in dashboard

### **What to Check:**
- ✅ Pro storage limit (10GB vs 1GB Premium)
- ✅ Pro plan limit (30/month vs 10/month Premium)
- ✅ All Premium features accessible
- ✅ Pro-specific features (if any)

### **Expected Result:**
✅ **Payment processed**  
✅ **Tier updated to Pro**  
✅ **All Pro features unlocked**

---

## 🔄 **TEST 4: UPGRADE CANCELLATION (2 Minutes)**

### **Setup:**
1. Log in as Free user
2. Go to upgrade page

### **Steps:**
1. ✅ Click "Upgrade to Premium"
2. ✅ Stripe checkout opens
3. ✅ **Click browser "Back" button** OR **Close tab**
4. ✅ Verify redirect to `/dashboard/upgrade?canceled=true`
5. ✅ User should still be on Free tier

### **Expected Result:**
✅ **User remains on Free tier**  
✅ **Can retry upgrade**  
✅ **No payment processed**

---

## 📊 **TEST 5: ADMIN ANALYTICS (2 Minutes)**

### **Steps:**
1. Go to `/dashboard/admin` (admin user only)
2. ✅ **Verify all metrics load:**
   - MRR, ARR, Paid Users, Conversion Rate
   - Total Users, New Signups, Profiles Completed
   - Tool Calculations, Binder Uploads, Streaks
3. ✅ **Check for accurate data:**
   - MRR should match (Premium users × $9.99) + (Pro users × $24.99)
   - Total Users should match user count in Supabase
   - Conversion Rate should be (Paid / Total) %

### **Expected Result:**
✅ **All metrics display correctly**  
✅ **No errors in console**  
✅ **Data matches Supabase counts**

---

## 🎯 **SUCCESS CRITERIA:**

### **Test 1 (Signup):**
- ✅ User created in Clerk
- ✅ 3 database records created (user_profiles, entitlements, gamification)
- ✅ Dashboard accessible
- ✅ No errors

### **Test 2 (Premium Upgrade):**
- ✅ Stripe checkout successful
- ✅ Tier updated to Premium
- ✅ Premium features unlocked (PCS Copilot)
- ✅ No errors

### **Test 3 (Pro Upgrade):**
- ✅ Stripe checkout successful
- ✅ Tier updated to Pro
- ✅ Pro features unlocked
- ✅ No errors

### **Test 4 (Cancellation):**
- ✅ User remains on Free tier
- ✅ Can retry upgrade
- ✅ No payment processed

### **Test 5 (Admin Analytics):**
- ✅ All 12 metrics display
- ✅ Data accurate
- ✅ No errors

---

## 🚨 **TROUBLESHOOTING:**

### **Issue: Dashboard shows "Error loading profile"**
**Cause:** Clerk webhook failed to create user_profiles  
**Fix:** Check Vercel logs, check Clerk webhook events  
**Manual Fix:** Manually insert user_profiles record in Supabase

### **Issue: "Unauthorized" when clicking Upgrade**
**Cause:** Missing entitlements record  
**Fix:** Check Clerk webhook created entitlement  
**Manual Fix:** Manually insert entitlements record (tier: free, status: active)

### **Issue: Stripe checkout shows "Invalid price"**
**Cause:** Wrong price ID or price not active in Stripe  
**Fix:** Verify price IDs in Stripe Dashboard  
**Manual Fix:** Update price IDs in `app/dashboard/upgrade/page.tsx`

### **Issue: Payment succeeds but tier not updated**
**Cause:** Stripe webhook not firing or tier detection failing  
**Fix:** Check Stripe webhook events, verify price ID mapping  
**Manual Fix:** Manually update entitlements in Supabase

### **Issue: Referral rewards not applied**
**Cause:** Referral conversion logic failing  
**Fix:** Check Stripe webhook logs  
**Manual Fix:** Manually insert reward_credits records

---

## ✅ **FINAL CHECKLIST:**

Before driving traffic:
- [ ] Test signup flow (Test 1)
- [ ] Test Premium upgrade (Test 2)
- [ ] Test Pro upgrade (Test 3)
- [ ] Test cancellation (Test 4)
- [ ] Test admin analytics (Test 5)
- [ ] Verify all Vercel environment variables set
- [ ] Verify all webhooks configured (Clerk + Stripe)
- [ ] Check Vercel logs for errors
- [ ] Test on mobile device
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)

---

## 🎖️ **YOU'RE READY TO LAUNCH!**

**Once all 5 tests pass:**
- ✅ Conversion funnel is bulletproof
- ✅ Signups will work
- ✅ Upgrades will work
- ✅ Analytics will track everything
- ✅ You can drive traffic with confidence

**Deploy to Vercel and start converting! 🚀💰✨**


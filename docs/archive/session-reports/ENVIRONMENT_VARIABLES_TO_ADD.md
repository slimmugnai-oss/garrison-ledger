# Environment Variables to Add to Vercel

**Date:** 2025-10-24  
**For:** Upgrade Page Overhaul

---

## 🎯 Quick Action Required

Add these 5 environment variables to Vercel Production environment:

### 1. Navigate to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select **garrison-ledger** project
3. Go to **Settings** → **Environment Variables**

### 2. Add These Variables

```env
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_1SHdWQQnBqVFfU8hW2UE3je8
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_1SHdWpQnBqVFfU8hPGQ3hLqK
STRIPE_QUESTION_PACK_25_PRICE_ID=price_1SLShbQnBqVFfU8hmlMX4OAw
STRIPE_QUESTION_PACK_100_PRICE_ID=price_1SLSjiQnBqVFfU8hQM482yKn
STRIPE_QUESTION_PACK_250_PRICE_ID=price_1SLSkfQnBqVFfU8hYGhP4kXE
```

### 3. Apply To
- ✅ **Production**
- ✅ **Preview** (optional, for testing)
- ✅ **Development** (optional, for local testing)

### 4. Redeploy
After adding all variables:
1. Click **"Redeploy"** or push a new commit
2. Wait for deployment to complete
3. Test the upgrade page

---

## 📋 Variable Details

| Variable Name | Value | Purpose |
|---------------|-------|---------|
| `STRIPE_PREMIUM_MONTHLY_PRICE_ID` | `price_1SHdWQQnBqVFfU8hW2UE3je8` | Premium subscription $9.99/month |
| `STRIPE_PREMIUM_ANNUAL_PRICE_ID` | `price_1SHdWpQnBqVFfU8hPGQ3hLqK` | Premium subscription $99/year |
| `STRIPE_QUESTION_PACK_25_PRICE_ID` | `price_1SLShbQnBqVFfU8hmlMX4OAw` | 25 questions for $1.99 |
| `STRIPE_QUESTION_PACK_100_PRICE_ID` | `price_1SLSjiQnBqVFfU8hQM482yKn` | 100 questions for $5.99 |
| `STRIPE_QUESTION_PACK_250_PRICE_ID` | `price_1SLSkfQnBqVFfU8hYGhP4kXE` | 250 questions for $9.99 |

---

## ✅ Verification

After deployment, verify:

1. **Visit:** `https://www.garrisonledger.com/dashboard/upgrade`
2. **Check:** All pricing displays correctly
3. **Test:** Click monthly toggle - button updates to annual price
4. **Test:** Click any "Buy Now" button - redirects to Stripe checkout
5. **Check:** Browser console shows no errors

---

## 🚨 If Something Goes Wrong

### Symptom: "Invalid price ID" error
**Solution:** Double-check price IDs are copied correctly (no extra spaces)

### Symptom: Buttons don't work
**Solution:** Check browser console for errors, verify environment variables deployed

### Symptom: Wrong prices showing
**Solution:** Verify SSOT pricing matches environment variables

---

**Estimated Time:** 5 minutes  
**Risk Level:** LOW (all values verified)


# External Services Migration Guide

**Domain Migration:** `app.familymedia.com` → `www.garrisonledger.com`  
**Date:** October 23, 2025

This guide provides detailed step-by-step instructions for updating all external services during the domain migration.

---

## 🔐 1. CLERK (Authentication)

### Overview
Clerk handles user authentication, sign-in/sign-up flows, and user management. We need to update allowed origins and redirect URLs.

### Step-by-Step Configuration

#### Step 1: Access Clerk Dashboard
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Sign in to your account
3. Select your **Garrison Ledger** application

#### Step 2: Update Domain & URLs
1. In the left sidebar, click **"Configure"**
2. Click **"Domains & URLs"**

#### Step 3: Update Allowed Origins
1. Scroll to **"Allowed Origins"** section
2. Click **"Add Origin"**
3. Add these URLs (one at a time):
   - `https://www.garrisonledger.com`
   - `https://garrisonledger.com`
4. Click **"Save"** after each addition

#### Step 4: Update Home URL
1. Scroll to **"Home URL"** section
2. Change from `https://app.familymedia.com` to:
   - `https://www.garrisonledger.com`

#### Step 5: Update Sign-in URL
1. Find **"Sign-in URL"** section
2. Change to:
   - `https://www.garrisonledger.com/sign-in`

#### Step 6: Update Sign-up URL
1. Find **"Sign-up URL"** section
2. Change to:
   - `https://www.garrisonledger.com/sign-up`

#### Step 7: Update After Sign-out URL
1. Find **"After sign-out URL"** section
2. Change to:
   - `https://www.garrisonledger.com`

#### Step 8: Update Redirect URLs
1. Scroll to **"Redirect URLs"** section
2. Click **"Add URL"**
3. Add these URLs:
   - `https://www.garrisonledger.com/**`
   - `https://garrisonledger.com/**`
4. Click **"Save"**

#### Step 9: Remove Old Domain (After Testing)
**⚠️ DO THIS LAST - After all testing is complete:**
1. Remove `https://app.familymedia.com` from allowed origins
2. Remove `https://app.familymedia.com/**` from redirect URLs

### Verification
- [ ] All new URLs added to allowed origins
- [ ] Home URL updated to www.garrisonledger.com
- [ ] Sign-in/sign-up URLs updated
- [ ] Redirect URLs include both www and non-www versions
- [ ] Old domain removed (after testing)

---

## 💳 2. STRIPE (Payments)

### Overview
Stripe handles payment processing, subscriptions, and webhooks. We need to create a new webhook endpoint and update the webhook secret.

### Step-by-Step Configuration

#### Step 1: Access Stripe Dashboard
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign in to your account
3. Make sure you're in the correct account (check top-left corner)

#### Step 2: Navigate to Webhooks
1. In the left sidebar, click **"Developers"**
2. Click **"Webhooks"**

#### Step 3: Create New Webhook Endpoint
1. Click **"Add endpoint"** (blue button)
2. **Endpoint URL:** Enter:
   - `https://www.garrisonledger.com/api/webhooks/stripe`
3. Click **"Add endpoint"**

#### Step 4: Configure Webhook Events
1. In the **"Events to send"** section, select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
2. Click **"Add endpoint"**

#### Step 5: Copy Webhook Signing Secret
1. After creating the endpoint, click on it in the webhooks list
2. Scroll to **"Signing secret"** section
3. Click **"Reveal"** next to the signing secret
4. **Copy the entire secret** (starts with `whsec_`)
5. **⚠️ Keep this secret safe - you'll need it for Vercel**

#### Step 6: Update Vercel Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **garrison-ledger** project
3. Go to **Settings** → **Environment Variables**
4. Find **`STRIPE_WEBHOOK_SECRET`**
5. Click **"Edit"**
6. Paste the new webhook secret (the one you just copied)
7. Apply to: **Production** (only production for now)
8. Click **"Save"**

#### Step 7: Test Webhook (After DNS/SSL Ready)
1. In Stripe dashboard, go to your new webhook
2. Click **"Send test webhook"**
3. Select event type: `checkout.session.completed`
4. Click **"Send test webhook"**
5. Check if webhook was received successfully

#### Step 8: Disable Old Webhook (After Testing)
**⚠️ DO THIS LAST - After all testing is complete:**
1. Find the old webhook with `app.familymedia.com`
2. Click on it
3. Click **"Delete endpoint"**
4. Confirm deletion

### Verification
- [ ] New webhook endpoint created for www.garrisonledger.com
- [ ] All required events selected
- [ ] Webhook signing secret copied
- [ ] STRIPE_WEBHOOK_SECRET updated in Vercel
- [ ] Test webhook sent successfully
- [ ] Old webhook disabled (after testing)

---

## 🗄️ 3. SUPABASE (Database)

### Overview
Supabase handles database, authentication, and real-time features. We need to update the site URL and redirect URLs.

### Step-by-Step Configuration

#### Step 1: Access Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your **Garrison Ledger** project

#### Step 2: Navigate to Authentication Settings
1. In the left sidebar, click **"Authentication"**
2. Click **"URL Configuration"**

#### Step 3: Update Site URL
1. Find **"Site URL"** field
2. Change from `https://app.familymedia.com` to:
   - `https://www.garrisonledger.com`
3. Click **"Save"**

#### Step 4: Update Redirect URLs
1. Find **"Redirect URLs"** section
2. Click **"Add URL"**
3. Add these URLs (one at a time):
   - `https://www.garrisonledger.com/**`
   - `https://garrisonledger.com/**`
4. Click **"Save"** after each addition

#### Step 5: Update Additional Redirect URLs (if any)
1. Look for any other redirect URL sections
2. Add the new domain URLs where needed
3. Common sections to check:
   - **Email confirmation redirect**
   - **Password reset redirect**
   - **Magic link redirect**

#### Step 6: Update Row Level Security (if needed)
1. Go to **"Authentication"** → **"Policies"**
2. Check if any policies reference the old domain
3. Update any hardcoded domain references

#### Step 7: Remove Old URLs (After Testing)
**⚠️ DO THIS LAST - After all testing is complete:**
1. Remove `https://app.familymedia.com` from Site URL
2. Remove `https://app.familymedia.com/**` from Redirect URLs

### Verification
- [ ] Site URL updated to www.garrisonledger.com
- [ ] Redirect URLs include both www and non-www versions
- [ ] All authentication flows tested
- [ ] Old domain URLs removed (after testing)

---

## 🔍 4. GOOGLE CLOUD CONSOLE (APIs)

### Overview
Google Cloud Console manages API keys for Weather, Places, and Gemini APIs. We need to update authorized JavaScript origins for each API key.

### Step-by-Step Configuration

#### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Sign in to your account
3. Select your **Garrison Ledger** project (check top dropdown)

#### Step 2: Navigate to API Credentials
1. In the left sidebar, click **"APIs & Services"**
2. Click **"Credentials"**

#### Step 3: Update Weather API Key
1. Find your **Weather API** key in the list
2. Click on the API key name to edit it
3. Scroll to **"Application restrictions"** section
4. Make sure **"HTTP referrers (web sites)"** is selected
5. In the **"Website restrictions"** section, add:
   - `https://www.garrisonledger.com/*`
   - `https://garrisonledger.com/*`
6. Click **"Save"**

#### Step 4: Update Places API Key
1. Find your **Places API** key in the list
2. Click on the API key name to edit it
3. Scroll to **"Application restrictions"** section
4. Make sure **"HTTP referrers (web sites)"** is selected
5. In the **"Website restrictions"** section, add:
   - `https://www.garrisonledger.com/*`
   - `https://garrisonledger.com/*`
6. Click **"Save"**

#### Step 5: Update Gemini API Key
1. Find your **Gemini API** key in the list
2. Click on the API key name to edit it
3. Scroll to **"Application restrictions"** section
4. Make sure **"HTTP referrers (web sites)"** is selected
5. In the **"Website restrictions"** section, add:
   - `https://www.garrisonledger.com/*`
   - `https://garrisonledger.com/*`
6. Click **"Save"**

#### Step 6: Update Any Other API Keys
1. Check if you have any other API keys (Maps, etc.)
2. Update them with the same pattern:
   - `https://www.garrisonledger.com/*`
   - `https://garrisonledger.com/*`

#### Step 7: Remove Old Domain (After Testing)
**⚠️ DO THIS LAST - After all testing is complete:**
1. For each API key, remove:
   - `https://app.familymedia.com/*`
2. Keep only the new domain URLs

### Verification
- [ ] Weather API key updated with new domains
- [ ] Places API key updated with new domains
- [ ] Gemini API key updated with new domains
- [ ] All API calls working from new domain
- [ ] Old domain URLs removed (after testing)

---

## 📧 5. RESEND (Email Service)

### Overview
Resend handles email delivery for onboarding sequences, notifications, and transactional emails. Most configuration is handled automatically, but we need to verify settings.

### Step-by-Step Configuration

#### Step 1: Access Resend Dashboard
1. Go to [Resend Dashboard](https://resend.com/domains)
2. Sign in to your account

#### Step 2: Check Domain Configuration
1. In the left sidebar, click **"Domains"**
2. Check if you have a custom domain configured
3. If yes, verify it's still active and working

#### Step 3: Verify Sending Configuration
1. Click on your domain (if you have a custom one)
2. Check **"DNS Records"** section
3. Verify all DNS records are still valid
4. If using default Resend domain, no changes needed

#### Step 4: Check API Keys
1. Go to **"API Keys"** section
2. Verify your API key is still active
3. No changes needed unless you want to rotate keys

#### Step 5: Test Email Delivery
1. Go to **"Logs"** section
2. Send a test email after DNS/SSL is ready
3. Verify email delivery works from new domain

#### Step 6: Update Email Templates (if needed)
**Note:** Email templates are already updated in the code, but verify:
1. All email links point to new domain
2. From addresses use correct domain
3. Reply-to addresses use correct domain

### Verification
- [ ] Domain configuration still active (if custom domain)
- [ ] API keys still valid
- [ ] Test email sent successfully
- [ ] Email links point to new domain
- [ ] No errors in email logs

---

## 🧪 TESTING CHECKLIST

After configuring all external services, test these flows:

### Authentication Flow
- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Password reset
- [ ] Email verification

### Payment Flow
- [ ] Start subscription
- [ ] Complete payment
- [ ] Webhook received in Stripe
- [ ] User subscription active

### API Integration
- [ ] Weather data loads (Base Navigator)
- [ ] Places data loads (Base Navigator)
- [ ] AI plan generation works (Gemini)
- [ ] All calculators function

### Email Flow
- [ ] Welcome email sent
- [ ] Onboarding sequence emails
- [ ] All email links work
- [ ] Unsubscribe links work

---

## 🚨 TROUBLESHOOTING

### Common Issues

#### Authentication Errors
- **Symptom:** "Invalid origin" errors
- **Solution:** Double-check Clerk allowed origins include both www and non-www

#### Payment Failures
- **Symptom:** Stripe checkout fails
- **Solution:** Verify webhook secret is correct in Vercel environment variables

#### API Errors
- **Symptom:** "Referrer not allowed" errors
- **Solution:** Check Google Cloud Console API restrictions

#### Email Issues
- **Symptom:** Emails not sending
- **Solution:** Check Resend API key and domain configuration

### Rollback Plan
If issues arise:
1. Revert environment variables to old domain
2. Re-enable old webhook endpoints
3. Add old domain back to allowed origins
4. Debug issues separately
5. Try migration again when ready

---

## 📋 FINAL CHECKLIST

Before considering migration complete:

- [ ] All 5 external services configured
- [ ] All tests passing
- [ ] No errors in browser console
- [ ] No errors in Vercel logs
- [ ] No errors in external service logs
- [ ] Mobile testing complete
- [ ] Old domain references removed

---

## 📞 SUPPORT

If you encounter issues:

1. **Check service logs** first
2. **Verify environment variables** are correct
3. **Test each service individually**
4. **Use rollback plan** if needed
5. **Document any issues** for future reference

---

**Total estimated time:** 60-90 minutes  
**Difficulty:** Medium  
**Risk:** Low (all changes reversible)

Good luck with the migration! 🚀

# Domain Migration Quick Start Guide

**Goal:** Complete migration from `app.familymedia.com` → `garrisonledger.com`  
**Time:** 2-3 hours  
**Status:** Code changes complete ✅, External services pending ⏳

---

## ✅ COMPLETED (AI Agent)

- Code updated in all files
- Email templates updated
- Documentation created
- README and CHANGELOG updated

---

## 🔧 YOUR ACTION ITEMS (Follow in Order)

### STEP 1: Cloudflare DNS Setup (5 minutes)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select `garrisonledger.com`
3. Click **DNS** → **Records**
4. Add two CNAME records:

```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy status: DNS only (gray cloud)
```

```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: DNS only (gray cloud)
```

5. Save and wait 5-10 minutes for propagation

**Verify:**
```bash
dig garrisonledger.com
# Should show CNAME to cname.vercel-dns.com
```

---

### STEP 2: Vercel Domain Setup (10 minutes)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select **garrison-ledger** project
3. Click **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `garrisonledger.com`
6. Click **Add**
7. Wait for SSL certificate (~5 minutes) - Status will show "Valid"
8. Click **Add Domain** again
9. Enter: `www.garrisonledger.com`
10. Click **Add**
11. Select "Redirect to garrisonledger.com"
12. **Don't remove `app.familymedia.com` yet** (keep as backup)

**Verify:** Visit `https://garrisonledger.com` - should show SSL padlock

---

### STEP 3: Environment Variables (5 minutes)

**In Vercel Dashboard:**

1. Settings → **Environment Variables**
2. Find `NEXT_PUBLIC_SITE_URL`:
   - Click **Edit**
   - Change value to: `https://garrisonledger.com`
   - Apply to: **All** (Production, Preview, Development)
3. Find `NEXT_PUBLIC_APP_URL`:
   - Click **Edit**
   - Change value to: `https://garrisonledger.com`
   - Apply to: **All**
4. Click **Redeploy** (or push a small change to trigger deployment)

**Locally (for development):**

Create/update `.env.local`:
```bash
NEXT_PUBLIC_SITE_URL=https://garrisonledger.com
NEXT_PUBLIC_APP_URL=https://garrisonledger.com
```

---

### STEP 4: Clerk Authentication (10 minutes)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Click **Configure** → **Domains & URLs**
4. **Allowed origins** section:
   - Click **Add domain**
   - Add: `https://garrisonledger.com`
   - Add: `https://www.garrisonledger.com`
5. **Home URL:** Update to `https://garrisonledger.com`
6. **Sign-in URL:** Update to `https://garrisonledger.com/sign-in`
7. **Sign-up URL:** Update to `https://garrisonledger.com/sign-up`
8. **After sign-out URL:** Update to `https://garrisonledger.com`
9. Save changes
10. **Don't remove old domain yet** (test first)

---

### STEP 5: Stripe Webhooks (15 minutes)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** → **Webhooks**
3. Click **Add endpoint**
4. **Endpoint URL:** `https://garrisonledger.com/api/webhooks/stripe`
5. **Events to send:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **Add endpoint**
7. **Copy the Signing Secret** (starts with `whsec_`)
8. Go back to **Vercel** → **Environment Variables**
9. Find `STRIPE_WEBHOOK_SECRET`:
   - Click **Edit**
   - Paste new secret
   - Apply to: **Production** (only production for now)
10. Redeploy
11. **Test webhook:** Use Stripe CLI or make test purchase
12. After success, disable old webhook

---

### STEP 6: Supabase (5 minutes)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Authentication** → **URL Configuration**
4. **Site URL:** Change to `https://garrisonledger.com`
5. **Redirect URLs:** Add:
   - `https://garrisonledger.com/**`
   - `https://www.garrisonledger.com/**`
6. Click **Save**
7. **Don't remove old URLs yet** (test first)

---

### STEP 7: Google Cloud Console APIs (15 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Click **APIs & Services** → **Credentials**

**For each API key (Weather, Places, Gemini):**

4. Click the API key name
5. Scroll to **Application restrictions**
6. Under **HTTP referrers (web sites):**
   - Add: `https://garrisonledger.com/*`
   - Add: `https://www.garrisonledger.com/*`
7. Click **Save**
8. Repeat for all 3 API keys
9. **Don't remove old URLs yet** (test first)

---

### STEP 8: Testing (30-60 minutes)

**Critical Tests:**

- [ ] **Homepage:** `https://garrisonledger.com` loads
- [ ] **Sign Up:** Create new test account
- [ ] **Sign In:** Log in with test account
- [ ] **Dashboard:** Protected route works
- [ ] **LES Auditor:** Premium tool works
- [ ] **Base Navigator:** Google APIs work (Places, Weather)
- [ ] **AI Plan:** Gemini API works
- [ ] **Stripe Checkout:** Start subscription flow
- [ ] **Webhook:** Check Stripe dashboard for webhook received
- [ ] **Email:** Trigger welcome email, check links
- [ ] **Mobile:** Test on phone (responsive, touch)

**If ANY test fails:**
- Check browser console for errors
- Check Vercel logs
- Check external service configurations
- Use rollback plan if needed (revert env vars)

---

### STEP 9: Cleanup (After All Tests Pass)

**In Vercel:**
- Remove `app.familymedia.com` from domains (or keep as redirect)

**In Clerk:**
- Remove `https://app.familymedia.com` from allowed origins

**In Stripe:**
- Disable old webhook endpoint

**In Supabase:**
- Remove old redirect URLs

**In Google Cloud:**
- Remove old domain from API restrictions

---

## 🚨 ROLLBACK (If Something Goes Wrong)

1. In Vercel Environment Variables:
   - Change `NEXT_PUBLIC_SITE_URL` back to `https://app.familymedia.com`
   - Change `NEXT_PUBLIC_APP_URL` back to `https://app.familymedia.com`
2. Trigger redeploy (push small commit)
3. Debug new domain separately
4. Switch back when ready

**Risk:** LOW (only test accounts exist)

---

## 📋 CHECKLIST

### Pre-Migration
- [x] Code updated ✅
- [x] Documentation created ✅

### DNS & Hosting
- [ ] Cloudflare DNS records added
- [ ] Vercel domain added
- [ ] SSL certificate active
- [ ] Environment variables updated

### External Services
- [ ] Clerk allowed origins updated
- [ ] Stripe webhook created
- [ ] Supabase URLs updated
- [ ] Google APIs updated

### Testing
- [ ] All critical flows tested
- [ ] Mobile testing complete

### Cleanup
- [ ] Old domain removed/redirected
- [ ] Old webhooks disabled
- [ ] Documentation updated

---

## 📚 RESOURCES

- **Full Documentation:** [`docs/DOMAIN_MIGRATION_2025-10-23.md`](DOMAIN_MIGRATION_2025-10-23.md)
- **System Status:** [`SYSTEM_STATUS.md`](../SYSTEM_STATUS.md)
- **Changelog:** [`CHANGELOG.md`](../CHANGELOG.md)

---

## ✅ SUCCESS CRITERIA

Migration complete when:
- New domain loads with SSL
- Authentication works (Clerk)
- Payments work (Stripe)
- APIs work (Google)
- All tests pass
- Mobile works
- Documentation updated

---

**Estimated Time:** 2-3 hours  
**Difficulty:** Medium (mostly configuration)  
**Risk:** Low (no real users)

**Questions?** Review the full migration doc or check logs in:
- Vercel Logs
- Stripe Webhooks
- Browser Console
- Supabase Logs


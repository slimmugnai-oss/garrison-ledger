# Domain Migration: app.familymedia.com → garrisonledger.com

**Date:** October 23, 2025  
**Status:** 🟡 In Progress (Code Complete, External Services Pending)  
**Migration Type:** Clean Cutover (No User Impact)

---

## EXECUTIVE SUMMARY

Garrison Ledger is migrating from `app.familymedia.com` to `garrisonledger.com` to establish a professional, military-focused brand identity before user acquisition begins.

### Key Facts

- **Old Domain:** `app.familymedia.com`
- **New Domain:** `garrisonledger.com` (purchased via Cloudflare Registrar)
- **Impact:** No real users affected (only test accounts)
- **Approach:** Clean cutover with 301 redirects
- **Timeline:** 2-3 hours total

---

## CODE CHANGES COMPLETED ✅

### 1. Core Configuration Files

**`lib/seo-config.ts`**
```typescript
// OLD: export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://app.familymedia.com";
// NEW:
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://garrisonledger.com";

// OLD: email: "support@familymedia.com"
// NEW:
email: "support@garrisonledger.com"
```

**`lib/email-templates.tsx`**
```typescript
// OLD: const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.familymedia.com';
// NEW:
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://garrisonledger.com';
```

### 2. Email Templates Updated

All email templates now default to `garrisonledger.com`:

- ✅ `emails/WeeklyDigest.tsx`
- ✅ `emails/PCSChecklist.tsx`
- ✅ `emails/OnboardingWelcome.tsx`
- ✅ `emails/OnboardingFeatures.tsx`
- ✅ `emails/OnboardingPremium.tsx`

---

## MANUAL STEPS REQUIRED 🔧

### 1. Cloudflare DNS Configuration

**Action Required:** Configure DNS records pointing to Vercel

```
Type: CNAME, Name: @, Content: cname.vercel-dns.com, Proxy: OFF (DNS only)
Type: CNAME, Name: www, Content: cname.vercel-dns.com, Proxy: OFF (DNS only)
```

**Verification:**
```bash
dig garrisonledger.com
dig www.garrisonledger.com
```

**Status:** ⏳ Pending user action

---

### 2. Vercel Domain Configuration

**Action Required:** Add domain in Vercel project settings

1. Go to: Vercel Dashboard → garrison-ledger → Settings → Domains
2. Add `garrisonledger.com` (primary domain)
3. Add `www.garrisonledger.com` (redirect to primary)
4. Wait for SSL certificate provisioning (~5 minutes)
5. After testing, remove `app.familymedia.com`

**Status:** ⏳ Pending user action

---

### 3. Environment Variables Update

**Action Required:** Update in Vercel Dashboard

Navigate to: Vercel Dashboard → Settings → Environment Variables

**Update these for ALL environments (Production, Preview, Development):**

```bash
NEXT_PUBLIC_SITE_URL=https://garrisonledger.com
NEXT_PUBLIC_APP_URL=https://garrisonledger.com
```

**Local Development:**
Create/update `.env.local`:
```bash
NEXT_PUBLIC_SITE_URL=https://garrisonledger.com
NEXT_PUBLIC_APP_URL=https://garrisonledger.com
```

**Status:** ⏳ Pending user action

---

### 4. External Service Updates

#### A. Clerk (Authentication)

**Location:** [Clerk Dashboard](https://dashboard.clerk.com) → Configure → Domains & URLs

**Action Required:**
1. Add `https://garrisonledger.com` to allowed origins
2. Add `https://www.garrisonledger.com` to allowed origins
3. Update OAuth redirect URLs
4. After testing, remove `app.familymedia.com`

**Status:** ⏳ Pending user action

---

#### B. Stripe (Payments)

**Location:** [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks

**Action Required:**
1. Create new webhook endpoint: `https://garrisonledger.com/api/webhooks/stripe`
2. Select events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
3. Copy new webhook signing secret
4. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables
5. After testing, disable old webhook

**Status:** ⏳ Pending user action

---

#### C. Supabase (Database)

**Location:** [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → URL Configuration

**Action Required:**
1. Update Site URL: `https://garrisonledger.com`
2. Add redirect URLs:
   - `https://garrisonledger.com/**`
   - `https://www.garrisonledger.com/**`
3. After testing, remove old domain redirects

**Status:** ⏳ Pending user action

---

#### D. Google Cloud Console (APIs)

**Location:** [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials

**APIs affected:**
- Weather API
- Places API
- Gemini API (Generative AI)

**Action Required:**
1. Select each API credential
2. Add authorized JavaScript origins:
   - `https://garrisonledger.com`
   - `https://www.garrisonledger.com`
3. After testing, remove old domain

**Status:** ⏳ Pending user action

---

#### E. Resend (Email Service)

**Location:** [Resend Dashboard](https://resend.com/domains)

**Action Required:**
1. Verify sending domain configuration (if custom domain is used)
2. Update any hardcoded domain references (already handled in code)
3. Test email delivery from new domain

**Status:** ⏳ Pending user action (verify only)

---

#### F. Vercel Cron Jobs

**Action Required:** No changes needed

Cron jobs are defined in `vercel.json` using relative paths, so they'll automatically work with the new domain.

**Status:** ✅ No action required

---

## TESTING CHECKLIST

### Before Going Live
- [ ] DNS records propagated (5-10 minutes)
- [ ] SSL certificate active on Vercel
- [ ] All environment variables updated

### Core Functionality Tests
- [ ] Homepage loads: `https://garrisonledger.com`
- [ ] Sign up new account (Clerk)
- [ ] Sign in existing account (Clerk)
- [ ] Dashboard loads with authentication
- [ ] Profile page accessible
- [ ] LES Auditor works
- [ ] Base Navigator loads (Google Places API)
- [ ] Weather data displays (Google Weather API)
- [ ] AI plan generation works (Gemini API)
- [ ] Stripe checkout flow (create test subscription)
- [ ] Webhook received (check Stripe dashboard)
- [ ] Email links point to new domain
- [ ] Cron jobs execute (check Vercel logs)

### Mobile Testing
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Responsive design
- [ ] Touch interactions

---

## POST-MIGRATION TASKS

### Database Cleanup (Optional)

Since clean cutover with no real users:

```sql
-- Delete test user data (optional)
-- Run from Supabase SQL Editor
DELETE FROM users WHERE email IN ('joemugnai@mac.com', 'slimmugnai@gmail.com', 'data@protonmail.com');
DELETE FROM subscriptions WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM user_assessments WHERE user_id NOT IN (SELECT id FROM users);
```

### SEO & Analytics Updates

**Google Search Console:**
1. Add new property: `https://garrisonledger.com`
2. Verify ownership via DNS TXT record or HTML file
3. Submit updated sitemap: `https://garrisonledger.com/sitemap.xml`
4. After migration, use Change of Address tool to migrate from old domain

**Google Analytics (if configured):**
1. Update property settings with new domain
2. Update tracking code if necessary
3. Create annotation marking domain migration

**Social Media (when active):**
- Update bio links
- Update pinned posts
- Update social media meta tags (already handled in `lib/seo-config.ts`)

### Documentation Updates

- [x] Update `lib/seo-config.ts` ✅
- [x] Update `lib/email-templates.tsx` ✅
- [x] Update all email templates ✅
- [x] Create migration documentation ✅
- [ ] Update `SYSTEM_STATUS.md` with new domain
- [ ] Update `README.md` contact section
- [ ] Update `CHANGELOG.md` with migration entry
- [ ] Archive old domain references in docs

---

## OLD DOMAIN HANDLING

### Recommended: Keep & Redirect (Option A)

**Pros:**
- Preserves any external links
- Zero cost (Vercel handles redirects)
- Graceful transition for any missed references

**Implementation:**
1. Keep `app.familymedia.com` in Vercel domains
2. Configure as redirect in Vercel settings (automatically redirects to primary)
3. No code changes needed

**Cons:**
- Old domain remains associated with project

### Alternative: Remove Completely (Option B)

**Pros:**
- Clean separation from old brand
- Simpler mental model

**Cons:**
- Any external links break (acceptable since no real users)
- No fallback if references missed

**Implementation:**
1. Remove `app.familymedia.com` from Vercel domains
2. Old links will 404

**Decision:** Recommend Option A (Keep & Redirect) for safety

---

## ROLLBACK PLAN

If critical issues arise:

1. **Keep old domain active in Vercel** (don't remove yet)
2. **Revert environment variables** to `app.familymedia.com`
3. **Trigger new deployment** (push small commit)
4. **Debug new domain** issues separately
5. **Switch back** when ready

**Risk Level:** LOW (only test accounts exist)

---

## FILES CHANGED

### Core Files
- `lib/seo-config.ts` - URL and contact email
- `lib/email-templates.tsx` - Base URL

### Email Templates
- `emails/WeeklyDigest.tsx`
- `emails/PCSChecklist.tsx`
- `emails/OnboardingWelcome.tsx`
- `emails/OnboardingFeatures.tsx`
- `emails/OnboardingPremium.tsx`

### Documentation
- `docs/DOMAIN_MIGRATION_2025-10-23.md` (this file)

### To Update
- `SYSTEM_STATUS.md` - Domain references
- `README.md` - Contact section
- `CHANGELOG.md` - Migration entry

---

## TIMELINE ESTIMATE

| Task | Time | Responsible |
|------|------|-------------|
| Code changes | ✅ Complete | AI Agent |
| DNS setup | 5-10 min | User |
| Vercel configuration | 10 min | User |
| External service updates | 30-45 min | User |
| Environment variables | 5 min | User |
| Testing | 30-60 min | User |
| Documentation updates | 20 min | AI Agent |

**Total:** 2-3 hours

---

## SUCCESS CRITERIA

Migration is complete when:

- ✅ Code updated and deployed
- ⏳ DNS propagated and SSL active
- ⏳ All external services updated
- ⏳ All core functionality tests pass
- ⏳ Mobile testing complete
- ⏳ Documentation updated
- ⏳ Old domain redirects working (if keeping)

---

## NOTES

### Why Now?

- **Perfect timing:** Before user acquisition begins
- **Clean slate:** Only test accounts exist
- **Brand identity:** Professional military-focused domain
- **SEO benefit:** Better for military audience search queries

### Domain Choice

**garrisonledger.com** is excellent because:
- Professional and trustworthy
- Military-specific ("garrison")
- Clear value proposition ("ledger" = financial tracking)
- Memorable and easy to spell
- .com TLD (best for US military audience)

### Cost Analysis

- **Domain registration:** ~$10-15/year (Cloudflare at-cost pricing)
- **Migration labor:** ~3 hours
- **Risk:** Minimal (no real users affected)
- **Benefit:** Professional brand identity before launch

---

## CONTACT

For questions about this migration:
- Review this document
- Check `SYSTEM_STATUS.md` for current state
- Review `.cursorrules` for development guidelines

---

**Migration initiated:** October 23, 2025  
**Code changes completed:** October 23, 2025  
**Expected completion:** October 23, 2025  
**Status:** 🟡 In Progress


# Domain Setup Guide - app.familymedia.com

**Status:** Ready for implementation  
**Target Domain:** app.familymedia.com  
**Current:** garrison-ledger.vercel.app  

---

## 📋 Setup Checklist

### **1. DNS Configuration (Danny's Task)**

**Primary subdomain:**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: Auto
```

**Optional marketing subdomain:**
```
Type: CNAME
Name: ledger
Value: cname.vercel-dns.com
TTL: Auto
```

---

### **2. Vercel Configuration (Your Task)**

**Add Custom Domain:**
1. Go to Vercel Dashboard → garrison-ledger project
2. Settings → Domains
3. Add: `app.familymedia.com`
4. (Optional) Add: `ledger.familymedia.com`
5. Vercel will verify DNS and issue SSL

**Redirect Configuration:**
Already handled in code (see `vercel.json`)

---

### **3. Environment Variables (Already Set)**

Update in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SITE_URL=https://app.familymedia.com
```

Redeploy after changing.

---

### **4. Service Allowlists**

**Clerk:**
1. Clerk Dashboard → Configure → Paths
2. Add to allowed origins: `https://app.familymedia.com`

**Stripe:**
1. Stripe Dashboard → Settings → Checkout settings
2. Update return URLs to use `app.familymedia.com`
3. Billing Portal settings → Use `app.familymedia.com` as return URL

**Supabase:**
1. Supabase Dashboard → Settings → API
2. Add to allowed origins: `https://app.familymedia.com`

---

### **5. Main Site Integration (Danny's Task)**

**Header Navigation:**
Add "Garrison Ledger" menu item with dropdown:
- Overview → https://familymedia.com/garrison-ledger
- Launch App → https://app.familymedia.com/
- Pricing → https://app.familymedia.com/dashboard/upgrade
- Sign In → https://app.familymedia.com/sign-in

**Footer:**
Under "Products" section:
- Garrison Ledger → https://familymedia.com/garrison-ledger

**Marketing Page (/garrison-ledger):**
Create page with:
- Product overview
- Key features
- Pricing summary
- CTAs to: https://app.familymedia.com/ with UTMs

**Toolkit CTAs (5 hub pages):**
Add sidebar/inline CTAs:
- PCS Hub → https://app.familymedia.com/dashboard/tools/house-hacking?utm_source=pcs_hub&utm_medium=cta
- Career Hub → https://app.familymedia.com/dashboard/assessment?utm_source=career_hub&utm_medium=cta
- Deployment → https://app.familymedia.com/dashboard/tools/sdp-strategist?utm_source=deployment_hub&utm_medium=cta
- Finance/Shopping → https://app.familymedia.com/dashboard/tools/tsp-modeler?utm_source=finance_hub&utm_medium=cta

---

### **6. App-Side Code Changes (Completed)**

✅ Header updated with Resources dropdown  
✅ Footer links back to main site  
✅ Redirects configured  
✅ Production robots.txt  
✅ Sitemap.xml  

---

## 📧 Email to Danny

**Subject:** Garrison Ledger Launch - DNS & Navigation Setup Needed

Hi Danny,

We're launching our paid app (Garrison Ledger) on a subdomain. Could you please handle these items?

**1. DNS (High Priority)**
Create CNAME record:
- Name: `app`
- Points to: `cname.vercel-dns.com`
- This creates: app.familymedia.com

**2. Main Site Navigation**
Add header menu item: "Garrison Ledger" 
- Links to: `/garrison-ledger` (marketing page you'll create)
- Or temporarily to: `https://app.familymedia.com/`

**3. Marketing Page (if time permits)**
Create `/garrison-ledger` page with:
- Product overview
- Link to app: https://app.familymedia.com/
- Sign up CTA: https://app.familymedia.com/sign-up

**4. Toolkit Integration (optional for v1)**
Add sidebar CTA on the 5 toolkit pages:
- "Try this in Garrison Ledger" → links to relevant app tool

**Timeline:** DNS ASAP (so we can verify), navigation by [target date], marketing page when possible.

Let me know if you need anything!

Thanks,
[Your name]

---

## ✅ Verification Steps (After DNS Propagates)

1. [ ] Visit https://app.familymedia.com/ (should show homepage)
2. [ ] SSL certificate valid (green lock)
3. [ ] Sign in works
4. [ ] Stripe checkout redirects work
5. [ ] Billing portal returns to app.familymedia.com
6. [ ] Cross-domain tracking works (if using GA)
7. [ ] Main site links to app work
8. [ ] App links back to main site toolkits work

---

**Once DNS is set up, the app will be live at app.familymedia.com!**


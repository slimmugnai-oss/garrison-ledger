# 📧 **GARRISON LEDGER LAUNCH - VERCEL CONFIG FOR DANNY**

**Simple, clean approach: One redirect for the app + existing toolkit redirects**

---

## **EMAIL TO DANNY:**

```
Subject: Add Garrison Ledger to Main Site Nav - One Redirect Needed

Hi Danny,

I've built Garrison Ledger (premium financial planning app for military families) and it's ready to launch. I'd like to add it to the main site navigation.

WHAT I NEED:

1. Add "Garrison Ledger" link to your main navigation menu pointing to:
   https://familymedia.com/garrison-ledger

2. Add this ONE redirect to familymedia.com's vercel.json:

```json
{
  "redirects": [
    {
      "source": "/garrison-ledger",
      "destination": "https://app.familymedia.com",
      "permanent": true
    },
    {
      "source": "/pcs-hub",
      "destination": "https://app.familymedia.com/pcs-hub",
      "permanent": true
    },
    {
      "source": "/career-hub",
      "destination": "https://app.familymedia.com/career-hub",
      "permanent": true
    },
    {
      "source": "/deployment",
      "destination": "https://app.familymedia.com/deployment",
      "permanent": true
    },
    {
      "source": "/on-base-shopping",
      "destination": "https://app.familymedia.com/on-base-shopping",
      "permanent": true
    },
    {
      "source": "/base-guides",
      "destination": "https://app.familymedia.com/base-guides",
      "permanent": true
    }
  ]
}
```

HOW IT WORKS:

Users click "Garrison Ledger" in your nav → familymedia.com/garrison-ledger → 301 redirects to app.familymedia.com → they see the full app homepage with sign up CTAs, dashboard, assessment, etc.

BENEFITS:
✅ Simple - just one redirect for the whole app
✅ Clean branding - "Garrison Ledger" as the product name
✅ User-friendly - they land on the app homepage with full navigation
✅ SEO-smart - 301 redirect passes full SEO value

NAV PLACEMENT:
Suggest adding "Garrison Ledger" in your main nav near the other resource links (PCS Hub, Career Hub, etc.) since it's a premium tool built on top of those resources.

TIMELINE:
Whenever you have 15 minutes this week works great!

Thanks!
```

---

## **WHY THIS IS THE SMART APPROACH:**

### **Simple > Complex:**
❌ **Old idea**: Redirect every app path (/dashboard, /assessment, /tools, etc.)  
✅ **New idea**: One redirect to your homepage, users use YOUR navigation  

### **For Users:**
✅ Click "Garrison Ledger" in main site nav  
✅ Land on your beautiful homepage at `app.familymedia.com`  
✅ See clear CTAs and navigate through YOUR header  
✅ Natural, seamless experience  

### **For SEO:**
✅ 301 redirect passes 95% of SEO value to your homepage  
✅ Google recognizes as permanent within 2-4 weeks  
✅ Your homepage becomes the main entry point (as it should be)  
✅ DA 21 main domain authority helps your subdomain  

### **For You:**
✅ Just ONE redirect to manage (vs. 5+)  
✅ Full control of user navigation from your homepage  
✅ Simpler coordination with Danny  
✅ Cleaner branding ("Garrison Ledger" as product)  

---

## **📊 SEO TIMELINE:**

**Week 1-2:**
- Google sees 301 redirects
- Minor traffic fluctuation (~10%)
- Both old and new URLs temporarily indexed

**Week 3-4:**
- Google consolidates to new URLs
- Traffic recovers to 90-95%
- SEO value transferring

**Month 2-3:**
- Full SEO value transferred (95%+)
- New URLs fully established
- Rankings stable or improved

**Month 6+:**
- Subdomain building independent authority
- Traffic exceeds original (better UX, CTAs)
- Best of both domains' authority

---

## **🎯 THE COMPLETE PICTURE:**

**For Main Site Nav, Danny adds:**
- "Garrison Ledger" → `https://familymedia.com/garrison-ledger`

**This creates a clean hierarchy:**
```
familymedia.com (main site)
├── Articles & Blog
├── PCS Hub → redirects to app.familymedia.com/pcs-hub
├── Career Hub → redirects to app.familymedia.com/career-hub  
├── Deployment Guide → redirects to app.familymedia.com/deployment
├── Base Guides → redirects to app.familymedia.com/base-guides
├── On-Base Shopping → redirects to app.familymedia.com/on-base-shopping
└── Garrison Ledger → redirects to app.familymedia.com (homepage)
```

**Users land on your homepage and see:**
- Hero section explaining Garrison Ledger
- Sign up / Dashboard CTAs
- YOUR navigation with Assessment, Tools, Library, etc.

**Advantages:**
1. **Simplicity** - One redirect instead of 5+
2. **Branding** - "Garrison Ledger" is clear product name
3. **Control** - You own the entire user journey after the redirect
4. **SEO** - Main domain authority helps your homepage rank

---

**Ready to send this to Danny?** The email is written and ready to go! 🚀


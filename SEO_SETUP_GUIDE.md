# 🚀 Garrison Ledger SEO Setup Guide

**Complete guide for search engine optimization, analytics, and indexing.**

---

## ✅ **ALREADY IMPLEMENTED**

The following SEO optimizations are now live in your codebase:

### **1. Technical SEO**
- ✅ Comprehensive meta tags (title, description, keywords)
- ✅ Open Graph tags for social sharing
- ✅ Twitter Card tags
- ✅ Canonical URLs for all pages
- ✅ Structured data (JSON-LD Schema.org)
  - Organization schema
  - SoftwareApplication schema
- ✅ Dynamic sitemap (`/sitemap.xml`)
- ✅ Robots.txt (`/robots.txt`)
- ✅ Mobile-responsive design
- ✅ Fast page load times (Next.js optimization)

### **2. Page-Specific Optimization**
Every major page now has optimized:
- Homepage (`/`)
- Dashboard (`/dashboard`)
- Plan Page (`/dashboard/plan`)
- TSP Modeler (`/dashboard/tools/tsp-modeler`)
- SDP Strategist (`/dashboard/tools/sdp-strategist`)
- House Hacking Calculator (`/dashboard/tools/house-hacking`)
- Upgrade Page (`/dashboard/upgrade`)

---

## 🔧 **IMMEDIATE NEXT STEPS**

### **Step 1: Update Environment Variable (When Danny's Redirects Go Live)**

**Current:** `NEXT_PUBLIC_SITE_URL=https://app.familymedia.com`

**When redirects are live, update to:**
```bash
NEXT_PUBLIC_SITE_URL=https://familymedia.com
```

**Where to update:**
- Vercel Dashboard → Settings → Environment Variables
- Update for Production, Preview, and Development
- Redeploy after changing

---

### **Step 2: Google Search Console Setup**

#### **A. Add Property**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **"Add Property"**
3. Choose **"URL prefix"**
4. Enter: `https://app.familymedia.com` (or `https://familymedia.com` when Danny's redirects go live)
5. Click **"Continue"**

#### **B. Verify Ownership**
**Method 1: HTML Tag (Easiest)**
1. Google will give you a meta tag like: `<meta name="google-site-verification" content="ABC123..." />`
2. Open `/Users/slim/Library/Mobile Documents/com~apple~CloudDocs/Cursor/Cursor Files/garrison-ledger/lib/seo-config.ts`
3. Find the line: `google: "", // Add your Google verification code`
4. Replace with: `google: "ABC123...",`
5. Deploy to Vercel
6. Return to Google Search Console and click **"Verify"**

**Method 2: DNS TXT Record**
1. Add a TXT record to your domain's DNS:
   - Name: `@`
   - Value: (provided by Google)
2. Wait for DNS propagation
3. Click **"Verify"** in Google Search Console

#### **C. Submit Sitemap**
1. In Google Search Console, go to **Sitemaps** (left sidebar)
2. Enter: `sitemap.xml`
3. Click **"Submit"**
4. Google will start crawling your pages within 24-48 hours

#### **D. Request Indexing for Key Pages**
1. Go to **URL Inspection** tool (left sidebar)
2. Enter each of these URLs:
   - `https://app.familymedia.com/`
   - `https://app.familymedia.com/dashboard`
   - `https://app.familymedia.com/dashboard/tools/tsp-modeler`
   - `https://app.familymedia.com/dashboard/tools/sdp-strategist`
   - `https://app.familymedia.com/dashboard/tools/house-hacking`
3. Click **"Request Indexing"** for each
4. Google will prioritize crawling these pages

---

### **Step 3: Bing Webmaster Tools (Optional but Recommended)**

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. **Import from Google Search Console** (easiest method)
   - Click **"Import"**
   - Sign in with the same Google account
   - Bing will automatically copy your sitemap and settings
3. If importing doesn't work:
   - Add site manually: `https://app.familymedia.com`
   - Verify via HTML meta tag (same process as Google)
   - Submit sitemap

---

### **Step 4: Google Analytics 4 Setup**

#### **A. Create GA4 Property**
1. Go to [Google Analytics](https://analytics.google.com)
2. Click **Admin** → **Create Property**
3. Name: `Garrison Ledger`
4. Set timezone and currency (US Eastern, USD)
5. Click **"Next"** → Select "Saas" category
6. Complete setup

#### **B. Create Data Stream**
1. Select **"Web"** platform
2. Enter website URL: `https://app.familymedia.com`
3. Name the stream: `Garrison Ledger Production`
4. Click **"Create stream"**
5. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

#### **C. Add GA4 to Your App**
1. Install Next.js Google Analytics package:
   ```bash
   npm install @next/third-parties
   ```

2. Open `/Users/slim/Library/Mobile Documents/com~apple~CloudDocs/Cursor/Cursor Files/garrison-ledger/app/layout.tsx`

3. Add Google Analytics (replace `G-XXXXXXXXXX` with your actual ID):
   ```typescript
   import { GoogleAnalytics } from '@next/third-parties/google'
   
   export default function RootLayout({ children }) {
     return (
       <ClerkProvider>
         <html lang="en">
           <head>
             {/* existing schema scripts */}
           </head>
           <body>
             {children}
             <GoogleAnalytics gaId="G-XXXXXXXXXX" />
           </body>
         </html>
       </ClerkProvider>
     );
   }
   ```

4. Deploy to Vercel

#### **D. Set Up Key Events**
In GA4, create these custom events:
- `assessment_started`
- `assessment_completed`
- `plan_generated`
- `tool_opened` (with parameter: tool_name)
- `upgrade_clicked`
- `subscription_completed`

---

### **Step 5: Create Social Sharing Images**

**You need two images:**

#### **1. Open Graph Image** (`/public/og-image.png`)
- **Size:** 1200 × 630 pixels
- **Format:** PNG or JPG
- **Content:** 
  - "Garrison Ledger" title
  - "Financial Intelligence for Military Families" tagline
  - Simple, high-contrast design
  - Avoid small text (won't be readable when shrunk)

#### **2. App Screenshot** (`/public/screenshot.png`)
- **Size:** 1280 × 720 pixels or larger
- **Format:** PNG
- **Content:** Screenshot of your TSP Modeler or Dashboard
- Used in Schema.org markup

**Tools to create these:**
- Canva (free templates)
- Figma
- Photoshop
- or use a screenshot tool + basic editing

**Where to save:**
Upload to `/public/` folder in your project, then deploy.

---

### **Step 6: Cross-Domain Tracking (When Danny's Site Links to You)**

**If you want to track user journeys from `familymedia.com` → `app.familymedia.com`:**

1. In GA4 Admin → Data Streams → Your stream → Configure tag settings
2. Click **"Configure your domains"**
3. Add both domains:
   - `familymedia.com`
   - `app.familymedia.com`
4. Save

**In your app's links back to main site:**
```tsx
<Link href="https://familymedia.com/toolkit?ref=app">Toolkits</Link>
```

---

## 📊 **MONITORING & OPTIMIZATION**

### **Week 1-2: Monitor Indexing**
- Check Google Search Console → Coverage report
- Ensure all submitted pages are indexed
- Fix any errors (rare with current setup)

### **Week 3-4: Analyze Search Queries**
- Google Search Console → Performance
- See what keywords people are using to find you
- Identify opportunities for new content

### **Month 2+: Optimize Based on Data**
- Use GA4 to see which tools are most popular
- Update meta descriptions for underperforming pages
- Create blog/guide content around top search queries

---

## 🔍 **TESTING CHECKLIST**

### **Before Launch:**
- [ ] Visit `https://app.familymedia.com/sitemap.xml` → should show all pages
- [ ] Visit `https://app.familymedia.com/robots.txt` → should show rules
- [ ] Test a page in [Google Rich Results Test](https://search.google.com/test/rich-results)
  - Enter: `https://app.familymedia.com/`
  - Should show valid SoftwareApplication schema
- [ ] Test social sharing:
  - Share homepage link on Twitter/Facebook
  - Should show correct image, title, description
- [ ] Run [Lighthouse audit](https://pagespeed.web.dev/)
  - Target: SEO score ≥ 90
  - Performance ≥ 80
  - Accessibility ≥ 90

### **After Launch:**
- [ ] Google Search Console shows no errors
- [ ] At least 5-10 pages indexed within 1 week
- [ ] GA4 shows traffic and events
- [ ] Social shares show correct OG image

---

## 🎯 **OPTIONAL ADVANCED OPTIMIZATIONS**

### **1. Add FAQ Schema to Key Pages**
For pages with common questions (like tools), add FAQ schema:
```typescript
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the TSP?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Thrift Savings Plan..."
      }
    }
  ]
};
```

### **2. Set Up Conversion Tracking in GA4**
- Track when users complete assessment
- Track when users upgrade to premium
- Set monetary value for conversions

### **3. Create Video Content**
- Tool walkthroughs on YouTube
- Embed on tool pages
- Add VideoObject schema

### **4. Build Backlinks**
- List Garrison Ledger on military resource directories
- Guest post on military finance blogs
- Partner with military spouse influencers

---

## 🆘 **TROUBLESHOOTING**

### **"My pages aren't showing up in Google"**
- **Wait 3-7 days** after submitting sitemap
- Use URL Inspection tool to manually request indexing
- Check Google Search Console for errors

### **"Sitemap.xml returns 404"**
- Ensure `app/sitemap.ts` exists
- Redeploy to Vercel
- Clear browser cache

### **"Schema validation errors"**
- Test at https://validator.schema.org/
- Common fix: ensure all required fields are present
- Check `lib/seo-config.ts` for typos

### **"Social sharing shows wrong image"**
- Clear social media cache:
  - Facebook: https://developers.facebook.com/tools/debug/
  - Twitter: Tweet the link, delete tweet, share again
- Ensure `/public/og-image.png` exists and is correct size

---

## 📚 **RESOURCES**

- [Google Search Console Help](https://support.google.com/webmasters/)
- [Schema.org Documentation](https://schema.org/)
- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Ahrefs SEO Guide](https://ahrefs.com/blog/seo-basics/)

---

## ✅ **FINAL CHECKLIST**

**Before considering SEO "done":**
- [ ] Google Search Console verified
- [ ] Sitemap submitted
- [ ] 10+ pages indexed
- [ ] GA4 tracking active
- [ ] OG images created and uploaded
- [ ] Lighthouse SEO score ≥ 90
- [ ] All tools have unique, optimized titles/descriptions
- [ ] Schema.org markup validates with no errors

---

**🎉 You're ready to dominate military finance search results!**

Need help with any step? Reference this guide or check the specific tool's documentation.


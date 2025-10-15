# 📧 **INSTRUCTIONS FOR DANNY - HUB PAGE REDIRECTS**

**Send this to Danny once all hub pages are tested and live on app.familymedia.com**

---

## **EMAIL TO DANNY:**

```
Subject: Hub Pages Migration - Need 5 Redirects Added

Hi Danny,

We've migrated the 5 toolkit hub pages to app.familymedia.com for better integration with our premium tools and faster content updates.

Can you please add these 5 permanent redirects to familymedia.com?

If your site uses vercel.json, add this to the redirects array:

{
  "redirects": [
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

These are 301 (permanent) redirects, so:
✅ Google will pass SEO value to the new locations within 2-4 weeks
✅ Users visiting old URLs will automatically go to the new pages
✅ All existing backlinks will continue to work

Timeline: Whenever you have 15 minutes in the next week works great.

Thanks!
```

---

## **BEFORE SENDING TO DANNY:**

### **1. Test All Pages Locally**
```bash
npm run dev
```

Visit each page:
- http://localhost:3000/pcs-hub
- http://localhost:3000/career-hub
- http://localhost:3000/deployment
- http://localhost:3000/on-base-shopping
- http://localhost:3000/base-guides

**Check:**
- ✅ Page loads correctly
- ✅ Header/footer display properly
- ✅ All images load
- ✅ All links work
- ✅ Mobile responsive

### **2. Deploy to Production**
```bash
git add -A
git commit -m "Add: All 5 hub pages migrated from resource toolkits"
git push
```

Wait for Vercel to deploy (~2 minutes)

### **3. Test Live Pages**
Visit each page on production:
- https://app.familymedia.com/pcs-hub
- https://app.familymedia.com/career-hub
- https://app.familymedia.com/deployment
- https://app.familymedia.com/on-base-shopping
- https://app.familymedia.com/base-guides

**Check:**
- ✅ All pages load
- ✅ No 404 errors
- ✅ CSS styles working
- ✅ Images loading
- ✅ CTAs working

### **4. Submit Updated Sitemap to Google**
1. Go to Google Search Console
2. Sitemaps → Add new sitemap
3. Enter: `app.familymedia.com/sitemap.xml`
4. Submit

### **5. THEN Send Email to Danny**

Once everything is confirmed working, send the email above.

---

## **AFTER DANNY ADDS REDIRECTS:**

### **Week 1-2: Monitor**
- Check Google Search Console for crawl errors
- Monitor traffic in GA4
- Expect minor (~10-15%) traffic dip (temporary)

### **Week 3-4: Recovery**
- Traffic should recover to 85-95%
- Google recognizing redirects
- Rankings stabilizing on new URLs

### **Month 2-3: Full Recovery**
- Traffic back to 100%+
- Rankings stable or improved
- SEO value fully transferred

---

## **SEO CHECKLIST:**

After redirects are live:

- [ ] All 5 old URLs redirect to new URLs (test manually)
- [ ] Redirects are 301 (permanent), not 302 (temporary)
- [ ] Google Search Console shows no errors
- [ ] Sitemap submitted with new URLs
- [ ] Traffic monitoring in GA4
- [ ] Rankings tracked in Google Search Console

---

## **TROUBLESHOOTING:**

**If traffic drops significantly (>30%):**
1. Check redirects are working (visit old URLs)
2. Check Google Search Console for errors
3. Verify sitemap is submitted
4. Request manual indexing for each hub page

**If images don't load:**
1. Check image paths in HTML
2. Ensure images are in `/public/` folder
3. Update image URLs if needed

**If CSS looks broken:**
1. Check for missing Tailwind classes
2. Verify global styles are loading
3. Test in incognito mode (cache issue)

---

## **SUCCESS METRICS:**

**Week 4 goals:**
- ✅ All pages indexed on new URLs
- ✅ Traffic recovered to 90%+
- ✅ Zero crawl errors in Search Console
- ✅ CTA click-through rate: 3-5%

**Month 3 goals:**
- ✅ Traffic exceeds original (better UX)
- ✅ Hub pages driving app conversions
- ✅ Subdomain authority building
- ✅ 50-100 premium conversions from hubs

---

**🎯 You're ready to migrate! Test locally, deploy, test live, then send to Danny.** 🚀


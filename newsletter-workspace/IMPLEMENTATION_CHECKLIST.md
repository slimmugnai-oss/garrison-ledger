# ✅ GARRISON LEDGER NEWSLETTER SPONSORSHIP - IMPLEMENTATION CHECKLIST

**Goal:** Successfully integrate Garrison Ledger as presenting sponsor and giveaway sponsor  
**Timeline:** Complete before next newsletter send  
**Owner:** Joe Mugnai (FamilyMedia) + Garrison Ledger team

---

## 📋 **PHASE 1: ASSET PREPARATION**

### **1.1 Garrison Ledger Logo**
- [ ] **Export logo** in horizontal format (preferred) or stacked format
- [ ] **Dimensions:** At least 400px width for quality
- [ ] **Format:** PNG with transparent background (or white background)
- [ ] **Upload to CDN:**
  - Option A: Upload to Imgur.com
  - Option B: Upload to FamilyMedia CDN
  - Option C: Upload to Garrison Ledger CDN (`garrisonledger.com/newsletter-logo.png`)
- [ ] **Get public URL** (e.g., `https://i.imgur.com/XXXXX.png`)
- [ ] **Test URL** in browser (ensure it loads)

### **1.2 OG Image**
- [ ] **Create OG image** (1200×630px) using specifications in `og-image-specifications.md`
- [ ] **Save as:** `og-image.png`
- [ ] **Optimize:** Ensure file size < 500KB
- [ ] **Upload to Garrison Ledger site:**
  - Path: `public/og-image.png` (replace existing)
  - Commit to Git
  - Deploy to Vercel
- [ ] **Verify meta tags** in `app/layout.tsx`:
  ```typescript
  export const metadata: Metadata = {
    // ...
    openGraph: {
      images: ['/og-image.png'],
    },
    twitter: {
      images: ['/og-image.png'],
    },
  }
  ```
- [ ] **Test with Facebook Debugger:** https://developers.facebook.com/tools/debug/
- [ ] **Test with Twitter Card Validator:** https://cards-dev.twitter.com/validator

---

## 📋 **PHASE 2: NEWSLETTER HTML UPDATES**

### **2.1 Update Presenting Sponsor Block**
- [ ] **Open main newsletter file:** `Military_Financial_Briefing_Sept29_2025.html` (or next issue)
- [ ] **Find Presenting Sponsor section** (currently Nature Made, lines ~164-186)
- [ ] **Replace with Garrison Ledger HTML** from `NEXT_ISSUE_garrison_ledger_sponsor.html`
- [ ] **Update logo URL:**
  - Find: `[GARRISON_LEDGER_LOGO_URL]`
  - Replace with actual URL from step 1.1
- [ ] **Verify UTM parameters** are correct:
  - `utm_source=familymedia`
  - `utm_medium=newsletter`
  - `utm_campaign=202511_presenting_sponsor` (update month/year)
  - `utm_id=sponsor1`

### **2.2 Update Giveaway Section**
- [ ] **Find Giveaway section** (currently General Mills, lines ~377-425)
- [ ] **Replace with Garrison Ledger HTML** from `NEXT_ISSUE_garrison_ledger_sponsor.html`
- [ ] **Update logo URL:**
  - Find: `[GARRISON_LEDGER_LOGO_URL]`
  - Replace with actual URL from step 1.1
- [ ] **Update entry code:**
  - Current: `LEDGER11` (November)
  - Update to match your convention (e.g., `LEDGER12` for December)
- [ ] **Verify UTM parameters** are correct:
  - `utm_source=familymedia`
  - `utm_medium=newsletter`
  - `utm_campaign=202511_giveaway` (update month/year)
  - `utm_id=sponsor2`

### **2.3 Update Preview Text**
- [ ] **Find preview text** (lines ~90-92)
- [ ] **Update to mention Garrison Ledger:**
  - Example: "November's Guide: Essential resources for military families. Plus, enter to win $500 sponsored by Garrison Ledger!"

### **2.4 Update Newsletter Title**
- [ ] **Find title tag** (line ~21)
- [ ] **Update month/year:**
  - Example: "FamilyMedia Guide Newsletter | November 2025"

---

## 📋 **PHASE 3: GIVEAWAY LANDING PAGE UPDATES**

### **3.1 Update Sponsor Copy**
- [ ] **Navigate to FamilyMedia giveaway landing page** (`familymedia.com/500-monthly-giveaway`)
- [ ] **Find General Mills sponsor section**
- [ ] **Replace with Garrison Ledger copy** from `giveaway_landing_page_copy.md`
- [ ] **Add Garrison Ledger logo** (if page displays sponsor logos)
  - Use same URL from step 1.1
  - Ensure consistent sizing with other sponsor logos
- [ ] **Add CTA button:**
  - Text: "Explore Garrison Ledger"
  - Link: `https://garrisonledger.com?utm_source=familymedia&utm_medium=giveaway_page&utm_campaign=202511_landing&utm_id=sponsor3`
  - Style: Match existing sponsor CTA buttons

### **3.2 Update Entry Code**
- [ ] **Update entry code field** to accept `LEDGER11` (or your chosen code)
- [ ] **Test entry code** submission (ensure it validates correctly)

---

## 📋 **PHASE 4: GARRISON LEDGER SITE UPDATES**

### **4.1 Prepare for Newsletter Traffic**
- [ ] **Verify dashboard signup flow** is optimized
  - User clicks newsletter CTA → redirected to dashboard
  - Signup required (Clerk auth)
  - After auth, user sees full dashboard (not 404 or error)
  - Assessment CTA is prominent on dashboard
- [ ] **Test conversion funnel:**
  - Newsletter → Dashboard → Sign up → Assessment → Plan → Upgrade prompt
- [ ] **Verify all Premium features** are gated correctly (PCS Copilot, etc.)

### **4.2 Analytics Setup**
- [ ] **Set up UTM tracking** in Google Analytics or your platform
  - Create campaign: "202511_Newsletter"
  - Track sources: `presenting_sponsor`, `giveaway`, `landing_page`
- [ ] **Create conversion goals:**
  - Goal 1: Newsletter signups (attributed to `utm_source=familymedia`)
  - Goal 2: Assessment completions (newsletter users)
  - Goal 3: Premium upgrades (newsletter users)
- [ ] **Set up dashboard** to monitor:
  - Newsletter referral traffic
  - Conversion rates by source
  - 7-day retention (newsletter signups vs organic)

### **4.3 Email Notifications (Optional)**
- [ ] **Prepare welcome email** for newsletter signups (if different from organic)
  - Subject: "Welcome from FamilyMedia!"
  - Body: Acknowledge newsletter referral, guide to first steps
- [ ] **Set up Resend template** (if using custom email for newsletter signups)

---

## 📋 **PHASE 5: TESTING & QA**

### **5.1 Newsletter Testing**
- [ ] **Send test email** to yourself and team
- [ ] **Verify desktop rendering:**
  - Logo displays correctly
  - Text is readable
  - Buttons are clickable
  - Links go to correct destinations
- [ ] **Verify mobile rendering:**
  - Logo scales properly
  - Text is readable (not too small)
  - Buttons are thumb-friendly
  - No horizontal scrolling
- [ ] **Test in multiple email clients:**
  - Gmail (web + mobile app)
  - Outlook (web + desktop)
  - Apple Mail (Mac + iPhone)
  - Yahoo Mail

### **5.2 Link Testing**
- [ ] **Click all Garrison Ledger links** in newsletter:
  - Presenting Sponsor CTA → Dashboard
  - Giveaway "Visit Sponsor" → Homepage
- [ ] **Verify UTM parameters** are appended correctly (check in browser URL bar)
- [ ] **Test on mobile devices:**
  - iPhone Safari
  - Android Chrome
- [ ] **Verify no 404 errors**

### **5.3 Giveaway Landing Page Testing**
- [ ] **Visit landing page** (`familymedia.com/500-monthly-giveaway`)
- [ ] **Verify Garrison Ledger copy** displays correctly
- [ ] **Test entry code** submission (should accept `LEDGER11`)
- [ ] **Click "Explore Garrison Ledger" button** → verify link works
- [ ] **Test on mobile**

### **5.4 Garrison Ledger Site Testing**
- [ ] **Test dashboard signup flow** (end-to-end)
- [ ] **Verify OG image** appears in social previews:
  - Share Garrison Ledger URL on Facebook (private post)
  - Share on LinkedIn (private post)
  - Share on Twitter (draft tweet)
- [ ] **Test all conversion paths:**
  - Newsletter → Dashboard → Assessment → Plan → Upgrade
  - Newsletter → Homepage → Tools → Upgrade
  - Giveaway Landing → Homepage → Dashboard

---

## 📋 **PHASE 6: PRE-LAUNCH FINAL CHECKS**

### **6.1 Copy Review**
- [ ] **Proofread all Garrison Ledger copy** (spelling, grammar, tone)
- [ ] **Verify military audience alignment:**
  - No AI buzzwords ✅
  - Direct, no-BS messaging ✅
  - Specific dollar savings mentioned ✅
  - Peer credibility emphasized ✅
- [ ] **Verify brand consistency:**
  - Garrison Ledger logo correct ✅
  - Colors match brand guidelines ✅
  - Tone is professional, not salesy ✅

### **6.2 Legal & Compliance**
- [ ] **Verify giveaway rules** (No purchase necessary, 18+, US residents)
- [ ] **Ensure sponsor disclosure** is clear (newsletter + landing page)
- [ ] **Verify privacy policy** mentions FamilyMedia partnership (if needed)

### **6.3 Stakeholder Approval**
- [ ] **Send preview to Joe Mugnai** (FamilyMedia)
- [ ] **Send preview to Garrison Ledger team**
- [ ] **Get final sign-off** from both parties

---

## 📋 **PHASE 7: LAUNCH & MONITORING**

### **7.1 Newsletter Send**
- [ ] **Schedule newsletter send** (FamilyMedia timeline)
- [ ] **Confirm send date/time** with team
- [ ] **Monitor for errors** immediately after send:
  - Broken images
  - Broken links
  - Formatting issues

### **7.2 Real-Time Monitoring (First 24 Hours)**
- [ ] **Monitor traffic spike** on Garrison Ledger site
  - Check Google Analytics for `utm_source=familymedia`
  - Verify no server errors or slowdowns
- [ ] **Monitor signups:**
  - How many newsletter referrals sign up?
  - What's the conversion rate from click → signup?
- [ ] **Monitor social shares:**
  - Are people sharing Garrison Ledger links?
  - Does OG image display correctly?

### **7.3 First Week Monitoring**
- [ ] **Track key metrics:**
  - Newsletter CTR (Presenting Sponsor block)
  - Giveaway CTR ("Visit Sponsor" button)
  - Landing Page CTR ("Explore Garrison Ledger")
  - Signups (total from newsletter campaign)
  - Premium upgrades (attributed to newsletter)
- [ ] **Monitor engagement:**
  - Assessment completion rate (newsletter users)
  - Plan generation rate (newsletter users)
  - Time on site (newsletter referrals vs organic)
  - 7-day retention (newsletter signups)

---

## 📋 **PHASE 8: POST-CAMPAIGN REVIEW**

### **8.1 Performance Report (After 30 Days)**
- [ ] **Compile metrics:**
  - Total newsletter clicks (Garrison Ledger CTAs)
  - Total signups (attributed to newsletter)
  - Total Premium upgrades (attributed to newsletter)
  - ROI calculation (sponsorship cost vs revenue)
- [ ] **Create report for stakeholders:**
  - FamilyMedia (Joe Mugnai)
  - Garrison Ledger team
- [ ] **Identify learnings:**
  - What worked well?
  - What could be improved?
  - Should we sponsor again?

### **8.2 Optimization Recommendations**
- [ ] **A/B testing opportunities:**
  - Headline variations (next sponsorship)
  - CTA button text
  - Logo placement
- [ ] **Content improvements:**
  - Did "Comprehensive Approach" resonate?
  - Should we test "Conservative" or "Bold" approach next time?
- [ ] **Technical improvements:**
  - Landing page optimizations
  - Conversion funnel improvements

---

## 🎯 **SUCCESS CRITERIA:**

### **Minimum Success:**
- [ ] **Newsletter CTR:** > 5% (Presenting Sponsor block)
- [ ] **Signups:** > 50 new users from newsletter campaign
- [ ] **Premium Upgrades:** > 5 upgrades attributed to newsletter

### **Excellent Success:**
- [ ] **Newsletter CTR:** > 10%
- [ ] **Signups:** > 100 new users
- [ ] **Premium Upgrades:** > 10 upgrades
- [ ] **7-Day Retention:** > 50% (newsletter signups stay active)

---

## 📞 **CONTACTS & RESOURCES:**

### **FamilyMedia:**
- **Contact:** Joe Mugnai (Associate Publisher)
- **Email:** [Insert email]
- **Newsletter Platform:** Brevo

### **Garrison Ledger:**
- **Site:** https://garrisonledger.com
- **Dashboard:** https://garrisonledger.com/dashboard
- **Upgrade Page:** https://garrisonledger.com/dashboard/upgrade

### **Resources:**
- **Sponsorship Package:** `garrison-ledger-sponsorship-package.md`
- **Newsletter HTML:** `NEXT_ISSUE_garrison_ledger_sponsor.html`
- **Landing Page Copy:** `giveaway_landing_page_copy.md`
- **OG Image Specs:** `og-image-specifications.md`

---

**🚀 READY TO LAUNCH! Work through this checklist systematically and we'll have a successful sponsorship integration.** 🎖️💰📧


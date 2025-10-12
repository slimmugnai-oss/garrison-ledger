# Next Session: Remaining Polish Tasks

**Context:** Core atomic content system is production-ready and deployed. These are enhancement/polish items.

---

## 🔧 Technical Tasks (Ready to Implement)

### **1. TSP Growth Projection Chart** (~30 min)
**Status:** Recharts installed  
**File:** `/app/components/tools/TspModeler.tsx`  
**What to do:**
- Add Recharts LineChart component after line 180 (where results display)
- Use `apiData.seriesDefault` and `apiData.seriesCustom` arrays
- X-axis: years (0 to `apiData.yearsVisible`)
- Y-axis: balance ($)
- Two lines: default allocation vs custom allocation
- Show in premium card with proper styling

### **2. Premium Gates & Teasing** (~30 min)
**Files:** Tool pages + plan page  
**What to do:**
- Wrap tool outputs in premium check
- If not premium: show blurred preview + "Upgrade to see full results"
- Plan page: show first atom fully, blur rest with upgrade CTA
- Use existing `usePremiumStatus()` hook

### **3. Account Settings Page** (~45 min)
**File:** Create `/app/dashboard/settings/page.tsx`  
**Sections:**
- Profile (name, email - read-only from Clerk)
- Billing Management (BillingPortalButton component)
- Preferences (email notifications toggle)
- Danger Zone (delete account)

### **4. Code Cleanup** (~15 min)
**What to do:**
- Delete: `app/dashboard/plan/page-client.tsx`
- Delete: `app/dashboard/plan/page-server.tsx`
- Fix unused variables in admin pages
- Remove old imports

---

## 📄 Legal Pages (Templates Provided)

### **5. Privacy Policy** (~45 min)
**File:** Create `/app/(legal)/privacy/page.tsx`  
**Template:** Full content provided in user's prompt  
**Replace placeholders:**
- `[COMPANY_NAME]` → Family Media, LLC
- `[CONTACT_EMAIL]` → support@familymedia.com
- `[POSTAL_ADDRESS]` → (get from user)
- `[EFFECTIVE_DATE]` → October 12, 2025

### **6. Cookie Policy + Banner** (~30 min)
**Files:**
- `/app/(legal)/privacy/cookies/page.tsx`
- `/components/legal/CookieBanner.tsx`
- `/components/legal/LegalLayout.tsx`

**What to do:**
- Create Cookie Policy page
- Implement banner with Accept/Reject/Manage
- Save consent in `cookie_consent` cookie
- Mount banner in root layout

### **7. CPRA Do Not Sell Page** (~20 min)
**File:** `/app/(legal)/privacy/do-not-sell/page.tsx`  
**What to do:**
- Create simple form (email + request type)
- Save to `privacy_requests` table (need migration)
- Confirmation message

---

## ✅ Testing Checklist

**Before Launch:**
- [ ] Complete assessment as 5 different personas
- [ ] Verify all 5 get sensible plans
- [ ] Test billing button (create test subscription)
- [ ] Verify premium gates work
- [ ] Check all external links
- [ ] Run Lighthouse (accessibility, performance)
- [ ] Test on mobile devices
- [ ] Cross-browser check (Chrome, Safari, Firefox)

---

## 📈 Current System Stats

**Production-Ready:**
- 19 atomic blocks (fully curated)
- 15 intelligent rules (10/10 personas pass)
- 6-section comprehensive assessment
- Premium design system (WCAG AA)
- Magazine-style Executive Briefing

**File Count:**
- 85 total files in project
- 19 component files
- 15 page files
- 8 API routes
- 16 migrations

**Performance:**
- Homepage: Static, fast LCP
- Dashboard: Server-rendered
- Tools: Client-side with premium gates
- Assessment: Client-side form
- Plan: Client-side with API call

---

## 🎯 Recommended Order

**Session 1 (Next):**
1. Add TSP chart (visual impact)
2. Implement premium gates (monetization)
3. Create settings page (user need)

**Session 2:**
4. Complete all 3 legal pages
5. Add cookie banner
6. Clean up code

**Session 3:**
7. Comprehensive testing
8. Bug fixes
9. Launch prep

---

**Current commit:** `a03fdb4`  
**System status:** Production-ready, enhancements in progress  
**Next action:** Implement TSP chart visualization


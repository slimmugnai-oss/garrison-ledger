# Intel Dashboard - Quick Test Checklist

**Use this for 10-minute browser smoke test after deployment**

---

## ✅ Navigation Test (2 min)

- [ ] Visit https://garrisonledger.com
- [ ] Sign in with test account
- [ ] Click "Premium Tools" in header
- [ ] Click "Intel Library" (should go to `/dashboard/intel`)
- [ ] Verify page loads without errors
- [ ] On mobile: Open menu → Click "Intel Library"

**Expected:** All links work, no 404 errors

---

## ✅ Library Page Test (3 min)

- [ ] See grid of 13 Intel cards
- [ ] Count badge shows: Finance (5), PCS (3), Deployment (2), Career (2), Lifestyle (1)
- [ ] Click "Finance" filter → Only finance cards show
- [ ] Click "Clear Filter" → All cards return
- [ ] Type "TSP" in search → TSP card appears
- [ ] Click a premium card (if free user) → See lock icon and upgrade CTA
- [ ] Click "View Intel Card" on any free card → Opens card detail page

**Expected:** Filters work, search works, cards clickable

---

## ✅ Dynamic Data Test (3 min)

**Test Card:** `/dashboard/intel/finance/bah-basics`

- [ ] Page loads successfully
- [ ] See breadcrumb: Dashboard → Intel Library → BAH Guide
- [ ] Scroll to "Example Rates (2025)" section
- [ ] **Verify RateBadge #1:** "E-6 with dependents, JBLM/Tacoma (WA311)" shows **$2,850.00/month**
- [ ] **Verify RateBadge #2:** "E-6 with dependents, San Diego (CA038)" shows **$4,395.00/month**
- [ ] Below rates, see "AsOf" component showing "Data Source: DFAS BAH Rates"
- [ ] Check console for errors (F12 → Console tab)

**Expected:** Rates display correctly (NOT "Data unavailable"), provenance shows

---

## ✅ Other Dynamic Cards (2 min)

**BAS Card:** `/dashboard/intel/finance/bas-basics`
- [ ] RateBadge shows **$460.66** (enlisted) and **$311.64** (officer)

**TSP Card:** `/dashboard/intel/finance/tsp-basics`
- [ ] RateBadge shows **$23,500** (contribution limit)
- [ ] RateBadge shows **$7,500** (catch-up)

**DITY Move Card:** `/dashboard/intel/pcs/dity-move-basics`
- [ ] RateBadge shows **$0.70/mile** (mileage rate)

**Expected:** All rate badges show actual values, not error states

---

## ✅ Mobile Test (Optional, 5 min)

- [ ] Resize browser to mobile width (375px)
- [ ] Cards stack in 1 column
- [ ] Filter buttons wrap to multiple rows
- [ ] Search input full-width
- [ ] Touch targets large enough (buttons easy to tap)
- [ ] Intel card content readable on small screen

**Expected:** Everything usable on mobile, no horizontal scroll

---

## 🚨 Red Flags (Stop and Investigate)

**If you see any of these, report immediately:**

- ❌ "Data unavailable" on BAH/BAS/TSP rate badges
- ❌ Console errors about "fetch failed" or "undefined"
- ❌ 404 errors on Intel card links
- ❌ Premium cards accessible to free users
- ❌ Blank/broken MDX rendering
- ❌ JavaScript errors preventing page load

---

## ✅ Success Criteria

**All green means Intel Dashboard is fully functional:**

- ✅ 13 Intel cards load without errors
- ✅ Dynamic rate badges show correct 2025 data
- ✅ Navigation flows smooth
- ✅ Premium gating works
- ✅ Mobile-responsive
- ✅ No console errors

---

**If all checks pass:** 🎉 **Intel Dashboard APPROVED for production use!**

**Test Duration:** 10 minutes  
**Last Updated:** October 20, 2025


# Base Navigator Quick Testing Checklist

**Use this checklist to verify the Base Navigator works correctly after deploying the fixes.**

---

## 🔍 Quick Test (5 minutes)

### 1. Base Selection Page
- [ ] Go to https://app.familymedia.com/dashboard/navigator
- [ ] Verify 4 base cards display (JBLM, Norfolk, Fort Liberty, Camp Pendleton)
- [ ] Badge shows "4 bases" ✅
- [ ] Click on JBLM card

### 2. JBLM Navigator Page
- [ ] Page loads without errors
- [ ] MHA shown in filter text is `WA311` (not WA408) ✅
- [ ] Set BAH to `$2,500`
- [ ] Keep bedrooms at `3 BR`
- [ ] Select `Elementary` grade
- [ ] Click "Find Best Neighborhoods"

### 3. Results Display (Free User)
- [ ] Loading spinner shows
- [ ] Top 3 neighborhoods display ✅
- [ ] Each card shows:
  - [ ] Rank medal (🥇 🥈 🥉)
  - [ ] ZIP code
  - [ ] Family Fit Score (number 0-100)
  - [ ] 8 subscores with progress bars
  - [ ] Top 2 schools (check ratings are NOT 0/10)
  - [ ] Median rent vs BAH
  - [ ] Sample listings (2-3)
  - [ ] Commute times (AM/PM)
- [ ] No watchlist stars (free user) ✅

### 4. Results Display (Premium User)
*If you have a premium test account:*
- [ ] Header says "All {N} Neighborhoods Ranked" (not "Top 3") ✅
- [ ] More than 3 results display ✅
- [ ] Ranks 4+ show "#4 Choice", "#5 Choice", etc. ✅
- [ ] Watchlist stars appear on each card ✅

### 5. Mobile Responsive
- [ ] Open on mobile or resize browser to 375px
- [ ] No horizontal scroll
- [ ] Filters stack vertically
- [ ] Cards stack (1 column)
- [ ] All buttons tappable

### 6. Error Handling
- [ ] Go to `/dashboard/navigator/invalid-base`
- [ ] Shows "Base Not Found" page ✅
- [ ] "Browse All Bases" link works

---

## 🐛 Known Issues to Check

### MHA Codes (FIXED ✅)
- [ ] JBLM shows `WA311` (NOT WA408)
- [ ] Norfolk shows `VA298` (NOT VA544)
- [ ] Fort Liberty shows `NC182` (NOT NC228)
- [ ] Camp Pendleton shows `CA024` (NOT CA917)

### Premium Gating (FIXED ✅)
- [ ] Free users see exactly 3 results
- [ ] Premium users see ALL results (6-8 typically)
- [ ] Premium users see dynamic header text
- [ ] Rank labels don't cause errors for 4+ results

---

## 🚨 If You See These, Something's Wrong

**❌ BAH lookup fails:**
- Symptom: Rent vs BAH score = 0 for all ZIPs
- Cause: MHA code still wrong
- Fix: Verify `bases-seed.json` deployed correctly

**❌ Premium users only see 3 results:**
- Symptom: Premium account shows "Top 3 Neighborhoods"
- Cause: `BaseNavigatorClient.tsx` fix not deployed
- Fix: Verify file deployed correctly

**❌ Array index error on 4+ results:**
- Symptom: Console error "Cannot read property of undefined"
- Cause: Rank label fix not applied
- Fix: Check rankColors/rankLabels arrays have fallbacks

**❌ School ratings show 0/10:**
- Symptom: All schools show "0/10" rating
- Cause: GreatSchools API key missing or v1 key (deprecated)
- Fix: Set `GREAT_SCHOOLS_API_KEY` in Vercel (v2 key required)

**❌ Weather always says "unavailable":**
- Symptom: Weather comfort note always "Data unavailable"
- Cause: `GOOGLE_WEATHER_API_KEY` not set
- Fix: Add env var in Vercel

**❌ No rent data:**
- Symptom: Median rent always shows "Unavailable"
- Cause: `RAPIDAPI_KEY` or `ZILLOW_RAPIDAPI_HOST` not set
- Fix: Add env vars in Vercel

---

## ✅ Success Criteria

All of these should be TRUE:

1. ✅ Base selection page loads
2. ✅ MHA codes are correct (WA311, VA298, NC182, CA024)
3. ✅ "Find Best Neighborhoods" button works
4. ✅ Results display with real data (not all "unavailable")
5. ✅ Free users see exactly 3 results
6. ✅ Premium users see ALL results
7. ✅ No console errors
8. ✅ Mobile responsive (no horizontal scroll)

---

## 📊 Performance Check

**Optional but recommended:**

1. Open Chrome DevTools → Network tab
2. Click "Find Best Neighborhoods"
3. Verify:
   - [ ] Single API call to `/api/navigator/base`
   - [ ] Response time < 10 seconds (first run, no cache)
   - [ ] Response time < 2 seconds (cached)
   - [ ] Status code 200 ✅

---

**Testing completed:** ____________  
**Tested by:** ____________  
**Result:** ✅ Pass / ❌ Fail  
**Issues found:** ____________


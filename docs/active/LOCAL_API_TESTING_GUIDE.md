# 🧪 Base Navigator Local API Testing Guide

**Since Vercel is down, use this guide to test all APIs locally.**

---

## ✅ **Quick Start (No API Keys Needed)**

### Step 1: Start Local Dev Server

```bash
npm run dev
```

### Step 2: Test with Default Fallbacks

1. Go to: http://localhost:3000/dashboard/navigator
2. Click on **"Joint Base Lewis-McChord"**
3. Fill out filters:
   - Bedrooms: **3 BR**
   - BAH: **$2,500**
   - Kids Grades: **Elementary** (click to select)
4. Click **"Find Best Neighborhoods"**
5. Open browser DevTools → Console tab

### Step 3: Check Console Logs

**What you'll see (without API keys):**

```
[Weather] ⚠️ GOOGLE_WEATHER_API_KEY not configured
[Weather] Cache hit for ZIP 98498
[Schools] ⚠️ GreatSchools API key not configured
[Schools] School ratings will not be available
[Housing] Zillow API not configured. Host: missing, Key: missing
[Distance] Google Maps API key not configured
[Crime] ⚠️ Crime API key not configured
[Amenities] ⚠️ Google Maps API key not configured
[Military] ⚠️ Google Maps API key not configured
```

**✅ Expected Result:**
- Computation completes successfully (no crash)
- 3 neighborhood cards display
- Family Fit Scores show (will be lower accuracy without real data)
- Default scores used:
  - Weather: 7/10 (neutral)
  - Schools: 0/10 (no data)
  - Rent: null (score = 0)
  - Commute: null (score = 0)
  - Crime: 7/10 (neutral)
  - Amenities: 6/10 (neutral)
  - Military: 6/10 (neutral)

---

## 🔑 **Test with Real API Keys (Recommended)**

### Step 1: Get API Keys

You need these for full testing:

1. **Google Maps API Key** (covers 3 APIs)
   - Go to: https://console.cloud.google.com/apis/credentials
   - Create API key
   - Enable these APIs:
     - Distance Matrix API (commute)
     - Places API (New) (amenities + military)
   - Copy key

2. **Google Weather API Key**
   - Same Google Cloud Console
   - Enable Weather API
   - Copy key (can be same as Maps key or separate)

3. **GreatSchools API Key**
   - Go to: https://www.greatschools.org/api/
   - Sign up for developer account
   - Request **v2 API key** (v1 is deprecated!)
   - Check email for key

4. **RapidAPI Key (Zillow)**
   - Go to: https://rapidapi.com/
   - Create account
   - Search "Zillow API" by apimaker
   - Subscribe to **Basic Plan** (free - 500 requests/month)
   - Copy your X-RapidAPI-Key from Code Snippets tab

5. **Crime API Key** (OPTIONAL)
   - Go to: https://api.data.gov/signup/
   - Sign up for api.data.gov key
   - Copy key

### Step 2: Add to .env.local

Open `.env.local` and add these lines at the end:

```bash
# Base Navigator API Keys
GOOGLE_MAPS_API_KEY=your-google-maps-key-here
GOOGLE_WEATHER_API_KEY=your-google-weather-key-here
GREAT_SCHOOLS_API_KEY=your-greatschools-v2-key-here
RAPIDAPI_KEY=your-rapidapi-key-here
ZILLOW_RAPIDAPI_HOST=zillow-com1.p.rapidapi.com
CRIME_API_KEY=your-crime-api-key-here
```

### Step 3: Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 4: Test Again

1. Go to: http://localhost:3000/dashboard/navigator/jblm
2. Fill filters and click "Find Best Neighborhoods"
3. Check console logs

**What you'll see (WITH API keys):**

```
[Weather] Geocoding ZIP 98498...
[Weather] Fetching weather for 47.xxx, -122.xxx...
[Weather] ✅ Weather fetched for ZIP 98498: Mild, comfortable
[Schools] Geocoding ZIP 98498...
[Schools] Fetching schools near 47.xxx, -122.xxx...
[Schools] ✅ Fetched 15 schools for ZIP 98498
[Schools] Top school: Lakewood Elementary (8/10)
[Housing] ✅ Median rent: $2,200
[Distance] ✅ AM commute: 12 min, PM commute: 15 min
[Crime] ✅ Crime data fetched for ZIP 98498: Safety score 7/10
[Amenities] ✅ Found 5 supermarket places
[Amenities] ✅ Amenities data fetched for ZIP 98498: Score 7/10
[Military] ✅ Found commissary: JBLM Commissary
[Military] ✅ Military amenities data fetched for ZIP 98498: Score 8/10
```

**✅ Expected Result:**
- All API calls succeed
- Real data displayed:
  - Schools show actual ratings (7/10, 8/10, 9/10)
  - Rent shows actual median ($2,200, $2,500, etc.)
  - Commute shows real times (12 min, 15 min, etc.)
  - Weather shows actual conditions
- Family Fit Scores are accurate (60-85 range typically)

---

## 🧪 **Manual API Testing (Individual Providers)**

### Test Weather API

```bash
# In browser console at localhost:3000
await fetch('/api/test-weather?zip=98498')
  .then(r => r.json())
  .then(console.log)
```

Expected: `{ index10: 7, note: "Mild, comfortable" }` or default

### Test Schools API

```bash
await fetch('/api/test-schools?zip=98498')
  .then(r => r.json())
  .then(console.log)
```

Expected: Array of schools or empty array

### Test Housing API

```bash
await fetch('/api/test-housing?zip=98498&bedrooms=3')
  .then(r => r.json())
  .then(console.log)
```

Expected: `{ medianRent: 220000, listings: [...] }` or null

---

## 🐛 **Troubleshooting**

### Issue: "API key not configured" warnings

**Solution:** Add API keys to `.env.local` and restart dev server

### Issue: "410 This API has reached End of Life"

**Problem:** You have GreatSchools v1 key (deprecated)  
**Solution:** Request new v2 key from GreatSchools

### Issue: "401 Unauthorized" from GreatSchools

**Problem:** Invalid or expired API key  
**Solution:** Check email for correct key, ensure no extra spaces

### Issue: "403 Forbidden" from Google APIs

**Problem:** API not enabled in Google Cloud Console  
**Solution:** Enable Distance Matrix API, Places API (New), Weather API

### Issue: Results all show same Family Fit Score

**Problem:** All APIs returning defaults (no variation)  
**Solution:** Add at least Schools + Housing API keys for variation

### Issue: Computation takes > 30 seconds

**Problem:** First run fetches all data (no cache)  
**Expected:** Normal - subsequent runs will be 2-5 seconds (cached)

---

## ✅ **Success Criteria Checklist**

### Without API Keys (Graceful Fallback Test)
- [ ] Page loads without crash
- [ ] Computation completes in < 10 seconds
- [ ] 3 neighborhood cards display
- [ ] Family Fit Scores show (30-60 range with defaults)
- [ ] No console errors (only warnings ⚠️)
- [ ] Premium gating works (only 3 results for free user)

### With API Keys (Full Functionality Test)
- [ ] All console logs show ✅ (no ⚠️ warnings)
- [ ] Schools show real ratings (not 0/10)
- [ ] Rent shows actual values (varies by ZIP)
- [ ] Commute times display (AM/PM different)
- [ ] Weather notes show real conditions
- [ ] Family Fit Scores vary by ZIP (60-85 range)
- [ ] Computation completes in < 15 seconds (first run)
- [ ] Second computation completes in < 3 seconds (cached)

---

## 📊 **Expected Console Output (Full Keys)**

```
[Navigator] Computing rankings with filters:
  bedrooms: 3
  bahMonthlyCents: 250000
  kidsGrades: ["elem"]

[Navigator] Processing ZIP 98498...
[Weather] Geocoding ZIP 98498...
[Weather] Fetching weather for 47.126, -122.561...
[Weather] ✅ Weather fetched for ZIP 98498: Mild, comfortable
[Schools] Geocoding ZIP 98498...
[Schools] Fetching schools near 47.126, -122.561...
[Schools] ✅ Fetched 15 schools for ZIP 98498
[Schools] Top school: Lakewood Elementary (8/10)
[Schools] Computing school score for ZIP 98498 with grades: ["elem"]
[Schools] ZIP 98498 school score: 8.2/10 (3 schools)
[Housing] ✅ Median rent: $2,200
[Distance] ✅ Commute calculated: AM 12min, PM 15min
[Crime] ✅ Crime data fetched: Safety 7/10
[Amenities] ✅ Amenities score: 7/10
[Military] ✅ Military score: 8/10
[Navigator] ✅ ZIP 98498 complete - Family Fit Score: 78/100

[Navigator] Processing ZIP 98433...
(repeat for each ZIP)

[Navigator] ✅ All ZIPs processed - Total results: 8
```

---

## 🚀 **Next Steps After Testing**

1. ✅ Verify all APIs work locally
2. ✅ Copy API keys from `.env.local`
3. ⏳ Wait for Vercel to come back online
4. 🔑 Add API keys to Vercel Environment Variables:
   - Project Settings → Environment Variables
   - Add each key (Production + Preview + Development)
5. 🚀 Deploy and test in production

---

## 💡 **Pro Tips**

**Cache Testing:**
- First computation: 10-15 seconds (fetches all data)
- Second computation: 2-3 seconds (uses cache)
- Clear cache: Restart dev server

**Cost Optimization:**
- GreatSchools: Free
- Zillow (RapidAPI): 500 free requests/month
- Google Maps: $200 free credits/month
- Google Weather: $200 free credits/month (shared pool)
- Crime API: Free (api.data.gov)

**Rate Limits:**
- Free tier users: 3 computations/day
- Each computation = 8 ZIPs × 7 APIs = 56 API calls
- With cache: Most API calls avoided

---

**Happy Testing! 🎉**

If you see all ✅ checkmarks in console, your APIs are working perfectly!


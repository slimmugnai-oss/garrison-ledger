# 🔑 Base Navigator API Setup Guide

**Last Updated:** 2025-10-20  
**Purpose:** Configure external APIs for Base Navigator tool

---

## 📋 Required API Keys

Base Navigator uses 4 external APIs:

| API | Provider | Purpose | Cost | Setup Time |
|-----|----------|---------|------|------------|
| **Google Maps** | Google Cloud | Commute times | ✅ Already configured | - |
| **GreatSchools v2** | GreatSchools | School ratings | Free | 5 min |
| **Zillow** | RapidAPI | Housing/rent data | Free tier | 5 min |
| **OpenWeatherMap** | OpenWeatherMap | Weather comfort | Free tier | 5 min |

---

## ✅ **1. Google Maps API** (Already Working)

**Status:** ✅ **WORKING** - Commute times display correctly

**Verification:** If you see "AM 9min / PM 10min" in Base Navigator, this is working.

**No action needed!**

---

## ⚠️ **2. GreatSchools API** (Needs Verification)

**Current Status:** May be hitting v1 API (deprecated)

### **Setup Steps:**

1. **Get API Key:**
   - Go to: https://www.greatschools.org/api/
   - Sign up for developer account
   - Request API key (instant approval for basic tier)
   - You should receive **v2 API key** via email

2. **Add to Vercel:**
   ```
   Name: GREAT_SCHOOLS_API_KEY
   Value: your-api-key-here
   ```

3. **Verify It's v2:**
   - Test endpoint:
   ```bash
   curl -H "X-API-Key: YOUR_KEY" \
     "https://api.greatschools.org/nearby-schools?zip=98498&limit=5"
   ```
   - Should return JSON with `{ schools: [...] }`
   - If you get 410 error, you're using v1 key (deprecated)

### **Troubleshooting:**

**Error: 410 This API has reached End of Life**
- You have v1 key, need v2
- Request new key from GreatSchools
- Update Vercel env var

**Error: 401 Unauthorized**
- API key invalid or expired
- Check email for correct key
- Ensure no extra spaces when copying

---

## ⚠️ **3. Zillow API via RapidAPI** (Needs Configuration)

**Current Status:** Not configured - missing `RAPIDAPI_KEY`

### **Setup Steps:**

1. **Sign Up for RapidAPI:**
   - Go to: https://rapidapi.com/
   - Create free account
   - Confirm email

2. **Subscribe to Zillow API:**
   - Search: "Zillow" in RapidAPI marketplace
   - Select: "Zillow API" (by apimaker)
   - Subscribe to **Basic Plan** (free - 500 requests/month)
   - Note: There are multiple Zillow APIs - use "zillow-com1.p.rapidapi.com"

3. **Get Your API Key:**
   - After subscribing, go to: Code Snippets tab
   - Copy your `X-RapidAPI-Key` value
   - Also note the `X-RapidAPI-Host` (should be `zillow-com1.p.rapidapi.com`)

4. **Add to Vercel (2 env vars needed):**
   ```
   Name: RAPIDAPI_KEY
   Value: your-rapidapi-key-here
   
   Name: ZILLOW_RAPIDAPI_HOST
   Value: zillow-com1.p.rapidapi.com
   ```

### **Troubleshooting:**

**Error: "Zillow API not configured. Host: set, Key: missing"**
- You have `ZILLOW_RAPIDAPI_HOST` but missing `RAPIDAPI_KEY`
- Add `RAPIDAPI_KEY` env var to Vercel

**Error: 403 Forbidden**
- Not subscribed to Zillow API on RapidAPI
- Go to RapidAPI dashboard → Apps → Subscribe

**Error: 429 Too Many Requests**
- Hit free tier limit (500/month)
- Wait until next month or upgrade plan

---

## 🆕 **4. OpenWeatherMap API** (New - Just Implemented)

**Current Status:** Not configured - needs API key

### **Setup Steps:**

1. **Sign Up:**
   - Go to: https://openweathermap.org/api
   - Click "Sign Up" (free account)
   - Confirm email

2. **Get API Key:**
   - After login, go to: API Keys tab
   - Copy your default API key (auto-generated)
   - **Note:** API key activation takes ~10 minutes after signup

3. **Add to Vercel:**
   ```
   Name: OPENWEATHER_API_KEY
   Value: your-openweather-api-key-here
   ```

4. **Verify It Works:**
   ```bash
   curl "https://api.openweathermap.org/data/2.5/forecast?zip=98498,US&appid=YOUR_KEY&units=imperial"
   ```
   - Should return 5-day forecast JSON
   - If you get 401, API key not activated yet (wait 10 min)

### **Troubleshooting:**

**Error: 401 Unauthorized**
- API key not activated yet (wait 10-15 minutes after signup)
- Or API key is invalid

**Error: "Weather data unavailable"**
- API key not set in Vercel
- Or API key not activated yet

---

## 🚀 **After Adding Keys: MUST REDEPLOY**

**CRITICAL:** New environment variables only take effect after redeployment!

### **How to Redeploy:**

1. Go to: Vercel Dashboard → garrison-ledger → Deployments
2. Click latest deployment (top of list)
3. Click "⋯" menu → "Redeploy"
4. Wait ~2 minutes for deployment to complete
5. **OR** just push any commit to GitHub (auto-deploys)

**Why:** Vercel builds static environment variables into the build. Adding them doesn't update running containers.

---

## 🧪 **Testing After Setup**

### **1. Check Vercel Logs:**

1. Vercel Dashboard → Logs
2. Filter by: `/api/navigator/base`
3. Look for success messages:
   - `[Schools] Fetched 12 schools for ZIP 98498`
   - `[Housing] Median rent: $2200 for 3BR in 98498`
   - `[Weather] Comfort index: 8.2 for ZIP 98498`

### **2. Test Base Navigator:**

1. Go to: https://app.familymedia.com/dashboard/navigator/jblm
2. Enter:
   - Bedrooms: 3
   - BAH: $2,598
   - Kids: 1 Elementary
3. Click "Find Best Neighborhoods"

**Expected Results:**
- ✅ **Commute:** AM 9min / PM 10min (Google Maps)
- ✅ **Schools:** Franklin Pierce Elementary: 8/10 (GreatSchools)
- ✅ **Housing:** Median rent: $2,200/mo (Zillow)
- ✅ **Weather:** 75°F highs, 35°F lows (OpenWeatherMap)

---

## 📊 **API Cost Breakdown**

| API | Free Tier | Expected Monthly Usage | Overage Cost |
|-----|-----------|------------------------|--------------|
| Google Maps | $200 credit | ~$5-10/month | $0.005/request |
| GreatSchools | Unlimited | ~500 requests/month | N/A (free) |
| Zillow (RapidAPI) | 500 requests/month | ~200 requests/month | $0.01/request |
| OpenWeatherMap | 1,000 requests/day | ~100 requests/day | N/A (won't hit) |

**Total Monthly Cost:** $0-5 (assuming normal usage within free tiers)

**Notes:**
- Base Navigator caches results for 24h
- Each ZIP code cached = 4 API calls saved (schools, housing, weather, commute)
- 90%+ of requests should hit cache

---

## ✅ **Summary Checklist**

- [ ] **Google Maps API:** Already working ✅
- [ ] **GreatSchools API:** 
  - [ ] Sign up at greatschools.org/api
  - [ ] Get v2 API key from email
  - [ ] Add `GREAT_SCHOOLS_API_KEY` to Vercel
- [ ] **Zillow API:**
  - [ ] Sign up at rapidapi.com
  - [ ] Subscribe to Zillow API (free tier)
  - [ ] Add `RAPIDAPI_KEY` to Vercel
  - [ ] Add `ZILLOW_RAPIDAPI_HOST` to Vercel (zillow-com1.p.rapidapi.com)
- [ ] **OpenWeatherMap API:**
  - [ ] Sign up at openweathermap.org
  - [ ] Get API key
  - [ ] Add `OPENWEATHER_API_KEY` to Vercel
  - [ ] Wait 10 min for key activation
- [ ] **Redeploy:**
  - [ ] Vercel Dashboard → Redeploy
  - [ ] Wait 2 minutes
- [ ] **Test:**
  - [ ] Try Base Navigator with JBLM
  - [ ] Verify schools, housing, weather all show

---

## 🆘 **Still Having Issues?**

**Check:**
1. All 4 env vars are in Vercel (Settings → Environment Variables)
2. You redeployed after adding env vars
3. API keys are correct (no extra spaces)
4. You're subscribed to Zillow on RapidAPI
5. OpenWeatherMap key is activated (wait 10-15 min)

**Debug:**
- Check Vercel logs for specific error messages
- Test APIs manually with curl commands above
- Verify each API key works before adding to Vercel

---

**Questions?** See `API_TESTING_WALKTHROUGH.md` for detailed debugging steps.


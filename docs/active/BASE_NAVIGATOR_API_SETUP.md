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

## ✅ **1. Google Unified API** (Weather + Places + Distance Matrix)

**Status:** ✅ **LIVE** - All Google services now use single API key

**Environment Variable:** `GOOGLE_API_KEY`

**What It Powers:**
- **Weather:** Real-time temperature, conditions, humidity
- **Amenities:** Grocery stores, restaurants, gyms, hospitals within 5km radius
- **Commute:** AM/PM drive times with traffic to base gate

**Verification:** 
- Weather shows real temperature (not generic "Moderate climate")
- Amenities show non-zero counts (not all 0s)
- Commute shows realistic times based on actual traffic

**APIs Enabled:**
1. Current Weather API (`weather.googleapis.com/v1/currentWeather`)
2. Places API (New) (`places.googleapis.com/v1/places:searchNearby`)
3. Distance Matrix API (`maps.googleapis.com/maps/api/distancematrix`)

**No action needed if already configured!**

---

## ✅ **2. SchoolDigger API** (School Ratings)

**Status:** ✅ **LIVE** - Real school data from SchoolDigger

**Environment Variables:**
- `SCHOOLDIGGER_APP_ID` 
- `SCHOOLDIGGER_APP_KEY`

**What It Powers:**
- School names, ratings (0-10 scale), grade ranges
- Up to 25 schools per ZIP code
- Public and private schools
- Distance from ZIP center

**Verification:**
- Schools section shows real school names (not "N/A")
- Ratings based on SchoolDigger rankStars (1-5 stars → 0-10 scale)
- See console logs: `[SCHOOLS] Fetched X schools for ZIP`

### **Setup Steps (if not configured):**

1. **Sign Up for SchoolDigger:**
   - Go to: https://developer.schooldigger.com/
   - Create developer account
   - Subscribe to free tier (1,000 requests/month)

2. **Get Credentials:**
   - After signup, you'll receive `appID` and `appKey`
   - **Note:** These are NOT the same as API keys - they're URL parameters

3. **Add to Vercel (2 variables needed):**
   ```
   Name: SCHOOLDIGGER_APP_ID
   Value: your-app-id-here
   
   Name: SCHOOLDIGGER_APP_KEY
   Value: your-app-key-here
   ```

### **Troubleshooting:**

**Error: SchoolDigger API authentication failed**
- Check both `SCHOOLDIGGER_APP_ID` and `SCHOOLDIGGER_APP_KEY` are set
- Verify credentials from SchoolDigger dashboard
- Ensure no extra spaces when copying

**No schools showing:**
- Check Vercel logs for `[SCHOOLS]` messages
- May return 0 schools for remote/rural ZIP codes (expected)
- Falls back to empty array on error (doesn't break page)

---

## ℹ️ **3. Demographics Data** (Intentional Defaults)

**Status:** ℹ️ **USING DEFAULTS** - Not a bug, intentional design

**What It Shows:**
- Population, median age, median income
- Diversity index, family household percentage
- Region-specific estimates based on ZIP code

**Why Defaults:**
- Real demographics APIs (US Census, RapidAPI) are costly or complex
- Demographics don't change frequently enough to justify real-time API costs
- Regional defaults provide reasonable estimates for military audience

**Future:** Could integrate US Census API if highly accurate demographics become critical

---

## ℹ️ **4. Military Amenities** (Intentional Defaults)

**Status:** ℹ️ **USING DEFAULTS** - Not a bug, intentional design

**What It Shows:**
- Military facility proximity score
- Generic assessments of military housing distance
- Region-specific estimates

**Why Defaults:**
- Searching for military facilities near civilian housing is complex
- No publicly available API for military installation proximity
- Better UX to show generic scores than confusing/inaccurate data

**Future:** Could integrate DMDC installation database if made available

---

## ⚠️ **DEPRECATED APIS** (No Longer Used)

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

### **Required Environment Variables:**

- [x] **`GOOGLE_API_KEY`** - Powers weather, amenities, commute ✅
- [x] **`SCHOOLDIGGER_APP_ID`** - SchoolDigger authentication ✅
- [x] **`SCHOOLDIGGER_APP_KEY`** - SchoolDigger authentication ✅

### **Optional (Not Required):**

- Demographics - Uses defaults (intentional)
- Military Amenities - Uses defaults (intentional)

### **Deployment Checklist:**

- [ ] Verify all 3 environment variables are set in Vercel
- [ ] Redeploy after adding new variables (Vercel Dashboard → Redeploy)
- [ ] Test on production at `/dashboard/navigator/nsnor`
- [ ] Check Vercel logs for success messages:
  - `[WEATHER] Fetched real weather for ZIP`
  - `[AMENITIES] Fetched real amenities for ZIP`
  - `[COMMUTE] Fetched real commute for ZIP`
  - `[SCHOOLS] Fetched X schools for ZIP`

### **Expected Real Data:**

- **Weather:** Real temperature (e.g., "Current: 62°F, 75% humidity, Cloudy")
- **Amenities:** Non-zero counts (e.g., "5 groceries, 42 restaurants, 3 gyms, 2 hospitals")
- **Commute:** Realistic times (e.g., "AM 18min / PM 23min")
- **Schools:** Real school names with ratings (e.g., "Lakewood Elementary: 8/10")

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


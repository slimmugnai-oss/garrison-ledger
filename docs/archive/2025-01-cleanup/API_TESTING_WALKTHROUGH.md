# 🧪 API TESTING WALKTHROUGH

**Purpose:** Diagnose why Base Navigator shows "No data"  
**Root Cause:** Vendor APIs (GreatSchools, Zillow, Weather) not returning data  
**Solution:** Test each API manually, fix configuration issues

---

## 🎯 **TEST 1: GreatSchools API (Schools Data)**

### **Why Test:**
Base Navigator shows "No school data" → GreatSchools API not working

### **How to Test:**

```bash
# Replace YOUR_KEY with actual GREAT_SCHOOLS_API_KEY from Vercel
curl -H "X-API-Key: YOUR_KEY" \
  "https://api.greatschools.org/schools?state=WA&zip=98498&limit=5"
```

### **Expected Response:**
```json
{
  "schools": [
    {
      "name": "Spanaway Elementary",
      "rating": 7,
      "gradeLevels": "K-5",
      ...
    }
  ]
}
```

### **If You Get Error:**

**Error: 401 Unauthorized**
- API key is invalid or expired
- Fix: Get new API key from GreatSchools
- Sign up: https://www.greatschools.org/api/

**Error: 404 Not Found**
- Wrong endpoint URL
- Fix: Check GreatSchools API documentation for correct endpoint
- May be: `/schools/nearby` instead of `/schools`

**Error: 403 Forbidden**
- API key not authorized for this endpoint
- Fix: Check API key permissions in GreatSchools dashboard

**No Error But Empty Results:**
- API working but no schools in that ZIP
- Try different ZIP: 92101 (San Diego - definitely has schools)

---

## 🏠 **TEST 2: Zillow API (Housing Data)**

### **Why Test:**
Base Navigator shows "No rent data" → Zillow API not working

### **How to Test:**

**Option A: Via RapidAPI Dashboard**
1. Go to: https://rapidapi.com/dashboard
2. Find "Zillow" API in your subscriptions
3. Click "Test Endpoint"
4. Try: `/propertyExtendedSearch` with location=98498

**Option B: Via Curl**
```bash
# Replace YOUR_RAPIDAPI_KEY with actual key from Vercel
curl -H "X-RapidAPI-Host: zillow-com1.p.rapidapi.com" \
     -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
     "https://zillow-com1.p.rapidapi.com/propertyExtendedSearch?location=92101&status_type=ForRent&bedsMin=3&bedsMax=3"
```

### **Expected Response:**
```json
{
  "props": [
    {
      "address": "123 Main St, San Diego, CA 92101",
      "price": 3200,
      "bedrooms": 3,
      ...
    }
  ]
}
```

### **If You Get Error:**

**Error: 401/403 Unauthorized**
- RapidAPI key invalid or subscription expired
- Fix: Check RapidAPI dashboard subscription status
- May need to upgrade plan or renew subscription

**Error: 429 Too Many Requests**
- Hit rate limit
- Fix: Wait 24 hours or upgrade RapidAPI plan

**Error: Different API Host**
- Zillow API host changed
- Current code uses: `zillow-com1.p.rapidapi.com`
- May need: `zillow56.p.rapidapi.com` or similar
- Fix: Check RapidAPI for correct host name

**Empty Results:**
- Try different ZIP: 92101, 10001, 60601 (major cities)

---

## 🌤️ **TEST 3: Google Weather API (Weather Data)**

### **Why Test:**
Base Navigator shows "Weather data unavailable" → Google Weather not working

### **How to Test:**

```bash
# Replace YOUR_RAPIDAPI_KEY with actual key
curl -H "X-RapidAPI-Host: google-weather.p.rapidapi.com" \
     -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
     "https://google-weather.p.rapidapi.com/weather?q=98498&units=imperial"
```

### **Expected Response:**
```json
{
  "current_condition": [{
    "temp_F": "65",
    "humidity": "72",
    "weatherDesc": [{"value": "Partly cloudy"}]
  }],
  "weather": [...]
}
```

### **If You Get Error:**

**Error: 401 Unauthorized**
- RapidAPI key invalid
- Fix: Check Vercel env var `RAPIDAPI_KEY` is set correctly

**Error: Different Response Structure**
- Google Weather API may have changed
- Fix: Update `lib/navigator/weather.ts` to match new structure

---

## 🗺️ **TEST 4: Google Distance Matrix (Commute) - WORKING!**

### **Why Test:**
You said commute shows "AM 9min / PM 10min" → **This API is working!** ✅

### **Verify It's Working:**

```bash
# Replace YOUR_GOOGLE_MAPS_KEY with actual key
curl "https://maps.googleapis.com/maps/api/distancematrix/json?origins=98498&destinations=47.126,-122.561&departure_time=now&traffic_model=best_guess&key=YOUR_GOOGLE_MAPS_KEY"
```

### **Expected:**
```json
{
  "status": "OK",
  "rows": [{
    "elements": [{
      "status": "OK",
      "duration_in_traffic": {
        "value": 540,
        "text": "9 mins"
      }
    }]
  }]
}
```

**If this works:** ✅ Google Maps API is configured correctly!

---

## 🔍 **DIAGNOSIS SUMMARY**

Based on your results:

| API | Status | Evidence |
|-----|--------|----------|
| **Google Maps** | ✅ Working | Commute shows "AM 9min / PM 10min" |
| **GreatSchools** | ❌ Not Working | "No school data" |
| **Zillow** | ❌ Not Working | "No rent data" |
| **Google Weather** | ❌ Not Working | "Weather data unavailable" |

**Next Steps:**
1. Test GreatSchools and Zillow APIs with curl commands above
2. Check error messages
3. Fix API keys/subscriptions
4. Redeploy
5. Base Navigator will work once APIs configured

---

## 🛠️ **QUICK FIX CHECKLIST**

### **1. Verify API Keys in Vercel**

Go to: Vercel → garrison-ledger → Settings → Environment Variables

**Check these exist:**
- ✅ `GOOGLE_MAPS_API_KEY` (Working - commute shows)
- ⚠️ `GREAT_SCHOOLS_API_KEY` (Check if valid)
- ⚠️ `ZILLOW_RAPIDAPI_HOST` (Check value)
- ⚠️ `ZILLOW_RAPIDAPI_KEY` (Check if valid)
- ⚠️ `RAPIDAPI_KEY` (For weather - check if valid)

### **2. Test APIs Manually**

Run the curl commands above for each API

### **3. Fix Common Issues**

**If GreatSchools fails:**
- Get new API key: https://www.greatschools.org/api/
- Update Vercel env var
- Redeploy

**If Zillow fails:**
- Check RapidAPI subscription: https://rapidapi.com/dashboard
- May need to subscribe or upgrade plan
- Verify correct API host name

**If Weather fails:**
- Check RapidAPI key active
- May need different weather API (OpenWeatherMap alternative)

### **4. Redeploy After Fixes**

```bash
# Vercel will auto-deploy on git push
# Or manual: Vercel Dashboard → Deployments → Redeploy
```

---

## 🎯 **EXPECTED RESULTS AFTER FIXES**

Once APIs configured, Base Navigator should show:

**Schools:**
```
Top Schools
✓ Franklin Pierce Elementary: 8/10
✓ Spanaway Middle School: 7/10
```

**Housing:**
```
Housing  
Median rent: $2,200/mo
Your BAH: $2,598/mo ✓ Under BAH
```

**Weather:**
```
Weather
75°F summer highs, 35°F winter lows; 3 rainy days (7d forecast)
```

---

## 📞 **IF YOU NEED HELP**

**Stuck on API testing?**
- Send me the curl error output
- I can help diagnose

**Don't want to debug APIs?**
- **Option:** Disable Base Navigator temporarily
- **Option:** Use mock data (I can add fallback)
- **Option:** Focus on LES Auditor + TDY (those work 100%)

**Want me to add mock data?**
- I can add hardcoded fallback data
- Base Navigator will work with sample schools/housing
- Good for demo, then swap in real APIs later

---

## ✅ **WHAT WORKS WITHOUT API FIXES**

You can fully use these tools RIGHT NOW:

1. ✅ **LES Auditor** (100% working)
   - Upload LES PDF
   - Get pay verification
   - See flags and recommendations

2. ✅ **TDY Copilot** (backend 100%)
   - Create trips
   - Upload receipts (v1.1 UI coming)
   - API endpoints all working

3. ✅ **Intel Library** (95% working)
   - Browse 12 cards
   - Search and filter
   - Dynamic data showing (BAH, BAS, TSP, COLA)

4. ✅ **Base Navigator** (partial)
   - UI and commute calculation work
   - Schools/housing once APIs configured

---

**RECOMMENDATION:** Focus on LES Auditor first (it's 100% working), then debug Base Navigator APIs this week.


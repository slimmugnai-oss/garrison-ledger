# 🔑 Vercel Environment Variables - Final List

**What you need in Vercel for all tools to work:**

---

## ✅ **REQUIRED (Already Set)**

| Variable | Value | Purpose | Status |
|----------|-------|---------|--------|
| `CRON_SECRET` | [Random secret] | Cron job auth | ✅ Set |
| `GOOGLE_MAPS_API_KEY` | [Your Google key] | Commute calculation | ✅ Working |
| `GSA_API_KEY` | [Your GSA key] | Per-diem rates (TDY) | ✅ Set |

---

## ✅ **RAPIDAPI SETUP (For Zillow)**

You need **2 variables** for RapidAPI:

### **Variable 1: The API Key (Your Secret)**
- **Key Name:** `RAPIDAPI_KEY`
- **Value:** Your RapidAPI secret key (long string from RapidAPI dashboard)
- **Example:** `5f3e8a9b2c1d4e7f8a9b2c1d4e7f8a9b2c1d4e7f`
- **Where to get:** RapidAPI.com → Profile → My Apps → "Application Key"

### **Variable 2: The Zillow Hostname (Which API to call)**
- **Key Name:** `ZILLOW_RAPIDAPI_HOST`
- **Value:** `zillow-com1.p.rapidapi.com` (just the hostname, NOT your key!)
- **Your screenshot shows:** ✅ **Correctly set** as `zillow-com1.p.rapidapi.com`

**Why 2 variables?**
- `RAPIDAPI_KEY` = Your password (secret)
- `ZILLOW_RAPIDAPI_HOST` = Which door to knock on (public info)

---

## ✅ **GREATSCHOOLS (Updated for v2)**

- **Key Name:** `GREAT_SCHOOLS_API_KEY`
- **Value:** Your fresh v2 API key (from recent email)
- **Purpose:** School ratings for Base Navigator

---

## ⚠️ **GOOGLE WEATHER (Needs Clarification)**

**You said:** "Getting Google Weather from Google, not RapidAPI"

**Options:**

**Option A: You have Google Weather API**
- **Key Name:** `GOOGLE_WEATHER_API_KEY` (or `GOOGLE_API_KEY`)
- **Value:** Your Google Cloud API key
- **Endpoint:** (Need to know which Google service you're using)

**Option B: You mean something else?**
- OpenWeatherMap?
- WeatherAPI.com?
- Different provider?

**For Now:** I've updated code to return neutral weather score (7/10) until we configure the correct API.

---

## 🎯 **SUMMARY OF WHAT YOU NEED TO ADD**

Based on your screenshots and answers:

### **Already Correct:** ✅
- `ZILLOW_RAPIDAPI_HOST` = `zillow-com1.p.rapidapi.com` ✅

### **Need to Add:**

**1. RapidAPI Key (For Zillow)**
```
Key: RAPIDAPI_KEY
Value: [Get from RapidAPI.com → My Apps → Copy key]
```

**2. GreatSchools v2 Key**
```
Key: GREAT_SCHOOLS_API_KEY  
Value: [From their recent email - fresh v2 key]
```

**3. Google Weather (Optional for v1)**
```
Key: GOOGLE_WEATHER_API_KEY
Value: [Your Google API key]
Note: Currently returns neutral score, full integration in v1.1
```

---

## 🚀 **AFTER YOU ADD THESE**

1. Redeploy from Vercel dashboard
2. Test Base Navigator → Should show schools and housing data!
3. Weather will show neutral for now (can enhance later)

---

## 📊 **BAH CSV SITUATION**

**The PDF you downloaded:** Great reference! But it's a formatted PDF (3,025 pages!), not importable.

**Options:**

**Option A: Use sample data (RECOMMENDED for now)**
- 27 rows already in database
- Works for testing
- Covers 4 major bases

**Option B: Manual SQL insert (if you need specific base)**
```sql
INSERT INTO bah_rates (paygrade, mha, with_dependents, effective_date, rate_cents, location_name)
VALUES ('E06', 'NC228', true, '2025-01-01', 166200, 'Fort Liberty, NC');
```

**Option C: Build CSV parser (v1.1 feature)**
- Extract data from PDF
- Convert to CSV
- Bulk import via admin UI

**For Beta Launch:** Sample data is sufficient!

---

## ✅ **READY FOR DASHBOARD OVERHAUL?**

Once you've added those env vars (or decided to skip weather for v1), I'll do the complete overhaul:

1. ✅ Dashboard → Tools-first (remove assessment clutter)
2. ✅ Home page → Tool hero sections
3. ✅ Upgrade page → Clear tool benefits
4. ✅ Deprecate assessment routes

**Estimated time:** 1 hour

**Shall I proceed?** 🎖️

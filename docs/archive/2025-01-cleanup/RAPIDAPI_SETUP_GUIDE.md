# 🔑 RapidAPI Setup Guide - Complete Walkthrough

**Purpose:** Set up Zillow and Google Weather APIs via RapidAPI  
**Why:** Base Navigator needs these for housing data and weather

---

## 🎯 **WHAT IS RAPIDAPI?**

**RapidAPI** is a marketplace that aggregates thousands of APIs. Instead of signing up for each API individually, you:
1. Create ONE RapidAPI account
2. Subscribe to multiple APIs (Zillow, Weather, etc.)
3. Use ONE API key for all of them

**Think of it as:** Amazon for APIs

---

## 📋 **STEP-BY-STEP SETUP**

### **Step 1: Create/Login to RapidAPI**

1. Go to: https://rapidapi.com/
2. Click "Sign Up" (or "Log In" if you have account)
3. Create account (free)

---

### **Step 2: Subscribe to Zillow API**

1. **Search for Zillow:**
   - In RapidAPI search bar, type: "Zillow"
   - Look for: **"Zillow API"** or **"Zillow.com API"**
   - Popular ones: `zillow-com1.p.rapidapi.com` or `zillow56.p.rapidapi.com`

2. **Select API:**
   - Click on the API
   - You'll see pricing tiers

3. **Subscribe (Free Tier Usually Available):**
   - Click "Subscribe to Test"
   - Select **"Basic" plan** (usually free or $0-10/month for 100-500 calls)
   - Complete subscription

4. **Get API Host:**
   - After subscribing, you'll see "API Endpoint"
   - Example: `https://zillow-com1.p.rapidapi.com/propertyExtendedSearch`
   - **Note the hostname:** `zillow-com1.p.rapidapi.com`

---

### **Step 3: Subscribe to Google Weather API**

1. **Search:**
   - Type: "Google Weather"
   - Look for: **"Google Weather API"**

2. **Subscribe:**
   - Click "Subscribe to Test"
   - Select free tier (usually 100-500 calls/month)

3. **Note API Host:**
   - Should be: `google-weather.p.rapidapi.com`

---

### **Step 4: Get Your RapidAPI Key**

**This is the KEY part!**

1. **After subscribing to both APIs:**
   - Click your profile (top right)
   - Go to "My Apps"
   - Click "default-application" (or your app name)

2. **Copy the API Key:**
   - You'll see "Application Key" with masked dots
   - Click the "Show" icon (eye icon)
   - **Copy the entire key** (long string like: `a1b2c3d4e5...xyz`)

**IMPORTANT:** This ONE key works for ALL RapidAPI subscriptions!

---

### **Step 5: Add to Vercel**

1. Go to: Vercel Dashboard → garrison-ledger → Settings → Environment Variables

2. **Add These 3 Variables:**

**Variable 1:**
- **Key:** `RAPIDAPI_KEY`
- **Value:** [Your RapidAPI key from Step 4]
- **Scope:** Production, Preview, Development
- Click "Save"

**Variable 2:**
- **Key:** `ZILLOW_RAPIDAPI_HOST`
- **Value:** `zillow-com1.p.rapidapi.com` (or whichever Zillow API you subscribed to)
- **Scope:** All
- Click "Save"

**Variable 3:** (You probably already have this)
- **Key:** `ZILLOW_RAPIDAPI_KEY`
- **Value:** [Same RapidAPI key as Variable 1]
- **Scope:** All
- Click "Save"

---

## ✅ **VERIFICATION**

### **Test Zillow API:**

```bash
# Replace YOUR_RAPIDAPI_KEY with the key you just got
curl -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
     -H "X-RapidAPI-Host: zillow-com1.p.rapidapi.com" \
     "https://zillow-com1.p.rapidapi.com/propertyExtendedSearch?location=92101&status_type=ForRent&bedsMin=3"
```

**Expected:** JSON with property listings

**If Error:**
- Check API key is correct
- Verify you're subscribed to that specific Zillow API
- Try different Zillow API (there are multiple on RapidAPI)

---

### **Test Google Weather:**

```bash
curl -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
     -H "X-RapidAPI-Host": google-weather.p.rapidapi.com" \
     "https://google-weather.p.rapidapi.com/weather?q=92101"
```

**Expected:** JSON with weather data

---

## 🎯 **WHAT YOU NEED IN VERCEL**

**Summary of all env vars for Base Navigator:**

| Variable | Value | Purpose |
|----------|-------|---------|
| `GREAT_SCHOOLS_API_KEY` | [Your new v2 key] | Schools data |
| `RAPIDAPI_KEY` | [Your RapidAPI key] | Zillow + Weather |
| `ZILLOW_RAPIDAPI_HOST` | `zillow-com1.p.rapidapi.com` | Zillow API endpoint |
| `ZILLOW_RAPIDAPI_KEY` | [Same as RAPIDAPI_KEY] | Legacy (can be same) |
| `GOOGLE_MAPS_API_KEY` | [Your Google key] | ✅ Already working |

**After adding:** Redeploy from Vercel dashboard

---

## 📊 **COSTS**

**RapidAPI Pricing (Typical):**
- **Free Tier:** 100-500 API calls/month (enough for testing)
- **Basic Tier:** $10-20/month for 1,000-5,000 calls
- **Pro Tier:** $50-100/month for unlimited

**With 24h caching:** 100-200 calls/month = FREE tier sufficient for beta

---

## 🔧 **TROUBLESHOOTING**

### **"Invalid API Key"**
- Double-check you copied entire key (no spaces)
- Verify you're subscribed to that specific API
- Check subscription is active (not expired)

### **"Rate Limit Exceeded"**
- Free tier maxed out (100 calls/month)
- Upgrade plan or wait until next month
- Check RapidAPI dashboard for usage

### **"API Not Found"**
- Wrong hostname (zillow-com**1** vs zillow**56**)
- Search RapidAPI for "Zillow" and check correct hostname
- Update `ZILLOW_RAPIDAPI_HOST` in Vercel

---

## ✅ **NEXT STEPS**

1. **Add GreatSchools v2 API key to Vercel:**
   - The fresh key from their email
   - Variable: `GREAT_SCHOOLS_API_KEY`

2. **Subscribe to Zillow on RapidAPI:**
   - Search "Zillow"
   - Subscribe (free tier)
   - Note the hostname

3. **Subscribe to Google Weather on RapidAPI:**
   - Search "Google Weather"
   - Subscribe (free tier)

4. **Get RapidAPI key:**
   - Profile → My Apps → Copy key
   - Add to Vercel as `RAPIDAPI_KEY`

5. **Redeploy**

6. **Test Base Navigator** - Should work!

---

**CSV Question:** The BAH/COLA CSV is **optional**. Sample data (27 rows) works for testing. Upload full CSV (15,000 rows) later via admin UI when we build it.

**GreatSchools Branding:** Great! We'll need those logos for Base Navigator footer attribution.


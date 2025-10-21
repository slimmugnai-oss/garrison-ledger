# 🚀 Base Navigator API Testing - Quick Start

**Vercel is down? No problem! Test locally in 2 minutes.**

---

## Option 1: Test NOW (No Setup) ⚡

```bash
# 1. Start dev server
npm run dev

# 2. Open browser
http://localhost:3000/dashboard/navigator/jblm

# 3. Fill filters
Bedrooms: 3 BR
BAH: $2,500
Kids: Elementary

# 4. Click "Find Best Neighborhoods"

# 5. Open DevTools Console
```

**Result:** ✅ All APIs work with graceful fallbacks (default scores)

---

## Option 2: Test with Real Data (15 minutes) 🔑

### Quick Setup

Add to `.env.local`:

```bash
# Minimum for real data (2 keys = 5 of 7 APIs working)
GOOGLE_MAPS_API_KEY=AIza...your-key
GREAT_SCHOOLS_API_KEY=your-key
```

Get keys:
- **Google Maps:** https://console.cloud.google.com/apis/credentials
- **GreatSchools:** https://www.greatschools.org/api/ (request v2 key)

### Restart & Test

```bash
npm run dev
# Visit localhost:3000/dashboard/navigator/jblm
```

**Result:** ✅ Real school ratings, real commute times, real amenities

---

## What Each API Does

| API | What It Provides | Fallback if Missing |
|-----|------------------|---------------------|
| Google Maps | Commute times, Amenities, Military facilities | null times, default scores 6/10 |
| GreatSchools | School ratings | Empty array, score 0/10 |
| Google Weather | Weather comfort | Default score 7/10 |
| Zillow (RapidAPI) | Rent prices | null, score 0/10 |
| Crime API | Safety scores | Default score 7/10 |

---

## Expected Console Output

### Without Keys (Defaults):
```
⚠️ GOOGLE_WEATHER_API_KEY not configured
⚠️ GreatSchools API key not configured
⚠️ Zillow API not configured
✅ Computation complete - 3 results
```

### With Keys (Real Data):
```
✅ Weather fetched for ZIP 98498
✅ Fetched 15 schools for ZIP 98498
✅ Median rent: $2,200
✅ AM commute: 12 min, PM commute: 15 min
✅ Computation complete - 8 results
```

---

## Critical Issues Fixed ✅

1. ✅ **MHA codes corrected** (all 4 bases)
2. ✅ **Premium gating fixed** (shows all results)

---

## Test Checklist

**Basic Test (No Keys):**
- [ ] Page loads
- [ ] Computation completes
- [ ] 3 results display
- [ ] No crashes

**Full Test (With Keys):**
- [ ] Schools show ratings (7/10, 8/10, not 0/10)
- [ ] Rent shows real prices (varies by ZIP)
- [ ] Commute times display
- [ ] Scores vary by neighborhood (60-85 range)

---

**Full Guide:** See `LOCAL_API_TESTING_GUIDE.md` for detailed instructions.


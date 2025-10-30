# 🔧 Base Navigator Cache Clear Guide

## Problem
Not seeing the comprehensive Schools/Housing/Amenities overhaul changes on Base Navigator pages.

## Root Cause
**MULTI-LAYER CACHING:**
1. ✅ Code changes are deployed (verified in commit dd02493)
2. ❌ Browser cache may be serving old JavaScript
3. ❌ Database has old neighborhood_profiles data (missing new intelligence fields)
4. ❌ base_external_data_cache has old API responses

## Solution: 3-Step Cache Clear

### Step 1: Clear Browser Cache
**Option A - Hard Refresh:**
- Mac: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`

**Option B - Incognito Window:**
- Open a fresh incognito/private window
- Navigate to base navigator

**Option C - Full Cache Clear:**
- Chrome: Settings → Privacy → Clear browsing data → Cached images and files
- Safari: Develop → Empty Caches

### Step 2: Clear Database Cache (CRITICAL)
Run this SQL in Supabase SQL Editor:

```sql
-- Clear all cached neighborhood data
DELETE FROM neighborhood_profiles WHERE created_at < NOW();
DELETE FROM base_external_data_cache WHERE created_at < NOW();

-- Verify cleared
SELECT COUNT(*) as remaining_profiles FROM neighborhood_profiles;
SELECT COUNT(*) as remaining_cache FROM base_external_data_cache;
```

**Why this is needed:**
- `neighborhood_profiles` stores pre-computed neighborhood rankings
- The new comprehensive intelligence (detailed_analysis, private schools, etc.) won't exist in old cached data
- `base_external_data_cache` stores API responses (schools, weather, housing, amenities)
- Need fresh API calls to get all the data for the new comprehensive display

### Step 3: Re-Run Base Navigator
1. Go to `/dashboard/navigator`
2. Select a base (e.g., Camp Pendleton or Fort Liberty)
3. Enter BAH amount
4. Click "Analyze"
5. Wait for fresh data fetch (~30-60 seconds)

## What You Should See After Cache Clear

### Schools Tab:
✅ "School Intelligence Analysis" header (not "Executive Summary")
✅ "Based on {X} schools in this area" subtitle
✅ "Detailed Analysis" section
✅ "All Schools:" label (not "Top Picks")
✅ ALL schools shown per grade level (scrollable)
✅ Private Schools section (if any exist)

### Housing Tab:
✅ "Market Intelligence" header (not "Executive Summary")
✅ "Comprehensive housing analysis for this ZIP" subtitle

### Weather Tab:
✅ "Climate Analysis" header (not "Executive Summary")
✅ "Year-round weather intelligence for military families" subtitle

### Amenities Tab:
✅ Top 5 picks per category (was 3)
✅ "Top Picks (5 of X):" label
✅ All 10 amenity categories displayed
✅ Better sorting (rating × log(reviews))

## Verification Checklist

After clearing cache and re-running:
- [ ] Browser shows updated UI labels
- [ ] Schools tab shows ALL schools (not just 3)
- [ ] Private schools section appears (if available)
- [ ] Amenities show 5 picks per category
- [ ] "Detailed Analysis" section visible in Schools
- [ ] All headers use new professional language

## Still Not Working?

1. **Check Vercel deployment:**
   - Go to https://vercel.com/slimmugnai-oss/garrison-ledger
   - Verify latest commit (dd02493 or newer) is deployed
   - Check deployment logs for errors

2. **Check browser console:**
   - F12 → Console tab
   - Look for any JavaScript errors
   - Check Network tab for failed API calls

3. **Force new deployment:**
   ```bash
   git commit --allow-empty -m "chore: trigger redeployment"
   git push origin main
   ```

4. **Nuclear option - Clear everything:**
   ```sql
   -- Clear ALL cached data (be careful!)
   TRUNCATE neighborhood_profiles;
   TRUNCATE base_external_data_cache;
   ```

## Expected Timeline
- ✅ Browser cache clear: Immediate
- ✅ Database cache clear: Immediate
- ✅ Fresh data fetch: 30-60 seconds per base
- ✅ Full experience: 1-2 minutes from cache clear to seeing new UI

## Contact
If still having issues after all steps, check:
1. Vercel deployment status
2. Supabase connection
3. API quotas (SchoolDigger, Google)

# Base Navigator API Revamp - October 29, 2025

## Overview

Complete modernization of the Base Navigator tool with API consolidation, SchoolDigger integration, and crime data removal.

## Changes Implemented

### Phase 1: SchoolDigger Integration ✅

**Created:**
- `lib/vendors/schooldigger.ts` - Server-only API wrapper with auth, timeout, and caching
  - `sdFetch()` - Core fetch wrapper with authentication
  - `getSchoolsByZip()` - Search schools by ZIP code
  - `getSchoolsByDistance()` - Search schools by lat/lon
  - Environment variables: `SCHOOLDIGGER_APP_ID`, `SCHOOLDIGGER_APP_KEY`, `SCHOOLDIGGER_BASE_URL`

**Updated:**
- `lib/navigator/schools.ts`
  - Replaced GreatSchools API v2 with SchoolDigger API v2.3
  - Removed geocoding logic (SchoolDigger searches by ZIP directly)
  - Updated rating conversion: SchoolDigger uses 1-5 stars → converted to 0-10 scale
  - New cache key: `sd:zip:v1:${zip}` (busts old GreatSchools cache)
  - Improved error handling with console logging

### Phase 2: Google API Consolidation ✅

**Unified API Key:** All Google services now use `GOOGLE_API_KEY` (previously split between `GOOGLE_API_KEY` and `GOOGLE_MAPS_API_KEY`)

**Updated Files:**
- `lib/navigator/distance.ts` - Changed to `GOOGLE_API_KEY`
- `lib/navigator/amenities.ts` - Changed to `GOOGLE_API_KEY`, updated cache key to `gplaces:amenities:v1:${zip}`
- `lib/navigator/military.ts` - Changed to `GOOGLE_API_KEY`, updated cache key to `gplaces:military:v1:${zip}`

**Services Consolidated:**
1. Google Weather API (weather comfort index)
2. Google Distance Matrix API (commute calculations)
3. Google Places API (amenities search)
4. Google Places API (military facilities search)

### Phase 3: Crime Data Removal ✅

**Deleted:**
- `lib/navigator/crime.ts` - Removed FBI crime API integration entirely

**Updated Scoring Algorithm (`lib/navigator/score.ts`):**
- Removed `safetyScore100()` function
- Removed `safety10` parameter from `familyFitScore100()`
- Redistributed weights:
  - Schools: 30% → **35%** (+5%)
  - Amenities: 5% → **8%** (+3%)
  - Demographics: 3% → **5%** (+2%)
  - Safety: 10% → **REMOVED**
  - Total: 100% (verified)

**Updated API Route (`app/api/navigator/base/route.ts`):**
- Removed `fetchCrimeData` import and parallel fetch call
- Removed `safety10` from scoring function call
- Removed `crime_data` from neighborhood card payload

**Updated TypeScript Types (`app/types/navigator.ts`):**
- Removed `safety` field from `NeighborhoodCard.subscores`
- Removed `crime_data` object from `NeighborhoodCard.payload`

**Updated UI (`app/dashboard/navigator/[base]/BaseNavigatorClient.tsx`):**
- Removed "Safety (10%)" subscore display card
- Removed "Safety & Crime" detail section
- Updated weight labels:
  - Schools: 30% → 35%
  - Amenities: 5% → 8%

### Phase 4: SSOT & Documentation Updates ✅

**Updated `lib/ssot.ts`:**

**Vendors Section:**
- Added note: "Google API Consolidation (Updated 2025-10-29)"
- Added `distance` vendor entry for Google Distance Matrix API
- Updated `schools` vendor:
  - Name: GreatSchools → **SchoolDigger**
  - API URL: `https://api.schooldigger.com/v2.3`
  - Cache: 30 days → 1 day
  - API Key: `SCHOOLDIGGER_APP_ID + SCHOOLDIGGER_APP_KEY`
  - Added `ratingScale: "1-5 stars (converted to 0-10)"`
- Removed `crime` vendor entry
- Updated all Google vendor entries with `apiKey: "GOOGLE_API_KEY"` field
- Updated `demographics` vendor note to clarify it uses hardcoded defaults

**Environment Validation:**
- Added `SCHOOLDIGGER_APP_ID` to required env vars
- Added `SCHOOLDIGGER_APP_KEY` to required env vars
- Removed `GREAT_SCHOOLS_API_KEY` (no longer used)
- Removed `CRIME_API_KEY` (no longer used)
- Updated comment: "Consolidated Google API key (weather, distance, amenities, military)"

### Phase 5: Test Script Updates ✅

**Updated `scripts/test-navigator-apis.ts`:**
- Removed `fetchCrimeData` import
- Removed Test 5 (Crime & Safety API test)
- Renumbered tests 6-8 → 5-7
- Updated integration test:
  - Removed crime data fetch
  - Removed `safety10` from scoring call
  - Updated weight display: Schools 30% → 35%, Amenities 5% → 8%, removed Safety 10%
  - Updated weight verification array: `[0.35, 0.25, 0.15, 0.10, 0.08, 0.05, 0.02]`
- Updated environment variables guide:
  - Added `GOOGLE_API_KEY` (consolidated)
  - Added `SCHOOLDIGGER_APP_ID`
  - Added `SCHOOLDIGGER_APP_KEY`
  - Removed `GOOGLE_WEATHER_API_KEY`
  - Removed `GREAT_SCHOOLS_API_KEY`
  - Removed `GOOGLE_MAPS_API_KEY`
  - Removed `CRIME_API_KEY`

## Environment Variables Required

### New/Changed:
```bash
# SchoolDigger API (NEW)
SCHOOLDIGGER_APP_ID=your_app_id
SCHOOLDIGGER_APP_KEY=your_app_key
SCHOOLDIGGER_BASE_URL=https://api.schooldigger.com/v2.3  # Optional
SCHOOLDIGGER_TIMEOUT_MS=6000  # Optional
SCHOOLDIGGER_CACHE_TTL_SEC=86400  # Optional

# Google Services (CONSOLIDATED)
GOOGLE_API_KEY=your_google_api_key  # Now handles ALL Google services
```

### Removed:
```bash
# No longer needed:
GOOGLE_MAPS_API_KEY  # Replaced by GOOGLE_API_KEY
GREAT_SCHOOLS_API_KEY  # Replaced by SchoolDigger
CRIME_API_KEY  # Removed entirely
```

### Unchanged:
```bash
RAPIDAPI_KEY=your_rapidapi_key
ZILLOW_RAPIDAPI_HOST=zillow-com1.p.rapidapi.com
ZILLOW_RAPIDAPI_KEY=your_zillow_key  # Or use RAPIDAPI_KEY
```

## API Scoring Weights (Updated)

| Factor | Old Weight | New Weight | Change |
|--------|-----------|-----------|--------|
| Schools | 30% | **35%** | +5% |
| Rent vs BAH | 25% | 25% | - |
| Commute | 15% | 15% | - |
| Weather | 10% | 10% | - |
| **Safety** | **10%** | **REMOVED** | **-10%** |
| Amenities | 5% | **8%** | +3% |
| Demographics | 3% | **5%** | +2% |
| Military | 2% | 2% | - |
| **TOTAL** | **100%** | **100%** | ✅ |

## Files Modified

### Created (1):
- `lib/vendors/schooldigger.ts`

### Modified (8):
- `lib/navigator/schools.ts`
- `lib/navigator/distance.ts`
- `lib/navigator/amenities.ts`
- `lib/navigator/military.ts`
- `lib/navigator/score.ts`
- `app/api/navigator/base/route.ts`
- `app/types/navigator.ts`
- `app/dashboard/navigator/[base]/BaseNavigatorClient.tsx`
- `lib/ssot.ts`
- `scripts/test-navigator-apis.ts`

### Deleted (1):
- `lib/navigator/crime.ts`

## Testing Checklist

- [x] SchoolDigger API wrapper created with proper auth
- [x] Schools provider updated to use SchoolDigger
- [x] Rating conversion (1-5 → 0-10) implemented
- [x] Google API key consolidated across all services
- [x] Crime provider deleted
- [x] Scoring algorithm updated (safety removed, weights redistributed)
- [x] API route updated (crime fetch removed)
- [x] TypeScript types updated (crime fields removed)
- [x] UI updated (safety/crime sections removed, weight labels updated)
- [x] SSOT vendor configs updated
- [x] Environment validation updated
- [x] Test script updated
- [x] No linter errors

## Next Steps for Deployment

1. **Add Environment Variables to Vercel:**
   ```bash
   SCHOOLDIGGER_APP_ID=<your_app_id>
   SCHOOLDIGGER_APP_KEY=<your_app_key>
   GOOGLE_API_KEY=<your_consolidated_google_key>
   ```

2. **Remove Old Environment Variables from Vercel:**
   - `GOOGLE_MAPS_API_KEY` (now using `GOOGLE_API_KEY`)
   - `GREAT_SCHOOLS_API_KEY` (now using SchoolDigger)
   - `CRIME_API_KEY` (removed entirely)

3. **Test Navigator on Staging:**
   - Pick test ZIP codes near JBLM (98498, 98433, etc.)
   - Verify schools load from SchoolDigger
   - Verify ratings display correctly (0-10 scale)
   - Verify no crime/safety data appears in UI
   - Verify scoring weights add up to 100%

4. **Monitor API Usage:**
   - SchoolDigger API rate limits
   - Google API consolidation working correctly
   - Cache hit rates for new cache keys

## Migration Notes

### Cache Busting:
- Schools cache key changed: `gs:zip:v2:*` → `sd:zip:v1:*`
- Amenities cache key changed: `amenities:v4:*` → `gplaces:amenities:v1:*`
- Military cache key changed: `military:v4:*` → `gplaces:military:v1:*`
- Old cached data will be ignored, new data will be fetched

### Database:
- No database migrations required
- `neighborhood_profiles` table schema unchanged
- Crime fields in old records will simply be ignored (no cleanup needed)

### User Impact:
- **Positive:** More accurate school ratings from SchoolDigger
- **Positive:** Simplified API key management (one Google key)
- **Neutral:** Crime data removed (wasn't being used heavily)
- **Positive:** Schools now weighted 35% instead of 30% (more aligned with user needs)

## Author

Base Navigator Revamp - October 29, 2025
Implemented by: AI Assistant (Claude Sonnet 4.5)
Approved by: User


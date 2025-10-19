# Google Weather API - Vendor Documentation

**Last Updated:** 2025-01-19  
**Status:** ✅ Active  
**Tier:** Free & Premium

---

## Provider Information

**Service:** Google Weather API  
**Aggregator:** RapidAPI  
**Endpoint:** `https://google-weather.p.rapidapi.com/weather`  
**Documentation:** https://rapidapi.com/apishub/api/google-weather

---

## Licensing & Terms of Service

### Usage Rights
- ✅ Commercial use permitted
- ✅ Display weather data with attribution
- ✅ Cache for up to 24 hours
- ⚠️ Must include "Powered by Google" attribution

### Restrictions
- ❌ No data reselling
- ❌ No bulk data downloads
- ❌ No removal of attribution

### Attribution Requirements
**Required:** "Weather data provided by Google"  
**Placement:** Near weather display (card footer or provenance popover)

---

## Technical Details

### API Configuration
```typescript
// From lib/ssot.ts
{
  name: "Google Weather API",
  provider: "RapidAPI",
  cacheDays: 1,
  cacheHours: 24,
  attribution: "Google"
}
```

### Rate Limits
- **Free Tier:** 500 requests/month
- **Basic Plan:** 10,000 requests/month ($19.99)
- **Pro Plan:** 100,000 requests/month ($99.99)
- **Current Plan:** Basic ($19.99/month)

### Request Format
```bash
GET https://google-weather.p.rapidapi.com/weather
Headers:
  - X-RapidAPI-Key: ${RAPIDAPI_KEY}
  - X-RapidAPI-Host: google-weather.p.rapidapi.com
Query Params:
  - q: "city,state" or "lat,lng"
```

### Response Schema
```json
{
  "location": {
    "name": "Fort Bragg",
    "region": "North Carolina",
    "country": "USA"
  },
  "current": {
    "temp_c": 15.0,
    "temp_f": 59.0,
    "condition": {
      "text": "Partly cloudy",
      "icon": "//cdn.weatherapi.com/..."
    },
    "humidity": 65,
    "wind_kph": 12.0,
    "wind_mph": 7.5,
    "feelslike_f": 57.0
  }
}
```

---

## Caching Strategy

### Cache Duration
- **TTL:** 24 hours (1 day)
- **Rationale:** Weather changes daily; hourly updates unnecessary for base planning
- **Storage:** Supabase `base_external_data` table

### Cache Keys
```typescript
const cacheKey = `weather:${baseId}:${date}`;
```

### Cache Invalidation
- Automatic after 24 hours
- Manual invalidation via admin panel (if needed)

---

## Cost Analysis

### Current Usage (Projected)
- **Bases:** 203 total
- **Requests/day:** ~100 (average user visits)
- **Requests/month:** ~3,000
- **Cost/month:** $19.99 (Basic Plan)
- **Cost/request:** $0.0067

### Optimization
- ✅ 24-hour caching reduces API calls by 96%
- ✅ Only fetch on user view (no pre-caching)
- ✅ Fallback to "Unavailable" if API fails

---

## Error Handling

### Common Errors
1. **429 Too Many Requests** → Show cached data or "Unavailable"
2. **500 Server Error** → Retry with exponential backoff (3 attempts)
3. **Invalid Location** → Fallback to coordinates instead of city/state

### User Experience
```typescript
// If API fails after retries:
"Weather data temporarily unavailable. 
Check [NOAA](https://www.weather.gov) for current conditions."
```

---

## Compliance & Security

### API Key Management
- ✅ Stored in Vercel environment variables
- ✅ Never exposed to client-side code
- ✅ Server-side API route only (`/api/base-weather`)
- ✅ Rate limiting on endpoint (prevent abuse)

### Data Privacy
- ✅ No PII collected
- ✅ Location data is installation address (public info)
- ✅ No user tracking in weather requests

---

## Provenance UI Implementation

### Required Elements
1. **Source:** "Google"
2. **Last Fetched:** ISO timestamp (converted to relative time)
3. **Cache TTL:** "Updated daily"
4. **Attribution Link:** Link to Google Weather or weather.gov

### Example Implementation
```tsx
<ProvenancePopover
  source="Google"
  lastFetched={weatherData.cached_at}
  cacheTTL="24 hours"
  attributionUrl="https://www.weather.gov"
/>
```

---

## Testing Checklist

- [ ] Weather displays for CONUS bases
- [ ] Weather displays for OCONUS bases
- [ ] Caching works (no duplicate requests within 24h)
- [ ] Attribution visible in UI
- [ ] Error handling graceful (retry + fallback)
- [ ] Provenance popover shows correct info
- [ ] Rate limiting prevents abuse

---

## Monitoring & Alerts

### Key Metrics
- **API Success Rate:** Target > 99%
- **Cache Hit Rate:** Target > 95%
- **Average Response Time:** Target < 500ms

### Alerts
- ⚠️ If daily requests exceed 300 → Check for abuse
- ⚠️ If error rate > 5% → Investigate API status
- ⚠️ If approaching monthly limit → Upgrade plan

---

## Alternative Providers (Backup)

### Option 1: OpenWeatherMap
- **Cost:** $40/month for 60,000 calls
- **Pros:** More detailed forecasts
- **Cons:** More expensive

### Option 2: Weather.gov (NOAA)
- **Cost:** Free
- **Pros:** No API limits, official data
- **Cons:** CONUS only, no OCONUS coverage

### Recommendation
Stick with Google Weather for global coverage. Add weather.gov as fallback for CONUS bases if rate limits hit.

---

## Changelog

### 2025-01-19 - Initial Documentation
- Documented Google Weather API integration
- Established 24-hour caching policy
- Set attribution requirements
- Created error handling standards

---

**Maintained by:** Garrison Ledger Engineering  
**Review Schedule:** Quarterly (check ToS changes, pricing updates)


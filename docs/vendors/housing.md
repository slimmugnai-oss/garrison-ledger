# Zillow Housing Market Data - Vendor Documentation

**Last Updated:** 2025-01-19  
**Status:** ✅ Active  
**Tier:** Free & Premium

---

## Provider Information

**Service:** Zillow Real Estate API  
**Aggregator:** RapidAPI  
**Endpoint:** `https://zillow-com1.p.rapidapi.com`  
**Documentation:** https://rapidapi.com/apimaker/api/zillow-com1

---

## Licensing & Terms of Service

### Usage Rights
- ✅ Display aggregated market statistics
- ✅ Show median home prices, rent estimates
- ✅ Cache for up to 30 days
- ⚠️ Must attribute data to Zillow

### Restrictions
- ❌ No individual property listings (violates Zillow ToS)
- ❌ No automated valuation tools (Zestimate is Zillow IP)
- ❌ No data reselling or bulk downloads
- ❌ Cannot claim data accuracy (must show as estimates)

### Attribution Requirements
**Required:** "Housing data powered by Zillow"  
**Placement:** Housing card footer or provenance popover  
**Link:** Optional link to Zillow.com for market details

---

## Technical Details

### API Configuration
```typescript
// From lib/ssot.ts
{
  name: "Zillow Market Data",
  provider: "RapidAPI",
  cacheDays: 30,
  attribution: "Zillow"
}
```

### Rate Limits
- **Free Tier:** 50 requests/month (not viable)
- **Basic Plan:** 500 requests/month ($29.99)
- **Pro Plan:** 5,000 requests/month ($149.99)
- **Current Plan:** Basic ($29.99/month)

### Request Format
```bash
GET https://zillow-com1.p.rapidapi.com/propertyExtendedSearch
Headers:
  - X-RapidAPI-Key: ${RAPIDAPI_KEY}
  - X-RapidAPI-Host: zillow-com1.p.rapidapi.com
Query Params:
  - location: "city, state"
  - status_type: "ForSale" or "ForRent"
  - home_type: "Houses"
```

### Response Schema (Aggregated)
```json
{
  "resultsPerPage": 40,
  "totalResultCount": 250,
  "props": [
    {
      "price": "$350,000",
      "bedrooms": 3,
      "bathrooms": 2,
      "area": 1500,
      "address": "City, ST"
    }
  ],
  "medianPrice": 375000,
  "priceRange": {
    "min": 200000,
    "max": 850000
  }
}
```

---

## Caching Strategy

### Cache Duration
- **TTL:** 30 days
- **Rationale:** Housing markets don't change drastically week-to-week; monthly updates sufficient for base planning
- **Storage:** Supabase `base_external_data` table

### Cache Keys
```typescript
const cacheKey = `housing:${baseId}:${month}`;
```

### Cache Invalidation
- Automatic after 30 days
- Manual refresh button (uses 1 API call)
- Admin can force refresh

---

## Cost Analysis

### Current Usage (Projected)
- **Bases:** 203 total
- **Unique Markets:** ~150 (some bases share cities)
- **Requests/month:** ~150 (initial load) + ~50 (refreshes)
- **Total/month:** ~200 requests
- **Cost/month:** $29.99 (Basic Plan)
- **Cost/request:** $0.15

### Optimization
- ✅ 30-day caching reduces API calls by 97%
- ✅ Aggregate data only (no per-property calls)
- ✅ Fallback to "Unavailable" if API fails
- ✅ Group nearby bases (e.g., Fort Bragg + Pope AAF share Fayetteville market)

---

## Data We Show (Compliant)

### ✅ Allowed
1. **Median Home Price:** $375,000
2. **Price Range:** $200K - $850K
3. **Inventory Count:** 250 homes for sale
4. **Market Trend:** ↑ Prices rising 3% vs last month
5. **Rent Estimates:** Median $1,800/month

### ❌ Prohibited
1. Individual property addresses
2. Zestimate tool or valuation calculator
3. Claiming "official" values (must say "estimates")
4. Comparing Zillow to other sources without attribution

---

## Error Handling

### Common Errors
1. **429 Too Many Requests** → Show cached data or "Unavailable"
2. **Invalid Location** → Try ZIP code instead of city name
3. **No Data Available** → "Housing data not available for this area. Check [Zillow](https://zillow.com)"

### User Experience
```typescript
// If no housing data:
"Housing market data unavailable for this location. 
Visit [Zillow](https://zillow.com) for current listings."
```

---

## Compliance & Security

### API Key Management
- ✅ Stored in Vercel environment variables
- ✅ Server-side only (`/api/base-housing`)
- ✅ Rate limiting on endpoint
- ✅ Never exposed to client

### Data Privacy
- ✅ No PII collected
- ✅ Aggregate market stats only
- ✅ No user tracking in housing requests

---

## Provenance UI Implementation

### Required Elements
1. **Source:** "Zillow"
2. **Last Fetched:** ISO timestamp
3. **Cache TTL:** "Updated monthly"
4. **Attribution Link:** https://zillow.com
5. **Disclaimer:** "Estimates only. Not official valuations."

### Example Implementation
```tsx
<ProvenancePopover
  source="Zillow"
  lastFetched={housingData.cached_at}
  cacheTTL="30 days"
  attributionUrl="https://zillow.com"
  disclaimer="Market estimates. Actual prices may vary."
/>
```

---

## Testing Checklist

- [ ] Housing data displays for major markets
- [ ] Caching works (no duplicate requests within 30 days)
- [ ] Attribution visible ("Powered by Zillow")
- [ ] No individual property listings shown
- [ ] Error handling graceful (retry + fallback)
- [ ] Provenance popover shows disclaimer
- [ ] Rate limiting prevents abuse

---

## Monitoring & Alerts

### Key Metrics
- **API Success Rate:** Target > 95% (some markets may not have data)
- **Cache Hit Rate:** Target > 98%
- **Average Response Time:** Target < 1000ms

### Alerts
- ⚠️ If monthly requests exceed 400 → Investigate caching issues
- ⚠️ If error rate > 10% → Check API status or location format
- ⚠️ If approaching 500 request limit → Upgrade to Pro plan

---

## Alternative Providers (Backup)

### Option 1: Realtor.com API
- **Cost:** ~$50/month for similar limits
- **Pros:** More reliable, better documentation
- **Cons:** More expensive

### Option 2: Redfin (No Public API)
- **Status:** No official API available

### Option 3: Manual Data Entry
- **Fallback:** For high-traffic bases, manually research and enter median prices monthly
- **Pros:** No API costs, full control
- **Cons:** Labor-intensive, scalability issues

### Recommendation
Stick with Zillow for now. If costs become prohibitive, consider manual data entry for top 50 bases only.

---

## Legal Considerations

### Zillow Terms of Service Compliance
1. **No scraping** - Using official API only ✅
2. **Attribution required** - Displayed in UI ✅
3. **No valuations** - Showing market stats only ✅
4. **No data resale** - For platform use only ✅
5. **No misleading claims** - Labeled as "estimates" ✅

### Risk Assessment
- **Low Risk:** Using official API with proper attribution
- **Compliance Review:** Annual check of Zillow ToS changes
- **Legal Contact:** Consider Zillow partnership for high-volume usage

---

## Changelog

### 2025-01-19 - Initial Documentation
- Documented Zillow API integration
- Established 30-day caching policy
- Set strict compliance guidelines (no property listings)
- Created error handling and fallback strategy

---

**Maintained by:** Garrison Ledger Engineering  
**Review Schedule:** Quarterly (check ToS changes, pricing updates, legal compliance)  
**Legal Review:** Annual (ensure compliance with Zillow ToS)


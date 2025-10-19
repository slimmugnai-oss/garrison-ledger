# GreatSchools API - Vendor Documentation

**Last Updated:** 2025-01-19  
**Status:** 🔄 Planned (Not Yet Implemented)  
**Tier:** Premium Only

---

## Provider Information

**Service:** GreatSchools Ratings API  
**Direct Integration:** Yes (no aggregator)  
**Endpoint:** `https://api.greatschools.org/schools`  
**Documentation:** https://www.greatschools.org/api/

---

## Licensing & Terms of Service

### Partnership Requirements
- ⚠️ **Requires Partnership Agreement** - Cannot use without formal partnership
- ⚠️ **Application Process** - Must apply and be approved
- ⚠️ **Commercial Use Review** - GreatSchools reviews business model

### Usage Rights (Once Approved)
- ✅ Display school ratings with attribution
- ✅ Show school profiles (name, address, rating)
- ✅ Link to GreatSchools.org for full details
- ⚠️ Must include prominent GreatSchools branding

### Restrictions
- ❌ No rating modifications or recalculations
- ❌ No data storage beyond 30 days
- ❌ No bulk downloads
- ❌ Cannot remove GreatSchools branding
- ❌ Cannot compete with GreatSchools products

### Attribution Requirements
**Required:** "School ratings provided by GreatSchools"  
**Logo:** GreatSchools logo must be visible  
**Link:** All school names must link to GreatSchools.org profiles  
**Disclaimer:** "Ratings are not endorsements. Visit school for verification."

---

## Technical Details

### API Configuration
```typescript
// From lib/ssot.ts
{
  name: "GreatSchools",
  provider: "Direct API",
  gated: true, // Premium only
  cacheDays: 30,
  tier: "premium"
}
```

### Rate Limits
- **Free Tier:** Not available
- **Partnership Plan:** Negotiated (typically 10,000 requests/month)
- **Enterprise Plan:** Custom pricing
- **Current Plan:** Not yet activated (pending partnership application)

### Request Format
```bash
GET https://api.greatschools.org/schools/nearby
Headers:
  - X-API-Key: ${GREATSCHOOLS_API_KEY}
Query Params:
  - lat: 35.1381
  - lon: -79.0190
  - radius: 10 (miles)
  - limit: 10
```

### Response Schema
```json
{
  "schools": [
    {
      "id": "12345",
      "name": "Fort Bragg Elementary School",
      "type": "public",
      "gradeRange": "K-5",
      "rating": 8,
      "parentRating": 4.5,
      "address": {
        "street": "123 Main St",
        "city": "Fort Bragg",
        "state": "NC",
        "zip": "28310"
      },
      "distance": 2.3,
      "enrollment": 450,
      "profileUrl": "https://www.greatschools.org/north-carolina/fort-bragg/12345-Fort-Bragg-Elementary-School/"
    }
  ]
}
```

---

## Caching Strategy

### Cache Duration
- **TTL:** 30 days
- **Rationale:** School ratings change annually; monthly updates sufficient
- **Storage:** Supabase `base_external_data` table

### Cache Keys
```typescript
const cacheKey = `schools:${baseId}:${month}`;
```

### Cache Invalidation
- Automatic after 30 days
- Manual refresh (Premium users only)
- No cache for Free tier (feature gated)

---

## Cost Analysis

### Partnership Pricing (Estimated)
- **Setup Fee:** $500 (one-time, application review)
- **Monthly Fee:** $99/month (10,000 requests)
- **Per-Request Overage:** $0.02
- **Annual Contract:** Likely required

### Projected Usage
- **Bases:** 203 total
- **Schools/Base:** Average 5-10 nearby schools
- **Initial Load:** ~1,500 requests (all bases × 7 schools avg)
- **Monthly Refreshes:** ~200 requests (assuming 10% of users visit schools tab)
- **Total/month:** ~1,700 requests
- **Cost/month:** $99 (within limits)

### ROI Analysis
- **Cost/month:** $99
- **Premium Users Needed:** 10 (at $9.99/month)
- **Break-Even:** 10 Premium users
- **Current Premium Users:** TBD
- **Recommendation:** Launch when Premium user count > 20 (for buffer)

---

## Implementation Status

### ✅ Completed
- Research and documentation
- Schema design
- UI mockups
- SSOT configuration

### ⏳ Pending
1. **Partnership Application** (2-4 weeks approval time)
2. **Legal Review** (terms agreement)
3. **API Key Acquisition**
4. **Development** (2-3 days)
5. **Testing** (1 day)
6. **Deployment** (Premium users only)

### 🚫 Blockers
- **Partnership approval required** - Cannot use API without it
- **Minimum user threshold** - Need 20+ Premium users for ROI
- **Legal review** - Terms may have restrictions

---

## Data We Show (Compliant)

### ✅ Allowed
1. **GreatSchools Rating:** 1-10 scale
2. **Parent Rating:** Stars (out of 5)
3. **School Type:** Public, Private, Charter
4. **Grade Range:** K-5, 6-8, 9-12
5. **Enrollment:** Student count
6. **Distance:** From base (miles)
7. **Link:** To GreatSchools.org profile

### ❌ Prohibited
1. Modifying ratings (showing different scale)
2. Aggregating ratings without attribution
3. Claiming endorsement or verification
4. Storing ratings beyond 30 days
5. Creating "best schools" lists without GreatSchools permission

---

## Error Handling

### Common Errors
1. **401 Unauthorized** → API key invalid or partnership expired
2. **429 Too Many Requests** → Rate limit exceeded (show cached data)
3. **No Schools Found** → "No schools in database for this area"

### User Experience
```typescript
// If no school data:
"School ratings unavailable for this location. 
Visit [GreatSchools.org](https://greatschools.org) to research schools near this base."

// If API fails (Premium users):
"School data temporarily unavailable. 
Visit [GreatSchools](https://greatschools.org) for current ratings."
```

---

## Compliance & Security

### API Key Management
- ✅ Stored in Vercel environment variables
- ✅ Server-side only (`/api/base-schools`)
- ✅ Gated behind Premium tier check
- ✅ Rate limiting on endpoint

### Data Privacy
- ✅ No PII collected (school data is public)
- ✅ No student data involved
- ✅ Location data is installation address only

---

## Provenance UI Implementation

### Required Elements
1. **Source:** "GreatSchools" with logo
2. **Last Fetched:** ISO timestamp
3. **Cache TTL:** "Updated monthly"
4. **Attribution Link:** https://greatschools.org
5. **Disclaimer:** "Ratings are not endorsements. Visit schools for verification."
6. **CTA:** "View full profile on GreatSchools.org" (linked)

### Example Implementation
```tsx
<ProvenancePopover
  source="GreatSchools"
  logo="/logos/greatschools.png"
  lastFetched={schoolsData.cached_at}
  cacheTTL="30 days"
  attributionUrl="https://greatschools.org"
  disclaimer="School ratings provided by GreatSchools. Visit schools to verify information."
/>

// Each school card must link to GreatSchools profile
<a href={school.profileUrl} target="_blank" rel="noopener">
  View full profile on GreatSchools.org
</a>
```

---

## Testing Checklist

- [ ] Partnership application submitted
- [ ] API key acquired and stored securely
- [ ] Premium tier gating works (Free users see upsell)
- [ ] Schools display correctly (CONUS bases)
- [ ] GreatSchools logo and branding visible
- [ ] All school names link to GreatSchools.org
- [ ] Caching works (30-day TTL)
- [ ] Error handling graceful (API failures)
- [ ] Disclaimer visible ("not endorsements")

---

## Monitoring & Alerts

### Key Metrics
- **API Success Rate:** Target > 98%
- **Cache Hit Rate:** Target > 99% (schools rarely change)
- **Average Response Time:** Target < 800ms

### Alerts
- ⚠️ If monthly requests exceed 8,000 → Investigate caching issues
- ⚠️ If error rate > 5% → Check API key expiration
- ⚠️ If partnership expires → Urgent renewal needed

---

## Alternative Providers (Backup)

### Option 1: Niche.com
- **API:** Available via partnership
- **Cost:** Similar to GreatSchools (~$100/month)
- **Pros:** More detailed reviews, college prep data
- **Cons:** Less recognized brand

### Option 2: School Digger
- **API:** Public API available
- **Cost:** $49/month
- **Pros:** Cheaper, easier to integrate
- **Cons:** Less authoritative, smaller dataset

### Option 3: Manual Data Entry
- **Fallback:** For top 50 bases, manually research and list schools
- **Pros:** No API costs
- **Cons:** Not scalable, no ratings

### Recommendation
Apply for GreatSchools partnership (most trusted brand). If rejected, try Niche.com. SchoolDigger as last resort.

---

## Legal Considerations

### GreatSchools Partnership Agreement
- **Non-Compete:** Cannot build competing school rating product
- **Data Use:** Display only, no derivative works
- **Termination:** Can revoke API access with 30 days notice
- **Liability:** Not liable for rating accuracy (disclaimer required)

### Risk Assessment
- **Medium Risk:** Partnership can be revoked; build fallback
- **Compliance Review:** Quarterly check of terms
- **Legal Contact:** Have terms reviewed by attorney before signing

---

## Launch Criteria

**Do NOT launch until:**
1. ✅ Partnership agreement signed
2. ✅ API key obtained and tested
3. ✅ Premium user count ≥ 20 (for ROI)
4. ✅ Legal review complete
5. ✅ Provenance UI implemented
6. ✅ Error handling tested
7. ✅ Disclaimers visible

**Estimated Launch:** Q2 2025 (pending partnership approval)

---

## Changelog

### 2025-01-19 - Initial Documentation
- Researched GreatSchools API requirements
- Documented partnership process
- Established Premium-only tier gating
- Set ROI threshold (20+ Premium users)
- Created compliance checklist

---

**Maintained by:** Garrison Ledger Engineering  
**Review Schedule:** Quarterly (check partnership status, ToS changes)  
**Legal Review:** Annual (ensure compliance, renewal negotiations)


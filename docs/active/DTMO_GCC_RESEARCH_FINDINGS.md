# DTMO GCC Rate Research Findings

**Date:** October 27, 2025  
**Status:** Phase 1 Research - In Progress  
**Purpose:** Locate and acquire official DTMO Government Constructed Cost (GCC) rate tables for accurate PPM calculations

---

## RESEARCH SUMMARY

### What We Need
- **GCC Rate Tables**: Official DoD rates for calculating Personally Procured Move (PPM) reimbursements
- **Structure**: Weight brackets × Distance bands × Geographic zones × Seasonal factors
- **Current Year**: 2025 fiscal year rates
- **Format**: Programmatically accessible (CSV, JSON, API, or Excel)

### Key Official Sources

1. **move.mil** - Official DoD moving portal
   - URL: https://www.move.mil/
   - Has PPM estimator calculator
   - Likely uses backend API for GCC rates

2. **Defense Travel Management Office (DTMO)**
   - URL: https://www.travel.dod.mil/
   - Joint Travel Regulations (JTR) official source
   - Appendix K may contain rate tables

3. **USTRANSCOM** - US Transportation Command
   - Manages DoD household goods shipping
   - May publish baseline cost schedules

4. **GSA Per Diem API**
   - URL: https://api.gsa.gov/travel/
   - Has per diem rates (confirmed in use)
   - May not have PPM/GCC rates

---

## FINDINGS FROM CODE AUDIT

### Current PPM Implementation (Simplified)

**File:** `lib/pcs/calculation-engine.ts` (lines 271-311)

```typescript
function calculatePPM(weight: number, distance: number, rank: string) {
  // Simplified PPM calculation (would use actual GCC rates)
  const rate = 0.95; // 95% of government cost
  const amount = actualWeight * distance * rate * 0.001; // Simplified formula
}
```

**Issues:**
- ❌ Does not use official GCC rate tables
- ❌ Oversimplified: `weight × distance × 0.95 × 0.001`
- ❌ No weight brackets, distance bands, or seasonal factors
- ❌ Confidence marked as 90% (should be 100% with real rates)

### Alternative PPM Calculation Found

**File:** `app/api/pcs/estimate/route.ts` (lines 154-175)

```typescript
// Get net weight from weigh tickets
weighTickets.forEach((ticket) => {
  const data = ticket.normalized_data as { net_weight?: number };
  if (data.net_weight) {
    ppmWeight += data.net_weight;
  }
});

// Estimate government cost (simplified - actual uses DoD rate tables)
const estimatedGCC = (ppmWeight / 1000) * maltMiles * 0.85; // Rough estimate
ppmEstimate = estimatedGCC * PPM_PAYMENT_PERCENTAGE;
```

**Key Insight:**
- Uses `PPM_PAYMENT_PERCENTAGE` constant
- Formula: `(weight / 1000) × miles × 0.85 × PPM_PERCENTAGE`
- Still simplified, but closer to actual structure

---

## GCC RATE STRUCTURE (Expected)

Based on industry knowledge and DoD regulations:

### 1. Weight Brackets
- Increments: Likely 100 lb or 500 lb steps
- Range: 0 lbs to 18,000 lbs (max for O-6+)
- Example: 0-500, 501-1000, 1001-1500, etc.

### 2. Distance Bands
- Short: 0-50 miles
- Medium: 51-150, 151-300, 301-500 miles
- Long: 501-1000, 1001-2000, 2000+ miles
- Rate per weight unit decreases with longer distances (economies of scale)

### 3. Geographic Zones
- CONUS (Continental US)
- Alaska (AK)
- Hawaii (HI)
- OCONUS (Overseas)
- Inter-zone rates (e.g., CONUS to AK)

### 4. Seasonal Factors
- **Peak Season** (May 15 - Aug 31): +10-15% multiplier
- **Non-Peak** (Sep 1 - May 14): Base rate
- Reflects higher commercial moving costs in summer

### 5. PPM Payment Rate
- Standard: 95-100% of GCC
- Incentive: Government pays percentage of what it would cost them
- Service member keeps difference if move costs less

---

## DATA ACQUISITION STRATEGIES

### Strategy 1: Reverse-Engineer move.mil Calculator (RECOMMENDED)

**Approach:**
1. Visit https://www.move.mil/moving-guide/ppm
2. Open browser DevTools → Network tab
3. Input sample PCS move data
4. Monitor API calls when "Calculate" clicked
5. Identify backend endpoint and payload structure
6. Document API parameters and response format

**Pros:**
- ✅ Most likely to have current 2025 rates
- ✅ API may be publicly accessible
- ✅ Data format already optimized for digital use

**Cons:**
- ⚠️ May require authentication
- ⚠️ Terms of service may prohibit automated access
- ⚠️ Rate limiting may apply

**Next Steps:**
- [ ] Test move.mil calculator with sample data
- [ ] Inspect network requests
- [ ] Document API structure
- [ ] Check for authentication requirements

---

### Strategy 2: Request Official Data from DTMO

**Approach:**
1. Email: usarmy.sddc.mbx.dtmo-public-affairs@army.mil
2. Subject: "Request for 2025 GCC Rate Tables - Military Financial Planning Software"
3. Explain: Building PCS planning tool for service members
4. Request: CSV/Excel export of official GCC rate tables
5. Ask: Update schedule, data format, licensing terms

**Email Template:**
```
Subject: Request for 2025 GCC Rate Tables - Military Financial Planning Software

Dear DTMO Public Affairs,

I am developing a financial planning tool (Garrison Ledger) to help service members 
accurately calculate their PCS entitlements, including PPM reimbursements. To provide 
accurate calculations, I need access to the official 2025 Government Constructed Cost 
(GCC) rate tables.

Could you please provide:
1. Current GCC rate tables (weight/distance matrix)
2. Data format (CSV, Excel, or API access)
3. Update schedule (when new rates published)
4. Licensing/usage terms for third-party applications

This tool aims to reduce financial surprises and ensure service members claim all 
entitled benefits correctly.

Thank you for your assistance.
```

**Pros:**
- ✅ Official source with legal clarity
- ✅ Complete data with documentation
- ✅ Update notifications when rates change

**Cons:**
- ⚠️ May take 1-2 weeks for response
- ⚠️ May require formal data use agreement
- ⚠️ Manual data entry if only PDF provided

**Next Steps:**
- [ ] Draft and send email
- [ ] Follow up after 1 week if no response
- [ ] Coordinate data format requirements

---

### Strategy 3: JTR Appendix A Analysis

**Approach:**
1. Download Joint Travel Regulations (JTR)
2. Locate Appendix A - Transportation Allowances
3. Check for GCC rate tables or calculation formulas
4. Extract data manually if provided in PDF tables

**Sources:**
- https://www.travel.dod.mil/Policy-Regulations/Joint-Travel-Regulations/
- JTR Chapter 5: Permanent Duty Travel
- JTR Appendix A: Transportation Allowances

**Pros:**
- ✅ Publicly available official regulation
- ✅ No permission required
- ✅ Definitive source for calculations

**Cons:**
- ⚠️ May only contain formulas, not rate tables
- ⚠️ PDF format requires manual extraction
- ⚠️ May reference external rate schedules

**Next Steps:**
- [ ] Download latest JTR
- [ ] Search for GCC, PPM, or rate table references
- [ ] Document formulas if tables not included

---

### Strategy 4: Web Scraping move.mil (FALLBACK)

**Approach:**
1. Build automated script to query move.mil calculator
2. Iterate through weight/distance combinations
3. Collect GCC estimates for each scenario
4. Reverse-calculate base rate structure

**Example Queries:**
- Weight: 1000, 2000, 3000... 18000 lbs
- Distance: 100, 200, 300... 3000 miles
- Date: Various (to detect seasonal factors)

**Pros:**
- ✅ Guaranteed to get current rates
- ✅ Comprehensive coverage of all scenarios

**Cons:**
- ❌ May violate ToS (check first!)
- ❌ Time-intensive (18 × 30 = 540 queries minimum)
- ❌ Rate limiting will slow process
- ❌ Reverse-engineered data less reliable

**Next Steps:**
- [ ] Review move.mil Terms of Service
- [ ] Build proof-of-concept scraper
- [ ] Validate extracted rates against known values

---

### Strategy 5: Contact Commercial Moving Companies

**Approach:**
1. Research companies that handle military PPM moves
2. Ask if they use standardized GCC rate tables
3. Request sample rate data for verification

**Pros:**
- ✅ Industry expertise
- ✅ May have structured data files

**Cons:**
- ⚠️ Commercial rates may differ from official DoD rates
- ⚠️ Proprietary information restrictions
- ⚠️ Not authoritative source

**Status:** Low priority fallback option

---

## IMMEDIATE NEXT ACTIONS

### Action 1: Test move.mil Calculator (TODAY)

**Task:** Manually test PPM calculator and inspect network traffic

**Steps:**
1. Visit https://www.move.mil/moving-guide/ppm
2. Enter test data:
   - Origin: Fort Bragg, NC (ZIP 28310)
   - Destination: JBLM, WA (ZIP 98433)
   - Weight: 8,000 lbs
   - Move date: June 15, 2025
3. Open DevTools → Network tab
4. Click "Calculate" or "Get Estimate"
5. Look for API calls containing "ppm", "gcc", "rate", or "calculate"
6. Document:
   - Endpoint URL
   - Request payload
   - Response structure
   - Authentication headers

**Expected Outcome:**
- Find API endpoint with GCC rate data
- OR confirm calculator uses client-side formula (check JavaScript)

**Deliverable:** API documentation or formula extraction

---

### Action 2: Download JTR Documentation (TODAY)

**Task:** Get official regulation text

**Steps:**
1. Visit https://www.travel.dod.mil/Policy-Regulations/Joint-Travel-Regulations/
2. Download latest JTR (PDF or HTML)
3. Search for keywords:
   - "Government Constructed Cost"
   - "GCC"
   - "PPM payment"
   - "Appendix A"
   - "Rate schedule"
4. Extract relevant sections
5. Document formulas and references

**Expected Outcome:**
- Formula for GCC calculation
- Reference to external rate tables (if separate)
- Seasonal factor multipliers

**Deliverable:** JTR excerpts with calculation methodology

---

### Action 3: Draft DTMO Email (TODAY)

**Task:** Prepare formal data request

**Steps:**
1. Use template above
2. Add specific technical requirements:
   - CSV format preferred
   - JSON format acceptable
   - Need weight brackets, distance bands, zones, seasonal factors
3. Mention non-commercial use (military audience tool)
4. Request point of contact for technical questions
5. Send email

**Expected Response Time:** 3-5 business days

**Deliverable:** Sent email with tracking

---

## DECISION MATRIX

| Strategy | Time | Reliability | Legality | Completeness | Recommendation |
|----------|------|-------------|----------|--------------|----------------|
| move.mil API | 1 day | ⭐⭐⭐⭐⭐ | ✅ (if public) | ⭐⭐⭐⭐⭐ | **Try First** |
| DTMO Request | 1-2 weeks | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ | **Parallel Track** |
| JTR Analysis | 1-2 days | ⭐⭐⭐⭐ | ✅ | ⭐⭐⭐ | **Supplement** |
| Web Scraping | 3-5 days | ⭐⭐⭐ | ⚠️ Check ToS | ⭐⭐⭐⭐ | **Last Resort** |
| Commercial | 1 week | ⭐⭐ | ⚠️ Proprietary | ⭐⭐ | **Not Recommended** |

---

## SUCCESS CRITERIA

### Phase 1 Complete When:
- ✅ Located source of 2025 GCC rates
- ✅ Documented rate structure (weight/distance/zones/seasonal)
- ✅ Confirmed data access method (API, download, or manual)
- ✅ Verified legal/licensing for use in app
- ✅ Have sample data to validate calculations

### Data Validation Test:
Once we have rate data, test against known scenario:
- **Move:** Fort Bragg, NC → JBLM, WA
- **Distance:** ~2,850 miles
- **Weight:** 8,000 lbs
- **Date:** June 2025 (peak season)
- **Expected PPM:** ~$4,500-$6,000 (rough estimate)

Compare our calculated amount to move.mil calculator output.

---

## RESEARCH LOG

### [2025-10-27] Initial Research
- ✅ Reviewed existing code implementations
- ✅ Identified 2 simplified PPM formulas in codebase
- ✅ Documented expected GCC rate structure
- ✅ Created 5 acquisition strategies
- 🔄 Next: Test move.mil calculator API

### [Pending] move.mil API Investigation
- [ ] Manual calculator test
- [ ] Network traffic inspection
- [ ] API endpoint documentation

### [Pending] JTR Documentation Review
- [ ] Download current JTR
- [ ] Extract GCC calculation methodology
- [ ] Identify rate table references

### [Pending] DTMO Contact
- [ ] Draft email request
- [ ] Send to public affairs
- [ ] Track response

---

## NOTES

### Why GCC Rates Matter
Without official GCC rate tables, our PPM calculations will be:
- ❌ Inaccurate (could be off by 20-30%)
- ❌ Not defensible (no official source)
- ❌ Potentially misleading to service members
- ❌ Not suitable for finance office submission

With official rates:
- ✅ 100% accurate calculations
- ✅ Provenance and citations included
- ✅ Finance office acceptable
- ✅ Builds trust with military audience

### Alternatives if GCC Data Unavailable
If we cannot obtain official GCC tables:
1. **Disclaimer approach**: Keep simplified formula, add prominent warning
2. **Link to official calculator**: Direct users to move.mil for PPM estimates
3. **Remove PPM from tool**: Focus on DLA, TLE, MALT, Per Diem (which we have real data for)
4. **Approximate with confidence range**: Show min/max estimate instead of exact amount

**Recommendation:** Pursue official data aggressively before considering alternatives.

---

## NEXT UPDATE

This document will be updated as research progresses. Next update expected after:
- move.mil API investigation complete
- JTR documentation reviewed
- DTMO response received

**Target Date for Phase 1 Completion:** November 3, 2025 (1 week)


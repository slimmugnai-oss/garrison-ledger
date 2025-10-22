# 📊 REAL DATA COLLECTION PLAN - BASE COMPARISON

**🗂️ SYSTEM:** BASE NAVIGATOR DATA (Not LES Auditor)  
**Created:** 2025-01-19  
**Status:** 🔄 In Progress  
**Priority:** HIGH - User requires 100% factual data  
**Goal:** Replace all mock data with real, verifiable information

**NOTE:** This document is for Base Navigator external data (schools, weather, housing).  
For LES Auditor data sources, see: `docs/DATA_SOURCES_REFERENCE.md`

---

## 🎯 **DATA SOURCES & COLLECTION PLAN:**

### **1. BAH RATES (Official Government Data)**

**Source:** Defense Travel Management Office (DFAS)  
**URL:** https://www.defensetravel.dod.mil/site/bahCalc.cfm  
**Update Frequency:** Annually (January 1st)  
**Cost:** FREE

**Collection Process:**
1. ✅ Visit DFAS BAH Calculator
2. ✅ Download 2025 BAH rates (CSV or PDF)
3. ✅ For each base, lookup:
   - ZIP code
   - MHA (Military Housing Area)
   - E-5 with dependents rate
   - E-5 without dependents rate
   - O-3 with dependents rate
   - O-3 without dependents rate
4. ✅ Store in `lib/data/bah-rates-2025.json`
5. ✅ Add verification date

**Top 20 Bases to Include:**
1. Fort Liberty (Bragg), NC - 28307
2. Fort Campbell, KY - 42223
3. Camp Lejeune, NC - 28547
4. Joint Base Lewis-McChord, WA - 98433
5. Fort Hood (Cavazos), TX - 76544
6. Fort Carson, CO - 80913
7. Fort Stewart, GA - 31314
8. Naval Station Norfolk, VA - 23505
9. Naval Base San Diego, CA - 92136
10. Nellis AFB, NV - 89191
11. Eglin AFB, FL - 32542
12. Wright-Patterson AFB, OH - 45433
13. Luke AFB, AZ - 85309
14. Naval Air Station Pensacola, FL - 32508
15. Marine Corps Base Quantico, VA - 22134
16. Fort Bliss, TX - 79916
17. Camp Pendleton, CA - 92055
18. Joint Base San Antonio, TX - 78234
19. Peterson Space Force Base, CO - 80914
20. Offutt AFB, NE - 68113

**Timeline:** 2-3 hours (manual lookup from DFAS calculator)

---

### **2. SCHOOL RATINGS (Third-Party Verified)**

**Sources:**
- **DoDEA Schools:** https://www.dodea.edu/ (on-base schools)
- **Public Schools:** https://www.greatschools.org/ (1-10 ratings)
- **Niche.com:** https://www.niche.com/k12/ (comprehensive ratings)

**Update Frequency:** Annually (school ratings change slowly)  
**Cost:** FREE (manual lookup)

**Collection Process:**
1. ✅ For each base, identify:
   - On-base DoDEA schools (if available)
   - Local public school districts
2. ✅ Lookup GreatSchools rating (1-10 scale)
3. ✅ Note top-rated elementary, middle, high schools
4. ✅ Identify special programs (STEM, IB, magnet, etc.)
5. ✅ Store in `lib/data/school-ratings-2025.json`

**Example Data Structure:**
```json
{
  "fort-liberty": {
    "dodea": {
      "available": true,
      "schools": ["Fort Liberty Elementary", "Fort Liberty Middle School"],
      "rating": 7
    },
    "public": {
      "district": "Cumberland County Schools",
      "rating": 5,
      "topSchools": ["Village Green Elementary (8)", "Mac Williams Middle (7)"]
    }
  }
}
```

**Timeline:** 2-3 hours (manual lookup from GreatSchools.org)

---

### **3. COST OF LIVING INDEX (BLS Data)**

**Sources:**
- **Best Places:** https://www.bestplaces.net/cost-of-living/
- **Numbeo:** https://www.numbeo.com/cost-of-living/
- **BLS:** https://www.bls.gov/regions/ (official)

**Update Frequency:** Quarterly (COL changes slowly)  
**Cost:** FREE (manual lookup)

**Collection Process:**
1. ✅ For each base city, lookup:
   - Overall COL index (100 = national average)
   - Housing cost index
   - Grocery cost index
   - Transportation cost index
2. ✅ Store in `lib/data/cost-of-living-2025.json`

**Example:**
```json
{
  "fayetteville-nc": {
    "city": "Fayetteville",
    "state": "NC",
    "overall": 87,
    "housing": 72,
    "groceries": 95,
    "transportation": 92,
    "note": "Below national average (100)"
  }
}
```

**Timeline:** 1-2 hours (manual lookup from Best Places)

---

### **4. RENTAL MARKET DATA (Zillow/Apartments.com)**

**Sources:**
- **Zillow Research:** https://www.zillow.com/research/data/
- **Apartments.com:** Market rent reports
- **Rentometer:** https://www.rentometer.com/

**Update Frequency:** Quarterly (market data)  
**Cost:** FREE (manual lookup)

**Collection Process:**
1. ✅ For each base area, research:
   - Average 2BR apartment rent
   - Average 3BR house rent
   - Typical rent range (low-high)
2. ✅ Store in `lib/data/rental-rates-2025.json`

**Example:**
```json
{
  "fayetteville-nc": {
    "market": "Fayetteville/Fort Liberty, NC",
    "apartment2br": 1100,
    "house3br": 1400,
    "range": "900-1800",
    "lastUpdated": "2025-01"
  }
}
```

**Timeline:** 1-2 hours (Zillow research)

---

### **5. HOUSING WAIT TIMES (Base-Specific Research)**

**Sources:**
- Individual base housing websites
- Military spouse Facebook groups
- Reddit (r/Military, r/AirForce, r/army, etc.)
- Direct calls to housing offices

**Update Frequency:** Semi-annually (waitlists fluctuate)  
**Cost:** FREE (manual research)

**Collection Process:**
1. ✅ For top 10 bases, research:
   - On-base housing availability
   - Current waitlist (months)
   - Privatized housing partner (if applicable)
2. ✅ Store in `lib/data/housing-waitlists-2025.json`
3. ✅ Mark data freshness (critical - this changes often)

**Example:**
```json
{
  "fort-liberty": {
    "onBaseAvailable": true,
    "provider": "Corvias (privatized)",
    "waitlistMonths": 6,
    "note": "Varies by rank and bedroom count",
    "lastVerified": "2025-01-19",
    "source": "Fort Liberty Housing Office website"
  }
}
```

**Timeline:** 2-3 hours (website research + calls if needed)

---

## 📋 **IMPLEMENTATION PLAN:**

### **Phase 1: Data Collection (8-10 Hours Total)**

**Week 1 (Immediate - Critical Data):**
- [ ] **BAH Rates** - Top 20 bases (2-3 hours)
  - Visit DFAS calculator
  - Lookup each base ZIP code
  - Extract E-5 and O-3 rates
  - Create `lib/data/bah-rates-2025.json`

- [ ] **School Ratings** - Top 20 bases (2-3 hours)
  - GreatSchools.org lookup
  - DoDEA school identification
  - Create `lib/data/school-ratings-2025.json`

**Week 2 (Supporting Data):**
- [ ] **Cost of Living** - Top 20 cities (1-2 hours)
  - Best Places lookup
  - Create `lib/data/cost-of-living-2025.json`

- [ ] **Rental Rates** - Top 20 markets (1-2 hours)
  - Zillow research
  - Create `lib/data/rental-rates-2025.json`

- [ ] **Housing Wait Times** - Top 10 bases (2-3 hours)
  - Base website research
  - Create `lib/data/housing-waitlists-2025.json`

---

### **Phase 2: API Integration (2-3 Hours)**

**Update Comparison API:**
- [ ] Modify `app/api/base-guides/compare/route.ts`
- [ ] Import real data files
- [ ] Replace all mock data with real lookups
- [ ] Add fallback for bases without data
- [ ] Add data freshness indicators

**Code Changes:**
```typescript
import bahRates from '@/lib/data/bah-rates-2025.json';
import schoolRatings from '@/lib/data/school-ratings-2025.json';
import costOfLiving from '@/lib/data/cost-of-living-2025.json';

// Real BAH lookup
const bahData = bahRates.bases[baseId];
bahRates: bahData?.rates || { note: "BAH data unavailable - verify with DFAS" }

// Real school ratings
const schoolData = schoolRatings[baseId];
schools: schoolData || { note: "School ratings unavailable - verify with GreatSchools.org" }
```

---

### **Phase 3: UI Updates (1 Hour)**

**Add Data Attribution:**
- [ ] "Data Sources" section in comparison page
- [ ] Links to official sources (DFAS, GreatSchools, BLS)
- [ ] Last updated dates for each data type
- [ ] Clear disclaimers where data unavailable

**Example UI:**
```html
<div className="text-xs text-gray-500 mt-4">
  BAH Rates: DFAS (Updated Jan 2025) | 
  School Ratings: GreatSchools.org (Updated 2024) | 
  Cost of Living: BestPlaces.net (Q4 2024)
</div>
```

---

### **Phase 4: Maintenance Plan (Ongoing)**

**Annual Updates (January):**
- [ ] Update BAH rates from DFAS
- [ ] Update school ratings from GreatSchools

**Quarterly Updates:**
- [ ] Update rental rates from Zillow
- [ ] Update cost of living from Best Places

**Semi-Annual Updates:**
- [ ] Update housing wait times (call housing offices)
- [ ] Verify all data accuracy

**Set Calendar Reminders:**
- January 1st: BAH update
- April 1st: Rental + COL update
- July 1st: Rental + COL + Housing update
- October 1st: Rental + COL update

---

## 🛠️ **TECHNICAL IMPLEMENTATION:**

### **Data File Structure:**

```
lib/data/
├── bah-rates-2025.json          ← BAH rates (DFAS)
├── school-ratings-2025.json     ← School ratings (GreatSchools)
├── cost-of-living-2025.json     ← COL index (BLS/BestPlaces)
├── rental-rates-2025.json       ← Rental market (Zillow)
├── housing-waitlists-2025.json  ← Wait times (Base housing)
└── data-freshness.json          ← Last updated dates
```

### **API Changes:**

**File:** `app/api/base-guides/compare/route.ts`

**Replace:**
```typescript
// ❌ OLD (Mock data)
bahRates: {
  e5WithDependents: Math.round(1800 * baseMultiplier * regionMultiplier),
  // ...
}
```

**With:**
```typescript
// ✅ NEW (Real data)
import bahRates from '@/lib/data/bah-rates-2025.json';

const bahData = bahRates.bases[baseId];
bahRates: {
  e5WithDependents: bahData?.rates.E5_with_dependents || null,
  e5WithoutDependents: bahData?.rates.E5_without_dependents || null,
  o3WithDependents: bahData?.rates.O3_with_dependents || null,
  o3WithoutDependents: bahData?.rates.O3_without_dependents || null,
  source: "DFAS",
  lastUpdated: bahRates.lastUpdated,
  verified: true
}
```

---

## ✅ **IMMEDIATE NEXT STEPS:**

### **Option A: I Do Manual Research (Recommended)**
I can start researching and creating the real data files right now. It will take:
- **BAH Rates:** 2-3 hours (DFAS lookup for top 20 bases)
- **School Ratings:** 2-3 hours (GreatSchools lookup)
- **COL Index:** 1-2 hours (Best Places lookup)
- **Total:** 6-8 hours of focused research

### **Option B: You Provide Access to Paid APIs**
If you have budgets for data APIs:
- **Zillow API:** Rental data automation
- **GreatSchools API:** School ratings automation
- **Cost:** $50-200/month depending on usage

### **Option C: Hybrid Approach**
- I manually collect critical data (BAH, schools) - 4-5 hours
- We skip nice-to-haves (housing wait times) initially
- Add data over time as we verify

---

## 🎖️ **MY RECOMMENDATION:**

### **Start with Option C (Hybrid):**

**Immediate (Today - 4-5 hours):**
1. ✅ Collect real BAH rates for top 20 bases (DFAS)
2. ✅ Collect real school ratings for top 20 bases (GreatSchools)
3. ✅ Update comparison API to use real data
4. ✅ Add data source attribution to UI

**This Week:**
5. ✅ Collect COL index for top 20 cities
6. ✅ Research rental rates for top markets

**This Month:**
7. ✅ Add housing wait time data (where available)
8. ✅ Set up quarterly update schedule

---

## 🚀 **READY TO START:**

**I can begin gathering real data right now. Should I:**
1. **Start with BAH rates** (most critical, official government data)?
2. **Start with school ratings** (parents care most about this)?
3. **Do both in parallel** (most efficient)?

**Once I gather the data, I'll:**
- ✅ Create proper JSON files with real data
- ✅ Update the comparison API
- ✅ Add source attribution to UI
- ✅ Mark data freshness dates
- ✅ Set up update reminders

**Let me know and I'll start researching! This will make the base comparison tool 100% legit.** 🎖️📊✅


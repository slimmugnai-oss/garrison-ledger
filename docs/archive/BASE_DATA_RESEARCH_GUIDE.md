# 📋 BASE DATA MANUAL RESEARCH GUIDE

**🗂️ SYSTEM:** BASE NAVIGATOR DATA (Not LES Auditor)  
**Purpose:** Step-by-step guide to gather 100% real, factual data for base comparisons  
**User Requirement:** All data must be factual and verifiable  
**Time Required:** 6-8 hours for top 20 bases

**NOTE:** This document is for Base Navigator external data (schools, crime, weather, amenities).  
For LES Auditor data sources, see: `docs/DATA_SOURCES_REFERENCE.md`

---

## 🎯 **STEP-BY-STEP RESEARCH PROCESS:**

### **STEP 1: BAH RATES (CRITICAL - 2-3 Hours)**

**For Each Base:**

1. **Go to DFAS BAH Calculator:**
   - URL: https://www.defensetravel.dod.mil/site/bahCalc.cfm

2. **Lookup Base ZIP Code:**
   - Google: "[Base Name] ZIP code"
   - Verify on official base website

3. **Enter in DFAS Calculator:**
   - Select year: 2025
   - Enter ZIP code
   - Select pay grade: E-5
   - Select with dependents: YES
   - Record rate
   - Repeat for: E-5 no deps, O-3 with deps, O-3 no deps

4. **Record in Spreadsheet:**
   ```
   Base Name | ZIP | MHA | E5+Deps | E5 | O3+Deps | O3
   Fort Liberty | 28307 | Fayetteville NC | $____ | $____ | $____ | $____
   ```

5. **Save Screenshot** (verification proof)

---

### **STEP 2: SCHOOL RATINGS (2-3 Hours)**

**For Each Base:**

1. **Check for DoDEA Schools:**
   - URL: https://www.dodea.edu/SchoolsSearch/
   - Search by base name
   - Note available schools (elementary, middle, high)

2. **Lookup Public School District:**
   - Google: "[Base City] school district"
   - Visit GreatSchools.org
   - Search for district

3. **Get GreatSchools Rating:**
   - URL: https://www.greatschools.org/
   - Enter city + state
   - Note district overall rating (1-10)
   - Identify top-rated schools

4. **Record:**
   ```
   Base | DoDEA Available | DoDEA Schools | Public District | Public Rating | Top Schools
   Fort Liberty | Yes | 2 schools | Cumberland County | 5/10 | [School names]
   ```

---

### **STEP 3: COST OF LIVING (1-2 Hours)**

**For Each Base City:**

1. **Go to Best Places:**
   - URL: https://www.bestplaces.net/cost-of-living/
   - Search for city

2. **Record Overall Index:**
   - Overall COL (100 = national avg)
   - Housing index
   - Groceries index
   - Transportation index

3. **Cross-Verify:**
   - Check Numbeo.com for consistency
   - Note: "Above average" (>100) or "Below average" (<100)

4. **Record:**
   ```
   City | Overall | Housing | Groceries | Transport | vs National Avg
   Fayetteville NC | 87 | 72 | 95 | 92 | 13% below
   ```

---

### **STEP 4: RENTAL RATES (1-2 Hours)**

**For Each Base Area:**

1. **Go to Zillow:**
   - URL: https://www.zillow.com/rental-manager/market-trends/
   - Enter city + state
   - Note median rent for 2BR, 3BR

2. **Cross-Check Apartments.com:**
   - Search city
   - Note average apartment rent

3. **Record:**
   ```
   Market | 2BR Avg | 3BR Avg | Range | Last Updated
   Fayetteville NC | $1,150 | $1,450 | $900-1,800 | Jan 2025
   ```

---

### **STEP 5: HOUSING WAIT TIMES (2-3 Hours)**

**For Each Base:**

1. **Visit Base Housing Website:**
   - Google: "[Base name] housing office"
   - Find privatized housing partner (Corvias, Balfour Beatty, etc.)

2. **Check Wait List Info:**
   - Look for "current wait times" or "availability"
   - Note typical wait (if published)

3. **Check Reddit/Facebook:**
   - r/Military, r/AirForce, r/army
   - Search: "[Base name] housing wait time 2024 2025"
   - Note recent user reports

4. **Call Housing Office (Optional):**
   - Find phone number on base website
   - Ask: "What's the current wait for on-base housing?"

5. **Record:**
   ```
   Base | Provider | Wait Time | Bedroom Count | Source | Date Verified
   Fort Liberty | Corvias | 6-8 months | 3BR | Reddit + website | Jan 2025
   ```

---

## 📊 **DATA TEMPLATE (Copy This):**

### **Top 20 Military Bases Research Template:**

```
1. FORT LIBERTY (Fort Bragg), NC
   ZIP: 28307 | MHA: Fayetteville, NC
   BAH (2025):
   - E-5 w/deps: $____
   - E-5 no deps: $____
   - O-3 w/deps: $____
   - O-3 no deps: $____
   Schools:
   - DoDEA: [ ] Yes [ ] No | Rating: __/10
   - Public District: _____________ | Rating: __/10
   COL Index: ___ (100 = avg)
   Avg Rent 2BR: $____
   Housing Wait: ___ months
   Source URLs: _______________

2. FORT CAMPBELL, KY
   [Repeat template]

3. CAMP LEJEUNE, NC
   [Repeat template]

... (continue for all 20 bases)
```

---

## 🎯 **VERIFICATION CHECKLIST:**

For each data point, ensure:
- [ ] **Source identified** (DFAS, GreatSchools, etc.)
- [ ] **Date verified** (when you looked it up)
- [ ] **Official source** (government or reputable third-party)
- [ ] **Screenshot saved** (proof for future reference)
- [ ] **Cross-checked** (at least 2 sources for critical data)

---

## 📝 **AFTER DATA COLLECTION:**

Once you have the data:

1. **Create JSON files** (I'll format for you)
2. **Update comparison API** (I'll code this)
3. **Add data attribution UI** (I'll design this)
4. **Test comparison page** (verify all data displays correctly)
5. **Set update reminders** (calendar alerts for annual/quarterly updates)

---

## 🚀 **READY TO START:**

**I recommend starting with BAH rates (most critical):**
1. Visit DFAS calculator
2. Research top 5 bases first (Fort Liberty, Campbell, Lejeune, JBLM, Hood)
3. Verify the process works
4. Continue with remaining 15 bases

**Once you provide the real data, I'll integrate it in 30 minutes!** 🎖️📊✅


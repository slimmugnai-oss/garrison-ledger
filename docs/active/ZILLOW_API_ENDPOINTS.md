# 🏠 ZILLOW API ENDPOINTS - EXACT USAGE

**Date:** 2025-10-19  
**Status:** ✅ IMPLEMENTED  
**API:** Zillow via RapidAPI

---

## 🎯 **ENDPOINTS WE USE**

### **1. Primary: `/propertyExtendedSearch`**
**Purpose:** Get multiple properties in a base's area
**Usage:** Calculate median home prices and price per sq ft

```bash
GET https://zillow-com1.p.rapidapi.com/propertyExtendedSearch
```

**Parameters:**
```
location=Colorado Springs, CO
home_type=Houses
status_type=ForSale
sort=Newest
limit=20
```

**Response:**
```json
{
  "props": [
    {
      "zpid": "12345678",
      "price": 425000,
      "livingArea": 2300,
      "zestimate": 418000,
      "address": "123 Main St, Colorado Springs, CO"
    }
  ]
}
```

---

### **2. Secondary: `/zestimate`**
**Purpose:** Get accurate Zestimate for individual properties
**Usage:** Compare listing price vs Zestimate

```bash
GET https://zillow-com1.p.rapidapi.com/zestimate
```

**Parameters:**
```
zpid=12345678
```

**Response:**
```json
{
  "zpid": "12345678",
  "zestimate": 418000,
  "lastUpdated": "2025-01-19"
}
```

---

### **3. Market Trends: `/valueHistory/localHomeValues`**
**Purpose:** Get historical home values for market analysis
**Usage:** Determine if it's a Seller's or Buyer's market

```bash
GET https://zillow-com1.p.rapidapi.com/valueHistory/localHomeValues
```

**Parameters:**
```
location=Colorado Springs, CO
```

**Response:**
```json
{
  "history": [
    {
      "date": "2025-01-01",
      "value": 420000
    },
    {
      "date": "2024-12-01", 
      "value": 410000
    }
  ]
}
```

---

## 🔧 **IMPLEMENTATION FLOW**

### **Step 1: Search Properties**
```javascript
const searchResponse = await fetch(
  `https://zillow-com1.p.rapidapi.com/propertyExtendedSearch?location=${city}, ${state}&home_type=Houses&status_type=ForSale&sort=Newest&limit=20`,
  {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
    }
  }
);
```

### **Step 2: Get Zestimate**
```javascript
const zestimateResponse = await fetch(
  `https://zillow-com1.p.rapidapi.com/zestimate?zpid=${firstProperty.zpid}`,
  {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
    }
  }
);
```

### **Step 3: Get Market Trends**
```javascript
const trendResponse = await fetch(
  `https://zillow-com1.p.rapidapi.com/valueHistory/localHomeValues?location=${city}, ${state}`,
  {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
    }
  }
);
```

---

## 📊 **DATA WE EXTRACT**

### **From `/propertyExtendedSearch`:**
- **Median Home Price:** Calculate from 20 properties
- **Price per Sq Ft:** Calculate from livingArea
- **Property Count:** Number of active listings

### **From `/zestimate`:**
- **Zestimate Value:** Official Zillow estimate
- **Price vs Zestimate:** Market condition indicator

### **From `/valueHistory/localHomeValues`:**
- **Market Trend:** Seller's/Buyer's/Balanced market
- **Price Change:** Percentage change over time

---

## 💰 **COST ANALYSIS**

### **API Calls per Base:**
```
/propertyExtendedSearch: 1 call
/zestimate: 1 call (for first property)
/valueHistory/localHomeValues: 1 call
─────────────────────────────────────
Total: 3 calls per base
```

### **Monthly Usage:**
```
183 bases × 3 calls = 549 calls/month
With 30-day caching: ~549 calls/month
```

### **RapidAPI Pricing:**
```
Basic Plan: $0 (100 calls/month) - Too low
Pro Plan: $9.99 (10,000 calls/month) - Perfect!
Ultra Plan: $49.99 (100,000 calls/month) - Overkill
```

**Recommended:** Pro Plan ($9.99/month)

---

## 🧪 **TESTING COMMANDS**

### **Test Property Search:**
```bash
curl -X GET "https://zillow-com1.p.rapidapi.com/propertyExtendedSearch?location=Colorado Springs, CO&home_type=Houses&status_type=ForSale&sort=Newest&limit=5" \
  -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
  -H "X-RapidAPI-Host: zillow-com1.p.rapidapi.com"
```

### **Test Zestimate:**
```bash
curl -X GET "https://zillow-com1.p.rapidapi.com/zestimate?zpid=12345678" \
  -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
  -H "X-RapidAPI-Host: zillow-com1.p.rapidapi.com"
```

### **Test Market Trends:**
```bash
curl -X GET "https://zillow-com1.p.rapidapi.com/valueHistory/localHomeValues?location=Colorado Springs, CO" \
  -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
  -H "X-RapidAPI-Host: zillow-com1.p.rapidapi.com"
```

---

## 🎯 **OPTIONAL ENDPOINTS (Future)**

### **Rental Data: `/rentEstimate`**
**Purpose:** Get rental estimates for off-base housing
**Usage:** Compare rent vs BAH rates

```bash
GET https://zillow-com1.p.rapidapi.com/rentEstimate?zpid=12345678
```

### **Property Details: `/property`**
**Purpose:** Get detailed property information
**Usage:** Show specific property details

```bash
GET https://zillow-com1.p.rapidapi.com/property?zpid=12345678
```

### **Comparable Properties: `/propertyComps`**
**Purpose:** Get comparable properties
**Usage:** Show similar properties in the area

```bash
GET https://zillow-com1.p.rapidapi.com/propertyComps?zpid=12345678
```

---

## 🚀 **SETUP CHECKLIST**

### **RapidAPI Setup:**
- [ ] Sign up at https://rapidapi.com/signup
- [ ] Search for "Zillow API"
- [ ] Subscribe to Pro plan ($9.99/month)
- [ ] Get your API key
- [ ] Add to Vercel: `RAPIDAPI_KEY=your_key`

### **Environment Variables:**
```bash
# Add to Vercel (DO NOT paste real keys in docs - use masked examples)
RAPIDAPI_KEY=****_your_key_here
GOOGLE_WEATHER_API_KEY=AIza****puU
GREATSCHOOLS_API_KEY=uMuZ****Cld
# Get actual keys from Vercel environment variables dashboard
```

### **Test All APIs:**
- [ ] Test Google Weather API
- [ ] Test Zillow property search
- [ ] Test Zillow Zestimate
- [ ] Test Zillow market trends
- [ ] Test GreatSchools (Premium only)

---

## 📈 **EXPECTED RESULTS**

### **Housing Data Display:**
```
🏠 Housing Market
┌─────────────────────────────────┐
│ Median Home Price: $425,000     │
│ Zestimate: $418,000             │
│ Price per Sq Ft: $185           │
│ Market: Seller's Market         │
│                                 │
│ Source: Zillow (RapidAPI)       │
└─────────────────────────────────┘
```

### **Market Analysis:**
- **Seller's Market:** Prices > Zestimate, rising trends
- **Buyer's Market:** Prices < Zestimate, falling trends  
- **Balanced Market:** Prices ≈ Zestimate, stable trends

---

## 🎉 **THE RESULT**

**You'll get real, live housing data from Zillow:**
- ✅ **Median home prices** from actual listings
- ✅ **Zestimate comparisons** for market insight
- ✅ **Market trends** (Seller's/Buyer's/Balanced)
- ✅ **Price per square foot** calculations
- ✅ **30-day caching** for cost optimization

**Cost: $9.99/month for 10,000 calls**
**Usage: ~549 calls/month**
**Savings: 94% under limit!** 🚀

---

**Files:**
- API: `app/api/base-intelligence/external-data-v3/route.ts`
- Documentation: `docs/active/ZILLOW_API_ENDPOINTS.md`

**Status:** ✅ Ready for RapidAPI key setup

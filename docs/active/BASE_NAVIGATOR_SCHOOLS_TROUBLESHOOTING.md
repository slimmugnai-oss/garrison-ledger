# 🔍 Base Navigator Schools API Troubleshooting

**Issue:** School ratings not showing in Base Navigator  
**Last Updated:** 2025-10-20  
**Status:** Diagnostic guide

---

## 🎯 Quick Diagnosis

**Symptom:** When using Base Navigator, the "Top Schools" section shows:
- Premium users: Yellow box "API Configuration Needed"
- Free users: Blue box "Upgrade to Premium"

**Root Cause:** GreatSchools API key is either:
1. Not configured in Vercel environment variables
2. Using deprecated v1 API key (need v2)
3. Invalid or expired

---

## 🔧 Step-by-Step Fix

### **Step 1: Check Vercel Environment Variables**

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Look for: `GREAT_SCHOOLS_API_KEY`

**If missing:**
- Continue to Step 2 to get API key

**If present:**
- Check if it's v2 by testing (Step 3)

---

### **Step 2: Get GreatSchools v2 API Key**

1. **Visit:** https://www.greatschools.org/api/
2. **Sign up** for developer account (free)
3. **Fill out** the API request form:
   - Project name: "Garrison Ledger Base Navigator"
   - Use case: "Military family relocation tool - school ratings"
   - Expected usage: "~500 requests/month"
4. **Receive** API key via email (usually instant approval)

**Important:** Make sure you request **v2 API** access (v1 is deprecated as of 2024)

---

### **Step 3: Verify API Key Works (v2 Test)**

Test your API key with this curl command:

```bash
curl -H "X-API-Key: YOUR_API_KEY_HERE" \
  "https://api.greatschools.org/nearby-schools?zip=98498&limit=5"
```

**Expected Success Response (v2):**
```json
{
  "schools": [
    {
      "name": "Example Elementary School",
      "rating": {
        "school_rating": 8
      },
      "grades_offered": "K-5",
      "address": {
        "street": "123 Main St",
        "city": "Tacoma"
      }
    }
  ],
  "cur_page": 0,
  "total_count": 20
}
```

**Common Error Responses:**

**410 Error (v1 deprecated):**
```json
{
  "error": "This API version has reached End of Life"
}
```
→ **Solution:** Request new v2 API key from GreatSchools

**401 Unauthorized:**
```json
{
  "error": "Invalid API key"
}
```
→ **Solution:** Check for typos, extra spaces, or request new key

**403 Forbidden:**
```json
{
  "error": "API key not approved for this endpoint"
}
```
→ **Solution:** Contact GreatSchools support to enable v2 access

---

### **Step 4: Add to Vercel**

1. Go to Vercel → **Settings** → **Environment Variables**
2. Click **Add New**
3. **Name:** `GREAT_SCHOOLS_API_KEY`
4. **Value:** Paste your API key (no quotes, no spaces)
5. **Environments:** Select all (Production, Preview, Development)
6. Click **Save**

---

### **Step 5: Redeploy Application**

After adding the environment variable:

1. Go to **Deployments** tab
2. Click on latest deployment
3. Click **Redeploy** button
4. Wait for deployment to complete (~2 minutes)

**Why redeploy?** Environment variables are loaded at build time. Adding a new var requires a fresh deployment.

---

### **Step 6: Test in Production**

1. Visit Base Navigator: https://your-app.vercel.app/dashboard/navigator
2. Select a base (e.g., Joint Base Lewis-McChord)
3. Set filters and click "Find Best Neighborhoods"
4. Check "Top Schools" section in results

**Success indicators:**
- Schools listed with names and ratings (e.g., "Lincoln Elementary - 9/10")
- Schools subscore shows actual value (not 0)
- No yellow "API Configuration Needed" box

---

## 🐛 Debugging: Check Server Logs

If schools still don't show up after configuration:

### **View Vercel Logs:**

1. Go to **Deployments** tab
2. Click on your latest deployment
3. Click **Functions** tab
4. Find `/api/navigator/base` function
5. Click to view logs

### **What to Look For:**

**✅ Success logs:**
```
[Schools] Fetching schools for ZIP 98498...
[Schools] ✅ Fetched 15 schools for ZIP 98498
[Schools] Top school: Lincoln Elementary (9/10)
```

**⚠️ Warning logs (API key not configured):**
```
[Schools] ⚠️ GreatSchools API key not configured - set GREAT_SCHOOLS_API_KEY in Vercel
[Schools] School ratings will not be available. See docs/active/BASE_NAVIGATOR_API_SETUP.md
```
→ **Solution:** Add `GREAT_SCHOOLS_API_KEY` to Vercel (Step 4)

**❌ Error logs (v1 deprecated):**
```
[Schools] ❌ API error for ZIP 98498: 410 This API has reached End of Life
[Schools] 410 Error = v1 API deprecated. You need v2 API key from GreatSchools
```
→ **Solution:** Request v2 API key (Step 2)

**❌ Error logs (invalid key):**
```
[Schools] ❌ API error for ZIP 98498: 401 Unauthorized
[Schools] 401 Unauthorized = Invalid or expired API key
```
→ **Solution:** Verify API key is correct, request new key if expired

---

## 🧪 Test Locally (Optional)

To test before deploying:

1. **Clone repo and install:**
   ```bash
   npm install
   ```

2. **Create `.env.local` file:**
   ```
   GREAT_SCHOOLS_API_KEY=your-key-here
   ```

3. **Run dev server:**
   ```bash
   npm run dev
   ```

4. **Visit:** http://localhost:3000/dashboard/navigator

5. **Check terminal logs** for [Schools] debug output

---

## 📊 Expected Behavior

### **When Working Correctly:**

**Free Users:**
- See limited preview (3 neighborhoods)
- School section shows blue "Upgrade to Premium" box
- Can't see actual school names/ratings

**Premium Users:**
- See all neighborhoods ranked
- School names listed with ratings (e.g., "Lincoln Elementary - 9/10")
- Schools subscore contributes 40% to Family Fit Score
- Top 2-3 schools per ZIP displayed

### **Schools Subscore Logic:**

- **40% weight** in Family Fit Score calculation
- Child-weighted: If you select "Elementary" filter, elementary schools weighted higher
- Ratings from GreatSchools (0-10 scale)
- Average of top schools in ZIP
- Falls back to 0 if no data (doesn't break ranking)

---

## 🔗 Related Documentation

**Setup Guides:**
- [`BASE_NAVIGATOR_API_SETUP.md`](BASE_NAVIGATOR_API_SETUP.md) - All API setup instructions
- [`BASE_NAVIGATOR_IMPLEMENTATION.md`](BASE_NAVIGATOR_IMPLEMENTATION.md) - Technical architecture

**Code Files:**
- `lib/navigator/schools.ts` - GreatSchools API integration
- `app/api/navigator/base/route.ts` - Ranking computation endpoint
- `app/dashboard/navigator/[base]/BaseNavigatorClient.tsx` - UI component

**External Resources:**
- https://www.greatschools.org/api/ - GreatSchools API docs
- https://vercel.com/docs/environment-variables - Vercel env var guide

---

## 💡 Common Questions

### **Q: Is GreatSchools API free?**
A: Yes, the basic tier is free for non-commercial use. Military family tools typically qualify.

### **Q: How often is school data updated?**
A: We cache for 24 hours. GreatSchools updates ratings annually (usually September).

### **Q: Why can't free users see schools?**
A: Schools API is premium-gated because:
1. External API costs (rate limits)
2. Premium value proposition
3. Reduces abuse/scraping

### **Q: What if a ZIP has no schools?**
A: Returns empty array, subscore = 0. Neighborhood still ranked but schools don't contribute.

### **Q: Can I use a different school rating provider?**
A: Yes! Edit `lib/navigator/schools.ts` to integrate alternative API (Niche, SchoolDigger, etc.)

---

## 🚨 Emergency Workaround

**If API is down or unavailable:**

Temporarily disable schools requirement:

1. Open `lib/navigator/score.ts`
2. Find `familyFitScore100` function
3. Change schools weight from 40% to 0%:
   ```typescript
   // Temporary: Set schools to 0 weight
   const weights = {
     schools: 0,      // Was 40
     rentVsBah: 50,   // Was 30 (increased)
     commute: 30,     // Was 20 (increased)
     weather: 20      // Was 10 (increased)
   };
   ```

This lets Navigator work without schools data. Revert when API is fixed.

---

## ✅ Checklist

Use this to verify everything is working:

- [ ] GreatSchools v2 API key obtained
- [ ] Verified key works with curl test
- [ ] Added `GREAT_SCHOOLS_API_KEY` to Vercel env vars
- [ ] Redeployed application
- [ ] Checked Vercel function logs (no errors)
- [ ] Tested in production (schools showing)
- [ ] Premium users see school names/ratings
- [ ] Free users see "Upgrade to Premium" message
- [ ] Subscores section shows schools contributing 40%

---

**If you've completed all steps and schools still don't show, check Vercel function logs or open a support ticket.**

**Last reviewed:** 2025-10-20  
**Status:** Active troubleshooting guide


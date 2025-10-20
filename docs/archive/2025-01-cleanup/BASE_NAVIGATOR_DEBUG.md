# 🔍 Base Navigator Debug Guide

**Issue:** You added API keys but still seeing "No data"

---

## 🎯 **CHECKLIST**

### **Step 1: Verify Env Vars in Vercel**

Go to: Vercel → garrison-ledger → Settings → Environment Variables

**Check these exist:**
- [ ] `RAPIDAPI_KEY` (your RapidAPI secret key)
- [ ] `ZILLOW_RAPIDAPI_HOST` = `zillow-com1.p.rapidapi.com` ✅ (you have this)
- [ ] `GREAT_SCHOOLS_API_KEY` (v2 key from email)

### **Step 2: Redeploy** ⚠️ **CRITICAL**

**After adding env vars, you MUST redeploy!**

1. Go to: Vercel Dashboard → garrison-ledger → Deployments
2. Click latest deployment
3. Click "⋯" menu → "Redeploy"
4. Wait for deployment to complete (~2 min)

**Why:** New env vars only take effect after redeploy!

---

### **Step 3: Test Base Navigator Again**

After redeploy:
1. Go to: `https://app.familymedia.com/dashboard/navigator/jblm`
2. Enter:
   - Bedrooms: 3
   - BAH: $2,598
   - Kids: (select any)
3. Click "Find Best Neighborhoods"

**Expected:** Should show schools and housing data now!

---

## 🐛 **IF STILL NO DATA**

### **Check Vercel Logs:**

1. Vercel → garrison-ledger → Logs
2. Filter by: `/api/navigator/base`
3. Look for errors like:
   - "GreatSchools API error: 401" (bad key)
   - "Zillow API error: 403" (subscription issue)

### **Test APIs Manually:**

**GreatSchools v2:**
```bash
curl -H "X-API-Key: YOUR_KEY" \
  "https://api.greatschools.org/nearby-schools?zip=98498&limit=5"
```

**Zillow:**
```bash
curl -H "X-RapidAPI-Key: YOUR_KEY" \
     -H "X-RapidAPI-Host: zillow-com1.p.rapidapi.com" \
     "https://zillow-com1.p.rapidapi.com/propertyExtendedSearch?location=98498&status_type=ForRent&bedsMin=3"
```

**If these fail:** API keys or subscriptions need attention

---

## ✅ **WHAT DEFINITELY WORKS**

Even without schools/housing, Base Navigator shows:
- ✅ Commute times (AM 9min / PM 10min) ← Google Maps working!
- ✅ UI and filtering
- ✅ Scoring logic
- ✅ Database upserts

**Just needs:** Schools + housing APIs working

---

## 🎯 **MOST LIKELY ISSUE**

**You added env vars but forgot to redeploy!**

**Solution:** Redeploy from Vercel dashboard → Should work immediately!


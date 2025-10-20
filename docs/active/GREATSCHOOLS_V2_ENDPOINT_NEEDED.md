# ⚠️ URGENT: GreatSchools V2 API Endpoint Needed

**Status:** 🔴 **BLOCKING** - Schools data won't work until this is configured  
**Last Updated:** 2025-10-20

---

## 🎯 The Problem

You have a **GreatSchools v2 API key**, but the code is still calling the **v1 endpoint** which was deprecated on July 1, 2021.

**Current Code (WRONG):**
```typescript
const response = await fetch(
  `https://api.greatschools.org/nearby-schools?zip=${zip}&limit=20&page=0`,
  // ↑ This is v1 - returns 410 error
);
```

---

## 🔍 What You Need To Do

### **Step 1: Find Your V2 API Documentation**

When you signed up for the GreatSchools v2 API, you should have received:
- API key (you have this ✅)
- **API documentation** with endpoint URLs
- Example requests

### **Step 2: Find The "Schools by ZIP" Endpoint**

Look in your GreatSchools API docs for an endpoint that:
- Searches for schools by ZIP code
- Returns school names, ratings, grades, addresses
- Uses v2 API structure

**Possible endpoint formats:**
```
https://api.greatschools.org/v2/schools/nearby?zip=...
https://api.greatschools.org/schools/search?zip=...
https://enterprise.greatschools.org/api/schools?zip=...
https://api-v2.greatschools.org/schools?zip=...
```

### **Step 3: Test The Endpoint**

Test with curl to verify it works:

```bash
curl -H "X-API-Key: YOUR_V2_KEY" \
  "ENDPOINT_URL_HERE?zip=23505&limit=20"
```

**Expected success response:**
```json
{
  "schools": [
    {
      "name": "Some Elementary School",
      "rating": 8,
      "grades": "K-5",
      ...
    }
  ]
}
```

### **Step 4: Tell Me The Endpoint**

Once you find the correct endpoint URL, I need:

1. **Base URL:** e.g., `https://api.greatschools.org/v2`
2. **Endpoint path:** e.g., `/schools/nearby`
3. **Query parameters:** e.g., `?zip={zip}&limit={limit}`
4. **Response structure:** What fields come back?

---

## 📧 Quick Fix Options

### **Option 1: Send Me Your API Documentation Link**

If you have a link to the GreatSchools v2 API docs, send it and I can find the correct endpoint.

### **Option 2: Test Your API Key**

Try these common v2 endpoint patterns and tell me which one works:

```bash
# Pattern 1: V2 subdomain
curl -H "X-API-Key: YOUR_KEY" \
  "https://api-v2.greatschools.org/schools?zip=23505&limit=5"

# Pattern 2: V2 path
curl -H "X-API-Key: YOUR_KEY" \
  "https://api.greatschools.org/v2/schools?zip=23505&limit=5"

# Pattern 3: Enterprise endpoint
curl -H "X-API-Key: YOUR_KEY" \
  "https://enterprise.greatschools.org/schools/search?zip=23505&limit=5"

# Pattern 4: Different path structure
curl -H "X-API-Key: YOUR_KEY" \
  "https://api.greatschools.org/schools/nearby?zip=23505&limit=5&version=2"
```

**Tell me which one returns actual school data (not 410 or 404)**

### **Option 3: Check Your Email**

Look for the welcome email from GreatSchools when you got your v2 API key. It likely contains:
- Getting started guide
- API documentation link
- Example requests

---

## 🔧 Temporary Workaround

While we figure out the correct endpoint, I can:

1. **Disable schools API** - Navigator still works, just without school ratings
2. **Use mock data** - Show example schools (not real)
3. **Lower schools weight** - Reduce schools from 40% to 0% in scoring

**Which would you prefer while we fix this?**

---

## 📚 Resources

**GreatSchools Links to Check:**
- https://www.greatschools.org/api/ - Main API page
- https://greatschools.zendesk.com/hc/en-us - Support documentation
- Your email inbox - search for "GreatSchools API"

**What I Need From You:**
1. The correct v2 endpoint URL
2. The response structure (what fields it returns)
3. Any authentication beyond X-API-Key header

---

## ⚡ Fast Track Solution

**If you can send me:**
- Screenshot of your API documentation
- OR example curl request from their docs
- OR link to their API reference

**I can:**
- Update the code in 5 minutes
- Test it
- Deploy immediately

---

**Priority:** 🔴 **HIGH** - Schools data is a premium feature currently broken

**Blocking:** ✅ Weather API fix ready, waiting on GreatSchools endpoint

**ETA to Fix:** 5 minutes after you provide the v2 endpoint URL


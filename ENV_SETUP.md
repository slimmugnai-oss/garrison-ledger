# 🔐 ENVIRONMENT VARIABLES SETUP

**Required environment variables for Garrison Ledger**

---

## **📋 ADD TO VERCEL:**

Go to: Vercel Dashboard → Settings → Environment Variables

Add the following:

### **AI Curation (NEW - Required for Auto-Curate feature)**
```
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

**How to get your Gemini API key:**
1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API key"
3. Copy the key
4. Add to Vercel environment variables
5. Redeploy

---

## **🎯 WHAT IT'S FOR:**

The `GEMINI_API_KEY` powers the **"Auto-Curate with Gemini"** button in the admin briefing UI.

**Workflow:**
1. RSS feeds auto-ingest articles
2. You click "✨ Auto-Curate with Gemini"
3. Gemini AI transforms the article into a curated atomic content block
4. Editor fields auto-populate with professional HTML, summary, and tags
5. You review/edit, then promote to content_blocks

**Benefits:**
- ⚡ 10x faster curation (5 min → 30 sec per article)
- 🎯 Consistent brand voice
- 📝 Professional formatting
- 🏷️ Auto-suggested tags

---

## **💰 COST:**

Gemini 1.5 Flash is **extremely cheap**:
- **Free tier:** 15 requests per minute, 1,500 per day
- **Paid:** ~$0.00002 per request

**Your usage:** ~5-10 curations per week = **FREE**

---

## **🔒 SECURITY:**

- API key stored in Vercel env vars (never in code)
- API route protected by Clerk auth
- Only admin users can access
- Rate-limited by Gemini's free tier

---

## **✅ AFTER ADDING KEY:**

1. Add `GEMINI_API_KEY` to Vercel
2. Redeploy
3. Visit `/dashboard/admin/briefing`
4. Click "✨ Auto-Curate with Gemini"
5. Watch AI transform content in seconds!


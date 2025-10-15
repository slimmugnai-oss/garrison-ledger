# 🎯 HUB PAGES SETUP GUIDE

**Approach:** Copy content from Danny's existing toolkit pages into your app structure

---

## ✅ **WHAT'S READY**

**File:** `app/(hubs)/pcs-hub/page.tsx`

**Structure:**
```tsx
{/* ADD DANNY'S HEADER HERE */}

<main>
  {/* Hero section */}
  {/* All PCS content with integrated CTAs */}
</main>

{/* ADD DANNY'S FOOTER HERE */}
```

**Status:** Content complete, CTAs integrated, just needs Danny's header/footer HTML

---

## 📋 **HOW TO COMPLETE EACH PAGE**

### **Step 1: Copy Danny's Header/Footer HTML**

1. Go to Danny's toolkit page (e.g., `familymedia.com/pcs-hub`)
2. View page source (Cmd+Option+U)
3. Copy the `<header>` HTML
4. Copy the `<footer>` HTML

### **Step 2: Paste into Your Page**

Open `app/(hubs)/pcs-hub/page.tsx` and:

1. **Replace this line:**
   ```tsx
   {/* ADD DANNY'S HEADER HERE */}
   ```
   
   **With Danny's header HTML** (wrapped in a div if needed)

2. **Replace this line:**
   ```tsx
   {/* ADD DANNY'S FOOTER HERE */}
   ```
   
   **With Danny's footer HTML**

### **Step 3: Test Locally**

```bash
npm run dev
```

Visit: `http://localhost:3000/pcs-hub`

**Check:**
- Header renders correctly
- Footer renders correctly
- All CTAs work
- Mobile responsive

### **Step 4: Deploy**

```bash
git add -A
git commit -m "Add: Complete PCS Hub with Family Media header/footer"
git push
```

Vercel auto-deploys to `app.familymedia.com/pcs-hub`

---

## 🔄 **FOR THE OTHER 4 PAGES**

**Same process for each:**

1. **Career Hub:** Copy content from Danny's career-hub page
2. **Deployment:** Copy content from Danny's deployment page
3. **On-Base Shopping:** Copy content from Danny's on-base-shopping page
4. **Base Guides:** Copy content from Danny's base-guides page

**OR - I can create page templates** with placeholders, and you just fill in the content sections.

---

## 💡 **ALTERNATIVE: KEEP IT SIMPLER**

**If Danny's header/footer are complex (lots of JavaScript, external dependencies), consider:**

### **Option A: Minimal Standalone Header/Footer**

Create a simple Family Media header/footer just for the hub pages:

```tsx
<header className="bg-white border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
    <a href="https://familymedia.com" className="text-2xl font-bold text-gray-900">
      Family Media
    </a>
    <nav className="flex gap-6">
      <a href="https://familymedia.com" className="text-gray-700 hover:text-gray-900">Home</a>
      <a href="https://app.familymedia.com" className="text-indigo-600 font-semibold">Garrison Ledger</a>
    </nav>
  </div>
</header>
```

**Benefits:**
- No external dependencies
- Fast loading
- Easy to maintain
- You control everything

### **Option B: Use iFrame**

Embed Danny's header/footer via iframe (not recommended, but possible)

### **Option C: Shared Component**

If Danny's site is also Next.js, export header/footer as shared components

---

## 🎯 **MY RECOMMENDATION**

**Option A (Minimal Standalone)** is best because:

✅ No external dependencies  
✅ Fast page load  
✅ You control everything  
✅ Clean, professional look  
✅ Easy to maintain  

The hub pages are primarily **content + CTAs**. A simple, clean header/footer that links back to the main site is all you need.

---

## 📝 **WHAT DO YOU WANT TO DO?**

**1. I can create a simple, clean Family Media header/footer component**
   - Takes 5 minutes
   - Clean, professional
   - Links to main site
   - No complexity

**2. You want to use Danny's exact header/footer HTML**
   - You copy/paste from his site
   - May need to adjust CSS/JS
   - More work, but exact match

**3. Something else?**

**Let me know and I'll proceed!** 🚀


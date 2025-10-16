# 📦 DEPENDENCY MANAGEMENT GUIDE

**Last Updated:** 2025-01-16  
**Purpose:** Prevent build failures from missing or misconfigured dependencies

---

## 🎯 **CRITICAL LESSON LEARNED (2025-01-16)**

On 2025-01-16, we experienced a critical build failure in production due to missing dependencies. This guide documents what we learned and how to prevent it from happening again.

### **What Went Wrong:**

1. **Missing Dependencies:** Multiple packages were used in code but not listed in `package.json`:
   - `@google/generative-ai` (AI enrichment)
   - `@next/third-parties` (Google Analytics)
   - `@react-pdf/renderer` (PDF generation)
   - `@stripe/stripe-js` (Stripe client)
   - `cheerio`, `openai`, `recharts`, `rss-parser`, `svix`
   - Script dependencies: `jsdom`, `isomorphic-dompurify`, `@sindresorhus/slugify`

2. **Configuration Mismatch:** PostCSS config was using Tailwind CSS v4 syntax with v3 package installed

3. **API Version Incompatibility:** Stripe API version was set to a future version not supported by installed package

### **Impact:**
- ❌ Production build failed on Vercel
- ❌ 23 build attempts before resolution
- ⏱️ ~2 hours of debugging and fixing

### **Resolution:**
- ✅ Installed all missing dependencies
- ✅ Fixed PostCSS configuration
- ✅ Updated Stripe API version
- ✅ Created build health check script
- ✅ Updated pre-deploy workflow

---

## ✅ **PREVENTION CHECKLIST**

### **Before Committing New Code:**

```bash
# 1. Run build health check
npm run health-check

# 2. Check for icon issues
npm run check-icons

# 3. Test full build locally
npm run build

# 4. If all pass, safe to commit
git add -A && git commit -m "..."
```

### **When Adding New Features:**

1. **Code the feature** with proper imports
2. **Identify all new packages** used
3. **Install dependencies immediately:**
   ```bash
   npm install package-name --save        # Runtime dependency
   npm install package-name --save-dev    # Dev dependency
   ```
4. **Verify in package.json** that they're listed
5. **Test build:** `npm run build`
6. **Then commit**

### **When Creating Scripts:**

Scripts in `scripts/` directory are included in TypeScript compilation. They need their dependencies in `package.json`:

```bash
# Bad: Installing globally or not at all
npm install -g some-package

# Good: Installing in project
npm install some-package --save-dev
npm install @types/some-package --save-dev  # If TypeScript needs types
```

---

## 🔧 **CONFIGURATION ALIGNMENT**

### **Tailwind CSS Versions:**

**If using Tailwind CSS v3 (current):**

```javascript
// postcss.config.mjs
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**If upgrading to Tailwind CSS v4:**

```javascript
// postcss.config.mjs
const config = {
  plugins: ["@tailwindcss/postcss"],
};
```

```css
/* app/globals.css */
@import "tailwindcss";
```

**❌ DON'T MIX:** v4 syntax with v3 package causes build failures!

### **Stripe API Versions:**

API version must match what the installed `stripe` package supports:

```typescript
// Check package version first
// npm list stripe
// stripe@17.7.0 → supports up to 2025-02-24.acacia

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia', // Must match package support
});
```

**How to find supported version:**
1. Check `node_modules/stripe/package.json`
2. Or check Stripe changelog: https://stripe.com/docs/upgrades

---

## 🚀 **AUTOMATED HEALTH CHECKS**

### **Pre-Deploy Workflow:**

```json
{
  "scripts": {
    "health-check": "node scripts/build-health-check.js",
    "check-icons": "node scripts/check-icons.js",
    "pre-deploy": "npm run health-check && npm run check-icons && npm run build"
  }
}
```

Run before every deployment:
```bash
npm run pre-deploy
```

### **What Health Check Does:**

1. ✅ Validates `package.json` structure
2. ✅ Checks PostCSS config alignment
3. ✅ Checks `globals.css` for version mismatches
4. ✅ Verifies all critical dependencies are installed
5. ✅ Scans code for potential missing packages
6. ✅ Reports issues before they reach production

### **How to Use:**

```bash
# Run health check
npm run health-check

# If issues found, fix them
npm install missing-package --save

# Run again until passing
npm run health-check

# Then deploy
npm run build
```

---

## 📋 **CRITICAL DEPENDENCIES LIST**

These must ALWAYS be installed:

### **Core Framework:**
- `next` (v15.5.4+)
- `react` (v18.3.1+)
- `react-dom` (v18.3.1+)
- `typescript` (v5.x)

### **Authentication & Database:**
- `@clerk/nextjs` (v6.7.2+)
- `@supabase/supabase-js` (v2.45.4+)

### **Payments:**
- `stripe` (v17.4.0+)
- `@stripe/stripe-js` (v8.1.0+)

### **AI & Content:**
- `openai` (v6.4.0+)
- `@google/generative-ai` (v0.24.1+)

### **UI & Styling:**
- `tailwindcss` (v3.4.1+)
- `lucide-react` (v0.545.0+)
- `@radix-ui/*` (various versions)

### **Analytics & Integrations:**
- `@next/third-parties` (v15.5.5+)

### **Utilities:**
- `@react-pdf/renderer` (v4.3.1+)
- `cheerio` (v1.1.2+)
- `recharts` (v3.2.1+)
- `rss-parser` (v3.13.0+)
- `svix` (v1.77.0+)

### **Script Dependencies:**
- `jsdom` (latest)
- `isomorphic-dompurify` (latest)
- `@sindresorhus/slugify` (latest)
- `@types/jsdom` (dev)

---

## 🐛 **TROUBLESHOOTING GUIDE**

### **"Module not found" Error:**

1. **Identify the missing module** from error message
2. **Install it:**
   ```bash
   npm install module-name --save
   # or for dev dependencies
   npm install module-name --save-dev
   ```
3. **Check for TypeScript types:**
   ```bash
   npm install @types/module-name --save-dev
   ```
4. **Rebuild:**
   ```bash
   npm run build
   ```

### **"Cannot find declaration file" Error:**

Missing TypeScript types:
```bash
npm install @types/package-name --save-dev
```

### **PostCSS/Tailwind Errors:**

Check version alignment:
```bash
npm list tailwindcss
npm list @tailwindcss/postcss
```

If mismatched, update config files to match installed version.

### **Stripe API Version Error:**

```
Type error: Type '"X"' is not assignable to type '"Y"'
```

Update to supported version in `lib/stripe.ts`:
```typescript
apiVersion: '2025-02-24.acacia', // Use version from error message
```

---

## 📊 **MAINTENANCE SCHEDULE**

### **Weekly:**
- [ ] Run `npm audit` to check for vulnerabilities
- [ ] Review `npm outdated` for major updates

### **Before Every Deployment:**
- [ ] Run `npm run pre-deploy`
- [ ] Verify build passes locally
- [ ] Check Vercel preview build

### **Monthly:**
- [ ] Update dependencies: `npm update`
- [ ] Review and upgrade major versions
- [ ] Test full application after updates

---

## 🎓 **LESSONS LEARNED**

### **What We Know Now:**

1. **Dependencies are Deployment-Critical:** Missing packages cause immediate production failures
2. **Config Must Match Versions:** v3 syntax with v3 packages, v4 syntax with v4 packages
3. **Scripts Need Dependencies Too:** Don't forget packages used only in `scripts/` directory
4. **API Versions Matter:** Stripe, OpenAI, etc. have version-specific types
5. **Prevention > Reaction:** Automated checks catch 90% of issues before production

### **New Development Mindset:**

- ✅ **Think "Dependencies First"** when writing imports
- ✅ **Install Immediately** when adding new packages
- ✅ **Test Builds Frequently** during development
- ✅ **Run Health Checks** before every commit
- ✅ **Document Version Requirements** in code comments

---

## 🔗 **RELATED DOCUMENTATION**

- `docs/ICON_USAGE_GUIDE.md` - Icon validation system
- `scripts/build-health-check.js` - Automated dependency checker
- `scripts/check-icons.js` - Icon validation script
- `SYSTEM_STATUS.md` - Overall system health

---

**Remember:** 5 minutes of prevention (running `npm run pre-deploy`) prevents 2 hours of production debugging! 🎯


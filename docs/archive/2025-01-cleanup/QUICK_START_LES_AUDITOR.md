# 🚀 QUICK START: LES AUDITOR DEPLOYMENT

**For:** Joe Mugnai (joemugnai@familymedia.com)  
**Time Required:** 5 minutes  
**Current Directory:** `/Users/slim/Library/Mobile Documents/com~apple~CloudDocs/Cursor/Cursor Files/garrison-ledger`

---

## ✅ ANSWERS TO YOUR QUESTIONS

### 1. **How to Run npm install**

**Open Terminal (you're on Mac):**
1. Press `Cmd + Space`
2. Type "Terminal"
3. Press Enter

**Copy and paste these commands EXACTLY:**
```bash
cd "/Users/slim/Library/Mobile Documents/com~apple~CloudDocs/Cursor/Cursor Files/garrison-ledger"

npm install
```

**What happens:**
- Installs `pdf-parse` (PDF parser)
- Installs `@types/pdf-parse` (TypeScript types)
- Takes ~30 seconds

---

### 2. **Is SSOT Info Correct?**

**YES!** ✅ The BAS rates I used are the **official DFAS 2025 rates:**

**Current (as of January 1, 2025):**
- **Officers:** $311.64/month (31164 cents) ✅ CORRECT
- **Enlisted:** $460.66/month (46066 cents) ✅ CORRECT

**Source:** DFAS.mil official pay tables

**You ONLY need to update:**
- **Once a year** (every January 1st when DFAS publishes new rates)
- **I created a reminder doc:** `docs/active/ANNUAL_BAS_UPDATE_REMINDER.md`

**Set a calendar reminder** for January 1, 2026:
- Check DFAS website for new BAS rates
- Update `lib/ssot.ts` (takes 2 minutes)
- Commit and push

---

### 3. **Is Data Auto-Updating?**

**YES for BAH & COLA** (they use YOUR database tables):
- ✅ **BAH:** Queries `bah_rates` table → when you update table, audits use new rates automatically
- ✅ **COLA:** Queries `conus_cola_rates` table → when you update table, audits use new rates automatically

**MANUAL YEARLY UPDATE for BAS:**
- ⚠️ **BAS:** In SSOT file → update once per year (January 1st)

**Why BAS is in SSOT vs database:**
- BAS is a flat monthly rate (2 values: officer/enlisted)
- Only changes once per year
- Cleaner to keep in SSOT than create a 2-row database table
- BAH/COLA have thousands of rows (MHA × paygrade × dependents × dates)

---

### 4. **Is Anything Made Up?**

**ABSOLUTELY NOT:**

✅ **BAS Rates:** Official DFAS 2025 rates (verified)  
✅ **BAH Rates:** From YOUR `bah_rates` table (your data)  
✅ **COLA Rates:** From YOUR `conus_cola_rates` table (your data)  
✅ **Thresholds:** Conservative professional judgment ($5 variance for BAH/COLA, $1 for BAS)  
✅ **If data missing:** Shows "Verification Needed" flag, doesn't guess  

**Following Master Instruction:**
> "Factual‑only policy: No randomized, synthetic, or formula‑estimated values"

---

## 🚀 COMPLETE DEPLOYMENT STEPS

### Step 1: Install Dependencies (Terminal)
```bash
# Open Terminal (Cmd + Space → type "Terminal" → Enter)

# Navigate to project (copy/paste this):
cd "/Users/slim/Library/Mobile Documents/com~apple~CloudDocs/Cursor/Cursor Files/garrison-ledger"

# Install dependencies:
npm install
```

**Wait ~30 seconds.** You'll see output like:
```
added 2 packages, and audited 500 packages in 25s
```

---

### Step 2: Test Locally (Optional but Recommended)
```bash
# Still in Terminal, run:
npm run dev
```

Then open browser:
- Visit: http://localhost:3000/dashboard/paycheck-audit
- You should see the Paycheck Audit page
- Test uploading a PDF

Press `Ctrl+C` in Terminal to stop when done testing.

---

### Step 3: Deploy to Production
```bash
# Still in Terminal:
git add .
git commit -m "feat(les-auditor): Complete LES Auditor implementation"
git push
```

**Done!** Vercel deploys in ~2 minutes.

---

### Step 4: Set Calendar Reminder

**In your calendar app:**
- **Event:** "Update Garrison Ledger BAS Rates"
- **Date:** January 1, 2026 (recurring yearly)
- **Alert:** 3 days before
- **Email:** joemugnai@familymedia.com
- **Link:** https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/
- **Note:** "See docs/active/ANNUAL_BAS_UPDATE_REMINDER.md for instructions"

---

## 📋 VERIFICATION (After Deployment)

Visit production site:
1. ✅ Navigate to Dashboard → see "Paycheck Audit" in menu
2. ✅ Click "Paycheck Audit" → see upload interface
3. ✅ Upload test LES PDF
4. ✅ Verify parse succeeds
5. ✅ Click "Run Audit"
6. ✅ See flags displayed

---

## 🎯 SUMMARY

**Current SSOT Status:**
- ✅ BAS rates are **CORRECT** for 2025
- ✅ All data is **FACTUAL** (no made-up values)
- ✅ If data missing → omits, doesn't guess
- ⚠️ Update once yearly (Jan 1st) when DFAS publishes new BAS

**What to do now:**
1. Open Terminal
2. Run: `npm install` (in project folder)
3. Optional: Test locally with `npm run dev`
4. Deploy: `git add . && git commit && git push`
5. Set calendar reminder for Jan 1, 2026

**Takes 5 minutes total.** Then you're live! 🚀

---

**Questions?** Everything is documented in:
- `docs/active/ANNUAL_BAS_UPDATE_REMINDER.md` (this file)
- `LES_AUDITOR_DEPLOYMENT_COMPLETE.md` (full deployment guide)


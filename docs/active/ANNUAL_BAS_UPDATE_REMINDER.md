# 📅 ANNUAL BAS RATE UPDATE REMINDER

**Contact:** joemugnai@familymedia.com  
**Frequency:** Every January 1st  
**Task:** Update BAS rates in SSOT  
**Time Required:** 5 minutes

---

## 🚨 WHAT TO DO EVERY JANUARY 1ST

### 1. Check DFAS for New BAS Rates
**Source:** https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/

Look for "Basic Allowance for Subsistence (BAS)" section.

---

### 2. Update lib/ssot.ts

**File:** `lib/ssot.ts` (around line 203)

**Find this section:**
```typescript
militaryPay: {
  // Basic Allowance for Subsistence (BAS) - Monthly rates in cents
  // Source: DFAS - https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/
  // As of: 2025-01-01
  basMonthlyCents: {
    officer: 31164, // $311.64/month
    enlisted: 46066  // $460.66/month
  },
```

**Update with new rates:**
```typescript
  basMonthlyCents: {
    officer: XXXXX, // $XXX.XX/month ← NEW RATE FROM DFAS
    enlisted: XXXXX  // $XXX.XX/month ← NEW RATE FROM DFAS
  },
  // As of: 2026-01-01 ← UPDATE THIS DATE
```

---

### 3. Commit & Deploy
```bash
git add lib/ssot.ts
git commit -m "chore(ssot): Update BAS rates for 2026 (DFAS)"
git push
```

Vercel auto-deploys in ~2 minutes.

---

### 4. Verify in Production
Navigate to: https://garrisonledger.com/dashboard/paycheck-audit

Upload a test LES and verify BAS comparison uses new rates.

---

## 📧 EMAIL REMINDER TEMPLATE

**Subject:** ACTION REQUIRED: Update BAS Rates in Garrison Ledger (Jan 1, 2026)

**To:** joemugnai@familymedia.com

**Body:**
```
BLUF: DFAS publishes new BAS rates every January 1st. 
Update lib/ssot.ts to ensure LES Auditor uses current rates.

STEPS:
1. Check DFAS: https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/
2. Get new Officer and Enlisted BAS monthly rates
3. Edit lib/ssot.ts (line 207-210)
4. Update cents values and "As of" date
5. Commit: git commit -m "chore(ssot): Update BAS rates for 2026"
6. Push: git push

TIME: 5 minutes
PRIORITY: High (affects LES Auditor accuracy)

DETAILS: See docs/active/ANNUAL_BAS_UPDATE_REMINDER.md

---
Garrison Ledger Maintenance Alert
This is an automated annual reminder.
```

---

## 🔔 HOW TO SET UP CALENDAR REMINDER

### Option 1: Google Calendar
1. Create recurring event: "Update Garrison Ledger BAS Rates"
2. Date: January 1st (yearly)
3. Add email notification 3 days before
4. Add this link to event: https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/

### Option 2: Apple Calendar
1. Create recurring reminder: "Update BAS Rates - Garrison Ledger"
2. Date: January 1st (yearly)
3. Add alert: 3 days before
4. Add note: "Check DFAS website and update lib/ssot.ts"

### Option 3: Task Manager (Todoist, etc.)
```
Task: Update Garrison Ledger BAS Rates
Due: January 1, 2026 (recurring yearly)
Priority: High
Link: https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/
Notes: See docs/active/ANNUAL_BAS_UPDATE_REMINDER.md
```

---

## 📊 WHAT RATES TO LOOK FOR

### On DFAS Website, find:

**Table Title:** "Basic Allowance for Subsistence (BAS) Rates"

**Look for these two values:**

| Category | 2025 Rate | Where to Find |
|----------|-----------|---------------|
| Officers | $311.64/month | "Officers: $XXX.XX" |
| Enlisted | $460.66/month | "Enlisted Members: $XXX.XX" |

### Convert to Cents:
```
Officer: $311.64 → 31164 cents
Enlisted: $460.66 → 46066 cents
```

---

## ✅ VERIFICATION CHECKLIST

After updating:
- [ ] Rates updated in `lib/ssot.ts`
- [ ] "As of" date updated
- [ ] Changes committed to git
- [ ] Deployed to production (Vercel)
- [ ] Tested with real LES upload
- [ ] BAS comparison shows correct expected value

---

## 🔮 FUTURE: AUTOMATE THIS?

**v2 Enhancement Idea:**
Create a script that:
1. Scrapes DFAS website monthly
2. Compares current SSOT rates vs published rates
3. Sends email alert if mismatch detected
4. Auto-generates PR with updated rates

Would you like me to build this? (~1 hour)

---

**Created By:** Cursor AI Agent  
**For:** joemugnai@familymedia.com  
**Purpose:** Annual BAS rate maintenance  
**Next Update Due:** January 1, 2026


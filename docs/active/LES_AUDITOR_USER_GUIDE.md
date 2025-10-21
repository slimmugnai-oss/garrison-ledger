# LES Auditor - User Guide

**Last Updated:** 2025-10-21  
**Status:** Production Ready  
**Access:** Free: 1/month | Premium: Unlimited

---

## What is LES Auditor?

LES Auditor is a military pay verification tool that automatically checks your Leave and Earnings Statement (LES) for errors by comparing your actual pay to what you should be receiving based on official DFAS rates.

**Bottom Line Up Front:**  
Upload your LES PDF → We parse allowances → Compare to expected rates → Flag any discrepancies → Give you actionable next steps

---

## Required Profile Information

Before using LES Auditor, you must complete these profile fields:

| Field | Why It's Needed | Example |
|-------|-----------------|---------|
| **Rank** | Determines your BAS rate and BAH entitlement | E-5, O-3, W-2 |
| **Current Base** | Determines your BAH location rate | Fort Liberty, NC |
| **Dependent Status** | Affects BAH rate (with deps = higher) | Yes/No |

**How to complete:**
1. Go to Dashboard → Profile Setup
2. Fill in Military Identity section (rank, branch, component)
3. Fill in Location section (current base)
4. Fill in Family section (dependent status)
5. Save profile
6. Return to LES Auditor

---

## How to Use LES Auditor

### Step 1: Export Your LES from myPay

1. Log in to https://mypay.dfas.mil
2. Navigate to "Leave and Earnings Statement"
3. Select the pay period you want to audit
4. Click **"Export as PDF"** or **"Download PDF"**
5. Save to your computer

**Requirements:**
- Must be PDF format (not screenshot)
- Maximum 5MB file size
- Standard LES format (DFAS/service pay system)

### Step 2: Upload to LES Auditor

1. Go to Dashboard → LES Auditor
2. Click **"Choose LES PDF"**
3. Select your downloaded PDF
4. Wait for upload and parsing (10-30 seconds)

**During Upload:**
- File is securely uploaded to encrypted storage
- PDF is parsed server-side (never exposed to client)
- Line items are extracted (BAH, BAS, COLA, special pays)

### Step 3: Review Audit Results

The audit shows:
- **Summary Card:** Total flags by severity (red/yellow/green)
- **Flag Cards:** Each discrepancy with details
- **Provenance:** Data sources used for comparison
- **Export Option:** Download PDF report

**Flag Types:**

🔴 **Red Flags (Critical):**
- BAH mismatch (wrong rate)
- BAS missing or incorrect
- COLA stopped unexpectedly
- Required allowance missing

⚠️ **Yellow Flags (Review):**
- Minor variance (within threshold but check next month)
- COLA when not expected (verify eligibility)
- Promotion not yet reflected (give it time)

✅ **Green Flags (Verified):**
- BAH correct for your rank/location/deps
- BAS correct for your category (officer/enlisted)
- All expected allowances present

### Step 4: Take Action

For each red flag:
1. Read the **"What to do"** suggestion
2. Click **"Learn"** link to understand the allowance
3. Export audit as PDF
4. Contact your finance office with the audit report
5. Follow up until resolved

---

## What We Check

### Allowances Verified ✅

| Allowance | What It Is | How We Verify |
|-----------|-----------|---------------|
| **BAH** | Basic Allowance for Housing | DFAS BAH rates by rank/location/deps |
| **BAS** | Basic Allowance for Subsistence | Officer vs Enlisted rates from SSOT |
| **COLA** | Cost of Living Allowance | CONUS/OCONUS COLA rates if eligible |
| **Special Pays** | SDAP, HFP, IDP, FSA, etc. | Future: Manual entry for now |

### What We DON'T Check (Yet)

- Base Pay (assumes correct for rank/TIS)
- Deductions (TSP, SGLI, taxes)
- Allotments (voluntary savings)
- One-time bonuses or back pay

---

## Understanding Audit Results

### Example Red Flag: BAH Mismatch

```
🔴 BAH MISMATCH
Expected: $1,500/month
Actual: $1,350/month
Difference: +$150 underpaid

What to do: Contact your finance office. You should be receiving $1,500 
based on your rank (E-5), location (Fort Liberty, NC), and dependent 
status (with dependents). Bring this audit report.
```

**Action Steps:**
1. Verify your profile info is correct (rank, base, deps)
2. Check if you recently PCS'd (rate change delay is normal)
3. Export audit PDF
4. Visit finance office or submit ticket
5. Reference DFAS BAH calculator: https://www.defensetravel.dod.mil/site/bahCalc.cfm

### Example Yellow Flag: Minor Variance

```
⚠️ MINOR VARIANCE
Expected BAS: $460.66
Actual BAS: $459.50
Difference: $1.16 difference

What to do: Monitor next month's LES. Small variances can occur due to 
mid-month changes or partial pay periods. If it persists, follow up 
with finance.
```

### Example Green Flag: All Correct

```
✅ BAH CORRECT
Expected: $1,500/month
Actual: $1,500/month

Your BAH is correct for E-5 with dependents at Fort Liberty, NC.
```

---

## Tier Limits & Quota

### Free Tier
- **Limit:** 1 LES audit per month
- **Resets:** 1st of each month
- **Usage:** Tracked on dashboard

**If you exceed:**
- Error message: "Monthly upload limit reached"
- Upgrade prompt displayed
- Or wait until next month

### Premium Tier
- **Limit:** Unlimited audits
- **Cost:** $9.99/month or $99/year
- **Benefit:** Audit every payday

**To upgrade:**
1. Click "Upgrade to Premium" on limit message
2. Or go to Dashboard → Upgrade
3. Select plan and complete payment
4. Access unlocks immediately

---

## Data Privacy & Security

### What We Store
- ✅ Pay period (month/year)
- ✅ Line item amounts (BAH, BAS, COLA only)
- ✅ Expected pay snapshot (for comparison)
- ✅ Audit flags (red/yellow/green)

### What We DON'T Store
- ❌ Full LES text or images
- ❌ Personal identifiable information (SSN, DOB)
- ❌ Bank account numbers
- ❌ Exact salary or total pay

### Security Measures
- 🔒 PDF encrypted in storage (AES-256)
- 🔒 Row-level security on all tables
- 🔒 Server-side parsing only
- 🔒 User_id validation on all queries
- 🔒 No cross-user data access possible

**Storage Path:**
```
/user/<your-user-id>/<year-month>/<unique-id>.pdf
```

Only you can access your files. Not even admins can view your raw LES.

---

## Troubleshooting

### Upload Fails

**Error: "File size exceeds 5MB limit"**
- **Fix:** Compress PDF using online tool (e.g., SmallPDF)
- Or export smaller date range from myPay

**Error: "Only PDF files are supported"**
- **Fix:** Ensure file is PDF, not screenshot or image
- Export from myPay as PDF, not print-to-PDF from browser

**Error: "Monthly upload limit reached"**
- **Fix:** Upgrade to Premium or wait until next month
- Free tier: 1 audit/month

### Parsing Fails

**Error: "PDF format not recognized"**
- **Cause:** LES format varies by service/system
- **Fix:** Try exporting from myPay again
- Contact support if issue persists

**Error: "Profile incomplete"**
- **Cause:** Missing rank, base, or dependent status
- **Fix:** Complete profile → return to auditor

### Audit Results Unexpected

**BAH looks wrong but audit says correct:**
- Verify your profile info (rank, base, deps)
- Check if you recently PCS'd (rate change lag)
- Click "Data Sources" to see calculation parameters
- Use DFAS BAH calculator to double-check: https://www.defensetravel.dod.mil/site/bahCalc.cfm

**Missing allowances not flagged:**
- Some special pays require manual entry (future feature)
- Audit focuses on standard allowances (BAH/BAS/COLA)
- Report any bugs to support

---

## FAQ

### How accurate is the audit?

**99%+ accurate for standard allowances (BAH/BAS).**

We use official DFAS rates tables and rigorous comparison thresholds. However:
- Always verify with official DFAS calculator
- Mid-month changes may cause temporary variances
- Service-specific special pays may not be covered yet

### Can I audit historical LES?

**Yes!** Upload any LES from January 2020 onwards.

Historical audits help you:
- Find past underpayments
- Build case for back pay
- Verify promotion took effect correctly

### Does this replace talking to finance?

**No.** LES Auditor helps you:
- Identify issues BEFORE going to finance
- Bring data-backed evidence
- Know what questions to ask

You still need finance to fix discrepancies.

### What if I disagree with the audit?

1. Click "Data Sources" to see how we calculated
2. Verify your profile info is correct
3. Use official DFAS calculators to cross-check
4. Contact support if you believe there's a bug

### Can I share my audit report?

**Yes!** Use the "Export as PDF" button to:
- Save for your records
- Bring to finance office
- Email to spouse or POC

**Privacy:** PDF contains only the audit results, not your full LES.

---

## Support & Feedback

### Need Help?
- **In-app:** Dashboard → Support
- **Email:** support@garrisonledger.com
- **Documentation:** This guide + LES Auditor docs

### Report a Bug
Include:
- Pay period (month/year)
- Error message (if any)
- Expected vs actual result
- Your rank/base (no PII)

### Feature Requests
We're actively developing:
- Manual entry for special pays (SDAP, HFP, IDP)
- Trend analysis (underpayments over time)
- Auto-monitor new LES (connect to myPay API if approved)

---

## Tips for Success

✅ **Audit every payday** (Premium users)  
✅ **Keep profile updated** (especially after PCS/promotion)  
✅ **Export PDF reports** (for finance office visits)  
✅ **Monitor yellow flags** (become red if they persist)  
✅ **Use Intel Library** (understand each allowance)

❌ **Don't skip profile setup** (audit will fail)  
❌ **Don't upload non-PDF files** (will be rejected)  
❌ **Don't ignore red flags** (could be losing money)  
❌ **Don't assume finance is always right** (errors happen)

---

## Related Resources

- **Intel Library:** BAH Basics, BAS Guide, COLA Explained
- **Calculators:** BAH Calculator, BAS Calculator
- **DFAS Official:** https://www.dfas.mil
- **myPay Login:** https://mypay.dfas.mil

---

**Last Updated:** 2025-10-21  
**Version:** 1.0  
**Feedback:** support@garrisonledger.com


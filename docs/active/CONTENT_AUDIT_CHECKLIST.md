# 🔍 CONTENT BLOCKS ACCURACY AUDIT CHECKLIST

**Last Updated:** 2025-01-19  
**Purpose:** Ensure all 410 content blocks contain legitimate, accurate, trustworthy information for military audience  
**Frequency:** Quarterly (minimum), or when major policy changes occur

---

## 🎯 **WHY THIS MATTERS**

Your military audience **DEMANDS** accuracy. One piece of bad information can:
- ❌ Destroy trust instantly
- ❌ Cause financial harm to military families
- ❌ Create legal liability
- ❌ Damage brand reputation permanently

**Military values = No-BS, accurate, trustworthy information**

---

## 📋 **AUDIT CATEGORIES**

### **1. REGULATORY ACCURACY** (CRITICAL)

#### **Military Benefits & Regulations**
- [ ] TSP contribution limits (2025: $23,500)
- [ ] TSP Roth vs Traditional rules
- [ ] BRS (Blended Retirement System) percentages
- [ ] High-3 retirement calculations
- [ ] GI Bill benefits (Post-9/11, Montgomery)
- [ ] BAH/BAS rates (updated annually)
- [ ] SGLI coverage amounts ($500k max)
- [ ] Tricare plan details
- [ ] VA loan requirements (0% down)
- [ ] PCS entitlements (DLA, TLE, weight allowances)

**Sources to Verify:**
- Defense Finance and Accounting Service (DFAS)
- TSP.gov official site
- VA.gov
- Military.com (for benefit summaries)
- DoD Financial Management Regulation (FMR)

#### **Tax Information**
- [ ] Tax brackets (updated annually!)
- [ ] Standard deductions
- [ ] Combat zone tax exclusion rules
- [ ] Military tax benefits
- [ ] State tax exemptions for military

**Sources to Verify:**
- IRS.gov
- Military OneSource tax center
- State revenue departments

---

### **2. FINANCIAL ACCURACY** (CRITICAL)

#### **Numbers That Change**
- [ ] Interest rates (avoid specific percentages)
- [ ] Investment returns (use historical ranges, not guarantees)
- [ ] Dollar amounts (inflation-adjust or use ranges)
- [ ] Credit score ranges (verify with FICO/VantageScore)
- [ ] Debt-to-income ratios
- [ ] Emergency fund recommendations (3-6 months standard)

#### **Financial Advice Disclaimers**
- [ ] "Not financial advice" disclaimer present
- [ ] "Consult with financial advisor" recommendation
- [ ] No guarantees of returns or outcomes
- [ ] Risk disclosures for investments
- [ ] Links to licensed advisors (if applicable)

**Best Practice:**
```
"This is educational information only, not financial advice. 
Consult with a qualified financial advisor for personalized guidance."
```

---

### **3. SOURCE ATTRIBUTION** (HIGH PRIORITY)

#### **Every Fact Needs a Source**
- [ ] Regulatory references cite version/date
- [ ] Statistics cite original source
- [ ] Expert quotes attributed properly
- [ ] Links to official sources provided
- [ ] "According to [source]" language used

#### **Trusted Sources for Military Content**
- ✅ DFAS.mil (pay, benefits)
- ✅ TSP.gov (retirement savings)
- ✅ VA.gov (veteran benefits)
- ✅ Military.com (benefits summaries)
- ✅ MilitaryOneSource.mil (official resources)
- ✅ IRS.gov (tax information)
- ✅ CFPB.gov (consumer finance)
- ❌ Random blogs (not authoritative)
- ❌ Forums (anecdotal, not official)
- ❌ Outdated websites

---

### **4. LANGUAGE AUDIT** (CRITICAL FOR TRUST)

#### **Avoid These Red Flags:**
- ❌ "Guaranteed" (unless truly guaranteed by law)
- ❌ "Always" / "Never" (too absolute)
- ❌ "Definitely will" (false certainty)
- ❌ "Get rich quick" (predatory)
- ❌ "No risk" (everything has risk)
- ❌ "Secret" / "Hack" (gimmicky)
- ❌ "Beats the system" (dishonest)

#### **Use These Instead:**
- ✅ "May" / "Could" / "Potentially"
- ✅ "Historically" / "Typically"
- ✅ "Consider" / "Evaluate"
- ✅ "Consult with" / "Work with"
- ✅ "According to" / "Based on"
- ✅ "In most cases" / "Generally"

---

### **5. OUTDATED INFORMATION** (HIGH PRIORITY)

#### **Check for Specific Dates/Years**
- [ ] 2019, 2020, 2021, 2022, 2023 mentions
- [ ] "Current year" vs hardcoded years
- [ ] "As of [date]" disclaimers
- [ ] Annual policy updates reflected

#### **Content Freshness:**
- [ ] Created more than 1 year ago? → Review
- [ ] Created more than 2 years ago? → Major update needed
- [ ] References pre-2020 info? → Verify still accurate

---

### **6. MILITARY-SPECIFIC ACCURACY** (CRITICAL)

#### **Rank & Pay**
- [ ] E-1 through E-9 pay scales (updated annually)
- [ ] O-1 through O-10 pay scales
- [ ] W-1 through W-5 warrant officer pay
- [ ] Special pays (flight pay, hazard duty, etc.)
- [ ] Bonuses (reenlistment, critical skills)

#### **Branch-Specific Info**
- [ ] Army regulations (AR)
- [ ] Navy instructions (OPNAV)
- [ ] Air Force instructions (AFI)
- [ ] Marine Corps orders (MCO)
- [ ] Coast Guard instructions (COMDTINST)
- [ ] Space Force directives

**Verify:** Each branch has different rules/procedures

---

### **7. LEGAL COMPLIANCE** (CRITICAL)

#### **Required Disclaimers**
- [ ] Financial advice disclaimer
- [ ] Tax advice disclaimer (not tax advice)
- [ ] Legal disclaimer (not legal advice)
- [ ] Medical disclaimer (if health topics)
- [ ] Affiliate disclosure (if applicable)

#### **Avoid Legal Issues:**
- [ ] No unauthorized use of government seals/logos
- [ ] No misleading endorsements
- [ ] No false claims
- [ ] No copyright violations
- [ ] No impersonation of official sources

---

## 🚀 **AUTOMATED AUDIT SCRIPT**

Run the audit script:
```bash
node scripts/audit-content-blocks.js
```

This will automatically flag:
- Specific years (2019-2023)
- Specific dollar amounts
- Regulatory references
- Interest rates/percentages
- Guarantee language
- Tax information
- Missing disclaimers
- Content over 1 year old
- Missing source attribution

**Review the output:** `CONTENT_AUDIT_REPORT.json`

---

## 📊 **AUDIT WORKFLOW**

### **Quarterly Audit Process:**

**Week 1: Automated Scan**
1. Run `node scripts/audit-content-blocks.js`
2. Review `CONTENT_AUDIT_REPORT.json`
3. Prioritize critical flags

**Week 2: Manual Review**
4. Review top 50 most-used content blocks
5. Verify sources for all financial/regulatory content
6. Check for outdated information

**Week 3: Updates**
7. Update flagged content blocks
8. Add missing disclaimers
9. Update regulatory references
10. Add source attribution

**Week 4: Verification**
11. Re-run audit script
12. Spot-check random blocks
13. Document changes in audit log

---

## 🎖️ **SPECIAL MILITARY CONSIDERATIONS**

### **When Major Policy Changes Occur:**

**Immediate Audit Required:**
- [ ] Defense budget changes (affects pay/benefits)
- [ ] NDAA passage (annual authorization act)
- [ ] TSP policy updates
- [ ] Retirement system changes
- [ ] Healthcare/Tricare changes
- [ ] GI Bill updates
- [ ] Tax law changes (TCJA, etc.)

**Subscribe to:**
- DFAS news updates
- Military.com newsletters
- TSP bulletins
- VA updates
- MilitaryOneSource alerts

---

## 📝 **DOCUMENTATION**

### **Audit Log Template:**

```
Date: YYYY-MM-DD
Auditor: [Name]
Blocks Reviewed: [#]
Flags Found: [#]
Critical Issues: [#]
Updates Made: [#]

Key Changes:
- Updated TSP contribution limits (2025)
- Added disclaimers to 15 finance blocks
- Corrected BRS percentage (5% match)
- Updated 23 blocks with source attribution

Next Audit Due: [Date]
```

---

## 🚨 **CRITICAL BLOCKS TO AUDIT FIRST**

### **High-Risk Content (Audit Monthly):**
1. TSP contribution strategies
2. Retirement calculations (BRS vs High-3)
3. Tax advice content
4. Investment recommendations
5. Debt payoff strategies
6. VA loan information
7. GI Bill transfer rules
8. SGLI/life insurance content
9. PCS entitlement calculations
10. Deployment financial planning

---

## ✅ **TRUST SIGNALS TO ADD**

### **Increase Credibility:**
- [ ] "According to DFAS..." with link
- [ ] "Per TSP.gov..." with link
- [ ] "Based on [Year] IRS guidelines"
- [ ] "Verified with Military OneSource"
- [ ] "As stated in [Regulation #]"
- [ ] Last updated: [Date]
- [ ] Reviewed by: [Credential]

---

## 🎯 **SUCCESS METRICS**

### **Audit Quality Goals:**
- ✅ 100% of finance content has disclaimers
- ✅ 100% of regulations cite source/version
- ✅ 0 guarantee/promise language
- ✅ 90%+ blocks updated within last year
- ✅ All tax info current for tax year
- ✅ All benefit info matches official sources

---

## 📞 **WHEN TO CONSULT EXPERTS**

### **Get Professional Review:**
- **CFP (Certified Financial Planner):** Investment/financial content
- **CPA (Certified Public Accountant):** Tax content
- **Attorney:** Legal content, disclaimers
- **Military benefits counselor:** Complex benefit scenarios
- **Compliance expert:** Regulatory language

**Cost:** $100-300/hour for expert review  
**ROI:** Prevents catastrophic trust loss

---

## 🔒 **LEGAL PROTECTION**

### **Best Practices:**
1. Add clear disclaimers to ALL financial/tax/legal content
2. Cite official sources for regulations
3. Use "educational purposes only" language
4. Avoid absolute guarantees
5. Update content at least annually
6. Document audit process
7. Keep audit logs for 3+ years

---

## 📚 **RESOURCES**

### **Official Sources:**
- DFAS: https://www.dfas.mil
- TSP: https://www.tsp.gov
- VA: https://www.va.gov
- Military OneSource: https://www.militaryonesource.mil
- IRS: https://www.irs.gov
- CFPB: https://www.consumerfinance.gov

### **Regulatory References:**
- DoD FMR (Financial Management Regulation)
- NDAA (National Defense Authorization Act)
- USC Title 10 (Armed Forces)
- USC Title 37 (Pay and Allowances)

---

**REMEMBER: Your military audience trusts you with their financial future. That trust is earned through accuracy, honesty, and continuous verification.** 🎖️


# LES Auditor - Practice Test Scenarios

**Purpose:** Testing data for LES Auditor validation

---

## Test Scenario #1: E-5 with Dependents (Fort Campbell, KY)

**Profile:**
- Rank: E-5 (Staff Sergeant)
- Paygrade: E05
- Years of Service: 6 years
- Location: Fort Campbell, KY (MHA: KY602)
- Dependents: YES (married with 2 children)
- Special Pays: SDAP ($375/month)

**Expected Pay (October 2025):**
- Base Pay: $3,666.00
- BAH w/ Deps (KY602): $1,647.00
- BAS (Enlisted): $460.66
- SDAP: $375.00
- **Gross:** $6,148.66

**Expected Deductions:**
- Federal Tax: ~$458.00 (estimated)
- FICA (6.2%): $381.62
- Medicare (1.45%): $89.15
- TSP (5%): $183.30
- SGLI ($400K): $28.00
- Dental: $12.52
- **Total Deductions:** $1,152.59

**Expected Net:** $4,496.07

**LES File:** `lib/les/__fixtures__/practice_les_e5_with_deps.txt`

---

## Test Scenario #2: O-3 without Dependents (Hawaii - OCONUS)

**Profile:**
- Rank: O-3 (Captain)
- Paygrade: O03
- Years of Service: 8 years
- Location: Joint Base Pearl Harbor-Hickam, HI (OCONUS)
- Dependents: NO
- Special Pays: HFP ($225/month), COLA ($894/month)

**Expected Pay (October 2025):**
- Base Pay: $7,506.60
- BAH w/o Deps: $2,736.00
- BAS (Officer): $311.64
- COLA (OCONUS): $894.00
- HFP: $225.00
- **Gross:** $11,673.24

**Expected Deductions:**
- Federal Tax: ~$1,534.00 (estimated)
- FICA (6.2%): $723.91
- Medicare (1.45%): $169.26
- TSP Roth (5%): $375.33
- SGLI ($400K): $28.00
- SBP: $65.00
- **Total Deductions:** $2,895.50

**Expected Net:** $8,777.74

**LES File:** `lib/les/__fixtures__/practice_les_o3_no_deps.txt`

---

## Manual Entry Test Values

### Scenario 1: E-5 Manual Entry
```json
{
  "month": 10,
  "year": 2025,
  "allowances": {
    "BAH": 164700,     // $1,647.00 in cents
    "BAS": 46066,      // $460.66 in cents
    "SDAP": 37500      // $375.00 in cents
  }
}
```

### Scenario 2: O-3 Manual Entry
```json
{
  "month": 10,
  "year": 2025,
  "allowances": {
    "BAH": 273600,     // $2,736.00 in cents
    "BAS": 31164,      // $311.64 in cents
    "COLA": 89400,     // $894.00 in cents
    "HFP": 22500       // $225.00 in cents (HFP/IDP standard rate)
  }
}
```

---

## Expected Audit Results

### Scenario 1: All Correct (Green Flags)
If LES matches expected perfectly:
- ✅ BAH verified correct: $1,647.00
- ✅ BAS verified correct: $460.66
- ✅ SDAP verified correct: $375.00
- ✅ All allowances verified. No discrepancies found.

### Scenario 2: BAH Mismatch (Red Flag)
If LES shows wrong BAH ($1,500 instead of $1,647):
- 🔴 BAH mismatch: Received $1,500.00, expected $1,647.00 for E05 with dependents at KY602. Delta: +$147.00
- **Suggestion:** Contact your finance office immediately. Bring this LES and verify your duty station (MHA KY602) and dependent status (with dependents) are correct in DEERS/DJMS.

### Scenario 3: BAS Missing (Red Flag)
If LES shows no BAS:
- 🔴 BAS not found on LES. Expected $460.66/month for E05.
- **Suggestion:** File emergency pay ticket with finance office TODAY. BAS is a mandatory entitlement.

---

## Quick Test Commands

### Manual Entry API Test
```bash
curl -X POST https://garrisonledger.com/api/les/audit-manual \
  -H "Content-Type: application/json" \
  -d '{
    "month": 10,
    "year": 2025,
    "allowances": {
      "BAH": 164700,
      "BAS": 46066,
      "SDAP": 37500
    }
  }'
```

### Expected Values API Test
```bash
curl https://garrisonledger.com/api/les/expected-values?month=10&year=2025
```

---

## Common Test Cases

### Test Case 1: Perfect LES
- All allowances match expected
- All deductions accurate
- **Expected:** All green flags

### Test Case 2: Underpaid BAH
- BAH $100 less than expected
- **Expected:** Red flag with delta amount

### Test Case 3: Missing BAS
- BAS = $0
- **Expected:** Critical red flag

### Test Case 4: COLA Unexpected
- CONUS station receiving COLA
- **Expected:** Yellow warning flag

### Test Case 5: FICA at Wage Limit
- YTD gross > $168,600
- **Expected:** Zero FICA for current month

---

## Notes

- All dollar amounts in cents for API calls
- MHA codes: KY602 (Fort Campbell), HI996 (Pearl Harbor)
- Practice files in `lib/les/__fixtures__/`
- Real testing requires authenticated session


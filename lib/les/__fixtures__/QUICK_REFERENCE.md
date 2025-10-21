# LES Auditor - Quick Test Reference

## Quick Manual Entry Values (Copy-Paste Ready)

### E-5 @ Fort Campbell (6 YOS, with dependents)
```
BAH:  164700  ($1,647.00)
BAS:  46066   ($460.66)
SDAP: 37500   ($375.00)
```

### O-3 @ Pearl Harbor (8 YOS, no dependents)
```
BAH:  273600  ($2,736.00)
BAS:  31164   ($311.64)
COLA: 89400   ($894.00)
HFP:  22500   ($225.00)
```

### E-7 @ Fort Bragg (12 YOS, with dependents)
```
BAH:  165300  ($1,653.00)
BAS:  46066   ($460.66)
```

### O-5 @ Pentagon (16 YOS, with dependents)
```
BAH:  309000  ($3,090.00)
BAS:  31164   ($311.64)
```

---

## Common BAH Rates (2025)

| Base | MHA | E-5 w/Deps | E-5 no Deps | O-3 w/Deps |
|------|-----|-----------|-------------|------------|
| Fort Campbell, KY | KY602 | $1,647 | $1,398 | $2,073 |
| Fort Bragg, NC | NC819 | $1,653 | $1,362 | $2,061 |
| Fort Hood, TX | TX650 | $1,596 | $1,320 | $1,986 |
| Camp Pendleton, CA | CA807 | $3,213 | $2,421 | $4,089 |
| Joint Base Lewis-McChord, WA | WA990 | $2,295 | $1,746 | $2,898 |

---

## Standard BAS Rates (2025)

- **Officer:** $311.64/month (31164 cents)
- **Enlisted:** $460.66/month (46066 cents)

---

## Common Special Pays

| Pay Type | Typical Amount | Code |
|----------|---------------|------|
| SDAP (Special Duty Assignment) | $150-$450 | SDAP |
| HFP/IDP (Hostile Fire/Imminent Danger) | $225 | HFP |
| FSA (Family Separation) | $250 | FSA |
| FLPP (Foreign Language) | $100-$500 | FLPP |

---

## Standard Deductions

### Taxes (October 2025)
- **FICA:** 6.2% of gross (max $168,600/year)
- **Medicare:** 1.45% of gross (no max)
- **Federal Tax:** Varies by W-4 (use withholding tables)

### Insurance
- **SGLI $400K:** $28.00/month (2800 cents)
- **SGLI $100K:** $7.00/month (700 cents)
- **Dental (family):** $12.52/month (1252 cents)

### Retirement
- **TSP:** User-elected % (common: 5%, 10%, 15%, 20%)

---

## Expected Audit Flags for Practice LES

### E-5 Practice LES (Should be all green)
- ✅ BAH verified: $1,647.00 (KY602 w/deps)
- ✅ BAS verified: $460.66 (enlisted)
- ✅ SDAP verified: $375.00
- ✅ All allowances verified

### O-3 Practice LES (Should be all green)
- ✅ BAH verified: $2,736.00 (HI996 no deps)
- ✅ BAS verified: $311.64 (officer)
- ✅ COLA verified: $894.00 (OCONUS)
- ✅ HFP verified: $225.00
- ✅ All allowances verified

---

## Creating Test Discrepancies

To test red/yellow flags, modify manual entry:

### Test BAH Mismatch (Red Flag)
```
BAH: 150000  ($1,500.00 - $147 less than expected)
```

### Test BAS Missing (Red Flag)
```
BAH: 164700
BAS: 0       (Missing - should be $460.66)
```

### Test COLA Unexpected (Yellow Flag)
For CONUS base (no COLA):
```
BAH: 164700
BAS: 46066
COLA: 50000  (Unexpected for CONUS)
```

---

## Quick Copy-Paste for Testing

### Profile Setup (E-5 Fort Campbell)
- Rank: Staff Sergeant (E-5)
- Base: Fort Campbell
- Dependents: Yes
- Time in Service: 6 years

### Profile Setup (O-3 Pearl Harbor)
- Rank: Captain (O-3)
- Base: Joint Base Pearl Harbor-Hickam
- Dependents: No
- Time in Service: 8 years


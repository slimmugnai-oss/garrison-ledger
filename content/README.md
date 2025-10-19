# Intel Cards Content Directory

This directory contains atomic Intel Cards - focused, factual reference content for military financial intelligence.

## Directory Structure

- **`/finance`** - Financial topics (TSP, SGLI, SDAP, BAS/BAH, etc.)
- **`/pcs`** - PCS moves, DITY, PPM, TLE/TLA
- **`/deployment`** - Deployment prep, SDP, combat pay, family readiness
- **`/career`** - Promotion, retention, transition, education benefits
- **`/lifestyle`** - On-base shopping, commissary, MWR, childcare
- **`/examples`** - Example Intel Cards showing all MDX components

## MDX Components Reference

### Disclaimer

```mdx
<Disclaimer kind="finance" />
<Disclaimer kind="tax" />
<Disclaimer kind="benefits" />
<Disclaimer kind="legal" />
<Disclaimer kind="finance" compact />
```

### AsOf (Data Provenance)

```mdx
<AsOf source="BAH" />
<AsOf source="BAS" />
<AsOf source="COLA" />
<AsOf source="IRS_TSP_LIMITS" />
<AsOf source="TRICARE_COSTS" />
```

### DataRef (Dynamic Data)

```mdx
<DataRef 
  source="BAH" 
  code="WA408" 
  paygrade="E06" 
  withDeps={true} 
  format="money" 
/>

<DataRef 
  source="BAS" 
  paygrade="E05" 
/>

<DataRef 
  source="COLA" 
  code="CA917" 
  paygrade="E06" 
  withDeps={true} 
/>

<DataRef 
  source="IRS_TSP_LIMITS" 
  field="TSP_ELECTIVE_DEFERRAL_LIMIT_2025" 
/>

<DataRef 
  source="TRICARE_COSTS" 
  field="TRICARE_SELECT_INDIVIDUAL_DEDUCTIBLE_E1_E4_2025" 
/>

<DataRef 
  source="MILEAGE_RATE" 
  format="money" 
/>
```

### RateBadge (Highlighted Rate Display)

```mdx
<RateBadge 
  source="BAH" 
  code="WA408" 
  paygrade="E06" 
  withDeps={true} 
/>
```

## Frontmatter Schema

Every Intel Card must have frontmatter:

```mdx
---
id: finance-tsp-basics
title: TSP Contribution Basics
domain: finance
tags: [tsp, retirement, savings]
gating: free  # or "premium"
asOf: "2025-01-15"  # Last verified date (optional for static content)
dynamicRefs:
  - { source: "IRS_TSP_LIMITS" }
  - { source: "BAS" }
---
```

## Content Guidelines

### 1. Factual-Only Policy
- **NO** guaranteed outcomes
- **NO** specific dollar amounts (use `<DataRef>` instead)
- **NO** specific years (use dynamic refs)
- **NO** synthetic or estimated data

### 2. Required Elements
- Every card must start with **BLUF** (Bottom Line Up Front)
- Add `<Disclaimer>` above first H2 for finance/tax/benefits/legal topics
- Include `<AsOf>` badge if content references time-sensitive data
- Wrap all numeric values with `<DataRef>` or `<RateBadge>`

### 3. Prohibited Language
- ❌ "guaranteed", "promise", "risk-free", "surefire"
- ❌ "will always", "never", "definitely"
- ✅ "typically", "often", "may", "generally", "historically"

### 4. Writing Style
- **Direct & professional** (military audience)
- **Scannable** (short paragraphs, bullet lists)
- **Action-oriented** (clear next steps)
- **Respectful** (no condescending tone)

## Example Intel Card

See `/content/examples/complete-card.mdx` for a full example showing all components.

## Content Linter

Before committing, run:

```bash
npm run content:lint      # Check for issues
npm run content:autofix   # Apply safe fixes
```

## Admin Updates

When dynamic data changes (BAH/COLA/IRS/TSP):
1. Admin uploads new rates via `/app/admin/feeds`
2. Cron refreshes feeds (daily/weekly)
3. `as_of_date` auto-updates for impacted Intel Cards
4. No manual content edits needed! 🎉


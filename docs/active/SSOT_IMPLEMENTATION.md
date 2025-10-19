# Single Source of Truth (SSOT) Implementation

**Date:** 2025-01-19  
**Status:** ✅ IMPLEMENTED  
**Module:** `lib/ssot.ts`

---

## Overview

The **Single Source of Truth (SSOT)** system centralizes all platform facts, metrics, costs, and configuration in one canonical module. This ensures consistency across the codebase and prevents documentation drift.

---

## Architecture

### Core Module: `lib/ssot.ts`

All user-facing facts, counts, and model/cost truths are defined here:

```typescript
import { ssot } from '@/lib/ssot';

// Access system facts
const aiModel = ssot.models.planGeneration.model; // "Gemini-2.0-Flash"
const cost = ssot.models.planGeneration.approxCostPerPlanUSD; // 0.02
const basesTotal = ssot.counts.bases.total; // 203
```

---

## Key Sections

### 1. System Version & Metadata
```typescript
ssot.lastUpdatedISO    // "2025-01-19"
ssot.version           // "4.0.0"
ssot.environment       // "production" or "development"
```

### 2. Brand & Design System
```typescript
ssot.brand.name        // "Garrison Ledger"
ssot.brand.primary     // "slate-900→slate-800"
ssot.brand.semantics   // { success: "green-600", warn: "amber-600", ... }
```

### 3. AI Models & Costs
```typescript
ssot.models.planGeneration   // Provider, model, cost per plan
ssot.models.explainers       // Gemini 2.0 Flash config
ssot.models.assessment       // Gemini 2.0 Flash config
```

**Example:**
```typescript
const { provider, model, approxCostPerPlanUSD } = ssot.models.planGeneration;
// provider: "Google"
// model: "Gemini-2.0-Flash"
// approxCostPerPlanUSD: 0.02
```

### 4. Feature Status
```typescript
ssot.features.baseComparison    // { status: "removed", reason: "..." }
ssot.features.naturalSearch     // { status: "removed" }
ssot.features.baseGuides        // { status: "active", totalBases: 203 }
ssot.features.pcsMoneyCopilot   // { status: "active", tier: "premium-exclusive" }
```

**Helper function:**
```typescript
import { isFeatureActive } from '@/lib/ssot';

if (isFeatureActive('baseGuides')) {
  // Render base guides UI
}
```

### 5. Platform Counts (Build-Time Generated)
```typescript
ssot.counts.pages       // Auto-counted by CI
ssot.counts.apiRoutes   // Auto-counted by CI
ssot.counts.bases       // { conus: 163, oconus: 40, total: 203 }
```

**⚠️ DO NOT HAND-EDIT COUNTS** - Use `npm run generate-metrics` to update.

### 6. External Data Vendors
```typescript
ssot.vendors.weather    // Google Weather API config
ssot.vendors.housing    // Zillow via RapidAPI config
ssot.vendors.schools    // GreatSchools config
```

**Example:**
```typescript
import { getVendor, getVendorCacheTTL } from '@/lib/ssot';

const weatherConfig = getVendor('weather');
// { name: "Google Weather API", cacheDays: 1, ... }

const cacheTTL = getVendorCacheTTL('weather');
// 86400000 (24 hours in milliseconds)
```

### 7. Data Integrity Policy
```typescript
ssot.dataPolicy.factualOnly         // true
ssot.dataPolicy.provenanceRequired  // true
ssot.dataPolicy.noSyntheticData     // true
ssot.dataPolicy.fallback            // "Show 'Unavailable' + source link..."
```

### 8. Pricing & Tiers
```typescript
ssot.pricing.free       // { name, priceMonthly, features }
ssot.pricing.premium    // { name, priceMonthly, priceAnnual, features }
```

**Helper function:**
```typescript
import { getPricing } from '@/lib/ssot';

const premiumPricing = getPricing('premium');
// { name: "Premium", priceMonthly: 9.99, priceAnnual: 99, ... }
```

### 9. Cost Structure
```typescript
ssot.costs.perUserMonthly  // 0.35 (AI + API costs)
ssot.costs.margin          // 0.965 (96.5% margin)
ssot.costs.aiCostPerPlan   // 0.02
```

### 10. Performance Budgets
```typescript
ssot.performance.pageLoadMaxSeconds  // 3
ssot.performance.coreWebVitals.LCP   // 2.5 (Largest Contentful Paint)
ssot.performance.mobile.minTouchTarget  // 44 pixels (WCAG AAA)
```

### 11. URLs & Links
```typescript
ssot.urls.production      // "https://garrisonledger.com"
ssot.urls.docs            // Paths to docs
ssot.urls.external.dfas   // "https://www.dfas.mil"
```

---

## Helper Functions

### getAIModel(useCase)
```typescript
const model = getAIModel('planGeneration');
// { provider: "Google", model: "Gemini-2.0-Flash", approxCostPerPlanUSD: 0.02 }
```

### isFeatureActive(feature)
```typescript
if (isFeatureActive('pcsMoneyCopilot')) {
  // Show PCS Money Copilot
}
```

### getVendor(vendor)
```typescript
const weatherAPI = getVendor('weather');
// { name: "Google Weather API", cacheDays: 1, attribution: "Google" }
```

### getVendorCacheTTL(vendor)
```typescript
const ttl = getVendorCacheTTL('housing');
// 2592000000 (30 days in milliseconds)
```

### formatCost(cost)
```typescript
formatCost(0.02);  // "$0.02"
formatCost(9.99);  // "$9.99"
```

### validateEnvironment()
```typescript
const { valid, missing } = validateEnvironment();
if (!valid) {
  console.error('Missing environment variables:', missing);
}
```

---

## Usage in Code

### Example 1: Display AI Model Info
```tsx
import { ssot } from '@/lib/ssot';

export function AIModelBadge() {
  const { provider, model } = ssot.models.planGeneration;
  
  return (
    <Badge>
      Powered by {provider} {model}
    </Badge>
  );
}
```

### Example 2: Check Feature Status
```tsx
import { isFeatureActive } from '@/lib/ssot';

export function Dashboard() {
  return (
    <>
      {isFeatureActive('baseGuides') && <BaseGuidesSection />}
      {isFeatureActive('pcsMoneyCopilot') && <PCSCopilot />}
    </>
  );
}
```

### Example 3: Get Vendor Config
```tsx
import { getVendor } from '@/lib/ssot';

export async function fetchWeather(baseId: string) {
  const weatherConfig = getVendor('weather');
  const cacheTTL = weatherConfig.cacheDays * 24 * 60 * 60 * 1000;
  
  // Use config for API call
  const response = await fetch(weatherConfig.apiUrl, {
    // ...
  });
  
  return {
    data: await response.json(),
    attribution: weatherConfig.attribution,
    cacheTTL
  };
}
```

---

## Usage in Documentation

### Example: SYSTEM_STATUS.md
```markdown
**AI Model:** {ssot.models.planGeneration.model}  
**Cost per Plan:** ${ssot.models.planGeneration.approxCostPerPlanUSD}  
**Total Bases:** {ssot.counts.bases.total} ({ssot.counts.bases.conus} CONUS, {ssot.counts.bases.oconus} OCONUS)
```

**⚠️ NOTE:** Documentation should reference SSOT conceptually. Actual values should be pulled programmatically or via `generated/metrics.json`.

---

## Generated Metrics

### CI Script: `scripts/generate-metrics.ts`

Runs on every build to generate `generated/metrics.json`:

```json
{
  "generatedAt": "2025-01-19T12:00:00.000Z",
  "version": "4.0.0",
  "counts": {
    "pages": 130,
    "apiRoutes": 98,
    "bases": {
      "conus": 163,
      "oconus": 40,
      "total": 203
    },
    "components": 137,
    "calculators": 6
  }
}
```

### Usage in CI/CD

```yaml
# .github/workflows/security-scan.yml
- name: Generate metrics
  run: npm run generate-metrics

- name: Comment PR with metrics
  run: cat generated/metrics.json
```

---

## Decision Rules

### Rule Priority (No Exceptions)

1. **Security** → 2. **Data Integrity** → 3. **SSOT Truth** → 4. **UX/Accessibility** → 5. **Performance** → 6. **Cost** → 7. **Documentation**

### Tie-Breakers

- If **Security** conflicts with **UX**, security wins.
- If **Data Integrity** conflicts with **Growth**, integrity wins.
- If a doc contradicts SSOT, **SSOT wins** → update docs and commit.
- If cost exceeds SSOT budgets, pick cheaper compliant model/config and document change.

---

## Maintenance

### Updating SSOT

1. Edit `lib/ssot.ts` directly
2. Run `npm run generate-metrics` to update counts
3. Update `SYSTEM_STATUS.md` if major changes
4. Commit with clear message: `feat(ssot): update AI model from X to Y`

### Quarterly Review

- **Check vendor ToS changes** (docs/vendors/*.md)
- **Verify cost assumptions** (ssot.costs.*)
- **Update performance budgets** (ssot.performance.*)
- **Rotate API keys** if needed (security policy)

---

## Security Integration

### Secret Validation

```typescript
const { valid, missing } = validateEnvironment();
if (!valid) {
  throw new Error(`Missing environment variables: ${missing.join(', ')}`);
}
```

### Pre-Commit Hook

`.husky/pre-commit` runs:
1. `npm run secret-scan` (blocks if secrets found)
2. `npm run generate-metrics` (updates counts)
3. TypeScript check (warns but doesn't block)

---

## Best Practices

### ✅ DO

- Import from SSOT for all system facts
- Use helper functions (`getVendor`, `isFeatureActive`, etc.)
- Update SSOT when adding new features or vendors
- Run `generate-metrics` before committing
- Reference SSOT in documentation (conceptually)

### ❌ DON'T

- Hardcode values that exist in SSOT
- Hand-edit generated metrics
- Modify counts directly (use CI script)
- Skip environment variable validation
- Expose secrets (use masked placeholders)

---

## Troubleshooting

### "Missing environment variables"

```bash
# Check which vars are missing
node -e "const { validateEnvironment } = require('./lib/ssot'); console.log(validateEnvironment());"
```

### "Counts don't match"

```bash
# Regenerate metrics
npm run generate-metrics

# Check generated/metrics.json
cat generated/metrics.json
```

### "Secret scan failing"

```bash
# See what secrets were detected
npm run secret-scan

# Auto-mask secrets (review before committing!)
npm run secret-scan -- --fix
```

---

## Related Files

- `lib/ssot.ts` - Core SSOT module
- `scripts/generate-metrics.ts` - Metrics generator
- `scripts/secret-scan.ts` - Secret scanner
- `generated/metrics.json` - Build-time generated metrics
- `.husky/pre-commit` - Pre-commit hook
- `.github/workflows/security-scan.yml` - CI security scan
- `SECURITY_NOTICE_REMEDIATION.md` - Security audit log
- `docs/vendors/*.md` - Vendor documentation

---

**Maintained by:** Garrison Ledger Engineering  
**Review Schedule:** Quarterly  
**Last Review:** 2025-01-19


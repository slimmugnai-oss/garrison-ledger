<!-- 88f3ec67-6b10-45cb-be65-9946951e1ffe 85f149ed-d72a-4fca-bbda-313bddc9f52f -->
# LES Audit Page Comprehensive Audit & Fix Plan

## PRIORITY 1: CRITICAL FUNCTIONALITY BUGS (Blockers)

### 1.1 Fix `mhaOrZip` Initialization Bug

**Problem**: Line 45 in `LesAuditAlwaysOn.tsx` sets `mhaOrZip` to empty string, but it's never populated from `userProfile.currentBase`. This breaks the audit computation on page load.

**Fix** in `app/components/les/LesAuditAlwaysOn.tsx`:

```tsx
// Line 45 - BEFORE:
const [mhaOrZip, setMhaOrZip] = useState("");

// AFTER:
const [mhaOrZip, setMhaOrZip] = useState(userProfile.currentBase || "");
```

**Impact**: Audit will now compute immediately on page load instead of requiring manual input.

---

### 1.2 Add Missing Net Pay Input Field

**Problem**: Net Pay state exists (line 66) but there's NO input field in the UI. Users can't enter their actual net pay for comparison.

**Fix** in `app/components/les/LesAuditAlwaysOn.tsx` after line 350 (after Taxes section):

```tsx
{/* Net Pay Section - NEW */}
<div className="rounded-lg border bg-white p-4">
  <h3 className="mb-3 font-semibold text-gray-900">Net Pay (Bottom Line)</h3>
  <CurrencyField 
    label="Actual Net Pay from LES" 
    value={netPay || 0} 
    onChange={setNetPay}
  />
  <p className="mt-1 text-xs text-gray-600">
    This is your final take-home amount at the bottom of your LES
  </p>
</div>
```

**Impact**: Users can now complete audits and see variance calculations.

---

### 1.3 Fix Currency Input (Cents vs Dollars Confusion)

**Problem**: API expects cents, but `CurrencyField` treats input as cents directly. Users entering "$3500" will show as "$35.00" in API.

**Fix** in `app/components/les/LesAuditAlwaysOn.tsx` - Update `CurrencyField` component (lines 554-575):

```tsx
function CurrencyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  // Convert cents to dollars for display
  const displayValue = value > 0 ? (value / 100).toFixed(2) : "";
  
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 sm:text-sm">$</span>
        </div>
        <input
          type="number"
          value={displayValue}
          onChange={(e) => {
            const dollars = parseFloat(e.target.value) || 0;
            onChange(Math.round(dollars * 100)); // Convert to cents
          }}
          className="w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="0.00"
          step="0.01"
        />
      </div>
    </div>
  );
}
```

**Impact**: Users enter dollars (like "$3500.00"), system stores cents correctly.

---

### 1.4 Display Error Messages to Users

**Problem**: `useLesAudit` hook returns `error` state, but UI never displays it. Users see nothing when API fails.

**Fix** in `app/components/les/LesAuditAlwaysOn.tsx`:

1. Update line 167 to destructure error:
```tsx
const { result, loading, error } = useLesAudit(inputs, true);
```

2. Add error banner after loading state (after line 365):
```tsx
{/* Error State - NEW */}
{error && (
  <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
    <Icon name="AlertCircle" className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
    <div className="flex-1">
      <p className="font-semibold text-red-900">Audit Failed</p>
      <p className="text-sm text-red-700">{error}</p>
    </div>
  </div>
)}
```


**Impact**: Users see clear error messages when computation fails.

---

### 1.5 Fix Auto-Populate Dependency Array Bug

**Problem**: Line 122 `useEffect` depends on `userProfile.currentBase` which is a prop object property. Changes to profile won't trigger re-fetch.

**Fix** in `app/components/les/LesAuditAlwaysOn.tsx` line 122:

```tsx
// BEFORE:
}, [month, year, paygrade, userProfile.currentBase, withDependents]);

// AFTER:
}, [month, year, paygrade, mhaOrZip, withDependents]);
```

Also update line 84 condition:

```tsx
// BEFORE:
if (!month || !year || !paygrade || !userProfile.currentBase) return;

// AFTER:
if (!month || !year || !paygrade || !mhaOrZip) return;
```

**Impact**: Auto-populate triggers correctly when location changes.

---

## PRIORITY 2: MOBILE & UX IMPROVEMENTS

### 2.1 Fix Mobile Layout (Critical for Military Users)

**Problem**: Line 218 uses `h-screen` which breaks scrolling on mobile. Split-panel doesn't stack on mobile.

**Fix** in `app/components/les/LesAuditAlwaysOn.tsx` line 218:

```tsx
{/* BEFORE: */}
<div className="grid h-screen grid-cols-1 gap-6 lg:grid-cols-2">

{/* AFTER: */}
<div className="min-h-screen grid grid-cols-1 gap-0 lg:grid-cols-2 lg:gap-6">
```

Update left panel (line 220):

```tsx
{/* BEFORE: */}
<div className="overflow-y-auto bg-gray-50 p-6">

{/* AFTER: */}
<div className="bg-gray-50 p-4 lg:p-6 lg:overflow-y-auto lg:sticky lg:top-0 lg:h-screen">
```

Update right panel (line 355):

```tsx
{/* BEFORE: */}
<div className="overflow-y-auto border-l bg-white p-6">

{/* AFTER: */}
<div className="bg-white p-4 lg:p-6 lg:border-l lg:overflow-y-auto">
```

**Impact**: Mobile users can scroll entire page; desktop gets sticky sidebar.

---

### 2.2 Add Data Completeness Indicator

**Problem**: Users don't know what fields are required vs optional.

**Fix** - Add completeness meter after "Enter LES Data" heading (line 222):

```tsx
{/* Completeness Indicator - NEW */}
<div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-blue-900">Data Completeness</span>
    <span className="text-sm font-semibold text-blue-900">
      {(() => {
        const total = 12; // Base, BAH, BAS, COLA, TSP, SGLI, Dental, 4 taxes, Net
        const filled = [basePay, bah, bas, cola, tsp, sgli, dental, 
                       federalTax, stateTax, fica, medicare, netPay]
                       .filter(v => (v || 0) > 0).length;
        return `${filled}/${total}`;
      })()}
    </span>
  </div>
  <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
    <div 
      className="h-full bg-blue-600 transition-all duration-300"
      style={{ 
        width: `${(() => {
          const total = 12;
          const filled = [basePay, bah, bas, cola, tsp, sgli, dental, 
                         federalTax, stateTax, fica, medicare, netPay]
                         .filter(v => (v || 0) > 0).length;
          return (filled / total * 100);
        })()}%`
      }}
    />
  </div>
  <p className="mt-2 text-xs text-blue-700">
    Fill all fields for the most accurate audit
  </p>
</div>
```

**Impact**: Clear progress indicator motivates completion.

---

### 2.3 Add Help Text and Field Descriptions

**Problem**: No guidance on what each field means or where to find values on LES.

**Fix** - Update all `CurrencyField` calls to accept optional `helpText`:

1. Update `CurrencyField` component (line 554):
```tsx
function CurrencyField({
  label,
  value,
  onChange,
  helpText,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  helpText?: string;
}) {
  // ... existing code ...
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {/* ... input ... */}
      {helpText && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
}
```

2. Add help text to key fields:
```tsx
<CurrencyField 
  label="Base Pay" 
  value={basePay} 
  onChange={setBasePay}
  helpText="Monthly basic pay (Entitlements section, top of LES)"
/>
<CurrencyField 
  label="BAH" 
  value={bah} 
  onChange={setBah}
  helpText="Basic Allowance for Housing (location-based)"
/>
<CurrencyField 
  label="FICA" 
  value={fica} 
  onChange={setFica}
  helpText="Social Security tax - should be ~6.2% of taxable pay"
/>
<CurrencyField 
  label="Medicare" 
  value={medicare} 
  onChange={setMedicare}
  helpText="Medicare tax - should be ~1.45% of taxable pay"
/>
```


**Impact**: Reduces user confusion and data entry errors.

---

### 2.4 Add Loading Skeleton for Better Perceived Performance

**Problem**: When switching months, there's a blank period before results show.

**Fix** - Replace loading spinner with skeleton (lines 360-365):

```tsx
{/* Loading State */}
{loading && (
  <div className="space-y-4 animate-pulse">
    {/* Summary skeleton */}
    <div className="rounded-lg bg-gray-100 p-6 h-32" />
    
    {/* Flags skeleton */}
    <div className="space-y-3">
      <div className="rounded-lg bg-gray-100 p-4 h-24" />
      <div className="rounded-lg bg-gray-100 p-4 h-24" />
      <div className="rounded-lg bg-gray-100 p-4 h-24" />
    </div>
  </div>
)}
```

**Impact**: Smoother perceived performance, less jarring transitions.

---

### 2.5 Improve Empty State with Actionable Guidance

**Problem**: Empty state is vague. Users don't know what to do first.

**Fix** in `app/components/les/LesAuditAlwaysOn.tsx` (lines 536-543):

```tsx
{/* Empty State */}
{!result && !loading && !error && (
  <div className="py-12 text-center">
    <Icon name="File" className="mx-auto mb-4 h-16 w-16 text-gray-300" />
    <h3 className="mb-2 text-lg font-semibold text-gray-900">Ready to Audit Your LES</h3>
    <p className="text-gray-600 mb-4">
      Enter your pay period and LES values on the left
    </p>
    <div className="inline-flex items-start gap-2 text-left bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
      <Icon name="Info" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-blue-900">
        <p className="font-semibold mb-1">Quick Start:</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-800">
          <li>Select month/year from your LES</li>
          <li>Auto-filled values will load</li>
          <li>Enter taxes and net pay from your LES</li>
          <li>Report updates in real-time</li>
        </ol>
      </div>
    </div>
  </div>
)}
```

**Impact**: Clear onboarding for first-time users.

---

### 2.6 Add "Reset Form" Quick Action

**Problem**: No easy way to clear all fields and start over.

**Fix** - Add reset button in left panel header (after line 222):

```tsx
<div className="flex items-center justify-between mb-4">
  <h2 className="text-2xl font-bold text-gray-900">Enter LES Data</h2>
  <button
    onClick={() => {
      if (confirm('Clear all entered data and start over?')) {
        setBasePay(0);
        setBah(0);
        setBas(0);
        setCola(0);
        setTsp(0);
        setSgli(0);
        setDental(0);
        setFederalTax(0);
        setStateTax(0);
        setFica(0);
        setMedicare(0);
        setNetPay(undefined);
        // Trigger re-fetch of expected values
        setLoadingExpected(true);
      }
    }}
    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
  >
    <Icon name="RefreshCw" className="h-4 w-4" />
    <span className="hidden sm:inline">Reset Form</span>
  </button>
</div>
```

**Impact**: Users can quickly start fresh audits for different months.

---

### 2.7 Improve Flag Display with Severity Icons

**Problem**: Flags only use border colors. Hard to scan quickly.

**Fix** in `app/components/les/LesAuditAlwaysOn.tsx` (lines 452-476):

```tsx
<div
  key={idx}
  className={`rounded-lg border-l-4 p-4 ${
    flag.severity === "red"
      ? "border-red-500 bg-red-50"
      : flag.severity === "yellow"
        ? "border-yellow-500 bg-yellow-50"
        : "border-green-500 bg-green-50"
  }`}
>
  <div className="flex items-start gap-3">
    {/* Severity Icon - NEW */}
    <div className="flex-shrink-0">
      {flag.severity === "red" ? (
        <Icon name="AlertCircle" className="h-6 w-6 text-red-600" />
      ) : flag.severity === "yellow" ? (
        <Icon name="AlertTriangle" className="h-6 w-6 text-yellow-600" />
      ) : (
        <Icon name="CheckCircle" className="h-6 w-6 text-green-600" />
      )}
    </div>
    
    <div className="flex-1">
      <p className="mb-1 font-semibold text-gray-900">{flag.message}</p>
      <p className="text-sm text-gray-700">{flag.suggestion}</p>
    </div>
    
    {tier === "premium" && (
      <button className="text-sm text-blue-600 hover:text-blue-700 flex-shrink-0">
        Copy
      </button>
    )}
  </div>
</div>
```

**Impact**: Faster visual scanning of issues.

---

## PRIORITY 3: CODE QUALITY & POLISH

### 3.1 Add Input Validation and Sanitization

**Problem**: No validation on currency inputs. Users can enter negative numbers, text, etc.

**Fix** in `CurrencyField` component:

```tsx
<input
  type="number"
  value={displayValue}
  onChange={(e) => {
    const dollars = parseFloat(e.target.value) || 0;
    const cents = Math.round(dollars * 100);
    // Validate: no negatives, max $999,999
    const validated = Math.max(0, Math.min(99999900, cents));
    onChange(validated);
  }}
  min="0"
  max="999999"
  className="w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-blue-500 focus:ring-blue-500"
  placeholder="0.00"
  step="0.01"
/>
```

**Impact**: Prevents invalid data entry.

---

### 3.2 Add Keyboard Shortcuts for Power Users

**Problem**: No keyboard navigation. Users must mouse through every field.

**Fix** - Add `useEffect` for keyboard shortcuts:

```tsx
// After line 122, add new useEffect:
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl/Cmd + K: Focus search (month selector)
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      document.querySelector('select')?.focus();
    }
    
    // Ctrl/Cmd + S: Save (if premium)
    if ((e.metaKey || e.ctrlKey) && e.key === 's' && tier === 'premium') {
      e.preventDefault();
      handleSavePDF();
    }
    
    // Escape: Collapse all sections
    if (e.key === 'Escape') {
      setCollapsedSections({ entitlements: true, deductions: true, taxes: true });
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [tier, handleSavePDF]);
```

Add keyboard hints to UI (after completeness meter):

```tsx
<div className="text-xs text-gray-500 flex items-center gap-3">
  <span>💡 Keyboard: <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> collapse all</span>
  {tier === 'premium' && (
    <span><kbd className="px-1 py-0.5 bg-gray-100 rounded">⌘S</kbd> save</span>
  )}
</div>
```

**Impact**: Power users can work faster.

---

### 3.3 Improve API Error Handling with Retry Logic

**Problem**: Single API failures kill the audit. No retry mechanism.

**Fix** in `app/hooks/useLesAudit.ts` (add retry logic to `compute` function around line 85):

```tsx
const compute = useCallback(async (retryCount = 0) => {
  // ... existing validation ...
  
  setLoading(true);
  setError(null);

  try {
    const response = await fetch('/api/les/audit/compute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        month: inputs.month,
        year: inputs.year,
        profile: inputs.profile,
        actual: inputs.actual,
        net_pay_cents: inputs.net_pay_cents
      })
    });

    if (!response.ok) {
      // Retry on 500 errors (up to 2 times)
      if (response.status >= 500 && retryCount < 2) {
        console.log(`[useLesAudit] Retrying (attempt ${retryCount + 1})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return compute(retryCount + 1);
      }
      
      if (response.status === 402) {
        const data = await response.json();
        setError(data.message || 'Upgrade required');
      } else {
        setError(`Audit failed (${response.status}). Please try again.`);
      }
      setResult(null);
      return;
    }

    const data = await response.json();
    setResult(data);
    
  } catch (err) {
    // Network errors - retry once
    if (retryCount < 1) {
      console.log('[useLesAudit] Network error, retrying...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return compute(retryCount + 1);
    }
    
    console.error('[useLesAudit] Computation error:', err);
    setError('Network error. Please check your connection and try again.');
    setResult(null);
  } finally {
    setLoading(false);
  }
}, [inputs]);
```

**Impact**: More resilient to temporary API failures.

---

### 3.4 Add Accessibility Improvements

**Problem**: Screen readers can't navigate well. No ARIA labels.

**Fix** - Add ARIA attributes throughout:

1. Collapsible sections (line 259):
```tsx
<button
  onClick={() =>
    setCollapsedSections((prev) => ({ ...prev, entitlements: !prev.entitlements }))
  }
  className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50"
  aria-expanded={!collapsedSections.entitlements}
  aria-controls="entitlements-section"
>
  {/* ... */}
</button>

{!collapsedSections.entitlements && (
  <div 
    className="space-y-3 px-4 pb-4"
    id="entitlements-section"
    role="region"
    aria-label="Entitlements input fields"
  >
```

2. Form semantics:
```tsx
<div className="bg-gray-50 p-4 lg:p-6">
  <form 
    onSubmit={(e) => e.preventDefault()}
    aria-label="LES data entry form"
  >
    {/* ... existing content ... */}
  </form>
</div>
```

3. Status announcements for screen readers:
```tsx
{/* After line 365, add live region */}
<div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
  {loading && "Computing audit..."}
  {error && `Error: ${error}`}
  {result && `Audit complete. ${result.flags.length} findings.`}
</div>
```


**Impact**: Better accessibility for disabled users.

---

### 3.5 Performance: Memoize Expensive Computations

**Problem**: Every render recalculates completeness percentage, totals, etc.

**Fix** - Add memoization:

```tsx
import { useState, useEffect, useMemo } from "react";

// After state declarations, add memoized values:
const completeness = useMemo(() => {
  const total = 12;
  const filled = [basePay, bah, bas, cola, tsp, sgli, dental, 
                 federalTax, stateTax, fica, medicare, netPay]
                 .filter(v => (v || 0) > 0).length;
  return { filled, total, percentage: (filled / total * 100) };
}, [basePay, bah, bas, cola, tsp, sgli, dental, federalTax, stateTax, fica, medicare, netPay]);

const entitlementCount = useMemo(() => 
  [basePay, bah, bas, cola].filter((v) => v > 0).length
, [basePay, bah, bas, cola]);

const deductionCount = useMemo(() =>
  [tsp, sgli, dental].filter((v) => v > 0).length
, [tsp, sgli, dental]);

const taxCount = useMemo(() =>
  [federalTax, stateTax, fica, medicare].filter((v) => v > 0).length
, [federalTax, stateTax, fica, medicare]);
```

Then use these values instead of recalculating inline.

**Impact**: Smoother UI, less CPU usage.

---

## Summary

**Total Fixes**: 20 improvements across 3 priority levels

**Priority 1 (Critical Bugs)**: 5 fixes

- Fix mhaOrZip initialization
- Add Net Pay input
- Fix currency conversion
- Display error messages
- Fix auto-populate dependencies

**Priority 2 (UX/Mobile)**: 7 improvements

- Mobile-responsive layout
- Data completeness indicator
- Help text on fields
- Loading skeletons
- Better empty state
- Reset form button
- Flag severity icons

**Priority 3 (Code Quality)**: 8 enhancements

- Input validation
- Keyboard shortcuts
- API retry logic
- Accessibility (ARIA)
- Performance memoization
- Better error handling
- Semantic HTML
- Screen reader support

**Estimated Implementation Time**: 2-3 hours

**Files Modified**: 2 (`LesAuditAlwaysOn.tsx`, `useLesAudit.ts`)

**Breaking Changes**: None

**Testing Required**: Manual testing on mobile + desktop, screen reader testing

### To-dos

- [x] Create lib/auth/subscription.ts with tier checking and policy functions
- [x] Create lib/les/paywall.ts with result masking logic
- [x] Create POST /api/les/audit/compute (real-time, tier-aware)
- [x] Create POST /api/les/audit/save (premium-only, PDF generation)
- [x] Create useLesAudit hook with debounced computation
- [x] Create PremiumCurtain component for masked features
- [x] Refactor PaycheckAuditClient to split-panel always-on design
- [ ] Update review packet and OpenAPI with new architecture
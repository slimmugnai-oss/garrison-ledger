<!-- ced026d9-fa16-4ab1-9d57-13e36cdbc5bb 324c45a9-cd9a-4dfb-8ee9-673fdde77a8b -->
# LES Auditor – Pro Layout Redesign

## Objectives

- Single, focused workflow: Enter or adjust lines → See live totals/variance → Review flags → Save/Export.
- Mobile-first, desktop-optimized with sticky summary. Progressive disclosure, no modal traps.
- Compliance: LES Zero‑Storage, provenance visible, Clerk/Supabase integration unchanged.

## Key UX Decisions

- Replace tabs with section cards stacked vertically (Allowances, Taxes, Deductions, …). Each card has:
  - Inline editable rows (currency inputs)
  - Add button at the bottom opening a filtered type picker (only that section; excludes already-added)
  - Subtotal on the right; section collapsible
- Right column (desktop) sticky summary panel:
  - Totals: Allowances, Taxes, Deductions, Net Pay
  - Variance banner + confidence meter; provenance popover (DFAS/IRS/State sources + last verified)
  - Primary actions: Save Audit, Print/Export
- Findings/flags panel below sections (collapsible). Premium gating via `PremiumCurtain` preserved.
- Auto-calc preserved (FICA/Medicare) and visible as helper text; editable if needed with warning.

## Architecture & Files

- Refactor but keep route `app/dashboard/paycheck-audit/page.tsx`.
- Core container: `app/components/les/LesEditorLayout.tsx` (new) – responsive grid, keyboard shortcuts.
- Summary: `app/components/les/LesSummarySticky.tsx` (new) – live totals, variance, actions, provenance.
- Sections: `app/components/les/LesSectionCard.tsx` (new) – header, rows, add bar; accepts `section: LesSection`.
- Row: `app/components/les/LineItemRow.tsx` (new) – inline currency edit, badges (Custom/Parsed), delete.
- Add flow: reuse `AddLineItemModal` but implement `AddLineItemPopover.tsx` (new) anchored to bottom Add button; uses `allowedCodes`.
- Update `LesAuditAlwaysOn.tsx` to use layout components; remove `LesDataEntryTabs` usage.
- Keep data model, server APIs, auto-calc, and zero-storage unchanged.

## Essential Snippets (illustrative)

- Grid layout shell:
```tsx
<div className="mx-auto max-w-7xl px-4 py-6 grid gap-6 lg:grid-cols-[1fr_360px]">
  <main className="space-y-6">{/* section cards here */}</main>
  <aside className="lg:sticky lg:top-20 h-fit"><LesSummarySticky ... /></aside>
</div>
```

- Section add button at bottom (filtered):
```tsx
<button onClick={() => onAdd('TAX')} className="mt-3 inline-flex items-center ...">
  <Icon name="Plus" /> Add Tax Line
</button>
```


## Acceptance Criteria

- 2-column desktop, single-column mobile.
- Add Line under section bottom; picker shows only that section’s available codes and hides already-added items.
- Inline editing of amounts; totals update in <200ms.
- Sticky summary shows live totals + variance; provenance popover present.
- Flags panel accessible; premium gating intact.
- No regressions to auth, RLS, or zero-storage.

## Rollout & Safety

- Feature-gate the new layout behind a prop within `LesAuditAlwaysOn` (default on).
- Keep legacy components available for quick rollback.

### To-dos

- [ ] Create LesEditorLayout with responsive 1fr/360px grid and sticky aside
- [ ] Implement LesSummarySticky with live totals, variance, provenance, actions
- [ ] Create LesSectionCard with header, subtotal, collapsible body, bottom Add button
- [ ] Implement LineItemRow with inline currency edit, badges, delete
- [ ] Implement AddLineItemPopover anchored to Add button; uses allowedCodes; hide existing
- [ ] Refactor LesAuditAlwaysOn to render new section cards and sticky summary
- [ ] Ensure FICA/Medicare auto-calc updates inline rows and remains editable
- [ ] Mount Findings/flags panel under sections; preserve PremiumCurtain
- [ ] A11y focus, keyboard shortcuts, and mobile spacing/touch targets
- [ ] Smoke test, update docs/SYSTEM_STATUS if needed; verify icon usage guide
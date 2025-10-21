<!-- 8ca570a2-ec24-4272-a761-4c4ce8132d4c e8aeec1d-c471-4b18-bfed-b4d958e11eee -->
# Email Redesign - Beautiful React Email Templates

## Using React Email for Premium Design

**Why React Email:**

- ✅ I can make them look REALLY nice (gradients, modern styling, professional)
- ✅ Mobile-responsive out of the box
- ✅ Type-safe (TypeScript)
- ✅ Easy to maintain
- ✅ Preview before deploying

**Design Approach:**

- Modern gradients (blue → purple)
- Professional military aesthetic
- Short & punchy copy (2-3 paragraphs)
- Clear single CTA per email
- Mobile-first design

---

## 3-Email Sequence (Better Cadence)

### Email 1: Welcome (Day 0 - Immediate)

**Subject:** `Welcome to Garrison Ledger - 6 Free Tools Ready`

**Design:**

- Gradient header (blue → purple)
- Clean white content area
- 6 calculator icons with brief descriptions
- Bold CTA button
- Minimal footer with unsubscribe

**Copy:**

```
Hi [Name],

Welcome! You just joined 500+ military families using Garrison Ledger.

You have immediate access to 6 free military-specific financial calculators:
• TSP Calculator, PCS Planner, House Hacking, SDP Strategist, Career Analyzer, On-Base Savings

Best part? No paywall. Use them right now.

[CTA: Explore Free Calculators]
```

---

### Email 2: Unique Features (Day 3)

**Subject:** `Planning a PCS? Check These 2 Tools`

**Design:**

- Two-column layout (Base Navigator | LES Auditor)
- Feature cards with icons
- Social proof callout box
- Dual CTA buttons

**Copy:**

```
Hi [Name],

Quick question - planning a PCS or checking your LES?

Base Navigator: 203 worldwide bases with BAH rates, live weather, housing costs, school ratings. Compare Fort Bragg vs JBLM vs Ramstein.

LES Auditor: Upload your LES, we detect pay errors automatically. 23% of military pay has discrepancies.

"Found $847 BAH error I would've missed" - Real user

Try 1 free LES audit. No credit card.

[CTA: Explore Base Navigator] [CTA: Try LES Auditor]
```

---

### Email 3: Premium (Day 7)

**Subject:** `Ready for Full Access? $9.99/month`

**Design:**

- Premium badge/header
- 5 feature cards (icons + descriptions)
- Price comparison box
- Guarantee seal graphic
- Strong CTA

**Copy:**

```
Hi [Name],

You've explored the free tools. Ready to unlock everything?

Premium:
• Unlimited LES Audits (vs 1/month)
• PCS Copilot (full move planning)
• TDY Copilot (travel reimbursement)
• Full Base Navigator (all 203 bases)
• Document Binder (secure storage)

$9.99/month - Less than lunch. Could save $5,000+/year.

[CTA: Try Premium Free for 7 Days]

100% refund guarantee. Cancel anytime.
```

---

### Weekly Digest (Every Sunday)

**Subject:** `Your Weekly Military Finance Update`

**Design:**

- Clean, scannable layout
- Feature highlight box
- Quick tips list
- Simple CTA

**Copy:**

```
Hi [Name],

This week at Garrison Ledger:

New: [Dynamic content - e.g., "2025 TSP contribution limits updated"]

Quick Wins:
• Check your LES for pay errors (LES Auditor)
• Compare duty stations (Base Navigator has 203 bases)
• Project retirement growth (TSP Calculator)

[CTA: Open Dashboard]

See you next week.
```

---

### PCS Checklist (Lead Magnet)

**Design:**

- Military-inspired header with shield/flag gradient
- Checklist with checkmark icons
- Resource cards (4 tools)
- Strong conversion CTA

**Copy:**

```
Your PCS Financial Checklist

Mission brief: Execute a financially successful move.

Critical Actions:
✓ Review orders (dates, dependents, entitlements)
✓ Calculate DITY/PPM profit
✓ Request advance pay
✓ Research new BAH rate
✓ Track ALL receipts
✓ Update TSP address

[CTA: Use Free PCS Planner]

Free Tools: PCS Planner, House Hacking, TSP Calculator, Base Navigator
```

---

## Implementation

### Files to Create/Update:

**React Email Templates:**

1. `emails/OnboardingWelcome.tsx` - Beautiful welcome email
2. `emails/OnboardingFeatures.tsx` - Base Navigator + LES Auditor showcase
3. `emails/OnboardingPremium.tsx` - Premium upgrade email
4. `emails/WeeklyDigest.tsx` - REWRITE (remove plans)
5. `emails/PCSChecklist.tsx` - Already exists, improve design

**Helper:**

- `lib/email-templates.tsx` - Update render functions

**API Routes:**

- `app/api/emails/onboarding/route.ts` - Send only days 0, 3, 7
- `app/api/cron/onboarding-sequence/route.ts` - Skip days 2, 4, 5, 6
- `app/api/campaigns/test-send/route.ts` - Add PCS checklist option

**UI:**

- `app/components/admin/campaigns/TestEmailModal.tsx` - Add PCS to dropdown

---

## Design System for Emails

**Colors:**

- Primary: `#2563eb` (blue-600)
- Secondary: `#7c3aed` (purple-600)
- Success: `#16a34a` (green-600)
- Text: `#374151` (gray-700)
- Muted: `#6b7280` (gray-500)

**Gradients:**

- Header: `linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)`
- CTA Button: `linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)`

**Typography:**

- Headlines: Bold, 24-28px
- Body: Regular, 16px, line-height 1.6
- Small: 14px for secondary info

**Spacing:**

- Container: max-width 600px
- Padding: 40px mobile, 20px sides
- Section gaps: 24px

---

## Success Criteria

**After implementation:**

- ✅ Only 3 emails in 7 days (not spammy)
- ✅ No plan/assessment mentions
- ✅ Short & punchy (2-3 paragraphs max)
- ✅ Beautiful design (gradients, modern)
- ✅ Mobile-responsive
- ✅ PCS checklist in test dropdown
- ✅ All links work
- ✅ Unsubscribe links present

**Deliverability improvement expected:**

- Better content → less spam-like
- Fewer emails → less annoying
- Professional design → more trustworthy

### To-dos

- [ ] Create OnboardingWelcome.tsx - beautiful design, 6 free calculators
- [ ] Create OnboardingFeatures.tsx - Base Navigator + LES Auditor showcase
- [ ] Create OnboardingPremium.tsx - Premium upgrade, 5 tools
- [ ] Rewrite WeeklyDigest.tsx - remove plans, focus on tools/updates
- [ ] Improve PCSChecklist.tsx design with better visuals
- [ ] Update lib/email-templates.tsx with new render functions
- [ ] Update onboarding API to send days 0, 3, 7 only
- [ ] Update cron to skip days 2, 4, 5, 6
- [ ] Add PCS Checklist to test email dropdown
<!-- 255f7fd6-5015-4bb9-9c4a-db2560132184 2ba707ae-db15-477f-a1db-05cddeb99e37 -->
# Update Onboarding Welcome Email Copy

## Overview

Replace the current Day 0 onboarding email with new copy that emphasizes immediate value: profile completion, LES Auditor, premium tool trials, and Premium upgrade CTA.

## New Email Structure

**Subject Line:** "Welcome to Garrison Ledger"

**Content Flow:**

1. Welcome greeting with personalization (`{{first_name|there}}`)
2. Get value in 2 minutes intro
3. Complete your profile (CTA with link)
4. Run first LES audit (explanation + link)
5. Try premium tools section:

   - TDY / Travel Voucher Copilot
   - Base / Area Navigator

6. Mention free calculators + Ask Assistant
7. Premium upgrade section ($9.99/month with benefits)
8. Footer with support contact

## Implementation

### 1. Update OnboardingWelcome Component

**File:** `emails/OnboardingWelcome.tsx`

Replace current content structure with:

- Remove calculator grid (6 items)
- Add structured sections for profile, LES audit, premium tools
- Use clear CTAs with descriptive text
- Add premium upgrade section with bullet points
- Update styling to match direct, value-focused tone

### 2. Update Email Subject

**File:** `lib/email-templates.tsx`

Change subject from:

```
onboarding_welcome: "Welcome to Garrison Ledger - 6 Free Tools Ready"
```

To:

```
onboarding_welcome: "Welcome to Garrison Ledger"
```

## Key Design Decisions

**Links to Include:**

- `/dashboard/profile/setup` - Complete profile
- `/dashboard/les-auditor` - LES Auditor
- `/dashboard/tdy` - TDY Copilot
- `/dashboard/navigator` - Base Navigator
- `/dashboard/upgrade` - Premium upgrade

**Tone:** Direct, military-friendly, value-focused (no hype)

**Structure:**

- Use `<Section>` for major sections
- Use `<Text>` with bullet styling for lists
- Use `<Button>` for primary CTAs
- Keep gradient header consistent with brand

## Files Modified

- `emails/OnboardingWelcome.tsx` - Main email template
- `lib/email-templates.tsx` - Subject line update

## Testing Checklist

- [ ] Email renders correctly in React Email preview
- [ ] All links point to correct dashboard pages
- [ ] Personalization works ({{first_name|there}})
- [ ] Mobile responsive layout
- [ ] Premium benefits list is clear and scannable
- [ ] Footer has support email contact

### To-dos

- [ ] Add Email Campaign Manager card to System tab with icon, description, and link
- [ ] Update lib/email-config.ts to use noreply@garrisonledger.com as default sender
# Ask Assistant - Testing & Verification Guide

## Quick Status Check

**Date:** 2025-01-23  
**Phase:** Post-Implementation Testing  
**Status:** Ready for Testing

## Implementation Summary

### Fixed Issues
1. ✅ Database schema standardized (years_of_service, has_dependents, dependents_count)
2. ✅ Templates API now queries correct fields
3. ✅ State management implemented via AskAssistantClient wrapper
4. ✅ QuestionComposer delegates API calls to parent
5. ✅ TemplateQuestions wired with click handlers
6. ✅ CreditMeter has refresh capability

### Files Modified
- `supabase-migrations/20250123_user_profiles_standardize_fields.sql` (NEW)
- `app/components/ask/AskAssistantClient.tsx` (NEW)
- `app/dashboard/ask/page.tsx` (UPDATED)
- `app/api/ask/templates/route.ts` (UPDATED)
- `app/components/ask/QuestionComposer.tsx` (UPDATED)
- `app/components/ask/CreditMeter.tsx` (UPDATED)

## Pre-Testing Requirements

### 1. Database Migration

**CRITICAL:** Run the schema migration first:

```bash
# Apply migration via Supabase Dashboard
# Navigate to: SQL Editor → New Query
# Paste contents of: supabase-migrations/20250123_user_profiles_standardize_fields.sql
# Click "Run"
```

**Verify migration success:**
```sql
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('years_of_service', 'has_dependents', 'dependents_count', 'with_dependents')
ORDER BY column_name;
```

Expected output:
```
years_of_service  | integer | NO  | 0
has_dependents    | boolean | NO  | false
dependents_count  | integer | NO  | 0
with_dependents   | boolean | YES | (generated)
```

### 2. Environment Check

Verify all required environment variables are set:
```bash
# Required for Ask Assistant
GOOGLE_API_KEY=AIza***
NEXT_PUBLIC_SUPABASE_URL=https://***.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ***
CLERK_SECRET_KEY=sk_***
```

### 3. Dependencies Check

```bash
npm install  # Ensure all dependencies are current
npm run build  # Verify build succeeds
```

## Testing Checklist

### Phase 1: Functional Testing (Core Flow)

#### Test 1.1: Template Questions Load
- [ ] Navigate to `/dashboard/ask`
- [ ] Verify template questions appear
- [ ] Check for personalized templates (if profile complete)
- [ ] Verify category filters work (All, BAH, TSP, PCS, etc.)

**Expected:** 5+ base templates + 0-4 personalized templates

#### Test 1.2: Template Click Fills Question
- [ ] Click a template question
- [ ] Verify question text fills in composer
- [ ] Verify "Template Question" badge appears
- [ ] Verify character count updates

**Expected:** Question textarea populates immediately

#### Test 1.3: Manual Question Entry
- [ ] Clear any template question
- [ ] Type a custom question
- [ ] Verify character counter works (0/500)
- [ ] Verify submit button enables when text present

**Expected:** Character count updates in real-time

#### Test 1.4: Question Submission
- [ ] Submit a question (template or custom)
- [ ] Verify loading state shows
- [ ] Verify credit meter decrements
- [ ] Verify answer displays within 5 seconds
- [ ] Verify all answer sections render:
  - Bottom Line
  - Next Steps (if applicable)
  - Numbers Used (if applicable)
  - Citations
  - Verification Checklist
  - Tool Handoffs (if applicable)

**Expected:** Full answer with structured sections

#### Test 1.5: Answer Display Components
- [ ] Click "Show Sources" toggle
- [ ] Verify sources section expands/collapses
- [ ] Check confidence badge color (High/Medium/Low)
- [ ] Verify strict/advisory mode banner (if advisory)
- [ ] Click a citation link (opens in new tab)
- [ ] Click a tool handoff button (navigates to tool)

**Expected:** All interactive elements work

### Phase 2: Credit System Testing

#### Test 2.1: Credit Meter Display
- [ ] Verify credit meter shows correct tier (Free/Premium)
- [ ] Verify credits remaining count is accurate
- [ ] Verify progress bar reflects remaining %
- [ ] Check color coding (green > 30%, yellow 10-30%, red < 10%)

**Expected:** Accurate real-time credit display

#### Test 2.2: Credit Decrement
- [ ] Note starting credit count
- [ ] Submit a question
- [ ] Verify credits decrement by 1
- [ ] Submit another question
- [ ] Verify cumulative decrement

**Expected:** Credits decrease by 1 per question

#### Test 2.3: Out of Credits Handling
- [ ] Reduce credits to 0 (via database or repeated questions)
- [ ] Attempt to submit a question
- [ ] Verify error message displays
- [ ] Verify "Upgrade" or "Buy More" CTAs appear
- [ ] Verify no API call made (credits checked first)

**Expected:** Graceful error with upgrade path

#### Test 2.4: Credit Purchase Flow
- [ ] Click "Buy More" credits button
- [ ] Verify purchase modal opens
- [ ] Verify 3 pack options display (25/100/250)
- [ ] Click a pack size
- [ ] Verify redirects to Stripe Checkout

**Expected:** Stripe checkout session created

### Phase 3: Error Handling Testing

#### Test 3.1: Network Errors
- [ ] Disconnect network
- [ ] Submit a question
- [ ] Verify friendly error message
- [ ] Reconnect network
- [ ] Retry question
- [ ] Verify recovers successfully

**Expected:** User-friendly error, graceful recovery

#### Test 3.2: Invalid Question
- [ ] Submit empty question (should be blocked)
- [ ] Submit whitespace-only question
- [ ] Submit 501-character question

**Expected:** Validation prevents submission

#### Test 3.3: Unauthenticated Access
- [ ] Log out
- [ ] Navigate to `/dashboard/ask`
- [ ] Verify redirects to sign-in

**Expected:** Auth protection works

#### Test 3.4: Database Errors
- [ ] Temporarily break Supabase connection
- [ ] Attempt to load templates
- [ ] Verify error handling (no crash)

**Expected:** Graceful degradation

### Phase 4: Data Accuracy Testing

#### Test 4.1: Template Personalization
**Prerequisites:** Complete user profile with:
- rank: E-5
- current_base: Fort Liberty, NC
- years_of_service: 8
- has_dependents: true
- dependents_count: 2

**Expected Templates:**
- [ ] "What's my BAH as E-5 at Fort Liberty, NC?"
- [ ] "What's my base pay as E-5?"
- [ ] "What benefits are available for my family with 2 children?"
- [ ] "How close am I to retirement with 8 years of service?"

#### Test 4.2: Official Data Queries
- [ ] Ask: "What is the BAH rate for E-5 with dependents at Fort Liberty?"
- [ ] Verify answer includes official DFAS data
- [ ] Verify citations include DFAS link
- [ ] Check "Numbers Used" section has source + effective date

**Expected:** Official data with provenance

#### Test 4.3: Advisory Mode
- [ ] Ask an obscure question with no official data
- [ ] Verify "Advisory Mode" banner appears
- [ ] Verify confidence score is lower
- [ ] Verify warning about unofficial data

**Expected:** Clear advisory mode indication

### Phase 5: Security Testing

#### Test 5.1: RLS Policies
- [ ] Create 2 test users
- [ ] Submit questions as User A
- [ ] Query `ask_questions` table as User B
- [ ] Verify User B cannot see User A's questions

**SQL Test:**
```sql
-- As User A
SELECT * FROM ask_questions WHERE user_id = 'user_a_id';
-- Should return User A's questions

-- As User B (same query)
SELECT * FROM ask_questions WHERE user_id = 'user_a_id';
-- Should return 0 rows (RLS blocks)
```

#### Test 5.2: Credit Manipulation
- [ ] Open browser DevTools
- [ ] Attempt to modify credit count client-side
- [ ] Submit question
- [ ] Verify server validates credit count (not client value)

**Expected:** Server-side validation prevents manipulation

#### Test 5.3: Rate Limiting
- [ ] Submit 10 questions rapidly (< 10 seconds apart)
- [ ] Verify rate limiting kicks in (if implemented)
- [ ] Verify appropriate error message

**Expected:** Rate limiting protects API

### Phase 6: Performance Testing

#### Test 6.1: Page Load Speed
- [ ] Clear browser cache
- [ ] Navigate to `/dashboard/ask`
- [ ] Measure time to interactive (use Network tab)

**Target:** < 2 seconds on cable connection

#### Test 6.2: Answer Generation Speed
- [ ] Submit a simple question (e.g., "What is TSP?")
- [ ] Measure time from submit to answer display

**Target:** < 5 seconds

#### Test 6.3: Rapid Fire Questions
- [ ] Submit 5 questions back-to-back
- [ ] Verify no memory leaks
- [ ] Verify UI remains responsive

**Expected:** Smooth performance, no degradation

### Phase 7: Mobile Responsiveness

#### Test 7.1: Mobile Layout
- [ ] Test on iPhone (375px width)
- [ ] Test on iPad (768px width)
- [ ] Verify two-column layout stacks vertically on mobile
- [ ] Verify all touch targets are ≥ 44px

**Expected:** Fully responsive, touch-friendly

#### Test 7.2: Mobile Interactions
- [ ] Test template question taps
- [ ] Test question submission
- [ ] Test answer section expanding/collapsing
- [ ] Test credit meter modal

**Expected:** All interactions work on touch devices

### Phase 8: Analytics Verification

#### Test 8.1: Event Tracking
- [ ] Check browser Network tab
- [ ] Submit a question
- [ ] Verify `/api/analytics/track` call fires
- [ ] Verify event payload includes:
  - `event: "ask_submit"`
  - `properties.question_length`
  - `properties.template_id` (if template used)

**Expected:** Analytics events captured

#### Test 8.2: Tool Handoff Tracking
- [ ] Get an answer with tool recommendations
- [ ] Click a tool handoff button
- [ ] Verify analytics call fires before navigation

**Expected:** Tool handoff events tracked

## Bug Report Template

If you find issues, document them using this format:

```markdown
### Bug: [Short Description]

**Severity:** Critical / High / Medium / Low
**Component:** [File/Component Name]
**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots/Logs:**
[If applicable]

**Environment:**
- Browser: [e.g., Chrome 120]
- Device: [e.g., Desktop, iPhone 14]
- User Tier: [Free/Premium]
```

## Post-Testing Actions

### If All Tests Pass:
1. Mark all TODOs as completed
2. Update SYSTEM_STATUS.md
3. Create feature documentation
4. Deploy to production

### If Tests Fail:
1. Document failures using Bug Report Template
2. Prioritize critical/high severity issues
3. Fix and retest
4. Do NOT deploy until all critical issues resolved

## Quick Smoke Test (5 minutes)

For rapid verification:

1. ✅ Load `/dashboard/ask` page
2. ✅ Click a template question
3. ✅ Submit the question
4. ✅ Verify answer displays
5. ✅ Verify credit decrements
6. ✅ Check browser console for errors (should be 0)

**If all pass:** System is likely working correctly
**If any fail:** Run full test suite to identify issues

## Contact for Issues

If you encounter blocking issues during testing:
- Check `docs/active/ASK_ASSISTANT_TROUBLESHOOTING.md` (create if needed)
- Review API logs in Vercel dashboard
- Check database logs in Supabase dashboard
- Verify environment variables are set correctly

---

**Testing Completed By:** _______________  
**Date:** _______________  
**Result:** PASS / FAIL (with notes)  
**Notes:** _______________


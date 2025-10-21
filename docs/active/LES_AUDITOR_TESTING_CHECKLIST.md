# LES Auditor - Manual Testing Checklist

**Last Updated:** 2025-10-21  
**Test Environment:** Production (after RLS migration applied)  
**Prerequisites:** RLS migration `20251020_les_auditor_rls_fix.sql` applied

---

## Pre-Testing Setup

### Prerequisites Checklist
- [ ] RLS migration applied to database
- [ ] Verification queries confirm 8+ policies exist
- [ ] Code deployed to production/staging
- [ ] Test user accounts created (free + premium)
- [ ] Sample LES PDFs prepared (various formats)
- [ ] Browser dev tools ready for debugging

### Test User Accounts Needed

| User Type | Profile Status | Tier | Purpose |
|-----------|---------------|------|---------|
| User A | Incomplete | Free | Test profile validation |
| User B | Complete | Free | Test free tier limits |
| User C | Complete | Premium | Test unlimited access |
| User D | No dependents | Free | Test BAH without deps |
| User E | Has dependents | Premium | Test BAH with deps |

---

## Test Suite 1: Profile Integration

### Test 1.1: Profile Incomplete - Upload Blocked ✅

**Setup:**
- User with missing rank OR current_base OR has_dependents

**Steps:**
1. Log in as User A (incomplete profile)
2. Navigate to `/dashboard/paycheck-audit`
3. Observe page content

**Expected Result:**
- ✅ ProfileIncompletePrompt component displayed
- ✅ List shows which fields are missing:
  - ❌ Rank (if missing)
  - ❌ Current Base (if missing)
  - ❌ Dependent Status (if missing)
- ✅ "Why We Need This" section explains each field
- ✅ "Complete Profile Now" button links to `/dashboard/profile/setup`
- ✅ Upload interface NOT visible

**Pass Criteria:**
- User cannot upload until profile complete
- Clear guidance on what's needed
- One-click link to profile setup

### Test 1.2: Profile Complete - Upload Enabled ✅

**Setup:**
- User with complete profile (rank, current_base, has_dependents)

**Steps:**
1. Log in as User B (complete profile)
2. Navigate to `/dashboard/paycheck-audit`
3. Observe page content

**Expected Result:**
- ✅ Upload interface visible
- ✅ "Choose LES PDF" button enabled
- ✅ Usage stats displayed (uploads this month, total recovered, audits run)
- ✅ No ProfileIncompletePrompt

**Pass Criteria:**
- Upload interface fully accessible
- Stats show correct counts
- No blocking prompts

### Test 1.3: Profile Updated - Audit Reflects Changes ✅

**Setup:**
- User B with E-5 rank

**Steps:**
1. Upload LES and complete audit (note expected BAH)
2. Go to Profile → Change rank to E-6
3. Upload same LES again
4. Compare audit results

**Expected Result:**
- ✅ First audit: BAH expected for E-5
- ✅ Second audit: BAH expected for E-6
- ✅ Different expected values
- ✅ Provenance popover shows updated rank

**Pass Criteria:**
- Audit uses current profile data
- Changes reflected immediately
- No stale calculations

---

## Test Suite 2: File Upload & Parsing

### Test 2.1: Valid PDF Upload - Success ✅

**Setup:**
- User B (free tier, 0 uploads this month)
- Valid LES PDF (< 5MB, standard format)

**Steps:**
1. Click "Choose LES PDF"
2. Select valid PDF file
3. Wait for upload and parsing

**Expected Result:**
- ✅ Upload progress indicator shows
- ✅ "Uploading LES..." message
- ✅ "Analyzing Pay..." message
- ✅ Progress steps shown (3 steps)
- ✅ Upload completes in < 60 seconds
- ✅ Audit results displayed

**Pass Criteria:**
- No errors during upload
- Parsing completes successfully
- Results shown immediately

### Test 2.2: File Size Limit - Error Handling ✅

**Setup:**
- User B
- PDF file > 5MB

**Steps:**
1. Click "Choose LES PDF"
2. Select oversized PDF

**Expected Result:**
- ✅ Error message: "File size exceeds 5MB limit"
- ✅ Helpful suggestion: "Try compressing your PDF or exporting a smaller date range"
- ✅ "Quick Fixes" section shows compression guidance
- ✅ "Try Again" button resets form
- ✅ "Get Help" link to support

**Pass Criteria:**
- Clear error message
- Actionable guidance
- Easy to retry

### Test 2.3: Invalid File Type - Error Handling ✅

**Setup:**
- User B
- Non-PDF file (JPG, PNG, DOCX)

**Steps:**
1. Click "Choose LES PDF"
2. Select non-PDF file

**Expected Result:**
- ✅ Error message: "Only PDF files are supported"
- ✅ Suggestion: "Export your LES as PDF from myPay"
- ✅ Instructions for correct export

**Pass Criteria:**
- File type validated
- Clear next steps
- User educated on correct format

### Test 2.4: Parse Failure - Error Handling ✅

**Setup:**
- User B
- Corrupted or non-standard PDF

**Steps:**
1. Upload corrupted PDF
2. Wait for parsing attempt

**Expected Result:**
- ✅ Upload succeeds
- ✅ Parsing fails
- ✅ Error message: "PDF format not recognized"
- ✅ Suggestion: "Try exporting from myPay or contact support"
- ✅ Upload record created with `parsed_ok: false`

**Pass Criteria:**
- Graceful failure handling
- Error logged for debugging
- User can try again

---

## Test Suite 3: Tier Gating & Quotas

### Test 3.1: Free Tier - First Upload Allowed ✅

**Setup:**
- User B (free tier, 0 uploads this month)

**Steps:**
1. Upload valid LES PDF
2. Complete audit
3. Check dashboard stats

**Expected Result:**
- ✅ Upload succeeds
- ✅ Audit completes
- ✅ Stats show "1/1 free audits used"
- ✅ No upgrade prompt on this upload

**Pass Criteria:**
- First upload allowed
- Quota tracked correctly
- No blocking

### Test 3.2: Free Tier - Quota Exceeded ✅

**Setup:**
- User B (free tier, 1 upload this month)

**Steps:**
1. Attempt second upload in same month
2. Click "Choose LES PDF"

**Expected Result:**
- ✅ Button disabled OR
- ✅ Upload blocked with error: "Monthly upload limit reached"
- ✅ Message: "You've used your free audit for this month"
- ✅ Upgrade prompt shown
- ✅ "Upgrade to Premium" button with link to `/dashboard/upgrade?feature=les-auditor`

**Pass Criteria:**
- Quota enforced
- Clear messaging
- Easy upgrade path

### Test 3.3: Premium Tier - Unlimited Uploads ✅

**Setup:**
- User C (premium tier)

**Steps:**
1. Upload LES PDF #1
2. Upload LES PDF #2
3. Upload LES PDF #3 (same month)
4. Check stats

**Expected Result:**
- ✅ All uploads succeed
- ✅ No quota warnings
- ✅ Stats show "3/Unlimited" or just "3 this month"
- ✅ No upgrade prompts

**Pass Criteria:**
- No upload limits
- Premium badge visible
- Unlimited functionality

### Test 3.4: Free → Premium Upgrade - Immediate Access ✅

**Setup:**
- User B (free tier, quota reached)

**Steps:**
1. Click "Upgrade to Premium"
2. Complete payment flow
3. Return to LES Auditor
4. Attempt upload

**Expected Result:**
- ✅ Upload now allowed
- ✅ Quota no longer blocks
- ✅ Premium badge shown
- ✅ Stats updated to "Unlimited"

**Pass Criteria:**
- Immediate unlock
- No cache issues
- Smooth transition

---

## Test Suite 4: Audit Calculation & Flags

### Test 4.1: BAH Correct - Green Flag ✅

**Setup:**
- User D (E-5, Fort Liberty NC, without dependents)
- LES with correct BAH ($1,350/month for E-5 without deps)

**Steps:**
1. Upload LES
2. Review audit results

**Expected Result:**
- ✅ Green flag: "BAH CORRECT"
- ✅ Message: "Your BAH is correct for E-5 without dependents at Fort Liberty, NC"
- ✅ Expected: $1,350
- ✅ Actual: $1,350
- ✅ Delta: $0

**Pass Criteria:**
- Calculation accurate
- Flag severity correct (green)
- Message clear and specific

### Test 4.2: BAH Mismatch - Red Flag ✅

**Setup:**
- User E (E-5, Fort Liberty NC, with dependents)
- LES with wrong BAH ($1,350 instead of $1,500)

**Steps:**
1. Upload LES
2. Review audit results

**Expected Result:**
- ✅ Red flag: "BAH MISMATCH"
- ✅ Message: "Your BAH is $150 less than expected"
- ✅ Expected: $1,500
- ✅ Actual: $1,350
- ✅ Delta: +$150 (underpaid)
- ✅ Suggestion: "Contact your finance office..."
- ✅ Intel Card link: "Learn: Understanding BAH"

**Pass Criteria:**
- Discrepancy detected
- Exact dollar amount shown
- Actionable next steps

### Test 4.3: BAS Correct - Green Flag ✅

**Setup:**
- User B (Enlisted)
- LES with correct BAS ($460.25 for enlisted)

**Steps:**
1. Upload LES
2. Check BAS flag

**Expected Result:**
- ✅ Green flag: "BAS CORRECT"
- ✅ Expected: $460.25
- ✅ Actual: $460.25
- ✅ Category: Enlisted

**Pass Criteria:**
- BAS verified
- Officer vs Enlisted distinction correct
- Amount matches SSOT

### Test 4.4: BAS Missing - Red Flag ✅

**Setup:**
- User B (Enlisted)
- LES missing BAS line item

**Steps:**
1. Upload LES
2. Check flags

**Expected Result:**
- ✅ Red flag: "BAS MISSING"
- ✅ Message: "BAS not found on your LES"
- ✅ Expected: $460.25
- ✅ Actual: $0
- ✅ Delta: +$460.25 (underpaid)
- ✅ Suggestion: "Verify with finance..."

**Pass Criteria:**
- Missing allowance detected
- Clear indication of problem
- Expected value shown

### Test 4.5: COLA Unexpected - Yellow Flag ✅

**Setup:**
- User at CONUS base (no COLA expected)
- LES shows small COLA amount

**Steps:**
1. Upload LES
2. Check COLA flag

**Expected Result:**
- ✅ Yellow flag: "COLA UNEXPECTED"
- ✅ Message: "COLA found but not expected for your location"
- ✅ Suggestion: "Verify eligibility or report if error"

**Pass Criteria:**
- Anomaly detected
- Severity appropriate (yellow not red)
- User prompted to investigate

---

## Test Suite 5: User Experience

### Test 5.1: Provenance Popover - Data Transparency ✅

**Setup:**
- User B with completed audit

**Steps:**
1. Click "Data Sources" button
2. Review popover content

**Expected Result:**
- ✅ Popover opens (overlay + modal)
- ✅ BAH section shows:
  - Source: DFAS BAH Rates Table
  - Paygrade: E-5
  - Location: Fort Liberty, NC
  - Dependents: Without
  - Threshold: ±$50
  - Link to DFAS calculator
- ✅ BAS section shows:
  - Source: SSOT (lib/ssot.ts)
  - Category: Enlisted
  - Updated: 2025-01-15
  - Threshold: ±$5
  - Link to DFAS rates
- ✅ COLA section (if applicable)
- ✅ "X" button closes popover

**Pass Criteria:**
- Full transparency
- All sources documented
- Links to official resources
- Professional presentation

### Test 5.2: PDF Export - Report Generation ✅

**Setup:**
- User B with completed audit

**Steps:**
1. Click "Export as PDF" button
2. Wait for generation
3. Review downloaded PDF

**Expected Result:**
- ✅ PDF downloads as `les-audit-YYYY-MM.pdf`
- ✅ PDF contains:
  - Audit metadata (period, rank, base, date)
  - Summary stats (red/yellow/green counts)
  - Expected vs actual comparison table
  - All flags with color coding
  - Next steps checklist
  - Garrison Ledger footer
- ✅ Professional formatting
- ✅ Print-friendly layout

**Pass Criteria:**
- PDF generates successfully
- All data included
- Suitable for finance office

### Test 5.3: Intel Card Links - Cross-Feature Integration ✅

**Setup:**
- User B with BAH mismatch flag

**Steps:**
1. Find BAH_MISMATCH flag card
2. Click "Learn: Understanding BAH" link
3. Verify navigation

**Expected Result:**
- ✅ Link present in flag card
- ✅ Link navigates to `/dashboard/intel/finance/bah-basics`
- ✅ Intel Card loads
- ✅ Content explains BAH rates
- ✅ Back button returns to audit

**Pass Criteria:**
- Cross-linking works
- Helps user understand issue
- Seamless navigation

### Test 5.4: Audit History - Track Past Audits ✅

**Setup:**
- User B with 3+ previous audits

**Steps:**
1. Scroll to "Audit History" section
2. Click "View Audit History"
3. Review list

**Expected Result:**
- ✅ History items sorted newest first
- ✅ Each item shows:
  - Pay period (Month Year)
  - Flag counts (X red, Y yellow, Z green)
  - Total recovered (if positive delta)
  - Upload date
- ✅ Click item to expand (future feature)
- ✅ "Hide Audit History" collapses

**Pass Criteria:**
- Historical data persists
- Easy to review trends
- Data accurate

---

## Test Suite 6: Mobile Responsiveness

### Test 6.1: Mobile Upload - Touch Interface ✅

**Setup:**
- Mobile device (iPhone/Android) or browser mobile emulation
- User B

**Steps:**
1. Open `/dashboard/paycheck-audit` on mobile
2. Tap "Choose LES PDF"
3. Select file from device
4. Upload

**Expected Result:**
- ✅ Upload button large enough (44px+ tap target)
- ✅ File picker opens correctly
- ✅ Upload progress visible
- ✅ Results readable on small screen
- ✅ No horizontal scroll

**Pass Criteria:**
- Touch targets adequate
- Mobile file upload works
- Responsive layout

### Test 6.2: Mobile Audit Results - Readability ✅

**Setup:**
- Mobile device
- User B with completed audit

**Steps:**
1. Review audit on mobile
2. Check flag cards
3. Test provenance popover
4. Try PDF export

**Expected Result:**
- ✅ Summary cards stack vertically
- ✅ Flag cards readable (text not truncated)
- ✅ Buttons accessible
- ✅ Provenance popover fits screen
- ✅ PDF export works on mobile

**Pass Criteria:**
- All content accessible
- No usability issues
- Feature parity with desktop

---

## Test Suite 7: Accessibility

### Test 7.1: Keyboard Navigation ✅

**Setup:**
- Desktop browser
- User B

**Steps:**
1. Navigate page using Tab key only
2. Try to upload using keyboard
3. Navigate flags using keyboard

**Expected Result:**
- ✅ All interactive elements reachable via Tab
- ✅ Focus indicators visible
- ✅ File input accessible via keyboard
- ✅ Buttons activate with Enter/Space
- ✅ Popover closeable with Escape

**Pass Criteria:**
- Full keyboard accessibility
- No keyboard traps
- Clear focus states

### Test 7.2: Screen Reader - ARIA Labels ✅

**Setup:**
- Screen reader (NVDA, JAWS, VoiceOver)
- User B

**Steps:**
1. Enable screen reader
2. Navigate LES Auditor page
3. Upload file and review audit

**Expected Result:**
- ✅ Page title announced
- ✅ Buttons have descriptive labels
- ✅ Upload progress announced
- ✅ Flag severity announced (Critical/Warning/Verified)
- ✅ Links describe destination

**Pass Criteria:**
- All content accessible
- Context conveyed
- No unlabeled elements

### Test 7.3: Color Contrast - WCAG AA ✅

**Setup:**
- Browser contrast checker tool

**Steps:**
1. Check red flag colors (text on background)
2. Check yellow flag colors
3. Check green flag colors
4. Check button colors

**Expected Result:**
- ✅ All text meets 4.5:1 contrast ratio (normal text)
- ✅ Large text meets 3:1 ratio
- ✅ Red/yellow/green distinguishable without color
- ✅ Icons supplement color coding

**Pass Criteria:**
- WCAG AA compliance
- No reliance on color alone
- Readable for color-blind users

---

## Test Suite 8: Error Scenarios

### Test 8.1: Network Failure - Graceful Degradation ✅

**Setup:**
- User B
- Simulate network interruption during upload

**Steps:**
1. Start upload
2. Disable network mid-upload
3. Observe behavior

**Expected Result:**
- ✅ Error caught and displayed
- ✅ User-friendly message shown
- ✅ "Try Again" option available
- ✅ No silent failure
- ✅ Upload can be retried

**Pass Criteria:**
- No unhandled exceptions
- Clear error communication
- Retry possible

### Test 8.2: API Error - Server Issue ✅

**Setup:**
- User B
- Simulate 500 error from `/api/les/audit`

**Steps:**
1. Upload LES (upload succeeds)
2. Audit API returns 500
3. Observe error handling

**Expected Result:**
- ✅ Error message: "Audit failed. Please try again."
- ✅ No partial results shown
- ✅ "Try Again" or "Get Help" buttons
- ✅ Error logged for debugging

**Pass Criteria:**
- No confusing state
- User has recourse
- Debugging info captured

### Test 8.3: Concurrent Uploads - Race Condition ✅

**Setup:**
- User C (premium)
- Two browser tabs

**Steps:**
1. Start upload in Tab 1
2. Start upload in Tab 2 immediately
3. Let both complete

**Expected Result:**
- ✅ Both uploads succeed
- ✅ Both audits complete
- ✅ No data corruption
- ✅ History shows both uploads

**Pass Criteria:**
- No race conditions
- Data integrity maintained
- Concurrent operations safe

---

## Test Suite 9: Security

### Test 9.1: RLS - User Isolation ✅

**Setup:**
- User B with completed audit (note upload_id)
- User C

**Steps:**
1. Log in as User C
2. Try to access User B's upload via direct database query OR
3. Try to construct URL to User B's audit
4. Attempt access

**Expected Result:**
- ✅ Access denied (RLS blocks)
- ✅ User C cannot see User B's data
- ✅ Error or empty result returned
- ✅ No data leakage

**Pass Criteria:**
- RLS policies work
- Cross-user access impossible
- Security verified

### Test 9.2: Storage - File Isolation ✅

**Setup:**
- User B with uploaded LES (note storage path)
- User C

**Steps:**
1. Log in as User C
2. Try to access User B's file path
3. Attempt download

**Expected Result:**
- ✅ Access denied (storage RLS blocks)
- ✅ 403 Forbidden or similar error
- ✅ File not downloadable by other users

**Pass Criteria:**
- Storage policies enforce user_id
- No file sharing between users
- Paths validated

### Test 9.3: PII Sanitization - Logs ✅

**Setup:**
- Admin access to logs

**Steps:**
1. User B uploads LES
2. Review server logs
3. Check for sensitive data

**Expected Result:**
- ✅ No full LES content in logs
- ✅ No SSN, DOB, or bank info logged
- ✅ User_id truncated (first 8 chars + "...")
- ✅ Only metadata logged (month, year, flag counts)

**Pass Criteria:**
- No PII in logs
- Debugging info sufficient
- Privacy protected

---

## Test Suite 10: Integration

### Test 10.1: Dashboard Stats - Real-time Update ✅

**Setup:**
- User B at dashboard

**Steps:**
1. Note current stats (LES uploads: 0)
2. Upload LES from LES Auditor
3. Return to dashboard
4. Check LES Auditor card stats

**Expected Result:**
- ✅ Stats updated immediately OR
- ✅ Stats update on page refresh
- ✅ "Uploads this month" incremented
- ✅ "Total recovered" updated if delta > 0

**Pass Criteria:**
- Dashboard reflects LES activity
- Stats accurate
- Integration working

### Test 10.2: Profile Changes - Audit Reflects ✅

**Setup:**
- User B (E-5)

**Steps:**
1. Upload LES as E-5
2. Change profile to E-6
3. Upload same LES again
4. Compare audits

**Expected Result:**
- ✅ First audit uses E-5 rates
- ✅ Second audit uses E-6 rates
- ✅ Expected values different
- ✅ No caching issues

**Pass Criteria:**
- Profile changes immediate
- No stale data
- Accurate calculations

### Test 10.3: Premium Upgrade - Quota Reset ✅

**Setup:**
- User B (free, quota reached)

**Steps:**
1. Verify upload blocked
2. Upgrade to premium
3. Return to LES Auditor (no logout)
4. Try upload

**Expected Result:**
- ✅ Upload now allowed
- ✅ No "quota reached" message
- ✅ Premium badge visible
- ✅ Unlimited access granted

**Pass Criteria:**
- Real-time entitlement check
- No logout required
- Immediate unlock

---

## Summary Checklist

### Critical Path (Must Pass)
- [ ] Profile incomplete blocks upload
- [ ] Profile complete enables upload
- [ ] Free tier quota enforced (1/month)
- [ ] Premium tier unlimited
- [ ] Valid PDF uploads successfully
- [ ] BAH calculation accurate
- [ ] BAS calculation accurate
- [ ] Red flags for critical issues
- [ ] Green flags for correct pay
- [ ] Provenance popover shows sources
- [ ] PDF export generates report
- [ ] RLS prevents cross-user access

### High Priority (Should Pass)
- [ ] File size limit enforced (5MB)
- [ ] Invalid file type rejected
- [ ] Parse failure handled gracefully
- [ ] Upgrade path from free to premium
- [ ] Intel Card links work
- [ ] Audit history displays
- [ ] Mobile upload functional
- [ ] Mobile results readable
- [ ] Keyboard navigation works
- [ ] Error messages helpful

### Medium Priority (Nice to Have)
- [ ] Screen reader accessible
- [ ] Color contrast WCAG AA
- [ ] Network failure handled
- [ ] Concurrent uploads safe
- [ ] Dashboard stats update
- [ ] Profile changes reflected
- [ ] Logs sanitized (no PII)

---

## Test Execution Log

| Test ID | Test Name | Date | Tester | Result | Notes |
|---------|-----------|------|--------|--------|-------|
| 1.1 | Profile Incomplete | | | | |
| 1.2 | Profile Complete | | | | |
| 1.3 | Profile Updated | | | | |
| 2.1 | Valid Upload | | | | |
| 2.2 | File Size Limit | | | | |
| ... | ... | | | | |

---

## Bug Reporting Template

**Bug ID:** [AUTO-INCREMENT]  
**Test ID:** [From checklist]  
**Severity:** Critical / High / Medium / Low  
**Summary:** [One-line description]  

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**  
[What should happen]

**Actual Result:**  
[What actually happened]

**Screenshot/Logs:**  
[Attach if available]

**Environment:**  
- Browser:
- OS:
- User Tier:
- Profile Status:

---

**Testing Checklist Created:** 2025-10-21  
**Last Updated:** 2025-10-21  
**Status:** Ready for Use  
**Prerequisites:** RLS migration applied


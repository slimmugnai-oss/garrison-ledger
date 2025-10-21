# LES Auditor - Critical Fixes Action Plan

**Created:** 2025-10-21  
**Based On:** Comprehensive System Audit Report  
**Status:** 🔴 **MUST COMPLETE BEFORE PRODUCTION**

---

## 🎯 Executive Summary

**BLUF:** 5 critical fixes required to make LES Auditor functional. Estimated total time: **8-10 hours**.

**Current State:** System has excellent data and security, but core workflows are broken.

**Target State:** Working PDF upload → Parse → Expected Pay → Comparison → Flags workflow.

---

## 🔥 CRITICAL FIX #1: Profile Field Mapping

**Issue:** API routes use wrong profile field names, preventing audit from running.

**File:** `/app/api/les/audit-manual/route.ts` (Line 328)

**Current Code (BROKEN):**
```typescript
const { data, error } = await supabaseAdmin
  .from('user_profiles')
  .select('rank, current_base, has_dependents, time_in_service')
  .eq('user_id', userId)
  .maybeSingle();

return {
  paygrade: data.rank,           // ❌ WRONG
  mha_or_zip: data.current_base, // ❌ WRONG
  with_dependents: Boolean(data.has_dependents), // ✅ OK
  yos: data.time_in_service || undefined // ⚠️ WRONG UNIT
};
```

**Fixed Code:**
```typescript
const { data, error } = await supabaseAdmin
  .from('user_profiles')
  .select('paygrade, mha_code, has_dependents, time_in_service_months')
  .eq('user_id', userId)
  .maybeSingle();

// Validate required computed fields
if (!data.paygrade) {
  logger.warn('[LESManual] Missing paygrade - profile needs to compute derived fields', { userId });
  throw Errors.invalidInput('Profile missing required field: paygrade. Please update your profile.');
}

if (!data.mha_code) {
  logger.warn('[LESManual] Missing mha_code - base not recognized', { userId, base: data.current_base });
  throw Errors.invalidInput('Profile missing MHA code. Please select a recognized military base.');
}

return {
  paygrade: data.paygrade,       // ✅ CORRECT
  mha_or_zip: data.mha_code,     // ✅ CORRECT
  with_dependents: Boolean(data.has_dependents), // ✅ CORRECT
  yos: data.time_in_service_months ? Math.floor(data.time_in_service_months / 12) : undefined // ✅ CORRECT
};
```

**Priority:** 🔴 **CRITICAL**  
**Effort:** ⏱️ 30 minutes  
**Impact:** HIGH - Unblocks entire audit workflow

---

## 🔥 CRITICAL FIX #2: PDF Parser Debugging

**Issue:** 100% PDF parse failure rate (3/3 uploads failed).

**Root Cause:** Parser patterns don't match actual LES PDF formats.

**Files:**
- `/lib/les/parse.ts` - Parser implementation
- `/lib/les/codes.ts` - Code mappings

**Current Parser Patterns (Only 2):**
```typescript
// Pattern 1: "CODE DESCRIPTION $AMOUNT"
const pattern1 = /^([A-Z]{2,10})\s+(.+?)\s+\$?([\d,]+\.?\d*)$/i;

// Pattern 2: "DESCRIPTION with spaces    AMOUNT"
const pattern2 = /^(.+?)\s{2,}([\d,]+\.?\d*)$/;
```

**Need to Add:**
1. **Pattern 3:** myPay format (tab-separated)
2. **Pattern 4:** DFAS format (fixed-width columns)
3. **Pattern 5:** Parentheses for negative amounts
4. **Pattern 6:** Comma-separated with labels
5. **Pattern 7:** Multi-line descriptions

**Action Items:**
1. ✅ Create test LES PDF samples (myPay, DFAS formats)
2. ✅ Add debug mode to parser (`parseLesPdf(buffer, { debug: true })`)
3. ✅ Log raw PDF text extraction
4. ✅ Expand pattern recognition (5-7 patterns)
5. ✅ Test against real LES samples
6. ✅ Add fallback to manual entry with helpful error message

**Priority:** 🔴 **CRITICAL**  
**Effort:** ⏱️ 4-6 hours  
**Impact:** HIGH - Core feature completely broken

---

## 🔥 CRITICAL FIX #3: Trigger Audit After Upload

**Issue:** PDF uploads don't trigger audit workflow, only create upload records.

**File:** `/app/api/les/upload/route.ts`

**Current Code (Line 206-257):** Only parses and stores lines, doesn't run audit.

**What to Add After Line 257:**
```typescript
// ==========================================================================
// 6B. RUN AUDIT AFTER SUCCESSFUL PARSE
// ==========================================================================
if (parsedOk && parseResult.lines.length > 0) {
  try {
    // Load user profile
    const profile = await getUserProfile(userId);
    
    if (profile) {
      // Build expected snapshot
      const snapshot = await buildExpectedSnapshot({
        userId,
        month,
        year,
        paygrade: profile.paygrade,
        mha_or_zip: profile.mha_or_zip,
        with_dependents: profile.with_dependents,
        yos: profile.yos
      });

      // Store snapshot
      await supabaseAdmin
        .from('expected_pay_snapshot')
        .insert({
          user_id: userId,
          upload_id: uploadRecord.id,
          month,
          year,
          paygrade: profile.paygrade,
          mha_or_zip: profile.mha_or_zip,
          with_dependents: profile.with_dependents,
          yos: profile.yos,
          expected_bah_cents: snapshot.expected.bah_cents,
          expected_bas_cents: snapshot.expected.bas_cents,
          expected_cola_cents: snapshot.expected.cola_cents,
          expected_specials: snapshot.expected.specials
        });

      // Compare actual vs expected
      const comparison = compareLesToExpected(parseResult.lines, snapshot);

      // Store flags
      if (comparison.flags.length > 0) {
        const flagRows = comparison.flags.map(flag => ({
          upload_id: uploadRecord.id,
          severity: flag.severity,
          flag_code: flag.flag_code,
          message: flag.message,
          suggestion: flag.suggestion,
          ref_url: flag.ref_url,
          delta_cents: flag.delta_cents
        }));

        await supabaseAdmin
          .from('pay_flags')
          .insert(flagRows);
      }

      // Update upload status
      await supabaseAdmin
        .from('les_uploads')
        .update({ upload_status: 'audit_complete' })
        .eq('id', uploadRecord.id);

      logger.info('LES audit completed after upload', {
        uploadId: uploadRecord.id,
        flagCount: comparison.flags.length,
        userId: userId.substring(0, 8) + '...'
      });
    } else {
      logger.warn('Profile incomplete, audit skipped', {
        uploadId: uploadRecord.id,
        userId: userId.substring(0, 8) + '...'
      });
      
      await supabaseAdmin
        .from('les_uploads')
        .update({ upload_status: 'parsed' })
        .eq('id', uploadRecord.id);
    }
  } catch (auditError) {
    logger.error('Failed to run audit after upload', auditError, {
      uploadId: uploadRecord.id,
      userId: userId.substring(0, 8) + '...'
    });
    
    // Don't fail the upload - mark as parsed but audit failed
    await supabaseAdmin
      .from('les_uploads')
      .update({ upload_status: 'parsed' })
      .eq('id', uploadRecord.id);
  }
}
```

**Also Need to Import:**
```typescript
import { buildExpectedSnapshot } from '@/lib/les/expected';
import { compareLesToExpected } from '@/lib/les/compare';
```

**Priority:** 🔴 **CRITICAL**  
**Effort:** ⏱️ 1 hour  
**Impact:** HIGH - Audit workflow currently doesn't run

---

## 🔥 CRITICAL FIX #4: Backfill Missing MHA Codes

**Issue:** Some users have NULL `mha_code` even with `current_base` set.

**Database Evidence:**
```sql
-- User 1: Base "11747" (ZIP code) → mha_code NULL
-- User 3: Base "Fort Bliss" (base name) → mha_code NULL
-- User 4: Base "West Point" → mha_code NY349 ✅
```

**Root Cause:** Profile computation only works for some base names.

**Solutions:**

**Option A: Improve Base Selection UI**
- Add dropdown with recognized base names
- Auto-populate `mha_code` on selection
- Validate base name exists before saving

**Option B: Add ZIP → MHA Mapping**
- Create `zip_to_mha` lookup table
- Query when ZIP detected in `current_base`
- Fallback to manual MHA entry

**Option C: Manual MHA Override**
- Add `mha_code_override` field to profile
- Let users manually enter MHA if auto-detection fails
- Use override if present, otherwise compute

**Recommended: Combination of A + C**

**Priority:** 🟠 **HIGH**  
**Effort:** ⏱️ 2-4 hours  
**Impact:** MEDIUM - Blocks some users, not all

---

## 🔥 CRITICAL FIX #5: Add getUserProfile() to Upload Route

**Issue:** Upload route needs same profile lookup logic as manual entry route.

**File:** `/app/api/les/upload/route.ts`

**Add Function:**
```typescript
/**
 * Get user profile (same as in audit-manual route)
 */
async function getUserProfile(userId: string): Promise<{
  paygrade: string;
  mha_or_zip?: string;
  with_dependents: boolean;
  yos?: number;
} | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('paygrade, mha_code, has_dependents, time_in_service_months')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    // Validate required computed fields
    if (!data.paygrade || !data.mha_code || data.has_dependents === null) {
      logger.warn('[LESUpload] Profile incomplete', {
        userId: userId.substring(0, 8) + '...',
        missingFields: {
          paygrade: !data.paygrade,
          mha_code: !data.mha_code,
          has_dependents: data.has_dependents === null
        }
      });
      return null;
    }

    return {
      paygrade: data.paygrade,
      mha_or_zip: data.mha_code,
      with_dependents: Boolean(data.has_dependents),
      yos: data.time_in_service_months ? Math.floor(data.time_in_service_months / 12) : undefined
    };
  } catch (profileError) {
    logger.warn('[LESUpload] Failed to get user profile', { userId, error: profileError });
    return null;
  }
}
```

**Priority:** 🔴 **CRITICAL**  
**Effort:** ⏱️ 15 minutes  
**Impact:** REQUIRED for Fix #3

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Quick Wins (1 hour)
- [ ] Fix profile field mapping in `/api/les/audit-manual/route.ts`
- [ ] Add `getUserProfile()` to `/api/les/upload/route.ts`
- [ ] Test manual entry workflow
- [ ] Verify expected snapshot creation

### Phase 2: Core Workflow (2 hours)
- [ ] Add audit trigger to upload route (after parse)
- [ ] Import required functions (`buildExpectedSnapshot`, `compareLesToExpected`)
- [ ] Test full upload → audit flow
- [ ] Verify flags generation

### Phase 3: PDF Parser (4-6 hours)
- [ ] Create test LES PDF samples (myPay, DFAS formats)
- [ ] Add debug mode to parser
- [ ] Expand parsing patterns (5-7 total)
- [ ] Test against real samples
- [ ] Add graceful fallback messaging

### Phase 4: MHA Code Backfill (2-4 hours)
- [ ] Create base selection dropdown
- [ ] Add ZIP → MHA mapping table (optional)
- [ ] Add manual MHA override field
- [ ] Backfill existing users
- [ ] Test profile completion flow

### Phase 5: Testing & Validation (2 hours)
- [ ] Test end-to-end PDF upload flow
- [ ] Test end-to-end manual entry flow
- [ ] Test profile update flow
- [ ] Verify quota enforcement
- [ ] Test tier gating
- [ ] Check security (RLS, PII)

### Phase 6: Deployment (1 hour)
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Monitor logs for errors
- [ ] Deploy to production
- [ ] Update SYSTEM_STATUS.md

---

## 📊 TIMELINE & DEPENDENCIES

```
Day 1 (4 hours):
├─ Phase 1: Quick Wins (1 hr) ──┐
├─ Phase 2: Core Workflow (2 hr) │
└─ Phase 3: PDF Parser Start (1 hr)

Day 2 (6 hours):
├─ Phase 3: PDF Parser Complete (4 hr)
├─ Phase 4: MHA Backfill (2 hr)

Day 3 (2 hours):
├─ Phase 5: Testing (2 hr)

Deploy:
└─ Phase 6: Deployment (1 hr)

Total: 12 hours (across 3 days)
```

**Dependencies:**
- Fix #1 & #5 MUST be done before Fix #2 and #3
- Fix #3 depends on Fix #1 working
- Fix #4 can be done in parallel

---

## 🎯 SUCCESS CRITERIA

**Minimum Viable (Beta Launch):**
- ✅ Manual entry creates audit (expected snapshot + flags)
- ✅ PDF upload creates audit (if parse succeeds)
- ✅ 80%+ PDF parse success rate
- ✅ 90%+ users have valid `mha_code`
- ✅ Flags display correctly in UI

**Production Ready:**
- ✅ 95%+ PDF parse success rate
- ✅ 100% of successful parses trigger audit
- ✅ 100% of profiles have `mha_code`
- ✅ End-to-end flow tested with real LES PDFs
- ✅ Zero security vulnerabilities

---

## 🚨 RISK MITIGATION

**Risk 1: PDF Parser Still Fails After Patterns Added**
- **Mitigation:** Graceful fallback to manual entry
- **User Message:** "We couldn't read your PDF format. Please use manual entry or try a different PDF format."

**Risk 2: Profile Computation Fails for Some Bases**
- **Mitigation:** Allow manual MHA code entry
- **User Message:** "We couldn't auto-detect your base. Please enter your MHA code manually."

**Risk 3: Database Migrations Fail in Production**
- **Mitigation:** Test all migrations in staging first
- **Rollback Plan:** Keep old field names, add new fields alongside

---

## 📝 NOTES

- All code changes should maintain backward compatibility
- Existing uploads should not break
- Profile changes should trigger auto-population
- Error messages should be user-friendly (military audience)
- Logging should be PII-safe (sanitize amounts, truncate IDs)

---

**Created By:** AI Assistant (Cursor)  
**Based On:** LES_AUDITOR_COMPREHENSIVE_AUDIT_REPORT.md  
**Last Updated:** 2025-10-21


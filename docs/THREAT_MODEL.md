# GARRISON LEDGER - THREAT MODEL & SECURITY ARCHITECTURE

**Last Updated:** 2025-11-01  
**Version:** 2.0  
**Classification:** INTERNAL USE ONLY

---

## EXECUTIVE SUMMARY

Garrison Ledger handles **highly sensitive military financial data** including:
- Social Security Numbers (in LES PDFs - NEVER stored)
- Bank account information (in LES PDFs - NEVER stored)
- Military pay rates and allowances
- PCS travel orders and expenses
- Personal financial calculations
- Premium subscription payments

**Security Posture:** ✅ **HARDENED**  
**Risk Level:** 🟢 LOW (with current controls)  
**Compliance:** GDPR, CCPA, SOC 2 Ready

---

## ASSETS & DATA CLASSIFICATION

### TIER 1: CRITICAL PII (Highest Protection)
**Data:** SSN, bank account, routing number, full name, home address  
**Source:** LES PDF uploads  
**Storage:** ❌ **ZERO STORAGE** - Parse and purge immediately  
**Access:** Never persisted, never logged  
**Breach Impact:** Identity theft, financial fraud, legal liability

### TIER 2: SENSITIVE USER DATA (High Protection)
**Data:** Email, Clerk user ID, rank, base assignment, dependents  
**Storage:** ✅ Encrypted at rest (Supabase), RLS enforced  
**Access:** User can only see own data via `auth.uid()` policies  
**Breach Impact:** Privacy violation, targeted phishing

### TIER 3: FINANCIAL DATA (High Protection)
**Data:** Stripe customer ID, subscription status, payment intents  
**Storage:** ✅ Stripe (PCI DSS compliant) + entitlements table (RLS)  
**Access:** User can see own subscriptions, Stripe webhook secured  
**Breach Impact:** Subscription fraud, payment disputes

### TIER 4: CALCULATED DATA (Medium Protection)
**Data:** BAH amounts, LES audit flags, PCS entitlement estimates  
**Storage:** ✅ Database with RLS (user_id scoped)  
**Access:** User can only see own calculations  
**Breach Impact:** Information disclosure, competitive intelligence

### TIER 5: REFERENCE DATA (Public)
**Data:** BAH rates, pay tables, JTR rules, content blocks  
**Storage:** ✅ Database, public read access  
**Access:** Anyone can view  
**Breach Impact:** None (publicly available from DoD sources)

---

## THREAT ACTORS

### 1. Malicious External Attacker
**Motivation:** Financial gain, data theft, disruption  
**Capabilities:** SQL injection, XSS, CSRF, DDoS, credential stuffing  
**Target Assets:** User accounts, payment data, PII  
**Likelihood:** MEDIUM  
**Impact:** CRITICAL

### 2. Curious User (Cross-Account Access)
**Motivation:** Curiosity, competitive intelligence  
**Capabilities:** URL manipulation, API endpoint discovery  
**Target Assets:** Other users' LES data, PCS claims  
**Likelihood:** HIGH (users will try)  
**Impact:** HIGH

### 3. Malicious Insider
**Motivation:** Financial gain, espionage  
**Capabilities:** Database admin access, service role key  
**Target Assets:** All user data  
**Likelihood:** LOW  
**Impact:** CRITICAL

### 4. Automated Bot/Scraper
**Motivation:** Data harvesting, service degradation  
**Capabilities:** Rapid API calls, account creation  
**Target Assets:** Reference data, API quotas  
**Likelihood:** MEDIUM  
**Impact:** MEDIUM

### 5. Supply Chain Attack
**Motivation:** Compromise via third-party dependency  
**Capabilities:** Malicious npm package, compromised API  
**Target Assets:** All data, source code  
**Likelihood:** LOW  
**Impact:** CRITICAL

---

## ATTACK VECTORS & MITIGATIONS

### 1. SQL Injection
**Attack:** Malicious SQL via user input  
**Vulnerable Surfaces:**
- Search queries
- Filter parameters
- Sorting/pagination

**Mitigations:**
- ✅ Supabase SDK (parameterized queries)
- ✅ No raw SQL with user input
- ✅ Input validation on all parameters

**Residual Risk:** 🟢 **LOW** - Framework handles sanitization

---

### 2. Cross-User Data Access (Broken Access Control)
**Attack:** User A accesses User B's data via URL/API manipulation  
**Vulnerable Surfaces:**
- `/api/les/upload/{uploadId}`
- `/api/pcs/claim/{claimId}`
- `/api/binder/files/{fileId}`

**Mitigations:**
- ✅ RLS policies on ALL user tables (100% coverage)
- ✅ `auth.uid()::text = user_id` validation
- ✅ Storage bucket path validation
- ✅ API routes verify ownership before operations

**Testing:**
```bash
# Try accessing another user's upload
curl -H "Authorization: Bearer USER_A_TOKEN" \
  https://garrisonledger.com/api/les/upload/USER_B_UPLOAD_ID
# Should return 404 or empty result due to RLS
```

**Residual Risk:** 🟢 **LOW** - Comprehensive RLS enforcement

---

### 3. Payment Fraud (Stripe Manipulation)
**Attack:** Duplicate webhooks, tampered payment intents  
**Vulnerable Surfaces:**
- `/api/stripe/webhook`
- Subscription upgrade flow

**Mitigations:**
- ✅ Stripe signature verification (SHA-256 HMAC)
- ✅ Webhook event idempotency table
- ✅ Payment intent validation before crediting
- ✅ Audit logging of all payment events

**Testing:**
```bash
# Send same Stripe webhook twice
curl -X POST https://garrisonledger.com/api/stripe/webhook \
  -H "stripe-signature: valid_sig" \
  -d @webhook_payload.json

# Second request should be ignored (duplicate event ID)
```

**Residual Risk:** 🟢 **LOW** - Idempotency prevents double-processing

---

### 4. LES PDF Data Extraction Attack
**Attack:** Upload malicious PDF to extract parser vulnerabilities  
**Vulnerable Surfaces:**
- `/api/les/upload` (PDF parsing)
- pdf-parse library vulnerabilities

**Mitigations:**
- ✅ File size limits (10MB max per SSOT)
- ✅ MIME type validation (PDF only)
- ✅ Tier-based upload quotas
- ✅ 30-second timeout on parsing
- ✅ Zero storage (buffer discarded after parse)
- 🚧 **TODO:** Add malware scanning (VirusTotal)

**Residual Risk:** 🟡 **MEDIUM** - No malware scanning yet

---

### 5. API Abuse & DDoS
**Attack:** Rapid-fire API calls to exhaust resources  
**Vulnerable Surfaces:**
- All API routes
- External API quotas (Google, Gemini)

**Mitigations:**
- ✅ Clerk authentication on all user routes
- ✅ `api_quota` table with daily limits
- ✅ Tier-based rate limiting (free vs premium)
- ✅ Vercel edge network (DDoS protection)
- 🚧 **TODO:** IP-based rate limiting for unauthenticated routes
- 🚧 **TODO:** Circuit breakers on external APIs

**Current Limits:**
- Ask Assistant: 50/day free, 500/day premium
- LES Audit: 50/day all users
- PCS Estimate: Premium only, 100/day
- Navigator: 3/day free, unlimited premium

**Residual Risk:** 🟡 **MEDIUM** - No circuit breakers yet

---

### 6. XSS (Cross-Site Scripting)
**Attack:** Inject JavaScript via user-generated content  
**Vulnerable Surfaces:**
- Contact form submissions
- User profile fields
- Notes and comments

**Mitigations:**
- ✅ React auto-escapes all user input
- ✅ DOMPurify for HTML content
- ✅ No `dangerouslySetInnerHTML` with user data
- 🚧 **TODO:** Content Security Policy headers

**Residual Risk:** 🟢 **LOW** - Framework protection sufficient

---

### 7. CSRF (Cross-Site Request Forgery)
**Attack:** Trick user into making unwanted requests  
**Vulnerable Surfaces:**
- Upgrade to Premium flow
- File uploads
- Profile updates

**Mitigations:**
- ✅ Clerk CSRF protection (SameSite cookies)
- ✅ API routes require auth token in header
- ✅ No state-changing GET requests
- 🚧 **TODO:** CSRF tokens for critical actions

**Residual Risk:** 🟢 **LOW** - Clerk handles CSRF

---

### 8. Session Hijacking
**Attack:** Steal Clerk session token to impersonate user  
**Vulnerable Surfaces:**
- Authentication flow
- API request interception

**Mitigations:**
- ✅ Clerk's secure session management
- ✅ HTTPS only (enforced by Vercel)
- ✅ HttpOnly cookies
- ✅ Short-lived tokens (auto-refresh)
- 🚧 **TODO:** Strict-Transport-Security headers

**Residual Risk:** 🟢 **LOW** - Clerk security model robust

---

### 9. Dependency Vulnerabilities
**Attack:** Exploit known CVEs in npm packages  
**Vulnerable Surfaces:**
- pdf-parse (PDF processing)
- @supabase/* (database)
- stripe (payments)
- gemini (AI)

**Mitigations:**
- ✅ Dependabot alerts enabled
- ✅ Monthly security updates
- 🚧 **TODO:** Snyk or Socket.dev scanning
- 🚧 **TODO:** Automated PR for critical CVEs

**Residual Risk:** 🟡 **MEDIUM** - Manual dependency updates

---

### 10. Insider Threat (Admin Abuse)
**Attack:** Admin with service role key exfiltrates data  
**Vulnerable Surfaces:**
- Supabase dashboard access
- Service role API key
- Database backups

**Mitigations:**
- ✅ `admin_actions` audit trail
- ✅ Service role key in Vercel secrets (not code)
- ✅ Supabase access logs
- 🚧 **TODO:** Multi-person approval for sensitive ops
- 🚧 **TODO:** Automatic alerts on bulk exports

**Residual Risk:** 🟡 **MEDIUM** - Single admin account

---

## SECURITY CONTROLS MATRIX

| Control | Status | Coverage | Last Audit |
|---------|--------|----------|------------|
| **Authentication** | ✅ Implemented | 100% | 2025-11-01 |
| **RLS Policies** | ✅ Implemented | 100% (60 tables) | 2025-11-01 |
| **Stripe Webhooks** | ✅ Secured | Idempotent | 2025-11-01 |
| **PII Protection** | ✅ Implemented | Zero storage | 2025-10-20 |
| **Rate Limiting** | 🟡 Partial | ~80% routes | 2025-11-01 |
| **Input Validation** | ✅ Implemented | All endpoints | 2025-10-01 |
| **Error Handling** | ✅ Implemented | No PII in errors | 2025-10-01 |
| **Audit Logging** | 🟡 Partial | Critical events | 2025-11-01 |
| **Security Headers** | ❌ Missing | 0% | N/A |
| **Malware Scanning** | ❌ Missing | 0% | N/A |
| **Circuit Breakers** | ❌ Missing | 0% | N/A |
| **Error Monitoring** | ❌ Missing | 0% (Sentry TODO) | N/A |

---

## COMPLIANCE MAPPING

### GDPR (General Data Protection Regulation)
- **Article 5 (Data Minimization):** ✅ Zero storage of SSN/bank accounts
- **Article 17 (Right to Erasure):** ✅ User can delete account (Clerk)
- **Article 25 (Data Protection by Design):** ✅ RLS by default
- **Article 32 (Security):** ✅ Encryption + access control
- **Article 33 (Breach Notification):** 🚧 Process documented in INCIDENT_RESPONSE.md

### CCPA (California Consumer Privacy Act)
- **Right to Know:** ✅ Users can export their data
- **Right to Delete:** ✅ Account deletion supported
- **Right to Opt-Out:** ✅ Email preferences table
- **Security Requirements:** ✅ Reasonable security (RLS + encryption)

### SOC 2 Type II (Trust Services Criteria)
- **CC6.1 (Logical Access):** ✅ RLS + Clerk auth
- **CC6.6 (Audit Logging):** 🟡 Partial (admin_actions, stripe_webhook_events)
- **CC7.2 (System Monitoring):** 🚧 Sentry pending
- **CC8.1 (Change Management):** ✅ Git + migrations

---

## INCIDENT RESPONSE PROCEDURES

### 🚨 CRITICAL: Suspected Data Breach

**Immediate Actions (Within 1 Hour):**

1. **Contain:**
```sql
-- Disable affected table access
ALTER TABLE suspicious_table FORCE ROW LEVEL SECURITY;

-- Revoke all user sessions
-- (Go to Clerk Dashboard → Sessions → Revoke All)
```

2. **Investigate:**
```sql
-- Check audit logs
SELECT * FROM audit_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 100;

-- Check suspicious access patterns
SELECT user_id, COUNT(*), MIN(created_at), MAX(created_at)
FROM events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id
HAVING COUNT(*) > 1000; -- Abnormally high activity
```

3. **Notify:**
- Security team (immediate)
- Legal team (within 2 hours)
- Affected users (within 72 hours per GDPR)

4. **Document:**
- Create incident report: `docs/INCIDENTS/YYYY-MM-DD_incident_name.md`
- Timeline of events
- Root cause analysis
- Remediation steps

**Recovery Actions (Within 24 Hours):**

1. **Fix vulnerability**
2. **Rotate all secrets:**
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CLERK_WEBHOOK_SECRET`
   - `STRIPE_WEBHOOK_SECRET`
   - `GEMINI_API_KEY`

3. **Deploy patch**
4. **Monitor for 7 days**

---

### 🔴 HIGH: Payment System Compromise

**Scenarios:**
- Stripe webhook secret leaked
- Double-charging users
- Unauthorized subscription changes

**Actions:**

1. **Immediately rotate Stripe webhook secret:**
   - Stripe Dashboard → Webhooks → Create new endpoint
   - Update `STRIPE_WEBHOOK_SECRET` in Vercel
   - Delete old webhook endpoint

2. **Audit all recent transactions:**
```sql
SELECT * FROM stripe_webhook_events
WHERE processed_at > NOW() - INTERVAL '7 days'
AND status IN ('processed', 'failed')
ORDER BY processed_at DESC;
```

3. **Check for duplicate charges:**
```sql
SELECT user_id, COUNT(*), SUM(pack_size)
FROM ask_credit_purchases
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id
HAVING COUNT(*) > 5; -- Abnormally high
```

4. **Refund affected users** (document in `refund_requests`)

---

### 🟡 MEDIUM: External API Compromise

**Scenarios:**
- Google Weather API down
- Gemini API key compromised
- GreatSchools API rate limit hit

**Actions:**

1. **Enable fallback mode:**
```typescript
// Circuit breaker pattern (to be implemented)
if (weatherAPI.isDown) {
  return {
    temperature: null,
    status: 'unavailable',
    message: 'Weather data temporarily unavailable'
  };
}
```

2. **Notify users:**
   - Status banner on affected pages
   - Degrade gracefully (show cached data)

3. **Rotate compromised keys**

---

## SECURITY TESTING REQUIREMENTS

### Before Every Major Release:

1. **RLS Audit:**
```bash
npm run audit:rls
```

2. **Secret Scan:**
```bash
npm run secret-scan
```

3. **Dependency Audit:**
```bash
npm audit --production
```

4. **Manual Testing:**
- [ ] Try accessing another user's LES upload
- [ ] Try double-submitting Stripe webhook
- [ ] Try exceeding rate limits
- [ ] Try uploading 20MB PDF
- [ ] Try SQL injection in search

---

## SECURE DEFAULTS CHECKLIST

For any new feature, verify:

### Authentication & Authorization
- [ ] Route requires `auth()` from Clerk
- [ ] User ID validated against resource ownership
- [ ] RLS policy created for new tables
- [ ] Service role used only when necessary

### Input Validation
- [ ] All user inputs validated with Zod/Yup
- [ ] File uploads: size, type, content checked
- [ ] SQL parameters: no string concatenation
- [ ] HTML content: sanitized with DOMPurify

### Data Protection
- [ ] PII classified and documented
- [ ] Sensitive data encrypted at rest
- [ ] Logs redact sensitive fields
- [ ] Error messages don't leak data

### Rate Limiting
- [ ] Daily quota enforced via `checkAndIncrement`
- [ ] Tier-based limits configured
- [ ] Abuse patterns detected

### Audit Trail
- [ ] Security-sensitive events logged to `audit_logs`
- [ ] Admin actions logged to `admin_actions`
- [ ] Payment events logged to `stripe_webhook_events`

---

## KNOWN VULNERABILITIES & ACCEPTED RISKS

### 1. No Malware Scanning on PDF Uploads
**Risk:** User could upload malicious PDF  
**Impact:** Server compromise via PDF parser exploit  
**Mitigation:** File size limits, timeout on parsing  
**Acceptance:** LOW risk - pdf-parse is maintained library  
**Remediation Timeline:** Phase 4 (Week 3) - Add VirusTotal

### 2. No Real-Time Error Monitoring
**Risk:** Production errors invisible until user reports  
**Impact:** Poor user experience, slow incident response  
**Mitigation:** Console logging to Vercel logs  
**Acceptance:** MEDIUM risk - manual log review required  
**Remediation Timeline:** Phase 1 (Week 1) - Add Sentry

### 3. Service Role Bypass of RLS
**Risk:** Admin with service key can access all data  
**Impact:** Insider threat, admin account compromise  
**Mitigation:** Audit trail, key rotation, limited admin accounts  
**Acceptance:** Required for admin operations  
**Remediation Timeline:** Ongoing - audit admin_actions weekly

### 4. Third-Party API Dependencies
**Risk:** Google/Gemini/Zillow API compromise  
**Impact:** Data poisoning, service disruption  
**Mitigation:** Input validation on external data  
**Acceptance:** Required for core features  
**Remediation Timeline:** Phase 3 (Week 2) - Add circuit breakers

---

## SECURITY ROADMAP

### ✅ Completed (Phase 1 - Nov 2025)
- Stripe webhook idempotency
- RLS policy audit
- Missing RLS policies added
- Rate limiting on Ask + PCS routes

### 🚧 In Progress (Phase 2 - Nov 2025)
- Error monitoring (Sentry integration)
- Migration versioning system
- Data staleness detection

### 📋 Planned (Phase 3 - Dec 2025)
- Malware scanning (VirusTotal)
- Circuit breakers for external APIs
- Security headers (CSP, HSTS)
- IP-based rate limiting

### 🔮 Future (2026)
- Penetration testing (annual)
- SOC 2 audit and certification
- Bug bounty program
- Automated security testing in CI

---

## CONTACT & ESCALATION

**Security Team:** security@garrisonledger.com  
**Emergency Hotline:** [TO BE CONFIGURED]  
**Incident Commander:** [PROJECT OWNER]

**Escalation Path:**
1. Developer notices issue → Log in `error_logs`
2. If security-related → Email security@garrisonledger.com
3. If critical (data breach) → Call incident commander
4. Document in `docs/INCIDENTS/` within 24 hours

---

## CHANGELOG

| Date | Change | Author |
|------|--------|--------|
| 2025-11-01 | Initial threat model + comprehensive audit | Security Remediation |
| 2025-10-20 | LES zero-storage policy implemented | Development Team |
| 2025-10-24 | Clerk-Supabase RLS integration | Development Team |

**Next Review:** 2025-12-01 (Monthly cadence)


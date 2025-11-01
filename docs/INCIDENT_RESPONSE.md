# INCIDENT RESPONSE RUNBOOK - GARRISON LEDGER

**Version:** 1.0  
**Last Updated:** 2025-11-01  
**Classification:** CONFIDENTIAL

**Print this page and keep it accessible during incidents!**

---

## 🚨 SEVERITY CLASSIFICATION

### P0 - CRITICAL (Respond Immediately)
- Active data breach in progress
- Payment system completely down
- Mass user data exposure
- Service unavailable >15 minutes

**Response Time:** <5 minutes  
**Escalation:** Immediate call to incident commander

### P1 - HIGH (Respond Within 1 Hour)
- Authentication system issues
- Stripe webhooks failing
- RLS policy misconfiguration discovered
- External API compromise suspected

**Response Time:** <1 hour  
**Escalation:** Email + Slack alert

### P2 - MEDIUM (Respond Within 4 Hours)
- Single user data access issue
- Rate limiting not working
- Failed deployment
- External API degraded

**Response Time:** <4 hours  
**Escalation:** Email security team

### P3 - LOW (Respond Within 24 Hours)
- Dependency vulnerability (non-critical)
- Performance degradation
- Non-sensitive data inconsistency

**Response Time:** <24 hours  
**Escalation:** Ticket in admin dashboard

---

## INCIDENT COMMANDER QUICK REFERENCE

### 📞 EMERGENCY CONTACTS
- **Technical Lead:** [YOUR_NUMBER]
- **Legal Counsel:** [LAWYER_NUMBER]
- **Hosting (Vercel):** https://vercel.com/support
- **Database (Supabase):** https://supabase.com/dashboard/support
- **Auth (Clerk):** https://clerk.com/support
- **Payments (Stripe):** https://support.stripe.com

### 🔑 CRITICAL CREDENTIALS (BREAK GLASS)
- Vercel Admin: [SECURE_LOCATION]
- Supabase Admin: [SECURE_LOCATION]
- Stripe Dashboard: [SECURE_LOCATION]
- Clerk Dashboard: [SECURE_LOCATION]

---

## PLAYBOOK 1: DATA BREACH (P0)

### STEP 1: CONTAIN (First 5 Minutes)

```bash
# 1. Take site offline immediately
# Vercel Dashboard → Project → Settings → General → Pause Deployment
# OR set maintenance mode:
```

```sql
-- 2. Enable forced RLS on all tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE 'ALTER TABLE ' || r.tablename || ' FORCE ROW LEVEL SECURITY';
    END LOOP;
END $$;
```

```bash
# 3. Revoke all user sessions
# Clerk Dashboard → Sessions → Revoke All Active Sessions
```

### STEP 2: INVESTIGATE (Next 30 Minutes)

```sql
-- Check who accessed what in last 24 hours
SELECT 
    user_id,
    COUNT(*) as event_count,
    array_agg(DISTINCT name) as events,
    MIN(created_at) as first_event,
    MAX(created_at) as last_event
FROM events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id
ORDER BY event_count DESC
LIMIT 20;

-- Check for data exfiltration patterns
SELECT 
    user_id,
    COUNT(*) as queries,
    COUNT(DISTINCT path) as unique_endpoints
FROM events
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND path LIKE '/api/%'
GROUP BY user_id
HAVING COUNT(*) > 100; -- Abnormal API usage
```

### STEP 3: DOCUMENT (Within 2 Hours)

Create incident report:
```bash
touch docs/INCIDENTS/$(date +%Y-%m-%d)_data_breach.md
```

Required sections:
1. **Timeline** - What happened when
2. **Scope** - What data was accessed
3. **Users Affected** - List of user IDs
4. **Root Cause** - How breach occurred
5. **Immediate Actions** - What you did to contain

### STEP 4: NOTIFY (Within 72 Hours - GDPR Requirement)

**Legal Requirements:**
- GDPR: Notify supervisory authority within 72 hours
- CCPA: Notify affected users "without unreasonable delay"

**Template Email:**
```
Subject: Important Security Notice - Garrison Ledger

Dear [USER_NAME],

We are writing to inform you of a security incident that may have affected your account.

WHAT HAPPENED:
[Brief description]

WHAT DATA WAS AFFECTED:
[Specific fields: email, rank, etc. - be specific]

WHAT WE'RE DOING:
- Immediate containment measures implemented
- Vulnerability patched
- Enhanced monitoring activated

WHAT YOU SHOULD DO:
- Change your password immediately
- Monitor your accounts for suspicious activity
- Review your recent transactions

For questions: security@garrisonledger.com

Sincerely,
Garrison Ledger Security Team
```

### STEP 5: REMEDIATE (Within 7 Days)

1. **Patch vulnerability**
2. **Deploy fix to production**
3. **Run full security audit**
4. **Update threat model**
5. **Implement additional controls**

---

## PLAYBOOK 2: STRIPE WEBHOOK FAILURE (P1)

### SYMPTOMS:
- Users reporting "upgrade didn't work"
- Payments successful in Stripe but tier not updated
- Webhook errors in Vercel logs

### DIAGNOSIS:

```bash
# Check Vercel function logs
# Vercel Dashboard → Functions → /api/stripe/webhook → View Logs

# Check Stripe Dashboard
# Stripe Dashboard → Developers → Webhooks → View Events
# Look for failed events (red X)
```

### FIX:

```sql
-- 1. Check recent webhook events
SELECT 
    event_id,
    event_type,
    status,
    error_message,
    processed_at
FROM stripe_webhook_events
WHERE processed_at > NOW() - INTERVAL '1 hour'
ORDER BY processed_at DESC;

-- 2. Manually process failed subscription (if needed)
-- Get Stripe session ID from failed webhook
-- Then manually update entitlements:
UPDATE entitlements
SET 
    tier = 'premium',
    status = 'active',
    stripe_subscription_id = 'sub_XXXX',
    updated_at = NOW()
WHERE user_id = 'user_XXXX';
```

### PREVENTION:
- Stripe webhook idempotency (✅ implemented)
- Monitor `stripe_webhook_events.status = 'failed'`
- Alert on >3 failures in 1 hour

---

## PLAYBOOK 3: RLS POLICY MISCONFIGURATION (P1)

### SYMPTOMS:
- User reports seeing "data from someone else"
- Audit script shows policy missing
- Cross-user data visible in logs

### IMMEDIATE CONTAINMENT:

```sql
-- Force RLS on affected table
ALTER TABLE affected_table FORCE ROW LEVEL SECURITY;

-- This blocks ALL access until proper policies added
```

### DIAGNOSIS:

```bash
# Run RLS audit
npm run audit:rls

# Check specific table policies
SELECT * FROM pg_policies
WHERE tablename = 'affected_table';
```

### FIX:

```sql
-- Add missing user_id validation policy
CREATE POLICY "Users can only access own data"
  ON affected_table FOR ALL
  USING ((auth.uid())::text = user_id)
  WITH CHECK ((auth.uid())::text = user_id);

-- Remove FORCE RLS
ALTER TABLE affected_table NO FORCE ROW LEVEL SECURITY;
```

### VERIFICATION:

```typescript
// Test with two different users
const user1Token = 'token_1';
const user2Token = 'token_2';

// Create data as user1
await supabase.auth.setSession(user1Token);
await supabase.from('affected_table').insert({ user_id: 'user1', data: 'test' });

// Try to read as user2 (should return empty)
await supabase.auth.setSession(user2Token);
const { data } = await supabase.from('affected_table').select('*');

assert(data.length === 0, 'RLS STILL BROKEN');
```

---

## PLAYBOOK 4: RATE LIMIT BYPASS (P2)

### SYMPTOMS:
- User making >1000 API calls/hour
- `api_quota` counts not incrementing
- External API bills spike

### DIAGNOSIS:

```sql
-- Check user's API usage
SELECT 
    route,
    day,
    count,
    updated_at
FROM api_quota
WHERE user_id = 'suspicious_user_id'
ORDER BY day DESC, count DESC;

-- Check for patterns
SELECT 
    user_id,
    route,
    SUM(count) as total_calls,
    MAX(count) as max_daily
FROM api_quota
WHERE day > CURRENT_DATE - 7
GROUP BY user_id, route
HAVING SUM(count) > 1000; -- Very high usage
```

### FIX:

```sql
-- 1. Temporarily ban user (soft block)
UPDATE entitlements
SET status = 'suspended'
WHERE user_id = 'abusive_user_id';

-- 2. Reset their quotas
DELETE FROM api_quota
WHERE user_id = 'abusive_user_id'
  AND day = CURRENT_DATE;
```

### PERMANENT FIX:
- Add rate limiting to bypassed route
- Review `checkAndIncrement` implementation
- Consider IP-based rate limiting

---

## PLAYBOOK 5: EXTERNAL API COMPROMISE (P2)

### SYMPTOMS:
- Gemini API returning unexpected data
- Weather API returns malicious content
- GreatSchools data seems poisoned

### CONTAINMENT:

```typescript
// 1. Disable affected integration
// In lib/ssot.ts or via feature flag:
export const ssot = {
  features: {
    weatherData: { status: 'disabled', reason: 'Security investigation' }
  }
};

// 2. Clear all cached data
DELETE FROM base_external_data_cache
WHERE data->>'source' = 'weather';
```

### INVESTIGATION:

```sql
-- Check recent external data
SELECT 
    base_id,
    data->>'source' as source,
    data->>'cachedAt' as cached_at,
    created_at
FROM base_external_data_cache
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### RECOVERY:

1. Rotate API keys
2. Re-verify data sources
3. Clear cache
4. Re-enable with monitoring

---

## POST-INCIDENT REVIEW TEMPLATE

**Incident:** [Name]  
**Date:** [YYYY-MM-DD]  
**Severity:** P0/P1/P2/P3  
**Duration:** [X hours]

### What Happened?
[2-3 sentence summary]

### Timeline
- **HH:MM** - Incident detected
- **HH:MM** - Containment actions taken
- **HH:MM** - Root cause identified
- **HH:MM** - Fix deployed
- **HH:MM** - Incident resolved

### Root Cause
[Technical explanation]

### Impact
- Users affected: [N]
- Data exposed: [None/Limited/Extensive]
- Downtime: [X minutes]
- Revenue impact: $[X]

### What Went Well?
1. [Item]
2. [Item]

### What Could Be Improved?
1. [Item]
2. [Item]

### Action Items
- [ ] [Specific fix - Assigned to: NAME - Due: DATE]
- [ ] [Process improvement]
- [ ] [Documentation update]

---

## SECURITY CONTACTS

**Responsible Disclosure:**
- Email: security@garrisonledger.com
- PGP Key: [TO BE GENERATED]
- Response SLA: 48 hours

**Bug Bounty Program:**
- Status: Not yet launched
- Planned: Q1 2026

---

**Last Drill:** Never  
**Next Drill:** 2025-12-01 (Monthly recommended)

**Drill Scenarios:**
1. Simulated RLS bypass
2. Stripe webhook replay attack
3. External API compromise
4. Insider threat (admin key compromised)


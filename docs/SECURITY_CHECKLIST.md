# SECURITY FEATURE CHECKLIST

**Use this checklist for EVERY new feature, API route, or database table.**

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### For New API Routes:

- [ ] **Route requires authentication**
```typescript
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    throw Errors.unauthorized();
  }
  // ... rest of handler
}
```

- [ ] **User ID validated against resource ownership**
```typescript
// Verify claim belongs to user
const { data: claim } = await supabaseAdmin
  .from('pcs_claims')
  .select('id')
  .eq('id', claimId)
  .eq('user_id', userId) // ✅ Ownership check
  .maybeSingle();

if (!claim) {
  throw Errors.notFound('PCS claim');
}
```

- [ ] **Tier gating implemented (if premium feature)**
```typescript
const { data: entitlement } = await supabaseAdmin
  .from('entitlements')
  .select('tier, status')
  .eq('user_id', userId)
  .maybeSingle();

const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

if (!isPremium) {
  throw Errors.premiumRequired('This feature requires Premium');
}
```

- [ ] **Rate limiting configured**
```typescript
import { checkAndIncrement } from '@/lib/limits';

const result = await checkAndIncrement(userId, '/api/route/name', 50);
if (!result.allowed) {
  throw Errors.rateLimitExceeded('Daily limit reached');
}
```

---

## 🗄️ DATABASE SECURITY

### For New Tables:

- [ ] **RLS enabled immediately**
```sql
CREATE TABLE new_feature_data (...);

-- Enable RLS BEFORE inserting any data
ALTER TABLE new_feature_data ENABLE ROW LEVEL SECURITY;
```

- [ ] **Policies use auth.uid() = user_id pattern**
```sql
CREATE POLICY "Users can view own data"
  ON new_feature_data FOR SELECT
  USING ((auth.uid())::text = user_id);

CREATE POLICY "Users can insert own data"
  ON new_feature_data FOR INSERT
  WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can update own data"
  ON new_feature_data FOR UPDATE
  USING ((auth.uid())::text = user_id)
  WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can delete own data"
  ON new_feature_data FOR DELETE
  USING ((auth.uid())::text = user_id);
```

- [ ] **Service role policy added (for admin access)**
```sql
CREATE POLICY "Service role can manage data"
  ON new_feature_data FOR ALL
  USING (true)
  WITH CHECK (true);
```

- [ ] **Indexes created for performance**
```sql
CREATE INDEX idx_new_feature_data_user_id ON new_feature_data(user_id);
CREATE INDEX idx_new_feature_data_created_at ON new_feature_data(created_at DESC);
```

- [ ] **Migration recorded in schema_migrations**
```sql
-- At end of migration file
INSERT INTO schema_migrations (version, name, description)
VALUES ('20251101_feature_name', 'Feature Name', 'What this migration does');
```

- [ ] **Table has proper COMMENT**
```sql
COMMENT ON TABLE new_feature_data IS 'Description of what this table stores';
```

---

## 🛡️ INPUT VALIDATION

### For All User Inputs:

- [ ] **Type validation with TypeScript**
```typescript
interface CreateRequest {
  name: string;
  amount: number;
  date: string; // ISO date string
}

const body: CreateRequest = await req.json();
```

- [ ] **Length limits enforced**
```typescript
if (!body.name || body.name.length > 200) {
  throw Errors.invalidInput('Name must be 1-200 characters');
}
```

- [ ] **SQL parameters - NO string concatenation**
```typescript
// ❌ WRONG - SQL injection risk
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;

// ✅ CORRECT - Parameterized query (Supabase handles this)
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail);
```

- [ ] **File uploads validated**
```typescript
// Type check
if (file.type !== 'application/pdf') {
  throw Errors.invalidInput('Only PDF files supported');
}

// Size check (from SSOT)
if (file.size > MAX_FILE_SIZE_BYTES) {
  throw Errors.invalidInput(`File too large (max ${MAX_SIZE}MB)`);
}

// Malware scan (when implemented)
// const scanResult = await scanFile(buffer, file.name);
// if (!scanResult.safe) {
//   throw Errors.invalidInput('File failed security scan');
// }
```

- [ ] **HTML sanitized (if accepting HTML)**
```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizedHTML = DOMPurify.sanitize(userHTML, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
  ALLOWED_ATTR: []
});
```

---

## 🔒 DATA PROTECTION

### For PII & Sensitive Data:

- [ ] **PII classified and documented**
```typescript
// Document in type definition
interface UserProfile {
  email: string; // PII - TIER 2
  rank: string; // Sensitive - TIER 2
  ssn?: never; // NEVER STORED - TIER 1
}
```

- [ ] **Sensitive data encrypted at rest** (Supabase does this automatically)

- [ ] **Logs redact sensitive fields**
```typescript
import { logger } from '@/lib/logger';

// Logger automatically sanitizes: email, ssn, password, token, secret
logger.info('User created', {
  userId: userId.substring(0, 8) + '...',
  email: email.split('@')[1], // Only log domain
  rank, // OK to log
});
```

- [ ] **Error messages don't leak data**
```typescript
// ❌ BAD - Leaks user email
throw new Error(`User ${user.email} not found`);

// ✅ GOOD - Generic message
throw Errors.notFound('User');
```

- [ ] **No secrets in client code**
```typescript
// ❌ BAD - API key in client component
const GOOGLE_API_KEY = 'AIza...';

// ✅ GOOD - API route uses server-side env var
const apiKey = process.env.GOOGLE_API_KEY;
```

---

## 📊 AUDIT TRAIL

### For Security-Sensitive Operations:

- [ ] **Audit log entry created**
```typescript
import { auditLogger } from '@/lib/audit-logger';

// After successful operation
await auditLogger.logDataAccess(
  userId,
  'les_upload',
  uploadId,
  { file_size: file.size, month, year }
);
```

- [ ] **Failed attempts logged**
```typescript
import { auditLogger } from '@/lib/audit-logger';

// On authentication failure
await auditLogger.logSecurity(
  'invalid_token',
  null,
  'warn',
  { attempted_route: req.url, ip: getIP(req) }
);
```

- [ ] **Admin actions logged to admin_actions table**
```typescript
await supabaseAdmin.from('admin_actions').insert({
  admin_user_id: adminId,
  action_type: 'user_suspended',
  target_type: 'user',
  target_id: targetUserId,
  details: { reason: 'Terms violation' }
});
```

---

## 🚦 RATE LIMITING

### For All Public/User-Facing Routes:

- [ ] **Rate limit configured**
```typescript
import { checkAndIncrement } from '@/lib/limits';

// Free: 10/day, Premium: 100/day
const limit = tier === 'premium' ? 100 : 10;
const result = await checkAndIncrement(userId, route, limit);

if (!result.allowed) {
  throw Errors.rateLimitExceeded(`Limit: ${limit}/day`);
}
```

- [ ] **Different limits for free vs premium**
```typescript
const limits = tier === 'premium' 
  ? 500  // Premium: Higher limit
  : 50;  // Free: Lower limit
```

- [ ] **IP-based rate limiting (for unauthenticated routes)**
```typescript
import { enforceIPRateLimit } from '@/lib/middleware/rate-limit';

const ip = req.headers.get('x-forwarded-for') || 'unknown';
const { allowed } = enforceIPRateLimit(ip, route, 100); // 100/hour

if (!allowed) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

---

## 📁 FILE UPLOAD SECURITY

### For File Upload Routes:

- [ ] **File type validated**
```typescript
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

if (!ALLOWED_TYPES.includes(file.type)) {
  throw Errors.invalidInput(`Unsupported file type: ${file.type}`);
}
```

- [ ] **File size enforced**
```typescript
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

if (file.size > MAX_SIZE_BYTES) {
  throw Errors.invalidInput(`File too large (max ${MAX_SIZE_MB}MB)`);
}
```

- [ ] **Malware scanning (when available)**
```typescript
// TODO: Implement when VirusTotal integrated
// const scanResult = await scanFile(buffer, file.name);
// if (!scanResult.safe) {
//   await auditLogger.logSecurity('malware_detected', userId, 'critical', { scanId: scanResult.scanId });
//   throw Errors.invalidInput('File failed security scan');
// }
```

- [ ] **Storage path includes user_id**
```typescript
// Path structure: {userId}/{folder}/{fileId}.ext
const objectPath = `${userId}/${folder}/${crypto.randomUUID()}.${extension}`;
```

- [ ] **Upload quota checked**
```typescript
const currentUsage = existingFiles?.reduce((sum, f) => sum + f.size_bytes, 0) || 0;
const storageLimit = tier === 'premium' ? 5_000_000_000 : 100_000_000; // 5GB vs 100MB

if (currentUsage + file.size > storageLimit) {
  throw Errors.premiumRequired('Storage limit exceeded');
}
```

- [ ] **EXIF metadata stripped (for images)**
```typescript
// TODO: Implement when sharp library added
// import { stripImageMetadata } from '@/lib/security/sanitize-metadata';
// const cleanBuffer = await stripImageMetadata(originalBuffer);
```

---

## 🔍 ERROR HANDLING

### For All Routes:

- [ ] **Errors use standardized error types**
```typescript
import { Errors, errorResponse } from '@/lib/api-errors';

try {
  // ... operation
} catch (error) {
  logger.error('[RouteName] Error occurred', error, { userId });
  return errorResponse(error);
}
```

- [ ] **No sensitive data in error messages**
```typescript
// ❌ BAD
return NextResponse.json({ 
  error: `Database error: ${dbError.message}`,
  query: sqlQuery 
}, { status: 500 });

// ✅ GOOD
return NextResponse.json({ 
  error: 'Internal server error' 
}, { status: 500 });
```

- [ ] **Errors logged to error_logs (for critical issues)**
```typescript
await supabaseAdmin.from('error_logs').insert({
  level: 'error',
  source: 'route_name',
  message: 'Operation failed',
  user_id: userId,
  metadata: { context: 'safe_data_only' }
});
```

---

## 🧪 TESTING

### Before Deployment:

- [ ] **RLS tested manually**
```bash
# Run RLS audit script
npm run audit:rls
```

- [ ] **Try cross-user access (should fail)**
```typescript
// Create resource as User A
const { data } = await supabaseAdmin
  .from('table')
  .insert({ user_id: 'user_a', data: 'test' })
  .select()
  .single();

// Try to access as User B via Supabase client (with RLS)
const supabaseClientB = createClient(url, anonKey, {
  global: { headers: { Authorization: `Bearer ${userBToken}` } }
});

const { data: leaked } = await supabaseClientB
  .from('table')
  .select('*')
  .eq('id', data.id);

// Should return empty or null due to RLS
assert(leaked === null || leaked.length === 0, 'RLS BREACH!');
```

- [ ] **Rate limit tested (should block after limit)**
```bash
# Make 51 requests rapidly
for i in {1..51}; do
  curl -H "Authorization: Bearer $TOKEN" \
    https://garrisonledger.com/api/route/name
done
# Request 51 should return 429
```

- [ ] **Malicious input tested**
```bash
# SQL injection attempt
curl -X POST https://garrisonledger.com/api/route \
  -d '{"email": "test@example.com OR 1=1--"}'
# Should be safely escaped by Supabase

# XSS attempt
curl -X POST https://garrisonledger.com/api/route \
  -d '{"name": "<script>alert(1)</script>"}'
# Should be escaped by React rendering
```

---

## 📝 DOCUMENTATION

### Required Documentation:

- [ ] **API endpoint documented in code comments**
```typescript
/**
 * CREATE PCS CLAIM
 * 
 * POST /api/pcs/claim
 * 
 * Creates a new PCS claim package for user.
 * 
 * Auth: Required
 * Tier: Premium only
 * Rate Limit: 10/day
 * 
 * Body: { claim_name, rank_at_pcs, origin_base, destination_base }
 * Returns: { claim_id, status, entitlements }
 */
```

- [ ] **RLS policies documented in migration**
```sql
-- Migration: 20251101_add_feature
COMMENT ON TABLE new_table IS '[RLS ENABLED] Description of data stored';
```

- [ ] **Security considerations noted**
```typescript
// SECURITY NOTE: This endpoint processes PII from uploaded documents.
// - Never store raw SSN or bank account numbers
// - Audit log all uploads
// - Enforce file size limits
```

---

## 🎯 DEPLOYMENT

### Pre-Deployment Checklist:

- [ ] **Secrets not in code**
```bash
# Run secret scan
npm run secret-scan
# Should exit 0 (no secrets found)
```

- [ ] **Environment variables documented**
```markdown
# Add to docs/guides/ENV_SETUP.md if new variable needed
NEW_API_KEY=your_key_here
```

- [ ] **Migration tested in staging**
```bash
# Apply to test database first
# Verify works, then apply to production
```

- [ ] **RLS audit passes**
```bash
npm run audit:rls
# Should show 0 issues
```

- [ ] **TypeScript compiles with no errors**
```bash
npm run type-check
```

---

## 🚨 HIGH-RISK FEATURES

These features require **extra scrutiny** and **senior review**:

### 1. Payment Processing
- [ ] Stripe webhook signature verified
- [ ] Idempotency enforced
- [ ] Transactions are atomic
- [ ] Audit logged
- [ ] Tested with duplicate events

### 2. PII Processing
- [ ] Data classification documented (TIER 1/2/3)
- [ ] Zero storage if TIER 1 (SSN, bank account)
- [ ] Encryption verified
- [ ] Audit logged
- [ ] Retention policy documented

### 3. File Uploads
- [ ] Malware scanning (or documented as TODO)
- [ ] Metadata stripped (EXIF, etc.)
- [ ] Storage quota enforced
- [ ] Virus scan results logged
- [ ] Quarantine process for flagged files

### 4. Admin/Privileged Operations
- [ ] Admin role verified (not just auth check)
- [ ] Logged to admin_actions table
- [ ] Audit trail includes justification
- [ ] Cannot be reversed without trace

### 5. External API Integrations
- [ ] Circuit breaker implemented
- [ ] Fallback data available
- [ ] Timeout configured (< 30 seconds)
- [ ] Response validation
- [ ] Rate limit respected

---

## 🔄 POST-DEPLOYMENT

### Within 24 Hours:

- [ ] **Monitor error logs**
```sql
SELECT * FROM error_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

- [ ] **Check audit logs for anomalies**
```sql
SELECT event_type, COUNT(*), MAX(created_at)
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type
ORDER BY COUNT(*) DESC;
```

- [ ] **Verify health check passes**
```bash
curl https://www.garrisonledger.com/api/health
# Should return 200 with status: "healthy"
```

- [ ] **Check Sentry for new errors** (when implemented)

- [ ] **Review Vercel function logs**
```
Vercel Dashboard → Functions → Filter by new route → Check for errors
```

---

## EXAMPLE: COMPLETE SECURE API ROUTE

```typescript
/**
 * CREATE WIDGET
 * 
 * POST /api/widgets/create
 * 
 * Creates a new widget for authenticated user.
 * 
 * Auth: Required
 * Tier: Any
 * Rate Limit: 20/day free, 100/day premium
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { auditLogger } from "@/lib/audit-logger";
import { getUserTier } from "@/lib/auth/subscription";
import { checkAndIncrement } from "@/lib/limits";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CreateWidgetRequest {
  name: string;
  config: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. AUTHENTICATION
    const { userId } = await auth();
    if (!userId) {
      throw Errors.unauthorized();
    }

    // 2. INPUT VALIDATION
    const body: CreateWidgetRequest = await req.json();
    
    if (!body.name || body.name.length > 200) {
      throw Errors.invalidInput('Name must be 1-200 characters');
    }

    // 3. RATE LIMITING
    const tier = await getUserTier(userId);
    const limit = tier === 'premium' ? 100 : 20;
    const rateLimitResult = await checkAndIncrement(userId, '/api/widgets/create', limit);

    if (!rateLimitResult.allowed) {
      throw Errors.rateLimitExceeded(`Daily limit: ${limit}`);
    }

    // 4. TIER GATING (if premium-only feature)
    // if (tier !== 'premium') {
    //   throw Errors.premiumRequired('Widgets are premium-only');
    // }

    // 5. DATABASE OPERATION (RLS enforced)
    const { data: widget, error: dbError } = await supabaseAdmin
      .from('widgets')
      .insert({
        user_id: userId, // ✅ RLS will validate this
        name: body.name,
        config: body.config
      })
      .select()
      .single();

    if (dbError || !widget) {
      throw Errors.databaseError('Failed to create widget');
    }

    // 6. AUDIT LOG
    await auditLogger.logDataAccess(
      userId,
      'widget_created' as any, // Type extends as needed
      widget.id,
      { name: body.name }
    );

    // 7. SUCCESS RESPONSE
    logger.info('[CreateWidget] Widget created', {
      userId: userId.substring(0, 8) + '...',
      widgetId: widget.id,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      widget_id: widget.id
    });

  } catch (error) {
    logger.error('[CreateWidget] Error', error, {
      duration: Date.now() - startTime
    });
    return errorResponse(error);
  }
}
```

---

## APPROVAL REQUIRED

The following changes require **senior developer or security team approval**:

1. ❌ Disabling RLS on any table
2. ❌ Creating policies with `USING (true)` on user data
3. ❌ Storing SSN, bank account, or passwords
4. ❌ Bypassing rate limits
5. ❌ Making storage buckets public
6. ❌ Using `SECURITY DEFINER` on new functions
7. ❌ Exposing service role key to client
8. ❌ Disabling security headers

---

**Last Updated:** 2025-11-01  
**Version:** 1.0  
**Maintained By:** Security Team


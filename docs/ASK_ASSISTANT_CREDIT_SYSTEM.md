# Ask Assistant Credit System Documentation

**Last Updated:** 2025-01-24  
**Status:** ✅ Production  
**Owner:** Engineering Team

## Overview

The Ask Assistant credit system manages question allowances for free and premium users. This document details the architecture, initialization flow, error handling, and troubleshooting.

---

## Credit Tiers

### Free Tier
- **Questions per Month:** 5
- **Max Tokens per Question:** 3,072
- **File Analysis:** ❌ Not available
- **Cost:** $0
- **Auto-refresh:** Monthly on signup anniversary

### Premium Tier
- **Questions per Month:** 50
- **Max Tokens per Question:** 6,144
- **File Analysis:** ❌ Not available (planned)
- **Cost:** Included with $9.99/month subscription
- **Auto-refresh:** Monthly on subscription anniversary

### Credit Packs (Add-on)
| Pack Size | Price | Per Question Cost |
|-----------|-------|-------------------|
| 25 credits | $1.99 | $0.08 |
| 100 credits | $5.99 | $0.06 |
| 250 credits | $9.99 | $0.04 |

**Credit Pack Benefits:**
- ✅ Never expire
- ✅ Stack with monthly credits
- ✅ Used after monthly credits depleted
- ✅ Available to both free and premium users

---

## Database Schema

### `ask_credits` Table

```sql
CREATE TABLE ask_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,                    -- Clerk user ID
  credits_remaining INTEGER NOT NULL,       -- Current available credits
  credits_total INTEGER NOT NULL,           -- Total credits for this period
  tier TEXT NOT NULL,                       -- 'free', 'premium', or 'pack'
  expires_at TIMESTAMPTZ,                   -- When these credits expire
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one credit record per user
CREATE UNIQUE INDEX idx_ask_credits_user_id_unique ON ask_credits(user_id);

-- Index for fast lookups
CREATE INDEX idx_ask_credits_user_id ON ask_credits(user_id);
```

### RLS (Row Level Security) Policies

**Critical:** The credit system requires specific RLS policies to function:

1. **Service Role Policy** - Allows API routes to manage credits:
```sql
CREATE POLICY "Service role can manage ask_credits" ON ask_credits
  FOR ALL USING (auth.role() = 'service_role');
```

2. **User SELECT Policy** - Allows users to view their own credits:
```sql
CREATE POLICY "Users can view own ask_credits" ON ask_credits
  FOR SELECT USING (auth.uid()::text = user_id);
```

3. **User INSERT Policy** - Allows fallback initialization:
```sql
CREATE POLICY "Users can insert own ask_credits" ON ask_credits
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
```

4. **User UPDATE Policy** - Allows credit consumption:
```sql
CREATE POLICY "Users can update own ask_credits" ON ask_credits
  FOR UPDATE USING (auth.uid()::text = user_id);
```

---

## Credit Initialization Flow

### Primary Path: Clerk Webhook (Preferred)

```
User Signs Up (Clerk)
  ↓
Clerk Webhook Fires
  ↓
POST /api/webhooks/clerk
  ↓
Create user_profiles, entitlements, user_gamification
  ↓
Initialize ask_credits (5 free questions, 30-day expiration)
  ↓
Log success to admin logs
```

**File:** `app/api/webhooks/clerk/route.ts` (lines 130-146)

**Configuration:**
- Free users: 5 credits
- Premium users: 50 credits
- Expiration: 30 days from signup
- Tier: Matches entitlement tier

### Backup Path: Database Trigger (Safety Net)

```
User Record Created in auth.users
  ↓
Trigger: on_clerk_user_created
  ↓
Function: initialize_new_clerk_user()
  ↓
ON CONFLICT DO NOTHING (prevents duplicates)
  ↓
Initialize ask_credits if webhook missed it
```

**File:** `supabase-migrations/20251024_clerk_integration_optimization.sql`

**Why Two Paths?**
- Webhook is primary (faster, more reliable)
- Trigger is backup (handles webhook failures, delays, or missed events)
- ON CONFLICT prevents double initialization

### On-Demand Path: API Route (Last Resort)

```
User Visits /dashboard/ask
  ↓
CreditMeter Component Loads
  ↓
GET /api/ask/credits
  ↓
No credits found? → initializeCreditsWithRetry()
  ↓
Retry up to 3 times with exponential backoff
  ↓
Success or Error with specific code
```

**File:** `app/api/ask/credits/route.ts` (lines 17-60)

**Retry Configuration:**
- Max Retries: 3
- Initial Delay: 200ms
- Backoff: 2x per retry (200ms → 400ms → 800ms)
- Total Max Time: ~1.4 seconds

---

## Error Handling

### Error Codes

The credit system returns specific error codes for frontend handling:

| Error Code | HTTP Status | Meaning | User Action |
|------------|-------------|---------|-------------|
| `NO_ENTITLEMENT` | 404 | User has no entitlement record | Complete profile setup |
| `INIT_FAILED` | 500 | Credit initialization failed after retries | Refresh page or contact support |
| `DB_ERROR` | 500 | Database query failed | Wait and retry |
| `NETWORK_ERROR` | 0 | Network connection failed | Check internet connection |
| `UNKNOWN_ERROR` | 500 | Unexpected error | Contact support |

### Frontend Error Display

**File:** `app/components/ask/CreditMeter.tsx`

The `CreditMeter` component shows context-specific error messages:

- **NO_ENTITLEMENT** → Yellow warning, "Complete Profile" button
- **INIT_FAILED** → Red error, "Refresh Page" button
- **DB_ERROR** → Red error, "Try Again" button with retry
- **NETWORK_ERROR** → Orange error, "Retry" button
- **UNKNOWN_ERROR** → Red error, "Try Again" button

### Admin Monitoring

Failed credit initialization logs to `error_logs` table:

```typescript
await supabase.from("error_logs").insert({
  level: "error",
  source: "ask_credits_initialization",
  message: "Failed to initialize Ask Assistant credits",
  details: {
    userId,
    error: errorMessage,
    timestamp: new Date().toISOString(),
  },
});
```

**View Admin Logs:**
- Dashboard: `/dashboard/admin` → Ops Status tab → Error Logs
- Query: `SELECT * FROM error_logs WHERE source = 'ask_credits_initialization'`

---

## Credit Consumption

### When Credits Are Deducted

Credits are deducted **only** when a question is successfully submitted:

```typescript
// Check credits before processing
if (credits.credits_remaining <= 0) {
  return 402 Payment Required
}

// Process question with AI
const answer = await generateAnswer(question);

// Decrement credit AFTER success
await supabase
  .from("ask_credits")
  .update({ credits_remaining: credits_remaining - 1 })
  .eq("user_id", userId);
```

**File:** `app/api/ask/submit/route.ts` (lines 96-103)

**Credits NOT Deducted When:**
- ❌ Question validation fails
- ❌ User has no credits
- ❌ AI generation fails
- ❌ Network error occurs
- ❌ User cancels request

### Monthly Refresh

Credits refresh monthly on the anniversary of signup/subscription:

```typescript
// Check if credits expired (monthly refresh)
const now = new Date();
const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const creditsDate = new Date(credits.created_at);

if (creditsDate < lastMonth) {
  return await refreshMonthlyCredits(userId, credits);
}
```

**Refresh Logic:**
1. Check `created_at` vs current month
2. If older than 1 month ago, refresh
3. Add new credits to existing balance
4. Update `expires_at` to next month
5. Update `tier` based on current entitlement

**Note:** This runs on-demand during GET requests. Future improvement: Move to cron job.

---

## API Endpoints

### GET `/api/ask/credits`

**Purpose:** Fetch user's current credit balance

**Authentication:** Required (Clerk)

**Response (Success):**
```json
{
  "success": true,
  "credits_remaining": 5,
  "credits_total": 5,
  "tier": "free",
  "expires_at": "2025-02-24T00:00:00Z"
}
```

**Response (Error):**
```json
{
  "error": "Failed to initialize credits",
  "errorCode": "INIT_FAILED",
  "message": "Unable to set up your question credits. Please try refreshing the page."
}
```

**Used By:**
- `CreditMeter` component (loads on page mount)
- Dashboard widget
- Ask Assistant page

### POST `/api/ask/credits`

**Purpose:** Manual credit initialization or refresh

**Authentication:** Required (Clerk)

**Request Body:**
```json
{
  "action": "initialize" | "refresh"
}
```

**Use Cases:**
- Admin tools
- Testing
- Manual recovery

### POST `/api/ask/submit`

**Purpose:** Submit question and consume credit

**Authentication:** Required (Clerk)

**Request Body:**
```json
{
  "question": "What is my BAH for 2025?",
  "templateId": "bah-lookup"  // Optional
}
```

**Response (Success):**
```json
{
  "success": true,
  "answer": { /* structured answer */ },
  "credits_remaining": 4,
  "tier": "free"
}
```

**Response (No Credits):**
```json
{
  "error": "No credits remaining",
  "credits_remaining": 0,
  "tier": "free"
}
```
HTTP Status: 402 Payment Required

---

## Troubleshooting

### Issue: User sees "Credits Not Available"

**Root Cause:** Missing INSERT policy on `ask_credits` table (fixed in v6.2.1)

**Solution:**
1. Apply migration: `20250124_ask_credits_rls_fix.sql`
2. Verify RLS policies exist:
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'ask_credits';
```

Expected policies:
- `Service role can manage ask_credits` (ALL)
- `Users can view own ask_credits` (SELECT)
- `Users can insert own ask_credits` (INSERT)
- `Users can update own ask_credits` (UPDATE)

### Issue: Credits not initialized on signup

**Possible Causes:**
1. Clerk webhook not configured
2. Webhook signature verification failed
3. Database trigger not fired
4. RLS policy blocking insert

**Diagnostic Steps:**

1. **Check webhook logs:**
```sql
SELECT * FROM error_logs 
WHERE source = 'clerk_webhook_credits' 
ORDER BY created_at DESC 
LIMIT 10;
```

2. **Check if user has entitlement:**
```sql
SELECT * FROM entitlements 
WHERE user_id = 'user_xxx' 
AND status = 'active';
```

3. **Check if credits exist:**
```sql
SELECT * FROM ask_credits 
WHERE user_id = 'user_xxx';
```

4. **Manually initialize credits:**
```sql
INSERT INTO ask_credits (user_id, credits_remaining, credits_total, tier, expires_at)
VALUES (
  'user_xxx',
  5,
  5,
  'free',
  NOW() + INTERVAL '30 days'
);
```

### Issue: Premium user has only 5 credits

**Root Cause:** Credits initialized before upgrade, or not refreshed after upgrade

**Solution:**
1. Check current tier:
```sql
SELECT tier FROM entitlements 
WHERE user_id = 'user_xxx';
```

2. Refresh credits manually:
```sql
UPDATE ask_credits 
SET 
  credits_remaining = 50,
  credits_total = 50,
  tier = 'premium',
  expires_at = NOW() + INTERVAL '30 days'
WHERE user_id = 'user_xxx';
```

### Issue: Credits not deducting

**Possible Causes:**
1. API route not calling update
2. RLS policy blocking update
3. Database constraint failure

**Diagnostic Steps:**

1. **Test credit deduction:**
```sql
UPDATE ask_credits 
SET credits_remaining = credits_remaining - 1 
WHERE user_id = 'user_xxx';
```

2. **Check RLS policies allow UPDATE:**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'ask_credits' 
AND cmd = 'UPDATE';
```

3. **Check API logs for errors:**
```sql
SELECT * FROM error_logs 
WHERE source LIKE '%ask%' 
ORDER BY created_at DESC 
LIMIT 20;
```

---

## Performance Considerations

### Current Implementation

1. **No Caching:** Credits fetched from database on every page load
2. **On-Demand Refresh:** Monthly refresh runs during GET requests
3. **Retry Logic:** Up to 3 retries with exponential backoff

### Future Optimizations

1. **Add Redis Caching:**
   - Cache credit balance for 60 seconds
   - Invalidate on credit consumption
   - Reduce database queries by 90%

2. **Move to Cron Job:**
   - Run monthly credit refresh as scheduled job
   - Remove refresh logic from GET endpoint
   - Improve response time

3. **Optimize Query:**
   - Currently makes 2 queries (entitlement + credits)
   - Could JOIN in single query
   - Save ~50ms per request

4. **Add Batch Operations:**
   - Backfill missing credits for multiple users
   - Bulk refresh for subscription renewals

---

## Testing

### Manual Testing Checklist

- [ ] New free user gets 5 credits
- [ ] New premium user gets 50 credits
- [ ] Credits deducted on question submission
- [ ] Credits NOT deducted on failed submission
- [ ] Error messages show correct codes
- [ ] Retry logic works on transient errors
- [ ] Monthly refresh adds credits correctly
- [ ] Premium upgrade increases credit allowance
- [ ] Credit packs add to balance
- [ ] Credits expire after 30 days

### Database Queries for Testing

**Count users by credit tier:**
```sql
SELECT tier, COUNT(*) as user_count 
FROM ask_credits 
GROUP BY tier;
```

**Find users without credits:**
```sql
SELECT e.user_id, e.tier 
FROM entitlements e 
LEFT JOIN ask_credits ac ON e.user_id = ac.user_id 
WHERE ac.id IS NULL AND e.status = 'active';
```

**Check credit expiration:**
```sql
SELECT user_id, tier, credits_remaining, expires_at 
FROM ask_credits 
WHERE expires_at < NOW() + INTERVAL '7 days'
ORDER BY expires_at ASC;
```

---

## Related Files

### Backend
- `app/api/ask/credits/route.ts` - Credit balance and initialization API
- `app/api/ask/submit/route.ts` - Question submission and credit deduction
- `app/api/webhooks/clerk/route.ts` - User signup and credit initialization
- `lib/ssot.ts` - Credit configuration constants

### Frontend
- `app/components/ask/CreditMeter.tsx` - Credit display and error handling
- `app/components/ask/AskAssistantClient.tsx` - Main Ask Assistant UI
- `app/dashboard/ask/page.tsx` - Ask Assistant page

### Database
- `supabase-migrations/20250123_ask_assistant_schema.sql` - Original schema
- `supabase-migrations/20250124_ask_credits_rls_fix.sql` - RLS policy fix
- `supabase-migrations/20251024_clerk_integration_optimization.sql` - Database trigger

### Documentation
- `SYSTEM_STATUS.md` - Overall system status
- `docs/CLERK_SUPABASE_INTEGRATION.md` - Auth integration details

---

## Change Log

### 2025-01-24 - RLS Policy Fix (v6.2.1)
- ✅ Added missing INSERT policy for service role
- ✅ Added INSERT policy for users (fallback)
- ✅ Removed invalid foreign key constraint
- ✅ Added exponential backoff retry logic
- ✅ Improved error messages with specific codes
- ✅ Added admin error logging
- ✅ Backfilled missing credits for existing users

### 2025-01-24 - Initial Implementation
- ✅ Created `ask_credits` table with RLS
- ✅ Webhook integration for new users
- ✅ Database trigger backup
- ✅ Monthly refresh logic
- ✅ Credit deduction on question submit

---

## Support

**For Issues:**
- Check admin error logs: `/dashboard/admin` → Ops Status → Error Logs
- Review Supabase logs for RLS denials
- Test with SQL queries above

**For Questions:**
- Engineering team
- See: `SYSTEM_STATUS.md` for current status


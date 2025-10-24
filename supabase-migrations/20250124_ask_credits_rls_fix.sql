-- ==========================================
-- ASK ASSISTANT CREDITS - RLS POLICY FIX
-- ==========================================
-- CRITICAL FIX: Add missing INSERT policies to allow credit initialization
-- Issue: Free users couldn't initialize credits due to missing RLS INSERT policy
-- Date: 2025-01-24

-- ==========================================
-- FIX 1: Add INSERT policies for ask_credits
-- ==========================================

-- Allow service role to manage all operations (used by API routes)
CREATE POLICY "Service role can manage ask_credits" ON ask_credits
  FOR ALL USING (auth.role() = 'service_role');

-- Allow users to insert their own credits (fallback for client-side operations)
CREATE POLICY "Users can insert own ask_credits" ON ask_credits
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- ==========================================
-- FIX 2: Remove invalid foreign key constraint
-- ==========================================
-- The 'users' table doesn't exist - user_id comes from Clerk auth
-- Remove the constraint if it exists to prevent migration failures

ALTER TABLE ask_credits DROP CONSTRAINT IF EXISTS ask_credits_user_id_fkey;

-- ==========================================
-- FIX 3: Add similar INSERT policies for other Ask Assistant tables
-- ==========================================

-- ask_questions table
CREATE POLICY "Service role can manage ask_questions" ON ask_questions
  FOR ALL USING (auth.role() = 'service_role');

-- ask_credit_purchases table  
CREATE POLICY "Service role can manage ask_credit_purchases" ON ask_credit_purchases
  FOR ALL USING (auth.role() = 'service_role');

-- ask_coverage_requests table
CREATE POLICY "Service role can manage ask_coverage_requests" ON ask_coverage_requests
  FOR ALL USING (auth.role() = 'service_role');

-- ==========================================
-- FIX 4: Backfill missing credits for existing users
-- ==========================================
-- Give 5 free credits to any free-tier user who doesn't have a credits record

INSERT INTO ask_credits (user_id, credits_remaining, credits_total, tier, expires_at)
SELECT 
  e.user_id,
  5 as credits_remaining,
  5 as credits_total,
  'free' as tier,
  NOW() + INTERVAL '30 days' as expires_at
FROM entitlements e
LEFT JOIN ask_credits ac ON e.user_id = ac.user_id
WHERE ac.id IS NULL 
  AND e.tier = 'free' 
  AND e.status = 'active'
ON CONFLICT (user_id) DO NOTHING;

-- Also backfill for premium users (50 questions/month)
INSERT INTO ask_credits (user_id, credits_remaining, credits_total, tier, expires_at)
SELECT 
  e.user_id,
  50 as credits_remaining,
  50 as credits_total,
  'premium' as tier,
  NOW() + INTERVAL '30 days' as expires_at
FROM entitlements e
LEFT JOIN ask_credits ac ON e.user_id = ac.user_id
WHERE ac.id IS NULL 
  AND e.tier = 'premium' 
  AND e.status = 'active'
ON CONFLICT (user_id) DO NOTHING;

-- ==========================================
-- FIX 5: Add unique constraint to prevent duplicate credit records
-- ==========================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_ask_credits_user_id_unique ON ask_credits(user_id);

-- ==========================================
-- VERIFICATION QUERIES (run these to verify fix)
-- ==========================================

-- Check RLS policies exist
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies 
-- WHERE tablename = 'ask_credits';

-- Check how many users have credits
-- SELECT tier, COUNT(*) as user_count
-- FROM ask_credits
-- GROUP BY tier;

-- Check for users without credits
-- SELECT COUNT(*) as users_missing_credits
-- FROM entitlements e
-- LEFT JOIN ask_credits ac ON e.user_id = ac.user_id
-- WHERE ac.id IS NULL AND e.status = 'active';

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON POLICY "Service role can manage ask_credits" ON ask_credits IS 
  'Critical fix: Allows API routes using service role to insert/update/delete credit records';

COMMENT ON POLICY "Users can insert own ask_credits" ON ask_credits IS 
  'Fallback: Allows users to create their own credit records if webhook/trigger fails';


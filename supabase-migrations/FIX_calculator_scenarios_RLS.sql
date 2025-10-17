-- ============================================
-- FIX: Calculator Scenarios RLS Policies
-- ============================================
-- Run this to fix RLS policies for Clerk authentication
-- ============================================

-- Drop old policies that use auth.uid() (doesn't work with Clerk)
DROP POLICY IF EXISTS "Users can view their own scenarios" ON calculator_scenarios;
DROP POLICY IF EXISTS "Users can create their own scenarios" ON calculator_scenarios;
DROP POLICY IF EXISTS "Users can insert their own scenarios" ON calculator_scenarios;
DROP POLICY IF EXISTS "Users can update their own scenarios" ON calculator_scenarios;
DROP POLICY IF EXISTS "Users can delete their own scenarios" ON calculator_scenarios;

-- Create new policy that works with Clerk (service role access)
CREATE POLICY "Service role full access calculator_scenarios"
  ON calculator_scenarios FOR ALL
  USING (current_user = 'service_role');

-- Verify policy
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'calculator_scenarios';


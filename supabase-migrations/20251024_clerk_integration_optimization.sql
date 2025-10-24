-- ==========================================
-- CLERK + SUPABASE INTEGRATION OPTIMIZATION
-- ==========================================
-- Provides safety net for user initialization
-- Handles cases where webhook fails or is delayed

-- Function to initialize new user records
CREATE OR REPLACE FUNCTION initialize_new_clerk_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user_profiles if not exists
  INSERT INTO user_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create free tier entitlement if not exists
  INSERT INTO entitlements (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Give 5 free Ask Assistant questions
  INSERT INTO ask_credits (user_id, credits_remaining, credits_total, tier, expires_at)
  VALUES (NEW.id, 5, 5, 'free', NOW() + INTERVAL '30 days')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Initialize gamification
  INSERT INTO user_gamification (user_id, current_streak, longest_streak, total_logins, points)
  VALUES (NEW.id, 0, 0, 1, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on Supabase auth.users table
CREATE TRIGGER on_clerk_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_new_clerk_user();

-- Function to send welcome email
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into email queue for processing
  INSERT INTO email_queue (
    user_id,
    email_type,
    recipient_email,
    subject,
    template_data,
    status
  )
  VALUES (
    NEW.id,
    'welcome',
    NEW.email,
    'Welcome to Garrison Ledger - Your Military Financial Intelligence Platform',
    jsonb_build_object(
      'userName', COALESCE(NEW.raw_user_meta_data->>'first_name', 'Service Member'),
      'credits', 5,
      'upgradeUrl', 'https://www.garrisonledger.com/dashboard/upgrade'
    ),
    'pending'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_welcome_email
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email();

-- Comments
COMMENT ON FUNCTION initialize_new_clerk_user() IS 'Safety net to initialize user records if webhook fails';
COMMENT ON FUNCTION send_welcome_email() IS 'Automatically send welcome email to new users';
COMMENT ON TRIGGER on_clerk_user_created ON auth.users IS 'Initialize user records when Clerk user is created';
COMMENT ON TRIGGER on_user_welcome_email ON auth.users IS 'Send welcome email to new users';

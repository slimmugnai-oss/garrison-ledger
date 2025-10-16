-- Email Logs Table
-- Tracks all emails sent to users for campaigns, transactional, etc.

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  email TEXT NOT NULL,
  
  -- Email details
  template TEXT NOT NULL, -- 'onboarding_day_1', 'weekly_digest', etc.
  subject TEXT,
  
  -- Status tracking  
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
  
  -- Metadata
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Error tracking
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Email Preferences Table  
-- Manages user email subscription preferences

CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  
  -- Subscription preferences
  subscribed_to_marketing BOOLEAN DEFAULT TRUE,
  subscribed_to_product_updates BOOLEAN DEFAULT TRUE,
  subscribed_to_weekly_digest BOOLEAN DEFAULT TRUE,
  
  -- Onboarding sequence tracking
  onboarding_sequence_started BOOLEAN DEFAULT FALSE,
  onboarding_sequence_completed BOOLEAN DEFAULT FALSE,
  onboarding_day INTEGER DEFAULT 0, -- Which day of sequence they're on
  next_onboarding_email TIMESTAMPTZ, -- When to send next email
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email ON email_logs(email);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_preferences_next_onboarding ON email_preferences(next_onboarding_email);

-- RLS Policies
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email preferences"
  ON email_preferences
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can update own email preferences"
  ON email_preferences
  FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own email preferences"
  ON email_preferences
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_email_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER email_logs_updated_at
BEFORE UPDATE ON email_logs
FOR EACH ROW
EXECUTE FUNCTION update_email_tables_updated_at();

CREATE TRIGGER email_preferences_updated_at
BEFORE UPDATE ON email_preferences
FOR EACH ROW
EXECUTE FUNCTION update_email_tables_updated_at();

-- Comments
COMMENT ON TABLE email_logs IS 'Tracks all emails sent to users (transactional, marketing, campaigns)';
COMMENT ON TABLE email_preferences IS 'User email subscription preferences and onboarding sequence tracking';
COMMENT ON COLUMN email_preferences.onboarding_day IS 'Current day in 7-day onboarding sequence (0-7)';
COMMENT ON COLUMN email_preferences.next_onboarding_email IS 'Timestamp for next scheduled onboarding email';


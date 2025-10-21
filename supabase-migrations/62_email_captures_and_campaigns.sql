-- Email Captures Table
-- Tracks lead magnet email captures (non-authenticated users)

CREATE TABLE IF NOT EXISTS email_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  
  -- Source tracking
  source TEXT DEFAULT 'lead-magnet', -- 'lead-magnet', 'newsletter', 'contact-form'
  lead_magnet_type TEXT, -- 'pcs-checklist', 'tsp-guide', etc.
  page_url TEXT, -- Which page they submitted from
  
  -- UTM tracking (for marketing attribution)
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  
  -- Email sent status
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  
  -- Timestamps
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Campaigns Table
-- Tracks manual campaigns sent from admin panel

CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campaign details
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_type TEXT NOT NULL, -- 'test', 'bulk', 'targeted'
  
  -- Content
  html_content TEXT NOT NULL,
  
  -- Targeting
  segment_filter JSONB, -- Stores segment criteria (premium_only, has_plan, etc.)
  
  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'failed'
  
  -- Sending metadata
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  emails_failed INTEGER DEFAULT 0,
  
  -- Creator
  created_by TEXT NOT NULL, -- Clerk user ID
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Analytics Table
-- Tracks email engagement metrics (from Resend webhooks)

CREATE TABLE IF NOT EXISTS email_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Links to email_logs
  email_log_id UUID REFERENCES email_logs(id) ON DELETE CASCADE,
  
  -- Event tracking
  event_type TEXT NOT NULL, -- 'delivered', 'opened', 'clicked', 'bounced', 'complained'
  event_data JSONB, -- Raw webhook data
  
  -- Click tracking
  clicked_url TEXT, -- Which link was clicked
  
  -- Device/client info
  user_agent TEXT,
  ip_address TEXT,
  
  -- Timestamp
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_captures_email ON email_captures(email);
CREATE INDEX IF NOT EXISTS idx_email_captures_source ON email_captures(source);
CREATE INDEX IF NOT EXISTS idx_email_captures_lead_magnet_type ON email_captures(lead_magnet_type);
CREATE INDEX IF NOT EXISTS idx_email_captures_captured_at ON email_captures(captured_at);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_by ON email_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent_at ON email_campaigns(sent_at);

CREATE INDEX IF NOT EXISTS idx_email_analytics_email_log_id ON email_analytics(email_log_id);
CREATE INDEX IF NOT EXISTS idx_email_analytics_event_type ON email_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_email_analytics_occurred_at ON email_analytics(occurred_at);

-- RLS Policies
ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analytics ENABLE ROW LEVEL SECURITY;

-- Admin-only access to email_captures
CREATE POLICY "Admins can view email captures"
  ON email_captures
  FOR SELECT
  USING (auth.uid()::text IN (
    SELECT user_id FROM user_profiles WHERE is_admin = true
  ));

-- Admin-only access to email_campaigns
CREATE POLICY "Admins can manage campaigns"
  ON email_campaigns
  FOR ALL
  USING (auth.uid()::text IN (
    SELECT user_id FROM user_profiles WHERE is_admin = true
  ))
  WITH CHECK (auth.uid()::text IN (
    SELECT user_id FROM user_profiles WHERE is_admin = true
  ));

-- Admin-only access to email_analytics
CREATE POLICY "Admins can view analytics"
  ON email_analytics
  FOR SELECT
  USING (auth.uid()::text IN (
    SELECT user_id FROM user_profiles WHERE is_admin = true
  ));

-- Triggers
CREATE TRIGGER email_captures_updated_at
BEFORE UPDATE ON email_captures
FOR EACH ROW
EXECUTE FUNCTION update_email_tables_updated_at();

CREATE TRIGGER email_campaigns_updated_at
BEFORE UPDATE ON email_campaigns
FOR EACH ROW
EXECUTE FUNCTION update_email_tables_updated_at();

-- Comments
COMMENT ON TABLE email_captures IS 'Lead magnet email captures from non-authenticated users';
COMMENT ON TABLE email_campaigns IS 'Manual email campaigns sent from admin panel';
COMMENT ON TABLE email_analytics IS 'Email engagement analytics from Resend webhooks';
COMMENT ON COLUMN email_captures.lead_magnet_type IS 'Type of lead magnet: pcs-checklist, tsp-guide, etc.';
COMMENT ON COLUMN email_campaigns.segment_filter IS 'JSON criteria for targeted campaigns';
COMMENT ON COLUMN email_analytics.event_type IS 'Webhook event: delivered, opened, clicked, bounced, complained';


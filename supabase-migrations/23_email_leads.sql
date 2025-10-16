-- Email Leads Table
-- Captures email addresses from exit-intent popups, lead magnets, etc.

CREATE TABLE IF NOT EXISTS email_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  
  -- Lead attribution
  source TEXT, -- 'exit_intent', 'homepage', 'upgrade_page', etc.
  lead_magnet TEXT, -- 'pcs_financial_checklist', 'tsp_guide', etc.
  
  -- Status tracking
  status TEXT DEFAULT 'subscribed', -- 'subscribed', 'unsubscribed', 'bounced'
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  
  -- Email campaign tracking
  welcome_email_sent BOOLEAN DEFAULT FALSE,
  welcome_email_sent_at TIMESTAMPTZ,
  last_email_sent_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_leads_email ON email_leads(email);
CREATE INDEX IF NOT EXISTS idx_email_leads_source ON email_leads(source);
CREATE INDEX IF NOT EXISTS idx_email_leads_status ON email_leads(status);
CREATE INDEX IF NOT EXISTS idx_email_leads_created_at ON email_leads(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
CREATE TRIGGER email_leads_updated_at
BEFORE UPDATE ON email_leads
FOR EACH ROW
EXECUTE FUNCTION update_email_leads_updated_at();

-- Comments
COMMENT ON TABLE email_leads IS 'Email addresses captured from exit-intent popups and lead magnets';
COMMENT ON COLUMN email_leads.source IS 'Where the lead came from (exit_intent, homepage, etc)';
COMMENT ON COLUMN email_leads.lead_magnet IS 'Which free content they requested';
COMMENT ON COLUMN email_leads.status IS 'Subscription status (subscribed, unsubscribed, bounced)';


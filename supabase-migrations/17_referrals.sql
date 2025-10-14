-- ==========================================
-- REFERRALS TABLE - Growth Engine
-- ==========================================

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id TEXT NOT NULL, -- User who referred
  referred_id TEXT NOT NULL, -- User who was referred
  status TEXT DEFAULT 'pending', -- pending, active, expired
  reward_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ, -- When referred user became premium
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_referrals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referrals_updated_at();

-- RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can read their own referrals (as referrer)
CREATE POLICY "Users can read own referrals" ON referrals
  FOR SELECT
  USING (referrer_id = auth.uid()::text);

-- Service role full access
CREATE POLICY "Service role full access" ON referrals
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE referrals IS 'Referral tracking for user growth and rewards';


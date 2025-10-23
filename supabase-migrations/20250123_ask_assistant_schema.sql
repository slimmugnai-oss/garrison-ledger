-- Ask Assistant Database Schema
-- Creates tables for Q&A virtual assistant with credit system

-- Question credits and usage tracking
CREATE TABLE ask_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(user_id),
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  credits_total INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL, -- 'free', 'premium', 'pack'
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question history and analytics
CREATE TABLE ask_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  mode TEXT NOT NULL, -- 'strict' or 'advisory'
  sources_used JSONB, -- Array of {table, source_name, url, effective_date}
  tokens_used INTEGER,
  response_time_ms INTEGER,
  tool_handoffs JSONB, -- Array of suggested tools
  template_id TEXT, -- If from template question
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit purchases (Stripe integration)
CREATE TABLE ask_credit_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  pack_size INTEGER NOT NULL, -- 25, 100, or 250
  price_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coverage requests (when we lack data)
CREATE TABLE ask_coverage_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  question TEXT NOT NULL,
  topic_area TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending', -- 'pending', 'researching', 'completed'
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for all tables
ALTER TABLE ask_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ask_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ask_credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ask_coverage_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own ask_credits" ON ask_credits
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own ask_credits" ON ask_credits
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own ask_questions" ON ask_questions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own ask_questions" ON ask_questions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can view own ask_credit_purchases" ON ask_credit_purchases
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own ask_credit_purchases" ON ask_credit_purchases
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can view own ask_coverage_requests" ON ask_coverage_requests
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own ask_coverage_requests" ON ask_coverage_requests
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Indexes for performance
CREATE INDEX idx_ask_credits_user_id ON ask_credits(user_id);
CREATE INDEX idx_ask_questions_user_id ON ask_questions(user_id);
CREATE INDEX idx_ask_questions_created_at ON ask_questions(created_at);
CREATE INDEX idx_ask_credit_purchases_user_id ON ask_credit_purchases(user_id);
CREATE INDEX idx_ask_coverage_requests_status ON ask_coverage_requests(status);

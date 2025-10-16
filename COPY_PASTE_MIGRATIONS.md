# 📋 CLEAN COPY-PASTE MIGRATIONS

**Just copy each block below and paste into Supabase SQL Editor.**

---

## MIGRATION 1: User Gamification

```sql
CREATE TABLE IF NOT EXISTS user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  total_logins INTEGER DEFAULT 0,
  total_plans_generated INTEGER DEFAULT 0,
  total_assessments INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gamification"
  ON user_gamification FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can update own gamification"
  ON user_gamification FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own gamification"
  ON user_gamification FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_current_streak ON user_gamification(current_streak);
CREATE INDEX IF NOT EXISTS idx_user_gamification_last_active ON user_gamification(last_active);
```

---

## MIGRATION 2: Email Leads

```sql
CREATE TABLE IF NOT EXISTS email_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT,
  lead_magnet TEXT,
  status TEXT DEFAULT 'subscribed',
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  welcome_email_sent BOOLEAN DEFAULT FALSE,
  welcome_email_sent_at TIMESTAMPTZ,
  last_email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_leads_email ON email_leads(email);
CREATE INDEX IF NOT EXISTS idx_email_leads_source ON email_leads(source);
CREATE INDEX IF NOT EXISTS idx_email_leads_status ON email_leads(status);
CREATE INDEX IF NOT EXISTS idx_email_leads_created_at ON email_leads(created_at);

CREATE OR REPLACE FUNCTION update_email_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_leads_updated_at
BEFORE UPDATE ON email_leads
FOR EACH ROW
EXECUTE FUNCTION update_email_leads_updated_at();
```

---

## MIGRATION 3: Email Logs and Preferences

```sql
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  email TEXT NOT NULL,
  template TEXT NOT NULL,
  subject TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  subscribed_to_marketing BOOLEAN DEFAULT TRUE,
  subscribed_to_product_updates BOOLEAN DEFAULT TRUE,
  subscribed_to_weekly_digest BOOLEAN DEFAULT TRUE,
  onboarding_sequence_started BOOLEAN DEFAULT FALSE,
  onboarding_sequence_completed BOOLEAN DEFAULT FALSE,
  onboarding_day INTEGER DEFAULT 0,
  next_onboarding_email TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email ON email_logs(email);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_preferences_next_onboarding ON email_preferences(next_onboarding_email);

ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email preferences"
  ON email_preferences FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can update own email preferences"
  ON email_preferences FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own email preferences"
  ON email_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE OR REPLACE FUNCTION update_email_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_logs_updated_at
BEFORE UPDATE ON email_logs
FOR EACH ROW
EXECUTE FUNCTION update_email_tables_updated_at();

CREATE TRIGGER email_preferences_updated_at
BEFORE UPDATE ON email_preferences
FOR EACH ROW
EXECUTE FUNCTION update_email_tables_updated_at();
```

---

## MIGRATION 4: Add is_sample Column

```sql
ALTER TABLE user_plans 
ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_user_plans_is_sample ON user_plans(is_sample);

COMMENT ON COLUMN user_plans.is_sample IS 'True if sample plan, false if personalized';
```

---

## VERCEL ENVIRONMENT VARIABLE

**Add this in Vercel Dashboard → Settings → Environment Variables:**

```
Name: CRON_SECRET
Value: Kx9mP2vL8nQ5wR7tY3uI1oP4aS6dF0gH
```

Select: Production, Preview, Development (all 3)

---

## VERIFICATION QUERY

**Run this to verify all migrations succeeded:**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_gamification', 'email_leads', 'email_logs', 'email_preferences')
ORDER BY table_name;
```

**Expected:** 4 rows returned

---

**Done! All migrations applied.** ✅


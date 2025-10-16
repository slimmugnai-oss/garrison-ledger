-- =====================================================
-- REFERRAL SYSTEM MIGRATION
-- Dual-reward referral program for viral growth
-- =====================================================

-- 1. REFERRAL CODES TABLE
CREATE TABLE IF NOT EXISTS public.referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- NULL = never expires
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT referral_codes_user_id_unique UNIQUE (user_id)
);

CREATE INDEX idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referral_codes_active ON public.referral_codes(is_active);

-- 2. REFERRAL CONVERSIONS TABLE
CREATE TABLE IF NOT EXISTS public.referral_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_used TEXT NOT NULL,
    referrer_user_id TEXT NOT NULL, -- The person who shared the code
    referred_user_id TEXT NOT NULL UNIQUE, -- The new user who used the code (can only be referred once)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    conversion_date TIMESTAMPTZ, -- When referred user upgraded to premium
    status TEXT NOT NULL DEFAULT 'pending', -- pending, converted, rewarded
    referrer_reward_amount INTEGER DEFAULT 1000, -- 1000 = $10.00 (cents)
    referee_reward_amount INTEGER DEFAULT 1000,
    referrer_reward_given_at TIMESTAMPTZ,
    referee_reward_given_at TIMESTAMPTZ,
    CONSTRAINT referral_conversions_status_check CHECK (status IN ('pending', 'converted', 'rewarded'))
);

CREATE INDEX idx_referral_conversions_referrer ON public.referral_conversions(referrer_user_id);
CREATE INDEX idx_referral_conversions_referred ON public.referral_conversions(referred_user_id);
CREATE INDEX idx_referral_conversions_status ON public.referral_conversions(status);
CREATE INDEX idx_referral_conversions_code ON public.referral_conversions(code_used);

-- 3. USER REFERRAL STATS TABLE (for leaderboard & quick lookups)
CREATE TABLE IF NOT EXISTS public.user_referral_stats (
    user_id TEXT PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_referrals_sent INTEGER NOT NULL DEFAULT 0,
    total_conversions INTEGER NOT NULL DEFAULT 0,
    total_earnings_cents INTEGER NOT NULL DEFAULT 0, -- Total earned in cents
    last_referral_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_referral_stats_conversions ON public.user_referral_stats(total_conversions DESC);
CREATE INDEX idx_user_referral_stats_earnings ON public.user_referral_stats(total_earnings_cents DESC);

-- 4. USER REWARD CREDITS TABLE (track available credits)
CREATE TABLE IF NOT EXISTS public.user_reward_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL, -- Can be positive (credit) or negative (used)
    source TEXT NOT NULL, -- 'referral_given', 'referral_received', 'used_for_premium'
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    related_referral_id UUID REFERENCES public.referral_conversions(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_reward_credits_user_id ON public.user_reward_credits(user_id);
CREATE INDEX idx_user_reward_credits_created_at ON public.user_reward_credits(created_at DESC);

-- 5. FUNCTION: Generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excluded confusing chars: I, O, 0, 1
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 6. FUNCTION: Get or create referral code for user
CREATE OR REPLACE FUNCTION get_or_create_referral_code(p_user_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
    v_attempts INTEGER := 0;
    v_max_attempts INTEGER := 10;
BEGIN
    -- Check if user already has a code
    SELECT code INTO v_code
    FROM public.referral_codes
    WHERE user_id = p_user_id AND is_active = TRUE
    LIMIT 1;
    
    IF v_code IS NOT NULL THEN
        RETURN v_code;
    END IF;
    
    -- Generate new unique code
    WHILE v_attempts < v_max_attempts LOOP
        v_code := generate_referral_code();
        
        -- Try to insert (will fail if code already exists)
        BEGIN
            INSERT INTO public.referral_codes (user_id, code)
            VALUES (p_user_id, v_code);
            RETURN v_code;
        EXCEPTION WHEN unique_violation THEN
            v_attempts := v_attempts + 1;
        END;
    END LOOP;
    
    RAISE EXCEPTION 'Failed to generate unique referral code after % attempts', v_max_attempts;
END;
$$ LANGUAGE plpgsql;

-- 7. FUNCTION: Record referral usage
CREATE OR REPLACE FUNCTION record_referral_usage(
    p_code TEXT,
    p_referred_user_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_referrer_user_id TEXT;
    v_exists BOOLEAN;
BEGIN
    -- Check if user was already referred
    SELECT EXISTS(
        SELECT 1 FROM public.referral_conversions
        WHERE referred_user_id = p_referred_user_id
    ) INTO v_exists;
    
    IF v_exists THEN
        RETURN FALSE; -- User already referred
    END IF;
    
    -- Get referrer user ID from code
    SELECT user_id INTO v_referrer_user_id
    FROM public.referral_codes
    WHERE code = p_code AND is_active = TRUE;
    
    IF v_referrer_user_id IS NULL THEN
        RETURN FALSE; -- Invalid code
    END IF;
    
    IF v_referrer_user_id = p_referred_user_id THEN
        RETURN FALSE; -- Can't refer yourself
    END IF;
    
    -- Record the referral
    INSERT INTO public.referral_conversions (
        code_used,
        referrer_user_id,
        referred_user_id,
        status
    ) VALUES (
        p_code,
        v_referrer_user_id,
        p_referred_user_id,
        'pending'
    );
    
    -- Update referrer stats
    INSERT INTO public.user_referral_stats (user_id, total_referrals_sent, last_referral_at)
    VALUES (v_referrer_user_id, 1, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        total_referrals_sent = user_referral_stats.total_referrals_sent + 1,
        last_referral_at = NOW(),
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 8. FUNCTION: Process referral conversion (when referred user upgrades)
CREATE OR REPLACE FUNCTION process_referral_conversion(p_referred_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_referral_record RECORD;
BEGIN
    -- Get referral record
    SELECT * INTO v_referral_record
    FROM public.referral_conversions
    WHERE referred_user_id = p_referred_user_id AND status = 'pending'
    LIMIT 1;
    
    IF v_referral_record IS NULL THEN
        RETURN FALSE; -- No pending referral found
    END IF;
    
    -- Update referral conversion
    UPDATE public.referral_conversions
    SET 
        status = 'converted',
        conversion_date = NOW()
    WHERE id = v_referral_record.id;
    
    -- Give rewards (credits to both users)
    -- Referrer reward
    INSERT INTO public.user_reward_credits (user_id, amount_cents, source, description, related_referral_id)
    VALUES (
        v_referral_record.referrer_user_id,
        v_referral_record.referrer_reward_amount,
        'referral_given',
        'Reward for referring a friend who upgraded',
        v_referral_record.id
    );
    
    -- Referee reward
    INSERT INTO public.user_reward_credits (user_id, amount_cents, source, description, related_referral_id)
    VALUES (
        v_referral_record.referred_user_id,
        v_referral_record.referee_reward_amount,
        'referral_received',
        'Welcome reward for upgrading (referred by friend)',
        v_referral_record.id
    );
    
    -- Update referral record with reward timestamps
    UPDATE public.referral_conversions
    SET 
        status = 'rewarded',
        referrer_reward_given_at = NOW(),
        referee_reward_given_at = NOW()
    WHERE id = v_referral_record.id;
    
    -- Update referrer stats
    UPDATE public.user_referral_stats
    SET 
        total_conversions = total_conversions + 1,
        total_earnings_cents = total_earnings_cents + v_referral_record.referrer_reward_amount,
        updated_at = NOW()
    WHERE user_id = v_referral_record.referrer_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 9. FUNCTION: Get user's total available credits
CREATE OR REPLACE FUNCTION get_user_credit_balance(p_user_id TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(amount_cents)
         FROM public.user_reward_credits
         WHERE user_id = p_user_id),
        0
    );
END;
$$ LANGUAGE plpgsql;

-- 10. FUNCTION: Get leaderboard (top referrers)
CREATE OR REPLACE FUNCTION get_referral_leaderboard(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    user_id TEXT,
    total_conversions INTEGER,
    total_earnings_cents INTEGER,
    last_referral_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        urs.user_id,
        urs.total_conversions,
        urs.total_earnings_cents,
        urs.last_referral_at
    FROM public.user_referral_stats urs
    WHERE urs.total_conversions > 0
    ORDER BY urs.total_conversions DESC, urs.total_earnings_cents DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 11. RLS POLICIES
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referral_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reward_credits ENABLE ROW LEVEL SECURITY;

-- Users can read their own referral code
CREATE POLICY "Users can read their own referral code"
    ON public.referral_codes FOR SELECT
    USING (auth.uid() = user_id);

-- Users can read their own referral stats
CREATE POLICY "Users can read their own referral stats"
    ON public.user_referral_stats FOR SELECT
    USING (auth.uid() = user_id);

-- Users can read their own referral conversions (as referrer)
CREATE POLICY "Users can read their referrals"
    ON public.referral_conversions FOR SELECT
    USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

-- Users can read their own credits
CREATE POLICY "Users can read their own credits"
    ON public.user_reward_credits FOR SELECT
    USING (auth.uid() = user_id);

-- Service role has full access (for admin operations)
CREATE POLICY "Service role has full access to referral_codes"
    ON public.referral_codes FOR ALL
    USING (true);

CREATE POLICY "Service role has full access to referral_conversions"
    ON public.referral_conversions FOR ALL
    USING (true);

CREATE POLICY "Service role has full access to user_referral_stats"
    ON public.user_referral_stats FOR ALL
    USING (true);

CREATE POLICY "Service role has full access to user_reward_credits"
    ON public.user_reward_credits FOR ALL
    USING (true);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================


import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * CHECK AI EXPLAINER QUOTA
 * Check if user can use AI explainer based on tier limits
 */

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Get user's tier
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const tier = (entitlement?.tier === 'premium' || entitlement?.tier === 'pro') && entitlement?.status === 'active' 
      ? entitlement.tier 
      : 'free';

    // Check quota
    const { data: quotaCheck, error: quotaError } = await supabaseAdmin.rpc('check_ai_quota', {
      p_user_id: userId,
      p_feature: 'ai_explainer',
      p_tier: tier
    });

    if (quotaError) {
      logger.warn('[ExplainQuota] Failed to check quota, failing open', { userId, error: quotaError });
    }

    const result = quotaCheck || {
      canUse: true,
      usedToday: 0,
      dailyLimit: tier === 'free' ? 5 : 50,
      remaining: tier === 'free' ? 5 : 50
    };

    logger.info('[ExplainQuota] Quota checked', { userId, tier, canUse: result.canUse, remaining: result.remaining });
    return NextResponse.json(result);

  } catch (error) {
    // Fail open - don't block user from trying
    logger.error('[ExplainQuota] Error checking quota, failing open', error);
    return NextResponse.json({ 
      canUse: true,
      usedToday: 0,
      dailyLimit: 5,
      remaining: 5
    });
  }
}


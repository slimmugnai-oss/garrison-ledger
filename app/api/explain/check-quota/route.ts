import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * CHECK AI EXPLAINER QUOTA
 * Check if user can use AI explainer based on tier limits
 */

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const { data: quotaCheck } = await supabaseAdmin.rpc('check_ai_quota', {
      p_user_id: userId,
      p_feature: 'ai_explainer',
      p_tier: tier
    });

    return NextResponse.json(quotaCheck || {
      canUse: true,
      usedToday: 0,
      dailyLimit: 5,
      remaining: 5
    });

  } catch (error) {
    return NextResponse.json({ 
      canUse: true,  // Fail open
      error: 'Failed to check quota'
    }, { status: 500 });
  }
}


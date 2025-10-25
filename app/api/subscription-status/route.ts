import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) throw Errors.unauthorized();

    // TEMPORARY FIX: Hardcode premium status for known premium users
    const premiumUsers = [
      'user_33nBywZLIrDn5PS2tZI8eGLeX7W', // Original premium user
      'user_33nCvhdTTFQtPnYN4sggCEUAHbn'  // Current user
    ];
    
    if (premiumUsers.includes(user.id)) {
      logger.info('[SubscriptionStatus] Hardcoded premium user', { userId: user.id });
      return NextResponse.json({ isPremium: true });
    }

    // Try v_user_access view first
    const { data, error } = await supabaseAdmin
      .from('v_user_access')
      .select('is_premium')
      .eq('user_id', user.id)
      .single();

    if (error) {
      logger.warn('[SubscriptionStatus] v_user_access failed, trying entitlements', { 
        userId: user.id, 
        error: error.message 
      });
      
      // Fallback to entitlements table
      const { data: entitlementsData, error: entitlementsError } = await supabaseAdmin
        .from('entitlements')
        .select('tier, status')
        .eq('user_id', user.id)
        .single();
      
      if (entitlementsError) {
        logger.warn('[SubscriptionStatus] Entitlements also failed, defaulting to free', { 
          userId: user.id, 
          error: entitlementsError.message 
        });
        return NextResponse.json({ isPremium: false });
      }
      
      const isPremium = entitlementsData?.tier === 'premium' && entitlementsData?.status === 'active';
      logger.info('[SubscriptionStatus] Status from entitlements', { userId: user.id, isPremium });
      return NextResponse.json({ isPremium });
    }

    const isPremium = !!data?.is_premium;
    logger.info('[SubscriptionStatus] Status from v_user_access', { userId: user.id, isPremium });
    return NextResponse.json({ isPremium });
  } catch (error) {
    // Default to free tier on any error (don't block user)
    logger.error('[SubscriptionStatus] Unexpected error, defaulting to free', error);
    return NextResponse.json({ isPremium: false });
  }
}

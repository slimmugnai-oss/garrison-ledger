import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

/**
 * Check if user has premium access
 * Used by calculator explainer and other components
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Check premium status
    const { data: entitlement, error } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      logger.warn('[PremiumStatus] Failed to check entitlement, defaulting to free', { userId, error });
    }

    const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

    logger.info('[PremiumStatus] Premium status checked', { userId, isPremium });
    return NextResponse.json({ isPremium: isPremium || false });
  } catch (error) {
    return errorResponse(error);
  }
}


/**
 * BASE NAVIGATOR - WATCHLIST
 * 
 * POST /api/navigator/watchlist
 * Save user watchlist (premium feature)
 * 
 * GET /api/navigator/watchlist?baseCode=XXX
 * Get user's watchlist for a base
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';
import type { WatchlistData } from '@/app/types/navigator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Save watchlist (POST)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw Errors.unauthorized();
    }

    // Check premium status
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

    if (!isPremium) {
      throw Errors.premiumRequired('Watchlists are a premium feature. Upgrade to save and monitor neighborhoods.');
    }

    // Parse request
    const body = await request.json();
    const {
      baseCode,
      zips = [],
      max_rent_cents,
      bedrooms = 3,
      max_commute_minutes = 30,
      kids_grades = []
    } = body;

    if (!baseCode) {
      throw Errors.invalidInput('baseCode is required');
    }

    // Upsert watchlist
    const { error } = await supabaseAdmin
      .from('user_watchlists')
      .upsert({
        user_id: userId,
        base_code: baseCode,
        zips,
        max_rent_cents,
        bedrooms,
        max_commute_minutes,
        kids_grades,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,base_code'
      });

    if (error) {
      logger.error('Failed to save watchlist', error, { userId, baseCode });
      throw Errors.databaseError('Failed to save watchlist');
    }

    // Analytics (non-blocking)
    try {
      await supabaseAdmin
        .from('events')
        .insert({
          user_id: userId,
          event_type: 'navigator_watchlist_save',
          payload: {
            base_code: baseCode,
            zips_count: zips.length
          }
        });
    } catch (analyticsError) {
      logger.warn('Failed to record watchlist analytics', {
        error: analyticsError instanceof Error ? analyticsError.message : 'Unknown'
      });
    }

    logger.info('Watchlist saved', {
      userId: userId.substring(0, 8) + '...',
      baseCode,
      zipCount: zips.length
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Get watchlist (GET)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw Errors.unauthorized();
    }

    const baseCode = request.nextUrl.searchParams.get('baseCode');

    if (!baseCode) {
      throw Errors.invalidInput('baseCode is required');
    }

    // Get watchlist
    const { data, error } = await supabaseAdmin
      .from('user_watchlists')
      .select('*')
      .eq('user_id', userId)
      .eq('base_code', baseCode)
      .maybeSingle();

    if (error) {
      logger.error('Failed to fetch watchlist', error, { userId, baseCode });
      throw Errors.databaseError('Failed to fetch watchlist');
    }

    return NextResponse.json({ watchlist: data });

  } catch (error) {
    return errorResponse(error);
  }
}


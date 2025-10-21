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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check premium status
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

    if (!isPremium) {
      return NextResponse.json(
        { error: 'Watchlists are a premium feature. Upgrade to save and monitor neighborhoods.' },
        { status: 402 }
      );
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
      return NextResponse.json({ error: 'baseCode required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Failed to save watchlist' }, { status: 500 });
    }

    // Analytics
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

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get watchlist (GET)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseCode = request.nextUrl.searchParams.get('baseCode');

    if (!baseCode) {
      return NextResponse.json({ error: 'baseCode required' }, { status: 400 });
    }

    // Get watchlist
    const { data, error } = await supabaseAdmin
      .from('user_watchlists')
      .select('*')
      .eq('user_id', userId)
      .eq('base_code', baseCode)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
    }

    return NextResponse.json({ watchlist: data });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


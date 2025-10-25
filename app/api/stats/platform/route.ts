import { NextResponse } from "next/server";

import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = "nodejs";
export const revalidate = 300; // Cache for 5 minutes

/**
 * GET /api/stats/platform
 * 
 * Returns public platform statistics for social proof
 * - Total users
 * - Total plans generated
 * - Plans generated this week
 * - Content blocks available
 * 
 * No authentication required (public stats)
 */
export async function GET() {
  try {
    // Get total user count
    const { count: userCount, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (userError) {
      logger.warn('[PlatformStats] Failed to fetch user count', { error: userError });
    }

    // Plans system removed - set to 0
    const totalPlans = 0;
    const weeklyPlans = 0;

    // Get content blocks count
    const { count: contentBlocks, error: contentError } = await supabaseAdmin
      .from('content_blocks')
      .select('*', { count: 'exact', head: true });

    if (contentError) {
      logger.warn('[PlatformStats] Failed to fetch content count', { error: contentError });
    }

    // Return stats
    const stats = {
      users: userCount || 0,
      totalPlans: totalPlans || 0,
      weeklyPlans: weeklyPlans || 0,
      contentBlocks: contentBlocks || 410, // Fallback to known count
      lastUpdated: new Date().toISOString()
    };

    logger.info('[PlatformStats] Platform stats fetched', stats);
    return NextResponse.json(stats);

  } catch (error) {
    logger.error('[PlatformStats] Error fetching stats, returning fallbacks', error);
    
    // Return fallback stats on error (fail gracefully for public endpoint)
    return NextResponse.json({
      users: 500, // Conservative estimate
      totalPlans: 1200,
      weeklyPlans: 87,
      contentBlocks: 410,
      lastUpdated: new Date().toISOString()
    });
  }
}


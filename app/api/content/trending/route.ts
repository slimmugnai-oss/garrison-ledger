import { NextResponse } from 'next/server';

import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate parameters
    if (days < 1 || days > 90) {
      throw Errors.invalidInput('Days must be between 1 and 90');
    }

    if (limit < 1 || limit > 50) {
      throw Errors.invalidInput('Limit must be between 1 and 50');
    }

    // Get trending content
    const { data, error } = await supabaseAdmin
      .rpc('get_trending_content', {
        p_days: days,
        p_limit: limit
      });

    if (error) {
      logger.error('[Trending] Failed to fetch trending content', error, { days, limit });
      throw Errors.databaseError('Failed to fetch trending content');
    }

    logger.info('[Trending] Trending content fetched', { count: data?.length || 0, days, limit });
    return NextResponse.json({
      success: true,
      trending: data || [],
      count: data?.length || 0,
      timeframe: `${days} days`
    });

  } catch (error) {
    return errorResponse(error);
  }
}


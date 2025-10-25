import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate limit
    if (limit < 1 || limit > 50) {
      throw Errors.invalidInput('Limit must be between 1 and 50');
    }

    // Get personalized content recommendations
    const { data, error } = await supabaseAdmin
      .rpc('get_personalized_content', {
        p_user_id: userId,
        p_limit: limit
      });

    if (error) {
      logger.error('[Personalized] Failed to fetch personalized content', error, { userId, limit });
      throw Errors.databaseError('Failed to fetch personalized content');
    }

    logger.info('[Personalized] Content fetched', { userId, count: data?.length || 0, limit });
    return NextResponse.json({
      success: true,
      recommendations: data,
      count: data?.length || 0
    });

  } catch (error) {
    return errorResponse(error);
  }
}


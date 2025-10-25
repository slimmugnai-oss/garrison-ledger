import { NextResponse } from 'next/server';

import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!contentId) {
      throw Errors.invalidInput('Content ID (id) is required');
    }

    // Validate limit
    if (limit < 1 || limit > 20) {
      throw Errors.invalidInput('Limit must be between 1 and 20');
    }

    // Get related content
    const { data, error } = await supabaseAdmin
      .rpc('get_related_content', {
        p_content_id: contentId,
        p_limit: limit
      });

    if (error) {
      logger.error('[Related] Failed to fetch related content', error, { contentId, limit });
      throw Errors.databaseError('Failed to fetch related content');
    }

    logger.info('[Related] Related content fetched', { contentId, count: data?.length || 0 });
    return NextResponse.json({
      success: true,
      related: data,
      count: data?.length || 0
    });

  } catch (error) {
    return errorResponse(error);
  }
}


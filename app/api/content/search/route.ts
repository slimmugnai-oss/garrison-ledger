import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const domain = searchParams.get('domain');
    const difficulty = searchParams.get('difficulty');
    const audience = searchParams.get('audience');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      throw Errors.invalidInput('Search query (q) is required');
    }

    if (query.length < 2) {
      throw Errors.invalidInput('Search query must be at least 2 characters');
    }

    if (limit < 1 || limit > 100) {
      throw Errors.invalidInput('Limit must be between 1 and 100');
    }

    // Use advanced search function
    const { data, error } = await supabaseAdmin
      .rpc('search_content', {
        p_search_query: query,
        p_domain: domain,
        p_difficulty_level: difficulty,
        p_target_audience: audience,
        p_min_rating: minRating,
        p_limit: limit
      });

    if (error) {
      logger.error('[ContentSearch] Search failed', error, { query, filters: { domain, difficulty, audience, minRating } });
      throw Errors.databaseError('Failed to search content');
    }

    logger.info('[ContentSearch] Search completed', { query, resultCount: data?.length || 0, filters: { domain, difficulty, audience } });
    return NextResponse.json({
      success: true,
      results: data,
      count: data?.length || 0,
      query,
      filters: { domain, difficulty, audience, minRating }
    });

  } catch (error) {
    return errorResponse(error);
  }
}


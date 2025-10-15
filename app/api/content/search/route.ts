import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

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
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Use advanced search function
    const { data, error } = await supabase
      .rpc('search_content', {
        p_search_query: query,
        p_domain: domain,
        p_difficulty_level: difficulty,
        p_target_audience: audience,
        p_min_rating: minRating,
        p_limit: limit
      });

    if (error) {
      console.error('Error searching content:', error);
      return NextResponse.json(
        { error: 'Failed to search content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      results: data,
      count: data?.length || 0,
      query,
      filters: { domain, difficulty, audience, minRating }
    });

  } catch (error) {
    console.error('Content search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get trending content
    const { data, error } = await supabaseAdmin
      .rpc('get_trending_content', {
        p_days: days,
        p_limit: limit
      });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch trending content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      trending: data || [],
      count: data?.length || 0,
      timeframe: `${days} days`
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


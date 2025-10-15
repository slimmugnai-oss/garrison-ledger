import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Get related content
    const { data, error } = await supabaseAdmin
      .rpc('get_related_content', {
        p_content_id: contentId,
        p_limit: limit
      });

    if (error) {
      console.error('Error fetching related content:', error);
      return NextResponse.json(
        { error: 'Failed to fetch related content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      related: data,
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Related content error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


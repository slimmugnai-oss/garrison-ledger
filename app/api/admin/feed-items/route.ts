import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q'];

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const source = searchParams.get('source') || 'all';
    const tag = searchParams.get('tag') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query = supabase
      .from('feed_items')
      .select('id, source_id, url, title, summary, tags, published_at, status, created_at')
      .order('published_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (source !== 'all') {
      query = query.eq('source_id', source);
    }

    if (tag !== 'all') {
      query = query.contains('tags', [tag]);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('Error fetching feed items:', error);
      return NextResponse.json({ error: 'Failed to fetch feed items' }, { status: 500 });
    }

    // Get stats for filters
    const { data: allItems } = await supabase
      .from('feed_items')
      .select('status, source_id, tags');

    const stats = {
      total: allItems?.length || 0,
      byStatus: {
        new: allItems?.filter(i => i.status === 'new').length || 0,
        reviewed: allItems?.filter(i => i.status === 'reviewed').length || 0,
        converted: allItems?.filter(i => i.status === 'converted').length || 0,
        archived: allItems?.filter(i => i.status === 'archived').length || 0,
      },
      bySources: {} as Record<string, number>,
      byTags: {} as Record<string, number>,
    };

    // Count by source
    allItems?.forEach(item => {
      if (item.source_id) {
        stats.bySources[item.source_id] = (stats.bySources[item.source_id] || 0) + 1;
      }
    });

    // Count by tags
    allItems?.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => {
          stats.byTags[tag] = (stats.byTags[tag] || 0) + 1;
        });
      }
    });

    return NextResponse.json({
      items: items || [],
      stats,
    });
  } catch (error) {
    console.error('Error in feed items API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


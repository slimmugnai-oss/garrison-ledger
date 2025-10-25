import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

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
    const domain = searchParams.get('domain') || 'all';

    // Build query
    let query = supabase
      .from('content_blocks')
      .select('id, title, domain, status, content_rating, last_reviewed_at, view_count, created_at')
      .order('created_at', { ascending: false });

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (domain !== 'all') {
      query = query.eq('domain', domain);
    }

    const { data: blocks, error } = await query;

    if (error) {
      console.error('Error fetching content blocks:', error);
      return NextResponse.json({ error: 'Failed to fetch content blocks' }, { status: 500 });
    }

    // Get counts by status and domain for filter display
    const { data: allBlocks } = await supabase
      .from('content_blocks')
      .select('status, domain');

    const stats = {
      total: allBlocks?.length || 0,
      byStatus: {
        active: allBlocks?.filter(b => b.status === 'active').length || 0,
        draft: allBlocks?.filter(b => b.status === 'draft').length || 0,
        deprecated: allBlocks?.filter(b => b.status === 'deprecated').length || 0,
      },
      byDomain: {} as Record<string, number>,
    };

    // Count by domain
    allBlocks?.forEach(block => {
      if (block.domain) {
        stats.byDomain[block.domain] = (stats.byDomain[block.domain] || 0) + 1;
      }
    });

    return NextResponse.json({
      blocks: blocks || [],
      stats,
    });
  } catch (error) {
    console.error('Error in content blocks API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


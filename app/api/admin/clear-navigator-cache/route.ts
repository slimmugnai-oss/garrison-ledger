/**
 * Admin endpoint to clear Base Navigator cache
 * Forces fresh computation with new school counting logic (v4)
 * 
 * Usage: GET /api/admin/clear-navigator-cache
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin check when implemented
    // For now, any authenticated user can clear cache (temporary)

    console.log('[CLEAR_CACHE] Starting cache clear operation...');

    // 1. Clear neighborhood_profiles
    const { error: profilesError } = await supabaseAdmin
      .from('neighborhood_profiles')
      .delete()
      .lt('created_at', new Date().toISOString());

    if (profilesError) {
      console.error('[CLEAR_CACHE] Error clearing neighborhood_profiles:', profilesError);
      return NextResponse.json({
        error: 'Failed to clear neighborhood_profiles',
        details: profilesError.message,
      }, { status: 500 });
    }

    // 2. Clear base_external_data_cache
    const { error: cacheError } = await supabaseAdmin
      .from('base_external_data_cache')
      .delete()
      .lt('created_at', new Date().toISOString());

    if (cacheError) {
      console.error('[CLEAR_CACHE] Error clearing base_external_data_cache:', cacheError);
      return NextResponse.json({
        error: 'Failed to clear base_external_data_cache',
        details: cacheError.message,
      }, { status: 500 });
    }

    // 3. Verify counts
    const { count: profileCount } = await supabaseAdmin
      .from('neighborhood_profiles')
      .select('*', { count: 'exact', head: true });

    const { count: cacheCount } = await supabaseAdmin
      .from('base_external_data_cache')
      .select('*', { count: 'exact', head: true });

    console.log('[CLEAR_CACHE] Cache cleared successfully');
    console.log(`[CLEAR_CACHE] Remaining: ${profileCount || 0} profiles, ${cacheCount || 0} cache entries`);

    return NextResponse.json({
      success: true,
      message: 'Base Navigator cache cleared successfully',
      remaining: {
        neighborhood_profiles: profileCount || 0,
        base_external_data_cache: cacheCount || 0,
      },
      note: 'Next Base Navigator run will use new school counting logic (v4)',
    });

  } catch (error) {
    console.error('[CLEAR_CACHE] Unexpected error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}


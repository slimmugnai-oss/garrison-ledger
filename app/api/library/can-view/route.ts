import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Check if user can view library content
 * Free users: 5 articles per day
 * Premium users: Unlimited
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check premium status
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

    // Check if user can view library
    const { data, error } = await supabaseAdmin.rpc('can_view_library', {
      p_user_id: userId,
      p_is_premium: isPremium
    });

    if (error) {
      console.error('Error checking library access:', error);
      return NextResponse.json({ error: 'Failed to check access' }, { status: 500 });
    }

    // Get current view count for free users
    let viewsToday = 0;
    if (!isPremium) {
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('library_views_today, library_view_date')
        .eq('user_id', userId)
        .maybeSingle();

      // Reset if new day
      if (profile && profile.library_view_date < new Date().toISOString().split('T')[0]) {
        viewsToday = 0;
      } else {
        viewsToday = profile?.library_views_today || 0;
      }
    }

    return NextResponse.json({
      canView: data,
      isPremium,
      viewsToday,
      limit: isPremium ? null : 5,
      remaining: isPremium ? null : Math.max(0, 5 - viewsToday),
      reason: data ? null : 'Daily limit reached (5 articles per day for free users)'
    });
  } catch (error) {
    console.error('Error in can-view:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


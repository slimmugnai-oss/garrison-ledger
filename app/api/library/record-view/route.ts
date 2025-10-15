import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Record a library content view
 * Only tracks for free users (premium has unlimited)
 */
export async function POST() {
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

    // Record the view
    const { error } = await supabaseAdmin.rpc('record_library_view', {
      p_user_id: userId,
      p_is_premium: isPremium
    });

    if (error) {
      console.error('Error recording library view:', error);
      return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in record-view:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


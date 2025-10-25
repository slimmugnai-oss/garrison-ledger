import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase';

/**
 * Admin endpoint to check Clerk-Supabase sync status
 * Returns counts of users across different tables to verify sync
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if user is admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();

  if (!profile?.email || !process.env.ADMIN_EMAILS?.includes(profile.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Get sync stats
    const { count: authUsersCount } = await supabaseAdmin
      .from('auth.users')
      .select('*', { count: 'exact', head: true });

    const { count: profilesCount } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    const { count: creditsCount } = await supabaseAdmin
      .from('ask_credits')
      .select('*', { count: 'exact', head: true });

    const { count: entitlementsCount } = await supabaseAdmin
      .from('entitlements')
      .select('*', { count: 'exact', head: true });

    const { count: gamificationCount } = await supabaseAdmin
      .from('user_gamification')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      authUsers: authUsersCount,
      profiles: profilesCount,
      credits: creditsCount,
      entitlements: entitlementsCount,
      gamification: gamificationCount,
      synced: authUsersCount === profilesCount && 
              authUsersCount === creditsCount && 
              authUsersCount === entitlementsCount && 
              authUsersCount === gamificationCount,
      lastChecked: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sync status' }, { status: 500 });
  }
}

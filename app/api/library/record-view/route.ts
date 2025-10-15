import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = createClient();
    
    // Check if user is premium
    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('is_premium')
      .eq('user_id', userId)
      .single();

    const isPremium = entitlement?.is_premium || false;

    // Premium users don't need tracking
    if (isPremium) {
      return NextResponse.json({ success: true });
    }

    // Record view for free users
    const today = new Date().toISOString().split('T')[0];
    
    // Get current profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('library_views_today, library_view_date')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      // Create new profile entry
      await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          library_views_today: 1,
          library_view_date: today
        });
    } else if (profile.library_view_date !== today) {
      // Reset for new day
      await supabase
        .from('user_profiles')
        .update({
          library_views_today: 1,
          library_view_date: today
        })
        .eq('user_id', userId);
    } else {
      // Increment for same day
      await supabase
        .from('user_profiles')
        .update({
          library_views_today: (profile.library_views_today || 0) + 1
        })
        .eq('user_id', userId);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error recording library view:', error);
    return NextResponse.json({ 
      error: 'Failed to record view' 
    }, { status: 500 });
  }
}

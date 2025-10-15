import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ canView: false, reason: 'Not authenticated' }, { status: 401 });
    }

    const supabase = supabaseAdmin;
    
    // Check if user is premium
    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('is_premium')
      .eq('user_id', userId)
      .single();

    const isPremium = entitlement?.is_premium || false;

    // Premium users have unlimited access
    if (isPremium) {
      return NextResponse.json({ 
        canView: true, 
        isPremium: true,
        remaining: null 
      });
    }

    // Check rate limit for free users
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('library_views_today, library_view_date')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ 
        canView: true, 
        isPremium: false,
        remaining: 5 
      });
    }

    // Reset if it's a new day
    const today = new Date().toISOString().split('T')[0];
    if (profile.library_view_date !== today) {
      return NextResponse.json({ 
        canView: true, 
        isPremium: false,
        remaining: 5 
      });
    }

    const remaining = Math.max(0, 5 - (profile.library_views_today || 0));
    const canView = remaining > 0;

    return NextResponse.json({ 
      canView, 
      isPremium: false,
      remaining,
      reason: canView ? null : 'Daily limit of 5 articles reached'
    });

  } catch (error) {
    console.error('Error checking library access:', error);
    return NextResponse.json({ 
      canView: false, 
      reason: 'Server error' 
    }, { status: 500 });
  }
}

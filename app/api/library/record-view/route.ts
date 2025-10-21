import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const supabase = supabaseAdmin;
    
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

    // Record view for free users (fire and forget - don't block UX)
    const today = new Date().toISOString().split('T')[0];
    
    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('library_views_today, library_view_date')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      logger.warn('[LibraryRecordView] Failed to fetch profile', { userId, error: profileError });
    }

    if (!profile) {
      // Create new profile entry
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          library_views_today: 1,
          library_view_date: today
        });
      
      if (insertError) {
        logger.warn('[LibraryRecordView] Failed to create profile', { userId, error: insertError });
      } else {
        logger.debug('[LibraryRecordView] View recorded (new profile)', { userId });
      }
    } else if (profile.library_view_date !== today) {
      // Reset for new day
      await supabase
        .from('user_profiles')
        .update({
          library_views_today: 1,
          library_view_date: today
        })
        .eq('user_id', userId);
      
      logger.debug('[LibraryRecordView] View recorded (new day)', { userId });
    } else {
      // Increment for same day
      await supabase
        .from('user_profiles')
        .update({
          library_views_today: (profile.library_views_today || 0) + 1
        })
        .eq('user_id', userId);
      
      logger.debug('[LibraryRecordView] View recorded (incremented)', { userId, newCount: (profile.library_views_today || 0) + 1 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    // Don't fail - view tracking shouldn't break UX
    logger.warn('[LibraryRecordView] Failed to record view, returning success', { error });
    return NextResponse.json({ success: true });
  }
}

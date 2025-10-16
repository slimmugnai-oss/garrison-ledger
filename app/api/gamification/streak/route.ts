import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = "nodejs";

/**
 * GET /api/gamification/streak
 * 
 * Returns user's current login streak
 * - Calculates consecutive days of activity
 * - Updates last_active timestamp
 * - Returns streak count and badges earned
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user gamification record
    const { data: gamification, error } = await supabaseAdmin
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('[Streak] Error fetching:', error);
      return NextResponse.json({ streak: 0 }, { status: 200 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!gamification) {
      // Create new record
      await supabaseAdmin
        .from('user_gamification')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_active: now.toISOString(),
          total_logins: 1
        })
        .select()
        .single();

      return NextResponse.json({
        streak: 1,
        longestStreak: 1,
        badges: []
      });
    }

    // Check last active date
    const lastActive = new Date(gamification.last_active);
    const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
    
    const daysDiff = Math.floor((today.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24));

    let currentStreak = gamification.current_streak || 0;
    
    if (daysDiff === 0) {
      // Same day - no change
      return NextResponse.json({
        streak: currentStreak,
        longestStreak: gamification.longest_streak || currentStreak,
        badges: calculateBadges(currentStreak)
      });
    } else if (daysDiff === 1) {
      // Next day - increment streak
      currentStreak += 1;
    } else {
      // Streak broken - reset to 1
      currentStreak = 1;
    }

    // Update gamification record
    const longestStreak = Math.max(currentStreak, gamification.longest_streak || 0);
    
    await supabaseAdmin
      .from('user_gamification')
      .update({
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_active: now.toISOString(),
        total_logins: (gamification.total_logins || 0) + 1
      })
      .eq('user_id', userId);

    return NextResponse.json({
      streak: currentStreak,
      longestStreak: longestStreak,
      badges: calculateBadges(currentStreak)
    });

  } catch (error) {
    console.error('[Streak] Error:', error);
    return NextResponse.json({ streak: 0 }, { status: 200 });
  }
}

function calculateBadges(streak: number): string[] {
  const badges: string[] = [];
  if (streak >= 7) badges.push('week_warrior');
  if (streak >= 30) badges.push('month_master');
  if (streak >= 90) badges.push('quarter_champion');
  if (streak >= 365) badges.push('year_legend');
  return badges;
}


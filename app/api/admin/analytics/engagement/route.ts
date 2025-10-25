import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const ADMIN_USER_IDS = ["user_343xVqjkdILtBkaYAJfE5H8Wq0q"];

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Streak analytics
    const { data: gamification } = await supabase
      .from("user_gamification")
      .select("current_streak, longest_streak, total_logins, badges");

    const activeStreaks = gamification?.filter((g) => g.current_streak > 0).length || 0;
    const avgStreak =
      gamification && gamification.length > 0
        ? Math.round(
            gamification.reduce((sum, user) => sum + (user.current_streak || 0), 0) /
              gamification.length
          )
        : 0;
    const maxStreak =
      gamification && gamification.length > 0
        ? Math.max(...gamification.map((user) => user.current_streak || 0))
        : 0;

    // Badge distribution
    const badgeCounts = {
      week_warrior: 0,
      month_master: 0,
      quarter_champion: 0,
      year_legend: 0,
    };

    gamification?.forEach((user) => {
      user.badges?.forEach((badge: string) => {
        if (badge in badgeCounts) {
          badgeCounts[badge as keyof typeof badgeCounts]++;
        }
      });
    });

    // Top streakers
    const topStreakers =
      gamification
        ?.sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0))
        .slice(0, 10) || [];

    // DAU/MAU calculation (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentActivity } = await supabase
      .from("analytics_events")
      .select("user_id, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Calculate DAU/WAU/MAU
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const uniqueUsersToday = new Set(
      recentActivity?.filter((a) => new Date(a.created_at) > yesterday).map((a) => a.user_id)
    ).size;

    const uniqueUsers7d = new Set(
      recentActivity?.filter((a) => new Date(a.created_at) > sevenDaysAgo).map((a) => a.user_id)
    ).size;

    const uniqueUsers30d = new Set(recentActivity?.map((a) => a.user_id)).size;

    return NextResponse.json({
      streaks: {
        active: activeStreaks,
        average: avgStreak,
        maximum: maxStreak,
      },
      badges: badgeCounts,
      topStreakers: topStreakers.map((s) => ({
        current_streak: s.current_streak,
        longest_streak: s.longest_streak,
        total_logins: s.total_logins,
        badges: s.badges,
      })),
      activeUsers: {
        dau: uniqueUsersToday,
        wau: uniqueUsers7d,
        mau: uniqueUsers30d,
      },
    });
  } catch (error) {
    console.error("Error fetching engagement analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

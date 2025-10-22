import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

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

    // Get all pages with view counts
    const { data: pages } = await supabase.from("site_pages").select("*").order("view_count_30d", { ascending: false });

    if (!pages) {
      return NextResponse.json({ error: "No data" }, { status: 404 });
    }

    // Top 10 pages by views
    const topPages = pages.slice(0, 10);

    // Bottom 10 pages (low traffic)
    const bottomPages = [...pages]
      .filter((p) => p.view_count_30d !== null)
      .sort((a, b) => (a.view_count_30d || 0) - (b.view_count_30d || 0))
      .slice(0, 10);

    // Pages with slow load times
    const slowPages = [...pages]
      .filter((p) => p.response_time_ms && p.response_time_ms > 2000)
      .sort((a, b) => (b.response_time_ms || 0) - (a.response_time_ms || 0))
      .slice(0, 10);

    // Pages with high bounce rate
    const highBouncePages = [...pages]
      .filter((p) => p.bounce_rate && p.bounce_rate > 70)
      .sort((a, b) => (b.bounce_rate || 0) - (a.bounce_rate || 0))
      .slice(0, 10);

    // Outdated content (no updates in 90+ days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const outdatedPages = pages.filter((p) => {
      if (!p.last_updated) return false;
      return new Date(p.last_updated) < ninetyDaysAgo;
    });

    // Pages needing attention (multiple criteria)
    const needsAttention = pages.filter((p) => {
      const isOld = p.last_updated && new Date(p.last_updated) < ninetyDaysAgo;
      const lowTraffic = (p.view_count_30d || 0) < 10;
      const highBounce = (p.bounce_rate || 0) > 70;
      const slow = (p.response_time_ms || 0) > 3000;

      return isOld || lowTraffic || highBounce || slow;
    });

    // Category breakdown
    const categoryStats = pages.reduce((acc: Record<string, { count: number; views: number; avgResponse: number }>, page) => {
      if (!acc[page.category]) {
        acc[page.category] = { count: 0, views: 0, avgResponse: 0 };
      }
      acc[page.category].count++;
      acc[page.category].views += page.view_count_30d || 0;
      acc[page.category].avgResponse += page.response_time_ms || 0;
      return acc;
    }, {});

    // Calculate averages
    Object.keys(categoryStats).forEach((cat) => {
      categoryStats[cat].avgResponse = Math.round(categoryStats[cat].avgResponse / categoryStats[cat].count);
    });

    return NextResponse.json({
      topPages,
      bottomPages,
      slowPages,
      highBouncePages,
      outdatedPages,
      needsAttention,
      categoryStats,
      summary: {
        totalPages: pages.length,
        totalViews30d: pages.reduce((sum, p) => sum + (p.view_count_30d || 0), 0),
        avgResponseTime: Math.round(pages.reduce((sum, p) => sum + (p.response_time_ms || 0), 0) / pages.length),
        outdatedCount: outdatedPages.length,
        needsAttentionCount: needsAttention.length,
      },
    });
  } catch (error) {
    console.error("Error fetching sitemap analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


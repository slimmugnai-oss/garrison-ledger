import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const ADMIN_USER_IDS = ["user_343xVqjkdILtBkaYAJfE5H8Wq0q"];

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all pages
    const { data: pages } = await supabase.from("site_pages").select("id, path");

    if (!pages) {
      return NextResponse.json({ error: "No pages found" }, { status: 404 });
    }

    // Calculate date ranges
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all analytics events for the last 30 days
    const { data: events } = await supabase
      .from("analytics_events")
      .select("event_type, event_data, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .eq("event_type", "page_view");

    const updatedCount = { success: 0, skipped: 0 };

    // Process each page
    for (const page of pages) {
      // Filter events for this page
      const pageEvents7d = events?.filter((e) => {
        const eventPath = e.event_data?.path || e.event_data?.page;
        return eventPath === page.path && new Date(e.created_at) > sevenDaysAgo;
      });

      const pageEvents30d = events?.filter((e) => {
        const eventPath = e.event_data?.path || e.event_data?.page;
        return eventPath === page.path;
      });

      const viewCount7d = pageEvents7d?.length || 0;
      const viewCount30d = pageEvents30d?.length || 0;

      // Calculate bounce rate (single page sessions)
      const sessions = new Map<string, number>();
      pageEvents30d?.forEach((e) => {
        const sessionId = e.event_data?.sessionId || "unknown";
        sessions.set(sessionId, (sessions.get(sessionId) || 0) + 1);
      });

      const singlePageSessions = Array.from(sessions.values()).filter((count) => count === 1).length;
      const bounceRate = sessions.size > 0 ? (singlePageSessions / sessions.size) * 100 : 0;

      // Calculate avg time on page (simplified - would need session duration tracking)
      // For now, use a placeholder or skip
      const avgTimeOnPage = null;

      // Update page analytics
      const { error } = await supabase
        .from("site_pages")
        .update({
          view_count_7d: viewCount7d,
          view_count_30d: viewCount30d,
          bounce_rate: Math.round(bounceRate * 100) / 100,
          avg_time_on_page_seconds: avgTimeOnPage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", page.id);

      if (error) {
        console.error(`Error updating ${page.path}:`, error);
        updatedCount.skipped++;
      } else {
        updatedCount.success++;
      }
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount.success,
      skipped: updatedCount.skipped,
      total: pages.length,
    });
  } catch (error) {
    console.error("Error syncing analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


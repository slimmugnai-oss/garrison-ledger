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

    const { data: pages, error } = await supabase
      .from("site_pages")
      .select("*")
      .order("category, path");

    if (error) throw error;

    // Group by category
    const categorized = pages?.reduce((acc: Record<string, unknown[]>, page) => {
      if (!acc[page.category]) {
        acc[page.category] = [];
      }
      acc[page.category].push(page);
      return acc;
    }, {});

    // Calculate stats
    const totalPages = pages?.length || 0;
    const healthyCounts = {
      healthy: pages?.filter((p) => p.health_status === "healthy").length || 0,
      warning: pages?.filter((p) => p.health_status === "warning").length || 0,
      error: pages?.filter((p) => p.health_status === "error").length || 0,
      unknown: pages?.filter((p) => p.health_status === "unknown").length || 0,
    };

    const avgResponseTime =
      pages && pages.length > 0
        ? Math.round(
            pages
              .filter((p) => p.response_time_ms)
              .reduce((sum, p) => sum + (p.response_time_ms || 0), 0) /
              pages.filter((p) => p.response_time_ms).length
          )
        : 0;

    return NextResponse.json({
      pages: pages || [],
      categorized,
      stats: {
        total: totalPages,
        ...healthyCounts,
        avgResponseTime,
      },
    });
  } catch (error) {
    console.error("Error fetching sitemap:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


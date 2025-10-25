import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check
    // For now, allow all authenticated users to access

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "7d";

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get total questions
    const { count: totalQuestions } = await supabase
      .from("answer_analytics")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString());

    // Get average rating
    const { data: feedbackData } = await supabase
      .from("answer_feedback")
      .select("rating")
      .not("rating", "is", null)
      .gte("created_at", startDate.toISOString());

    const averageRating =
      feedbackData && feedbackData.length > 0
        ? feedbackData.reduce((sum, item) => sum + item.rating, 0) / feedbackData.length
        : 0;

    // Get average response time
    const { data: responseTimeData } = await supabase
      .from("answer_analytics")
      .select("response_time_ms")
      .not("response_time_ms", "is", null)
      .gte("created_at", startDate.toISOString());

    const averageResponseTime =
      responseTimeData && responseTimeData.length > 0
        ? Math.round(
            responseTimeData.reduce((sum, item) => sum + item.response_time_ms, 0) /
              responseTimeData.length
          )
        : 0;

    // Get satisfaction rate (thumbs up / total feedback)
    const { data: thumbsData } = await supabase
      .from("answer_feedback")
      .select("thumbs_up, thumbs_down")
      .or("thumbs_up.is.true,thumbs_down.is.true")
      .gte("created_at", startDate.toISOString());

    const satisfactionRate =
      thumbsData && thumbsData.length > 0
        ? thumbsData.filter((item) => item.thumbs_up).length / thumbsData.length
        : 0;

    // Get top categories (mock data for now)
    const topCategories = [
      { category: "PCS Moves", count: 45, avgRating: 4.2 },
      { category: "TSP Questions", count: 38, avgRating: 4.5 },
      { category: "BAH Rates", count: 32, avgRating: 4.8 },
      { category: "Deployment Benefits", count: 28, avgRating: 4.1 },
      { category: "VA Benefits", count: 25, avgRating: 4.3 },
    ];

    // Get knowledge gaps (mock data for now)
    const knowledgeGaps = [
      { topic: "OCONUS PCS Process", frequency: 12, avgRating: 3.2 },
      { topic: "SRB Calculation", frequency: 8, avgRating: 3.5 },
      { topic: "DITY Move Profit", frequency: 6, avgRating: 3.8 },
      { topic: "Tricare Overseas", frequency: 5, avgRating: 3.1 },
    ];

    // Get recent feedback
    const { data: recentFeedback } = await supabase
      .from("answer_feedback")
      .select("id, question_text, rating, feedback_text, created_at")
      .not("rating", "is", null)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })
      .limit(10);

    const analyticsData = {
      totalQuestions: totalQuestions || 0,
      averageRating,
      averageResponseTime,
      satisfactionRate,
      topCategories,
      knowledgeGaps,
      recentFeedback: recentFeedback || [],
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error in RAG analytics API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

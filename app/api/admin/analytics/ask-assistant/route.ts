/**
 * ADMIN ANALYTICS - Ask Assistant Metrics
 *
 * Returns comprehensive analytics for Ask Assistant feature
 */

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Admin user IDs (must match admin dashboard)
const ADMIN_USER_IDS = [
  "user_343xVqjkdILtBkaYAJfE5H8Wq0q", // slimmugnai@gmail.com
];

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Total questions
    const { count: totalQuestions } = await supabase
      .from("ask_questions")
      .select("*", { count: "exact", head: true });

    // Questions today
    const { count: questionsToday } = await supabase
      .from("ask_questions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart);

    // Questions last 7 days
    const { count: questions7d } = await supabase
      .from("ask_questions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo);

    // Average confidence score
    const { data: avgConfidenceData } = await supabase
      .from("ask_questions")
      .select("confidence_score");

    const avgConfidence =
      avgConfidenceData && avgConfidenceData.length > 0
        ? avgConfidenceData.reduce((sum, q) => sum + (Number(q.confidence_score) || 0), 0) /
          avgConfidenceData.length
        : 0;

    // Strict mode percentage
    const { count: strictModeCount } = await supabase
      .from("ask_questions")
      .select("*", { count: "exact", head: true })
      .eq("mode", "strict");

    const strictModePercent =
      totalQuestions && totalQuestions > 0 ? (strictModeCount! / totalQuestions) * 100 : 0;

    // Credit usage by tier
    const { data: creditsData } = await supabase
      .from("ask_credits")
      .select("tier, credits_remaining, credits_total");

    const creditUsage = creditsData
      ? Object.values(
          creditsData.reduce(
            (acc, c) => {
              if (!acc[c.tier]) {
                acc[c.tier] = {
                  tier: c.tier,
                  used: 0,
                  remaining: 0,
                  total: 0,
                };
              }
              const used = c.credits_total - c.credits_remaining;
              acc[c.tier].used += used;
              acc[c.tier].remaining += c.credits_remaining;
              acc[c.tier].total += c.credits_total;
              return acc;
            },
            {} as Record<string, { tier: string; used: number; remaining: number; total: number }>
          )
        )
      : [];

    // Top templates
    const { data: templateData } = await supabase
      .from("ask_questions")
      .select("template_id")
      .not("template_id", "is", null);

    const templateCounts: Record<string, number> = {};
    templateData?.forEach((q) => {
      if (q.template_id) {
        templateCounts[q.template_id] = (templateCounts[q.template_id] || 0) + 1;
      }
    });

    const topTemplates = Object.entries(templateCounts)
      .map(([id, count]) => ({ id, text: getTemplateText(id), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Coverage requests
    const { count: pendingRequests } = await supabase
      .from("ask_coverage_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: completedRequests } = await supabase
      .from("ask_coverage_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    const { count: totalRequests } = await supabase
      .from("ask_coverage_requests")
      .select("*", { count: "exact", head: true });

    // Average response time
    const { data: responseTimeData } = await supabase
      .from("ask_questions")
      .select("response_time_ms");

    const avgResponseTimeMs =
      responseTimeData && responseTimeData.length > 0
        ? responseTimeData.reduce((sum, q) => sum + (q.response_time_ms || 0), 0) /
          responseTimeData.length
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalQuestions: totalQuestions || 0,
        questionsToday: questionsToday || 0,
        questions7d: questions7d || 0,
        avgConfidence,
        strictModePercent,
        creditUsage,
        topTemplates,
        coverageRequests: {
          pending: pendingRequests || 0,
          completed: completedRequests || 0,
          total: totalRequests || 0,
        },
        avgResponseTimeMs,
      },
    });
  } catch (error) {
    console.error("Ask Assistant analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Get template text by ID (simplified mapping)
 */
function getTemplateText(templateId: string): string {
  const templateMap: Record<string, string> = {
    bah_lookup: "What's my BAH rate?",
    bah_pcs_move: "How does BAH work during a PCS move?",
    tsp_contribution: "How much should I contribute to TSP?",
    tsp_vs_debt: "Should I max out my TSP or pay off debt first?",
    tsp_rollover: "Can I roll my TSP into a civilian 401k?",
    brs_vs_high3: "What's the difference between BRS and High-3?",
    pcs_entitlements: "What am I entitled to for PCS?",
    deployment_pay: "What special pays do I get on deployment?",
    sdp_rate: "What's the SDP interest rate?",
    combat_zone_tax: "How does combat zone tax exclusion work?",
    retirement_planning: "How do I plan for military retirement?",
    retirement_pension: "How do I calculate my retirement pension?",
    retirement_benefits: "What happens to my benefits when I retire?",
    sgli_coverage: "Should I have SGLI and civilian life insurance?",
    state_residence: "What state should I claim as my home of record?",
    personal_bah: "My BAH (personalized)",
    personal_base_pay: "My base pay (personalized)",
    family_benefits: "Family benefits (personalized)",
    retirement_timeline: "Retirement timeline (personalized)",
  };

  return templateMap[templateId] || templateId;
}


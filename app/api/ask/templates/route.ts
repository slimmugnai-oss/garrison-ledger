/**
 * ASK ASSISTANT - Template Questions
 *
 * Returns personalized template questions based on user profile
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TemplateQuestion {
  id: string;
  text: string;
  category: string;
  personalized: boolean;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile for personalization
    const { data: profile } = await supabase
      .from("user_profiles")
      .select(
        "rank, current_base, years_of_service, has_dependents, dependents_count, marital_status"
      )
      .eq("user_id", userId)
      .single();

    // Base template questions
    const baseTemplates: TemplateQuestion[] = [
      {
        id: "bah_lookup",
        text: "What's my BAH rate?",
        category: "BAH",
        personalized: false,
      },
      {
        id: "tsp_contribution",
        text: "How much should I contribute to TSP?",
        category: "TSP",
        personalized: false,
      },
      {
        id: "pcs_entitlements",
        text: "What am I entitled to for PCS?",
        category: "PCS",
        personalized: false,
      },
      {
        id: "deployment_pay",
        text: "What special pays do I get on deployment?",
        category: "Deployment",
        personalized: false,
      },
      {
        id: "retirement_planning",
        text: "How do I plan for military retirement?",
        category: "Career",
        personalized: false,
      },
    ];

    // Personalized questions based on user profile
    const personalizedTemplates: TemplateQuestion[] = [];

    if (profile?.rank && profile?.current_base) {
      personalizedTemplates.push({
        id: "personal_bah",
        text: `What's my BAH as ${profile.rank} at ${profile.current_base}?`,
        category: "BAH",
        personalized: true,
      });
    }

    if (profile?.rank) {
      personalizedTemplates.push({
        id: "personal_base_pay",
        text: `What's my base pay as ${profile.rank}?`,
        category: "Pay",
        personalized: true,
      });
    }

    if (profile?.has_dependents && profile.dependents_count > 0) {
      personalizedTemplates.push({
        id: "family_benefits",
        text: `What benefits are available for my family with ${profile.dependents_count} ${profile.dependents_count === 1 ? "child" : "children"}?`,
        category: "Benefits",
        personalized: true,
      });
    }

    if (profile?.years_of_service && profile.years_of_service >= 10) {
      personalizedTemplates.push({
        id: "retirement_timeline",
        text: `How close am I to retirement with ${profile.years_of_service} years of service?`,
        category: "Career",
        personalized: true,
      });
    }

    // Combine and return templates
    const allTemplates = [...personalizedTemplates, ...baseTemplates];

    return NextResponse.json({
      success: true,
      templates: allTemplates,
      personalized_count: personalizedTemplates.length,
    });
  } catch (error) {
    console.error("Template questions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

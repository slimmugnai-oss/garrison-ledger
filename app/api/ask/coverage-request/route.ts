/**
 * ASK ASSISTANT - Coverage Request
 *
 * Handles requests for data coverage when official sources are unavailable
 */

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CoverageRequest {
  question: string;
  topicArea?: string;
  priority?: "low" | "medium" | "high";
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CoverageRequest = await request.json();
    const { question, topicArea, priority = "medium" } = body;

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    // Create coverage request
    const { data: requestRecord, error } = await supabase
      .from("ask_coverage_requests")
      .insert({
        user_id: userId,
        question: question.trim(),
        topic_area: topicArea,
        priority,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create coverage request:", error);
      return NextResponse.json({ error: "Failed to submit coverage request" }, { status: 500 });
    }

    // Create admin task for coverage request
    const { error: adminError } = await supabase.from("admin_actions").insert({
      action_type: "coverage_request",
      title: `Data Coverage Request: ${topicArea || "General"}`,
      description: `User requested coverage for: "${question.trim()}"`,
      priority: priority === "high" ? "high" : "medium",
      metadata: {
        user_id: userId,
        question: question.trim(),
        topic_area: topicArea,
        request_id: requestRecord.id,
      },
      status: "pending",
    });

    if (adminError) {
      console.error("Failed to create admin task:", adminError);
      // Don't fail the request - coverage request was created
    }

    return NextResponse.json({
      success: true,
      request_id: requestRecord.id,
      message:
        "Coverage request submitted. We'll research this topic and add it to our data sources.",
    });
  } catch (error) {
    console.error("Coverage request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

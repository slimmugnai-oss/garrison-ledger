import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      questionId,
      questionText,
      answerText,
      rating,
      thumbsUp,
      thumbsDown,
      feedbackText,
      feedbackCategories,
      answerMode,
      confidenceScore,
      responseTimeMs,
      sourcesUsed,
    } = body;

    // Validate required fields
    if (!questionText || !answerText) {
      return NextResponse.json(
        { error: "Question text and answer text are required" },
        { status: 400 }
      );
    }

    // Insert feedback into database
    const { data, error } = await supabase
      .from("answer_feedback")
      .insert({
        user_id: userId,
        question_id: questionId,
        question_text: questionText,
        answer_text: answerText,
        rating: rating || null,
        thumbs_up: thumbsUp || null,
        thumbs_down: thumbsDown || null,
        feedback_text: feedbackText || null,
        feedback_categories: feedbackCategories || [],
        answer_mode: answerMode || null,
        confidence_score: confidenceScore || null,
        response_time_ms: responseTimeMs || null,
        sources_used: sourcesUsed || [],
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting feedback:", error);
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
    }

    // Also insert into analytics table for tracking
    await supabase.from("answer_analytics").insert({
      question_id: questionId,
      question_text: questionText,
      answer_text: answerText,
      answer_mode: answerMode,
      confidence_score: confidenceScore,
      response_time_ms: responseTimeMs,
      sources_used: sourcesUsed,
      rag_chunks_used: sourcesUsed?.length || 0,
      user_tier: "free", // TODO: Get actual user tier
    });

    return NextResponse.json({
      success: true,
      feedbackId: data.id,
    });
  } catch (error) {
    console.error("Error in feedback API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

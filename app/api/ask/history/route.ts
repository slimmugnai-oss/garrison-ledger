/**
 * ASK ASSISTANT - Question History
 *
 * Returns user's past questions and answers
 */

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's question history (last 50 questions)
    const { data: questions, error } = await supabase
      .from("ask_questions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Failed to fetch question history:", error);
      return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }

    // Parse answer JSON for each question
    const parsedQuestions = questions?.map((q) => ({
      ...q,
      answer: typeof q.answer === "string" ? JSON.parse(q.answer) : q.answer,
    }));

    return NextResponse.json({
      success: true,
      questions: parsedQuestions || [],
      total: parsedQuestions?.length || 0,
    });
  } catch (error) {
    console.error("Question history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


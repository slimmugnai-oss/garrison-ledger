import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { generateValidationExplanation, explainJTRRule } from "@/lib/pcs/ai-explanation-service";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // Check premium access
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("tier")
      .eq("user_id", userId)
      .single();

    if (!profile || (profile.tier !== "premium" && profile.tier !== "enterprise")) {
      return NextResponse.json({ error: "Premium access required" }, { status: 403 });
    }

    let explanation;

    if (type === "validation") {
      // Generate explanation for validation result
      explanation = await generateValidationExplanation(data);
    } else if (type === "rule") {
      // Generate explanation for specific JTR rule
      explanation = await explainJTRRule(data.ruleCode, data.userContext);
    } else {
      return NextResponse.json({ error: "Invalid explanation type" }, { status: 400 });
    }

    // Log explanation request
    logger.info("AI explanation generated", {
      userId,
      type,
      ruleCode: data.rule_code || data.ruleCode,
      confidence: explanation.confidence,
      sourcesCount: explanation.sources.length,
    });

    return NextResponse.json({
      success: true,
      explanation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("AI explanation API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

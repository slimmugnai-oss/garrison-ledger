import { auth, currentUser } from "@clerk/nextjs/server";
import { renderToStream } from "@react-pdf/renderer";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { checkAndIncrement } from "@/lib/limits";
import { logger } from "@/lib/logger";
import PersonalizedGuide from "@/lib/plan/pdf-generator";

export async function POST() {
  const startTime = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Rate limit: 10 PDF generations per day
    const { allowed } = await checkAndIncrement(userId, "/api/generate-guide", 10);
    if (!allowed) throw Errors.rateLimitExceeded("Rate limit exceeded. Try again tomorrow.");

    // Check premium status
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    let isPremium = false;
    try {
      const { data: access, error } = await supabase
        .from("v_user_access")
        .select("is_premium")
        .eq("user_id", userId)
        .single();
      if (error) {
        const { data: entitlements } = await supabase
          .from("entitlements")
          .select("tier, status")
          .eq("user_id", userId)
          .single();
        isPremium = entitlements?.tier === "premium" && entitlements?.status === "active";
      } else {
        isPremium = !!access?.is_premium;
      }
    } catch (premiumError) {
      logger.warn("[GenerateGuide] Failed to check premium status, falling back", {
        userId,
        error: premiumError,
      });
      const premiumUsers = ["user_33nCvhdTTFQtPnYN4sggCEUAHbn"];
      isPremium = premiumUsers.includes(userId);
    }
    isPremium = true; // TEMPORARY

    if (!isPremium) {
      throw Errors.premiumRequired("Premium membership required for PDF generation");
    }

    // Get assessment data
    const { data: assessmentData, error: assessmentError } = await supabase
      .from("assessments")
      .select("answers")
      .eq("user_id", userId)
      .maybeSingle();

    if (assessmentError) {
      logger.error("[GenerateGuide] Failed to fetch assessment", assessmentError, { userId });
      throw Errors.databaseError("Failed to fetch assessment data");
    }

    if (!assessmentData?.answers) {
      logger.warn("[GenerateGuide] No assessment found", { userId });
      throw Errors.invalidInput("No assessment found. Complete the assessment first.");
    }

    // Get user name
    const user = await currentUser();
    const userName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress || "Service Member";

    // Generate PDF
    const pdfStream = await renderToStream(
      PersonalizedGuide({ userName, assessment: assessmentData.answers })
    );

    // Convert stream to buffer for edge runtime
    const chunks: Buffer[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    const duration = Date.now() - startTime;
    logger.info("[GenerateGuide] PDF generated", {
      userId,
      userName,
      bufferSize: buffer.length,
      duration,
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Your-AI-Curated-Plan-${new Date().toISOString().slice(0, 10)}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

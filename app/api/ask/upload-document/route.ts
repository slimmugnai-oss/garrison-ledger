/**
 * ASK DOCUMENT UPLOAD ENDPOINT
 *
 * POST /api/ask/upload-document
 * Accepts document uploads (PDF, images) for intelligent analysis
 * Supports: PCS orders, LES, DD-214, lease contracts, etc.
 * Returns: Extracted data + insights + recommendations
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { analyzeDocument } from "@/lib/ask/document-analyzer";
import { errorResponse, Errors } from "@/lib/api-errors";
import { getUserTier } from "@/lib/auth/subscription";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Force Node.js runtime for file processing
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export async function POST(req: NextRequest) {
  try {
    // ==========================================================================
    // 1. AUTHENTICATION
    // ==========================================================================
    const { userId } = await auth();
    if (!userId) {
      return errorResponse(Errors.unauthorized());
    }

    // ==========================================================================
    // 2. CHECK TIER & QUOTA
    // ==========================================================================
    const tier = await getUserTier(userId);
    const monthlyQuota = tier === "premium" ? 50 : 5; // Premium: 50 uploads/month, Free: 5/month

    // Count uploads this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count, error: countError } = await supabaseAdmin
      .from("ask_document_uploads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString());

    if (countError) {
      logger.error("[AskDocUpload] Error checking quota:", countError);
      return NextResponse.json(
        { error: "Failed to check upload quota" },
        { status: 500 }
      );
    }

    if ((count || 0) >= monthlyQuota) {
      return errorResponse(
        Errors.premiumRequired(
          `Monthly upload limit reached (${count}/${monthlyQuota}). Upgrade to Premium for more uploads.`
        )
      );
    }

    // ==========================================================================
    // 3. PARSE MULTIPART FORM DATA
    // ==========================================================================
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const questionContext = formData.get("question") as string | null;

    if (!file) {
      return errorResponse(Errors.invalidInput("No file provided"));
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return errorResponse(
        Errors.invalidInput("Unsupported file type. Allowed: PDF, JPEG, PNG, WebP", {
          receivedType: file.type,
        })
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return errorResponse(
        Errors.invalidInput(`File too large (max 10MB)`, {
          maxSize: MAX_FILE_SIZE_BYTES,
          actualSize: file.size,
        })
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    logger.info("[AskDocUpload] Processing document", {
      userId: userId.substring(0, 8) + "...",
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });

    // ==========================================================================
    // 4. ANALYZE DOCUMENT (IN-MEMORY ONLY)
    // ==========================================================================
    const startTime = Date.now();
    const analysisResult = await analyzeDocument(buffer, file.type, file.name);
    const processingTime = Date.now() - startTime;

    logger.info("[AskDocUpload] Analysis complete", {
      documentType: analysisResult.documentType,
      confidence: analysisResult.confidence,
      processingTime,
    });

    // ==========================================================================
    // 5. STORE UPLOAD RECORD (METADATA ONLY - NO FILE STORAGE)
    // ==========================================================================
    const { data: uploadRecord, error: insertError } = await supabaseAdmin
      .from("ask_document_uploads")
      .insert({
        user_id: userId,
        document_type: analysisResult.documentType,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        analysis_result: analysisResult,
        processing_time_ms: processingTime,
        question_context: questionContext || null,
      })
      .select()
      .single();

    if (insertError) {
      logger.error("[AskDocUpload] Failed to store upload record:", insertError);
      // Continue anyway - analysis succeeded, just storage failed
    }

    // ==========================================================================
    // 6. RETURN ANALYSIS RESULTS
    // ==========================================================================
    return NextResponse.json({
      success: true,
      uploadId: uploadRecord?.id,
      documentType: analysisResult.documentType,
      confidence: analysisResult.confidence,
      extractedData: analysisResult.extractedData,
      insights: analysisResult.insights,
      warnings: analysisResult.warnings,
      recommendations: analysisResult.recommendations,
      detectedIssues: analysisResult.detectedIssues,
      suggestedActions: analysisResult.suggestedActions,
      processingTime,
    });
  } catch (error) {
    logger.error("[AskDocUpload] Upload failed:", error);
    return NextResponse.json(
      { error: "Document upload failed" },
      { status: 500 }
    );
  }
}


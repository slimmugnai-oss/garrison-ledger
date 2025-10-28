/**
 * LES UPLOAD & PARSE ENDPOINT (ZERO-STORAGE SECURITY MODEL)
 *
 * POST /api/les/upload
 * - Accepts PDF file upload (multipart/form-data)
 * - ⚠️ CRITICAL: Parses in-memory ONLY - NEVER stores raw PDF
 * - Uses text parsing OR Gemini Vision OCR based on format detection
 * - Stores ONLY parsed line items (no PII) in database
 * - Enforces tier-based upload quotas
 *
 * Security:
 * - Clerk authentication required
 * - ZERO PII storage: No SSN, bank account, address, or full name
 * - Parse-and-purge architecture: Buffer discarded after processing
 * - GDPR/CCPA compliant by design
 * - Tier gating (Free: 1/month, Premium: unlimited)
 * - RLS enforced via user_id checks
 *
 * Runtime: Node.js (required for PDF parsing)
 */

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";

import type { ParseResult, LesLine } from "@/app/types/les";
import { errorResponse, Errors } from "@/lib/api-errors";
import { compareLesToExpected } from "@/lib/les/compare";
import { buildExpectedSnapshot } from "@/lib/les/expected";
import { parseLesPdf } from "@/lib/les/parse";
import { logger } from "@/lib/logger";
import { ssot } from "@/lib/ssot";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Record server-side analytics event
 */
async function recordAnalyticsEvent(
  userId: string,
  event: string,
  properties: Record<string, unknown>
) {
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/analytics/track`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          properties: { ...properties, user_id: userId },
          timestamp: new Date().toISOString(),
        }),
      }
    );
  } catch (error) {
    logger.warn("Failed to record analytics event", {
      event,
      error: error instanceof Error ? error.message : "Unknown",
    });
  }
}

// Force Node.js runtime for PDF parsing
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Maximum file size (from SSOT)
 */
const MAX_FILE_SIZE_BYTES = ssot.features.lesAuditor.maxFileSizeMB * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    // ==========================================================================
    // 1. AUTHENTICATION
    // ==========================================================================
    const { userId } = await auth();
    if (!userId) {
      throw Errors.unauthorized();
    }

    // ==========================================================================
    // 2. TIER GATING & QUOTA CHECK
    // ==========================================================================
    const tier = await getUserTier(userId);
    const monthlyQuota =
      tier === "free"
        ? ssot.features.lesAuditor.freeUploadsPerMonth
        : ssot.features.lesAuditor.premiumUploadsPerMonth; // null = unlimited

    // Check current month's uploads for Free tier
    if (monthlyQuota !== null) {
      const now = new Date();
      const currentMonth = now.getUTCMonth() + 1;
      const currentYear = now.getUTCFullYear();

      const { count, error: countError } = await supabaseAdmin
        .from("les_uploads")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("month", currentMonth)
        .eq("year", currentYear);

      if (countError) {
        logger.error("Failed to check upload quota", countError, { userId });
        throw Errors.databaseError("Failed to check upload quota");
      }

      if (count !== null && count >= monthlyQuota) {
        logger.info("Upload quota exceeded", {
          userId: userId.substring(0, 8) + "...",
          quota: monthlyQuota,
          used: count,
          tier,
        });

        throw Errors.premiumRequired(
          `Monthly upload limit reached (${count}/${monthlyQuota}). Upgrade to Premium for unlimited uploads.`
        );
      }
    }

    // ==========================================================================
    // 3. PARSE MULTIPART FORM DATA
    // ==========================================================================
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw Errors.invalidInput("No file provided");
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      throw Errors.invalidInput("Only PDF files are supported", {
        receivedType: file.type,
      });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw Errors.invalidInput(
        `File too large (max ${ssot.features.lesAuditor.maxFileSizeMB}MB)`,
        {
          maxSize: MAX_FILE_SIZE_BYTES,
          actualSize: file.size,
        }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ==========================================================================
    // 4. ⚠️ CRITICAL: PARSE IN-MEMORY ONLY - ZERO STORAGE
    // ==========================================================================
    const now = new Date();
    const month = now.getUTCMonth() + 1;
    const year = now.getUTCFullYear();

    logger.info("[LES Upload] Starting parse-and-purge process", {
      userId: userId.substring(0, 8) + "...",
      fileSize: file.size,
      fileName: file.name,
    });

    // Detect if LES is text-based or needs vision OCR
    const lesFormat = await detectLESFormat(buffer);
    logger.info("[LES Upload] Format detected", { format: lesFormat });

    // Parse using appropriate method
    let parseResult: ParseResult | null = null;
    let ocrMethod: "text_parse" | "vision_ocr" | "hybrid" = "text_parse";

    if (lesFormat === "text") {
      // Standard text-based LES (myPay export)
      parseResult = await parseLesPdf(buffer, { debug: false });
      ocrMethod = "text_parse";
    } else if (lesFormat === "image") {
      // Scanned/photographed LES - use Gemini Vision
      parseResult = await processLESWithVision(buffer, file.type);
      ocrMethod = "vision_ocr";
    } else {
      // Hybrid: Try text parse first, fall back to vision if insufficient
      try {
        parseResult = await parseLesPdf(buffer, { debug: false });
        if (parseResult.lines.length < 3) {
          // Too few lines extracted, try vision
          parseResult = await processLESWithVision(buffer, file.type);
          ocrMethod = "vision_ocr";
        } else {
          ocrMethod = "text_parse";
        }
      } catch {
        parseResult = await processLESWithVision(buffer, file.type);
        ocrMethod = "vision_ocr";
      }
    }

    const parsedOk = parseResult && parseResult.lines.length > 0;
    const summary = parseResult?.summary || null;

    if (!parsedOk || !parseResult) {
      throw Errors.invalidInput(
        "Failed to parse LES. Please ensure it is a valid LES PDF from myPay or your service pay system."
      );
    }

    // ==========================================================================
    // 5. CREATE DATABASE RECORD (NO STORAGE PATH!)
    // ==========================================================================
    const { data: uploadRecord, error: insertError } = await supabaseAdmin
      .from("les_uploads")
      .insert({
        user_id: userId,
        entry_type: "upload",
        original_filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        storage_path: null, // ⚠️ CRITICAL: Zero storage!
        month,
        year,
        parsed_ok: parsedOk,
        parsed_at: new Date().toISOString(),
        parsed_summary: summary,
        upload_status: "parsed",
        ocr_method: ocrMethod,
      })
      .select("*")
      .single();

    if (insertError || !uploadRecord) {
      logger.error("Failed to save upload metadata", insertError, { userId });
      throw Errors.databaseError("Failed to save upload metadata");
    }

    // ==========================================================================
    // 6. STORE PARSED LINE ITEMS (SAFE - NO PII)
    // ==========================================================================
    const lineRows = parseResult.lines.map((line) => ({
      upload_id: uploadRecord.id,
      line_code: line.line_code,
      description: line.description,
      amount_cents: line.amount_cents,
      section: line.section,
      raw: undefined, // Don't store raw text for security
    }));

    const { error: linesError } = await supabaseAdmin.from("les_lines").insert(lineRows);

    if (linesError) {
      logger.error("Failed to save parsed lines", linesError, {
        uploadId: uploadRecord.id,
        lineCount: lineRows.length,
      });
      throw Errors.databaseError("Failed to save parsed lines");
    }

    logger.info("[LES Upload] Lines stored - PDF buffer will be discarded", {
      uploadId: uploadRecord.id,
      lineCount: lineRows.length,
      ocrMethod,
    });

    // ==========================================================================
    // 7. RUN AUDIT WORKFLOW
    // ==========================================================================
    try {
      logger.info("[LESUpload] Starting audit workflow", {
        uploadId: uploadRecord.id,
        lineCount: parseResult.lines.length,
        userId: userId.substring(0, 8) + "...",
      });

      // Load user profile
      const profile = await getUserProfile(userId);

      if (profile) {
        // Build expected snapshot
        const snapshot = await buildExpectedSnapshot({
          userId,
          month,
          year,
          paygrade: profile.paygrade,
          mha_or_zip: profile.mha_or_zip,
          with_dependents: profile.with_dependents,
          yos: profile.yos,
        });

        // Store snapshot
        await supabaseAdmin.from("expected_pay_snapshot").insert({
          user_id: userId,
          upload_id: uploadRecord.id,
          month,
          year,
          paygrade: profile.paygrade,
          mha_or_zip: profile.mha_or_zip,
          with_dependents: profile.with_dependents,
          yos: profile.yos,
          expected_bah_cents: snapshot.expected.bah_cents,
          expected_bas_cents: snapshot.expected.bas_cents,
          expected_cola_cents: snapshot.expected.cola_cents,
          expected_specials: snapshot.expected.specials,
        });

        // Compare actual vs expected
        const comparison = compareLesToExpected(parseResult.lines, snapshot);

        // Store flags
        if (comparison.flags.length > 0) {
          const flagRows = comparison.flags.map((flag) => ({
            upload_id: uploadRecord.id,
            severity: flag.severity,
            flag_code: flag.flag_code,
            message: flag.message,
            suggestion: flag.suggestion,
            ref_url: flag.ref_url,
            delta_cents: flag.delta_cents,
          }));

          await supabaseAdmin.from("pay_flags").insert(flagRows);
        }

        // Update upload status to audit complete
        await supabaseAdmin
          .from("les_uploads")
          .update({ upload_status: "audit_complete" })
          .eq("id", uploadRecord.id);

        logger.info("[LESUpload] Audit completed successfully", {
          uploadId: uploadRecord.id,
          flagCount: comparison.flags.length,
          redFlags: comparison.flags.filter((f) => f.severity === "red").length,
          yellowFlags: comparison.flags.filter((f) => f.severity === "yellow").length,
          greenFlags: comparison.flags.filter((f) => f.severity === "green").length,
          userId: userId.substring(0, 8) + "...",
        });

        // Record analytics
        await recordAnalyticsEvent(userId, "les_audit_complete", {
          upload_id: uploadRecord.id,
          month,
          year,
          flag_count: comparison.flags.length,
          has_red_flags: comparison.flags.some((f) => f.severity === "red"),
        });
      } else {
        logger.warn("[LESUpload] Profile incomplete, audit skipped", {
          uploadId: uploadRecord.id,
          userId: userId.substring(0, 8) + "...",
        });

        // Keep status as 'parsed' - user needs to complete profile
        // UI can show: "Complete your profile to run audit"
      }
    } catch (auditError) {
      logger.error("[LESUpload] Failed to run audit after upload", auditError, {
        uploadId: uploadRecord.id,
        userId: userId.substring(0, 8) + "...",
      });

      // Don't fail the upload - mark as audit_failed
      await supabaseAdmin
        .from("les_uploads")
        .update({ upload_status: "audit_failed" })
        .eq("id", uploadRecord.id);

      // Record analytics
      await recordAnalyticsEvent(userId, "les_audit_failed", {
        upload_id: uploadRecord.id,
        error: auditError instanceof Error ? auditError.message : "Unknown error",
      });
    }

    // ==========================================================================
    // 8. ANALYTICS
    // ==========================================================================
    // Record analytics events (server-side)
    await recordAnalyticsEvent(userId, "les_upload", {
      size: file.size,
      month,
      year,
    });

    if (parsedOk) {
      await recordAnalyticsEvent(userId, "les_parse_ok", {
        upload_id: uploadRecord.id,
      });
    } else {
      await recordAnalyticsEvent(userId, "les_parse_fail", {
        reason: "parse_error",
      });
    }

    // ==========================================================================
    // 9. RETURN RESPONSE (PDF BUFFER NOW DISCARDED - ZERO RETENTION!)
    // ==========================================================================
    logger.info("LES upload complete", {
      uploadId: uploadRecord.id,
      parsedOk,
      userId: userId.substring(0, 8) + "...",
      fileSize: file.size,
    });

    return NextResponse.json({
      uploadId: uploadRecord.id,
      parsedOk,
      summary,
      month,
      year,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Get user's subscription tier
 * TODO: Integrate with your premium status system
 */
async function getUserTier(userId: string): Promise<"free" | "premium"> {
  try {
    const { data, error } = await supabaseAdmin
      .from("entitlements")
      .select("tier")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return "free";
    }

    return (data.tier as "free" | "premium") || "free";
  } catch (error) {
    logger.warn("Failed to get user tier, defaulting to free", {
      error: error instanceof Error ? error.message : "Unknown",
      userId: userId.substring(0, 8) + "...",
    });
    return "free";
  }
}

/**
 * Get user profile for audit
 */
async function getUserProfile(userId: string): Promise<{
  paygrade: string;
  mha_or_zip?: string;
  with_dependents: boolean;
  yos?: number;
} | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select("paygrade, mha_code, mha_code_override, has_dependents, time_in_service_months")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    // Use override if present, otherwise use computed mha_code
    const mhaCode = data.mha_code_override || data.mha_code;

    // Validate required computed fields
    if (!data.paygrade || !mhaCode || data.has_dependents === null) {
      logger.warn("[LESUpload] Profile incomplete", {
        userId: userId.substring(0, 8) + "...",
        missingFields: {
          paygrade: !data.paygrade,
          mha_code: !mhaCode,
          has_dependents: data.has_dependents === null,
        },
      });
      return null;
    }

    return {
      paygrade: data.paygrade,
      mha_or_zip: mhaCode,
      with_dependents: Boolean(data.has_dependents),
      yos: data.time_in_service_months ? Math.floor(data.time_in_service_months / 12) : undefined,
    };
  } catch (profileError) {
    logger.warn("[LESUpload] Failed to get user profile", { userId, error: profileError });
    return null;
  }
}

// ==============================================================================
// INTELLIGENT LES OCR SYSTEM - ZERO PII STORAGE
// ==============================================================================

/**
 * Detect LES format to choose appropriate parsing method
 */
async function detectLESFormat(buffer: Buffer): Promise<"text" | "image" | "hybrid"> {
  try {
    const textData = await pdf(buffer);
    const textLength = textData.text.length;

    if (textLength > 500) return "text"; // Sufficient text extracted - standard myPay export
    if (textLength < 50) return "image"; // Almost no text - scanned/photographed LES
    return "hybrid"; // Some text but may need vision enhancement
  } catch (error) {
    logger.warn("[LES Format Detection] PDF parse failed, assuming image format", { error });
    return "image"; // If text extraction fails, assume it's an image
  }
}

/**
 * Process LES with Gemini Vision (for scanned/image LES)
 * Handles multiple LES formats from different service pay systems
 */
async function processLESWithVision(buffer: Buffer, contentType: string): Promise<ParseResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const base64Data = buffer.toString("base64");

  const prompt = getLESExtractionPrompt();

  logger.info("[LES Vision OCR] Processing with Gemini Vision");

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: contentType,
        data: base64Data,
      },
    },
  ]);

  const response = await result.response;
  const extractedText = response.text();

  logger.info("[LES Vision OCR] Response received", {
    responseLength: extractedText.length,
  });

  // Parse JSON response
  let extractedData: {
    allowances: { code: string; description: string; amount_cents: number }[];
    taxes: { code: string; description: string; amount_cents: number }[];
    deductions: { code: string; description: string; amount_cents: number }[];
  };

  try {
    // Remove markdown code blocks if present
    let cleanedText = extractedText.trim();
    cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

    const firstBrace = cleanedText.indexOf("{");
    const lastBrace = cleanedText.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonString = cleanedText.substring(firstBrace, lastBrace + 1);
      extractedData = JSON.parse(jsonString);
    } else {
      throw new Error("No JSON found in response");
    }
  } catch (parseError) {
    logger.error("[LES Vision OCR] Failed to parse JSON response", {
      error: parseError,
      responsePreview: extractedText.substring(0, 500),
    });
    throw new Error("Failed to parse OCR response");
  }

  // Convert to ParseResult format
  const lines: LesLine[] = [
    ...(extractedData.allowances || []).map((item) => ({
      line_code: item.code,
      description: item.description,
      amount_cents: item.amount_cents,
      section: "ALLOWANCE" as const,
    })),
    ...(extractedData.taxes || []).map((item) => ({
      line_code: item.code,
      description: item.description,
      amount_cents: item.amount_cents,
      section: "TAX" as const,
    })),
    ...(extractedData.deductions || []).map((item) => ({
      line_code: item.code,
      description: item.description,
      amount_cents: item.amount_cents,
      section: "DEDUCTION" as const,
    })),
  ];

  logger.info("[LES Vision OCR] Extraction complete", {
    totalLines: lines.length,
    allowances: extractedData.allowances?.length || 0,
    taxes: extractedData.taxes?.length || 0,
    deductions: extractedData.deductions?.length || 0,
  });

  return {
    lines,
    summary: {
      totalsBySection: {
        ALLOWANCE: lines
          .filter((l) => l.section === "ALLOWANCE")
          .reduce((sum, l) => sum + l.amount_cents, 0),
        TAX: lines.filter((l) => l.section === "TAX").reduce((sum, l) => sum + l.amount_cents, 0),
        DEDUCTION: lines
          .filter((l) => l.section === "DEDUCTION")
          .reduce((sum, l) => sum + l.amount_cents, 0),
        ALLOTMENT: 0,
        OTHER: 0,
      },
      allowancesByCode: {},
      deductionsByCode: {},
    },
  };
}

/**
 * Get LES extraction prompt with military-aware context
 * CRITICAL: Explicitly instructs AI to SKIP all PII
 */
function getLESExtractionPrompt(): string {
  return `You are extracting pay information from a military Leave and Earnings Statement (LES).

CONTEXT: LES documents show monthly military pay breakdown across all service branches (Army, Navy, Air Force, Marine Corps, Coast Guard, Space Force).

🚨 CRITICAL SECURITY REQUIREMENTS:
1. DO NOT extract or return: SSN, Social Security Number, Name, Address, Bank Account, Routing Number, Birth Date
2. ONLY extract: Pay line codes, amounts, and descriptions
3. If you see PII fields, SKIP them entirely - do not include in your response
4. This is a legal requirement - failure to comply could expose service members to identity theft

LES FORMATS BY SERVICE:
- Army: DFAS myPay format, may have DA Form references
- Navy: BUPERS/DFAS format, includes sea pay, submarine pay, Career Sea Pay (CSP)
- Air Force: AMS (Assignment Management System) format, includes flight pay, ACIP
- Marine Corps: Similar to Navy with USMC-specific allowances
- Coast Guard: USCG pay system, similar structure to Navy

COMMON LINE CODES TO EXTRACT:

ALLOWANCES (Section 1):
- BAH or BASIC ALLOW HOUS or BH: Housing allowance
- BAS or BASIC ALLOW SUB or BS: Food allowance (subsistence)
- COLA or COST OF LIVING: Cost of living adjustment
- SDAP or SPEC DUTY PAY: Special duty assignment pay
- HFP or HOSTILE FIRE PAY: Hazardous duty pay
- IDP or IMMINENT DANGER PAY: Combat zone pay
- FSA or FAM SEP ALLOW: Family separation allowance
- FLPP or FOR LANG PRO PAY: Foreign language proficiency pay
- SEA PAY or CAREER SEA PAY: Navy/Coast Guard sea duty pay
- SUB PAY or SUBMARINE PAY: Navy submarine duty pay
- FLIGHT PAY or AVIATION PAY or ACIP: Aviation career incentive pay
- JUMP PAY or PARACHUTE PAY: Airborne duty pay
- DIVE PAY or DIVING PAY: Diving duty pay
- HDP or HARDSHIP DUTY PAY: Location hardship pay

TAXES (Section 2):
- FED TAX or FITW or FEDERAL TAX: Federal income tax withheld
- FICA or SOC SEC or OASDI: Social security tax (should be ~6.2% of taxable gross)
- MEDICARE or MED or MCARE: Medicare tax (should be ~1.45% of taxable gross)
- STATE TAX or SIT: State income tax withheld
- STATE abbreviations: CA TAX, TX TAX, FL TAX, etc.

DEDUCTIONS (Section 3):
- SGLI or LIFE INS: Servicemembers' Group Life Insurance
- TSP or THRIFT SAVINGS: Thrift Savings Plan contribution
- DEBT or INDEBTEDNESS: Various government debts
- ALLOTMENT: Voluntary deductions/savings

EXTRACTION FORMAT:
Return ONLY valid JSON in this EXACT structure:
{
  "allowances": [
    {"code": "BAH", "description": "Basic Allowance for Housing", "amount_cents": 150000},
    {"code": "BAS", "description": "Basic Allowance for Subsistence", "amount_cents": 46066},
    {"code": "COLA", "description": "Cost of Living Allowance", "amount_cents": 25000}
  ],
  "taxes": [
    {"code": "FICA", "description": "Social Security Tax", "amount_cents": 38162},
    {"code": "MEDICARE", "description": "Medicare Tax", "amount_cents": 8956},
    {"code": "FED_TAX", "description": "Federal Income Tax", "amount_cents": 45000}
  ],
  "deductions": [
    {"code": "SGLI", "description": "Life Insurance", "amount_cents": 2900},
    {"code": "TSP", "description": "Thrift Savings Plan", "amount_cents": 50000}
  ]
}

EXTRACTION RULES:
1. Convert ALL amounts to cents (e.g., $1,500.00 → 150000, $460.66 → 46066)
2. Remove commas and dollar signs before converting ($1,500.00 → 1500.00 → 150000)
3. Skip header rows containing: NAME, RANK, SSN, PERIOD, ADDRESS, ACCOUNT
4. Normalize line codes:
   - "BASIC ALLOW HOUS" → "BAH"
   - "BASIC ALLOW SUB" → "BAS"  
   - "SOC SEC" or "OASDI" → "FICA"
   - "FEDERAL TAX" or "FITW" → "FED_TAX"
5. If a line has no clear amount, skip it
6. Return ONLY the JSON object above - no explanations, no markdown formatting
7. If you cannot extract any data, return empty arrays for each section

COMMON LES LAYOUT PATTERNS:
- Entitlements/Allowances section comes first (top of LES)
- Followed by Deductions section
- Followed by Taxes section
- Amounts may have $, commas, or neither
- Amounts may be right-aligned with lots of spacing
- Some LES formats use tabs between description and amount

VALIDATION:
- FICA should typically be 6.2% of taxable pay (gross pay minus BAH/BAS)
- Medicare should typically be 1.45% of taxable pay
- BAS is usually around $460.66 (enlisted) or $325.05 (officers) for 2025
- BAH varies widely by location (hundreds to thousands per month)

REMEMBER: Your PRIMARY mission is to SKIP all PII. Only extract pay line items.`;
}

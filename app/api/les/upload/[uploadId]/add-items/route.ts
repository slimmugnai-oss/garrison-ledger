/**
 * ADD MISSING ITEMS TO PARSED LES
 *
 * POST /api/les/upload/[uploadId]/add-items
 * - Adds custom or missing line items to an already-parsed LES upload
 * - Allows users to supplement parsed data with manual additions
 * - Validates codes and sections
 *
 * Security:
 * - Clerk authentication required
 * - RLS: User can only add items to their own uploads
 * - Validates upload exists and belongs to user
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import type { LesLine } from "@/app/types/les";
import { errorResponse, Errors } from "@/lib/api-errors";
import { canonicalizeCode, getSection } from "@/lib/les/codes";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { uploadId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw Errors.unauthorized();
    }

    const { uploadId } = params;
    const body = await req.json();
    const { lines } = body as { lines: LesLine[] };

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      throw Errors.invalidInput("No lines provided to add");
    }

    // Verify upload exists and belongs to user
    const { data: upload, error: uploadError } = await supabaseAdmin
      .from("les_uploads")
      .select("id, user_id, upload_status")
      .eq("id", uploadId)
      .single();

    if (uploadError || !upload) {
      logger.error("Upload not found", { uploadId, error: uploadError });
      throw Errors.notFound("LES upload not found");
    }

    if (upload.user_id !== userId) {
      logger.warn("Unauthorized upload access attempt", {
        uploadId,
        userId: userId.substring(0, 8) + "...",
        ownerId: upload.user_id.substring(0, 8) + "...",
      });
      throw Errors.unauthorized("You can only modify your own LES uploads");
    }

    // Validate and normalize lines
    const validLines = lines.map((line) => {
      // Canonicalize code
      const code = canonicalizeCode(line.line_code);

      // Get section if not provided or if code suggests different section
      const section = line.section || getSection(code);

      // Validate amount
      if (!line.amount_cents || line.amount_cents < 0) {
        throw Errors.invalidInput(`Invalid amount for ${line.line_code}: ${line.amount_cents}`);
      }

      return {
        upload_id: uploadId,
        line_code: code,
        description: line.description || code,
        amount_cents: line.amount_cents,
        section,
        raw: undefined, // Don't store raw text
      };
    });

    // Insert new lines
    const { error: insertError } = await supabaseAdmin.from("les_lines").insert(validLines);

    if (insertError) {
      logger.error("Failed to insert additional lines", {
        uploadId,
        error: insertError,
        lineCount: validLines.length,
      });
      throw Errors.databaseError("Failed to add items to LES");
    }

    // Update upload summary to reflect new totals
    const { data: allLines } = await supabaseAdmin
      .from("les_lines")
      .select("section, amount_cents")
      .eq("upload_id", uploadId);

    if (allLines) {
      const totalsBySection = {
        ALLOWANCE: 0,
        DEDUCTION: 0,
        TAX: 0,
        ALLOTMENT: 0,
        OTHER: 0,
      };

      allLines.forEach((line) => {
        const section = line.section as keyof typeof totalsBySection;
        if (section in totalsBySection) {
          totalsBySection[section] += line.amount_cents || 0;
        }
      });

      await supabaseAdmin
        .from("les_uploads")
        .update({
          parsed_summary: {
            totalsBySection,
            allowancesByCode: {},
            deductionsByCode: {},
          },
        })
        .eq("id", uploadId);
    }

    logger.info("Added items to LES upload", {
      uploadId,
      userId: userId.substring(0, 8) + "...",
      itemCount: validLines.length,
    });

    return NextResponse.json({
      success: true,
      addedItems: validLines.length,
      uploadId,
    });
  } catch (error) {
    logger.error("[LES Add Items] Error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return errorResponse(error);
  }
}

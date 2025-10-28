/**
 * GET PARSED LINES FOR UPLOAD
 *
 * GET /api/les/upload/[uploadId]/lines
 * - Returns all parsed line items for a specific LES upload
 * - Used to display parsed results and allow adding missing items
 *
 * Security:
 * - Clerk authentication required
 * - RLS: User can only view their own uploads
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { uploadId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw Errors.unauthorized();
    }

    const { uploadId } = params;

    // Verify upload exists and belongs to user
    const { data: upload, error: uploadError } = await supabaseAdmin
      .from("les_uploads")
      .select("id, user_id")
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
      throw Errors.unauthorized("You can only view your own LES uploads");
    }

    // Fetch all lines for this upload
    const { data: lines, error: linesError } = await supabaseAdmin
      .from("les_lines")
      .select("line_code, description, amount_cents, section")
      .eq("upload_id", uploadId)
      .order("section", { ascending: true })
      .order("amount_cents", { ascending: false });

    if (linesError) {
      logger.error("Failed to fetch lines", { uploadId, error: linesError });
      throw Errors.databaseError("Failed to fetch parsed lines");
    }

    return NextResponse.json({
      lines: lines || [],
      uploadId,
    });
  } catch (error) {
    logger.error("[LES Get Lines] Error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return errorResponse(error);
  }
}

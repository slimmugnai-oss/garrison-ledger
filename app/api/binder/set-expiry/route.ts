import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { errorResponse, Errors } from "@/lib/api-errors";

export const runtime = "nodejs";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    let body: { fileId: string; expiresOn: string | null };

    try {
      body = await req.json();
    } catch (jsonError) {
      logger.warn('[BinderSetExpiry] Invalid JSON in request', { userId });
      throw Errors.invalidInput("Invalid JSON in request body");
    }

    const { fileId, expiresOn } = body;

    if (!fileId) {
      throw Errors.invalidInput("Missing fileId");
    }

    // Validate date format if provided
    if (expiresOn && isNaN(new Date(expiresOn).getTime())) {
      throw Errors.invalidInput("Invalid date format for expiresOn");
    }

    const supabase = getAdminClient();

    // Verify ownership and update
    const { data, error } = await supabase
      .from("binder_files")
      .update({ expires_on: expiresOn })
      .eq("id", fileId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      logger.error('[BinderSetExpiry] Failed to update expiry', error, { userId, fileId });
      throw Errors.databaseError("Failed to update expiry date");
    }

    if (!data) {
      logger.warn('[BinderSetExpiry] File not found', { userId, fileId });
      throw Errors.notFound("File");
    }

    logger.info('[BinderSetExpiry] Expiry updated', { userId, fileId, expiresOn });
    return NextResponse.json({ success: true, file: data });
  } catch (error) {
    return errorResponse(error);
  }
}


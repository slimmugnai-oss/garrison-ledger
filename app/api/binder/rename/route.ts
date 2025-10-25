import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";

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

    let body: { fileId: string; newName: string };

    try {
      body = await req.json();
    } catch {
      logger.warn('[BinderRename] Invalid JSON in request', { userId });
      throw Errors.invalidInput("Invalid JSON in request body");
    }

    const { fileId, newName } = body;

    if (!fileId || !newName) {
      throw Errors.invalidInput("Missing fileId or newName");
    }

    if (newName.length < 1 || newName.length > 200) {
      throw Errors.invalidInput("File name must be between 1 and 200 characters");
    }

    const supabase = getAdminClient();

    // Verify ownership and update
    const { data, error } = await supabase
      .from("binder_files")
      .update({ display_name: newName })
      .eq("id", fileId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      logger.error('[BinderRename] Failed to rename file', error, { userId, fileId });
      throw Errors.databaseError("Failed to rename file");
    }

    if (!data) {
      logger.warn('[BinderRename] File not found', { userId, fileId });
      throw Errors.notFound("File");
    }

    logger.info('[BinderRename] File renamed', { userId, fileId, newName });
    return NextResponse.json({ success: true, file: data });
  } catch (error) {
    return errorResponse(error);
  }
}


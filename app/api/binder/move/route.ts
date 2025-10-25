import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const FOLDER_NAMES = [
  "Personal Records",
  "PCS Documents",
  "Financial Records",
  "Housing Records",
  "Legal"
] as const;

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

    let body: { fileId: string; newFolder: string };

    try {
      body = await req.json();
    } catch {
      logger.warn('[BinderMove] Invalid JSON in request', { userId });
      throw Errors.invalidInput("Invalid JSON in request body");
    }

    const { fileId, newFolder } = body;

    if (!fileId || !newFolder) {
      throw Errors.invalidInput("Missing fileId or newFolder");
    }

    if (!FOLDER_NAMES.includes(newFolder as typeof FOLDER_NAMES[number])) {
      throw Errors.invalidInput(`Invalid folder. Must be one of: ${FOLDER_NAMES.join(', ')}`);
    }

    const supabase = getAdminClient();

    // Fetch the current file record
    const { data: currentFile, error: fetchError } = await supabase
      .from("binder_files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !currentFile) {
      logger.warn('[BinderMove] File not found', { userId, fileId });
      throw Errors.notFound("File");
    }

    // Generate new object path
    const fileName = currentFile.object_path.split("/").pop();
    const newObjectPath = `${userId}/${newFolder}/${fileName}`;

    // Move the file in storage
    const { error: moveError } = await supabase
      .storage
      .from("life_binder")
      .move(currentFile.object_path, newObjectPath);

    if (moveError) {
      logger.error('[BinderMove] Storage move failed', moveError, { userId, fileId, newFolder });
      throw Errors.externalApiError("Supabase Storage", "Failed to move file in storage");
    }

    // Update metadata
    const { data, error: updateError } = await supabase
      .from("binder_files")
      .update({
        folder: newFolder,
        object_path: newObjectPath
      })
      .eq("id", fileId)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      logger.error('[BinderMove] Metadata update failed, rolling back', updateError, { userId, fileId });
      // Try to rollback the storage move
      await supabase.storage.from("life_binder").move(newObjectPath, currentFile.object_path).catch((rollbackError) => {
        logger.error('[BinderMove] Rollback failed', rollbackError, { userId, fileId });
      });
      throw Errors.databaseError("Failed to update file metadata");
    }

    logger.info('[BinderMove] File moved', { userId, fileId, fromFolder: currentFile.folder, toFolder: newFolder });
    return NextResponse.json({ success: true, file: data });
  } catch (error) {
    return errorResponse(error);
  }
}


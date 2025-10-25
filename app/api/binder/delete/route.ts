import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

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
    if (!userId) {
      throw Errors.unauthorized();
    }

    const body = await req.json();
    const { fileId } = body;

    if (!fileId) {
      throw Errors.invalidInput('fileId is required');
    }

    const supabase = getAdminClient();

    // Fetch the file record
    const { data: file, error: fetchError } = await supabase
      .from("binder_files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !file) {
      logger.warn('Binder file not found for deletion', { fileId, userId: userId.substring(0, 8) + '...' });
      throw Errors.notFound('File');
    }

    // Delete from storage
    const { error: storageError } = await supabase
      .storage
      .from("life_binder")
      .remove([file.object_path]);

    if (storageError) {
      logger.warn('Failed to delete file from storage (continuing with metadata deletion)', {
        error: storageError.message,
        objectPath: file.object_path
      });
      // Continue anyway - the metadata deletion is more important
    }

    // Delete metadata record (will cascade delete shares)
    const { error: deleteError } = await supabase
      .from("binder_files")
      .delete()
      .eq("id", fileId)
      .eq("user_id", userId);

    if (deleteError) {
      logger.error('Failed to delete file metadata', deleteError, { fileId, userId });
      throw Errors.databaseError('Failed to delete file');
    }

    logger.info('Binder file deleted', {
      userId: userId.substring(0, 8) + '...',
      fileId,
      folder: file.folder
    });

    return NextResponse.json({ success: true });
    
  } catch (error) {
    return errorResponse(error);
  }
}


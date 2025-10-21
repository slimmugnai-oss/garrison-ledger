import { NextRequest, NextResponse } from "next/server";
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      throw Errors.invalidInput("Token is required");
    }

    const supabase = getAdminClient();

    // Fetch share record
    const { data: share, error: shareError } = await supabase
      .from("binder_shares")
      .select("*, binder_files(*)")
      .eq("token", token)
      .is("revoked_at", null)
      .single();

    if (shareError || !share) {
      logger.warn('[BinderShareAccess] Share not found', { token });
      throw Errors.notFound("Share link");
    }

    // Check if expired
    if (share.expires_at) {
      const expiryDate = new Date(share.expires_at);
      if (expiryDate < new Date()) {
        logger.warn('[BinderShareAccess] Expired share accessed', { token });
        return NextResponse.json(
          { error: "Share link has expired" },
          { status: 403 }
        );
      }
    }

    // Generate signed URL for the file (valid for 1 hour)
    const { data: signedUrl, error: signedError } = await supabase
      .storage
      .from("life_binder")
      .createSignedUrl(share.binder_files.object_path, 3600);

    if (signedError || !signedUrl) {
      logger.error('[BinderShareAccess] Failed to generate signed URL', signedError, { token });
      throw Errors.externalApiError("Supabase Storage", "Failed to access file");
    }

    logger.info('[BinderShareAccess] File accessed', { token, fileSize: share.binder_files.size_bytes });
    return NextResponse.json({
      file: {
        display_name: share.binder_files.display_name,
        content_type: share.binder_files.content_type,
        size_bytes: share.binder_files.size_bytes
      },
      canDownload: share.can_download,
      signedUrl: signedUrl.signedUrl
    });
  } catch (error) {
    return errorResponse(error);
  }
}


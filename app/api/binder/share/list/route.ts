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

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    const supabase = getAdminClient();

    let query = supabase
      .from("binder_shares")
      .select("*, binder_files(display_name, folder)")
      .eq("user_id", userId)
      .is("revoked_at", null);

    if (fileId) {
      query = query.eq("file_id", fileId);
    }

    const { data: shares, error } = await query.order("created_at", { ascending: false });

    if (error) {
      logger.error('[BinderShareList] Failed to fetch shares', error, { userId, fileId });
      throw Errors.databaseError("Failed to fetch share links");
    }

    // Add full URLs
    const sharesWithUrls = (shares || []).map((share) => ({
      ...share,
      url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/share/${share.token}`
    }));

    logger.info('[BinderShareList] Shares fetched', { userId, count: sharesWithUrls.length, fileId });
    return NextResponse.json({ shares: sharesWithUrls });
  } catch (error) {
    return errorResponse(error);
  }
}


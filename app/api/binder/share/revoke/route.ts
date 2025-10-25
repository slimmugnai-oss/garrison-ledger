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

    let body: { shareId?: string; token?: string };

    try {
      body = await req.json();
    } catch {
      logger.warn('[BinderShareRevoke] Invalid JSON in request', { userId });
      throw Errors.invalidInput("Invalid JSON in request body");
    }

    const { shareId, token } = body;

    if (!shareId && !token) {
      throw Errors.invalidInput("Either shareId or token is required");
    }

    const supabase = getAdminClient();

    // Soft delete by setting revoked_at
    let query = supabase
      .from("binder_shares")
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (shareId) {
      query = query.eq("id", shareId);
    } else if (token) {
      query = query.eq("token", token);
    }

    const { error } = await query;

    if (error) {
      logger.error('[BinderShareRevoke] Failed to revoke share', error, { userId, shareId, token });
      throw Errors.databaseError("Failed to revoke share link");
    }

    logger.info('[BinderShareRevoke] Share revoked', { userId, shareId, token });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}


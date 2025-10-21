import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { isPremiumServer } from "@/lib/premium";
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

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Check if premium (sharing is premium-only)
    const isPremium = await isPremiumServer(userId);
    if (!isPremium) {
      throw Errors.premiumRequired("File sharing requires premium subscription");
    }

    let body: {
      fileId: string;
      canDownload?: boolean;
      expiresAt?: string;
    };

    try {
      body = await req.json();
    } catch (jsonError) {
      logger.warn('[BinderShareCreate] Invalid JSON in request', { userId });
      throw Errors.invalidInput("Invalid JSON in request body");
    }

    const { fileId, canDownload = true, expiresAt } = body;

    if (!fileId) {
      throw Errors.invalidInput("fileId is required");
    }

    // Validate expiresAt if provided
    if (expiresAt && isNaN(new Date(expiresAt).getTime())) {
      throw Errors.invalidInput("Invalid date format for expiresAt");
    }

    const supabase = getAdminClient();

    // Verify file ownership
    const { data: file, error: fileError } = await supabase
      .from("binder_files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", userId)
      .single();

    if (fileError || !file) {
      logger.warn('[BinderShareCreate] File not found', { userId, fileId });
      throw Errors.notFound("File");
    }

    // Create share record
    const token = generateToken();

    const { data: share, error: shareError } = await supabase
      .from("binder_shares")
      .insert({
        user_id: userId,
        file_id: fileId,
        token,
        can_download: canDownload,
        expires_at: expiresAt || null
      })
      .select()
      .single();

    if (shareError) {
      logger.error('[BinderShareCreate] Failed to create share', shareError, { userId, fileId });
      throw Errors.databaseError("Failed to create share link");
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/share/${token}`;

    logger.info('[BinderShareCreate] Share link created', { userId, fileId, token, canDownload, hasExpiry: !!expiresAt });
    return NextResponse.json({
      success: true,
      share: {
        ...share,
        url: shareUrl
      }
    });
  } catch (error) {
    return errorResponse(error);
  }
}


import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { isPremiumServer } from "@/lib/premium";

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
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if premium (sharing is premium-only)
  const isPremium = await isPremiumServer(userId);
  if (!isPremium) {
    return NextResponse.json(
      { error: "Sharing requires premium subscription" },
      { status: 403 }
    );
  }

  let body: {
    fileId: string;
    canDownload?: boolean;
    expiresAt?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { fileId, canDownload = true, expiresAt } = body;

  if (!fileId) {
    return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
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
    return NextResponse.json({ error: "File not found" }, { status: 404 });
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
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/share/${token}`;

  return NextResponse.json({
    success: true,
    share: {
      ...share,
      url: shareUrl
    }
  });
}


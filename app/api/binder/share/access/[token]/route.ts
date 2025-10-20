import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
  const { token } = await params;

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
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
    return NextResponse.json(
      { error: "Share link not found or has been revoked" },
      { status: 404 }
    );
  }

  // Check if expired
  if (share.expires_at) {
    const expiryDate = new Date(share.expires_at);
    if (expiryDate < new Date()) {
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
    return NextResponse.json(
      { error: "Failed to access file" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    file: {
      display_name: share.binder_files.display_name,
      content_type: share.binder_files.content_type,
      size_bytes: share.binder_files.size_bytes
    },
    canDownload: share.can_download,
    signedUrl: signedUrl.signedUrl
  });
}


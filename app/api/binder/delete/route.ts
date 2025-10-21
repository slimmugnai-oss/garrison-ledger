import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
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

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { fileId: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { fileId } = body;

  if (!fileId) {
    return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
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
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Delete from storage
  const { error: storageError } = await supabase
    .storage
    .from("life_binder")
    .remove([file.object_path]);

  if (storageError) {
    // Continue anyway - the metadata deletion is more important
  }

  // Delete metadata record (will cascade delete shares)
  const { error: deleteError } = await supabase
    .from("binder_files")
    .delete()
    .eq("id", fileId)
    .eq("user_id", userId);

  if (deleteError) {
    return NextResponse.json(
      { error: "Failed to delete file metadata" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}


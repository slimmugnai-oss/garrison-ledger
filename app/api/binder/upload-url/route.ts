import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { isPremiumServer } from "@/lib/premium";

export const runtime = "nodejs";

const FOLDER_NAMES = [
  "Personal Records",
  "PCS Documents",
  "Financial Records",
  "Housing Records",
  "Legal"
] as const;

const FREE_STORAGE_LIMIT = 100 * 1024 * 1024; // 100 MB
const PREMIUM_STORAGE_LIMIT = 10 * 1024 * 1024 * 1024; // 10 GB

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

  let body: {
    folder: string;
    displayName: string;
    contentType: string;
    sizeBytes: number;
    docType?: string;
    expiresOn?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { folder, displayName, contentType, sizeBytes, docType, expiresOn } = body;

  // Validate folder
  if (!FOLDER_NAMES.includes(folder as any)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  // Validate file
  if (!displayName || !contentType || !sizeBytes) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getAdminClient();

  // Check current storage usage
  const { data: existingFiles, error: fetchError } = await supabase
    .from("binder_files")
    .select("size_bytes")
    .eq("user_id", userId);

  if (fetchError) {
    console.error("Error fetching storage usage:", fetchError);
    return NextResponse.json(
      { error: "Failed to check storage usage" },
      { status: 500 }
    );
  }

  const currentUsage = existingFiles?.reduce((sum, f) => sum + (f.size_bytes || 0), 0) || 0;
  const isPremium = await isPremiumServer(userId);
  const storageLimit = isPremium ? PREMIUM_STORAGE_LIMIT : FREE_STORAGE_LIMIT;

  if (currentUsage + sizeBytes > storageLimit) {
    return NextResponse.json(
      {
        error: "Storage limit exceeded",
        currentUsage,
        limit: storageLimit,
        isPremium
      },
      { status: 403 }
    );
  }

  // Generate unique file key
  const fileId = crypto.randomUUID();
  const extension = displayName.split(".").pop() || "bin";
  const objectPath = `${userId}/${folder}/${fileId}.${extension}`;

  // Insert metadata record
  const { data: fileRecord, error: insertError } = await supabase
    .from("binder_files")
    .insert({
      user_id: userId,
      object_path: objectPath,
      folder,
      doc_type: docType || "other",
      display_name: displayName,
      size_bytes: sizeBytes,
      content_type: contentType,
      expires_on: expiresOn || null
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error inserting file record:", insertError);
    return NextResponse.json(
      { error: "Failed to create file record" },
      { status: 500 }
    );
  }

  // Generate signed upload URL (60 seconds)
  const { data: signedData, error: signedError } = await supabase
    .storage
    .from("life_binder")
    .createSignedUploadUrl(objectPath);

  if (signedError) {
    console.error("Error creating signed URL:", signedError);
    // Rollback the file record
    await supabase.from("binder_files").delete().eq("id", fileRecord.id);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    uploadUrl: signedData.signedUrl,
    token: signedData.token,
    path: objectPath,
    fileId: fileRecord.id
  });
}


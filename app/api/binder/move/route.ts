import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

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
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { fileId: string; newFolder: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { fileId, newFolder } = body;

  if (!fileId || !newFolder) {
    return NextResponse.json(
      { error: "Missing fileId or newFolder" },
      { status: 400 }
    );
  }

  if (!FOLDER_NAMES.includes(newFolder as typeof FOLDER_NAMES[number])) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
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
    return NextResponse.json({ error: "File not found" }, { status: 404 });
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
    return NextResponse.json(
      { error: "Failed to move file in storage" },
      { status: 500 }
    );
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
    // Try to rollback the storage move
    await supabase.storage.from("life_binder").move(newObjectPath, currentFile.object_path);
    return NextResponse.json(
      { error: "Failed to update file metadata" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, file: data });
}


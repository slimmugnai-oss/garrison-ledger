import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { isPremiumServer } from "@/lib/premium";

export const runtime = "nodejs";

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

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder");

    const supabase = getAdminClient();

  // Fetch files
  let query = supabase
    .from("binder_files")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (folder) {
    query = query.eq("folder", folder);
  }

  const { data: files, error: filesError } = await query;

  if (filesError) {
    console.error("Error fetching files:", filesError);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }

  // Calculate storage usage
  const totalUsage = files?.reduce((sum, f) => sum + (f.size_bytes || 0), 0) || 0;
  const isPremium = await isPremiumServer(userId);
  const storageLimit = isPremium ? PREMIUM_STORAGE_LIMIT : FREE_STORAGE_LIMIT;

  // For now, return files without signed URLs to isolate the issue
  const filesWithoutUrls = (files || []).map(file => ({
    ...file,
    signedUrl: null
  }));

  // Count files per folder
  const folderCounts = (files || []).reduce((acc, file) => {
    acc[file.folder] = (acc[file.folder] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

    return NextResponse.json({
      files: filesWithoutUrls,
      storage: {
        used: totalUsage,
        limit: storageLimit,
        isPremium
      },
      folderCounts
    });
  } catch (error) {
    console.error("List API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}


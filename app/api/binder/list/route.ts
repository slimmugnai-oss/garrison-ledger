import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { isPremiumServer } from "@/lib/premium";

export const runtime = "nodejs";

const FREE_STORAGE_LIMIT = 25 * 1024 * 1024; // 25 MB (forces upgrade incentive)
const PREMIUM_STORAGE_LIMIT = 1 * 1024 * 1024 * 1024; // 1 GB (plenty for most users)
const PRO_STORAGE_LIMIT = 10 * 1024 * 1024 * 1024; // 10 GB (power users)

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
  
  // Get user's tier to determine storage limit
  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('tier, status')
    .eq('user_id', userId)
    .maybeSingle();
  
  const tier = (entitlement?.tier === 'premium' || entitlement?.tier === 'pro') && entitlement?.status === 'active' 
    ? entitlement.tier 
    : 'free';
  
  let storageLimit = FREE_STORAGE_LIMIT;
  if (tier === 'pro') {
    storageLimit = PRO_STORAGE_LIMIT;
  } else if (tier === 'premium') {
    storageLimit = PREMIUM_STORAGE_LIMIT;
  }
  
  const isPremium = tier === 'premium' || tier === 'pro';

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


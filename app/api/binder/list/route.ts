import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const FREE_STORAGE_LIMIT = 1 * 1024 * 1024 * 1024; // 1 GB
const PREMIUM_STORAGE_LIMIT = 5 * 1024 * 1024 * 1024; // 5 GB

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
      logger.error('[BinderList] Failed to fetch files', filesError, { userId, folder });
      throw Errors.databaseError("Failed to fetch files");
    }

  // Calculate storage usage
  const totalUsage = files?.reduce((sum, f) => sum + (f.size_bytes || 0), 0) || 0;
  
  // Get user's tier to determine storage limit
  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('tier, status')
    .eq('user_id', userId)
    .maybeSingle();
  
  const tier = entitlement?.tier === 'premium' && entitlement?.status === 'active' 
    ? 'premium'
    : 'free';
  
  let storageLimit = FREE_STORAGE_LIMIT;
  if (tier === 'premium') {
    storageLimit = PREMIUM_STORAGE_LIMIT;
  }
  
  const isPremium = tier === 'premium';

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

    logger.info('[BinderList] Files fetched', { 
      userId, 
      count: files?.length || 0,
      folder,
      storageUsed: totalUsage,
      isPremium
    });

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
    return errorResponse(error);
  }
}


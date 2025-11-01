import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { checkAndIncrement } from "@/lib/limits";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

const FOLDER_NAMES = [
  "Personal Records",
  "PCS Documents",
  "Financial Records",
  "Housing Records",
  "Legal"
] as const;

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


export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw Errors.unauthorized();
    }

    const body = await req.json();
    
    if (!body || typeof body !== 'object') {
      throw Errors.invalidInput('Invalid request body');
    }

    const { folder, displayName, contentType, sizeBytes, docType, expiresOn } = body;

    // Validate folder
    if (!FOLDER_NAMES.includes(folder as typeof FOLDER_NAMES[number])) {
      throw Errors.invalidInput('Invalid folder', { folder, validFolders: FOLDER_NAMES });
    }

    // Validate file
    if (!displayName || !contentType || !sizeBytes) {
      throw Errors.invalidInput('Missing required fields', { 
        missing: { 
          displayName: !displayName, 
          contentType: !contentType, 
          sizeBytes: !sizeBytes 
        }
      });
    }

    const supabase = getAdminClient();

    // RATE LIMITING: Prevent upload spam (100/day free, 1000/day premium)
    // Check tier first
    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();
    
    const tier = entitlement?.tier === 'premium' && entitlement?.status === 'active' 
      ? 'premium'
      : 'free';
    
    const limit = tier === 'premium' ? 1000 : 100;
    const rateLimitResult = await checkAndIncrement(userId, '/api/binder/upload-url', limit);
    
    if (!rateLimitResult.allowed) {
      throw Errors.rateLimitExceeded(
        `Daily file upload limit reached (${limit}/day). ${tier === 'free' ? 'Upgrade to Premium for higher limits.' : ''}`
      );
    }

  // Ensure user profile exists
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email: "", // Will be updated later
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: "id"
    });

    if (profileError) {
      logger.error('Failed to create user profile for binder', profileError, { userId });
      throw Errors.databaseError('Failed to initialize user profile');
    }

    // Check current storage usage
    const { data: existingFiles, error: fetchError } = await supabase
      .from("binder_files")
      .select("size_bytes")
      .eq("user_id", userId);

    if (fetchError) {
      logger.error('Failed to check storage usage', fetchError, { userId });
      throw Errors.databaseError('Failed to check storage usage');
    }

    const currentUsage = existingFiles?.reduce((sum, f) => sum + (f.size_bytes || 0), 0) || 0;
    
    // Use tier from rate limiting check above for storage limit
    let storageLimit = FREE_STORAGE_LIMIT;
    if (tier === 'premium') {
      storageLimit = PREMIUM_STORAGE_LIMIT;
    }

    if (currentUsage + sizeBytes > storageLimit) {
      logger.info('Storage limit exceeded', {
        userId: userId.substring(0, 8) + '...',
        currentUsage,
        limit: storageLimit,
        tier,
        requestedSize: sizeBytes
      });
      
      throw Errors.premiumRequired(
        `Storage limit exceeded. Current: ${(currentUsage / 1024 / 1024).toFixed(0)}MB, Limit: ${(storageLimit / 1024 / 1024).toFixed(0)}MB. ${tier === 'free' ? 'Upgrade to Premium for 5GB storage.' : ''}`
      );
    }

    // Generate unique file key
    const fileId = crypto.randomUUID();
    const extension = displayName.split(".").pop() || "bin";
    const objectPath = `${userId}/${folder}/${fileId}.${extension}`;

    // Insert metadata record using service role (bypasses RLS)
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
      logger.error('Failed to create file record', insertError, { userId, folder });
      throw Errors.databaseError('Failed to create file record');
    }

    // Generate signed upload URL (60 seconds)
    const { data: signedData, error: signedError } = await supabase
      .storage
      .from("life_binder")
      .createSignedUploadUrl(objectPath);

    if (signedError) {
      logger.error('Failed to generate upload URL', signedError, { userId, objectPath });
      
      // Rollback the file record
      try {
        await supabase.from("binder_files").delete().eq("id", fileRecord.id);
      } catch (rollbackError) {
        logger.error('Failed to rollback file record', rollbackError, { fileId: fileRecord.id });
      }
      
      throw Errors.externalApiError('Storage', 'Failed to generate upload URL');
    }

    logger.info('Binder upload URL generated', {
      userId: userId.substring(0, 8) + '...',
      fileId: fileRecord.id,
      folder,
      sizeBytes
    });

    return NextResponse.json({
      uploadUrl: signedData.signedUrl,
      token: signedData.token,
      path: objectPath,
      fileId: fileRecord.id
    });
    
  } catch (error) {
    return errorResponse(error);
  }
}


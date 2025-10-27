import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check premium access
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("tier")
      .eq("user_id", userId)
      .single();

    if (!profile || (profile.tier !== "premium" && profile.tier !== "enterprise")) {
      return NextResponse.json({ error: "Premium access required" }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const claimId = formData.get("claimId") as string;

    if (!file || !claimId) {
      return NextResponse.json({ error: "Missing file or claimId" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf", "image/tiff"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${userId}/${claimId}/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("pcs-documents")
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      logger.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage.from("pcs-documents").getPublicUrl(fileName);

    // Generate thumbnail for images
    let thumbnailUrl: string | undefined;
    if (file.type.startsWith("image/")) {
      try {
        // For now, we'll use the same URL as thumbnail
        // In production, you'd generate a proper thumbnail
        thumbnailUrl = urlData.publicUrl;
      } catch (error) {
        logger.error("Thumbnail generation error:", error);
        // Continue without thumbnail
      }
    }

    // Save document record to database
    // For wizard mode (temp-wizard), skip database insert - OCR will happen in-memory
    let documentData: any;
    
    if (claimId === "temp-wizard") {
      // Wizard mode: Return temp document for OCR processing only
      documentData = {
        id: `temp-${timestamp}`,
        claim_id: claimId,
        user_id: userId,
        file_name: file.name,
        file_path: fileName,
        file_size: file.size,
        file_type: file.type,
        storage_url: urlData.publicUrl,
        thumbnail_url: thumbnailUrl,
        upload_status: "temp",
        created_at: new Date().toISOString(),
      };
      
      logger.info("PCS document uploaded (wizard mode - temp)", {
        userId,
        claimId,
        fileName: file.name,
        fileSize: file.size,
      });
    } else {
      // Real claim mode: Save to database
      const { data, error: dbError } = await supabaseAdmin
        .from("pcs_claim_documents")
        .insert({
          claim_id: claimId,
          user_id: userId,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          file_type: file.type,
          storage_url: urlData.publicUrl,
          thumbnail_url: thumbnailUrl,
          upload_status: "uploaded",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) {
        logger.error("Database insert error:", dbError);
        return NextResponse.json({ error: "Failed to save document record" }, { status: 500 });
      }
      
      documentData = data;
    }

    return NextResponse.json({
      success: true,
      documentId: documentData.id,
      url: urlData.publicUrl,
      thumbnail: thumbnailUrl,
      needsOCR: file.type.startsWith("image/") || file.type === "application/pdf",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Document upload API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

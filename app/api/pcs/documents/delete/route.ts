import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { documentId, claimId } = await request.json();

    if (!documentId || !claimId) {
      return NextResponse.json({ error: "Missing documentId or claimId" }, { status: 400 });
    }

    // Get document from database
    const { data: document, error: docError } = await supabaseAdmin
      .from("pcs_claim_documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", userId)
      .eq("claim_id", claimId)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete from storage
    const { error: storageError } = await supabaseAdmin.storage
      .from("pcs-documents")
      .remove([document.file_path]);

    if (storageError) {
      logger.error("Storage deletion error:", storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from("pcs_claim_documents")
      .delete()
      .eq("id", documentId)
      .eq("user_id", userId);

    if (dbError) {
      logger.error("Database deletion error:", dbError);
      return NextResponse.json({ error: "Failed to delete document record" }, { status: 500 });
    }

    logger.info("PCS document deleted successfully", {
      userId,
      claimId,
      documentId,
      fileName: document.file_name,
    });

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Document deletion API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

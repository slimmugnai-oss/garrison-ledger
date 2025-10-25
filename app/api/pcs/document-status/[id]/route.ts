import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * PCS DOCUMENT STATUS - POLLING ENDPOINT
 * 
 * Returns OCR processing status for uploaded documents
 * Used by UI to show progress and confidence scores
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const documentId = params.id;

    // Get document status
    const { data: document, error } = await supabaseAdmin
      .from('pcs_claim_documents')
      .select(`
        id,
        file_name,
        document_type,
        ocr_status,
        ocr_data,
        normalized_data,
        created_at,
        updated_at,
        pcs_claims!inner(user_id)
      `)
      .eq('id', documentId)
      .eq('pcs_claims.user_id', userId)
      .maybeSingle();

    if (error) {
      logger.error('[PCSDocumentStatus] Database error', error, { userId, documentId });
      throw Errors.databaseError('Failed to fetch document status');
    }

    if (!document) {
      throw Errors.notFound('Document');
    }

    // Calculate processing time
    const processingTime = document.updated_at 
      ? new Date(document.updated_at).getTime() - new Date(document.created_at).getTime()
      : null;

    // Extract confidence data
    const confidence = document.normalized_data?.ocr_confidence || 0;
    const confidenceLevel = document.normalized_data?.ocr_confidence_level || 'unknown';
    const requiresReview = document.normalized_data?.requires_manual_review || false;

    const status = {
      id: document.id,
      fileName: document.file_name,
      documentType: document.document_type,
      ocrStatus: document.ocr_status,
      confidence: {
        score: confidence,
        level: confidenceLevel,
        requiresReview
      },
      processingTime: processingTime ? Math.round(processingTime / 1000) : null, // seconds
      extractedData: document.ocr_data,
      normalizedData: document.normalized_data,
      lastUpdated: document.updated_at
    };

    logger.info('[PCSDocumentStatus] Status retrieved', { 
      userId, 
      documentId, 
      ocrStatus: document.ocr_status,
      confidence 
    });

    return NextResponse.json({ success: true, status });

  } catch (error) {
    return errorResponse(error);
  }
}

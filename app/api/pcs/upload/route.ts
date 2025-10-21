import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * PCS MONEY COPILOT - DOCUMENT UPLOAD & OCR
 * 
 * Handles upload of PCS documents (orders, receipts, weigh tickets, etc.)
 * Uses Gemini 2.0 Flash Vision for OCR and data extraction
 * 
 * Free: 3 uploads per month
 * Premium: Unlimited uploads
 */

interface UploadRequest {
  claimId: string;
  documentType: string;
  fileName: string;
  fileData: string; // Base64 encoded
  contentType: string;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const body: UploadRequest = await req.json();
    const { claimId, documentType, fileName, fileData, contentType } = body;

    if (!claimId || !documentType || !fileName || !fileData || !contentType) {
      throw Errors.invalidInput('claimId, documentType, fileName, fileData, and contentType are required');
    }

    // Check user's tier and upload limits
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const tier = entitlement?.tier || 'free';
    const isPremium = tier === 'premium' && entitlement?.status === 'active';

    // PREMIUM-ONLY FEATURE: Block free users completely
    if (!isPremium) {
      throw Errors.premiumRequired('PCS Money Copilot is available for Premium members only');
    }

    // Verify claim belongs to user
    const { data: claim } = await supabaseAdmin
      .from('pcs_claims')
      .select('id')
      .eq('id', claimId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!claim) {
      logger.warn('[PCSUpload] Claim not found', { userId, claimId });
      throw Errors.notFound('PCS claim');
    }

    // Upload to Supabase Storage
    const fileBuffer = Buffer.from(fileData.split(',')[1], 'base64');
    const filePath = `${userId}/pcs-claims/${claimId}/${Date.now()}-${fileName}`;

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('pcs-documents')
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false
      });

    if (uploadError) {
      logger.error('[PCSUpload] Storage upload failed', uploadError, { userId, claimId, fileName });
      throw Errors.externalApiError('Supabase Storage', 'Upload failed');
    }

    // Create document record
    const { data: document, error: dbError } = await supabaseAdmin
      .from('pcs_claim_documents')
      .insert({
        user_id: userId,
        claim_id: claimId,
        file_name: fileName,
        file_path: filePath,
        file_size: fileBuffer.length,
        content_type: contentType,
        document_type: documentType,
        ocr_status: 'processing'
      })
      .select()
      .single();

    if (dbError) {
      logger.error('[PCSUpload] Failed to create document record', dbError, { userId, claimId, fileName });
      throw Errors.databaseError('Failed to create document record');
    }

    // Track analytics (fire and forget)
    supabaseAdmin
      .from('pcs_analytics')
      .insert({
        user_id: userId,
        claim_id: claimId,
        event_type: 'document_uploaded',
        event_data: {
          document_id: document.id,
          document_type: documentType,
          file_size: fileBuffer.length
        }
      })
      .then(({ error: analyticsError }) => {
        if (analyticsError) {
          logger.warn('[PCSUpload] Failed to track analytics', { userId, claimId, error: analyticsError.message });
        }
      });

    const duration = Date.now() - startTime;
    logger.info('[PCSUpload] Document uploaded', { 
      userId, 
      claimId, 
      documentId: document.id,
      documentType,
      fileSize: fileBuffer.length,
      duration
    });

    // Start OCR processing (async)

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        fileName: document.file_name,
        documentType: document.document_type,
        status: 'processing'
      }
    });

  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Process OCR with Gemini 2.0 Flash Vision
 * Runs async after upload completes
 * 
 * TODO: Integrate this function into the upload flow
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function processOCR(
  documentId: string,
  fileData: string,
  contentType: string,
  documentType: string
) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp'
    });

    // Extract base64 image data
    const base64Data = fileData.split(',')[1];

    const prompt = getOCRPrompt(documentType);

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: contentType,
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const extractedText = response.text();

    // Parse OCR response
    let ocrData: Record<string, unknown>;
    try {
      ocrData = JSON.parse(extractedText);
    } catch {
      ocrData = { raw_text: extractedText };
    }

    // Calculate OCR confidence score
    const ocrConfidence = calculateOCRConfidence(ocrData, documentType);

    // Normalize data based on document type
    const normalizedData = normalizeDocument(documentType, ocrData);

    // Update document record with OCR confidence
    await supabaseAdmin
      .from('pcs_claim_documents')
      .update({
        ocr_status: ocrConfidence.score >= 70 ? 'completed' : 'needs_review',
        ocr_data: ocrData,
        normalized_data: {
          ...normalizedData,
          ocr_confidence: ocrConfidence.score,
          ocr_confidence_level: ocrConfidence.level,
          requires_manual_review: ocrConfidence.score < 70
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    // Track completion
    const { data: doc } = await supabaseAdmin
      .from('pcs_claim_documents')
      .select('user_id, claim_id')
      .eq('id', documentId)
      .single();

    if (doc) {
      await supabaseAdmin
        .from('pcs_analytics')
        .insert({
          user_id: doc.user_id,
          claim_id: doc.claim_id,
          event_type: 'ocr_completed',
          event_data: {
            document_id: documentId,
            document_type: documentType
          }
        });
    }

  } catch (error) {
    logger.error('[PCSUpload] OCR processing failed', error, { documentId, documentType });
    
    // Update status to failed
    await supabaseAdmin
      .from('pcs_claim_documents')
      .update({
        ocr_status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);
  }
}

/**
 * Get OCR prompt based on document type
 */
function getOCRPrompt(documentType: string): string {
  const basePrompt = 'Extract all text and data from this document. Return JSON with structured data.';

  const typeSpecificPrompts: Record<string, string> = {
    orders: `Extract PCS orders information:
{
  "member_name": "string",
  "rank": "string",
  "branch": "string",
  "orders_date": "YYYY-MM-DD",
  "report_date": "YYYY-MM-DD",
  "departure_date": "YYYY-MM-DD",
  "origin_base": "string",
  "destination_base": "string",
  "dependents_authorized": "number",
  "ppm_authorized": "boolean",
  "hhg_weight_allowance": "number",
  "raw_text": "full extracted text"
}`,
    weigh_ticket: `Extract weigh ticket information:
{
  "weigh_date": "YYYY-MM-DD",
  "empty_weight": "number (pounds)",
  "full_weight": "number (pounds)",
  "net_weight": "number (pounds)",
  "vehicle_info": "string",
  "location": "string",
  "raw_text": "full extracted text"
}`,
    lodging_receipt: `Extract lodging receipt information:
{
  "vendor": "string (hotel name)",
  "location": "string (city, state)",
  "check_in_date": "YYYY-MM-DD",
  "check_out_date": "YYYY-MM-DD",
  "nights": "number",
  "total_amount": "number (USD)",
  "room_rate": "number (USD per night)",
  "taxes_fees": "number (USD)",
  "confirmation_number": "string",
  "raw_text": "full extracted text"
}`,
    fuel_receipt: `Extract fuel receipt information:
{
  "vendor": "string (gas station)",
  "location": "string (city, state)",
  "date": "YYYY-MM-DD",
  "gallons": "number",
  "price_per_gallon": "number (USD)",
  "total_amount": "number (USD)",
  "raw_text": "full extracted text"
}`,
    meal_receipt: `Extract meal receipt information:
{
  "vendor": "string (restaurant)",
  "location": "string (city, state)",
  "date": "YYYY-MM-DD",
  "total_amount": "number (USD)",
  "raw_text": "full extracted text"
}`
  };

  return typeSpecificPrompts[documentType] || basePrompt;
}

/**
 * Normalize extracted data into standard format
 */
function normalizeDocument(documentType: string, ocrData: Record<string, unknown>): Record<string, unknown> {
  // Basic normalization - can be enhanced
  return {
    document_type: documentType,
    extracted_at: new Date().toISOString(),
    ...ocrData
  };
}

/**
 * Calculate OCR confidence score based on extracted data quality
 */
function calculateOCRConfidence(
  ocrData: Record<string, unknown>,
  documentType: string
): {
  score: number;
  level: 'high' | 'medium' | 'low';
  message: string;
} {
  let score = 0;
  const requiredFields: Record<string, string[]> = {
    orders: ['member_name', 'rank', 'orders_date', 'origin_base', 'destination_base'],
    weigh_ticket: ['weigh_date', 'weight', 'vehicle_info', 'location'],
    lodging_receipt: ['vendor', 'location', 'check_in_date', 'check_out_date', 'total_amount'],
    fuel_receipt: ['vendor', 'location', 'date', 'total_amount'],
    meal_receipt: ['vendor', 'location', 'date', 'total_amount']
  };

  const required = requiredFields[documentType] || [];
  const fieldsPresent = required.filter(field => {
    const value = ocrData[field];
    return value !== null && value !== undefined && value !== '';
  });

  // Calculate score based on field completeness
  if (required.length > 0) {
    score = Math.round((fieldsPresent.length / required.length) * 100);
  } else {
    // For 'other' documents, check if we have any meaningful data
    score = Object.keys(ocrData).length > 2 ? 80 : 50;
  }

  const level = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';
  const message = level === 'high'
    ? 'OCR extraction successful - all key fields identified'
    : level === 'medium'
    ? 'OCR extraction partial - please review and confirm accuracy'
    : 'OCR extraction incomplete - manual entry recommended';

  return { score, level, message };
}


import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * PCS MONEY COPILOT - DOCUMENT UPLOAD & OCR
 * 
 * Handles upload of PCS documents (orders, receipts, weigh tickets, etc.)
 * Uses Gemini 2.0 Flash Vision for OCR and data extraction
 * 
 * Free: 3 uploads per month
 * Premium/Pro: Unlimited uploads
 */

const DOCUMENT_TYPES = {
  orders: 'PCS Orders',
  weigh_ticket: 'Weigh Ticket',
  lodging_receipt: 'Lodging Receipt',
  fuel_receipt: 'Fuel Receipt',
  meal_receipt: 'Meal Receipt',
  other: 'Other Document'
} as const;

interface UploadRequest {
  claimId: string;
  documentType: keyof typeof DOCUMENT_TYPES;
  fileName: string;
  fileData: string; // Base64 encoded
  contentType: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UploadRequest = await req.json();
    const { claimId, documentType, fileName, fileData, contentType } = body;

    // Check user's tier and upload limits
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const tier = entitlement?.tier || 'free';
    const isPremium = (tier === 'premium' || tier === 'pro') && entitlement?.status === 'active';

    // Check upload count for free users
    if (!isPremium) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabaseAdmin
        .from('pcs_claim_documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      if (count && count >= 3) {
        return NextResponse.json({
          error: 'Upload limit reached',
          details: 'Free users can upload 3 documents per month. Upgrade to Premium for unlimited uploads.',
          upgradeRequired: true
        }, { status: 403 });
      }
    }

    // Verify claim belongs to user
    const { data: claim } = await supabaseAdmin
      .from('pcs_claims')
      .select('id')
      .eq('id', claimId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
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
      console.error('[PCS Upload] Storage error:', uploadError);
      return NextResponse.json({ 
        error: 'Upload failed', 
        details: uploadError.message 
      }, { status: 500 });
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
      console.error('[PCS Upload] Database error:', dbError);
      return NextResponse.json({ 
        error: 'Failed to create document record', 
        details: dbError.message 
      }, { status: 500 });
    }

    // Track analytics
    await supabaseAdmin
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
      });

    // Start OCR processing (async)
    processOCR(document.id, fileData, contentType, documentType).catch(console.error);

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
    console.error('[PCS Upload] Error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

/**
 * Process OCR with Gemini 2.0 Flash Vision
 * Runs async after upload completes
 */
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

    // Normalize data based on document type
    const normalizedData = normalizeDocument(documentType, ocrData);

    // Update document record
    await supabaseAdmin
      .from('pcs_claim_documents')
      .update({
        ocr_status: 'completed',
        ocr_data: ocrData,
        normalized_data: normalizedData,
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
    console.error('[PCS OCR] Error:', error);
    
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


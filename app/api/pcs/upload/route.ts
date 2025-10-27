import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * PCS MONEY COPILOT - DOCUMENT UPLOAD & OCR
 * 
 * Handles upload of PCS documents (orders, receipts, weigh tickets, etc.)
 * Uses Gemini 2.5 Flash for OCR and data extraction
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
    processOCR(document.id, fileData, contentType, documentType).catch(err => {
      logger.error('[PCSUpload] OCR processing failed', err, { userId, claimId, documentId: document.id });
    });

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
      model: 'gemini-2.5-flash'
    });

    // Extract base64 image data
    const base64Data = fileData.split(',')[1];

    // STEP 1: Detect branch first (for PCS orders only) - improves accuracy!
    let detectedBranch: string | null = null;
    if (documentType === 'orders') {
      const branchDetectionPrompt = `Analyze this military document and identify ONLY the service branch.
      
Look for these indicators:
- Army: "DEPARTMENT OF THE ARMY", "DA Form", "Fort", Army ranks (PVT, SPC, SGT)
- Navy: "DEPARTMENT OF THE NAVY" + ship/naval station, Navy ranks (SR, SN, PO)
- Air Force: "DEPARTMENT OF THE AIR FORCE", "AFB", Air Force ranks (AB, Amn, SSgt)
- Marine Corps: "USMC", "Marine Corps", "MCB", Marine ranks (Pvt, LCpl, Cpl)
- Coast Guard: "USCG", "Coast Guard", USCG ranks
- Space Force: "USSF", "Space Force", "SFB"

Return ONLY ONE WORD: Army, Navy, AirForce, MarineCorps, CoastGuard, or SpaceForce. If unclear, return "Unknown".`;

      try {
        const branchResult = await model.generateContent([
          branchDetectionPrompt,
          {
            inlineData: {
              mimeType: contentType,
              data: base64Data
            }
          }
        ]);
        
        const branchResponse = await branchResult.response;
        detectedBranch = branchResponse.text().trim();
        logger.info('[OCR Branch Detection]', { detectedBranch, documentId });
      } catch (error) {
        logger.warn('[OCR Branch Detection] Failed, using generic prompt', { error, documentId });
      }
    }

    // STEP 2: Use branch-specific prompt if detected
    const prompt = documentType === 'orders' && detectedBranch && detectedBranch !== 'Unknown'
      ? getBranchSpecificPrompt(detectedBranch)
      : getOCRPrompt(documentType);

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

    // Calculate OCR confidence score (now with field-level scoring!)
    const ocrConfidence = calculateOCRConfidence(ocrData, documentType);

    // Normalize data based on document type
    const normalizedData = normalizeDocument(documentType, ocrData);

    // Update document record with OCR confidence AND field scores
    await supabaseAdmin
      .from('pcs_claim_documents')
      .update({
        ocr_status: ocrConfidence.score >= 70 ? 'completed' : 'needs_review',
        ocr_data: ocrData,
        normalized_data: {
          ...normalizedData,
          ocr_confidence: ocrConfidence.score,
          ocr_confidence_level: ocrConfidence.level,
          requires_manual_review: ocrConfidence.score < 70,
          field_confidence_scores: ocrConfidence.fieldScores // NEW: Per-field confidence!
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
    orders: `You are extracting data from a military PCS (Permanent Change of Station) order.

CONTEXT: PCS orders are official military documents that authorize a service member to relocate to a new duty station. These orders are issued by the Department of Defense and follow specific formatting conventions that vary slightly by service branch.

COMMON FORMATTING PATTERNS:
- Orders typically start with "PERMANENT CHANGE OF STATION ORDERS" or "PCS ORDERS" as the header
- The document usually includes an order number (e.g., "Order No. 123-45")
- Member's rank appears BEFORE their name (e.g., "SSG SMITH, JOHN A" or "CPT RODRIGUEZ, MARIA")
- Dates are typically in DD MMM YYYY format (e.g., "15 JAN 2025" or "01 FEB 2025")
- Service branches use different terminology:
  * Army: "Fort", "Installation"
  * Navy: "Naval Station", "NAS", "Naval Air Station"
  * Air Force: "AFB" (Air Force Base), "Wing"
  * Marines: "MCB" (Marine Corps Base), "MCAS" (Marine Corps Air Station)
  * Coast Guard: "Station", "Sector"
  * Space Force: "SFB" (Space Force Base)

RANK FORMATS BY BRANCH:
- Army: PVT, PV2, PFC, SPC, CPL, SGT, SSG, SFC, MSG, 1SG, SGM, CSM, 2LT, 1LT, CPT, MAJ, LTC, COL, BG, MG, LTG, GEN
- Navy: SR, SA, SN, PO3, PO2, PO1, CPO, SCPO, MCPO, ENS, LTJG, LT, LCDR, CDR, CAPT, RDML, RADM, VADM, ADM
- Air Force: AB, Amn, A1C, SrA, SSgt, TSgt, MSgt, SMSgt, CMSgt, 2Lt, 1Lt, Capt, Maj, Lt Col, Col, Brig Gen, Maj Gen, Lt Gen, Gen
- Marines: Pvt, PFC, LCpl, Cpl, Sgt, SSgt, GySgt, MSgt, 1stSgt, MGySgt, SgtMaj, 2ndLt, 1stLt, Capt, Maj, LtCol, Col, BGen, MajGen, LtGen, Gen
- Coast Guard: SR, SA, SN, PO3, PO2, PO1, CPO, SCPO, MCPO, ENS, LTJG, LT, LCDR, CDR, CAPT, RDML, RADM, VADM, ADM

BASE NAME NORMALIZATION:
- Convert abbreviated base names to full official names
- Examples:
  * "Ft Liberty" → "Fort Liberty, NC"
  * "Ft Bragg" → "Fort Liberty, NC" (renamed in 2023)
  * "JBLM" → "Joint Base Lewis-McChord, WA"
  * "NAS Pensacola" → "Naval Air Station Pensacola, FL"
  * "Travis AFB" → "Travis Air Force Base, CA"

REQUIRED FIELDS TO EXTRACT:
{
  "member_name": "Last, First Middle Initial (e.g., SMITH, JOHN A or RODRIGUEZ, MARIA C)",
  "rank": "Rank abbreviation (e.g., E-6, SSG, CPT, PO1) - include both paygrade and abbreviation if available",
  "branch": "Army, Navy, Air Force, Marine Corps, Space Force, or Coast Guard",
  "orders_date": "Date orders were issued (YYYY-MM-DD format)",
  "report_date": "Date member must report to new duty station (YYYY-MM-DD format)",
  "departure_date": "Authorized departure date from current location (YYYY-MM-DD format) - may be labeled 'proceed date' or 'depart on or about'",
  "origin_base": "Current duty station with location (e.g., 'Fort Liberty, NC' or 'Naval Station Norfolk, VA')",
  "destination_base": "New duty station with location (e.g., 'Joint Base Lewis-McChord, WA')",
  "dependents_authorized": "Number of authorized dependents (0 if none, extract from 'dependents: X' or similar)",
  "ppm_authorized": "true if Personally Procured Move (PPM/DITY move) is authorized, false otherwise",
  "hhg_weight_allowance": "Household goods weight allowance in pounds (e.g., 12000 for 12,000 lbs)",
  "order_number": "Official order number if present (e.g., 'Order No. 123-45')",
  "issuing_authority": "Authority that issued the orders (e.g., 'HQ FORSCOM' or 'BUPERS')",
  "raw_text": "Complete extracted text from the document for reference",
  "confidence_notes": "List any fields that were unclear or hard to extract"
}

EXTRACTION RULES:
1. If a field is not found in the document, return null for that field (do not guess)
2. Normalize ALL base names to official DOD format with state/location
3. Convert ALL dates to YYYY-MM-DD format (even if source uses different format)
4. For rank, try to extract both paygrade (E-6) AND abbreviation (SSG) if both are present
5. Look for common synonyms:
   - "Proceed date" = departure_date
   - "Report NLT" (No Later Than) = report_date
   - "Authorized dependents" or "Family members" = dependents_authorized
   - "HHG" or "Household Goods" = relates to weight allowance
   - "DITY" or "PPM" = ppm_authorized
6. Pay special attention to amendments or modifications (often listed as "MODIFICATION TO ORDERS")
7. If multiple dates are listed, prioritize the most recent or latest effective date

COMMON ERRORS TO AVOID:
- Don't confuse orders_date with report_date (orders_date is when issued, report_date is when to arrive)
- Don't truncate base names (include city and state)
- Don't misread O (Officer) ranks as 0 (zero)
- Don't confuse temporary duty (TDY/TAD) orders with PCS orders

RETURN FORMAT:
Return ONLY valid JSON with the exact structure above. Do not include explanations, markdown formatting, or any text outside the JSON object. If you cannot extract a field with high confidence, set it to null and note it in confidence_notes.`,
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
 * Get branch-specific OCR prompt for PCS orders
 * Improves accuracy by using branch-specific terminology and formatting
 */
function getBranchSpecificPrompt(branch: string): string {
  const branchSpecificGuidance: Record<string, string> = {
    Army: `ARMY-SPECIFIC PCS ORDERS EXTRACTION

You are extracting data from U.S. Army PCS orders. Army orders typically use DA Forms and have specific formatting.

ARMY-SPECIFIC PATTERNS:
- Header: "DEPARTMENT OF THE ARMY" or "HEADQUARTERS, [UNIT NAME]"
- Forms: DA Form 31 (Leave), DA Form 4187 (Personnel Action)
- Bases: Fort [Name], Installation, Post (e.g., "Fort Liberty", "Joint Base Lewis-McChord")
- Ranks: PVT, PV2, PFC, SPC, CPL, SGT, SSG, SFC, MSG, 1SG, SGM, CSM (Enlisted), 2LT, 1LT, CPT, MAJ, LTC, COL, BG, MG, LTG, GEN (Officers)
- Units: Brigade, Battalion, Company, Division (e.g., "3rd Infantry Division")
- Common phrases: "Proceed date", "Report NLT", "Authorized dependents"

EXTRACTION FOCUS:
- Look for "ORDERS NO." or "ORDER NUMBER" near the top
- Member's rank typically precedes name in ALL CAPS
- Dates often in DD MMM YYYY format (e.g., "15 JAN 2025")
- Look for "REPORT TO" or "ASSIGNED TO" for destination base
- "DITY MOVE AUTHORIZED" or "PPM" indicates personally procured move

Return JSON with all standard PCS fields.`,

    Navy: `NAVY-SPECIFIC PCS ORDERS EXTRACTION

You are extracting data from U.S. Navy PCS orders. Navy orders use NAVPERS forms and Navy-specific terminology.

NAVY-SPECIFIC PATTERNS:
- Header: "DEPARTMENT OF THE NAVY" or "BUREAU OF NAVAL PERSONNEL"
- Forms: NAVPERS 1070/601, NAVPERS 1070/606
- Locations: Naval Station, NAS (Naval Air Station), Naval Base, USS [Ship Name] (e.g., "Naval Station Norfolk")
- Ranks: SR, SA, SN, PO3, PO2, PO1, CPO, SCPO, MCPO (Enlisted), ENS, LTJG, LT, LCDR, CDR, CAPT (Officers)
- Rates: Include rating (e.g., "BM2" = Boatswain's Mate Second Class)
- Common phrases: "Detach", "Report", "Transfer", "BUPERS"

EXTRACTION FOCUS:
- Look for "BUPERS ORDER" or "PERMANENT CHANGE OF STATION ORDERS"
- Member identification may include rate + rank (e.g., "BM2 SMITH, JOHN")
- "FROM" and "TO" clearly indicate origin and destination
- Dates may be in DDMMMYYYY format (no spaces)
- Look for "HHG" (Household Goods) weight allowance

Return JSON with all standard PCS fields.`,

    AirForce: `AIR FORCE-SPECIFIC PCS ORDERS EXTRACTION

You are extracting data from U.S. Air Force PCS orders. Air Force orders have specific formatting conventions.

AIR FORCE-SPECIFIC PATTERNS:
- Header: "DEPARTMENT OF THE AIR FORCE"
- Locations: [Base Name] AFB (Air Force Base), Wing, Group, Squadron (e.g., "Travis AFB, CA")
- Ranks: AB, Amn, A1C, SrA (Enlisted), SSgt, TSgt, MSgt, SMSgt, CMSgt (NCO), 2Lt, 1Lt, Capt, Maj, Lt Col, Col (Officers)
- Common phrases: "PCS Assignment", "Reporting Instructions", "TMO" (Traffic Management Office)
- AFSC: Air Force Specialty Code may be included

EXTRACTION FOCUS:
- Look for "PCS ORDERS" or "ASSIGNMENT INSTRUCTIONS" in header
- Rank typically precedes name with AFSC code
- Dates in DD MMM YYYY format
- "RNLTD" = Report Not Later Than Date (report_date)
- "DEROS" = Date Estimated Return from Overseas (for OCONUS moves)
- Weight allowance often specified in Joint Travel Regulations (JTR) citation

Return JSON with all standard PCS fields.`,

    MarineCorps: `MARINE CORPS-SPECIFIC PCS ORDERS EXTRACTION

You are extracting data from U.S. Marine Corps PCS orders. Marine orders use specific USMC terminology.

MARINE CORPS-SPECIFIC PATTERNS:
- Header: "UNITED STATES MARINE CORPS" or "HEADQUARTERS U.S. MARINE CORPS"
- Locations: MCB (Marine Corps Base), MCAS (Marine Corps Air Station), Camp, Marine Barracks (e.g., "MCB Camp Pendleton")
- Ranks: Pvt, PFC, LCpl, Cpl, Sgt, SSgt, GySgt, MSgt, 1stSgt, MGySgt, SgtMaj (Enlisted), 2ndLt, 1stLt, Capt, Maj, LtCol, Col (Officers)
- MOS: Military Occupational Specialty code may be included
- Common phrases: "Detach from present station", "Proceed and report"

EXTRACTION FOCUS:
- Look for "PERMANENT CHANGE OF STATION ORDER" or "PCS ORDER"
- Rank and MOS typically before name (e.g., "Cpl RODRIGUEZ, CARLOS")
- "FROM" and "TO" clearly state origin and destination
- Look for "PROCEED" date (departure_date)
- "REPORT NLT" = Report Not Later Than (report_date)
- Family members listed as "authorized dependents"

Return JSON with all standard PCS fields.`,

    CoastGuard: `COAST GUARD-SPECIFIC PCS ORDERS EXTRACTION

You are extracting data from U.S. Coast Guard PCS orders.

COAST GUARD-SPECIFIC PATTERNS:
- Header: "UNITED STATES COAST GUARD"
- Locations: Station, Sector, Base, Cutter (e.g., "Coast Guard Station Cape May")
- Ranks: SR, SA, SN, PO3, PO2, PO1, CPO, SCPO, MCPO (Enlisted), ENS, LTJG, LT, LCDR, CDR, CAPT (Officers)
- Rating codes similar to Navy

EXTRACTION FOCUS:
- Look for "PERMANENT CHANGE OF STATION" orders
- May reference USCG directives or COMDTINST
- Dates in standard military format
- Weight allowances per JTR

Return JSON with all standard PCS fields.`,

    SpaceForce: `SPACE FORCE-SPECIFIC PCS ORDERS EXTRACTION

You are extracting data from U.S. Space Force PCS orders. Space Force is the newest branch (est. 2019).

SPACE FORCE-SPECIFIC PATTERNS:
- Header: "DEPARTMENT OF THE AIR FORCE - UNITED STATES SPACE FORCE"
- Locations: Space Force Base (SFB), Space Wing, Delta, Squadron
- Ranks: Similar to Air Force (Spc1-4 for enlisted, 2Lt-Gen for officers)
- May still use Air Force forms until USSF-specific forms are developed

EXTRACTION FOCUS:
- Header will indicate Space Force affiliation
- Otherwise follows Air Force conventions for now
- Look for "USSF" designation

Return JSON with all standard PCS fields.`
  };

  const guidance = branchSpecificGuidance[branch] || '';
  
  // Combine branch-specific guidance with base PCS orders prompt
  return `${guidance}

${getOCRPrompt('orders')}

IMPORTANT: This is a ${branch} PCS order. Use the branch-specific patterns above to improve extraction accuracy.`;
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
 * NOW WITH FIELD-LEVEL SCORING!
 */
function calculateOCRConfidence(
  ocrData: Record<string, unknown>,
  documentType: string
): {
  score: number;
  level: 'high' | 'medium' | 'low';
  message: string;
  fieldScores: Record<string, { value: any; confidence: number; status: 'excellent' | 'good' | 'needs_review' | 'missing' }>;
} {
  let score = 0;
  const fieldScores: Record<string, { value: any; confidence: number; status: 'excellent' | 'good' | 'needs_review' | 'missing' }> = {};

  const requiredFields: Record<string, string[]> = {
    orders: ['member_name', 'rank', 'branch', 'orders_date', 'report_date', 'departure_date', 'origin_base', 'destination_base', 'dependents_authorized'],
    weigh_ticket: ['weigh_date', 'empty_weight', 'full_weight', 'net_weight', 'vehicle_info', 'location'],
    lodging_receipt: ['vendor', 'location', 'check_in_date', 'check_out_date', 'total_amount'],
    fuel_receipt: ['vendor', 'location', 'date', 'total_amount'],
    meal_receipt: ['vendor', 'location', 'date', 'total_amount']
  };

  const required = requiredFields[documentType] || [];

  // Calculate field-level confidence for each required field
  required.forEach(field => {
    const value = ocrData[field];
    let confidence = 0;
    let status: 'excellent' | 'good' | 'needs_review' | 'missing' = 'missing';

    if (value !== null && value !== undefined && value !== '') {
      // Field has a value - assess quality
      const valueStr = String(value);

      // Base confidence on value characteristics
      if (field.includes('date')) {
        // Date fields: check format
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        confidence = datePattern.test(valueStr) ? 95 : 70;
        status = confidence >= 90 ? 'excellent' : confidence >= 70 ? 'good' : 'needs_review';
      } else if (field.includes('base') || field === 'origin_base' || field === 'destination_base') {
        // Base fields: check if includes location (state/country)
        const hasLocation = valueStr.includes(',') || valueStr.includes(' ');
        confidence = hasLocation && valueStr.length > 10 ? 95 : valueStr.length > 5 ? 75 : 60;
        status = confidence >= 90 ? 'excellent' : confidence >= 70 ? 'good' : 'needs_review';
      } else if (field === 'rank') {
        // Rank: check if matches known patterns
        const rankPatterns = ['E-', 'O-', 'W-', 'SGT', 'CPT', 'LT', 'PO', 'SPC'];
        const hasKnownPattern = rankPatterns.some(p => valueStr.includes(p));
        confidence = hasKnownPattern ? 95 : valueStr.length > 0 ? 70 : 50;
        status = confidence >= 90 ? 'excellent' : confidence >= 70 ? 'good' : 'needs_review';
      } else if (field === 'member_name') {
        // Name: check for proper format (Last, First)
        const hasComma = valueStr.includes(',');
        const hasMultipleWords = valueStr.split(/\s+/).length >= 2;
        confidence = hasComma && hasMultipleWords ? 95 : hasMultipleWords ? 80 : 60;
        status = confidence >= 90 ? 'excellent' : confidence >= 70 ? 'good' : 'needs_review';
      } else if (typeof value === 'number' || !isNaN(Number(value))) {
        // Numeric fields
        confidence = Number(value) > 0 ? 90 : 60;
        status = confidence >= 90 ? 'excellent' : 'needs_review';
      } else {
        // Other fields: base on completeness
        confidence = valueStr.length > 3 ? 85 : 65;
        status = confidence >= 90 ? 'excellent' : confidence >= 70 ? 'good' : 'needs_review';
      }
    } else {
      // Field is missing
      confidence = 0;
      status = 'missing';
    }

    fieldScores[field] = {
      value: value,
      confidence: Math.round(confidence),
      status: status
    };
  });

  // Calculate overall score from field scores
  const totalFields = required.length;
  const sumConfidence = Object.values(fieldScores).reduce((sum, field) => sum + field.confidence, 0);
  score = totalFields > 0 ? Math.round(sumConfidence / totalFields) : 50;

  const level = score >= 90 ? 'high' : score >= 70 ? 'medium' : 'low';
  const message = level === 'high'
    ? 'OCR extraction successful - all key fields identified with high confidence'
    : level === 'medium'
    ? 'OCR extraction good - please review fields marked for verification'
    : 'OCR extraction partial - manual review required for accuracy';

  return { score, level, message, fieldScores };
}


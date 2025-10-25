/**
 * TDY COPILOT - UPLOAD DOCUMENT
 * 
 * POST /api/tdy/upload
 * Uploads receipt, parses, and normalizes to line items
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import type { DocType } from '@/app/types/tdy';
import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { normalizeReceiptText } from '@/lib/tdy/normalize';
import { extractTextFromPdf, isImageFile, UnsupportedFormatError } from '@/lib/tdy/ocr';
import { getMileageRateCents } from '@/lib/tdy/util';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const formData = await request.formData();
    const tripId = formData.get('tripId') as string;
    const docType = formData.get('docType') as DocType;
    const file = formData.get('file') as File;

    if (!tripId || !docType || !file) {
      throw Errors.invalidInput('tripId, docType, and file are required');
    }

    // Verify trip ownership
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('tdy_trips')
      .select('user_id, depart_date, return_date')
      .eq('id', tripId)
      .single();

    if (tripError || !trip || trip.user_id !== userId) {
      logger.warn('[TDYUpload] Trip not found', { userId, tripId });
      throw Errors.notFound('TDY trip');
    }

    // Free tier gating: max 3 docs per trip
    const { count } = await supabaseAdmin
      .from('tdy_docs')
      .select('*', { count: 'exact', head: true })
      .eq('trip_id', tripId);

    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

    if (!isPremium && (count || 0) >= 3) {
      logger.warn('[TDYUpload] Free tier limit reached', { userId, tripId, count });
      throw Errors.premiumRequired('Free tier limit: 3 receipts per trip. Upgrade for unlimited');
    }

    // Check file type
    if (isImageFile(file.type)) {
      throw Errors.invalidInput('Images not supported in v1. Upload PDF or use Manual Entry');
    }

    // Upload to storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const objectKey = `user/${userId}/trip/${tripId}/${crypto.randomUUID()}.pdf`;

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('tdy_docs')
      .upload(objectKey, buffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      logger.error('[TDYUpload] Storage upload failed', uploadError, { userId, tripId, fileName: file.name });
      throw Errors.externalApiError('Supabase Storage', 'Upload failed');
    }

    // Insert doc record
    const { data: doc, error: docError } = await supabaseAdmin
      .from('tdy_docs')
      .insert({
        trip_id: tripId,
        doc_type: docType,
        original_filename: file.name,
        mime_type: file.type,
        size_bytes: buffer.length,
        storage_path: objectKey
      })
      .select('*')
      .single();

    if (docError) {
      logger.error('[TDYUpload] Failed to create doc record', docError, { userId, tripId });
      throw Errors.databaseError('Failed to create document record');
    }

    // Parse and normalize
    try {
      const text = await extractTextFromPdf(buffer);
      const mileageRate = await getMileageRateCents();

      const items = await normalizeReceiptText({
        trip: { depart_date: trip.depart_date, return_date: trip.return_date },
        docType,
        text,
        mileageCentsPerMile: mileageRate
      });

      // Insert normalized items
      if (items.length > 0) {
        await supabaseAdmin
          .from('tdy_items_normalized')
          .insert(
            items.map(item => ({
              trip_id: tripId,
              source_doc: doc.id,
              ...item
            }))
          );
      }

      // Update doc as parsed
      await supabaseAdmin
        .from('tdy_docs')
        .update({
          parsed_ok: true,
          parsed: { hints: items.length }
        })
        .eq('id', doc.id);

      // Analytics (fire and forget)
      supabaseAdmin.from('events').insert({
        user_id: userId,
        event_type: 'tdy_doc_upload',
        payload: { trip_id: tripId, doc_type: docType }
      }).then(({ error: analyticsError }) => {
        if (analyticsError) {
          logger.warn('[TDYUpload] Failed to track doc upload event', { userId, tripId, error: analyticsError.message });
        }
      });

      supabaseAdmin.from('events').insert({
        user_id: userId,
        event_type: 'tdy_items_normalized',
        payload: { trip_id: tripId, count: items.length }
      }).then(({ error: analyticsError }) => {
        if (analyticsError) {
          logger.warn('[TDYUpload] Failed to track items event', { userId, tripId, error: analyticsError.message });
        }
      });

      const duration = Date.now() - startTime;
      logger.info('[TDYUpload] Document uploaded and parsed', { 
        userId, 
        tripId, 
        docId: doc.id,
        itemsCount: items.length,
        duration
      });

      return NextResponse.json({
        docId: doc.id,
        parsedOk: true,
        itemsCount: items.length,
        items
      });

    } catch (error) {
      if (error instanceof UnsupportedFormatError) {
        logger.warn('[TDYUpload] Unsupported format', { userId, tripId, docType, error: error.message });
        
        await supabaseAdmin
          .from('tdy_docs')
          .update({
            parsed_ok: false,
            parsed: { error: error.message }
          })
          .eq('id', doc.id);

        return NextResponse.json({
          docId: doc.id,
          parsedOk: false,
          error: error.message
        });
      }

      throw error;
    }

  } catch (error) {
    return errorResponse(error);
  }
}


/**
 * LES HISTORY ENDPOINT
 * 
 * GET /api/les/history
 * - Returns list of user's past LES uploads
 * - Includes flag counts and delta summaries
 * - Sorted by date (newest first)
 * - Default: last 12 months
 * 
 * Security:
 * - Clerk authentication required
 * - User's uploads only (RLS + explicit filter)
 * 
 * Runtime: Edge (simple query)
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { LesHistoryItem } from '@/app/types/les';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // ==========================================================================
    // 1. AUTHENTICATION
    // ==========================================================================
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // ==========================================================================
    // 2. PARSE QUERY PARAMS
    // ==========================================================================
    const searchParams = req.nextUrl.searchParams;
    const limitStr = searchParams.get('limit');
    const limit = limitStr ? parseInt(limitStr, 10) : 12;
    
    // Default: last 12 months
    const monthsBack = Math.min(limit, 24); // Max 24 months

    // ==========================================================================
    // 3. FETCH UPLOADS
    // ==========================================================================
    const { data: uploads, error: uploadsError } = await supabaseAdmin
      .from('les_uploads')
      .select(`
        id,
        month,
        year,
        uploaded_at,
        parsed_ok
      `)
      .eq('user_id', userId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(monthsBack);

    if (uploadsError) {
      logger.error('[LESHistory] Failed to load history', uploadsError, { userId });
      throw Errors.databaseError('Failed to load upload history');
    }

    if (!uploads || uploads.length === 0) {
      // No uploads yet - return empty array
      logger.info('[LESHistory] No uploads found', { userId });
      return NextResponse.json({
        uploads: []
      });
    }

    // ==========================================================================
    // 4. FETCH FLAG COUNTS & DELTAS FOR EACH UPLOAD
    // ==========================================================================
    const uploadIds = uploads.map(u => u.id);
    
    const { data: flags, error: flagsError } = await supabaseAdmin
      .from('pay_flags')
      .select('upload_id, severity, delta_cents')
      .in('upload_id', uploadIds);

    if (flagsError) {
      logger.warn('[LESHistory] Failed to load flags', { userId, error: flagsError });
    }

    // Group flags by upload_id
    const flagsByUpload = new Map<string, { red: number; yellow: number; green: number; totalDelta: number }>();
    
    if (flags) {
      for (const flag of flags) {
        const existing = flagsByUpload.get(flag.upload_id) || { red: 0, yellow: 0, green: 0, totalDelta: 0 };
        
        if (flag.severity === 'red') existing.red++;
        if (flag.severity === 'yellow') existing.yellow++;
        if (flag.severity === 'green') existing.green++;
        
        if (flag.delta_cents) {
          existing.totalDelta += flag.delta_cents;
        }
        
        flagsByUpload.set(flag.upload_id, existing);
      }
    }

    // ==========================================================================
    // 5. BUILD RESPONSE
    // ==========================================================================
    const historyItems: LesHistoryItem[] = uploads.map(upload => {
      const flagData = flagsByUpload.get(upload.id) || { red: 0, yellow: 0, green: 0, totalDelta: 0 };
      
      return {
        id: upload.id,
        month: upload.month,
        year: upload.year,
        uploadedAt: upload.uploaded_at,
        parsedOk: upload.parsed_ok,
        flagCounts: {
          red: flagData.red,
          yellow: flagData.yellow,
          green: flagData.green
        },
        totalDeltaCents: flagData.totalDelta
      };
    });

    logger.info('[LESHistory] History fetched', { userId, uploadCount: historyItems.length });
    return NextResponse.json({
      uploads: historyItems
    });

  } catch (error) {
    return errorResponse(error);
  }
}


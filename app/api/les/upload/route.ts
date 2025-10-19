/**
 * LES UPLOAD & PARSE ENDPOINT
 * 
 * POST /api/les/upload
 * - Accepts PDF file upload (multipart/form-data)
 * - Stores raw PDF in Supabase Storage (les_raw bucket)
 * - Parses PDF and extracts line items
 * - Stores metadata and parsed lines in database
 * - Enforces tier-based upload quotas
 * 
 * Security:
 * - Clerk authentication required
 * - Tier gating (Free: 1/month, Premium/Pro: unlimited)
 * - Rate limiting via api_quota
 * - RLS enforced via user_id checks
 * 
 * Runtime: Node.js (required for PDF parsing)
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseLesPdf } from '@/lib/les/parse';
import { ssot } from '@/lib/ssot';

/**
 * Record server-side analytics event
 */
async function recordAnalyticsEvent(userId: string, event: string, properties: Record<string, any>) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        properties: { ...properties, user_id: userId },
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('[Analytics] Failed to record event:', error);
  }
}

// Force Node.js runtime for PDF parsing
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Maximum file size (from SSOT)
 */
const MAX_FILE_SIZE_BYTES = ssot.features.lesAuditor.maxFileSizeMB * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    // ==========================================================================
    // 1. AUTHENTICATION
    // ==========================================================================
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ==========================================================================
    // 2. TIER GATING & QUOTA CHECK
    // ==========================================================================
    const tier = await getUserTier(userId);
    const monthlyQuota = tier === 'free' 
      ? ssot.features.lesAuditor.freeUploadsPerMonth
      : ssot.features.lesAuditor.premiumUploadsPerMonth; // null = unlimited

    // Check current month's uploads for Free tier
    if (monthlyQuota !== null) {
      const now = new Date();
      const currentMonth = now.getUTCMonth() + 1;
      const currentYear = now.getUTCFullYear();

      const { count, error: countError } = await supabaseAdmin
        .from('les_uploads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('month', currentMonth)
        .eq('year', currentYear);

      if (countError) {
        console.error('[LES Upload] Quota check error:', countError);
        return NextResponse.json(
          { error: 'Failed to check upload quota' },
          { status: 500 }
        );
      }

      if (count !== null && count >= monthlyQuota) {
        return NextResponse.json(
          {
            error: 'Monthly upload limit reached',
            quota: monthlyQuota,
            used: count,
            upgradeRequired: tier === 'free'
          },
          { status: 429 }
        );
      }
    }

    // ==========================================================================
    // 3. PARSE MULTIPART FORM DATA
    // ==========================================================================
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported (v1)' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File too large (max ${ssot.features.lesAuditor.maxFileSizeMB}MB)`,
          maxSize: MAX_FILE_SIZE_BYTES,
          actualSize: file.size
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ==========================================================================
    // 4. STORE RAW PDF IN SUPABASE STORAGE
    // ==========================================================================
    const now = new Date();
    const month = now.getUTCMonth() + 1;
    const year = now.getUTCFullYear();
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    const fileId = crypto.randomUUID();
    const storagePath = `user/${userId}/${yearMonth}/${fileId}.pdf`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('les_raw')
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('[LES Upload] Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // ==========================================================================
    // 5. CREATE DATABASE RECORD
    // ==========================================================================
    const { data: uploadRecord, error: insertError } = await supabaseAdmin
      .from('les_uploads')
      .insert({
        user_id: userId,
        original_filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        storage_path: storagePath,
        month,
        year,
        parsed_ok: false
      })
      .select('*')
      .single();

    if (insertError || !uploadRecord) {
      console.error('[LES Upload] DB insert error:', insertError);
      
      // Cleanup storage on DB failure
      await supabaseAdmin.storage.from('les_raw').remove([storagePath]);
      
      return NextResponse.json(
        { error: 'Failed to save upload metadata' },
        { status: 500 }
      );
    }

    // ==========================================================================
    // 6. PARSE PDF
    // ==========================================================================
    let parsedOk = false;
    let summary = null;

    try {
      const parseResult = await parseLesPdf(buffer, { debug: false });
      
      // Insert parsed lines
      if (parseResult.lines.length > 0) {
        const lineRows = parseResult.lines.map(line => ({
          upload_id: uploadRecord.id,
          line_code: line.line_code,
          description: line.description,
          amount_cents: line.amount_cents,
          section: line.section,
          raw: line.raw
        }));

        const { error: linesError } = await supabaseAdmin
          .from('les_lines')
          .insert(lineRows);

        if (linesError) {
          console.error('[LES Upload] Lines insert error:', linesError);
          // Don't fail the whole upload - mark as parse failure
        } else {
          parsedOk = true;
          summary = parseResult.summary;
        }
      }

      // Update upload record with parse status
      await supabaseAdmin
        .from('les_uploads')
        .update({
          parsed_ok: parsedOk,
          parsed_at: new Date().toISOString(),
          parsed_summary: summary
        })
        .eq('id', uploadRecord.id);

    } catch (parseError) {
      console.error('[LES Upload] Parse error:', parseError);
      // Parse failed - record stays with parsed_ok = false
    }

    // ==========================================================================
    // 7. ANALYTICS
    // ==========================================================================
    // Record analytics events (server-side)
    await recordAnalyticsEvent(userId, 'les_upload', {
      size: file.size,
      month,
      year
    });

    if (parsedOk) {
      await recordAnalyticsEvent(userId, 'les_parse_ok', {
        upload_id: uploadRecord.id
      });
    } else {
      await recordAnalyticsEvent(userId, 'les_parse_fail', {
        reason: 'parse_error'
      });
    }

    // ==========================================================================
    // 8. RETURN RESPONSE
    // ==========================================================================
    return NextResponse.json({
      uploadId: uploadRecord.id,
      parsedOk,
      summary,
      month,
      year
    });

  } catch (error) {
    console.error('[LES Upload] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get user's subscription tier
 * TODO: Integrate with your premium status system
 */
async function getUserTier(userId: string): Promise<'free' | 'premium' | 'pro'> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_entitlements')
      .select('tier')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return 'free';
    }

    return (data.tier as 'free' | 'premium' | 'pro') || 'free';
  } catch {
    return 'free';
  }
}


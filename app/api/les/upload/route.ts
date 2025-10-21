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
 * - Tier gating (Free: 1/month, Premium: unlimited)
 * - Rate limiting via api_quota
 * - RLS enforced via user_id checks
 * 
 * Runtime: Node.js (required for PDF parsing)
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseLesPdf } from '@/lib/les/parse';
import { buildExpectedSnapshot } from '@/lib/les/expected';
import { compareLesToExpected } from '@/lib/les/compare';
import { ssot } from '@/lib/ssot';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

/**
 * Record server-side analytics event
 */
async function recordAnalyticsEvent(userId: string, event: string, properties: Record<string, unknown>) {
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
    logger.warn('Failed to record analytics event', {
      event,
      error: error instanceof Error ? error.message : 'Unknown'
    });
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
      throw Errors.unauthorized();
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
        logger.error('Failed to check upload quota', countError, { userId });
        throw Errors.databaseError('Failed to check upload quota');
      }

      if (count !== null && count >= monthlyQuota) {
        logger.info('Upload quota exceeded', {
          userId: userId.substring(0, 8) + '...',
          quota: monthlyQuota,
          used: count,
          tier
        });
        
        throw Errors.premiumRequired(
          `Monthly upload limit reached (${count}/${monthlyQuota}). Upgrade to Premium for unlimited uploads.`
        );
      }
    }

    // ==========================================================================
    // 3. PARSE MULTIPART FORM DATA
    // ==========================================================================
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      throw Errors.invalidInput('No file provided');
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      throw Errors.invalidInput('Only PDF files are supported', { 
        receivedType: file.type 
      });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw Errors.invalidInput(
        `File too large (max ${ssot.features.lesAuditor.maxFileSizeMB}MB)`,
        { 
          maxSize: MAX_FILE_SIZE_BYTES,
          actualSize: file.size 
        }
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
      logger.error('Failed to upload LES to storage', uploadError, {
        userId,
        storagePath,
        fileSize: file.size
      });
      throw Errors.databaseError('Failed to upload file to storage');
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
      logger.error('Failed to save upload metadata', insertError, {
        userId,
        storagePath
      });
      
      // Cleanup storage on DB failure
      try {
        await supabaseAdmin.storage.from('les_raw').remove([storagePath]);
      } catch (cleanupError) {
        logger.error('Failed to cleanup storage after DB error', cleanupError, {
          storagePath
        });
      }
      
      throw Errors.databaseError('Failed to save upload metadata');
    }

    // ==========================================================================
    // 6. PARSE PDF
    // ==========================================================================
    let parsedOk = false;
    let summary = null;
    let parseResult: Awaited<ReturnType<typeof parseLesPdf>> | null = null;

    try {
      parseResult = await parseLesPdf(buffer, { debug: false });
      
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
          logger.warn('Failed to save parsed lines', {
            error: linesError.message,
            uploadId: uploadRecord.id,
            lineCount: lineRows.length
          });
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
          parsed_summary: summary,
          upload_status: 'parsed'
        })
        .eq('id', uploadRecord.id);

    } catch (parseError) {
      logger.error('Failed to parse LES PDF', parseError, {
        uploadId: uploadRecord.id,
        fileName: file.name
      });
      
      // Update status to parse_failed
      await supabaseAdmin
        .from('les_uploads')
        .update({ upload_status: 'parse_failed' })
        .eq('id', uploadRecord.id);
      
      // Parse failed - record stays with parsed_ok = false
      // This is recoverable - user can try re-uploading or use manual entry
    }

    // ==========================================================================
    // 6B. RUN AUDIT AFTER SUCCESSFUL PARSE
    // ==========================================================================
    if (parsedOk && parseResult && parseResult.lines.length > 0) {
      try {
        logger.info('[LESUpload] Starting audit workflow', {
          uploadId: uploadRecord.id,
          lineCount: parseResult.lines.length,
          userId: userId.substring(0, 8) + '...'
        });

        // Load user profile
        const profile = await getUserProfile(userId);
        
        if (profile) {
          // Build expected snapshot
          const snapshot = await buildExpectedSnapshot({
            userId,
            month,
            year,
            paygrade: profile.paygrade,
            mha_or_zip: profile.mha_or_zip,
            with_dependents: profile.with_dependents,
            yos: profile.yos
          });

          // Store snapshot
          await supabaseAdmin
            .from('expected_pay_snapshot')
            .insert({
              user_id: userId,
              upload_id: uploadRecord.id,
              month,
              year,
              paygrade: profile.paygrade,
              mha_or_zip: profile.mha_or_zip,
              with_dependents: profile.with_dependents,
              yos: profile.yos,
              expected_bah_cents: snapshot.expected.bah_cents,
              expected_bas_cents: snapshot.expected.bas_cents,
              expected_cola_cents: snapshot.expected.cola_cents,
              expected_specials: snapshot.expected.specials
            });

          // Compare actual vs expected
          const comparison = compareLesToExpected(parseResult.lines, snapshot);

          // Store flags
          if (comparison.flags.length > 0) {
            const flagRows = comparison.flags.map(flag => ({
              upload_id: uploadRecord.id,
              severity: flag.severity,
              flag_code: flag.flag_code,
              message: flag.message,
              suggestion: flag.suggestion,
              ref_url: flag.ref_url,
              delta_cents: flag.delta_cents
            }));

            await supabaseAdmin
              .from('pay_flags')
              .insert(flagRows);
          }

          // Update upload status to audit complete
          await supabaseAdmin
            .from('les_uploads')
            .update({ upload_status: 'audit_complete' })
            .eq('id', uploadRecord.id);

          logger.info('[LESUpload] Audit completed successfully', {
            uploadId: uploadRecord.id,
            flagCount: comparison.flags.length,
            redFlags: comparison.flags.filter(f => f.severity === 'red').length,
            yellowFlags: comparison.flags.filter(f => f.severity === 'yellow').length,
            greenFlags: comparison.flags.filter(f => f.severity === 'green').length,
            userId: userId.substring(0, 8) + '...'
          });

          // Record analytics
          await recordAnalyticsEvent(userId, 'les_audit_complete', {
            upload_id: uploadRecord.id,
            month,
            year,
            flag_count: comparison.flags.length,
            has_red_flags: comparison.flags.some(f => f.severity === 'red')
          });

        } else {
          logger.warn('[LESUpload] Profile incomplete, audit skipped', {
            uploadId: uploadRecord.id,
            userId: userId.substring(0, 8) + '...'
          });
          
          // Keep status as 'parsed' - user needs to complete profile
          // UI can show: "Complete your profile to run audit"
        }
      } catch (auditError) {
        logger.error('[LESUpload] Failed to run audit after upload', auditError, {
          uploadId: uploadRecord.id,
          userId: userId.substring(0, 8) + '...'
        });
        
        // Don't fail the upload - mark as audit_failed
        await supabaseAdmin
          .from('les_uploads')
          .update({ upload_status: 'audit_failed' })
          .eq('id', uploadRecord.id);

        // Record analytics
        await recordAnalyticsEvent(userId, 'les_audit_failed', {
          upload_id: uploadRecord.id,
          error: auditError instanceof Error ? auditError.message : 'Unknown error'
        });
      }
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
    logger.info('LES upload complete', {
      uploadId: uploadRecord.id,
      parsedOk,
      userId: userId.substring(0, 8) + '...',
      fileSize: file.size
    });

    return NextResponse.json({
      uploadId: uploadRecord.id,
      parsedOk,
      summary,
      month,
      year
    });

  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Get user's subscription tier
 * TODO: Integrate with your premium status system
 */
async function getUserTier(userId: string): Promise<'free' | 'premium'> {
  try {
    const { data, error } = await supabaseAdmin
      .from('entitlements')
      .select('tier')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return 'free';
    }

    return (data.tier as 'free' | 'premium') || 'free';
  } catch (error) {
    logger.warn('Failed to get user tier, defaulting to free', {
      error: error instanceof Error ? error.message : 'Unknown',
      userId: userId.substring(0, 8) + '...'
    });
    return 'free';
  }
}

/**
 * Get user profile for audit
 */
async function getUserProfile(userId: string): Promise<{
  paygrade: string;
  mha_or_zip?: string;
  with_dependents: boolean;
  yos?: number;
} | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('paygrade, mha_code, mha_code_override, has_dependents, time_in_service_months')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    // Use override if present, otherwise use computed mha_code
    const mhaCode = data.mha_code_override || data.mha_code;

    // Validate required computed fields
    if (!data.paygrade || !mhaCode || data.has_dependents === null) {
      logger.warn('[LESUpload] Profile incomplete', {
        userId: userId.substring(0, 8) + '...',
        missingFields: {
          paygrade: !data.paygrade,
          mha_code: !mhaCode,
          has_dependents: data.has_dependents === null
        }
      });
      return null;
    }

    return {
      paygrade: data.paygrade,
      mha_or_zip: mhaCode,
      with_dependents: Boolean(data.has_dependents),
      yos: data.time_in_service_months ? Math.floor(data.time_in_service_months / 12) : undefined
    };
  } catch (profileError) {
    logger.warn('[LESUpload] Failed to get user profile', { userId, error: profileError });
    return null;
  }
}


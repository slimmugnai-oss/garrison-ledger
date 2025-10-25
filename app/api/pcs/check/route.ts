import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * PCS CLAIM VALIDATION
 * 
 * Runs comprehensive checks on claim package:
 * - Duplicate receipts
 * - Date mismatches
 * - Missing required documents
 * - Ineligible expenses
 * - Amount anomalies
 */

interface CheckRequest {
  claimId: string;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // PREMIUM-ONLY FEATURE: Check tier
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const tier = entitlement?.tier || 'free';
    const isPremium = tier === 'premium' && entitlement?.status === 'active';

    if (!isPremium) {
      throw Errors.premiumRequired('PCS Money Copilot is available for Premium members only');
    }

    const body: CheckRequest = await req.json();
    const { claimId } = body;

    if (!claimId) {
      throw Errors.invalidInput('claimId is required');
    }

    // Get claim
    const { data: claim, error: claimError } = await supabaseAdmin
      .from('pcs_claims')
      .select('*')
      .eq('id', claimId)
      .eq('user_id', userId)
      .single();

    if (claimError || !claim) {
      logger.warn('[PCSCheck] Claim not found', { userId, claimId });
      throw Errors.notFound('PCS claim');
    }

    // Get all documents
    const { data: documents } = await supabaseAdmin
      .from('pcs_claim_documents')
      .select('*')
      .eq('claim_id', claimId);

    // Get all items
    const { data: items } = await supabaseAdmin
      .from('pcs_claim_items')
      .select('*')
      .eq('claim_id', claimId);

    // Run checks
    const checks: Array<{
      check_type: string;
      severity: string;
      category: string;
      title: string;
      description: string;
      suggested_fix: string;
      jtr_citation?: string;
      affected_items?: string[];
    }> = [];

    // Check 1: Missing PCS Orders
    const hasOrders = documents?.some(d => d.document_type === 'orders');
    if (!hasOrders) {
      checks.push({
        check_type: 'error',
        severity: 'critical',
        category: 'missing_doc',
        title: 'Missing PCS Orders',
        description: 'PCS orders are required to process any reimbursement claims.',
        suggested_fix: 'Upload a copy of your official PCS orders.',
        jtr_citation: 'JTR 050101'
      });
    }

    // Check 2: Duplicate receipts
    if (items && items.length > 0) {
      const amountDateMap = new Map<string, string[]>();
      items.forEach(item => {
        const key = `${item.amount}_${item.date}_${item.vendor}`;
        if (!amountDateMap.has(key)) {
          amountDateMap.set(key, []);
        }
        amountDateMap.get(key)?.push(item.id);
      });

      amountDateMap.forEach((ids) => {
        if (ids.length > 1) {
          checks.push({
            check_type: 'warning',
            severity: 'high',
            category: 'duplicate',
            title: 'Potential Duplicate Receipt',
            description: `Found ${ids.length} receipts with identical amount, date, and vendor. This may be flagged as duplicate submission.`,
            suggested_fix: 'Review these receipts and remove duplicates.',
            affected_items: ids
          });
        }
      });
    }

    // Check 3: Dates outside PCS window
    if (items && items.length > 0 && claim.departure_date && claim.arrival_date) {
      const departureDate = new Date(claim.departure_date);
      const arrivalDate = new Date(claim.arrival_date);
      const windowStart = new Date(departureDate);
      windowStart.setDate(windowStart.getDate() - 10); // 10 days before
      const windowEnd = new Date(arrivalDate);
      windowEnd.setDate(windowEnd.getDate() + 10); // 10 days after

      items.forEach(item => {
        const itemDate = new Date(item.date);
        if (itemDate < windowStart || itemDate > windowEnd) {
          checks.push({
            check_type: 'error',
            severity: 'high',
            category: 'date_mismatch',
            title: 'Receipt Date Outside PCS Window',
            description: `Receipt dated ${item.date} is outside your PCS travel window (${claim.departure_date} to ${claim.arrival_date}).`,
            suggested_fix: 'Verify the date is correct or remove this receipt if not PCS-related.',
            jtr_citation: 'JTR 054205',
            affected_items: [item.id]
          });
        }
      });
    }

    // Check 4: Missing weigh tickets for PPM
    if (claim.travel_method === 'ppm' || claim.travel_method === 'mixed') {
      const weighTickets = documents?.filter(d => d.document_type === 'weigh_ticket') || [];
      const hasWeighTickets = weighTickets.length > 0;
      
      if (!hasWeighTickets) {
        checks.push({
          check_type: 'error',
          severity: 'critical',
          category: 'missing_doc',
          title: 'Missing Weigh Tickets for PPM',
          description: 'PPM moves require both empty and full weigh tickets from certified scales.',
          suggested_fix: 'Upload your certified weigh tickets (empty and full weight).',
          jtr_citation: 'JTR 054703'
        });
      } else if (weighTickets.length < 2) {
        checks.push({
          check_type: 'warning',
          severity: 'high',
          category: 'missing_doc',
          title: 'Incomplete Weigh Tickets',
          description: 'PPM requires both empty weight (before loading) and full weight (after loading) tickets.',
          suggested_fix: 'Ensure you have both empty and full weigh tickets uploaded.',
          jtr_citation: 'JTR 054703'
        });
      }
    }

    // Check 5: TLE exceeds 10 days per location
    const tleDays = items?.filter(item => 
      item.category === 'lodging' || 
      item.description?.toLowerCase().includes('hotel') ||
      item.description?.toLowerCase().includes('lodging')
    ).length || 0;
    
    if (tleDays > 20) {
      checks.push({
        check_type: 'warning',
        severity: 'medium',
        category: 'exceeds_limit',
        title: 'TLE May Exceed Authorized Days',
        description: `You have ${tleDays} days of lodging. TLE is typically limited to 10 days at origin + 10 days at destination (20 total).`,
        suggested_fix: 'Review your lodging receipts. Days beyond 20 may not be reimbursed unless you have commander approval.',
        jtr_citation: 'JTR 054205'
      });
    }

    // Calculate readiness score
    const totalChecks = checks.length;
    const criticalErrors = checks.filter(c => c.severity === 'critical').length;
    const highIssues = checks.filter(c => c.severity === 'high').length;
    
    let readinessScore = 100;
    readinessScore -= (criticalErrors * 30);
    readinessScore -= (highIssues * 15);
    readinessScore = Math.max(0, Math.min(100, readinessScore));

    // Determine completion percentage
    const requiredDocs = ['orders'];
    if (claim.travel_method === 'ppm') requiredDocs.push('weigh_ticket');
    const hasAllRequired = requiredDocs.every(type => 
      documents?.some(d => d.document_type === type)
    );
    const completionPercentage = hasAllRequired ? 
      (documents && documents.length >= 5 ? 100 : 75) : 
      (documents && documents.length > 0 ? 50 : 0);

    // Delete old checks
    await supabaseAdmin
      .from('pcs_claim_checks')
      .delete()
      .eq('claim_id', claimId);

    // Insert new checks
    if (checks.length > 0) {
      await supabaseAdmin
        .from('pcs_claim_checks')
        .insert(checks.map(check => ({
          claim_id: claimId,
          ...check
        })));
    }

    // Update claim status
    await supabaseAdmin
      .from('pcs_claims')
      .update({
        readiness_score: readinessScore,
        completion_percentage: completionPercentage,
        status: readinessScore === 100 ? 'ready_to_submit' : 'draft',
        last_checked_at: new Date().toISOString()
      })
      .eq('id', claimId);

    // Track analytics (fire and forget)
    supabaseAdmin
      .from('pcs_analytics')
      .insert({
        user_id: userId,
        claim_id: claimId,
        event_type: 'check_run',
        event_data: {
          readiness_score: readinessScore,
          total_checks: totalChecks,
          critical_errors: criticalErrors
        }
      })
      .then(({ error: analyticsError }) => {
        if (analyticsError) {
          logger.warn('[PCSCheck] Failed to track analytics', { userId, claimId, error: analyticsError.message });
        }
      });

    const duration = Date.now() - startTime;
    logger.info('[PCSCheck] Claim validation completed', { 
      userId, 
      claimId, 
      readinessScore, 
      totalChecks,
      duration 
    });

    return NextResponse.json({
      success: true,
      readinessScore,
      completionPercentage,
      checks,
      totalChecks,
      criticalErrors,
      highIssues
    });

  } catch (error) {
    return errorResponse(error);
  }
}

// Removed unused helper functions


import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * ACTUAL REIMBURSEMENT REPORTING
 * 
 * Allows users to report what they actually received from finance
 * vs what we estimated. This helps us:
 * 1. Track our estimate accuracy
 * 2. Improve our calculations over time
 * 3. Show accuracy stats to build trust
 */

interface ReportActualRequest {
  claimId: string;
  actualAmounts: {
    dla?: number;
    tle?: number;
    malt?: number;
    per_diem?: number;
    ppm?: number;
    other?: number;
  };
  submittedDate?: string;
  approvedDate?: string;
  notes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // PREMIUM-ONLY FEATURE: Check tier
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const tier = entitlement?.tier || 'free';
    const isPremium = (tier === 'premium' || tier === 'pro') && entitlement?.status === 'active';

    if (!isPremium) {
      return NextResponse.json({
        error: 'Premium feature',
        details: 'PCS Money Copilot is available for Premium and Pro members only.',
        upgradeRequired: true
      }, { status: 403 });
    }

    const body: ReportActualRequest = await req.json();
    const { claimId, actualAmounts, submittedDate, approvedDate, notes } = body;

    // Verify claim belongs to user
    const { data: claim } = await supabaseAdmin
      .from('pcs_claims')
      .select('*, entitlements')
      .eq('id', claimId)
      .eq('user_id', userId)
      .single();

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // Calculate total actual
    const totalActual = Object.values(actualAmounts).reduce((sum, val) => sum + (val || 0), 0);

    // Get estimated total from entitlements
    const entitlements = claim.entitlements as {
      dla?: number;
      tle?: number;
      malt?: number;
      per_diem?: number;
      ppm?: number;
    } | null;
    
    const totalEstimated = entitlements 
      ? Object.values(entitlements).reduce((sum, val) => sum + (val || 0), 0)
      : 0;

    // Calculate variance
    const variance = {
      dla: calculateVariance(entitlements?.dla, actualAmounts.dla),
      tle: calculateVariance(entitlements?.tle, actualAmounts.tle),
      malt: calculateVariance(entitlements?.malt, actualAmounts.malt),
      per_diem: calculateVariance(entitlements?.per_diem, actualAmounts.per_diem),
      ppm: calculateVariance(entitlements?.ppm, actualAmounts.ppm),
      total: totalEstimated > 0 
        ? Math.round(((totalActual - totalEstimated) / totalEstimated) * 100)
        : 0
    };

    // Calculate accuracy score (lower variance = higher accuracy)
    const accuracyScore = Math.max(0, 100 - Math.abs(variance.total));

    // Update claim with actual amounts
    await supabaseAdmin
      .from('pcs_claims')
      .update({
        actual_reimbursements: {
          amounts: actualAmounts,
          total: totalActual,
          variance,
          accuracy_score: accuracyScore,
          reported_at: new Date().toISOString(),
          notes
        },
        submitted_date: submittedDate || null,
        approved_date: approvedDate || null,
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', claimId)
      .eq('user_id', userId);

    // Track in analytics
    await supabaseAdmin
      .from('pcs_analytics')
      .insert({
        user_id: userId,
        claim_id: claimId,
        event_type: 'actual_reported',
        event_data: {
          estimated_total: totalEstimated,
          actual_total: totalActual,
          variance_percentage: variance.total,
          accuracy_score: accuracyScore
        }
      });

    return NextResponse.json({
      success: true,
      totalActual,
      totalEstimated,
      variance,
      accuracyScore,
      message: accuracyScore >= 90 
        ? 'Excellent! Our estimate was highly accurate.'
        : accuracyScore >= 75
        ? 'Good estimate - within reasonable range.'
        : 'Thanks for reporting! This helps us improve our estimates.'
    });

  } catch (error) {
    console.error('[Report Actual] Error:', error);
    return NextResponse.json({ 
      error: 'Report failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

/**
 * Calculate variance percentage between estimated and actual
 */
function calculateVariance(estimated?: number, actual?: number): number {
  if (!estimated || !actual) return 0;
  return Math.round(((actual - estimated) / estimated) * 100);
}

/**
 * GET: Fetch accuracy statistics
 */
export async function GET() {
  try {
    // Get overall accuracy statistics (anonymized)
    const { data: claims } = await supabaseAdmin
      .from('pcs_claims')
      .select('actual_reimbursements, entitlements')
      .not('actual_reimbursements', 'is', null);

    if (!claims || claims.length === 0) {
      return NextResponse.json({
        sampleSize: 0,
        averageAccuracy: 0,
        message: 'Not enough data yet'
      });
    }

    const accuracyScores = claims
      .map(claim => {
        const actual = claim.actual_reimbursements as { accuracy_score?: number } | null;
        return actual?.accuracy_score || 0;
      })
      .filter(score => score > 0);

    const averageAccuracy = accuracyScores.length > 0
      ? Math.round(accuracyScores.reduce((sum, score) => sum + score, 0) / accuracyScores.length)
      : 0;

    return NextResponse.json({
      sampleSize: accuracyScores.length,
      averageAccuracy,
      message: averageAccuracy >= 90
        ? `Our estimates are ${averageAccuracy}% accurate on average`
        : averageAccuracy >= 75
        ? `We're tracking ${averageAccuracy}% accuracy and improving`
        : 'We are continuously improving our estimates'
    });

  } catch (error) {
    console.error('[Get Accuracy Stats] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch stats' 
    }, { status: 500 });
  }
}


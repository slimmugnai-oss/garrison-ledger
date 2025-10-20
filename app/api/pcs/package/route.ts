import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateClaimPackagePDF } from '@/lib/pcs/package-generator';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * PCS CLAIM PACKAGE GENERATOR
 * 
 * Generates a professional PDF package with:
 * - Claim summary and status
 * - Entitlement calculations breakdown
 * - Document checklist
 * - All uploaded documents
 * 
 * Premium-only feature
 */

interface PackageRequest {
  claimId: string;
  includeDocuments?: boolean;
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
    const isPremium = tier === 'premium' && entitlement?.status === 'active';

    if (!isPremium) {
      return NextResponse.json({
        error: 'Premium feature',
        details: 'PCS Money Copilot package generation is available for Premium members only.',
        upgradeRequired: true
      }, { status: 403 });
    }

    const body: PackageRequest = await req.json();
    const { claimId, includeDocuments = true } = body;

    // Get claim details
    const { data: claim, error: claimError } = await supabaseAdmin
      .from('pcs_claims')
      .select('*')
      .eq('id', claimId)
      .eq('user_id', userId)
      .single();

    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Get latest entitlement snapshot
    const { data: snapshot } = await supabaseAdmin
      .from('pcs_entitlement_snapshots')
      .select('*')
      .eq('claim_id', claimId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get uploaded documents
    const { data: documents } = await supabaseAdmin
      .from('pcs_claim_documents')
      .select('*')
      .eq('claim_id', claimId)
      .order('created_at', { ascending: false });

    // Generate PDF package
    const pdfBuffer = await generateClaimPackagePDF({
      claim,
      profile: profile || {},
      snapshot: snapshot || null,
      documents: documents || [],
      includeDocuments
    });

    // Track analytics
    await supabaseAdmin
      .from('pcs_analytics')
      .insert({
        user_id: userId,
        claim_id: claimId,
        event_type: 'package_generated',
        event_data: {
          include_documents: includeDocuments,
          document_count: documents?.length || 0,
          total_estimated: snapshot?.total_estimated || 0
        }
      });

    // Return PDF as downloadable file
    const fileName = `PCS_Claim_${claim.claim_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('[PCS Package] Error:', error);
    return NextResponse.json({ 
      error: 'Package generation failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}


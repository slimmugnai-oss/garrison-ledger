import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { supabaseAdmin } from '@/lib/supabase/admin';

import PCSClaimClient from './PCSClaimClient';

export const metadata: Metadata = {
  title: 'PCS Claim Details | Garrison Ledger',
  description: 'Manage your PCS claim with AI-powered assistance for reimbursements.',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PCSClaimPage({ params }: PageProps) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  // Check premium status
  const { data: entitlement } = await supabaseAdmin
    .from('entitlements')
    .select('tier, status')
    .eq('user_id', user.id)
    .maybeSingle();

  const tier = entitlement?.tier || 'free';
  const isPremium = tier === 'premium' && entitlement?.status === 'active';

  // PREMIUM-ONLY FEATURE: Block free users completely
  if (!isPremium) {
    redirect('/dashboard/upgrade?feature=pcs-copilot');
  }

  // Get the specific claim
  const { data: claim, error } = await supabaseAdmin
    .from('pcs_claims')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !claim) {
    redirect('/dashboard/pcs-copilot');
  }

  // Get user profile
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('rank, branch, current_base')
    .eq('user_id', user.id)
    .maybeSingle();

  // Get entitlement snapshot for detailed calculations
  const { data: snapshot } = await supabaseAdmin
    .from('pcs_entitlement_snapshots')
    .select('*')
    .eq('claim_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Get documents
  const { data: documents } = await supabaseAdmin
    .from('pcs_claim_documents')
    .select('*')
    .eq('claim_id', id)
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false });

  // Get validation checks
  const { data: validationChecks } = await supabaseAdmin
    .from('pcs_claim_checks')
    .select('*')
    .eq('claim_id', id)
    .order('severity', { ascending: true });

  return (
    <PCSClaimClient 
      claim={claim}
      snapshot={snapshot || null}
      documents={documents || []}
      validationChecks={validationChecks || []}
      isPremium={isPremium}
      tier={tier}
      userProfile={{
        rank: profile?.rank,
        branch: profile?.branch,
        currentBase: profile?.current_base
      }}
    />
  );
}

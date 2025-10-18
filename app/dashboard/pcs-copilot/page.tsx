import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import PCSCopilotClient from './PCSCopilotClient';

export const metadata: Metadata = {
  title: 'PCS Money Copilot | Garrison Ledger',
  description: 'AI-powered PCS reimbursement assistant. Upload receipts, get instant estimates, catch errors before finance does.',
};

export default async function PCSCopilotPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  // Check premium status
  const { data: entitlement } = await supabaseAdmin
    .from('entitlements')
    .select('tier, status')
    .eq('user_id', user.id)
    .maybeSingle();

  const tier = entitlement?.tier || 'free';
  const isPremium = (tier === 'premium' || tier === 'pro') && entitlement?.status === 'active';

  // PREMIUM-ONLY FEATURE: Block free users completely
  if (!isPremium) {
    redirect('/dashboard/upgrade?feature=pcs-copilot');
  }

  // Get user's claims
  const { data: claims } = await supabaseAdmin
    .from('pcs_claims')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Get user profile
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('rank, branch, current_base')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <PCSCopilotClient 
      initialClaims={claims || []}
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


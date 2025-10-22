/**
 * LES & PAYCHECK AUDITOR
 * 
 * Upload LES PDF → Parse → Compare vs expected pay → Generate flags
 * Premium feature: Unlimited audits (free: 1/month)
 */

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import PaycheckAuditClient from './PaycheckAuditClient';
import ProfileIncompletePrompt from '@/app/components/les/ProfileIncompletePrompt';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LES & Paycheck Auditor | Garrison Ledger',
  description: 'Catch pay errors before you do. Upload your LES, verify BAH/BAS/COLA, detect underpayments.',
};

export default async function PaycheckAuditPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check premium status
  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('tier, status')
    .eq('user_id', user.id)
    .maybeSingle();

  const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

  // Get user profile (for BAH/grade context)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('rank, current_base, has_dependents, paygrade, mha_code, mha_code_override')
    .eq('user_id', user.id)
    .maybeSingle();

  // Get audit history (last 12 months)
  const { data: history } = await supabase
    .from('les_uploads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(12);

  // Check usage this month
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const { count: uploadsThisMonth } = await supabase
    .from('les_uploads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', firstDayOfMonth.toISOString());

  const hasReachedFreeLimit = !isPremium && (uploadsThisMonth || 0) >= 1;

  // Check profile completeness (need computed fields for audit)
  const missingFields: string[] = [];
  if (!profile?.rank) missingFields.push('rank');
  if (!profile?.current_base) missingFields.push('current_base');
  if (profile?.has_dependents === null || profile?.has_dependents === undefined) {
    missingFields.push('has_dependents');
  }
  
  // Also check computed fields needed by backend
  if (!profile?.paygrade) missingFields.push('paygrade');
  const mhaCode = profile?.mha_code_override || profile?.mha_code;
  if (!mhaCode) missingFields.push('mha_code');

  const profileComplete = missingFields.length === 0;

  return (
    <>
      <Header />
      {!profileComplete ? (
        <ProfileIncompletePrompt missingFields={missingFields} />
      ) : (
        <PaycheckAuditClient
          isPremium={isPremium}
          userProfile={{
            rank: profile?.rank,
            paygrade: profile?.paygrade,
            currentBase: profile?.current_base,
            hasDependents: profile?.has_dependents
          }}
          history={history || []}
          hasReachedFreeLimit={hasReachedFreeLimit}
          uploadsThisMonth={uploadsThisMonth || 0}
        />
      )}
      <Footer />
    </>
  );
}

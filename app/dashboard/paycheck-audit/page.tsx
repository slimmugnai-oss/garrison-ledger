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
    .select('rank, current_base, has_dependents')
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

  return (
    <>
      <Header />
      <PaycheckAuditClient
        isPremium={isPremium}
        userProfile={{
          rank: profile?.rank,
          currentBase: profile?.current_base,
          hasDependents: profile?.has_dependents
        }}
        history={history || []}
        hasReachedFreeLimit={hasReachedFreeLimit}
        uploadsThisMonth={uploadsThisMonth || 0}
      />
      <Footer />
    </>
  );
}

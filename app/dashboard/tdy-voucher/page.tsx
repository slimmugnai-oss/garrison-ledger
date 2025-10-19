/**
 * TDY VOUCHER COPILOT
 * 
 * Travel voucher builder with receipt parsing and compliance checking
 * Premium feature with free preview (3 receipts)
 */

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import TdyVoucherClient from './TdyVoucherClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TDY Voucher Copilot | Garrison Ledger',
  description: 'Build compliant travel vouchers. Upload receipts, auto-categorize expenses, validate per-diem, and generate ready-to-submit packages.',
};

export default async function TdyVoucherPage() {
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

  // Get user's trips
  const { data: trips } = await supabase
    .from('tdy_trips')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <>
      <Header />
      <TdyVoucherClient
        isPremium={isPremium}
        initialTrips={trips || []}
      />
      <Footer />
    </>
  );
}


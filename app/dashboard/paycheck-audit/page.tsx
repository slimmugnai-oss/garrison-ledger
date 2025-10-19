import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import PaycheckAuditClient from './PaycheckAuditClient';

export const metadata: Metadata = {
  title: 'Paycheck Audit | Garrison Ledger',
  description: 'Upload your LES (Leave & Earnings Statement) and instantly detect pay discrepancies. Verify BAH, BAS, COLA, and special pays are correct.',
};

export default async function PaycheckAuditPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  // Check tier status
  const { data: entitlement } = await supabaseAdmin
    .from('entitlements')
    .select('tier, status')
    .eq('user_id', user.id)
    .maybeSingle();

  const tier = entitlement?.tier || 'free';
  const isPremium = (tier === 'premium' || tier === 'pro') && entitlement?.status === 'active';

  // Get user profile (needed for audit)
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('paygrade, duty_station, dependents, years_of_service')
    .eq('user_id', user.id)
    .maybeSingle();

  const hasProfile = Boolean(
    profile?.paygrade && 
    profile?.duty_station
  );

  // Get recent uploads
  const { data: recentUploads } = await supabaseAdmin
    .from('les_uploads')
    .select('id, month, year, uploaded_at, parsed_ok')
    .eq('user_id', user.id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(6);

  // Count this month's uploads (for Free tier quota)
  const now = new Date();
  const currentMonth = now.getUTCMonth() + 1;
  const currentYear = now.getUTCFullYear();

  const { count: monthlyCount } = await supabaseAdmin
    .from('les_uploads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('month', currentMonth)
    .eq('year', currentYear);

  return (
    <PaycheckAuditClient
      tier={tier}
      isPremium={isPremium}
      hasProfile={hasProfile}
      profile={{
        paygrade: profile?.paygrade,
        duty_station: profile?.duty_station,
        dependents: profile?.dependents,
        years_of_service: profile?.years_of_service
      }}
      recentUploads={recentUploads || []}
      monthlyUploadsCount={monthlyCount || 0}
    />
  );
}


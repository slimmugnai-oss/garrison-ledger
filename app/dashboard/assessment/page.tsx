import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import AssessmentClient from './AssessmentClient';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'Military Assessment | Garrison Ledger',
  description: 'Quick adaptive assessment to generate your AI-curated personalized financial plan with expert content tailored to your military situation.',
};

export default async function AdaptiveAssessmentPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  // Check if user has completed their profile
  const { data: profileRow } = await supabaseAdmin
    .from("user_profiles")
    .select("profile_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  const profileComplete = profileRow?.profile_completed || false;

  // If profile is not completed, redirect to profile setup
  if (!profileComplete) {
    redirect('/dashboard/profile/setup');
  }

  // Check premium status
  const { data: entitlement } = await supabaseAdmin
    .from('entitlements')
    .select('tier, status')
    .eq('user_id', user.id)
    .maybeSingle();

  const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

  return <AssessmentClient isPremium={isPremium} />;
}


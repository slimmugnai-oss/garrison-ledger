import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import AssessmentClient from './AssessmentClient';

export const metadata: Metadata = {
  title: 'Military Assessment | Garrison Ledger',
  description: 'Quick adaptive assessment to generate your AI-curated personalized financial plan with expert content tailored to your military situation.',
};

export default async function AdaptiveAssessmentPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  // Check if user has completed their profile
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: profileRow } = await supabase
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
  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('tier, status')
    .eq('user_id', user.id)
    .maybeSingle();

  const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

  return <AssessmentClient isPremium={isPremium} />;
}


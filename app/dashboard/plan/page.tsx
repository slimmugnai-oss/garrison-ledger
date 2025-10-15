import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import PlanClient from './PlanClient';

export const metadata = {
  title: 'Your Personalized Plan | Garrison Ledger',
  description: 'AI-curated financial plan with expert content tailored to your military situation',
};

export default async function PlanPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Check premium status
  const { data: entitlement } = await supabaseAdmin
    .from('entitlements')
    .select('tier, status')
    .eq('user_id', userId)
    .maybeSingle();

  const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

  // Load user's personalized plan
  const { data: plan, error } = await supabaseAdmin
    .from('user_plans')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[Plan Page] Error loading plan:', error);
  }

  // If no plan exists, redirect to assessment
  if (!plan) {
    redirect('/dashboard/assessment');
  }

  // Mark plan as viewed
  if (!plan.viewed) {
    await supabaseAdmin
      .from('user_plans')
      .update({ 
        viewed: true, 
        viewed_at: new Date().toISOString() 
      })
      .eq('user_id', userId);
  }

  return <PlanClient initialPlan={plan.plan_data} isPremium={isPremium} />;
}

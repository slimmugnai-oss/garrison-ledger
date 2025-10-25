import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from "next";
import { redirect } from 'next/navigation';

import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import ReferralDashboard from '@/app/components/referrals/ReferralDashboard';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';
import { generatePageMeta } from "@/lib/seo-config";
import { supabaseAdmin } from '@/lib/supabase/admin';

export const metadata: Metadata = generatePageMeta({
  title: "Referrals - Help a Battle Buddy Save Money",
  description: "Share Garrison Ledger with your military friends and earn $10 when they upgrade. They get $10 too! Join 47 military members earning rewards.",
  path: "/dashboard/referrals",
  keywords: ["military referral", "refer a friend", "military rewards", "referral program"]
});

interface ReferralData {
  code: string;
  totalReferrals: number;
  totalConversions: number;
  totalEarnings: number;
  availableCredits: number;
  referrals: Array<{
    id: string;
    referred_user_id: string;
    created_at: string;
    status: string;
    conversion_date: string | null;
  }>;
}

async function getReferralData(userId: string): Promise<ReferralData> {
  // Get or create referral code
  const { data: codeData } = await supabaseAdmin
    .rpc('get_or_create_referral_code', { p_user_id: userId });
  
  const code = codeData || '';
  
  // Get user stats
  const { data: statsData } = await supabaseAdmin
    .from('user_referral_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  // Get referral list
  const { data: referralsData } = await supabaseAdmin
    .from('referral_conversions')
    .select('id, referred_user_id, created_at, status, conversion_date')
    .eq('referrer_user_id', userId)
    .order('created_at', { ascending: false });
  
  // Get available credits
  const { data: creditsData } = await supabaseAdmin
    .rpc('get_user_credit_balance', { p_user_id: userId });
  
  return {
    code,
    totalReferrals: statsData?.total_referrals_sent || 0,
    totalConversions: statsData?.total_conversions || 0,
    totalEarnings: statsData?.total_earnings_cents || 0,
    availableCredits: creditsData || 0,
    referrals: referralsData || [],
  };
}

export default async function ReferralsPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  
  const referralData = await getReferralData(user.id);
  
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Header */}
          <div className="mb-12 text-center">
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-success-subtle dark:bg-green-900/20 dark:border-green-700 px-4 py-1.5 text-xs font-semibold text-success dark:text-green-400 uppercase tracking-wider">
                <span>🤝</span> Dual Rewards
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-black tracking-tight text-primary dark:text-white mb-4">
              Help a Battle Buddy
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-body dark:text-muted">
              Share Garrison Ledger with your military friends. When they upgrade, <strong className="text-success dark:text-green-400">you both get $10!</strong>
            </p>
          </div>
          
          {/* Explainer Card */}
          <AnimatedCard delay={0} className="mb-8">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <Icon name="Info" className="h-6 w-6 text-info dark:text-info flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-primary dark:text-white mb-2">How It Works</h3>
                  <div className="grid md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <div className="font-semibold text-info dark:text-info mb-1">1. Share Your Code</div>
                      <p className="text-body dark:text-muted">
                        Give your unique referral code to military friends, family, or share on social media.
                      </p>
                    </div>
                    <div>
                      <div className="font-semibold text-success dark:text-green-400 mb-1">2. They Sign Up & Upgrade</div>
                      <p className="text-body dark:text-muted">
                        When they create an account with your code and upgrade to premium, rewards unlock!
                      </p>
                    </div>
                    <div>
                      <div className="font-semibold text-amber-600 dark:text-amber-400 mb-1">3. You Both Get $10</div>
                      <p className="text-body dark:text-muted">
                        You get $10 credit, they get $10 credit. Use it towards premium or save it up!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
          
          {/* Pass referral data to client component */}
          <ReferralDashboard
            code={referralData.code}
            totalReferrals={referralData.totalReferrals}
            totalConversions={referralData.totalConversions}
            totalEarnings={referralData.totalEarnings}
            availableCredits={referralData.availableCredits}
            referrals={referralData.referrals}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}

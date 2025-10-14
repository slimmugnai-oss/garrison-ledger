'use client';

import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AnimatedCard from '@/app/components/ui/AnimatedCard';

type ReferralData = {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  activeReferrals: number;
};

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/referral');
      if (res.ok) {
        setData(await res.json());
      }
    }
    load();
  }, []);

  async function copyLink() {
    if (!data) return;
    await navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-serif font-black text-text mb-3">
              Refer & Earn
            </h1>
            <p className="text-xl text-muted">
              Share Garrison Ledger with fellow service members and earn rewards
            </p>
          </div>

          {data && (
            <>
              {/* Referral Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <AnimatedCard className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                  <div className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-2">Total Referrals</div>
                  <div className="text-5xl font-black text-blue-600">{data.totalReferrals}</div>
                </AnimatedCard>
                <AnimatedCard className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200" delay={100}>
                  <div className="text-sm text-green-600 font-bold uppercase tracking-wider mb-2">Active Members</div>
                  <div className="text-5xl font-black text-green-600">{data.activeReferrals}</div>
                </AnimatedCard>
              </div>

              {/* Referral Link */}
              <AnimatedCard className="p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl" delay={200}>
                <h2 className="text-2xl font-serif font-black mb-4">Your Referral Link</h2>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6 border border-white/20">
                  <code className="text-blue-200 text-lg break-all">{data.referralLink}</code>
                </div>
                <button
                  onClick={copyLink}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg"
                >
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
              </AnimatedCard>

              {/* How It Works */}
              <AnimatedCard className="p-10 mt-10" delay={300}>
                <h2 className="text-2xl font-serif font-black text-text mb-6">How It Works</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black flex-shrink-0">
                      1
                    </div>
                    <div>
                      <div className="font-bold text-text mb-1">Share your link</div>
                      <div className="text-muted">Send to friends, post in unit Facebook groups, or share on social media</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center font-black flex-shrink-0">
                      2
                    </div>
                    <div>
                      <div className="font-bold text-text mb-1">They sign up</div>
                      <div className="text-muted">When someone creates an account using your link, you&apos;re credited</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center font-black flex-shrink-0">
                      3
                    </div>
                    <div>
                      <div className="font-bold text-text mb-1">Both get rewarded</div>
                      <div className="text-muted">You get 1 month free Premium. They get 10% off their first year.</div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}


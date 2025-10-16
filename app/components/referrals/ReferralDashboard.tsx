'use client';

import { useState } from 'react';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';
import Badge from '../ui/Badge';

interface Referral {
  id: string;
  referred_user_id: string;
  created_at: string;
  status: string;
  conversion_date: string | null;
}

interface ReferralDashboardProps {
  code: string;
  totalReferrals: number;
  totalConversions: number;
  totalEarnings: number;
  availableCredits: number;
  referrals: Referral[];
}

export default function ReferralDashboard({
  code,
  totalReferrals,
  totalConversions,
  totalEarnings,
  availableCredits,
  referrals,
}: ReferralDashboardProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/sign-up?ref=${code}`;
  
  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };
  
  const shareEmail = () => {
    const subject = encodeURIComponent("Check out Garrison Ledger - Military Financial Planning");
    const body = encodeURIComponent(
      `Hey! I've been using Garrison Ledger for my military finances and thought you'd find it useful too.\n\n` +
      `It's got TSP calculators, PCS planners, AI-powered financial plans - all built specifically for military life.\n\n` +
      `Sign up with my code ${code} and we both get $10 credit when you upgrade to premium!\n\n` +
      `Check it out: ${referralUrl}\n\n` +
      `Let me know what you think!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  
  const shareTwitter = () => {
    const text = encodeURIComponent(
      `Just helped another military family discover @GarrisonLedger 🎯\n\n` +
      `TSP calculators, PCS planners, AI financial plans - all built for military life.\n\n` +
      `Use code ${code} for $10 credit! 💰`
    );
    const url = encodeURIComponent(referralUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };
  
  const shareFacebook = () => {
    const url = encodeURIComponent(referralUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending Upgrade</Badge>;
      case 'converted':
        return <Badge variant="warning">Processing Reward</Badge>;
      case 'rewarded':
        return <Badge variant="success">Reward Paid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <AnimatedCard delay={100}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Referrals</span>
              <Icon name="Users" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white">{totalReferrals}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Friends signed up</div>
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={150}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Conversions</span>
              <Icon name="CheckCircle" className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white">{totalConversions}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upgraded to premium</div>
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={200}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Earned</span>
              <Icon name="DollarSign" className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white">${(totalEarnings / 100).toFixed(0)}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lifetime rewards</div>
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={250}>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 border-2 border-green-400 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/90 text-sm font-medium">Available Credits</span>
              <Icon name="Sparkles" className="h-5 w-5 text-white" />
            </div>
            <div className="text-3xl font-black text-white">${(availableCredits / 100).toFixed(0)}</div>
            <div className="text-xs text-white/80 mt-1">Use on premium upgrade</div>
          </div>
        </AnimatedCard>
      </div>
      
      {/* Share Section */}
      <AnimatedCard delay={300} className="mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-slate-600">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Icon name="Share2" className="h-6 w-6" />
            Your Referral Code
          </h2>
          
          {/* Code Display */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Referral Code
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-600 rounded-lg px-6 py-4">
                <span className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-widest">{code}</span>
              </div>
              <button
                onClick={copyCode}
                className={`px-6 py-4 rounded-lg font-bold transition-all ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Icon name="Check" className="h-5 w-5 inline mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Icon name="Copy" className="h-5 w-5 inline mr-2" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Link Display */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Referral Link
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 break-all">{referralUrl}</span>
              </div>
              <button
                onClick={copyLink}
                className={`px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                  linkCopied
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white'
                }`}
              >
                {linkCopied ? (
                  <>
                    <Icon name="Check" className="h-4 w-4 inline mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Icon name="Copy" className="h-4 w-4 inline mr-1" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Social Share Buttons */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Share with Military Friends
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={shareEmail}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                <Icon name="Mail" className="h-5 w-5" />
                Email
              </button>
              <button
                onClick={shareTwitter}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
              >
                <Icon name="MessageSquare" className="h-5 w-5" />
                Twitter
              </button>
              <button
                onClick={shareFacebook}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors"
              >
                <Icon name="Share2" className="h-5 w-5" />
                Facebook
              </button>
            </div>
          </div>
        </div>
      </AnimatedCard>
      
      {/* Referrals List */}
      {referrals.length > 0 && (
        <AnimatedCard delay={400}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-slate-600">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Icon name="Users" className="h-6 w-6" />
              Your Referrals ({referrals.length})
            </h2>
            
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Icon name="User" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        Referral #{referral.id.slice(0, 8)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Signed up {formatDate(referral.created_at)}
                        {referral.conversion_date && (
                          <span className="ml-2">• Upgraded {formatDate(referral.conversion_date)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(referral.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedCard>
      )}
      
      {/* Empty State */}
      {referrals.length === 0 && (
        <AnimatedCard delay={400}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-12 border border-gray-200 dark:border-slate-600 text-center">
            <Icon name="Users" className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No referrals yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Share your code with military friends and start earning $10 for every friend who upgrades to premium!
            </p>
            <button
              onClick={copyCode}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-bold transition-colors"
            >
              <Icon name="Copy" className="h-5 w-5" />
              Copy Your Code
            </button>
          </div>
        </AnimatedCard>
      )}
    </>
  );
}


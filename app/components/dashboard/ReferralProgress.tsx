'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import AnimatedCard from '../ui/AnimatedCard';
import Badge from '../ui/Badge';
import Icon from '../ui/Icon';

interface ReferralProgressProps {
  userId: string;
}

export default function ReferralProgress({ userId }: ReferralProgressProps) {
  const [referralCount, setReferralCount] = useState(0);
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/referrals/stats')
      .then(r => r.json())
      .then(data => {
        setReferralCount(data.count || 0);
        setReferralLink(data.referralLink || '');
      })
      .catch(() => {});
  }, [userId]);

  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const milestones = [
    { count: 1, reward: '1 month free' },
    { count: 3, reward: '2 months free' },
    { count: 5, reward: '3 months free' },
    { count: 10, reward: '6 months free' }
  ];

  const nextMilestone = milestones.find(m => m.count > referralCount) || milestones[milestones.length - 1];
  const progress = (referralCount / nextMilestone.count) * 100;

  return (
    <AnimatedCard className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-6 text-white shadow-lg" delay={300}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl flex items-center gap-2">
          <Icon name="Gift" className="h-6 w-6" />
          Refer & Earn
        </h3>
        <Badge variant="warning">
          <span className="text-white">{referralCount} referrals</span>
        </Badge>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Progress to {nextMilestone.reward}</span>
          <span className="font-bold">{referralCount} / {nextMilestone.count}</span>
        </div>
        <div className="bg-white/20 rounded-full h-3 overflow-hidden mb-2">
          <div 
            className="bg-white h-3 rounded-full transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="text-xs text-white/80">
          {nextMilestone.count - referralCount} more {nextMilestone.count - referralCount === 1 ? 'referral' : 'referrals'} to unlock {nextMilestone.reward}!
        </div>
      </div>

      <div className="flex gap-3">
        <Link 
          href="/dashboard/referrals" 
          className="flex-1 bg-white text-slate-600 px-4 py-3 rounded-lg font-bold text-center hover:shadow-xl transition-all"
        >
          Share Your Link
        </Link>
        <button
          onClick={handleCopyLink}
          className="px-4 py-3 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <Icon name={copied ? "CheckCircle" : "Copy"} className="h-4 w-4" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="mt-4 text-center text-xs text-white/70">
        Share with unit members, military spouses, and veteran friends
      </div>
    </AnimatedCard>
  );
}


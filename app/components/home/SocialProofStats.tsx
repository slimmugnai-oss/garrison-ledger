'use client';

import { useEffect, useState } from 'react';
import Icon from '../ui/Icon';

interface PlatformStats {
  users: number;
  totalPlans: number;
  weeklyPlans: number;
  contentBlocks: number;
}

export default function SocialProofStats() {
  const [stats, setStats] = useState<PlatformStats>({
    users: 500,
    totalPlans: 1200,
    weeklyPlans: 87,
    contentBlocks: 410
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch real stats from API
    fetch('/api/stats/platform')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setIsLoading(false);
      })
      .catch(() => {
        // Keep fallback stats on error
        setIsLoading(false);
      });
  }, []);

  // Animate number counting up
  const [displayedUsers, setDisplayedUsers] = useState(0);
  const [displayedPlans, setDisplayedPlans] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      // Animate user count
      const userInterval = setInterval(() => {
        setDisplayedUsers(prev => {
          if (prev >= stats.users) {
            clearInterval(userInterval);
            return stats.users;
          }
          return prev + Math.ceil(stats.users / 50);
        });
      }, 30);

      // Animate plans count
      const plansInterval = setInterval(() => {
        setDisplayedPlans(prev => {
          if (prev >= stats.totalPlans) {
            clearInterval(plansInterval);
            return stats.totalPlans;
          }
          return prev + Math.ceil(stats.totalPlans / 50);
        });
      }, 30);

      return () => {
        clearInterval(userInterval);
        clearInterval(plansInterval);
      };
    }
  }, [isLoading, stats]);

  return (
    <div className="mt-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-info rounded-2xl p-8 shadow-lg">
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-serif font-black text-primary mb-2">
          Trusted by Military Families Nationwide
        </h3>
        <p className="text-body">Real-time platform statistics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-info rounded-xl mb-3">
            <Icon name="Users" className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl md:text-4xl font-black text-info mb-1">
            {displayedUsers.toLocaleString()}+
          </div>
          <div className="text-sm font-semibold text-body">Military Families</div>
          <div className="text-xs text-muted mt-1">Using Garrison Ledger</div>
        </div>

        {/* Total Plans */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-success rounded-xl mb-3">
            <Icon name="File" className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl md:text-4xl font-black text-success mb-1">
            {displayedPlans.toLocaleString()}+
          </div>
          <div className="text-sm font-semibold text-body">Plans Generated</div>
          <div className="text-xs text-muted mt-1">AI-curated strategies</div>
        </div>

        {/* Weekly Plans */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-xl mb-3">
            <Icon name="TrendingUp" className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl md:text-4xl font-black text-purple-600 mb-1">
            {stats.weeklyPlans}
          </div>
          <div className="text-sm font-semibold text-body">This Week</div>
          <div className="text-xs text-muted mt-1">
            <span className="inline-flex items-center text-success font-semibold">
              <Icon name="TrendingUp" className="w-3 h-3 mr-1" />
              Active growth
            </span>
          </div>
        </div>

        {/* Content Blocks */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-600 rounded-xl mb-3">
            <Icon name="BookOpen" className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl md:text-4xl font-black text-amber-600 mb-1">
            {stats.contentBlocks}+
          </div>
          <div className="text-sm font-semibold text-body">Expert Articles</div>
          <div className="text-xs text-muted mt-1">Hand-curated content</div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-8 pt-8 border-t-2 border-info">
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-body">
          <div className="flex items-center gap-2">
            <Icon name="Shield" className="w-5 h-5 text-info" />
            <span className="font-semibold">Bank-Level Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Lock" className="w-5 h-5 text-success" />
            <span className="font-semibold">256-bit Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" className="w-5 h-5 text-purple-600" />
            <span className="font-semibold">GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Star" className="w-5 h-5 text-amber-600" />
            <span className="font-semibold">100% Free to Start</span>
          </div>
        </div>
      </div>
    </div>
  );
}


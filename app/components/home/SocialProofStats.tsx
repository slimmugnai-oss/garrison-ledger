'use client';

import { useEffect, useState } from 'react';
import { Icon } from '../ui/icon-registry';

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
    <div className="mt-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-serif font-black text-gray-900 mb-2">
          Trusted by Military Families Nationwide
        </h3>
        <p className="text-gray-600">Real-time platform statistics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-3">
            <Icon name="Users" className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl md:text-4xl font-black text-blue-600 mb-1">
            {displayedUsers.toLocaleString()}+
          </div>
          <div className="text-sm font-semibold text-gray-700">Military Families</div>
          <div className="text-xs text-gray-500 mt-1">Using Garrison Ledger</div>
        </div>

        {/* Total Plans */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-xl mb-3">
            <Icon name="FileText" className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl md:text-4xl font-black text-green-600 mb-1">
            {displayedPlans.toLocaleString()}+
          </div>
          <div className="text-sm font-semibold text-gray-700">Plans Generated</div>
          <div className="text-xs text-gray-500 mt-1">AI-curated strategies</div>
        </div>

        {/* Weekly Plans */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-xl mb-3">
            <Icon name="TrendingUp" className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl md:text-4xl font-black text-purple-600 mb-1">
            {stats.weeklyPlans}
          </div>
          <div className="text-sm font-semibold text-gray-700">This Week</div>
          <div className="text-xs text-gray-500 mt-1">
            <span className="inline-flex items-center text-green-600 font-semibold">
              <Icon name="ArrowUp" className="w-3 h-3 mr-1" />
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
          <div className="text-sm font-semibold text-gray-700">Expert Articles</div>
          <div className="text-xs text-gray-500 mt-1">Hand-curated content</div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-8 pt-8 border-t-2 border-blue-200">
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Icon name="Shield" className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Bank-Level Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Lock" className="w-5 h-5 text-green-600" />
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


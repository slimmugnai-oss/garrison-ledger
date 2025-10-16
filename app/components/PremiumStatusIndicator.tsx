'use client';

import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';

export default function PremiumStatusIndicator() {
  const { isPremium, loading } = usePremiumStatus();

  if (loading) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-surface-hover text-body animate-pulse">
        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
        Checking status...
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
        <span className="mr-2">✨</span>
        Premium Member
      </div>
    );
  }

  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-surface-hover text-body">
      <span className="mr-2">👤</span>
      Free Account
    </div>
  );
}

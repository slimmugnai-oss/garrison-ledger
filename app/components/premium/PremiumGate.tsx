'use client';

import Link from 'next/link';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';

type Props = {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  upgradeHref?: string;
};

export default function PremiumGate({ 
  children, 
  placeholder, 
  upgradeHref = '/dashboard/upgrade' 
}: Props) {
  const { isPremium, loading } = usePremiumStatus();

  if (loading) {
    return (
      <div className="rounded-lg border p-6 bg-white shadow-sm animate-pulse text-sm text-gray-500">
        Checking access…
      </div>
    );
  }

  if (isPremium) return <>{children}</>;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-6 bg-white shadow-sm">
        {placeholder ?? (
          <div className="text-gray-600">
            <div className="font-semibold mb-1">Premium feature</div>
            <p>Unlock full results with Premium to see your projections.</p>
          </div>
        )}
      </div>
      <Link
        href={`${upgradeHref}?from=${encodeURIComponent(window.location.pathname)}`}
        onClick={() => {
          try { 
            localStorage.setItem('gl:lastTool', window.location.pathname); 
          } catch {}
        }}
        className="inline-block rounded-md bg-blue-700 px-4 py-2 text-white shadow hover:bg-blue-800 transition-colors"
      >
        Upgrade to Unlock Results
      </Link>
    </div>
  );
}

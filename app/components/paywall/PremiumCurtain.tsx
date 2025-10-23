/**
 * PREMIUM CURTAIN COMPONENT
 * 
 * Blurs and locks premium features for free-tier users.
 * Shows persuasive upgrade CTA with specific value proposition.
 * 
 * Usage:
 * ```tsx
 * <PremiumCurtain
 *   tier={tier}
 *   feature="waterfall"
 *   hiddenCount={5}
 * >
 *   <WaterfallDetails />
 * </PremiumCurtain>
 * ```
 */

'use client';

import Icon from '@/app/components/ui/Icon';
import Link from 'next/link';

export interface PremiumCurtainProps {
  children: React.ReactNode;
  tier: 'free' | 'premium' | 'staff';
  feature: 'flags' | 'waterfall' | 'history' | 'pdf' | 'copy_templates';
  hiddenCount?: number;
  onUpgradeClick?: () => void;
}

const FEATURE_LABELS: Record<string, { title: string; description: string }> = {
  flags: {
    title: '{count} More Findings Locked',
    description: 'Upgrade to see all issues and exact dollar amounts'
  },
  waterfall: {
    title: 'Detailed Reconciliation Locked',
    description: 'Upgrade to see line-by-line variance breakdown'
  },
  history: {
    title: 'Audit History Locked',
    description: 'Upgrade to track your audits over time and see recovered amounts'
  },
  pdf: {
    title: 'PDF Export Locked',
    description: 'Upgrade to save and export your audits as professional PDFs'
  },
  copy_templates: {
    title: 'Copy Templates Locked',
    description: 'Upgrade to copy ready-to-send messages for finance office'
  }
};

export function PremiumCurtain({
  children,
  tier,
  feature,
  hiddenCount = 0,
  onUpgradeClick
}: PremiumCurtainProps) {
  // Premium/staff users see everything
  if (tier === 'premium' || tier === 'staff') {
    return <>{children}</>;
  }

  // Free tier - show curtain
  const content = FEATURE_LABELS[feature];
  const title = content.title.replace('{count}', String(hiddenCount));

  const handleUpgrade = () => {
    // Track click
    if (typeof window !== 'undefined') {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'paywall_cta_click',
          properties: {
            feature,
            tier,
            hiddenCount,
            from: 'premium_curtain'
          }
        })
      }).catch(() => {});  // Fire and forget
    }

    if (onUpgradeClick) {
      onUpgradeClick();
    }
  };

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm">
        <div className="text-center p-8 max-w-md">
          {/* Lock icon */}
          <div className="mb-4">
            <Icon name="Lock" className="h-16 w-16 text-blue-600 mx-auto" />
          </div>

          {/* Title */}
          <h3 className="font-bold text-xl text-gray-900 mb-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            {content.description}
          </p>

          {/* Benefits (for flags feature) */}
          {feature === 'flags' && (
            <ul className="text-left text-sm text-gray-700 mb-6 space-y-2">
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>See exact dollar amounts for all discrepancies</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Copy ready-to-send templates for finance office</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Track recovered money over time</span>
              </li>
            </ul>
          )}

          {/* CTA Button */}
          <Link
            href="/dashboard/upgrade"
            onClick={handleUpgrade}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Icon name="Zap" className="h-5 w-5" />
            Upgrade to Premium
          </Link>

          {/* Subtext */}
          <p className="text-xs text-gray-500 mt-4">
            Join 500+ military families using Garrison Ledger Premium
          </p>
        </div>
      </div>
    </div>
  );
}


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

"use client";

import Link from "next/link";

import Icon from "@/app/components/ui/Icon";

export interface PremiumCurtainProps {
  children: React.ReactNode;
  tier: "free" | "premium" | "staff";
  feature: "flags" | "waterfall" | "history" | "pdf" | "copy_templates";
  hiddenCount?: number;
  onUpgradeClick?: () => void;
}

const FEATURE_LABELS: Record<string, { title: string; description: string }> = {
  flags: {
    title: "{count} More Findings Locked",
    description: "Upgrade to see all issues and exact dollar amounts",
  },
  waterfall: {
    title: "Detailed Reconciliation Locked",
    description: "Upgrade to see line-by-line variance breakdown",
  },
  history: {
    title: "Audit History Locked",
    description: "Upgrade to track your audits over time and see recovered amounts",
  },
  pdf: {
    title: "PDF Export Locked",
    description: "Upgrade to save and export your audits as professional PDFs",
  },
  copy_templates: {
    title: "Copy Templates Locked",
    description: "Upgrade to copy ready-to-send messages for finance office",
  },
};

export function PremiumCurtain({
  children,
  tier,
  feature,
  hiddenCount = 0,
  onUpgradeClick,
}: PremiumCurtainProps) {
  // Premium/staff users see everything
  if (tier === "premium" || tier === "staff") {
    return <>{children}</>;
  }

  // Free tier - show curtain
  const content = FEATURE_LABELS[feature];
  const title = content.title.replace("{count}", String(hiddenCount));

  const handleUpgrade = () => {
    // Track click
    if (typeof window !== "undefined") {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "paywall_cta_click",
          properties: {
            feature,
            tier,
            hiddenCount,
            from: "premium_curtain",
          },
        }),
      }).catch(() => {}); // Fire and forget
    }

    if (onUpgradeClick) {
      onUpgradeClick();
    }
  };

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="pointer-events-none select-none blur-sm" aria-hidden="true">
        {children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm">
        <div className="max-w-md p-8 text-center">
          {/* Lock icon */}
          <div className="mb-4">
            <Icon name="Lock" className="mx-auto h-16 w-16 text-blue-600" />
          </div>

          {/* Title */}
          <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>

          {/* Description */}
          <p className="mb-6 text-gray-600">{content.description}</p>

          {/* Benefits (for flags feature) */}
          {feature === "flags" && (
            <ul className="mb-6 space-y-2 text-left text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <span>See exact dollar amounts for all discrepancies</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <span>Copy ready-to-send templates for finance office</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <span>Track recovered money over time</span>
              </li>
            </ul>
          )}

          {/* CTA Button */}
          <Link
            href="/dashboard/upgrade"
            onClick={handleUpgrade}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Icon name="Zap" className="h-5 w-5" />
            Upgrade to Premium
          </Link>

          {/* Subtext */}
          <p className="mt-4 text-xs text-gray-500">
            Join 500+ military families using Garrison Ledger Premium
          </p>
        </div>
      </div>
    </div>
  );
}

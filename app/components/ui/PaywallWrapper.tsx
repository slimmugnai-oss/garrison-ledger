'use client';

import { ReactNode } from 'react';

interface PaywallWrapperProps {
  isPremium: boolean;
  children: ReactNode;
  title: string;
  description: string;
  toolName: string;
  sampleData?: ReactNode;
}

/**
 * PaywallWrapper - DEPRECATED as of Freemium Model v2.1.0
 * 
 * All 6 calculators are now FREE for all users (part of freemium strategy).
 * This component now simply renders children without any paywall.
 * 
 * Kept for backward compatibility but should be removed in future refactor.
 */
export default function PaywallWrapper({
  children,
}: PaywallWrapperProps) {
  // All tools are now free - just render children
  return <>{children}</>;
}

'use client';

import { ReactNode } from 'react';
import Icon from './Icon';

interface PaywallWrapperProps {
  isPremium: boolean;
  children: ReactNode;
  title: string;
  description: string;
  toolName: string;
  sampleData?: ReactNode;
}

export default function PaywallWrapper({
  isPremium,
  children,
  title,
  description,
  toolName,
  sampleData
}: PaywallWrapperProps) {
  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none">
        {sampleData || children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 backdrop-blur-sm rounded-2xl">
        <div className="bg-white rounded-2xl p-10 shadow-2xl border-2 border-indigo-400 text-center max-w-lg">
          <Icon name="Lock" className="h-16 w-16 text-gray-700 mb-4 mx-auto" />
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            {title}
          </h3>
          <p className="text-lg text-gray-700 mb-2">
            {description}
          </p>
          <p className="text-sm text-gray-600 mb-6">
            <Icon name="Lightbulb" className="h-4 w-4 inline mr-1" /> This analysis would cost <strong className="text-indigo-600">$200+ from a financial advisor</strong>
          </p>
          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-3 mb-6">
            <p className="text-sm font-semibold text-green-800">
              <Icon name="Shield" className="h-4 w-4 inline mr-1" /> 7-Day Money-Back Guarantee · Cancel Anytime
            </p>
          </div>
          <p className="text-3xl font-black text-gray-900 mb-6">
            $9.99<span className="text-lg font-normal text-gray-600">/month</span>
          </p>
          <a href="/dashboard/upgrade" className="inline-block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 mb-4">
            Unlock Now →
          </a>
          <p className="text-xs text-gray-500">
            Less than a coffee per week · Upgrade anytime
          </p>
        </div>
      </div>
    </div>
  );
}

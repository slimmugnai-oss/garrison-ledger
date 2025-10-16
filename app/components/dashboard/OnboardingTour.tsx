'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Icon from '../ui/Icon';

interface OnboardingTourProps {
  userId: string;
  hasProfile: boolean;
  hasAssessment: boolean;
  hasPlan: boolean;
}

export default function OnboardingTour({ userId, hasProfile, hasAssessment, hasPlan }: OnboardingTourProps) {
  const [dismissed, setDismissed] = useState(false);

  // Check if user has seen the tour before
  useEffect(() => {
    const seen = localStorage.getItem(`gl:onboarding-tour-${userId}`);
    if (seen === 'completed') {
      setDismissed(true);
    }
  }, [userId]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(`gl:onboarding-tour-${userId}`, 'dismissed');
  };

  const handleComplete = useCallback(() => {
    setDismissed(true);
    localStorage.setItem(`gl:onboarding-tour-${userId}`, 'completed');
  }, [userId]);

  // Auto-dismiss if user has completed everything
  useEffect(() => {
    if (hasProfile && hasAssessment && hasPlan) {
      handleComplete();
    }
  }, [hasProfile, hasAssessment, hasPlan, handleComplete]);

  if (dismissed || (hasProfile && hasAssessment && hasPlan)) {
    return null;
  }

  const steps = [
    {
      number: 1,
      title: 'Complete Your Profile',
      description: 'Add your rank, branch, base, and goals to unlock personalization',
      icon: '👤',
      status: hasProfile ? 'complete' : 'current',
      link: '/dashboard/profile/setup',
      estimatedTime: '5 minutes'
    },
    {
      number: 2,
      title: 'Take the Assessment',
      description: '~6 quick questions to understand your priorities',
      icon: '📋',
      status: hasAssessment ? 'complete' : hasProfile ? 'current' : 'locked',
      link: hasProfile ? '/dashboard/assessment' : '/dashboard/profile/setup',
      estimatedTime: '3 minutes'
    },
    {
      number: 3,
      title: 'Get Your AI Plan',
      description: 'AI curates 8-10 expert blocks tailored to your situation',
      icon: '✨',
      status: hasPlan ? 'complete' : hasAssessment ? 'current' : 'locked',
      link: hasPlan ? '/dashboard/plan' : hasAssessment ? '/dashboard/plan' : '/dashboard/profile/setup',
      estimatedTime: '30 seconds'
    }
  ];

  return (
    <div className="mb-12 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-700/50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-surface rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-info rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 bg-white/20 border border-white/30 rounded-full text-white text-xs font-bold uppercase tracking-wider mb-3">
              🚀 Getting Started
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-white mb-2">
              Your Path to Personalized Military Planning
            </h2>
            <p className="text-indigo-200 text-sm sm:text-base">
              Complete these 3 steps to unlock your AI-curated financial plan
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Dismiss tour"
          >
            <svg className="w-5 h-5 text-white/70 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((step, index) => {
            const isCurrent = step.status === 'current';
            const isComplete = step.status === 'complete';
            const isLocked = step.status === 'locked';

            return (
              <div
                key={step.number}
                className={`relative ${
                  isLocked ? 'opacity-60' : ''
                }`}
              >
                {/* Connector line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-full w-full h-0.5 -ml-3">
                    <div className={`h-full ${isComplete ? 'bg-green-400' : 'bg-white/20'}`} style={{ width: 'calc(100% - 1.5rem)' }} />
                  </div>
                )}

                {/* Step card */}
                <div className={`relative bg-white/10 backdrop-blur border rounded-xl p-5 transition-all ${
                  isCurrent ? 'border-white/50 ring-2 ring-white/30' :
                  isComplete ? 'border-green-400/50' :
                  'border-white/20'
                }`}>
                  {/* Step number/icon */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold border-2 ${
                      isComplete ? 'bg-green-500 border-green-400' :
                      isCurrent ? 'bg-white/20 border-white/50 animate-pulse' :
                      'bg-white/5 border-white/20'
                    }`}>
                      {isComplete ? '✓' : step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-indigo-200 font-medium mb-0.5">
                        Step {step.number} of 3
                      </div>
                      <div className={`text-sm font-bold ${isComplete ? 'text-green-300' : 'text-white'}`}>
                        {step.estimatedTime}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-indigo-200 mb-4 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Action button */}
                  {isComplete ? (
                    <div className="flex items-center gap-2 text-green-300 text-sm font-semibold">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Complete!
                    </div>
                  ) : isCurrent ? (
                    <Link
                      href={step.link}
                      className="inline-flex items-center justify-center w-full bg-surface text-indigo-900 hover:bg-indigo-50 px-4 py-2.5 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      {step.number === 1 ? 'Start Here →' : 
                       step.number === 2 ? 'Take Assessment →' : 
                       'View Plan →'}
                    </Link>
                  ) : (
                    <div className="text-xs text-white/50 italic">
                      Complete Step {step.number - 1} first
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-6 pt-6 border-t border-white/20 flex items-center justify-between">
          <p className="text-sm text-indigo-200">
            <Icon name="HelpCircle" className="w-4 h-4 inline mr-1" />
            You can skip steps and return anytime
          </p>
          <button
            onClick={handleDismiss}
            className="text-sm text-white/70 hover:text-white underline transition-colors"
          >
            Dismiss tour
          </button>
        </div>
      </div>
    </div>
  );
}


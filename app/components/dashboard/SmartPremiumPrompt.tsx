'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

interface SmartPremiumPromptProps {
  isPremium: boolean;
  userId: string;
}

export default function SmartPremiumPrompt({ isPremium, userId }: SmartPremiumPromptProps) {
  const [savedScenariosCount, setSavedScenariosCount] = useState(0);
  const [savedContentCount, setSavedContentCount] = useState(0);
  const [calculatorUsageCount, setCalculatorUsageCount] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptType, setPromptType] = useState<'power-user' | 'content-collector' | 'limit-reached' | null>(null);

  useEffect(() => {
    if (isPremium) return;

    Promise.all([
      fetch('/api/calculator/scenarios').then(r => r.json()),
      fetch('/api/bookmarks').then(r => r.json()),
      fetch('/api/calculator/usage').then(r => r.json()).catch(() => ({ count: 0 }))
    ]).then(([scenarios, bookmarks, usage]) => {
      const scenarioCount = scenarios.scenarios?.length || 0;
      const bookmarkCount = bookmarks.bookmarks?.length || 0;
      const usageCount = usage.count || 0;

      setSavedScenariosCount(scenarioCount);
      setSavedContentCount(bookmarkCount);
      setCalculatorUsageCount(usageCount);

      // Determine prompt type
      if (scenarioCount >= 2) {
        setPromptType('power-user');
        setShowPrompt(true);
      } else if (bookmarkCount >= 5) {
        setPromptType('content-collector');
        setShowPrompt(true);
      } else if (usageCount >= 4) {
        setPromptType('limit-reached');
        setShowPrompt(true);
      }
    });
  }, [userId, isPremium]);

  if (isPremium || !showPrompt || !promptType) return null;

  const prompts = {
    'power-user': {
      gradient: 'from-amber-500 to-orange-500',
      icon: 'Zap',
      title: '🎯 You\'re a Power User!',
      description: `You've saved ${savedScenariosCount} scenarios. Premium unlocks unlimited saves, comparison mode, and professional PDF exports.`,
      benefit: 'Save unlimited scenarios • Compare up to 5 side-by-side • Export PDFs',
      social: 'Join 500+ power users'
    },
    'content-collector': {
      gradient: 'from-purple-500 to-indigo-500',
      icon: 'BookOpen',
      title: '📚 You Love Our Content!',
      description: `You've bookmarked ${savedContentCount} articles. Premium gives you unlimited bookmarks, custom collections, and offline access.`,
      benefit: 'Unlimited bookmarks • Create collections • Download for offline',
      social: 'Join 300+ content enthusiasts'
    },
    'limit-reached': {
      gradient: 'from-slate-700 to-slate-900',
      icon: 'AlertTriangle',
      title: '⚠️ Calculator Limit Reached',
      description: `You've used ${calculatorUsageCount} of 5 free calculations this month. Upgrade for unlimited access.`,
      benefit: 'Unlimited calculations • All premium features • Priority support',
      social: 'Most popular upgrade trigger'
    }
  };

  const prompt = prompts[promptType];

  return (
    <AnimatedCard className={`bg-gradient-to-r ${prompt.gradient} rounded-xl p-8 text-white shadow-2xl mb-12`} delay={150}>
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name={prompt.icon as any} className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-2xl">{prompt.title}</h3>
          </div>
          
          <p className="text-white/90 text-lg mb-4 leading-relaxed">
            {prompt.description}
          </p>

          <div className="bg-white/10 rounded-lg p-4 mb-6 backdrop-blur-sm">
            <div className="text-sm font-semibold mb-2">Premium Benefits:</div>
            <div className="text-white/90 text-sm">{prompt.benefit}</div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/upgrade" 
              className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:shadow-2xl transition-all inline-flex items-center gap-2"
            >
              Upgrade Now - $9.99/mo
              <Icon name="ArrowRight" className="h-5 w-5" />
            </Link>
            <div className="text-white/80 text-sm">
              <div className="font-semibold">{prompt.social}</div>
              <div className="text-white/70 text-xs">7-day money-back guarantee</div>
            </div>
          </div>
        </div>

        {/* Value Comparison Card */}
        <div className="hidden lg:block w-64 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="text-center mb-4">
            <div className="text-sm font-semibold text-white/80 mb-1">Premium Value</div>
            <div className="text-4xl font-black">$9.99</div>
            <div className="text-sm text-white/70">/month</div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 text-green-300 flex-shrink-0" />
              <span>Unlimited calculations</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 text-green-300 flex-shrink-0" />
              <span>Save unlimited scenarios</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 text-green-300 flex-shrink-0" />
              <span>Professional PDF exports</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 text-green-300 flex-shrink-0" />
              <span>Spouse collaboration</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 text-green-300 flex-shrink-0" />
              <span>Comparison mode</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 text-green-300 flex-shrink-0" />
              <span>Offline access</span>
            </div>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}


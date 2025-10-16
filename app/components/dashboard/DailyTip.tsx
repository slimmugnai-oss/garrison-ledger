'use client';

import { useEffect, useState } from 'react';
import { Icon } from '../ui/icon-registry';
import AnimatedCard from '../ui/AnimatedCard';

const TIPS = [
  {
    icon: '💰',
    title: 'TSP Tip',
    text: 'Max out your TSP match! If you\'re not contributing at least 5%, you\'re leaving free money on the table.',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    icon: '📦',
    title: 'PCS Pro Tip',
    text: 'Do a PPM (Personally Procured Move)? You can often make $2,000-$5,000 profit by moving yourself.',
    color: 'from-green-500 to-emerald-600'
  },
  {
    icon: '🏠',
    title: 'BAH Hack',
    text: 'House hacking with your BAH? A duplex can cover your mortgage and generate rental income. Start building wealth now.',
    color: 'from-purple-500 to-pink-600'
  },
  {
    icon: '🚀',
    title: 'SDP Secret',
    text: 'Deployed? The Savings Deposit Program gives you guaranteed 10% returns (up to $10K). That\'s $1,000 risk-free!',
    color: 'from-orange-500 to-red-600'
  },
  {
    icon: '🛒',
    title: 'Commissary Savings',
    text: 'Shopping on base saves the average military family $4,500/year. Are you maximizing your benefit?',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    icon: '📚',
    title: 'Education Benefit',
    text: 'Using TA or GI Bill? You can earn a degree debt-free AND get BAH. That\'s $1,500+/month while in school.',
    color: 'from-amber-500 to-orange-600'
  },
  {
    icon: '💼',
    title: 'Transition Tip',
    text: 'Separating soon? Start your job search 6-12 months out. Military experience translates to 6-figure civilian roles.',
    color: 'from-teal-500 to-green-600'
  },
  {
    icon: '🎯',
    title: 'Emergency Fund',
    text: 'Military life is unpredictable. Aim for 3-6 months expenses saved. Start with $1,000, then build from there.',
    color: 'from-rose-500 to-pink-600'
  },
  {
    icon: '📱',
    title: 'SCRA Protection',
    text: 'Know your rights! SCRA can cap your interest rates at 6% on pre-service debts. Call your creditors.',
    color: 'from-violet-500 to-purple-600'
  },
  {
    icon: '🏆',
    title: 'Tax Advantage',
    text: 'Combat zone pay is tax-free! Max out your Roth TSP during deployment for tax-free growth forever.',
    color: 'from-indigo-500 to-blue-600'
  }
];

export default function DailyTip() {
  const [tip, setTip] = useState(TIPS[0]);

  useEffect(() => {
    // Select a random tip based on the day (changes daily)
    const today = new Date().getDate();
    const tipIndex = today % TIPS.length;
    setTip(TIPS[tipIndex]);
  }, []);

  return (
    <AnimatedCard delay={200} className={`bg-gradient-to-br ${tip.color} text-white p-6 shadow-lg overflow-hidden relative`}>
      <div className="absolute top-0 right-0 text-8xl opacity-10 transform rotate-12 -mr-4 -mt-4">
        {tip.icon}
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{tip.icon}</span>
          <div className="inline-flex items-center bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            💡 Tip of the Day
          </div>
        </div>
        
        <h3 className="text-xl font-black mb-2">{tip.title}</h3>
        <p className="text-sm leading-relaxed opacity-90">{tip.text}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => {
              const randomIndex = Math.floor(Math.random() * TIPS.length);
              setTip(TIPS[randomIndex]);
            }}
            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          >
            <Icon name="RefreshCw" className="w-4 h-4" />
            New Tip
          </button>
          <span className="text-xs opacity-75">New tip daily</span>
        </div>
      </div>
    </AnimatedCard>
  );
}


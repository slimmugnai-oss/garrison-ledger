'use client';

import { useEffect, useState } from 'react';
import Icon from '../ui/Icon';
import AnimatedCard from '../ui/AnimatedCard';

interface FinancialData {
  hasTSP: boolean;
  hasEmergencyFund: boolean;
  hasDebt: boolean;
  hasCompletedProfile: boolean;
  hasCompletedAssessment: boolean;
  hasPlan: boolean;
}

interface FinancialReadinessScoreProps {
  userId: string;
  profileData: FinancialData;
}

export default function FinancialReadinessScore({ profileData }: FinancialReadinessScoreProps) {
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Calculate financial readiness score (0-100)
    let calculatedScore = 0;
    
    // Profile completion (20 points)
    if (profileData.hasCompletedProfile) calculatedScore += 20;
    
    // Assessment completed (15 points)
    if (profileData.hasCompletedAssessment) calculatedScore += 15;
    
    // Has AI plan (15 points)
    if (profileData.hasPlan) calculatedScore += 15;
    
    // TSP contribution (20 points)
    if (profileData.hasTSP) calculatedScore += 20;
    
    // Emergency fund (20 points)
    if (profileData.hasEmergencyFund) calculatedScore += 20;
    
    // Debt management (10 points - higher if less/no debt)
    if (!profileData.hasDebt) calculatedScore += 10;
    
    setScore(calculatedScore);

    // Animate score counting up
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= calculatedScore) {
        setDisplayScore(calculatedScore);
        clearInterval(interval);
      } else {
        setDisplayScore(current);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [profileData]);

  const getScoreColor = () => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-slate-700 to-slate-900';
    if (score >= 40) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const getNextSteps = () => {
    const steps = [];
    if (!profileData.hasCompletedProfile) steps.push({ icon: 'User', text: 'Complete your profile', points: 20 });
    if (!profileData.hasCompletedAssessment) steps.push({ icon: 'ClipboardList', text: 'Take the assessment', points: 15 });
    if (!profileData.hasPlan) steps.push({ icon: 'File', text: 'Generate your AI plan', points: 15 });
    if (!profileData.hasTSP) steps.push({ icon: 'TrendingUp', text: 'Start TSP contributions', points: 20 });
    if (!profileData.hasEmergencyFund) steps.push({ icon: 'Shield', text: 'Build emergency fund', points: 20 });
    if (profileData.hasDebt) steps.push({ icon: 'DollarSign', text: 'Create debt payoff plan', points: 10 });
    return steps;
  };

  const nextSteps = getNextSteps();

  return (
    <AnimatedCard delay={150} className={`bg-gradient-to-br ${getScoreColor()} text-white p-8 shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wider opacity-90 mb-1">
            Your Financial Readiness
          </div>
          <h3 className="text-3xl font-black">{getScoreLabel()} Status</h3>
        </div>
        <div className="relative">
          {/* Circular Progress */}
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="opacity-30"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - displayScore / 100)}`}
              className="transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-black">{displayScore}</span>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
          <div className="text-2xl font-black mb-1">
            {profileData.hasCompletedProfile ? '20' : '0'}/20
          </div>
          <div className="text-xs opacity-75">Profile</div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
          <div className="text-2xl font-black mb-1">
            {(profileData.hasTSP ? 20 : 0) + (profileData.hasEmergencyFund ? 20 : 0)}/40
          </div>
          <div className="text-xs opacity-75">Savings</div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
          <div className="text-2xl font-black mb-1">
            {(profileData.hasCompletedAssessment ? 15 : 0) + (profileData.hasPlan ? 15 : 0)}/30
          </div>
          <div className="text-xs opacity-75">Planning</div>
        </div>
      </div>

      {/* Next steps */}
      {nextSteps.length > 0 && (
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <div className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Icon name="Target" className="w-4 h-4" />
            Next Steps to Improve
          </div>
          <div className="space-y-2">
              {nextSteps.slice(0, 3).map((step, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name={step.icon as 'User' | 'ClipboardList' | 'File' | 'TrendingUp' | 'Shield' | 'DollarSign'} className="w-4 h-4" />
                  <span>{step.text}</span>
                </div>
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">
                  +{step.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {score === 100 && (
        <div className="mt-4 bg-white/20 backdrop-blur rounded-lg p-4 text-center">
          <span className="text-2xl mb-2 block">🏆</span>
          <div className="font-bold">Perfect Score!</div>
          <div className="text-xs opacity-90">You&apos;re maximizing your military benefits</div>
        </div>
      )}
    </AnimatedCard>
  );
}


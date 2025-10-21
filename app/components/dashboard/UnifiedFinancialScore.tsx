'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

interface HealthMetric {
  name: string;
  score: number;
  maxScore: number;
  target: string;
  status: 'excellent' | 'good' | 'fair' | 'needs-work';
  recommendation?: string;
  link?: string;
}

interface UnifiedFinancialScoreProps {
  profileData: {
    tspBalanceRange?: string;
    emergencyFundRange?: string;
    debtAmountRange?: string;
    hasTSP: boolean;
    hasEmergencyFund: boolean;
    hasDebt: boolean;
    hasCompletedProfile: boolean;
  };
}

export default function UnifiedFinancialScore({ profileData }: UnifiedFinancialScoreProps) {
  const [healthScore, setHealthScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);

  useEffect(() => {
    calculateHealthScore();
  }, [profileData]);

  const calculateHealthScore = () => {
    const calculatedMetrics: HealthMetric[] = [];
    let totalScore = 0;
    let _maxTotalScore = 0;

    // Profile Completion (15 points)
    const profileScore = profileData.hasCompletedProfile ? 15 : 0;
    calculatedMetrics.push({
      name: 'Profile Setup',
      score: profileScore,
      maxScore: 15,
      target: 'Complete profile',
      status: profileScore >= 15 ? 'excellent' : 'needs-work',
      recommendation: profileScore < 15 ? 'Complete your profile' : undefined,
      link: '/dashboard/profile/setup'
    });
    totalScore += profileScore;
    _maxTotalScore += 15;


    // Emergency Fund (25 points)
    let efScore = 0;
    let efStatus: 'excellent' | 'good' | 'fair' | 'needs-work' = 'needs-work';
    if (profileData.emergencyFundRange) {
      if (profileData.emergencyFundRange.includes('$20,000+') || profileData.emergencyFundRange.includes('$10,000')) {
        efScore = 25;
        efStatus = 'excellent';
      } else if (profileData.emergencyFundRange.includes('$5,000')) {
        efScore = 20;
        efStatus = 'good';
      } else if (profileData.emergencyFundRange.includes('$1,000')) {
        efScore = 10;
        efStatus = 'fair';
      }
    }
    calculatedMetrics.push({
      name: 'Emergency Fund',
      score: efScore,
      maxScore: 25,
      target: '6 months expenses',
      status: efStatus,
      recommendation: efScore < 25 ? 'Build to 6 months of expenses' : undefined,
      link: '/dashboard/library?search=emergency+fund'
    });
    totalScore += efScore;
    _maxTotalScore += 25;

    // TSP Contributions (20 points)
    let tspScore = 0;
    let tspStatus: 'excellent' | 'good' | 'fair' | 'needs-work' = 'needs-work';
    if (profileData.hasTSP) {
      if (profileData.tspBalanceRange?.includes('$100,000+')) {
        tspScore = 20;
        tspStatus = 'excellent';
      } else if (profileData.tspBalanceRange?.includes('$50,000')) {
        tspScore = 15;
        tspStatus = 'good';
      } else if (profileData.tspBalanceRange?.includes('$10,000')) {
        tspScore = 10;
        tspStatus = 'fair';
      } else {
        tspScore = 5;
        tspStatus = 'needs-work';
      }
    }
    calculatedMetrics.push({
      name: 'TSP Retirement',
      score: tspScore,
      maxScore: 20,
      target: '15% + BRS match',
      status: tspStatus,
      recommendation: tspScore < 20 ? 'Increase contribution by 2%' : undefined,
      link: '/dashboard/tools/tsp-modeler'
    });
    totalScore += tspScore;
    _maxTotalScore += 20;

    // Debt Management (10 points - inverse scoring)
    let debtScore = 10;
    let debtStatus: 'excellent' | 'good' | 'fair' | 'needs-work' = 'excellent';
    if (profileData.hasDebt) {
      if (profileData.debtAmountRange?.includes('$50,000+') || profileData.debtAmountRange?.includes('$20,000')) {
        debtScore = 2;
        debtStatus = 'needs-work';
      } else if (profileData.debtAmountRange?.includes('$10,000')) {
        debtScore = 5;
        debtStatus = 'fair';
      } else if (profileData.debtAmountRange?.includes('$5,000')) {
        debtScore = 8;
        debtStatus = 'good';
      }
    }
    calculatedMetrics.push({
      name: 'Debt Ratio',
      score: debtScore,
      maxScore: 10,
      target: '< 20% Income',
      status: debtStatus,
      recommendation: debtScore < 10 ? 'Create debt payoff plan' : undefined,
      link: '/dashboard/library?search=debt+payoff'
    });
    totalScore += debtScore;

    setHealthScore(totalScore);
    setMetrics(calculatedMetrics);

    // Animate score counting up
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= totalScore) {
        setDisplayScore(totalScore);
        clearInterval(interval);
      } else {
        setDisplayScore(current);
      }
    }, 20);

    return () => clearInterval(interval);
  };

  const getScoreColor = () => {
    const percentage = (healthScore / 100) * 100;
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-slate-700 to-slate-900';
    if (percentage >= 40) return 'from-amber-500 to-orange-600';
    return 'from-slate-600 to-slate-800';
  };

  const getScoreLabel = () => {
    const percentage = (healthScore / 100) * 100;
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Fair';
    return 'Needs Work';
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-slate-500';
      case 'fair': return 'bg-amber-500';
      default: return 'bg-red-500';
    }
  };

  const topRecommendation = metrics.find(m => m.recommendation)?.recommendation;

  return (
    <AnimatedCard delay={150} className={`bg-gradient-to-br ${getScoreColor()} text-white p-4 sm:p-6 lg:p-8 shadow-lg overflow-hidden`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold uppercase tracking-wider opacity-90 mb-1">
            Your Financial Health
          </div>
          <h3 className="text-2xl sm:text-3xl font-black break-words">{getScoreLabel()} Status</h3>
        </div>
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white/30 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-black">{displayScore}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 min-w-0">
            <div className="flex items-center justify-between mb-2 gap-2">
              <span className="text-sm font-semibold truncate">{metric.name}</span>
              <span className="text-sm font-bold flex-shrink-0">{metric.score}/{metric.maxScore}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all ${getMetricColor(metric.status)}`}
                style={{ width: `${(metric.score / metric.maxScore) * 100}%` }}
              />
            </div>
            <div className="text-xs opacity-80 break-words">{metric.target}</div>
          </div>
        ))}
      </div>

      {topRecommendation && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <Icon name="Lightbulb" className="h-5 w-5 text-white" />
            <div>
              <div className="font-semibold mb-1">Top Recommendation</div>
              <div className="text-sm opacity-90">{topRecommendation}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link 
          href="/dashboard/assessment" 
          className="flex-1 bg-white text-slate-600 px-4 py-3 rounded-lg font-bold text-center hover:shadow-xl transition-all min-h-[44px] flex items-center justify-center"
        >
          Take Action →
        </Link>
        <Link 
          href="/dashboard/tools" 
          className="px-4 py-3 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2 min-h-[44px]"
        >
          <Icon name="Calculator" className="h-4 w-4" />
          Tools
        </Link>
      </div>

      <div className="mt-4 text-center text-xs text-white/70">
        Use our calculators to improve your score 📈
      </div>
    </AnimatedCard>
  );
}

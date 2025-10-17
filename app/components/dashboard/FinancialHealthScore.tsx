'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

interface HealthMetric {
  name: string;
  score: number;
  target: string;
  status: 'excellent' | 'good' | 'fair' | 'needs-work';
  recommendation?: string;
  link?: string;
}

interface FinancialHealthScoreProps {
  profileData: {
    tspBalanceRange?: string;
    emergencyFundRange?: string;
    debtAmountRange?: string;
    hasTSP: boolean;
    hasEmergencyFund: boolean;
    hasDebt: boolean;
  };
}

export default function FinancialHealthScore({ profileData }: FinancialHealthScoreProps) {
  const [healthScore, setHealthScore] = useState(0);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);

  useEffect(() => {
    calculateHealthScore();
  }, [profileData]);

  const calculateHealthScore = () => {
    const calculatedMetrics: HealthMetric[] = [];
    let totalScore = 0;

    // Emergency Fund (30 points)
    let efScore = 0;
    let efStatus: 'excellent' | 'good' | 'fair' | 'needs-work' = 'needs-work';
    if (profileData.emergencyFundRange) {
      if (profileData.emergencyFundRange.includes('$20,000+') || profileData.emergencyFundRange.includes('$10,000')) {
        efScore = 30;
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
      target: '6 months expenses',
      status: efStatus,
      recommendation: efScore < 30 ? 'Build to 6 months of expenses' : undefined,
      link: '/dashboard/library?search=emergency+fund'
    });
    totalScore += efScore;

    // TSP Contributions (35 points)
    let tspScore = 0;
    let tspStatus: 'excellent' | 'good' | 'fair' | 'needs-work' = 'needs-work';
    if (profileData.hasTSP) {
      if (profileData.tspBalanceRange?.includes('$100,000+')) {
        tspScore = 35;
        tspStatus = 'excellent';
      } else if (profileData.tspBalanceRange?.includes('$50,000')) {
        tspScore = 25;
        tspStatus = 'good';
      } else if (profileData.tspBalanceRange?.includes('$10,000')) {
        tspScore = 15;
        tspStatus = 'fair';
      } else {
        tspScore = 5;
        tspStatus = 'needs-work';
      }
    }
    calculatedMetrics.push({
      name: 'TSP Retirement',
      score: tspScore,
      target: '15% + BRS match',
      status: tspStatus,
      recommendation: tspScore < 35 ? 'Increase contribution by 2%' : undefined,
      link: '/dashboard/tools/tsp-modeler'
    });
    totalScore += tspScore;

    // Debt Management (25 points - inverse scoring)
    let debtScore = 25;
    let debtStatus: 'excellent' | 'good' | 'fair' | 'needs-work' = 'excellent';
    if (profileData.hasDebt) {
      if (profileData.debtAmountRange?.includes('$50,000+') || profileData.debtAmountRange?.includes('$20,000')) {
        debtScore = 5;
        debtStatus = 'needs-work';
      } else if (profileData.debtAmountRange?.includes('$10,000')) {
        debtScore = 15;
        debtStatus = 'fair';
      } else if (profileData.debtAmountRange?.includes('$5,000')) {
        debtScore = 20;
        debtStatus = 'good';
      }
    }
    calculatedMetrics.push({
      name: 'Debt Ratio',
      score: debtScore,
      target: '< 20% income',
      status: debtStatus,
      recommendation: debtScore < 25 ? 'Focus on debt paydown' : undefined,
      link: '/dashboard/library?search=debt+payoff'
    });
    totalScore += debtScore;

    // Insurance Coverage (10 points - assumed)
    calculatedMetrics.push({
      name: 'Insurance Coverage',
      score: 8,
      target: 'SGLI + Term',
      status: 'good',
      link: '/dashboard/library?search=life+insurance'
    });
    totalScore += 8;

    setMetrics(calculatedMetrics);
    setHealthScore(Math.round(totalScore));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'from-green-600 to-emerald-600', text: 'text-green-600', label: 'Excellent' };
    if (score >= 60) return { bg: 'from-slate-700 to-slate-900', text: 'text-slate-600', label: 'Good' };
    if (score >= 40) return { bg: 'from-amber-500 to-orange-500', text: 'text-amber-600', label: 'Fair' };
    return { bg: 'from-slate-600 to-slate-800', text: 'text-slate-600', label: 'Needs Work' };
  };

  const getMetricColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-slate-500';
    if (percentage >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const scoreColor = getScoreColor(healthScore);
  const topRecommendation = metrics.find(m => m.recommendation);

  return (
    <AnimatedCard className={`bg-gradient-to-br ${scoreColor.bg} rounded-2xl p-8 text-white shadow-2xl`} delay={200}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Heart" className="h-6 w-6 text-white" />
            <span className="text-sm font-semibold text-white/80 uppercase tracking-wider">Your Financial Health</span>
          </div>
          <h2 className="text-3xl font-serif font-black">Overall Score</h2>
        </div>
        <div className="text-center">
          <div className="text-6xl font-black">{healthScore}</div>
          <div className="text-lg font-semibold text-white/80">{scoreColor.label}</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {metrics.map((metric) => {
          const maxScore = metric.name === 'Emergency Fund' ? 30 : metric.name === 'TSP Retirement' ? 35 : metric.name === 'Debt Ratio' ? 25 : 10;
          return (
            <div key={metric.name} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">{metric.name}</div>
                <div className="text-sm font-bold">{metric.score}/{maxScore}</div>
              </div>
              <div className="bg-white/20 rounded-full h-2 mb-2">
                <div 
                  className={`${getMetricColor(metric.score, maxScore)} h-2 rounded-full transition-all`}
                  style={{ width: `${(metric.score / maxScore) * 100}%` }}
                />
              </div>
              <div className="text-xs text-white/70">Target: {metric.target}</div>
            </div>
          );
        })}
      </div>

      {/* Top Recommendation */}
      {topRecommendation && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-start gap-3">
            <Icon name="Lightbulb" className="h-5 w-5 text-yellow-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold mb-1">💡 Top Recommendation</div>
              <div className="text-white/90 mb-3">{topRecommendation.recommendation}</div>
              {topRecommendation.link && (
                <Link
                  href={topRecommendation.link}
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-xl transition-all"
                >
                  Take Action
                  <Icon name="ArrowRight" className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Improve Score CTA */}
      <div className="mt-6 pt-6 border-t border-white/20 text-center">
        <Link
          href="/dashboard/tools"
          className="text-white/90 hover:text-white font-semibold text-sm inline-flex items-center gap-2"
        >
          Use our calculators to improve your score
          <Icon name="TrendingUp" className="h-4 w-4" />
        </Link>
      </div>
    </AnimatedCard>
  );
}


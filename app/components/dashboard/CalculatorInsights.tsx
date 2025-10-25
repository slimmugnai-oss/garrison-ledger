'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

interface Insight {
  calculator: string;
  title: string;
  insight: string;
  potentialSavings: string;
  link: string;
  icon: string;
}

interface CalculatorInsightsProps {
  userId: string;
}

export default function CalculatorInsights({ userId }: CalculatorInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch calculator scenarios to generate insights
    fetch('/api/calculator/scenarios')
      .then(r => r.json())
      .then(data => {
        const scenarios = data.scenarios || [];
        const generatedInsights: Insight[] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scenarios.forEach((scenario: any) => {
          // Generate insights based on calculator type
          if (scenario.calculator_type === 'tsp-modeler' && scenario.inputs) {
            const monthlyContrib = scenario.inputs.monthlyContribution || 0;
            const increase = monthlyContrib * 0.02; // 2% increase suggestion
            const years = 30 - (scenario.inputs.yearsOfService || 0);
            const futureValue = increase * 12 * years * 1.07; // Rough estimate with 7% return
            
            generatedInsights.push({
              calculator: 'TSP Modeler',
              title: 'TSP Optimization Opportunity',
              insight: `Increasing contribution by 2% (${increase.toFixed(0)}/mo)`,
              potentialSavings: `$${(futureValue/1000).toFixed(0)}K more at retirement`,
              link: '/dashboard/tools/tsp-modeler',
              icon: 'TrendingUp'
            });
          }

          if (scenario.calculator_type === 'pcs-planner' && scenario.inputs) {
            generatedInsights.push({
              calculator: 'PCS Planner',
              title: 'DITY Move Opportunity',
              insight: 'Self-move vs full government move',
              potentialSavings: `Save $3,200+ with DITY`,
              link: '/dashboard/tools/pcs-planner',
              icon: 'Truck'
            });
          }
        });

        setInsights(generatedInsights.slice(0, 2));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading || insights.length === 0) return null;

  return (
    <AnimatedCard className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-8 text-white shadow-2xl mb-12" delay={200}>
      <h3 className="font-bold text-2xl mb-6 flex items-center gap-2">
        <Icon name="Lightbulb" className="h-6 w-6" />
        💰 Your Financial Opportunities
      </h3>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Icon name={insight.icon as any} className="h-5 w-5" />
                  <span className="font-semibold text-lg">{insight.title}</span>
                </div>
                <div className="text-white/90 mb-2">{insight.insight}</div>
                <div className="text-2xl font-black text-green-200">{insight.potentialSavings}</div>
              </div>
              <Link
                href={insight.link}
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:shadow-xl transition-all whitespace-nowrap flex items-center gap-2"
              >
                Optimize
                <Icon name="ArrowRight" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AnimatedCard>
  );
}


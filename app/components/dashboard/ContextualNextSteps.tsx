'use client';

import Link from 'next/link';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

interface NextStep {
  icon: string;
  title: string;
  description: string;
  cta: string;
  link: string;
  urgency: 'urgent' | 'high' | 'normal';
  reason: string;
}

interface ContextualNextStepsProps {
  userState: {
    hasTSP: boolean;
    pcsDaysAway?: number;
    deploymentStatus?: string;
    hasEmergencyFund: boolean;
    calculatorUsageCount: number;
  };
}

export default function ContextualNextSteps({ userState }: ContextualNextStepsProps) {
  const nextSteps: NextStep[] = [];

  // PCS URGENCY - Most urgent
  if (userState.pcsDaysAway !== undefined && userState.pcsDaysAway <= 90) {
    const urgency = userState.pcsDaysAway <= 30 ? 'urgent' : 'high';
    nextSteps.push({
      icon: 'Truck',
      title: 'Plan Your PCS Budget',
      description: `PCS in ${userState.pcsDaysAway} days - Create your moving budget and maximize DITY profit`,
      cta: 'Start PCS Planning',
      link: '/dashboard/tools/pcs-planner',
      urgency,
      reason: `${userState.pcsDaysAway} days until PCS`
    });
  }

  // DEPLOYMENT PREP - High priority
  if (userState.deploymentStatus === 'deploying-soon') {
    nextSteps.push({
      icon: 'Shield',
      title: 'Deployment Financial Prep',
      description: 'Maximize SDP 10% return and complete pre-deployment financial checklist',
      cta: 'Deploy Strategy',
      link: '/deployment',
      urgency: 'urgent',
      reason: 'Deployment approaching'
    });
  }

  // TSP OPTIMIZATION - High value
  if (!userState.hasTSP || userState.calculatorUsageCount === 0) {
    nextSteps.push({
      icon: 'TrendingUp',
      title: 'Optimize Your TSP',
      description: 'You could be leaving thousands on the table - maximize your retirement contributions',
      cta: 'Calculate Now',
      link: '/dashboard/tools/tsp-modeler',
      urgency: 'high',
      reason: 'High retirement impact'
    });
  }

  // EMERGENCY FUND - Financial foundation
  if (!userState.hasEmergencyFund) {
    nextSteps.push({
      icon: 'Shield',
      title: 'Build Emergency Fund',
      description: 'Protect yourself from unexpected expenses - aim for 6 months of expenses',
      cta: 'Learn How',
      link: '/dashboard/library?search=emergency+fund',
      urgency: 'normal',
      reason: 'Financial security'
    });
  }

  // DEFAULT - If no specific next steps
  if (nextSteps.length === 0) {
    nextSteps.push({
      icon: 'Sparkles',
      title: 'Explore the Intel Library',
      description: 'Discover 410+ expert-curated content blocks tailored to military life',
      cta: 'Browse Library',
      link: '/dashboard/library',
      urgency: 'normal',
      reason: 'Continuous learning'
    });
  }

  // Show top 2 next steps
  const topSteps = nextSteps.slice(0, 2);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return {
          bg: 'from-slate-600 to-slate-800',
          badge: 'bg-slate-600',
          text: 'URGENT'
        };
      case 'high':
        return {
          bg: 'from-amber-500 to-orange-500',
          badge: 'bg-amber-600',
          text: 'PRIORITY'
        };
      default:
        return {
          bg: 'from-slate-700 to-slate-900',
          badge: 'bg-slate-600',
          text: 'RECOMMENDED'
        };
    }
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-serif font-black text-gray-900 mb-6 flex items-center gap-2">
        <Icon name="Target" className="h-6 w-6 text-blue-600" />
        Recommended Next Steps
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topSteps.map((step, index) => {
          const colors = getUrgencyColor(step.urgency);
          return (
            <AnimatedCard 
              key={step.title}
              className={`bg-gradient-to-r ${colors.bg} rounded-xl p-6 text-white shadow-lg`}
              delay={index * 50}
            >
              <div className="flex items-start justify-between mb-4">
                <Icon name={step.icon as any} className="h-8 w-8 text-white" />
                <span className={`${colors.badge} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
                  {colors.text}
                </span>
              </div>
              <h3 className="font-bold text-xl mb-2">{step.title}</h3>
              <p className="text-white/90 text-sm mb-4 leading-relaxed">{step.description}</p>
              <div className="flex items-center justify-between">
                <Link
                  href={step.link}
                  className="bg-white text-gray-900 px-6 py-3 rounded-lg font-bold hover:shadow-xl transition-all inline-flex items-center gap-2"
                >
                  {step.cta}
                  <Icon name="ArrowRight" className="h-4 w-4" />
                </Link>
                <span className="text-white/80 text-xs">{step.reason}</span>
              </div>
            </AnimatedCard>
          );
        })}
      </div>
    </div>
  );
}


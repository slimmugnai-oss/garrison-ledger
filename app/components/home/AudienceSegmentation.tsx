'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SignUpButton } from '@clerk/nextjs';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

type AudienceType = 'enlisted' | 'officer' | 'spouse' | 'veteran' | null;

export default function AudienceSegmentation() {
  const [selectedAudience, setSelectedAudience] = useState<AudienceType>(null);

  const audiences = [
    {
      id: 'enlisted' as const,
      icon: 'Shield',
      title: 'Active Duty Enlisted',
      subtitle: 'E-1 to E-9',
      color: 'blue',
      popularTools: ['TSP Modeler', 'PCS Planner', 'SDP Strategist'],
      avgSavings: '$2,800/year',
      description: 'Maximize your TSP, plan profitable PCS moves, and optimize deployment savings'
    },
    {
      id: 'officer' as const,
      icon: 'Star',
      title: 'Officers',
      subtitle: 'O-1 to O-10',
      color: 'indigo',
      popularTools: ['House Hacking', 'TSP Modeler', 'Career Analyzer'],
      avgSavings: '$4,200/year',
      description: 'Build wealth through real estate, optimize retirement, and analyze career opportunities'
    },
    {
      id: 'spouse' as const,
      icon: 'Heart',
      title: 'Military Spouses',
      subtitle: 'All Branches',
      color: 'pink',
      popularTools: ['Benefits Navigator', 'PCS Planner', 'Career Tools'],
      avgSavings: '$1,900/year',
      description: 'Navigate benefits, manage finances during deployment, plan portable career'
    },
    {
      id: 'veteran' as const,
      icon: 'Award',
      title: 'Veterans',
      subtitle: 'Separated/Retired',
      color: 'purple',
      popularTools: ['VA Benefits', 'Career Analyzer', 'Insurance Guide'],
      avgSavings: '$3,100/year',
      description: 'Maximize VA benefits, transition to civilian career, optimize post-service finances'
    }
  ];

  const getColorClasses = (color: string, selected: boolean) => {
    const colors: Record<string, { border: string; bg: string; text: string; hover: string }> = {
      blue: {
        border: selected ? 'border-blue-600' : 'border-blue-200',
        bg: selected ? 'bg-blue-50' : 'bg-white',
        text: 'text-blue-600',
        hover: 'hover:border-blue-400'
      },
      indigo: {
        border: selected ? 'border-indigo-600' : 'border-indigo-200',
        bg: selected ? 'bg-indigo-50' : 'bg-white',
        text: 'text-indigo-600',
        hover: 'hover:border-indigo-400'
      },
      pink: {
        border: selected ? 'border-pink-600' : 'border-pink-200',
        bg: selected ? 'bg-pink-50' : 'bg-white',
        text: 'text-pink-600',
        hover: 'hover:border-pink-400'
      },
      purple: {
        border: selected ? 'border-purple-600' : 'border-purple-200',
        bg: selected ? 'bg-purple-50' : 'bg-white',
        text: 'text-purple-600',
        hover: 'hover:border-purple-400'
      }
    };
    return colors[color];
  };

  const selectedData = audiences.find(a => a.id === selectedAudience);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-black text-gray-900 mb-4">
            Which Best Describes You?
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Choose your path to see personalized recommendations and success stories
          </p>
        </div>

        {/* Audience Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {audiences.map((audience, index) => {
            const colors = getColorClasses(audience.color, selectedAudience === audience.id);
            return (
              <AnimatedCard key={audience.id} delay={index * 50}>
                <button
                  onClick={() => setSelectedAudience(audience.id)}
                  className={`w-full text-center p-6 rounded-xl border-2 ${colors.border} ${colors.bg} ${colors.hover} transition-all hover:shadow-lg ${
                    selectedAudience === audience.id ? 'ring-4 ring-offset-2 ring-' + audience.color + '-200' : ''
                  }`}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon name={audience.icon} className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-1 text-gray-900">{audience.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{audience.subtitle}</p>
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <div className={`text-xs font-semibold ${colors.text} mb-1`}>Avg Savings</div>
                    <div className="text-2xl font-black text-green-600">{audience.avgSavings}</div>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div className="font-semibold mb-1">Most Popular:</div>
                    <div>{audience.popularTools[0]}</div>
                  </div>
                </button>
              </AnimatedCard>
            );
          })}
        </div>

        {/* Dynamic Content for Selected Audience */}
        {selectedData && (
          <AnimatedCard delay={0}>
            <div className={`rounded-2xl p-8 border-2 ${getColorClasses(selectedData.color, true).border} ${getColorClasses(selectedData.color, true).bg}`}>
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name={selectedData.icon} className="h-12 w-12 text-gray-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  Recommended for {selectedData.title}
                </h3>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  {selectedData.description}
                </p>
              </div>

              {/* Recommended Tools */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {selectedData.popularTools.map((tool) => (
                  <div key={tool} className="bg-white rounded-lg p-4 text-center border border-gray-200">
                    <Icon name="CheckCircle" className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="font-semibold text-gray-900">{tool}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center">
                <SignUpButton mode="modal">
                  <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all inline-flex items-center gap-2">
                    Get Started Free →
                    <Icon name="ArrowRight" className="h-5 w-5" />
                  </button>
                </SignUpButton>
                <p className="text-sm text-gray-600 mt-3">
                  Join {selectedData.id === 'spouse' ? '150+' : selectedData.id === 'officer' ? '180+' : '200+'} {selectedData.title.toLowerCase()} already using Garrison Ledger
                </p>
              </div>
            </div>
          </AnimatedCard>
        )}
      </div>
    </section>
  );
}


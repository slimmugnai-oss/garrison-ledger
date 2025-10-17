'use client';

import Icon from '../ui/Icon';

export default function TrustBadges() {
  const badges = [
    {
      icon: 'Heart',
      text: 'Military Spouse Founded',
      color: 'text-pink-600'
    },
    {
      icon: 'Lock',
      text: 'Bank-Level Security',
      color: 'text-blue-600'
    },
    {
      icon: 'Star',
      text: '4.8/5 Rating (500+ Reviews)',
      color: 'text-yellow-600'
    },
    {
      icon: 'Users',
      text: 'All Branches Welcome',
      color: 'text-purple-600'
    },
    {
      icon: 'DollarSign',
      text: 'Free Forever Plan',
      color: 'text-green-600'
    }
  ];

  return (
    <div className="py-8 bg-white border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2">
              <Icon name={badge.icon as any} className={`h-5 w-5 ${badge.color}`} />
              <span className="font-semibold text-gray-700 text-sm md:text-base whitespace-nowrap">
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


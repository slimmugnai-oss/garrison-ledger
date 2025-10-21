'use client';

import Icon from '../ui/Icon';

export default function TrustBadges() {
  const badges = [
    {
      icon: 'Heart',
      text: 'Military Spouse Founded',
      color: 'text-navy-professional'
    },
    {
      icon: 'Lock',
      text: 'Bank-Level Security',
      color: 'text-navy-professional'
    },
    {
      icon: 'Star',
      text: '4.8/5 Rating (500+ Reviews)',
      color: 'text-warning'
    },
    {
      icon: 'Users',
      text: 'All Branches Welcome',
      color: 'text-navy-professional'
    },
    {
      icon: 'DollarSign',
      text: 'Free Forever Plan',
      color: 'text-success'
    }
  ];

  return (
    <div className="py-8 bg-surface border-y border-default">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Icon name={badge.icon as any} className={`h-5 w-5 ${badge.color}`} />
              <span className="font-semibold text-body text-sm md:text-base whitespace-nowrap">
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';

import Icon from '../ui/Icon';

export default function SocialProofTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const activities = [
    { text: 'E-5, Army just saved $3,200 on PCS move', time: '2 min ago' },
    { text: 'O-3, Navy optimized TSP for $92K more at retirement', time: '5 min ago' },
    { text: 'Military Spouse generated personalized financial plan', time: '8 min ago' },
    { text: 'E-7, Air Force calculated $650/month house hacking profit', time: '12 min ago' },
    { text: 'E-2, Marines maximized SDP for $1,200 guaranteed return', time: '15 min ago' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [activities.length]);

  return (
    <div className="bg-navy-authority py-3 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 text-white">
          <div className="flex items-center gap-2 text-sm font-semibold opacity-80">
            <span className="inline-block w-2 h-2 bg-success rounded-full animate-pulse"></span>
            <span className="hidden md:inline">LIVE ACTIVITY:</span>
          </div>
          <div className="animate-fade-in">
            <span className="text-sm md:text-base font-medium flex items-center gap-2">
              <Icon name="User" className="h-4 w-4" />
              {activities[currentIndex].text}
            </span>
            <span className="text-xs ml-2 opacity-70">{activities[currentIndex].time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
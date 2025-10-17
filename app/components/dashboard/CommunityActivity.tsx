'use client';

import { useState, useEffect } from 'react';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

interface CommunityEvent {
  id: string;
  userType: string;
  action: string;
  value?: string;
  timestamp: string;
}

export default function CommunityActivity() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);

  useEffect(() => {
    // Simulated community activity - replace with real API
    const simulatedEvents: CommunityEvent[] = [
      {
        id: '1',
        userType: 'E-5, Air Force',
        action: 'saved $4,200 with PCS Planner',
        timestamp: '2 hours ago'
      },
      {
        id: '2',
        userType: 'O-3, Navy',
        action: 'optimized TSP for $92K more at retirement',
        timestamp: '5 hours ago'
      },
      {
        id: '3',
        userType: 'Military Spouse',
        action: 'generated personalized financial plan',
        timestamp: '1 day ago'
      },
      {
        id: '4',
        userType: 'E-7, Army',
        action: 'maximized SDP deployment savings',
        value: '$6,800',
        timestamp: '2 days ago'
      }
    ];

    setEvents(simulatedEvents);
  }, []);

  return (
    <AnimatedCard className="bg-card border border-border rounded-xl p-6" delay={400}>
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Icon name="Users" className="h-5 w-5 text-blue-600" />
        Community Activity
      </h3>
      
      <div className="space-y-3 mb-4">
        {events.map((event) => (
          <div key={event.id} className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm">👤</span>
            </div>
            <div className="flex-1">
              <span className="font-medium text-gray-900">{event.userType}</span>
              {' '}
              <span className="text-gray-700">{event.action}</span>
              {event.value && (
                <span className="font-semibold text-green-600"> ({event.value})</span>
              )}
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">{event.timestamp}</span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-100 text-center">
        <div className="text-sm text-gray-600">
          Join <span className="font-bold text-blue-600">2,847</span> military families using Garrison Ledger
        </div>
      </div>
    </AnimatedCard>
  );
}


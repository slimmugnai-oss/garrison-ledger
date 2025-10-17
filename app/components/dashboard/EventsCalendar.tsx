'use client';

import Link from 'next/link';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

interface MilitaryEvent {
  id: string;
  title: string;
  date: Date;
  type: 'pcs' | 'deployment' | 'benefit' | 'career';
  daysAway: number;
  link: string;
  icon: string;
  color: string;
}

interface EventsCalendarProps {
  profileData: {
    pcsDate?: string;
    deploymentStatus?: string;
    deploymentDate?: string;
  };
}

export default function EventsCalendar({ profileData }: EventsCalendarProps) {
  const events: MilitaryEvent[] = [];
  const today = new Date();

  // Add PCS Event
  if (profileData.pcsDate) {
    const pcsDate = new Date(profileData.pcsDate);
    const daysAway = Math.ceil((pcsDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysAway > -30) { // Show if within 30 days past or any future
      events.push({
        id: 'pcs',
        title: 'PCS Move',
        date: pcsDate,
        type: 'pcs',
        daysAway,
        link: '/dashboard/tools/pcs-planner',
        icon: 'Truck',
        color: daysAway <= 30 ? 'red' : daysAway <= 90 ? 'orange' : 'blue'
      });
    }
  }

  // Add Deployment Event
  if (profileData.deploymentStatus === 'deploying-soon' && profileData.deploymentDate) {
    const deployDate = new Date(profileData.deploymentDate);
    const daysAway = Math.ceil((deployDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    events.push({
      id: 'deployment',
      title: 'Deployment',
      date: deployDate,
      type: 'deployment',
      daysAway,
      link: '/deployment',
      icon: 'Shield',
      color: daysAway <= 30 ? 'red' : 'orange'
    });
  }

  // Add Military-Wide Events (static for now)
  const militaryEvents = [
    {
      id: 'tricare-open',
      title: 'TRICARE Open Season',
      date: new Date('2025-11-11'),
      type: 'benefit' as const,
      link: 'https://tricare.mil',
      icon: 'Heart',
      color: 'purple'
    },
    {
      id: 'tsp-deadline',
      title: 'TSP Contribution Deadline',
      date: new Date('2025-12-31'),
      type: 'benefit' as const,
      link: '/dashboard/tools/tsp-modeler',
      icon: 'DollarSign',
      color: 'green'
    }
  ];

  militaryEvents.forEach(event => {
    const daysAway = Math.ceil((event.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAway > 0 && daysAway <= 365) {
      events.push({
        ...event,
        daysAway
      });
    }
  });

  // Sort by days away
  events.sort((a, b) => a.daysAway - b.daysAway);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
    };
    return colors[color] || colors.blue;
  };

  if (events.length === 0) {
    return null; // Don't show if no events
  }

  return (
    <AnimatedCard className="bg-card border border-border rounded-xl p-6" delay={250}>
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Icon name="Calendar" className="h-5 w-5 text-blue-600" />
        Upcoming Events
      </h3>
      <div className="space-y-3">
        {events.slice(0, 4).map((event) => {
          const colors = getColorClasses(event.color);
          return (
            <div key={event.id} className={`flex items-center gap-3 p-3 ${colors.bg} ${colors.border} border rounded-lg`}>
              <div className="text-center min-w-[60px]">
                <div className={`text-2xl font-black ${colors.text}`}>
                  {event.daysAway}
                </div>
                <div className={`text-xs ${colors.text}`}>
                  {event.daysAway === 1 ? 'day' : 'days'}
                </div>
              </div>
              <div className="flex-1">
                <div className={`font-semibold ${colors.text}`}>{event.title}</div>
                <div className="text-sm text-gray-600">
                  {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <Link href={event.link} className={`${colors.text} hover:opacity-70`}>
                <Icon name="ArrowRight" className="h-5 w-5" />
              </Link>
            </div>
          );
        })}
      </div>
    </AnimatedCard>
  );
}


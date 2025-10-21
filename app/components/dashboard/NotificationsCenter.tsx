'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

interface Notification {
  id: string;
  type: 'urgent' | 'important' | 'info';
  title: string;
  message: string;
  link: string;
  linkText: string;
  icon: string;
}

interface NotificationsCenterProps {
  profileData: {
    pcsDate?: string;
    deploymentStatus?: string;
  };
}

export default function NotificationsCenter({ profileData }: NotificationsCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const generated: Notification[] = [];

    // Check for urgent PCS notification
    if (profileData.pcsDate) {
      const pcsDate = new Date(profileData.pcsDate);
      const daysAway = Math.ceil((pcsDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysAway > 0 && daysAway <= 60) {
        generated.push({
          id: 'pcs-urgent',
          type: daysAway <= 30 ? 'urgent' : 'important',
          title: `PCS in ${daysAway} days`,
          message: 'Complete your PCS financial checklist and create moving budget',
          link: '/dashboard/tools/pcs-planner',
          linkText: 'Start PCS Planning',
          icon: 'AlertTriangle'
        });
      }
    }

    // Check for deployment notification
    if (profileData.deploymentStatus === 'deploying-soon') {
      generated.push({
        id: 'deployment-prep',
        type: 'urgent',
        title: 'Deployment Financial Prep',
        message: 'Maximize SDP, update beneficiaries, and secure POA',
        link: '/deployment',
        linkText: 'View Checklist',
        icon: 'Shield'
      });
    }

    // Add general financial actions
    generated.push({
      id: 'tsp-review',
      type: 'info',
      title: 'Quarterly TSP Review',
      message: 'Review your TSP allocation and contribution rate',
      link: '/dashboard/tools/tsp-modeler',
      linkText: 'Review TSP',
      icon: 'TrendingUp'
    });

    setNotifications(generated);
  }, [profileData]);

  if (notifications.length === 0) return null;

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'urgent':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          text: 'text-red-900',
          subtext: 'text-red-700',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'important':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: 'text-amber-600',
          text: 'text-amber-900',
          subtext: 'text-amber-700',
          button: 'bg-amber-600 hover:bg-amber-700 text-white'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          text: 'text-blue-900',
          subtext: 'text-blue-700',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  return (
    <AnimatedCard className="bg-card border border-border rounded-xl p-6 mb-12" delay={150}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Icon name="AlertTriangle" className="h-5 w-5 text-blue-600" />
          Action Items ({notifications.length})
        </h3>
      </div>
      
      <div className="space-y-3">
        {notifications.map((notif) => {
          const styles = getNotificationStyles(notif.type);
          return (
            <div key={notif.id} className={`flex items-start gap-3 p-4 ${styles.bg} ${styles.border} border rounded-lg`}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Icon name={notif.icon as any} className={`h-5 w-5 ${styles.icon} flex-shrink-0 mt-0.5`} />
              <div className="flex-1">
                <div className={`font-semibold ${styles.text} mb-1`}>{notif.title}</div>
                <div className={`text-sm ${styles.subtext} mb-3`}>{notif.message}</div>
                <Link
                  href={notif.link}
                  className={`inline-flex items-center gap-2 ${styles.button} px-4 py-2 rounded-lg text-sm font-semibold transition-all`}
                >
                  {notif.linkText}
                  <Icon name="ArrowRight" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </AnimatedCard>
  );
}


'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

interface Activity {
  id: string;
  type: 'bookmark' | 'scenario' | 'plan' | 'assessment' | 'upload';
  title: string;
  timestamp: string;
  link?: string;
}

interface ActivityFeedProps {
  userId: string;
}

export default function ActivityFeed({ userId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Fetch recent activities from different sources
      const [bookmarks, scenarios] = await Promise.all([
        fetch('/api/bookmarks').then(r => r.json()),
        fetch('/api/calculator/scenarios').then(r => r.json())
      ]);

      const recentActivities: Activity[] = [];

      // Add bookmark activities
      if (bookmarks.bookmarks) {
        bookmarks.bookmarks.slice(0, 3).forEach((b: { id: string; content_block?: { title?: string }; created_at: string; content_id: string }) => {
          recentActivities.push({
            id: b.id,
            type: 'bookmark',
            title: b.content_block?.title || 'Content',
            timestamp: b.created_at,
            link: `/dashboard/library?contentId=${b.content_id}`
          });
        });
      }

      // Add scenario activities
      if (scenarios.scenarios) {
        scenarios.scenarios.slice(0, 3).forEach((s: { id: string; scenario_name: string; created_at: string; calculator_type: string }) => {
          recentActivities.push({
            id: s.id,
            type: 'scenario',
            title: s.scenario_name,
            timestamp: s.created_at,
            link: `/dashboard/tools/${s.calculator_type}?scenarioId=${s.id}`
          });
        });
      }

      // Sort by timestamp
      recentActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(recentActivities.slice(0, 5));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bookmark': return { icon: 'BookOpen', color: 'bg-blue-100 text-blue-600' };
      case 'scenario': return { icon: 'Calculator', color: 'bg-green-100 text-green-600' };
      case 'plan': return { icon: 'Sparkles', color: 'bg-purple-100 text-purple-600' };
      case 'assessment': return { icon: 'ClipboardCheck', color: 'bg-indigo-100 text-indigo-600' };
      case 'upload': return { icon: 'Upload', color: 'bg-orange-100 text-orange-600' };
      default: return { icon: 'Activity', color: 'bg-gray-100 text-gray-600' };
    }
  };

  const getActivityVerb = (type: string) => {
    switch (type) {
      case 'bookmark': return 'Bookmarked';
      case 'scenario': return 'Saved';
      case 'plan': return 'Generated';
      case 'assessment': return 'Completed';
      case 'upload': return 'Uploaded';
      default: return 'Updated';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <AnimatedCard className="bg-card border border-border rounded-xl p-6" delay={300}>
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </AnimatedCard>
    );
  }

  if (activities.length === 0) {
    return (
      <AnimatedCard className="bg-card border border-border rounded-xl p-6" delay={300}>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Icon name="Activity" className="h-5 w-5 text-gray-600" />
          Recent Activity
        </h3>
        <div className="text-center py-6 text-gray-500">
          <Icon name="Activity" className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No recent activity yet</p>
          <p className="text-sm mt-1">Start using calculators and saving content to see your activity here</p>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="bg-card border border-border rounded-xl p-6" delay={300}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Icon name="Activity" className="h-5 w-5 text-blue-600" />
          Recent Activity
        </h3>
        <span className="text-sm text-gray-500">{activities.length} recent actions</span>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity) => {
          const iconConfig = getActivityIcon(activity.type);
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className={`w-10 h-10 ${iconConfig.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                <Icon name={iconConfig.icon as any} className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900">
                  {getActivityVerb(activity.type)} "{activity.title}"
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{getTimeAgo(activity.timestamp)}</div>
              </div>
              {activity.link && (
                <Link href={activity.link} className="text-blue-600 hover:text-blue-700 flex-shrink-0">
                  <Icon name="ArrowRight" className="h-5 w-5" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {activities.length >= 5 && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <Link href="/dashboard/activity" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
            View All Activity →
          </Link>
        </div>
      )}
    </AnimatedCard>
  );
}


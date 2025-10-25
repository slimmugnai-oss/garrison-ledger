'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

interface LibraryStats {
  viewedCount: number;
  bookmarkedCount: number;
  streakDays: number;
  recommendedContent?: {
    id: string;
    title: string;
    matchScore: number;
    readTime: number;
  };
}

interface IntelLibrarySyncProps {
  userId: string;
}

export default function IntelLibrarySync({ userId }: IntelLibrarySyncProps) {
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/content/analytics?timeRange=30').then(r => r.json()),
      fetch('/api/bookmarks').then(r => r.json()),
      fetch('/api/content/personalized?limit=1').then(r => r.json())
    ]).then(([analytics, bookmarks, personalized]) => {
      setStats({
        viewedCount: analytics.overview?.uniqueContentViewed || 0,
        bookmarkedCount: bookmarks.bookmarks?.length || 0,
        streakDays: analytics.engagement?.currentStreak || 0,
        recommendedContent: personalized.blocks?.[0] ? {
          id: personalized.blocks[0].id,
          title: personalized.blocks[0].title,
          matchScore: personalized.blocks[0].relevance_score * 100,
          readTime: personalized.blocks[0].est_read_min
        } : undefined
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userId]);

  if (loading) return null;
  if (!stats) return null;

  return (
    <AnimatedCard className="bg-card border border-border rounded-xl p-6" delay={250}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Icon name="BookOpen" className="h-5 w-5 text-purple-600" />
          Intel Library Activity
        </h3>
        <Link href="/dashboard/library" className="text-blue-600 text-sm font-semibold hover:text-blue-700">
          Browse Library →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-3xl font-black text-blue-600">{stats.viewedCount}</div>
          <div className="text-xs text-gray-600">Viewed</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-3xl font-black text-purple-600">{stats.bookmarkedCount}</div>
          <div className="text-xs text-gray-600">Saved</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-3xl font-black text-green-600">{stats.streakDays}</div>
          <div className="text-xs text-gray-600">Day Streak</div>
        </div>
      </div>

      {stats.recommendedContent && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="Sparkles" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-2">
                📖 Recommended Next Read
                <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">
                  {stats.recommendedContent.matchScore.toFixed(0)}% match
                </span>
              </div>
              <Link 
                href={`/dashboard/library?contentId=${stats.recommendedContent.id}`}
                className="font-semibold text-blue-900 hover:text-blue-700 block mb-1"
              >
                {stats.recommendedContent.title}
              </Link>
              <div className="text-xs text-blue-600">{stats.recommendedContent.readTime} min read</div>
            </div>
          </div>
        </div>
      )}
    </AnimatedCard>
  );
}


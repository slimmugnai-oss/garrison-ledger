'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

interface Achievement {
  id: string;
  emoji: string;
  title: string;
  description: string;
  earned: boolean;
  progress?: number;
  total?: number;
}

interface AchievementBadgesProps {
  userId: string;
  hasProfile: boolean;
}

export default function AchievementBadges({ userId, hasProfile }: AchievementBadgesProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedCount, setEarnedCount] = useState(0);

  useEffect(() => {
    // Fetch user stats for achievement calculations
    Promise.all([
      fetch('/api/bookmarks').then(r => r.json()),
      fetch('/api/calculator/scenarios').then(r => r.json()),
      fetch('/api/content/analytics?timeRange=30').then(r => r.json())
    ]).then(([bookmarks, scenarios, analytics]) => {
      const bookmarkCount = bookmarks.bookmarks?.length || 0;
      const scenarioCount = scenarios.scenarios?.length || 0;
      const streakDays = analytics.engagement?.currentStreak || 0;

      const achievementList: Achievement[] = [
        {
          id: 'profile-complete',
          emoji: '🎖️',
          title: 'Profile Complete',
          description: 'Set up your military profile',
          earned: hasProfile
        },
        {
          id: 'first-save',
          emoji: '📚',
          title: 'First Save',
          description: 'Bookmarked your first article',
          earned: bookmarkCount > 0
        },
        {
          id: 'content-collector',
          emoji: '📖',
          title: 'Content Collector',
          description: 'Saved 10+ articles',
          earned: bookmarkCount >= 10,
          progress: Math.min(bookmarkCount, 10),
          total: 10
        },
        {
          id: 'calculator-user',
          emoji: '🧮',
          title: 'Calculator User',
          description: 'Ran your first calculation',
          earned: scenarioCount > 0
        },
        {
          id: 'scenario-saver',
          emoji: '💾',
          title: 'Scenario Saver',
          description: 'Saved 5+ scenarios',
          earned: scenarioCount >= 5,
          progress: Math.min(scenarioCount, 5),
          total: 5
        },
        {
          id: 'week-streak',
          emoji: '🔥',
          title: '7-Day Streak',
          description: 'Used platform 7 days in a row',
          earned: streakDays >= 7,
          progress: Math.min(streakDays, 7),
          total: 7
        },
        {
          id: 'month-streak',
          emoji: '⚡',
          title: '30-Day Streak',
          description: 'Used platform 30 days in a row',
          earned: streakDays >= 30,
          progress: Math.min(streakDays, 30),
          total: 30
        }
      ];

      setAchievements(achievementList);
      setEarnedCount(achievementList.filter(a => a.earned).length);
    });
  }, [userId, hasProfile]);

  const nextAchievement = achievements.find(a => !a.earned);

  return (
    <AnimatedCard className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6" delay={350}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Icon name="Star" className="h-5 w-5 text-yellow-600" />
          Achievements
        </h3>
        <div className="text-sm font-semibold text-gray-700">
          {earnedCount} / {achievements.length}
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
        {achievements.slice(0, 6).map((achievement) => (
          <div 
            key={achievement.id}
            className={`text-center p-3 rounded-lg transition-all ${
              achievement.earned 
                ? 'bg-white border-2 border-yellow-300 shadow-md' 
                : 'bg-gray-50 opacity-50 border border-gray-200'
            }`}
          >
            <div className="text-3xl mb-1">{achievement.emoji}</div>
            <div className="text-xs font-semibold text-gray-700 line-clamp-2">{achievement.title}</div>
            {!achievement.earned && achievement.progress !== undefined && achievement.total && (
              <div className="text-xs text-gray-500 mt-1">
                {achievement.progress}/{achievement.total}
              </div>
            )}
          </div>
        ))}
      </div>

      {nextAchievement && (
        <div className="bg-white border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">{nextAchievement.emoji}</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">Next: {nextAchievement.title}</div>
              <div className="text-sm text-gray-600 mb-2">{nextAchievement.description}</div>
              {nextAchievement.progress !== undefined && nextAchievement.total && (
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{nextAchievement.progress}/{nextAchievement.total}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${(nextAchievement.progress / nextAchievement.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <Link href="/dashboard/achievements" className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm">
          View All Achievements →
        </Link>
      </div>
    </AnimatedCard>
  );
}


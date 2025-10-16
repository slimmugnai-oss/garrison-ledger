'use client';

import { useEffect, useState } from 'react';
import AnimatedCard from '../ui/AnimatedCard';

interface StreakTrackerProps {
  userId: string;
}

export default function StreakTracker({ userId }: StreakTrackerProps) {
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user's current streak
    fetch(`/api/gamification/streak?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setStreak(data.streak || 0);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [userId]);

  if (isLoading || streak === 0) return null;

  return (
    <AnimatedCard delay={100} className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border-2 border-white/30">
            <span className="text-3xl">🔥</span>
          </div>
          <div>
            <div className="text-3xl font-black">{streak} Day Streak!</div>
            <p className="text-sm text-orange-100">Keep your planning momentum going</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-orange-200 mb-1">Next milestone</div>
          <div className="text-2xl font-bold">{Math.ceil(streak / 7) * 7}</div>
          <div className="text-xs text-orange-200">days</div>
        </div>
      </div>
      
      {/* Streak Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-orange-100 mb-2">
          <span>This week</span>
          <span>{Math.min(streak % 7, 7)}/7 days</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${Math.min((streak % 7) / 7 * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Achievement Badges */}
      {streak >= 7 && (
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {streak >= 7 && (
            <div className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
              <span>🎯</span> Week Warrior
            </div>
          )}
          {streak >= 30 && (
            <div className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
              <span>⭐</span> Month Master
            </div>
          )}
          {streak >= 90 && (
            <div className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
              <span>👑</span> Quarter Champion
            </div>
          )}
        </div>
      )}
    </AnimatedCard>
  );
}


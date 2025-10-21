'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

interface MissionStatus {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
  link: string;
  icon: string;
  description: string;
}

interface MissionStatusTrackerProps {
  userId: string;
  hasProfile: boolean;
  hasAssessment: boolean;
  hasPlan: boolean;
  hasCalculation?: boolean;
  hasBookmark?: boolean;
}

export default function MissionStatusTracker({
  userId,
  hasProfile,
  hasAssessment,
  hasPlan,
  hasCalculation: _hasCalculation = false,
  hasBookmark: _hasBookmark = false
}: MissionStatusTrackerProps) {
  const [missions, setMissions] = useState<MissionStatus[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    // Check calculator usage
    fetch('/api/calculator/scenarios')
      .then(res => res.json())
      .then(data => {
        const hasCalc = (data.scenarios?.length || 0) > 0;
        
        // Check bookmarks
        fetch('/api/bookmarks')
          .then(res => res.json())
          .then(bookmarkData => {
            const hasBook = (bookmarkData.bookmarks?.length || 0) > 0;
            
            const missionList: MissionStatus[] = [
              {
                id: 'profile',
                title: 'Complete Profile',
                completed: hasProfile,
                progress: hasProfile ? 100 : 0,
                link: '/dashboard/profile/setup',
                icon: 'User',
                description: 'Set up your military profile'
              },
              {
                id: 'tools',
                title: 'Use Calculators',
                completed: true,
                progress: 100,
                link: '/dashboard/tools',
                icon: 'Calculator',
                description: 'Financial planning tools'
              },
              {
                id: 'intel',
                title: 'Browse Intel',
                completed: true,
                progress: 100,
                link: '/dashboard/intel',
                icon: 'BookOpen',
                description: 'Live financial data'
              },
              {
                id: 'calculator',
                title: 'Use a Calculator',
                completed: hasCalc,
                progress: hasCalc ? 100 : 0,
                link: '/dashboard/tools',
                icon: 'Calculator',
                description: 'Run your first calculation'
              },
              {
                id: 'bookmark',
                title: 'Save Content',
                completed: hasBook,
                progress: hasBook ? 100 : 0,
                link: '/dashboard/library',
                icon: 'BookOpen',
                description: 'Bookmark valuable articles'
              }
            ];
            
            setMissions(missionList);
            
            // Calculate overall progress
            const completed = missionList.filter(m => m.completed).length;
            const total = missionList.length;
            setOverallProgress(Math.round((completed / total) * 100));
          });
      });
  }, [userId, hasProfile, hasAssessment, hasPlan]);

  const completedMissions = missions.filter(m => m.completed).length;
  const nextMission = missions.find(m => !m.completed);

  return (
    <AnimatedCard className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6" delay={100}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
            <Icon name="Target" className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-black text-gray-900">Mission Objectives</h2>
            <p className="text-sm text-gray-600">
              {completedMissions} of {missions.length} completed
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-green-600">{overallProgress}%</div>
          <div className="text-xs text-gray-600">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Mission List */}
      <div className="space-y-3 mb-6">
        {missions.map((mission) => (
          <div 
            key={mission.id}
            className={`flex items-center justify-between p-3 rounded-lg transition-all ${
              mission.completed 
                ? 'bg-white border border-green-200' 
                : 'bg-white border border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                mission.completed ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {mission.completed ? (
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                ) : (
                  <Icon name={mission.icon as any} className={`h-5 w-5 ${mission === nextMission ? 'text-blue-600' : 'text-gray-400'}`} />
                )}
              </div>
              <div className="flex-1">
                <div className={`font-semibold ${mission.completed ? 'text-green-700' : 'text-gray-900'}`}>
                  {mission.title}
                </div>
                <div className="text-xs text-gray-600">{mission.description}</div>
              </div>
            </div>
            {!mission.completed && (
              <Link
                href={mission.link}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  mission === nextMission
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {mission === nextMission ? 'Start' : 'Begin'}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Next Mission CTA */}
      {nextMission && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="Target" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-blue-900 mb-1">Next Mission: {nextMission.title}</div>
              <div className="text-sm text-blue-700 mb-3">{nextMission.description}</div>
              <Link
                href={nextMission.link}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                Complete Now
                <Icon name="ArrowRight" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* All Complete! */}
      {completedMissions === missions.length && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-4 text-white text-center">
          <div className="text-4xl mb-2">🎉</div>
          <div className="font-bold text-lg mb-1">All Missions Complete!</div>
          <div className="text-sm text-green-100">You're fully set up and ready to optimize your military finances</div>
        </div>
      )}
    </AnimatedCard>
  );
}


'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';
import Badge from '../ui/Badge';

interface SpouseData {
  isConnected: boolean;
  spouseName?: string;
  lastActive?: string;
  sharedScenarios: number;
  sharedContent: number;
  invitePending?: boolean;
}

interface SpouseCollaborationStatusProps {
  userId: string;
}

export default function SpouseCollaborationStatus({ userId }: SpouseCollaborationStatusProps) {
  const [spouseData, setSpouseData] = useState<SpouseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/spouse/status')
      .then(r => r.json())
      .then(data => {
        setSpouseData({
          isConnected: data.isConnected || false,
          spouseName: data.spouseName,
          lastActive: data.lastActive,
          sharedScenarios: data.sharedScenarios || 0,
          sharedContent: data.sharedContent || 0,
          invitePending: data.invitePending || false
        });
        setLoading(false);
      })
      .catch(() => {
        setSpouseData({
          isConnected: false,
          sharedScenarios: 0,
          sharedContent: 0
        });
        setLoading(false);
      });
  }, [userId]);

  if (loading) return null;
  if (!spouseData) return null;

  // Show invite CTA if not connected
  if (!spouseData.isConnected) {
    return (
      <AnimatedCard className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-6" delay={300}>
        <div className="text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Users" className="h-8 w-8 text-pink-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Collaborate with Your Spouse</h3>
          <p className="text-gray-700 mb-6">
            Plan finances together! Share scenarios, compare options, and make joint decisions.
          </p>
          <Link
            href="/dashboard/spouse"
            className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            <Icon name="UserPlus" className="h-4 w-4" />
            {spouseData.invitePending ? 'View Pending Invite' : 'Invite Your Spouse'}
          </Link>
        </div>
      </AnimatedCard>
    );
  }

  // Show connected status
  const getTimeAgo = (timestamp?: string) => {
    if (!timestamp) return 'Recently';
    const now = new Date();
    const past = new Date(timestamp);
    const diffHours = Math.floor((now.getTime() - past.getTime()) / 3600000);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <AnimatedCard className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl p-6" delay={300}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon name="Users" className="h-6 w-6 text-pink-600" />
          <h3 className="font-bold text-lg">Spouse Collaboration</h3>
        </div>
        <Badge variant="success">Connected</Badge>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{spouseData.spouseName || 'Your Spouse'}</div>
          <div className="text-sm text-gray-600">Last active: {getTimeAgo(spouseData.lastActive)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-pink-600">{spouseData.sharedScenarios}</div>
          <div className="text-xs text-gray-600">Shared Scenarios</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-pink-600">{spouseData.sharedContent}</div>
          <div className="text-xs text-gray-600">Shared Content</div>
        </div>
      </div>

      <Link 
        href="/dashboard/spouse" 
        className="block text-center text-pink-600 hover:text-pink-700 font-semibold text-sm"
      >
        Manage Collaboration →
      </Link>
    </AnimatedCard>
  );
}


'use client';

import { useEffect } from 'react';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';

interface TabConfig {
  id: string;
  label: string;
  icon: 'Shield' | 'TrendingUp' | 'Users' | 'BookOpen' | 'Database' | 'Map';
  shortcut: string;
  badge?: number;
}

interface AdminTabNavigationProps {
  activeTab: string;
  onChange: (tab: string) => void;
  badges?: {
    overview?: number;
    analytics?: number;
    users?: number;
    content?: number;
    system?: number;
    sitemap?: number;
  };
}

const tabs: TabConfig[] = [
  { id: 'overview', label: 'Command Center', icon: 'Shield', shortcut: '1' },
  { id: 'analytics', label: 'Intel', icon: 'TrendingUp', shortcut: '2' },
  { id: 'users', label: 'Personnel', icon: 'Users', shortcut: '3' },
  { id: 'content', label: 'Assets', icon: 'BookOpen', shortcut: '4' },
  { id: 'system', label: 'Ops Status', icon: 'Database', shortcut: '5' },
  { id: 'sitemap', label: 'Sitemap', icon: 'Map', shortcut: '6' },
];

export default function AdminTabNavigation({ activeTab, onChange, badges = {} }: AdminTabNavigationProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const num = parseInt(e.key);
      if (num >= 1 && num <= 6) {
        const tab = tabs[num - 1];
        if (tab) {
          onChange(tab.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onChange]);

  return (
    <div className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto" aria-label="Admin Navigation">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const badgeCount = badges[tab.id as keyof typeof badges];

            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
                  group relative flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap
                  border-b-2 transition-all duration-200
                  ${isActive 
                    ? 'border-primary text-primary bg-primary/5' 
                    : 'border-transparent text-text-muted hover:text-text-body hover:border-border'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon name={tab.icon} className="h-5 w-5" />
                <span>{tab.label}</span>
                
                {badgeCount !== undefined && badgeCount > 0 && (
                  <Badge variant="warning" size="sm">
                    {badgeCount}
                  </Badge>
                )}

                {/* Keyboard shortcut hint */}
                <span className="ml-2 hidden md:inline-flex items-center justify-center w-5 h-5 text-xs bg-surface-hover border border-border rounded text-text-muted group-hover:bg-surface group-hover:border-border-hover">
                  {tab.shortcut}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '../ui/Icon';

interface QuickActionsProps {
  isPremium?: boolean;
}

export default function QuickActions({ isPremium = false }: QuickActionsProps) {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/library?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const quickActions = [
    {
      icon: 'Calculator',
      label: 'New Calculation',
      action: () => router.push('/dashboard/tools'),
      color: 'bg-slate-500/20 hover:bg-slate-500/30 text-slate-100'
    },
    {
      icon: 'Search',
      label: 'Search Intel',
      action: () => setShowSearch(true),
      color: 'bg-slate-500/20 hover:bg-slate-500/30 text-slate-100'
    },
    ...(isPremium ? [{
      icon: 'Truck' as const,
      label: 'PCS Copilot',
      action: () => router.push('/dashboard/pcs-copilot'),
      color: 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-100'
    }] : []),
    {
      icon: 'Upload',
      label: 'Upload Doc',
      action: () => router.push('/dashboard/binder'),
      color: 'bg-green-500/20 hover:bg-green-500/30 text-green-100'
    }
  ];

  return (
    <>
      <div className="mb-8 bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Zap" className="h-5 w-5 text-white" />
            <span className="text-white font-semibold">Quick Actions</span>
          </div>
          <div className="flex items-center gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={action.action}
                className={`${action.color} px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 flex items-center gap-2`}
              >
                <Icon name={action.icon} className="h-4 w-4" />
                <span className="hidden md:inline">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
          onClick={() => setShowSearch(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Icon name="Search" className="w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search 410+ expert content blocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-lg border-none outline-none bg-transparent placeholder-gray-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <Icon name="X" className="w-5 h-5" />
                </button>
              </div>
              <div className="text-sm text-gray-500">
                Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Enter</kbd> to search
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


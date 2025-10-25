'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import Icon from '@/app/components/ui/Icon';

interface Recommendation {
  id?: string;
  type: string;
  title: string;
  description: string;
  priority: number;
  calculator_related: string;
  action_url: string;
  is_dismissed?: boolean;
}

interface Insights {
  total_calculations: number;
  calculators_count: number;
  most_used_calculator: string;
  days_active: number;
  avg_session_duration: number;
}

export default function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/ai/recommendations');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      setRecommendations(data.recommendations || []);
      setInsights(data.insights);
    } catch {
      // Silent failure - recommendations are optional dashboard feature
      // Don't show error to user, just hide the widget
      if (process.env.NODE_ENV === 'development') {
        // Failed to fetch - non-critical widget
      }
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const dismissRecommendation = async (recId: string) => {
    // Optimistically update UI
    setRecommendations(prev => prev.filter(r => r.id !== recId));
    
    // Update in database
    try {
      const response = await fetch(`/api/ai/recommendations/${recId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_dismissed: true })
      });
      
      if (!response.ok) {
        throw new Error('Failed to dismiss recommendation');
      }
    } catch {
      // If database update fails, revert UI change
      if (process.env.NODE_ENV === 'development') {
        // Failed to dismiss - non-critical
      }
      // Refetch to sync with database state
      fetchRecommendations();
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <Icon name="Sparkles" className="h-6 w-6 text-purple-600 animate-pulse" />
          <p className="text-purple-900 font-semibold">Loading AI Recommendations...</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null; // Don't show empty state
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="Sparkles" className="h-6 w-6 text-purple-600" />
        <h3 className="text-xl font-bold text-purple-900">AI-Powered Recommendations</h3>
      </div>

      {insights && insights.total_calculations > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="text-xs text-purple-700">Total Calculations</p>
            <p className="text-2xl font-bold text-purple-900">{insights.total_calculations}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="text-xs text-purple-700">Tools Used</p>
            <p className="text-2xl font-bold text-purple-900">{insights.calculators_count}/6</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="text-xs text-purple-700">Favorite Tool</p>
            <p className="text-lg font-bold text-purple-900 capitalize">{insights.most_used_calculator || 'N/A'}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="text-xs text-purple-700">Days Active</p>
            <p className="text-2xl font-bold text-purple-900">{insights.days_active}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={rec.id || index}
            className="bg-white rounded-lg p-4 border border-purple-300 hover:border-purple-400 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    rec.type === 'calculator' ? 'bg-blue-100 text-blue-700' :
                    rec.type === 'action' ? 'bg-green-100 text-green-700' :
                    rec.type === 'resource' ? 'bg-amber-100 text-amber-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                  </span>
                  {rec.priority >= 80 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">
                      High Priority
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-purple-900 mb-1">{rec.title}</h4>
                <p className="text-sm text-purple-800">{rec.description}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href={rec.action_url}
                  className="btn-primary text-sm px-4 py-2 rounded-lg whitespace-nowrap"
                >
                  Take Action →
                </Link>
                {rec.id && (
                  <button
                    onClick={() => dismissRecommendation(rec.id!)}
                    className="text-xs text-purple-600 hover:text-purple-800"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-purple-700 mt-4">
        <Icon name="Info" className="h-3 w-3 inline mr-1" />
        Recommendations update as you use more calculators. Powered by AI analysis of your usage patterns.
      </p>
    </div>
  );
}


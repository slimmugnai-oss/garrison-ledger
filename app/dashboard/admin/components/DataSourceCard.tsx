'use client';

import { useState } from 'react';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';

export interface DataSourceStatus {
  name: string;
  category: string;
  table?: string;
  file?: string;
  rowCount: number;
  lastUpdate: string;
  effectiveDate: string;
  status: 'current' | 'stale' | 'critical';
  nextReview: string;
  source: string;
  updateFrequency: string;
}

interface DataSourceCardProps {
  source: DataSourceStatus;
  delay?: number;
  onTestConnection?: (table: string) => void;
  onRefresh?: (table: string) => void;
}

const statusConfig = {
  current: {
    bg: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    badge: 'success' as const,
    icon: 'CheckCircle' as const,
    iconColor: 'text-green-600',
    textColor: 'text-green-900',
  },
  stale: {
    bg: 'from-yellow-50 to-amber-50',
    border: 'border-yellow-200',
    badge: 'warning' as const,
    icon: 'AlertTriangle' as const,
    iconColor: 'text-yellow-600',
    textColor: 'text-yellow-900',
  },
  critical: {
    bg: 'from-red-50 to-rose-50',
    border: 'border-red-200',
    badge: 'danger' as const,
    icon: 'XCircle' as const,
    iconColor: 'text-red-600',
    textColor: 'text-red-900',
  }
};

export default function DataSourceCard({ source, delay = 0, onTestConnection, onRefresh }: DataSourceCardProps) {
  const [testing, setTesting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const config = statusConfig[source.status];

  const handleTestConnection = async () => {
    if (!source.table || !onTestConnection) return;

    setTesting(true);
    try {
      await onTestConnection(source.table);
    } finally {
      setTesting(false);
    }
  };

  const handleRefresh = async () => {
    if (!source.table || !onRefresh) return;

    setRefreshing(true);
    try {
      await onRefresh(source.table);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate freshness (days since last update)
  const daysSinceUpdate = source.lastUpdate !== 'N/A' && source.lastUpdate !== 'Varies by base'
    ? Math.floor((new Date().getTime() - new Date(source.lastUpdate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const freshnessColor = 
    daysSinceUpdate === null ? 'text-gray-600' :
    daysSinceUpdate < 90 ? 'text-green-600' :
    daysSinceUpdate < 180 ? 'text-amber-600' :
    'text-red-600';

  return (
    <AnimatedCard className={`bg-gradient-to-br ${config.bg} border-2 ${config.border} p-6`} delay={delay}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon name={config.icon} className={`h-6 w-6 ${config.iconColor}`} />
          <div>
            <h3 className={`font-bold ${config.textColor}`}>{source.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {source.table && (
                <code className="text-xs bg-white/60 px-2 py-0.5 rounded border border-gray-300 font-mono">
                  {source.table}
                </code>
              )}
              {source.file && (
                <code className="text-xs bg-white/60 px-2 py-0.5 rounded border border-gray-300 font-mono">
                  {source.file}
                </code>
              )}
            </div>
          </div>
        </div>
        <Badge variant={config.badge} size="sm">
          {source.status.toUpperCase()}
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-600 mb-1">Rows</div>
          <div className="text-lg font-black text-gray-900">{source.rowCount.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Last Update</div>
          <div className="text-sm font-semibold text-gray-900">{source.lastUpdate}</div>
          {daysSinceUpdate !== null && (
            <div className={`text-xs ${freshnessColor} font-semibold`}>
              {daysSinceUpdate} days ago
            </div>
          )}
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Effective Date</div>
          <div className="text-sm font-semibold text-gray-900">{source.effectiveDate}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Next Review</div>
          <div className="text-sm font-semibold text-gray-900">{source.nextReview}</div>
        </div>
      </div>

      {/* Progress Bar (Freshness Indicator) */}
      {daysSinceUpdate !== null && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Data Freshness</span>
            <span className={freshnessColor}>
              {daysSinceUpdate < 90 ? '✅ Fresh' : daysSinceUpdate < 180 ? '⚠️ Aging' : '🔴 Stale'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                daysSinceUpdate < 90 ? 'bg-green-500' :
                daysSinceUpdate < 180 ? 'bg-amber-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.max(0, 100 - (daysSinceUpdate / 365 * 100))}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-300">
        <div className="text-xs text-gray-600">
          <strong>Source:</strong> {source.source} · <strong>Frequency:</strong> {source.updateFrequency}
        </div>
        <div className="flex gap-2">
          {source.table && onTestConnection && (
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 font-semibold"
            >
              {testing ? (
                <>
                  <Icon name="RefreshCw" className="h-3 w-3 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Icon name="Zap" className="h-3 w-3" />
                  Test Connection
                </>
              )}
            </button>
          )}
          {source.table && onRefresh && ['bah_rates', 'conus_cola_rates', 'oconus_cola_rates'].includes(source.table) && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-semibold"
            >
              {refreshing ? (
                <>
                  <Icon name="RefreshCw" className="h-3 w-3 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <Icon name="RefreshCw" className="h-3 w-3" />
                  Force Refresh
                </>
              )}
            </button>
          )}
          {source.table && (
            <a
              href={`https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0].replace('https://', '')}/editor/${source.table}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-semibold text-gray-700"
            >
              <Icon name="ExternalLink" className="h-3 w-3" />
              View in Supabase
            </a>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
}


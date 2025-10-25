'use client';

import { useState, useEffect } from 'react';

import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';

import AlertPanel, { Alert } from '../components/AlertPanel';
import MetricCard from '../components/MetricCard';

interface OverviewMetrics {
  mrr: number;
  totalUsers: number;
  premiumUsers: number;
  conversionRate: number;
  newSignups7d: number;
  newPremium7d: number;
  activationRate: number;
  supportTickets: number;
}

interface ActivityItem {
  id: string;
  type: 'signup' | 'premium' | 'support' | 'tool_use';
  message: string;
  timestamp: string;
  userId?: string;
}

interface OverviewTabProps {
  initialMetrics: OverviewMetrics;
  initialAlerts: Alert[];
  initialActivity: ActivityItem[];
}

export default function OverviewTab({ initialMetrics, initialAlerts, initialActivity }: OverviewTabProps) {
  const [metrics] = useState<OverviewMetrics>(initialMetrics);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [activity, setActivity] = useState<ActivityItem[]>(initialActivity);

  // Real-time updates (SSE) - will be implemented in later phase
  useEffect(() => {
    // TODO: Connect to SSE endpoint /api/admin/stream
    // For now, just use initial data
  }, []);

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    // TODO: Call API to mark alert as dismissed
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'signup':
        return 'UserPlus';
      case 'premium':
        return 'DollarSign';
      case 'support':
        return 'MessageSquare';
      case 'tool_use':
        return 'Zap';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'signup':
        return 'text-blue-600';
      case 'premium':
        return 'text-green-600';
      case 'support':
        return 'text-amber-600';
      case 'tool_use':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-text-headings mb-4">🚨 Mission-Critical Alerts</h2>
          <AlertPanel alerts={alerts} onDismiss={handleDismissAlert} />
        </div>
      )}

      {/* Key Metrics */}
      <div>
        <h2 className="text-xl font-bold text-text-headings mb-4">📊 Command Center Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="MRR"
            value={`$${metrics.mrr.toFixed(2)}`}
            subtitle={`${metrics.premiumUsers} premium users`}
            icon="DollarSign"
            variant="success"
            delay={0}
          />
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers}
            subtitle={`+${metrics.newSignups7d} this week`}
            icon="Users"
            variant="info"
            trend={metrics.newSignups7d > 0 ? { direction: 'up', value: `+${metrics.newSignups7d}` } : undefined}
            delay={50}
          />
          <MetricCard
            title="Conversion Rate"
            value={`${metrics.conversionRate.toFixed(1)}%`}
            subtitle="Target: 8-10%"
            icon="Target"
            variant={metrics.conversionRate >= 8 ? 'success' : 'warning'}
            delay={100}
          />
          <MetricCard
            title="Activation Rate"
            value={`${metrics.activationRate.toFixed(1)}%`}
            subtitle="Completed profiles"
            icon="CheckCircle"
            variant="default"
            delay={150}
          />
        </div>
      </div>

      {/* Support Tickets Call-Out */}
      <AnimatedCard delay={175} className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-lg">
              <Icon name="MessageSquare" className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Support Tickets</h3>
              <p className="text-sm text-gray-600">
                {metrics.supportTickets > 0 ? (
                  <>
                    <span className="font-bold text-amber-600">{metrics.supportTickets}</span> new {metrics.supportTickets === 1 ? 'ticket' : 'tickets'} requiring attention
                  </>
                ) : (
                  'No pending support tickets'
                )}
              </p>
            </div>
          </div>
          <a
            href="/dashboard/admin/support"
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            View All Tickets
            <Icon name="ArrowRight" className="h-4 w-4" />
          </a>
        </div>
      </AnimatedCard>

      {/* System Health & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Activity Feed */}
        <AnimatedCard delay={200} className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-headings">📡 Live Activity Feed</h3>
            <span className="flex items-center gap-2 text-xs text-success">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
              Real-time
            </span>
          </div>
          
          {activity.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <Icon name="Activity" className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-surface-hover rounded-lg border border-border">
                  <Icon
                    name={getActivityIcon(item.type) as never}
                    className={`h-5 w-5 ${getActivityColor(item.type)} flex-shrink-0 mt-0.5`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-body">{item.message}</p>
                    <p className="text-xs text-text-muted mt-1">{item.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnimatedCard>

        {/* System Health */}
        <AnimatedCard delay={250} className="bg-card border border-border p-6">
          <h3 className="text-lg font-bold text-text-headings mb-4">🛡️ System Health</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-green-900">Database</span>
              </div>
              <span className="text-xs font-semibold text-green-700">Operational</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-green-900">AI Services</span>
              </div>
              <span className="text-xs font-semibold text-green-700">Operational</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-green-900">Authentication</span>
              </div>
              <span className="text-xs font-semibold text-green-700">Operational</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-green-900">Payments</span>
              </div>
              <span className="text-xs font-semibold text-green-700">Operational</span>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Quick Actions */}
      <AnimatedCard delay={300} className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 p-6">
        <h3 className="text-lg font-bold text-text-headings mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-border rounded-lg hover:shadow-md transition-all text-left">
            <Icon name="Download" className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-text-body">Export Data</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-border rounded-lg hover:shadow-md transition-all text-left">
            <Icon name="RefreshCw" className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-text-body">Refresh Sources</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-border rounded-lg hover:shadow-md transition-all text-left">
            <Icon name="File" className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-text-body">View Logs</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-border rounded-lg hover:shadow-md transition-all text-left">
            <Icon name="Send" className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-text-body">Send Alert</span>
          </button>
        </div>
      </AnimatedCard>
    </div>
  );
}


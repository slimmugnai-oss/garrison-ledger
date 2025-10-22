'use client';

import { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import AnimatedCard from '@/app/components/ui/AnimatedCard';

interface RevenueData {
  chartData: Array<{ month: string; signups: number; premium: number; mrr: number }>;
  currentMetrics: {
    mrr: number;
    arr: number;
    premiumUsers: number;
    conversionRate: string;
  };
  funnelData: Array<{ stage: string; count: number; percentage: number }>;
}

interface UserData {
  branchData: Array<{ name: string; value: number }>;
  rankData: Array<{ name: string; value: number }>;
  growthData: Array<{ month: string; signups: number; total: number }>;
  totalUsers: number;
}

export default function AnalyticsTab() {
  const [activeSubTab, setActiveSubTab] = useState('revenue');
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const [revenueRes, userRes] = await Promise.all([
        fetch('/api/admin/analytics/revenue'),
        fetch('/api/admin/analytics/users'),
      ]);

      if (!revenueRes.ok || !userRes.ok) {
        throw new Error('Failed to load analytics');
      }

      const [revenue, users] = await Promise.all([
        revenueRes.json(),
        userRes.json(),
      ]);

      setRevenueData(revenue);
      setUserData(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const renderSubTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-text-muted">Loading analytics...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-danger">
            <p className="font-semibold mb-2">Failed to load analytics</p>
            <p className="text-sm text-text-muted">{error}</p>
            <button
              onClick={loadAnalytics}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    switch (activeSubTab) {
      case 'revenue':
        return <RevenueSubTab data={revenueData} />;
      case 'users':
        return <UsersSubTab data={userData} />;
      case 'engagement':
        return <EngagementSubTab />;
      case 'tools':
        return <ToolsSubTab />;
      default:
        return <RevenueSubTab data={revenueData} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-1 overflow-x-auto">
          {[
            { id: 'revenue', label: '💰 Revenue' },
            { id: 'users', label: '👥 Users' },
            { id: 'engagement', label: '🎯 Engagement' },
            { id: 'tools', label: '🛠️ Tools' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`
                px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors
                ${activeSubTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-body hover:border-border'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Sub-tab Content */}
      {renderSubTabContent()}
    </div>
  );
}

function RevenueSubTab({ data }: { data: RevenueData | null }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Current Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="MRR"
          value={`$${data.currentMetrics.mrr.toFixed(2)}`}
          subtitle={`${data.currentMetrics.premiumUsers} premium users`}
          icon="DollarSign"
          variant="success"
        />
        <MetricCard
          title="ARR"
          value={`$${data.currentMetrics.arr.toFixed(0)}`}
          subtitle="Annual recurring"
          icon="TrendingUp"
          variant="info"
        />
        <MetricCard
          title="Conversion"
          value={`${data.currentMetrics.conversionRate}%`}
          subtitle="Target: 8-10%"
          icon="Target"
          variant={parseFloat(data.currentMetrics.conversionRate) >= 8 ? 'success' : 'warning'}
        />
        <MetricCard
          title="ARPU"
          value={`$${(data.currentMetrics.mrr / Math.max(data.currentMetrics.premiumUsers, 1)).toFixed(2)}`}
          subtitle="Per premium user"
          icon="Users"
          variant="default"
        />
      </div>

      {/* MRR Trend - Table Format */}
      <AnimatedCard delay={50} className="bg-card border border-border p-6">
        <h3 className="text-lg font-bold text-text-headings mb-4">📈 MRR Trend (Last 12 Months)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-hover border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-text-muted">Month</th>
                <th className="px-4 py-3 text-right font-semibold text-text-muted">Signups</th>
                <th className="px-4 py-3 text-right font-semibold text-text-muted">Premium</th>
                <th className="px-4 py-3 text-right font-semibold text-text-muted">MRR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.chartData.map((row, index) => (
                <tr key={index} className="hover:bg-surface-hover">
                  <td className="px-4 py-3 text-left font-semibold">{row.month}</td>
                  <td className="px-4 py-3 text-right text-blue-600 font-semibold">+{row.signups}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-semibold">+{row.premium}</td>
                  <td className="px-4 py-3 text-right text-primary font-bold">${row.mrr.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedCard>

      {/* Conversion Funnel */}
      <AnimatedCard delay={100} className="bg-card border border-border p-6">
        <h3 className="text-lg font-bold text-text-headings mb-4">🎯 Conversion Funnel</h3>
        <div className="space-y-4">
          {data.funnelData.map((stage) => (
            <div key={stage.stage}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-text-body">{stage.stage}</span>
                <span className="text-sm text-text-muted">{stage.count} ({stage.percentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-surface-hover rounded-full h-8">
                <div
                  className="h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold transition-all bg-gradient-to-r from-blue-500 to-green-500"
                  style={{ width: `${stage.percentage}%` }}
                >
                  {stage.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </AnimatedCard>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
        <p className="text-sm text-blue-800">
          📊 <strong>Charts coming in Phase 4:</strong> We'll add interactive line and bar charts with recharts for better visualization once the chart library is fully integrated.
        </p>
      </div>
    </div>
  );
}

function UsersSubTab({ data }: { data: UserData | null }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Demographics Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatedCard className="bg-card border border-border p-6">
          <h3 className="text-lg font-bold text-text-headings mb-4">Users by Branch</h3>
          <div className="space-y-2">
            {data.branchData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                <span className="font-semibold text-text-body">{item.name}</span>
                <span className="text-2xl font-black text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </AnimatedCard>

        <AnimatedCard className="bg-card border border-border p-6" delay={50}>
          <h3 className="text-lg font-bold text-text-headings mb-4">Users by Rank Category</h3>
          <div className="space-y-2">
            {data.rankData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                <span className="font-semibold text-text-body">{item.name}</span>
                <span className="text-2xl font-black text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </AnimatedCard>
      </div>

      {/* Growth Data Table */}
      <AnimatedCard delay={100} className="bg-card border border-border p-6">
        <h3 className="text-lg font-bold text-text-headings mb-4">📈 User Growth (Last 12 Months)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-hover border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-text-muted">Month</th>
                <th className="px-4 py-3 text-right font-semibold text-text-muted">New Signups</th>
                <th className="px-4 py-3 text-right font-semibold text-text-muted">Total Users</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.growthData.map((row, index) => (
                <tr key={index} className="hover:bg-surface-hover">
                  <td className="px-4 py-3 text-left font-semibold">{row.month}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-semibold">+{row.signups}</td>
                  <td className="px-4 py-3 text-right text-primary font-bold">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedCard>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
        <p className="text-sm text-blue-800">
          📊 <strong>Charts coming in Phase 4:</strong> Pie charts for branch/rank distribution and line charts for growth trends.
        </p>
      </div>
    </div>
  );
}

function EngagementSubTab() {
  return (
    <AnimatedCard className="bg-card border border-border p-12 text-center">
      <div className="text-6xl mb-4">🎯</div>
      <h3 className="text-2xl font-bold text-text-headings mb-2">Engagement Analytics Coming Soon</h3>
      <p className="text-text-muted max-w-md mx-auto">
        Streak analytics, DAU/MAU charts, feature usage heatmaps, and session duration metrics will be available in Phase 4.
      </p>
    </AnimatedCard>
  );
}

function ToolsSubTab() {
  return (
    <AnimatedCard className="bg-card border border-border p-12 text-center">
      <div className="text-6xl mb-4">🛠️</div>
      <h3 className="text-2xl font-bold text-text-headings mb-2">Tools Analytics Coming Soon</h3>
      <p className="text-text-muted max-w-md mx-auto">
        Tool usage statistics, success rates, error tracking, and completion time analytics will be available in Phase 4.
      </p>
    </AnimatedCard>
  );
}

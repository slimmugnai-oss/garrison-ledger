'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartWrapper from '../components/ChartWrapper';
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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

      {/* MRR Trend */}
      <ChartWrapper title="MRR Trend" subtitle="Last 12 months">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2} name="MRR ($)" />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* User Growth & Premium Conversions */}
      <ChartWrapper title="User Growth & Premium Conversions" subtitle="Monthly signups and premium conversions">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Bar dataKey="signups" fill="#3b82f6" name="Signups" />
            <Bar dataKey="premium" fill="#10b981" name="Premium" />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Conversion Funnel */}
      <ChartWrapper title="Conversion Funnel" subtitle="User journey from signup to premium">
        <div className="space-y-4">
          {data.funnelData.map((stage, index) => (
            <div key={stage.stage}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-text-body">{stage.stage}</span>
                <span className="text-sm text-text-muted">{stage.count} ({stage.percentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-surface-hover rounded-full h-8">
                <div
                  className={`h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold transition-all ${
                    index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-purple-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${stage.percentage}%` }}
                >
                  {stage.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </ChartWrapper>
    </div>
  );
}

function UsersSubTab({ data }: { data: UserData | null }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* User Growth Chart */}
      <ChartWrapper title="User Growth" subtitle="Total users over time">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.growthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Users" />
            <Line type="monotone" dataKey="signups" stroke="#10b981" strokeWidth={2} name="Monthly Signups" />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartWrapper title="Users by Branch" subtitle="Distribution across military branches">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.branchData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: {name: string; value: number}) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.branchData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Users by Rank Category" subtitle="Officer vs Enlisted vs Warrant">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.rankData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: {name: string; value: number}) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.rankData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>
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
        Streak analytics, DAU/MAU charts, feature usage heatmaps, and session duration metrics will be available here.
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
        Tool usage statistics, success rates, error tracking, and completion time analytics will be available here.
      </p>
    </AnimatedCard>
  );
}

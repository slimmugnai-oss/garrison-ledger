"use client";

import { useState, useEffect } from "react";

import AnimatedCard from "@/app/components/ui/AnimatedCard";

import MetricCard from "../components/MetricCard";

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
  const [activeSubTab, setActiveSubTab] = useState("revenue");
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
        fetch("/api/admin/analytics/revenue"),
        fetch("/api/admin/analytics/users"),
      ]);

      if (!revenueRes.ok || !userRes.ok) {
        throw new Error("Failed to load analytics");
      }

      const [revenue, users] = await Promise.all([revenueRes.json(), userRes.json()]);

      setRevenueData(revenue);
      setUserData(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const renderSubTabContent = () => {
    if (loading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-text-muted">Loading analytics...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center text-danger">
            <p className="mb-2 font-semibold">Failed to load analytics</p>
            <p className="text-text-muted text-sm">{error}</p>
            <button
              onClick={loadAnalytics}
              className="hover:bg-primary-hover mt-4 rounded-lg bg-primary px-4 py-2 text-white"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    switch (activeSubTab) {
      case "revenue":
        return <RevenueSubTab data={revenueData} />;
      case "users":
        return <UsersSubTab data={userData} />;
      case "engagement":
        return <EngagementSubTab />;
      case "tools":
        return <ToolsSubTab />;
      case "ask":
        return <AskAssistantSubTab />;
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
            { id: "revenue", label: "💰 Revenue" },
            { id: "users", label: "👥 Users" },
            { id: "engagement", label: "🎯 Engagement" },
            { id: "tools", label: "🛠️ Tools" },
            { id: "ask", label: "💬 Ask Assistant" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                activeSubTab === tab.id
                  ? "border-primary text-primary"
                  : "text-text-muted hover:text-text-body border-transparent hover:border-border"
              } `}
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
          variant={parseFloat(data.currentMetrics.conversionRate) >= 8 ? "success" : "warning"}
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
      <AnimatedCard delay={50} className="border border-border bg-card p-6">
        <h3 className="text-text-headings mb-4 text-lg font-bold">📈 MRR Trend (Last 12 Months)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-hover border-b border-border">
              <tr>
                <th className="text-text-muted px-4 py-3 text-left font-semibold">Month</th>
                <th className="text-text-muted px-4 py-3 text-right font-semibold">Signups</th>
                <th className="text-text-muted px-4 py-3 text-right font-semibold">Premium</th>
                <th className="text-text-muted px-4 py-3 text-right font-semibold">MRR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.chartData.map((row, index) => (
                <tr key={index} className="hover:bg-surface-hover">
                  <td className="px-4 py-3 text-left font-semibold">{row.month}</td>
                  <td className="px-4 py-3 text-right font-semibold text-blue-600">
                    +{row.signups}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">
                    +{row.premium}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary">
                    ${row.mrr.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedCard>

      {/* Conversion Funnel */}
      <AnimatedCard delay={100} className="border border-border bg-card p-6">
        <h3 className="text-text-headings mb-4 text-lg font-bold">🎯 Conversion Funnel</h3>
        <div className="space-y-4">
          {data.funnelData.map((stage) => (
            <div key={stage.stage}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-text-body text-sm font-semibold">{stage.stage}</span>
                <span className="text-text-muted text-sm">
                  {stage.count} ({stage.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="bg-surface-hover h-8 w-full rounded-full">
                <div
                  className="flex h-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-sm font-semibold text-white transition-all"
                  style={{ width: `${stage.percentage}%` }}
                >
                  {stage.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </AnimatedCard>
    </div>
  );
}

function UsersSubTab({ data }: { data: UserData | null }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Demographics Tables */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <AnimatedCard className="border border-border bg-card p-6">
          <h3 className="text-text-headings mb-4 text-lg font-bold">Users by Branch</h3>
          <div className="space-y-2">
            {data.branchData.map((item) => (
              <div
                key={item.name}
                className="bg-surface-hover flex items-center justify-between rounded-lg p-3"
              >
                <span className="text-text-body font-semibold">{item.name}</span>
                <span className="text-2xl font-black text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </AnimatedCard>

        <AnimatedCard className="border border-border bg-card p-6" delay={50}>
          <h3 className="text-text-headings mb-4 text-lg font-bold">Users by Rank Category</h3>
          <div className="space-y-2">
            {data.rankData.map((item) => (
              <div
                key={item.name}
                className="bg-surface-hover flex items-center justify-between rounded-lg p-3"
              >
                <span className="text-text-body font-semibold">{item.name}</span>
                <span className="text-2xl font-black text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </AnimatedCard>
      </div>

      {/* Growth Data Table */}
      <AnimatedCard delay={100} className="border border-border bg-card p-6">
        <h3 className="text-text-headings mb-4 text-lg font-bold">
          📈 User Growth (Last 12 Months)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-hover border-b border-border">
              <tr>
                <th className="text-text-muted px-4 py-3 text-left font-semibold">Month</th>
                <th className="text-text-muted px-4 py-3 text-right font-semibold">New Signups</th>
                <th className="text-text-muted px-4 py-3 text-right font-semibold">Total Users</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.growthData.map((row, index) => (
                <tr key={index} className="hover:bg-surface-hover">
                  <td className="px-4 py-3 text-left font-semibold">{row.month}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">
                    +{row.signups}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedCard>
    </div>
  );
}

function EngagementSubTab() {
  const [engagementData, setEngagementData] = useState<{
    streaks: { active: number; average: number; maximum: number };
    badges: Record<string, number>;
    topStreakers: Array<{
      current_streak: number;
      longest_streak: number;
      total_logins: number;
      badges: string[];
    }>;
    activeUsers: { dau: number; wau: number; mau: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEngagementData();
  }, []);

  const loadEngagementData = async () => {
    try {
      const res = await fetch("/api/admin/analytics/engagement");
      if (res.ok) {
        const data = await res.json();
        setEngagementData(data);
      }
    } catch (error) {
      console.error("Error loading engagement data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-text-muted">Loading engagement data...</p>
      </div>
    );
  }

  if (!engagementData) return null;

  return (
    <div className="space-y-6">
      {/* DAU/WAU/MAU */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title="DAU"
          value={engagementData.activeUsers.dau}
          subtitle="Daily active users"
          icon="Users"
          variant="success"
        />
        <MetricCard
          title="WAU"
          value={engagementData.activeUsers.wau}
          subtitle="Weekly active users"
          icon="Users"
          variant="info"
        />
        <MetricCard
          title="MAU"
          value={engagementData.activeUsers.mau}
          subtitle="Monthly active users"
          icon="Users"
          variant="default"
        />
      </div>

      {/* Streak Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title="Active Streaks"
          value={engagementData.streaks.active}
          subtitle="Users with current streaks"
          icon="TrendingUp"
          variant="warning"
        />
        <MetricCard
          title="Avg Streak"
          value={`${engagementData.streaks.average} days`}
          subtitle="Average current streak"
          icon="Target"
          variant="info"
        />
        <MetricCard
          title="Max Streak"
          value={`${engagementData.streaks.maximum} days`}
          subtitle="Longest current streak"
          icon="Crown"
          variant="success"
        />
      </div>

      {/* Badge Distribution */}
      <AnimatedCard delay={100} className="border border-border bg-card p-6">
        <h3 className="text-text-headings mb-4 text-lg font-bold">Achievement Badges Earned</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border-2 border-success bg-gradient-to-br from-green-50 to-emerald-50 p-6 text-center">
            <div className="mb-2 text-4xl">🎯</div>
            <div className="mb-1 text-2xl font-black text-primary">
              {engagementData.badges.week_warrior}
            </div>
            <div className="text-text-body text-sm font-semibold">Week Warriors</div>
            <div className="text-text-muted text-xs">7+ day streaks</div>
          </div>
          <div className="rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 text-center">
            <div className="mb-2 text-4xl">⭐</div>
            <div className="mb-1 text-2xl font-black text-primary">
              {engagementData.badges.month_master}
            </div>
            <div className="text-text-body text-sm font-semibold">Month Masters</div>
            <div className="text-text-muted text-xs">30+ day streaks</div>
          </div>
          <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 text-center">
            <div className="mb-2 text-4xl">👑</div>
            <div className="mb-1 text-2xl font-black text-primary">
              {engagementData.badges.quarter_champion}
            </div>
            <div className="text-text-body text-sm font-semibold">Quarter Champions</div>
            <div className="text-text-muted text-xs">90+ day streaks</div>
          </div>
          <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center">
            <div className="mb-2 text-4xl">🏆</div>
            <div className="mb-1 text-2xl font-black text-primary">
              {engagementData.badges.year_legend}
            </div>
            <div className="text-text-body text-sm font-semibold">Year Legends</div>
            <div className="text-text-muted text-xs">365+ day streaks</div>
          </div>
        </div>
      </AnimatedCard>

      {/* Top Streakers */}
      <AnimatedCard delay={150} className="border border-border bg-card p-6">
        <h3 className="text-text-headings mb-4 text-lg font-bold">🔥 Top Streakers</h3>
        {engagementData.topStreakers.length === 0 ? (
          <div className="text-text-muted py-8 text-center">
            <p>No active streaks yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {engagementData.topStreakers.map((streaker, idx) => (
              <div
                key={idx}
                className="bg-surface-hover flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-black ${
                      idx === 0
                        ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white"
                        : idx === 1
                          ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white"
                          : idx === 2
                            ? "bg-gradient-to-br from-amber-400 to-amber-500 text-white"
                            : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-text-body text-sm font-semibold">User #{idx + 1}</div>
                    <div className="text-text-muted text-xs">
                      {streaker.total_logins || 0} total logins
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-2xl font-black text-orange-600">
                      {streaker.current_streak} 🔥
                    </div>
                    <div className="text-text-muted text-xs">Current</div>
                  </div>
                  <div className="text-right">
                    <div className="text-text-body text-lg font-bold">
                      {streaker.longest_streak}
                    </div>
                    <div className="text-text-muted text-xs">Best</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AnimatedCard>
    </div>
  );
}

function ToolsSubTab() {
  const [toolsData, setToolsData] = useState<Array<{
    name: string;
    usage: number;
    successRate: string;
    category: string;
  }> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadToolsData();
  }, []);

  const loadToolsData = async () => {
    try {
      const res = await fetch("/api/admin/analytics/tools");
      if (res.ok) {
        const data = await res.json();
        setToolsData(data.toolsData);
      }
    } catch (error) {
      console.error("Error loading tools data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-text-muted">Loading tools data...</p>
      </div>
    );
  }

  if (!toolsData) return null;

  const premiumTools = toolsData.filter((t) => t.category === "Premium Tools");
  const freeTools = toolsData.filter((t) => t.category === "Free Tools");
  const totalUsage = toolsData.reduce((sum, t) => sum + t.usage, 0);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Usage"
          value={totalUsage}
          subtitle="Last 30 days"
          icon="Activity"
          variant="info"
        />
        <MetricCard
          title="Premium Tools"
          value={premiumTools.reduce((sum, t) => sum + t.usage, 0)}
          subtitle={`${premiumTools.length} tools`}
          icon="Crown"
          variant="success"
        />
        <MetricCard
          title="Free Tools"
          value={freeTools.reduce((sum, t) => sum + t.usage, 0)}
          subtitle={`${freeTools.length} tools`}
          icon="Zap"
          variant="default"
        />
        <MetricCard
          title="Avg Success Rate"
          value={`${(toolsData.reduce((sum, t) => sum + parseFloat(t.successRate), 0) / toolsData.length).toFixed(1)}%`}
          subtitle="Across all tools"
          icon="CheckCircle"
          variant="success"
        />
      </div>

      {/* Premium Tools */}
      <AnimatedCard delay={50} className="border border-border bg-card p-6">
        <h3 className="text-text-headings mb-4 text-lg font-bold">👑 Premium Tools Usage</h3>
        <div className="space-y-3">
          {premiumTools.map((tool) => (
            <div
              key={tool.name}
              className="flex items-center justify-between rounded-lg border border-success bg-gradient-to-r from-green-50 to-emerald-50 p-4"
            >
              <div>
                <p className="text-text-headings font-bold">{tool.name}</p>
                <p className="text-text-muted text-sm">Success Rate: {tool.successRate}%</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-success">{tool.usage}</p>
                <p className="text-text-muted text-xs">uses (30d)</p>
              </div>
            </div>
          ))}
        </div>
      </AnimatedCard>

      {/* Free Tools */}
      <AnimatedCard delay={100} className="border border-border bg-card p-6">
        <h3 className="text-text-headings mb-4 text-lg font-bold">⚡ Free Tools Usage</h3>
        <div className="space-y-3">
          {freeTools.map((tool) => (
            <div
              key={tool.name}
              className="border-info flex items-center justify-between rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 p-4"
            >
              <div>
                <p className="text-text-headings font-bold">{tool.name}</p>
                <p className="text-text-muted text-sm">Success Rate: {tool.successRate}%</p>
              </div>
              <div className="text-right">
                <p className="text-info text-2xl font-black">{tool.usage}</p>
                <p className="text-text-muted text-xs">uses (30d)</p>
              </div>
            </div>
          ))}
        </div>
      </AnimatedCard>
    </div>
  );
}

// Ask Assistant Analytics Sub-Tab
function AskAssistantSubTab() {
  const [data, setData] = useState<{
    totalQuestions: number;
    questionsToday: number;
    questions7d: number;
    avgConfidence: number;
    strictModePercent: number;
    creditUsage: { tier: string; used: number; remaining: number; total: number }[];
    topTemplates: { id: string; text: string; count: number }[];
    coverageRequests: { pending: number; completed: number; total: number };
    avgResponseTimeMs: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAskAnalytics();
  }, []);

  const loadAskAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics/ask-assistant");
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to load Ask Assistant analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-text-muted">Loading Ask Assistant analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-text-muted">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Questions"
          value={data.totalQuestions.toString()}
          subtitle={`${data.questionsToday} today, ${data.questions7d} last 7d`}
          icon="Activity"
          variant="info"
        />
        <MetricCard
          title="Avg Confidence"
          value={`${(data.avgConfidence * 100).toFixed(0)}%`}
          subtitle={`${data.strictModePercent.toFixed(0)}% with official data`}
          icon="CheckCircle"
          variant="success"
        />
        <MetricCard
          title="Avg Response Time"
          value={`${(data.avgResponseTimeMs / 1000).toFixed(1)}s`}
          subtitle="Time to generate answer"
          icon="Zap"
          variant="warning"
        />
        <MetricCard
          title="Coverage Requests"
          value={data.coverageRequests.pending.toString()}
          subtitle={`${data.coverageRequests.completed} completed`}
          icon="AlertTriangle"
          variant="danger"
        />
      </div>

      {/* Credit Usage by Tier */}
      <AnimatedCard delay={0.1}>
        <h3 className="text-text-headings mb-4 text-lg font-bold">Credit Usage by Tier</h3>
        <div className="space-y-3">
          {data.creditUsage.map((tier) => {
            const usagePercent = (tier.used / tier.total) * 100;
            return (
              <div
                key={tier.tier}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-text-headings font-semibold capitalize">{tier.tier}</p>
                    <p className="text-text-muted text-sm">
                      {tier.used} used of {tier.total} ({usagePercent.toFixed(0)}%)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-headings text-2xl font-bold">{tier.remaining}</p>
                    <p className="text-text-muted text-xs">remaining</p>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-2 rounded-full transition-all ${usagePercent > 80 ? "bg-red-500" : usagePercent > 50 ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </AnimatedCard>

      {/* Top Templates */}
      <AnimatedCard delay={0.2}>
        <h3 className="text-text-headings mb-4 text-lg font-bold">Most Popular Templates</h3>
        <div className="space-y-2">
          {data.topTemplates.slice(0, 10).map((template, index) => (
            <div
              key={template.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                </div>
                <p className="text-text-body text-sm">{template.text}</p>
              </div>
              <div className="text-text-muted text-sm font-medium">{template.count} uses</div>
            </div>
          ))}
          {data.topTemplates.length === 0 && (
            <p className="text-text-muted py-4 text-center text-sm">No template usage data yet</p>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
}

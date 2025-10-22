"use client";

import { useState, useEffect } from "react";
import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";
import MetricCard from "../components/MetricCard";
import DataTable, { Column } from "../components/DataTable";

interface SitePage {
  id: string;
  path: string;
  title: string;
  category: string;
  tier_required: string | null;
  description: string;
  status: string;
  health_status: "healthy" | "warning" | "error" | "unknown";
  response_time_ms: number | null;
  view_count_7d: number;
  view_count_30d: number;
  last_updated: string;
  last_audit: string | null;
  dependencies: Record<string, unknown>;
}

interface SitemapData {
  pages: SitePage[];
  categorized: Record<string, SitePage[]>;
  stats: {
    total: number;
    healthy: number;
    warning: number;
    error: number;
    unknown: number;
    avgResponseTime: number;
  };
}

export default function SitemapTab() {
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [sitemapData, setSitemapData] = useState<SitemapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSitemapData();
  }, []);

  const loadSitemapData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sitemap");
      if (res.ok) {
        const data = await res.json();
        setSitemapData(data);
      }
    } catch (error) {
      console.error("Error loading sitemap:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-text-muted">Loading sitemap...</p>
      </div>
    );
  }

  if (!sitemapData) {
    return (
      <div className="py-12 text-center">
        <p className="text-text-muted">No sitemap data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-1 overflow-x-auto">
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "pages", label: "📄 Pages" },
            { id: "health", label: "🏥 Health Checks" },
            { id: "analytics", label: "📈 Analytics" },
            { id: "links", label: "🔗 Broken Links" },
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
      {activeSubTab === "overview" && (
        <OverviewSubTab data={sitemapData} onReload={loadSitemapData} />
      )}
      {activeSubTab === "pages" && (
        <PagesSubTab pages={sitemapData.pages} onReload={loadSitemapData} />
      )}
      {activeSubTab === "health" && (
        <HealthSubTab pages={sitemapData.pages} onReload={loadSitemapData} />
      )}
      {activeSubTab === "analytics" && <AnalyticsSubTab />}
      {activeSubTab === "links" && <BrokenLinksSubTab />}
    </div>
  );
}

// Overview Sub-Tab: Visual sitemap with health status
function OverviewSubTab({ data, onReload }: { data: SitemapData; onReload: () => void }) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return "🟢";
      case "warning":
        return "🟡";
      case "error":
        return "🔴";
      default:
        return "⚫";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Pages"
          value={data.stats.total}
          subtitle="Platform-wide"
          icon="Map"
          variant="info"
        />
        <MetricCard
          title="Healthy Pages"
          value={data.stats.healthy}
          subtitle={`${Math.round((data.stats.healthy / data.stats.total) * 100)}% of total`}
          icon="CheckCircle"
          variant="success"
        />
        <MetricCard
          title="Needs Attention"
          value={data.stats.warning + data.stats.error}
          subtitle="Warnings + Errors"
          icon="AlertTriangle"
          variant="warning"
        />
        <MetricCard
          title="Avg Response"
          value={`${data.stats.avgResponseTime}ms`}
          subtitle="Page load time"
          icon="Zap"
          variant="default"
        />
      </div>

      {/* Category Tree */}
      <AnimatedCard delay={50} className="border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-text-headings text-xl font-bold">Platform Sitemap</h3>
          <button
            onClick={onReload}
            className="hover:bg-primary-hover rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white transition-colors"
          >
            <Icon name="RefreshCw" className="mr-1 inline h-3 w-3" />
            Reload
          </button>
        </div>

        <div className="space-y-2">
          {Object.entries(data.categorized).map(([category, pages], idx) => {
            const isExpanded = expandedCategories.has(category);
            const categoryHealth = {
              healthy: pages.filter((p) => p.health_status === "healthy").length,
              warning: pages.filter((p) => p.health_status === "warning").length,
              error: pages.filter((p) => p.health_status === "error").length,
              unknown: pages.filter((p) => p.health_status === "unknown").length,
            };

            return (
              <div key={category} className="rounded-lg border border-border">
                <button
                  onClick={() => toggleCategory(category)}
                  className="hover:bg-surface-hover flex w-full items-center justify-between p-4 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon name={isExpanded ? "ChevronDown" : "ChevronRight"} className="h-5 w-5" />
                    <span className="text-text-headings text-lg font-bold">{category}</span>
                    <Badge variant="secondary" size="sm">
                      {pages.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {categoryHealth.healthy > 0 && (
                      <span className="text-sm">🟢 {categoryHealth.healthy}</span>
                    )}
                    {categoryHealth.warning > 0 && (
                      <span className="text-sm">🟡 {categoryHealth.warning}</span>
                    )}
                    {categoryHealth.error > 0 && (
                      <span className="text-sm">🔴 {categoryHealth.error}</span>
                    )}
                    {categoryHealth.unknown > 0 && (
                      <span className="text-sm">⚫ {categoryHealth.unknown}</span>
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="bg-surface-hover/30 space-y-1 border-t border-border p-2">
                    {pages.map((page) => (
                      <div
                        key={page.id}
                        className="hover:bg-surface-hover flex items-center justify-between rounded p-2 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span>{getHealthIcon(page.health_status)}</span>
                          <code className="text-text-body font-mono text-sm">{page.path}</code>
                          <span className="text-text-muted text-sm">- {page.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {page.tier_required && (
                            <Badge variant="info" size="sm">
                              {page.tier_required}
                            </Badge>
                          )}
                          {page.response_time_ms && (
                            <span className="text-text-muted text-xs">
                              {page.response_time_ms}ms
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AnimatedCard>
    </div>
  );
}

// Pages Sub-Tab: Detailed table of all pages
function PagesSubTab({ pages, onReload }: { pages: SitePage[]; onReload: () => void }) {
  const getHealthBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge variant="success">Healthy</Badge>;
      case "warning":
        return <Badge variant="warning">Warning</Badge>;
      case "error":
        return <Badge variant="danger">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const columns: Column<SitePage>[] = [
    {
      key: "path",
      header: "Path",
      sortable: true,
      render: (page) => (
        <code className="text-text-body bg-surface-hover rounded px-2 py-1 text-xs">
          {page.path}
        </code>
      ),
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (page) => <span className="text-text-body font-semibold">{page.title}</span>,
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      width: "w-32",
      render: (page) => <span className="text-text-muted text-sm">{page.category}</span>,
    },
    {
      key: "tier_required",
      header: "Tier",
      sortable: true,
      width: "w-24",
      render: (page) =>
        page.tier_required ? (
          <Badge variant="info" size="sm">
            {page.tier_required}
          </Badge>
        ) : (
          <span className="text-text-muted text-xs">Public</span>
        ),
    },
    {
      key: "health_status",
      header: "Health",
      sortable: true,
      width: "w-28",
      render: (page) => getHealthBadge(page.health_status),
    },
    {
      key: "response_time_ms",
      header: "Response",
      sortable: true,
      width: "w-24",
      render: (page) => (
        <span
          className={`text-sm ${page.response_time_ms && page.response_time_ms > 2000 ? "text-danger" : "text-text-muted"}`}
        >
          {page.response_time_ms ? `${page.response_time_ms}ms` : "-"}
        </span>
      ),
    },
    {
      key: "view_count_30d",
      header: "Views (30d)",
      sortable: true,
      width: "w-28",
      render: (page) => (
        <span className="text-text-body font-semibold">{page.view_count_30d || 0}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-text-headings text-xl font-bold">All Pages</h3>
          <p className="text-text-muted text-sm">
            Complete list of platform pages with health status
          </p>
        </div>
        <button
          onClick={onReload}
          className="hover:bg-primary-hover rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors"
        >
          <Icon name="RefreshCw" className="mr-2 inline h-4 w-4" />
          Reload
        </button>
      </div>

      <DataTable
        data={pages}
        columns={columns}
        keyExtractor={(page) => page.id}
        pageSize={25}
        emptyMessage="No pages found"
      />
    </div>
  );
}

// Health Sub-Tab: Health check system
function HealthSubTab({ pages, onReload }: { pages: SitePage[]; onReload: () => void }) {
  const [checking, setChecking] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const runHealthCheck = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/admin/sitemap/check-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkAll: true }),
      });

      if (res.ok) {
        const result = await res.json();
        alert(`✅ Health check complete!\n\nChecked: ${result.checked} pages\nRefreshing data...`);
        onReload();
      } else {
        alert("❌ Health check failed");
      }
    } catch (error) {
      alert("❌ Error running health check");
    } finally {
      setChecking(false);
    }
  };

  const syncAnalytics = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/sitemap/sync-analytics", {
        method: "POST",
      });

      if (res.ok) {
        const result = await res.json();
        alert(`✅ Analytics synced!\n\nUpdated: ${result.updated}/${result.total} pages`);
        onReload();
      } else {
        alert("❌ Failed to sync analytics");
      }
    } catch (error) {
      alert("❌ Error syncing analytics");
    } finally {
      setSyncing(false);
    }
  };

  const healthyPages = pages.filter((p) => p.health_status === "healthy");
  const warningPages = pages.filter((p) => p.health_status === "warning");
  const errorPages = pages.filter((p) => p.health_status === "error");
  const unknownPages = pages.filter((p) => p.health_status === "unknown");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-text-headings text-xl font-bold">Health Monitoring</h3>
          <p className="text-text-muted text-sm">Automated availability and performance checks</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={syncAnalytics}
            disabled={syncing}
            className="hover:bg-success-hover flex items-center gap-2 rounded-lg bg-success px-4 py-2 font-semibold text-white transition-colors disabled:opacity-50"
          >
            <Icon
              name={syncing ? "RefreshCw" : "TrendingUp"}
              className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Syncing..." : "Sync Analytics"}
          </button>
          <button
            onClick={runHealthCheck}
            disabled={checking}
            className="hover:bg-primary-hover flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors disabled:opacity-50"
          >
            <Icon
              name={checking ? "RefreshCw" : "Activity"}
              className={`h-4 w-4 ${checking ? "animate-spin" : ""}`}
            />
            {checking ? "Checking..." : "Run Health Check"}
          </button>
        </div>
      </div>

      {/* Health Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AnimatedCard className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-sm font-semibold text-green-700">Healthy</div>
              <div className="text-3xl font-black text-green-900">{healthyPages.length}</div>
            </div>
            <Icon name="CheckCircle" className="h-10 w-10 text-green-600" />
          </div>
        </AnimatedCard>

        <AnimatedCard
          className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4"
          delay={50}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-sm font-semibold text-amber-700">Warning</div>
              <div className="text-3xl font-black text-amber-900">{warningPages.length}</div>
            </div>
            <Icon name="AlertTriangle" className="h-10 w-10 text-amber-600" />
          </div>
        </AnimatedCard>

        <AnimatedCard
          className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-4"
          delay={100}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-sm font-semibold text-red-700">Error</div>
              <div className="text-3xl font-black text-red-900">{errorPages.length}</div>
            </div>
            <Icon name="XCircle" className="h-10 w-10 text-red-600" />
          </div>
        </AnimatedCard>

        <AnimatedCard
          className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4"
          delay={150}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-sm font-semibold text-gray-700">Unknown</div>
              <div className="text-3xl font-black text-gray-900">{unknownPages.length}</div>
            </div>
            <Icon name="HelpCircle" className="h-10 w-10 text-gray-600" />
          </div>
        </AnimatedCard>
      </div>

      {/* Error and Warning Pages */}
      {(errorPages.length > 0 || warningPages.length > 0) && (
        <AnimatedCard delay={200} className="border border-border bg-card p-6">
          <h3 className="text-text-headings mb-4 text-lg font-bold">Pages Needing Attention</h3>
          <div className="space-y-3">
            {errorPages.map((page) => (
              <div
                key={page.id}
                className="bg-surface-hover flex items-center justify-between rounded-lg border border-red-200 p-3"
              >
                <div>
                  <code className="text-text-body font-mono text-sm">{page.path}</code>
                  <p className="text-text-muted mt-1 text-xs">
                    {page.response_time_ms ? `${page.response_time_ms}ms` : "No response"}
                  </p>
                </div>
                <Badge variant="danger">Error</Badge>
              </div>
            ))}
            {warningPages.map((page) => (
              <div
                key={page.id}
                className="bg-surface-hover flex items-center justify-between rounded-lg border border-amber-200 p-3"
              >
                <div>
                  <code className="text-text-body font-mono text-sm">{page.path}</code>
                  <p className="text-text-muted mt-1 text-xs">
                    {page.response_time_ms ? `${page.response_time_ms}ms (slow)` : "-"}
                  </p>
                </div>
                <Badge variant="warning">Warning</Badge>
              </div>
            ))}
          </div>
        </AnimatedCard>
      )}
    </div>
  );
}

// Analytics Sub-Tab
function AnalyticsSubTab() {
  const [analyticsData, setAnalyticsData] = useState<{
    topPages: SitePage[];
    bottomPages: SitePage[];
    slowPages: SitePage[];
    highBouncePages: SitePage[];
    outdatedPages: SitePage[];
    needsAttention: SitePage[];
    categoryStats: Record<string, { count: number; views: number; avgResponse: number }>;
    summary: {
      totalPages: number;
      totalViews30d: number;
      avgResponseTime: number;
      outdatedCount: number;
      needsAttentionCount: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/sitemap/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const syncAnalytics = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/sitemap/sync-analytics", {
        method: "POST",
      });

      if (res.ok) {
        const result = await res.json();
        alert(`✅ Analytics synced!\n\nUpdated: ${result.updated}/${result.total} pages`);
        loadAnalytics();
      } else {
        alert("❌ Failed to sync analytics");
      }
    } catch (error) {
      alert("❌ Error syncing analytics");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-text-muted">Loading analytics...</p>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Views"
          value={analyticsData.summary.totalViews30d.toLocaleString()}
          subtitle="Last 30 days"
          icon="TrendingUp"
          variant="success"
        />
        <MetricCard
          title="Avg Response"
          value={`${analyticsData.summary.avgResponseTime}ms`}
          subtitle="Platform-wide"
          icon="Zap"
          variant="info"
        />
        <MetricCard
          title="Needs Attention"
          value={analyticsData.summary.needsAttentionCount}
          subtitle="Pages requiring review"
          icon="AlertTriangle"
          variant="warning"
        />
        <MetricCard
          title="Outdated"
          value={analyticsData.summary.outdatedCount}
          subtitle="> 90 days old"
          icon="XCircle"
          variant="danger"
        />
      </div>

      {/* Sync Button */}
      <div className="flex justify-end">
        <button
          onClick={syncAnalytics}
          disabled={syncing}
          className="hover:bg-primary-hover flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors disabled:opacity-50"
        >
          <Icon name={syncing ? "RefreshCw" : "Activity"} className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync Analytics from Events"}
        </button>
      </div>

      {/* Top Pages */}
      <AnimatedCard delay={50} className="border border-border bg-card p-6">
        <h3 className="text-text-headings mb-4 text-lg font-bold">🏆 Top 10 Pages (30d Views)</h3>
        {analyticsData.topPages.length === 0 ? (
          <p className="text-text-muted py-4 text-center">No view data yet. Click "Sync Analytics" above.</p>
        ) : (
          <div className="space-y-2">
            {analyticsData.topPages.map((page, idx) => (
              <div key={page.id} className="bg-surface-hover flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
                    idx === 0 ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white" :
                    idx === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" :
                    idx === 2 ? "bg-gradient-to-br from-amber-400 to-amber-500 text-white" :
                    "bg-gray-200 text-gray-700"
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <code className="text-text-body font-mono text-sm">{page.path}</code>
                    <p className="text-text-muted text-xs">{page.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-text-headings text-2xl font-black">{page.view_count_30d?.toLocaleString()}</div>
                  <div className="text-text-muted text-xs">views</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AnimatedCard>

      {/* Low Traffic Pages */}
      {analyticsData.bottomPages.length > 0 && (
        <AnimatedCard delay={100} className="border border-border bg-card p-6">
          <h3 className="text-text-headings mb-4 text-lg font-bold">📉 Low Traffic Pages (30d)</h3>
          <div className="space-y-2">
            {analyticsData.bottomPages.map((page) => (
              <div key={page.id} className="bg-surface-hover flex items-center justify-between rounded-lg border border-amber-200 p-3">
                <div>
                  <code className="text-text-body font-mono text-sm">{page.path}</code>
                  <p className="text-text-muted text-xs">{page.title}</p>
                </div>
                <Badge variant="warning">{page.view_count_30d || 0} views</Badge>
              </div>
            ))}
          </div>
        </AnimatedCard>
      )}

      {/* Slow Pages */}
      {analyticsData.slowPages.length > 0 && (
        <AnimatedCard delay={150} className="border border-border bg-card p-6">
          <h3 className="text-text-headings mb-4 text-lg font-bold">🐌 Slow Pages (> 2s)</h3>
          <div className="space-y-2">
            {analyticsData.slowPages.map((page) => (
              <div key={page.id} className="bg-surface-hover flex items-center justify-between rounded-lg border border-red-200 p-3">
                <div>
                  <code className="text-text-body font-mono text-sm">{page.path}</code>
                  <p className="text-text-muted text-xs">{page.title}</p>
                </div>
                <Badge variant="danger">{page.response_time_ms}ms</Badge>
              </div>
            ))}
          </div>
        </AnimatedCard>
      )}

      {/* Outdated Content */}
      {analyticsData.outdatedPages.length > 0 && (
        <AnimatedCard delay={200} className="border border-border bg-card p-6">
          <h3 className="text-text-headings mb-4 text-lg font-bold">📅 Outdated Content (> 90 days)</h3>
          <div className="space-y-2">
            {analyticsData.outdatedPages.map((page) => (
              <div key={page.id} className="bg-surface-hover flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <code className="text-text-body font-mono text-sm">{page.path}</code>
                  <p className="text-text-muted text-xs">{page.title}</p>
                </div>
                <div className="text-right text-xs text-text-muted">
                  {page.last_updated ? `Updated ${Math.floor((Date.now() - new Date(page.last_updated).getTime()) / (1000 * 60 * 60 * 24))} days ago` : "Never updated"}
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>
      )}

      {/* Pages Needing Attention */}
      {analyticsData.needsAttention.length > 0 && (
        <AnimatedCard delay={250} className="border-2 border-primary bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
          <h3 className="text-text-headings mb-4 text-lg font-bold">⚠️ Pages Needing Attention</h3>
          <p className="text-text-muted mb-4 text-sm">
            Pages with multiple issues: old content, low traffic, high bounce rate, or slow performance
          </p>
          <div className="space-y-2">
            {analyticsData.needsAttention.map((page) => {
              const issues = [];
              if (page.last_updated && new Date(page.last_updated) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
                issues.push("Old");
              }
              if ((page.view_count_30d || 0) < 10) {
                issues.push("Low Traffic");
              }
              if ((page.bounce_rate || 0) > 70) {
                issues.push("High Bounce");
              }
              if ((page.response_time_ms || 0) > 3000) {
                issues.push("Slow");
              }

              return (
                <div key={page.id} className="flex items-center justify-between rounded-lg border border-primary bg-white p-3">
                  <div>
                    <code className="text-text-body font-mono text-sm font-semibold">{page.path}</code>
                    <p className="text-text-muted mt-1 text-xs">{issues.join(" • ")}</p>
                  </div>
                  <div className="flex gap-2">
                    {issues.map((issue) => (
                      <Badge key={issue} variant="warning" size="sm">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </AnimatedCard>
      )}

      {/* Category Performance */}
      <AnimatedCard delay={300} className="border border-border bg-card p-6">
        <h3 className="text-text-headings mb-4 text-lg font-bold">📊 Performance by Category</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Object.entries(analyticsData.categoryStats).map(([category, stats]) => (
            <div key={category} className="bg-surface-hover rounded-lg border border-border p-4">
              <h4 className="text-text-headings mb-2 font-bold">{category}</h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-text-body text-xl font-black">{stats.count}</div>
                  <div className="text-text-muted text-xs">Pages</div>
                </div>
                <div>
                  <div className="text-text-body text-xl font-black">{stats.views.toLocaleString()}</div>
                  <div className="text-text-muted text-xs">Views</div>
                </div>
                <div>
                  <div className="text-text-body text-xl font-black">{stats.avgResponse}ms</div>
                  <div className="text-text-muted text-xs">Avg Speed</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AnimatedCard>
    </div>
  );
}

// Broken Links Sub-Tab
function BrokenLinksSubTab() {
  return (
    <AnimatedCard className="border border-border bg-card p-12 text-center">
      <Icon name="Link" className="mx-auto mb-4 h-16 w-16 text-primary opacity-50" />
      <h3 className="text-text-headings mb-2 text-2xl font-bold">
        Broken Link Detection Coming Soon
      </h3>
      <p className="text-text-muted mx-auto max-w-md">
        Automated broken link scanning, source tracking, and fix suggestions will be available here.
      </p>
    </AnimatedCard>
  );
}

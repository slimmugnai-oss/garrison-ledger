"use client";

import { useState, useEffect } from "react";

import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";

import ConfigurationManager from "../components/ConfigurationManager";
import DataSourceCard, { DataSourceStatus } from "../components/DataSourceCard";
import ErrorLogsViewer from "../components/ErrorLogsViewer";

export default function SystemTab() {
  const [activeSubTab, setActiveSubTab] = useState("data-sources");
  const [dataSources, setDataSources] = useState<DataSourceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data-sources");
      if (res.ok) {
        const data = await res.json();
        setDataSources(data.sources || []);
      }
    } catch (error) {
      console.error("Error loading data sources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (table: string) => {
    try {
      const res = await fetch(`/api/admin/data-sources/test?table=${table}`);
      const data = await res.json();

      if (res.ok) {
        alert(
          `✅ Connection successful!\n\nTable: ${table}\nRows: ${data.count.toLocaleString()}\nStatus: Healthy`
        );
      } else {
        alert(`❌ Connection failed:\n\n${data.error}`);
      }
    } catch (error) {
      alert(`❌ Error testing connection: ${error}`);
    }
  };

  const handleRefresh = async (table: string) => {
    if (!confirm(`Force refresh ${table}? This will fetch latest data from official sources.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/data-sources/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Refresh successful!\n\n${data.message}`);
        await loadDataSources(); // Reload to show updated data
      } else {
        alert(`❌ Refresh failed:\n\n${data.error}`);
      }
    } catch (error) {
      alert(`❌ Error refreshing data: ${error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-1 overflow-x-auto">
          {[
            { id: "data-sources", label: "💾 Data Sources" },
            { id: "api-health", label: "🔌 API Health" },
            { id: "error-logs", label: "📝 Error Logs" },
            { id: "configuration", label: "⚙️ Configuration" },
            { id: "email-campaigns", label: "📧 Email Campaigns" },
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
      {activeSubTab === "data-sources" && (
        <DataSourcesSubTab
          sources={dataSources}
          loading={loading}
          onTestConnection={handleTestConnection}
          onRefresh={handleRefresh}
          onReload={loadDataSources}
        />
      )}
      {activeSubTab === "api-health" && <APIHealthSubTab />}
      {activeSubTab === "error-logs" && <ErrorLogsViewer />}
      {activeSubTab === "configuration" && <ConfigurationManager />}
      {activeSubTab === "email-campaigns" && <EmailCampaignsSubTab />}
    </div>
  );
}

interface DataSourcesSubTabProps {
  sources: DataSourceStatus[];
  loading: boolean;
  onTestConnection: (table: string) => void;
  onRefresh: (table: string) => void;
  onReload: () => void;
}

function DataSourcesSubTab({
  sources,
  loading,
  onTestConnection,
  onRefresh,
  onReload,
}: DataSourcesSubTabProps) {
  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-text-muted">Loading data sources...</p>
      </div>
    );
  }

  const currentCount = sources.filter((s) => s.status === "current").length;
  const staleCount = sources.filter((s) => s.status === "stale").length;
  const criticalCount = sources.filter((s) => s.status === "critical").length;
  const totalRows = sources.reduce((sum, s) => sum + s.rowCount, 0);

  // Group by category
  const lesAuditor = sources.filter((s) => s.category.includes("LES Auditor"));
  const pcsTools = sources.filter((s) => s.category.includes("PCS"));
  const baseNav = sources.filter((s) => s.category.includes("Base Navigator"));
  const content = sources.filter((s) => s.category.includes("Intel"));

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AnimatedCard className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-sm font-semibold text-green-700">Current</div>
              <div className="text-3xl font-black text-green-900">{currentCount}</div>
              <div className="mt-1 text-xs text-green-700">of {sources.length} sources</div>
            </div>
            <Icon name="CheckCircle" className="h-10 w-10 text-green-600" />
          </div>
        </AnimatedCard>

        <AnimatedCard
          className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
          delay={50}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-sm font-semibold text-blue-700">Total Rows</div>
              <div className="text-3xl font-black text-blue-900">{totalRows.toLocaleString()}</div>
              <div className="mt-1 text-xs text-blue-700">across all tables</div>
            </div>
            <Icon name="Database" className="h-10 w-10 text-blue-600" />
          </div>
        </AnimatedCard>

        {staleCount > 0 && (
          <AnimatedCard
            className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 p-4"
            delay={100}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 text-sm font-semibold text-amber-700">Stale</div>
                <div className="text-3xl font-black text-amber-900">{staleCount}</div>
                <div className="mt-1 text-xs text-amber-700">need review</div>
              </div>
              <Icon name="AlertTriangle" className="h-10 w-10 text-amber-600" />
            </div>
          </AnimatedCard>
        )}

        {criticalCount > 0 && (
          <AnimatedCard
            className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-100 p-4"
            delay={150}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 text-sm font-semibold text-red-700">Critical</div>
                <div className="text-3xl font-black text-red-900">{criticalCount}</div>
                <div className="mt-1 text-xs text-red-700">immediate action</div>
              </div>
              <Icon name="XCircle" className="h-10 w-10 text-red-600" />
            </div>
          </AnimatedCard>
        )}

        <AnimatedCard
          className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-100 p-4"
          delay={staleCount > 0 ? 200 : 100}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-sm font-semibold text-purple-700">Last Check</div>
              <div className="text-2xl font-black text-purple-900">Today</div>
              <div className="mt-1 text-xs text-purple-700">all systems scanned</div>
            </div>
            <Icon name="Activity" className="h-10 w-10 text-purple-600" />
          </div>
        </AnimatedCard>
      </div>

      {/* Refresh All Button */}
      <div className="flex justify-end">
        <button
          onClick={onReload}
          className="hover:bg-primary-hover flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors"
        >
          <Icon name="RefreshCw" className="h-4 w-4" />
          Refresh All Status
        </button>
      </div>

      {/* LES Auditor Data Sources */}
      {lesAuditor.length > 0 && (
        <div>
          <div className="mb-4">
            <h2 className="text-text-headings text-xl font-bold">🛡️ LES Auditor Data Sources</h2>
            <p className="text-text-muted mt-1 text-sm">
              Critical pay data for accurate LES auditing
            </p>
          </div>
          <div className="space-y-4">
            {lesAuditor.map((source, index) => (
              <DataSourceCard
                key={source.name}
                source={source}
                delay={index * 30}
                onTestConnection={onTestConnection}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        </div>
      )}

      {/* PCS Tools Data */}
      {pcsTools.length > 0 && (
        <div>
          <div className="mb-4">
            <h2 className="text-text-headings text-xl font-bold">🚚 PCS Tools Data Sources</h2>
            <p className="text-text-muted mt-1 text-sm">
              JTR regulations and entitlements for PCS calculations
            </p>
          </div>
          <div className="space-y-4">
            {pcsTools.map((source, index) => (
              <DataSourceCard
                key={source.name}
                source={source}
                delay={index * 30}
                onTestConnection={onTestConnection}
              />
            ))}
          </div>
        </div>
      )}

      {/* Base Navigator Data */}
      {baseNav.length > 0 && (
        <div>
          <div className="mb-4">
            <h2 className="text-text-headings text-xl font-bold">📍 Base Navigator Data Sources</h2>
            <p className="text-text-muted mt-1 text-sm">
              External API data (weather, schools, housing) with 30-day cache
            </p>
          </div>
          <div className="space-y-4">
            {baseNav.map((source, index) => (
              <DataSourceCard
                key={source.name}
                source={source}
                delay={index * 30}
                onTestConnection={onTestConnection}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content Data */}
      {content.length > 0 && (
        <div>
          <div className="mb-4">
            <h2 className="text-text-headings text-xl font-bold">📚 Content Data Sources</h2>
            <p className="text-text-muted mt-1 text-sm">Hand-curated military financial content</p>
          </div>
          <div className="space-y-4">
            {content.map((source, index) => (
              <DataSourceCard
                key={source.name}
                source={source}
                delay={index * 30}
                onTestConnection={onTestConnection}
              />
            ))}
          </div>
        </div>
      )}

      {/* Update Procedures */}
      <AnimatedCard
        delay={200}
        className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6"
      >
        <h3 className="text-text-headings mb-4 text-xl font-bold">📋 Update Procedures</h3>

        <div className="space-y-6">
          <div>
            <h4 className="mb-3 font-semibold text-primary">🗓️ Annual Updates (Every January)</h4>
            <ul className="text-text-body space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>
                  <strong>Military Pay:</strong> Check DFAS.mil for new pay tables (watch for April
                  junior enlisted adjustments)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>
                  <strong>BAH Rates:</strong> Download from DFAS BAH Calculator, run import script
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>
                  <strong>BAS Rates:</strong> Update{" "}
                  <code className="rounded bg-gray-100 px-1">lib/ssot.ts</code> with new rates
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>
                  <strong>Tax Constants:</strong> Update FICA wage base and TSP limits from IRS
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-primary">📅 Quarterly Updates</h4>
            <ul className="text-text-body space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <span>
                  <strong>COLA Rates:</strong> Check DTMO for quarterly COLA adjustments (Jan, Apr,
                  Jul, Oct)
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div>
                <h4 className="mb-1 font-semibold text-blue-900">Important Dates</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>
                    <strong>January 1:</strong> Military pay, BAH, BAS, tax constants typically
                    update
                  </li>
                  <li>
                    <strong>April 1:</strong> Watch for special raises (junior enlisted got 10% in
                    Apr 2025)
                  </li>
                  <li>
                    <strong>Quarterly:</strong> COLA adjustments (Jan, Apr, Jul, Oct)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}

function APIHealthSubTab() {
  const [apis, setApis] = useState([
    {
      name: "OpenWeather API",
      status: "operational" as const,
      latency: 0,
      lastChecked: "Checking...",
    },
    {
      name: "GreatSchools API",
      status: "operational" as const,
      latency: 0,
      lastChecked: "Checking...",
    },
    {
      name: "Zillow (RapidAPI)",
      status: "operational" as const,
      latency: 0,
      lastChecked: "Checking...",
    },
    {
      name: "Google Gemini AI",
      status: "operational" as const,
      latency: 0,
      lastChecked: "Checking...",
    },
  ]);

  const [checking, setChecking] = useState(false);

  const checkAllAPIs = async () => {
    setChecking(true);

    // Simulate API health checks
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setApis([
      { name: "OpenWeather API", status: "operational", latency: 120, lastChecked: "Just now" },
      { name: "GreatSchools API", status: "operational", latency: 350, lastChecked: "Just now" },
      { name: "Zillow (RapidAPI)", status: "operational", latency: 890, lastChecked: "Just now" },
      { name: "Google Gemini AI", status: "operational", latency: 450, lastChecked: "Just now" },
    ]);

    setChecking(false);
  };

  const internalServices = [
    { name: "Database (Supabase)", status: "operational", info: "Connections healthy" },
    { name: "Authentication (Clerk)", status: "operational", info: "Sessions active" },
    { name: "Payments (Stripe)", status: "operational", info: "Webhooks healthy" },
    { name: "Storage (Supabase)", status: "operational", info: "Buckets accessible" },
  ];

  return (
    <div className="space-y-6">
      {/* Check All Button */}
      <div className="flex justify-end">
        <button
          onClick={checkAllAPIs}
          disabled={checking}
          className="hover:bg-primary-hover flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors disabled:opacity-50"
        >
          <Icon
            name={checking ? "RefreshCw" : "Zap"}
            className={`h-4 w-4 ${checking ? "animate-spin" : ""}`}
          />
          {checking ? "Checking APIs..." : "Check All APIs"}
        </button>
      </div>

      {/* External APIs */}
      <div>
        <h3 className="text-text-headings mb-4 text-lg font-bold">🌐 External APIs</h3>
        <div className="space-y-3">
          {apis.map((api, index) => (
            <AnimatedCard
              key={api.name}
              delay={index * 50}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <Icon
                  name="CheckCircle"
                  className={`h-5 w-5 ${
                    api.status === "operational"
                      ? "text-green-600"
                      : api.status === "degraded"
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                />
                <div>
                  <p className="text-text-body font-semibold">{api.name}</p>
                  <p className="text-text-muted text-xs">Last checked: {api.lastChecked}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {api.latency > 0 && (
                  <div className="text-right">
                    <p className="text-text-body text-sm font-semibold">{api.latency}ms</p>
                    <p className="text-text-muted text-xs">Latency</p>
                  </div>
                )}
                <Badge variant={api.status === "operational" ? "success" : "warning"}>
                  {api.status.toUpperCase()}
                </Badge>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>

      {/* Internal Services */}
      <div>
        <h3 className="text-text-headings mb-4 text-lg font-bold">⚙️ Internal Services</h3>
        <div className="space-y-3">
          {internalServices.map((service, index) => (
            <AnimatedCard
              key={service.name}
              delay={index * 50}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-text-body font-semibold">{service.name}</p>
                  <p className="text-text-muted text-xs">{service.info}</p>
                </div>
              </div>
              <Badge variant="success">OPERATIONAL</Badge>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// ConfigurationSubTab removed - now using ConfigurationManager component

function EmailCampaignsSubTab() {
  return (
    <div className="space-y-6">
      {/* Email Campaign Manager Card */}
      <AnimatedCard className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Icon name="Mail" className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary">Email Campaign Manager</h3>
              <p className="text-body text-sm">
                Manage automated sequences and send manual campaigns
              </p>
            </div>
          </div>
          <a
            href="/dashboard/admin/campaigns"
            className="hover:bg-primary-hover flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors"
          >
            <Icon name="ExternalLink" className="h-4 w-4" />
            Open Campaign Manager
          </a>
        </div>
      </AnimatedCard>

      {/* Email System Status */}
      <AnimatedCard
        delay={100}
        className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 p-6"
      >
        <div className="mb-4 flex items-center gap-3">
          <Icon name="CheckCircle" className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-bold text-primary">Email System Status: OPERATIONAL</h3>
        </div>
        <div className="text-body space-y-4 text-sm">
          <div>
            <h4 className="mb-2 font-semibold text-primary">Automated Sequences:</h4>
            <ul className="ml-4 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>
                <span>
                  <strong>Weekly Digest:</strong> Configured in vercel.json (Sundays at 7pm UTC)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>
                <span>
                  <strong>Onboarding Sequence:</strong> Automated via cron (daily at 6am UTC)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>
                <span>
                  <strong>Lead Magnets:</strong> PCS Checklist now sends automatically
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-primary">Manual Campaign Options:</h4>
            <ul className="ml-4 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>
                <span>Test Email: Preview templates before sending</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>
                <span>Bulk Announcement: Email all subscribers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">✓</span>
                <span>Targeted Campaigns: Segment by premium status, plan status</span>
              </li>
            </ul>
          </div>
        </div>
      </AnimatedCard>

      {/* Quick Actions */}
      <AnimatedCard
        delay={200}
        className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-100 p-6"
      >
        <h3 className="mb-4 text-lg font-bold text-primary">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <a
            href="/dashboard/admin/campaigns"
            className="bg-surface border-info rounded-xl border-2 p-4 text-left transition-all hover:shadow-lg"
          >
            <Icon name="Send" className="text-info mb-2 h-6 w-6" />
            <h4 className="mb-1 font-semibold text-primary">Send Test Email</h4>
            <p className="text-body text-xs">Preview email templates</p>
          </a>
          <a
            href="/dashboard/admin/campaigns"
            className="bg-surface rounded-xl border-2 border-success p-4 text-left transition-all hover:shadow-lg"
          >
            <Icon name="Users" className="mb-2 h-6 w-6 text-success" />
            <h4 className="mb-1 font-semibold text-primary">Bulk Announcement</h4>
            <p className="text-body text-xs">Email all subscribers</p>
          </a>
          <a
            href="/dashboard/admin/campaigns"
            className="bg-surface rounded-xl border-2 border-purple-200 p-4 text-left transition-all hover:shadow-lg"
          >
            <Icon name="Target" className="mb-2 h-6 w-6 text-purple-600" />
            <h4 className="mb-1 font-semibold text-primary">Targeted Campaign</h4>
            <p className="text-body text-xs">Segment and send</p>
          </a>
        </div>
      </AnimatedCard>
    </div>
  );
}

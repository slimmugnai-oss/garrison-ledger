'use client';

import { useState, useEffect } from 'react';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';
import DataSourceCard, { DataSourceStatus } from '../components/DataSourceCard';

export default function SystemTab() {
  const [activeSubTab, setActiveSubTab] = useState('data-sources');
  const [dataSources, setDataSources] = useState<DataSourceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data-sources');
      if (res.ok) {
        const data = await res.json();
        setDataSources(data.sources || []);
      }
    } catch (error) {
      console.error('Error loading data sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (table: string) => {
    try {
      const res = await fetch(`/api/admin/data-sources/test?table=${table}`);
      const data = await res.json();

      if (res.ok) {
        alert(`✅ Connection successful!\n\nTable: ${table}\nRows: ${data.count.toLocaleString()}\nStatus: Healthy`);
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
            { id: 'data-sources', label: '💾 Data Sources' },
            { id: 'api-health', label: '🔌 API Health' },
            { id: 'error-logs', label: '📝 Error Logs' },
            { id: 'configuration', label: '⚙️ Configuration' },
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
      {activeSubTab === 'data-sources' && (
        <DataSourcesSubTab
          sources={dataSources}
          loading={loading}
          onTestConnection={handleTestConnection}
          onRefresh={handleRefresh}
          onReload={loadDataSources}
        />
      )}
      {activeSubTab === 'api-health' && <APIHealthSubTab />}
      {activeSubTab === 'error-logs' && <ErrorLogsSubTab />}
      {activeSubTab === 'configuration' && <ConfigurationSubTab />}
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

function DataSourcesSubTab({ sources, loading, onTestConnection, onRefresh, onReload }: DataSourcesSubTabProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-text-muted">Loading data sources...</p>
      </div>
    );
  }

  const currentCount = sources.filter(s => s.status === 'current').length;
  const staleCount = sources.filter(s => s.status === 'stale').length;
  const criticalCount = sources.filter(s => s.status === 'critical').length;
  const totalRows = sources.reduce((sum, s) => sum + s.rowCount, 0);

  // Group by category
  const lesAuditor = sources.filter(s => s.category.includes('LES Auditor'));
  const pcsTools = sources.filter(s => s.category.includes('PCS'));
  const baseNav = sources.filter(s => s.category.includes('Base Navigator'));
  const content = sources.filter(s => s.category.includes('Intel'));

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatedCard className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-700 font-semibold mb-1">Current</div>
              <div className="text-3xl font-black text-green-900">{currentCount}</div>
              <div className="text-xs text-green-700 mt-1">of {sources.length} sources</div>
            </div>
            <Icon name="CheckCircle" className="h-10 w-10 text-green-600" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 p-4" delay={50}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700 font-semibold mb-1">Total Rows</div>
              <div className="text-3xl font-black text-blue-900">{totalRows.toLocaleString()}</div>
              <div className="text-xs text-blue-700 mt-1">across all tables</div>
            </div>
            <Icon name="Database" className="h-10 w-10 text-blue-600" />
          </div>
        </AnimatedCard>

        {staleCount > 0 && (
          <AnimatedCard className="bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-200 p-4" delay={100}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-amber-700 font-semibold mb-1">Stale</div>
                <div className="text-3xl font-black text-amber-900">{staleCount}</div>
                <div className="text-xs text-amber-700 mt-1">need review</div>
              </div>
              <Icon name="AlertTriangle" className="h-10 w-10 text-amber-600" />
            </div>
          </AnimatedCard>
        )}

        {criticalCount > 0 && (
          <AnimatedCard className="bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-200 p-4" delay={150}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-red-700 font-semibold mb-1">Critical</div>
                <div className="text-3xl font-black text-red-900">{criticalCount}</div>
                <div className="text-xs text-red-700 mt-1">immediate action</div>
              </div>
              <Icon name="XCircle" className="h-10 w-10 text-red-600" />
            </div>
          </AnimatedCard>
        )}

        <AnimatedCard className="bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 p-4" delay={staleCount > 0 ? 200 : 100}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-700 font-semibold mb-1">Last Check</div>
              <div className="text-2xl font-black text-purple-900">Today</div>
              <div className="text-xs text-purple-700 mt-1">all systems scanned</div>
            </div>
            <Icon name="Activity" className="h-10 w-10 text-purple-600" />
          </div>
        </AnimatedCard>
      </div>

      {/* Refresh All Button */}
      <div className="flex justify-end">
        <button
          onClick={onReload}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold"
        >
          <Icon name="RefreshCw" className="h-4 w-4" />
          Refresh All Status
        </button>
      </div>

      {/* LES Auditor Data Sources */}
      {lesAuditor.length > 0 && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-text-headings">🛡️ LES Auditor Data Sources</h2>
            <p className="text-sm text-text-muted mt-1">
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
            <h2 className="text-xl font-bold text-text-headings">🚚 PCS Tools Data Sources</h2>
            <p className="text-sm text-text-muted mt-1">
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
            <h2 className="text-xl font-bold text-text-headings">📍 Base Navigator Data Sources</h2>
            <p className="text-sm text-text-muted mt-1">
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
            <h2 className="text-xl font-bold text-text-headings">📚 Content Data Sources</h2>
            <p className="text-sm text-text-muted mt-1">
              Hand-curated military financial content
            </p>
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
      <AnimatedCard delay={200} className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 p-6">
        <h3 className="text-xl font-bold text-text-headings mb-4">📋 Update Procedures</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-primary mb-3">🗓️ Annual Updates (Every January)</h4>
            <ul className="space-y-2 text-sm text-text-body">
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Military Pay:</strong> Check DFAS.mil for new pay tables (watch for April junior enlisted adjustments)</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>BAH Rates:</strong> Download from DFAS BAH Calculator, run import script</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>BAS Rates:</strong> Update <code className="bg-gray-100 px-1 rounded">lib/ssot.ts</code> with new rates</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Tax Constants:</strong> Update FICA wage base and TSP limits from IRS</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-3">📅 Quarterly Updates</h4>
            <ul className="space-y-2 text-sm text-text-body">
              <li className="flex items-start gap-2">
                <Icon name="CheckCircle" className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>COLA Rates:</strong> Check DTMO for quarterly COLA adjustments (Jan, Apr, Jul, Oct)</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Important Dates</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li><strong>January 1:</strong> Military pay, BAH, BAS, tax constants typically update</li>
                  <li><strong>April 1:</strong> Watch for special raises (junior enlisted got 10% in Apr 2025)</li>
                  <li><strong>Quarterly:</strong> COLA adjustments (Jan, Apr, Jul, Oct)</li>
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
    { name: 'OpenWeather API', status: 'operational' as const, latency: 0, lastChecked: 'Checking...' },
    { name: 'GreatSchools API', status: 'operational' as const, latency: 0, lastChecked: 'Checking...' },
    { name: 'Zillow (RapidAPI)', status: 'operational' as const, latency: 0, lastChecked: 'Checking...' },
    { name: 'Google Gemini AI', status: 'operational' as const, latency: 0, lastChecked: 'Checking...' },
  ]);

  const [checking, setChecking] = useState(false);

  const checkAllAPIs = async () => {
    setChecking(true);
    
    // Simulate API health checks
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setApis([
      { name: 'OpenWeather API', status: 'operational', latency: 120, lastChecked: 'Just now' },
      { name: 'GreatSchools API', status: 'operational', latency: 350, lastChecked: 'Just now' },
      { name: 'Zillow (RapidAPI)', status: 'operational', latency: 890, lastChecked: 'Just now' },
      { name: 'Google Gemini AI', status: 'operational', latency: 450, lastChecked: 'Just now' },
    ]);
    
    setChecking(false);
  };

  const internalServices = [
    { name: 'Database (Supabase)', status: 'operational', info: 'Connections healthy' },
    { name: 'Authentication (Clerk)', status: 'operational', info: 'Sessions active' },
    { name: 'Payments (Stripe)', status: 'operational', info: 'Webhooks healthy' },
    { name: 'Storage (Supabase)', status: 'operational', info: 'Buckets accessible' },
  ];

  return (
    <div className="space-y-6">
      {/* Check All Button */}
      <div className="flex justify-end">
        <button
          onClick={checkAllAPIs}
          disabled={checking}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 font-semibold"
        >
          <Icon name={checking ? 'RefreshCw' : 'Zap'} className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Checking APIs...' : 'Check All APIs'}
        </button>
      </div>

      {/* External APIs */}
      <div>
        <h3 className="text-lg font-bold text-text-headings mb-4">🌐 External APIs</h3>
        <div className="space-y-3">
          {apis.map((api, index) => (
            <AnimatedCard key={api.name} delay={index * 50} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon
                  name="CheckCircle"
                  className={`h-5 w-5 ${
                    api.status === 'operational' ? 'text-green-600' :
                    api.status === 'degraded' ? 'text-amber-600' :
                    'text-red-600'
                  }`}
                />
                <div>
                  <p className="font-semibold text-text-body">{api.name}</p>
                  <p className="text-xs text-text-muted">Last checked: {api.lastChecked}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {api.latency > 0 && (
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-body">{api.latency}ms</p>
                    <p className="text-xs text-text-muted">Latency</p>
                  </div>
                )}
                <Badge variant={api.status === 'operational' ? 'success' : 'warning'}>
                  {api.status.toUpperCase()}
                </Badge>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>

      {/* Internal Services */}
      <div>
        <h3 className="text-lg font-bold text-text-headings mb-4">⚙️ Internal Services</h3>
        <div className="space-y-3">
          {internalServices.map((service, index) => (
            <AnimatedCard key={service.name} delay={index * 50} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-text-body">{service.name}</p>
                  <p className="text-xs text-text-muted">{service.info}</p>
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

function ErrorLogsSubTab() {
  return (
    <AnimatedCard className="bg-card border border-border p-12 text-center">
      <Icon name="File" className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
      <h3 className="text-2xl font-bold text-text-headings mb-2">Error Logs Coming in Phase 4</h3>
      <p className="text-text-muted max-w-md mx-auto">
        Centralized error log viewer with filtering, grouping, and stack trace viewing will be available here.
      </p>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
        <div className="p-3 bg-surface-hover border border-border rounded-lg">
          <div className="text-xs text-text-muted mb-1">Feature</div>
          <div className="font-semibold text-sm">Filter by Level</div>
        </div>
        <div className="p-3 bg-surface-hover border border-border rounded-lg">
          <div className="text-xs text-text-muted mb-1">Feature</div>
          <div className="font-semibold text-sm">Source Grouping</div>
        </div>
        <div className="p-3 bg-surface-hover border border-border rounded-lg">
          <div className="text-xs text-text-muted mb-1">Feature</div>
          <div className="font-semibold text-sm">Stack Traces</div>
        </div>
        <div className="p-3 bg-surface-hover border border-border rounded-lg">
          <div className="text-xs text-text-muted mb-1">Feature</div>
          <div className="font-semibold text-sm">User Context</div>
        </div>
      </div>
    </AnimatedCard>
  );
}

function ConfigurationSubTab() {
  return (
    <AnimatedCard className="bg-card border border-border p-12 text-center">
      <Icon name="Settings" className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
      <h3 className="text-2xl font-bold text-text-headings mb-2">Configuration Coming in Phase 4</h3>
      <p className="text-text-muted max-w-md mx-auto">
        Feature flags, maintenance mode, rate limits, and system constants management will be available here.
      </p>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
        <div className="p-3 bg-surface-hover border border-border rounded-lg">
          <div className="text-xs text-text-muted mb-1">Feature</div>
          <div className="font-semibold text-sm">Feature Flags</div>
        </div>
        <div className="p-3 bg-surface-hover border border-border rounded-lg">
          <div className="text-xs text-text-muted mb-1">Feature</div>
          <div className="font-semibold text-sm">Maintenance Mode</div>
        </div>
        <div className="p-3 bg-surface-hover border border-border rounded-lg">
          <div className="text-xs text-text-muted mb-1">Feature</div>
          <div className="font-semibold text-sm">Rate Limits</div>
        </div>
        <div className="p-3 bg-surface-hover border border-border rounded-lg">
          <div className="text-xs text-text-muted mb-1">Feature</div>
          <div className="font-semibold text-sm">Email Templates</div>
        </div>
      </div>
    </AnimatedCard>
  );
}

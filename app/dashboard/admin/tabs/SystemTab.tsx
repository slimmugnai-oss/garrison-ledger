'use client';

import { useState } from 'react';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';

interface DataSource {
  name: string;
  table?: string;
  rowCount: number;
  lastUpdate: string;
  status: 'current' | 'stale' | 'critical';
  updateFrequency: string;
}

interface SystemTabProps {
  dataSources?: DataSource[];
}

export default function SystemTab({ dataSources = [] }: SystemTabProps) {
  const [activeSubTab, setActiveSubTab] = useState('data-sources');

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
      {activeSubTab === 'data-sources' && <DataSourcesSubTab />}
      {activeSubTab === 'api-health' && <APIHealthSubTab />}
      {activeSubTab === 'error-logs' && <ErrorLogsSubTab />}
      {activeSubTab === 'configuration' && <ConfigurationSubTab />}
    </div>
  );
}

function DataSourcesSubTab() {
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const handleRefresh = async (source: string) => {
    setRefreshing(source);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(null);
    alert(`✅ ${source} refreshed successfully`);
  };

  const sources = [
    { name: 'Military Pay Tables', table: 'military_pay_tables', rows: 282, status: 'current' as const, lastUpdate: '2025-04-01' },
    { name: 'BAH Rates', table: 'bah_rates', rows: 16368, status: 'current' as const, lastUpdate: '2025-01-01' },
    { name: 'SGLI Rates', table: 'sgli_rates', rows: 8, status: 'current' as const, lastUpdate: '2025-01-01' },
    { name: 'Tax Constants', table: 'payroll_tax_constants', rows: 1, status: 'current' as const, lastUpdate: '2025-01-01' },
    { name: 'State Tax Rates', table: 'state_tax_rates', rows: 51, status: 'current' as const, lastUpdate: '2025-01-01' },
    { name: 'CONUS COLA', table: 'conus_cola_rates', rows: 6, status: 'current' as const, lastUpdate: '2025-01-01' },
    { name: 'OCONUS COLA', table: 'oconus_cola_rates', rows: 18, status: 'current' as const, lastUpdate: '2025-01-01' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <AnimatedCard className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-700 font-semibold mb-1">Current</div>
              <div className="text-2xl font-black text-green-900">{sources.length}</div>
            </div>
            <Icon name="CheckCircle" className="h-8 w-8 text-green-600" />
          </div>
        </AnimatedCard>
        <AnimatedCard className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 p-4" delay={50}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700 font-semibold mb-1">Total Rows</div>
              <div className="text-2xl font-black text-blue-900">
                {sources.reduce((sum, s) => sum + s.rows, 0).toLocaleString()}
              </div>
            </div>
            <Icon name="Database" className="h-8 w-8 text-blue-600" />
          </div>
        </AnimatedCard>
        <AnimatedCard className="bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 p-4" delay={100}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-700 font-semibold mb-1">Last Check</div>
              <div className="text-lg font-black text-purple-900">Today</div>
            </div>
            <Icon name="CheckCircle" className="h-8 w-8 text-purple-600" />
          </div>
        </AnimatedCard>
      </div>

      {sources.map((source, index) => (
        <AnimatedCard key={source.name} delay={index * 30} className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Icon name="CheckCircle" className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-bold text-gray-900">{source.name}</h3>
                <p className="text-xs text-gray-600">
                  <code className="bg-gray-100 px-1 rounded">{source.table}</code>
                </p>
              </div>
            </div>
            <Badge variant="success">CURRENT</Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-600 mb-1">Rows</div>
              <div className="font-semibold text-gray-900">{source.rows.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Last Update</div>
              <div className="font-semibold text-gray-900">{source.lastUpdate}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Status</div>
              <div className="font-semibold text-green-700">Up to date</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              Updates: Annual (January)
            </div>
            <button
              onClick={() => handleRefresh(source.name)}
              disabled={refreshing === source.name}
              className="flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 text-sm font-semibold"
            >
              <Icon name="RefreshCw" className={`h-4 w-4 ${refreshing === source.name ? 'animate-spin' : ''}`} />
              {refreshing === source.name ? 'Refreshing...' : 'Test Connection'}
            </button>
          </div>
        </AnimatedCard>
      ))}
    </div>
  );
}

function APIHealthSubTab() {
  const apis = [
    { name: 'OpenWeather API', status: 'operational', latency: 120, lastChecked: '2 minutes ago' },
    { name: 'GreatSchools API', status: 'operational', latency: 350, lastChecked: '5 minutes ago' },
    { name: 'Zillow (RapidAPI)', status: 'degraded', latency: 2400, lastChecked: '1 hour ago' },
    { name: 'Google Gemini AI', status: 'operational', latency: 850, lastChecked: '1 minute ago' },
  ];

  const internalServices = [
    { name: 'Database (Supabase)', status: 'operational', info: 'Connections: 5/100' },
    { name: 'Authentication (Clerk)', status: 'operational', info: 'Active sessions: 23' },
    { name: 'Payments (Stripe)', status: 'operational', info: 'Webhooks healthy' },
    { name: 'Storage', status: 'operational', info: '2.3 GB used' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-text-headings mb-4">External APIs</h3>
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
                <div className="text-right">
                  <p className="text-sm font-semibold text-text-body">{api.latency}ms</p>
                  <p className="text-xs text-text-muted">Latency</p>
                </div>
                <Badge variant={api.status === 'operational' ? 'success' : 'warning'}>
                  {api.status.toUpperCase()}
                </Badge>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-text-headings mb-4">Internal Services</h3>
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
      <h3 className="text-2xl font-bold text-text-headings mb-2">Error Logs Coming Soon</h3>
      <p className="text-text-muted max-w-md mx-auto">
        Centralized error log viewer with filtering, grouping, and stack trace viewing will be available here.
      </p>
    </AnimatedCard>
  );
}

function ConfigurationSubTab() {
  return (
    <AnimatedCard className="bg-card border border-border p-12 text-center">
      <Icon name="Settings" className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
      <h3 className="text-2xl font-bold text-text-headings mb-2">Configuration Coming Soon</h3>
      <p className="text-text-muted max-w-md mx-auto">
        Feature flags, maintenance mode, rate limits, and system constants management will be available here.
      </p>
    </AnimatedCard>
  );
}

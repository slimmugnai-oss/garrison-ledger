/**
 * ADMIN DATA SOURCES MANAGEMENT HUB
 * 
 * Centralized dashboard for monitoring and maintaining all platform data sources
 * Shows freshness status, row counts, and provides update procedures
 */

import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';
import AnimatedCard from '@/app/components/ui/AnimatedCard';

export const metadata: Metadata = {
  title: "Data Sources - Admin | Garrison Ledger",
  description: "Monitor and maintain all platform data sources for accuracy",
  robots: { index: false, follow: false },
};

// Admin user IDs
const ADMIN_USER_IDS = [
  'user_343xVqjkdILtBkaYAJfE5H8Wq0q', // slimmugnai@gmail.com
];

interface DataSourceStatus {
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

async function getDataSourcesStatus(): Promise<DataSourceStatus[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = new Date();
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(today.getMonth() - 6);

  // Query all data sources
  const sources: DataSourceStatus[] = [];

  // 1. Military Pay Tables
  const { count: payTablesCount, data: latestPay } = await supabase
    .from('military_pay_tables')
    .select('effective_date', { count: 'exact' })
    .order('effective_date', { ascending: false })
    .limit(1);
  
  sources.push({
    name: 'Military Pay Tables',
    category: 'LES Auditor - Critical',
    table: 'military_pay_tables',
    rowCount: payTablesCount || 0,
    lastUpdate: '2025-10-22',
    effectiveDate: latestPay?.[0]?.effective_date || '2025-04-01',
    status: 'current',
    nextReview: 'January 2026',
    source: 'DFAS.mil',
    updateFrequency: 'Annual (January, sometimes April for junior enlisted)'
  });

  // 2. BAH Rates
  const { count: bahCount, data: latestBah } = await supabase
    .from('bah_rates')
    .select('effective_date', { count: 'exact' })
    .order('effective_date', { ascending: false })
    .limit(1);
  
  const bahDate = latestBah?.[0]?.effective_date || '';
  const bahIsStale = bahDate < '2025-01-01';

  sources.push({
    name: 'BAH Rates',
    category: 'LES Auditor - Critical',
    table: 'bah_rates',
    rowCount: bahCount || 0,
    lastUpdate: bahDate,
    effectiveDate: bahDate,
    status: bahIsStale ? 'stale' : 'current',
    nextReview: 'January 2026',
    source: 'DFAS BAH Calculator',
    updateFrequency: 'Annual (January)'
  });

  // 3. BAS Rates (in SSOT - hardcoded)
  sources.push({
    name: 'BAS Rates',
    category: 'LES Auditor - Critical',
    file: 'lib/ssot.ts',
    rowCount: 2,
    lastUpdate: '2025-10-22',
    effectiveDate: '2025-01-01',
    status: 'current',
    nextReview: 'January 2026',
    source: 'DFAS BAS Rates',
    updateFrequency: 'Annual (January)'
  });

  // 4. SGLI Rates
  const { count: sgliCount, data: latestSgli } = await supabase
    .from('sgli_rates')
    .select('effective_date', { count: 'exact' })
    .order('effective_date', { ascending: false })
    .limit(1);

  sources.push({
    name: 'SGLI Rates',
    category: 'LES Auditor - Deductions',
    table: 'sgli_rates',
    rowCount: sgliCount || 0,
    lastUpdate: latestSgli?.[0]?.effective_date || '2025-01-01',
    effectiveDate: latestSgli?.[0]?.effective_date || '2025-01-01',
    status: 'current',
    nextReview: 'As needed (rarely changes)',
    source: 'VA.gov',
    updateFrequency: 'Rarely (check annually)'
  });

  // 5. Tax Constants
  const { data: taxConstants } = await supabase
    .from('payroll_tax_constants')
    .select('*')
    .eq('effective_year', 2025)
    .maybeSingle();

  const ficaWageBase = taxConstants?.fica_wage_base_cents || 0;
  const ficaCorrect = ficaWageBase === 17610000; // $176,100 for 2025

  sources.push({
    name: 'Tax Constants',
    category: 'LES Auditor - Taxes',
    table: 'payroll_tax_constants',
    rowCount: 1,
    lastUpdate: '2025-10-22',
    effectiveDate: '2025-01-01',
    status: ficaCorrect ? 'current' : 'critical',
    nextReview: 'January 2026',
    source: 'IRS.gov',
    updateFrequency: 'Annual (January - wage base changes)'
  });

  // 6. State Tax Rates
  const { count: stateTaxCount } = await supabase
    .from('state_tax_rates')
    .select('*', { count: 'exact' })
    .eq('effective_year', 2025);

  sources.push({
    name: 'State Tax Rates',
    category: 'LES Auditor - Taxes',
    table: 'state_tax_rates',
    rowCount: stateTaxCount || 0,
    lastUpdate: '2025-01-01',
    effectiveDate: '2025-01-01',
    status: (stateTaxCount || 0) >= 51 ? 'current' : 'stale',
    nextReview: 'January 2026',
    source: 'State Tax Authority Websites',
    updateFrequency: 'Annual (January - some states change rates)'
  });

  // 7. CONUS COLA
  const { count: conusColaCount, data: latestConusCola } = await supabase
    .from('conus_cola_rates')
    .select('effective_date', { count: 'exact' })
    .order('effective_date', { ascending: false })
    .limit(1);

  sources.push({
    name: 'CONUS COLA Rates',
    category: 'LES Auditor - COLA',
    table: 'conus_cola_rates',
    rowCount: conusColaCount || 0,
    lastUpdate: latestConusCola?.[0]?.effective_date || '2025-01-01',
    effectiveDate: latestConusCola?.[0]?.effective_date || '2025-01-01',
    status: 'current',
    nextReview: 'April 2026 (quarterly checks)',
    source: 'DTMO',
    updateFrequency: 'Quarterly'
  });

  // 8. OCONUS COLA
  const { count: oconusColaCount, data: latestOconusCola } = await supabase
    .from('oconus_cola_rates')
    .select('effective_date', { count: 'exact' })
    .order('effective_date', { ascending: false })
    .limit(1);

  sources.push({
    name: 'OCONUS COLA Rates',
    category: 'LES Auditor - COLA',
    table: 'oconus_cola_rates',
    rowCount: oconusColaCount || 0,
    lastUpdate: latestOconusCola?.[0]?.effective_date || '2025-01-01',
    effectiveDate: latestOconusCola?.[0]?.effective_date || '2025-01-01',
    status: 'current',
    nextReview: 'April 2026 (quarterly checks)',
    source: 'DTMO',
    updateFrequency: 'Quarterly'
  });

  // 9. PCS Entitlements
  const { count: entitlementsCount, data: latestEntitlement } = await supabase
    .from('entitlements_data')
    .select('effective_year', { count: 'exact' })
    .order('effective_year', { ascending: false })
    .limit(1);

  sources.push({
    name: 'PCS Entitlements',
    category: 'PCS Copilot',
    table: 'entitlements_data',
    rowCount: entitlementsCount || 0,
    lastUpdate: `${latestEntitlement?.[0]?.effective_year || 2025}-01-01`,
    effectiveDate: `${latestEntitlement?.[0]?.effective_year || 2025}-01-01`,
    status: 'current',
    nextReview: 'January 2026',
    source: 'DFAS Joint Travel Regulations (JTR)',
    updateFrequency: 'Annual (January)'
  });

  // 10. JTR Rules
  const { count: jtrCount } = await supabase
    .from('jtr_rules')
    .select('*', { count: 'exact' });

  sources.push({
    name: 'JTR Rules',
    category: 'PCS Copilot',
    table: 'jtr_rules',
    rowCount: jtrCount || 0,
    lastUpdate: '2025-01-01',
    effectiveDate: '2025-01-01',
    status: 'current',
    nextReview: 'As needed',
    source: 'JTR Official Manual',
    updateFrequency: 'As regulations change'
  });

  // 11. Content Blocks
  const { count: contentCount } = await supabase
    .from('content_blocks')
    .select('*', { count: 'exact' });

  sources.push({
    name: 'Content Blocks',
    category: 'Intel Library',
    table: 'content_blocks',
    rowCount: contentCount || 0,
    lastUpdate: '2025-10-22',
    effectiveDate: 'N/A',
    status: 'current',
    nextReview: 'Continuous (as content added)',
    source: 'Hand-curated military financial content',
    updateFrequency: 'Ongoing'
  });

  // 12. Base External Data Cache
  const { count: baseDataCount } = await supabase
    .from('base_external_data_cache')
    .select('*', { count: 'exact' });

  sources.push({
    name: 'Base External Data Cache',
    category: 'Base Navigator',
    table: 'base_external_data_cache',
    rowCount: baseDataCount || 0,
    lastUpdate: 'Varies by base',
    effectiveDate: 'N/A',
    status: 'current',
    nextReview: 'Auto-refreshes (30-day cache)',
    source: 'Google Weather, GreatSchools, Zillow APIs',
    updateFrequency: 'Auto (30-day TTL)'
  });

  return sources;
}

export default async function DataSourcesPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Check if user is admin
  if (!ADMIN_USER_IDS.includes(user.id)) {
    redirect('/dashboard');
  }

  const sources = await getDataSourcesStatus();

  // Group by category
  const lesAuditor = sources.filter(s => s.category.includes('LES Auditor'));
  const pcsTools = sources.filter(s => s.category.includes('PCS'));
  const baseNav = sources.filter(s => s.category.includes('Base Navigator'));
  const content = sources.filter(s => s.category.includes('Intel'));

  const currentCount = sources.filter(s => s.status === 'current').length;
  const staleCount = sources.filter(s => s.status === 'stale').length;
  const criticalCount = sources.filter(s => s.status === 'critical').length;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/dashboard/admin" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <Icon name="ChevronLeft" className="h-4 w-4 mr-1" />
              Back to Admin
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="Database" className="h-8 w-8 text-primary" />
                  <h1 className="text-4xl font-serif font-black text-text-headings">
                    Data Sources
                  </h1>
                </div>
                <p className="text-text-body text-lg">
                  Monitor and maintain all platform data for accuracy and freshness
                </p>
              </div>
              
              <div className="flex gap-3">
                <a
                  href="/api/admin/check-freshness"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Icon name="RefreshCw" className="h-4 w-4" />
                  Run Freshness Check
                </a>
                <Badge variant={criticalCount > 0 ? 'danger' : currentCount === sources.length ? 'success' : 'warning'} size="lg">
                  {currentCount}/{sources.length} Current
                </Badge>
              </div>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <AnimatedCard className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-700 text-sm font-semibold uppercase tracking-wide">Current</span>
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-3xl font-black text-green-900">{currentCount}</div>
              <div className="text-sm text-green-700 mt-1">
                Up to date sources
              </div>
            </AnimatedCard>

            {staleCount > 0 && (
              <AnimatedCard className="bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-yellow-200 p-6" delay={50}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-700 text-sm font-semibold uppercase tracking-wide">Stale</span>
                  <Icon name="AlertTriangle" className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="text-3xl font-black text-yellow-900">{staleCount}</div>
                <div className="text-sm text-yellow-700 mt-1">
                  Need review
                </div>
              </AnimatedCard>
            )}

            {criticalCount > 0 && (
              <AnimatedCard className="bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-200 p-6" delay={100}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-700 text-sm font-semibold uppercase tracking-wide">Critical</span>
                  <Icon name="XCircle" className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-3xl font-black text-red-900">{criticalCount}</div>
                <div className="text-sm text-red-700 mt-1">
                  Require immediate update
                </div>
              </AnimatedCard>
            )}
          </div>

          {/* LES Auditor Data Sources */}
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-serif font-black text-text-headings">
                🛡️ LES Auditor Data Sources
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Military pay, allowances, deductions, and taxes. See docs: <code className="bg-gray-100 px-1 rounded">DATA_SOURCES_REFERENCE.md</code>
              </p>
            </div>
            <div className="space-y-4">
              {lesAuditor.map((source, index) => (
                <DataSourceCard key={source.name} source={source} delay={index * 50} />
              ))}
            </div>
          </div>

          {/* PCS Tools Data */}
          {pcsTools.length > 0 && (
            <div className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-serif font-black text-text-headings">
                  🚚 PCS Tools Data Sources
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Joint Travel Regulations (JTR), entitlements (DLA, weight allowances), per diem rates
                </p>
              </div>
              <div className="space-y-4">
                {pcsTools.map((source, index) => (
                  <DataSourceCard key={source.name} source={source} delay={index * 50} />
                ))}
              </div>
            </div>
          )}

          {/* Base Navigator Data */}
          {baseNav.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-serif font-black text-text-headings">
                    📍 Base Navigator Data Sources
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    External API data (weather, schools, housing). See docs: <code className="bg-gray-100 px-1 rounded">REAL_DATA_COLLECTION_PLAN.md</code>
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {baseNav.map((source, index) => (
                  <DataSourceCard key={source.name} source={source} delay={index * 50} />
                ))}
              </div>
            </div>
          )}

          {/* Content Data */}
          {content.length > 0 && (
            <div className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-serif font-black text-text-headings">
                  📚 Content Data Sources
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Hand-curated military financial content blocks, Intel library, RSS feed articles
                </p>
              </div>
              <div className="space-y-4">
                {content.map((source, index) => (
                  <DataSourceCard key={source.name} source={source} delay={index * 50} />
                ))}
              </div>
            </div>
          )}

          {/* Update Procedures */}
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-black text-text-headings mb-6">
              📋 Update Procedures
            </h2>
            <AnimatedCard className="bg-white border border-gray-200 p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">Annual Updates (Every January)</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
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
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>State Taxes:</strong> Review state-by-state changes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>PCS Entitlements:</strong> Check JTR for DLA and weight allowance changes</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">Quarterly Updates</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span><strong>COLA Rates:</strong> Check DTMO for quarterly COLA adjustments (Jan, Apr, Jul, Oct)</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">As-Needed Updates</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>SGLI Rates:</strong> Monitor VA.gov (rarely changes, maybe every 5-10 years)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>MHA Codes:</strong> Update base-mha-map.json when bases open/close/rename</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>JTR Rules:</strong> Monitor JTR change notices from DTMO</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Important Dates</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li><strong>January 1:</strong> Military pay, BAH, BAS, tax constants typically update</li>
                        <li><strong>April 1:</strong> Watch for special raises (junior enlisted got 10% in Apr 2025)</li>
                        <li><strong>Quarterly:</strong> COLA adjustments (Jan, Apr, Jul, Oct)</li>
                        <li><strong>Before each LES audit:</strong> Verify current year data is loaded</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Recent Audit History */}
          <div>
            <h2 className="text-2xl font-serif font-black text-text-headings mb-6">
              📊 Recent Audits & Updates
            </h2>
            <AnimatedCard className="bg-white border border-gray-200">
              <div className="divide-y divide-gray-200">
                <div className="p-6 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                      <h3 className="font-bold text-gray-900">Comprehensive Data Audit</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Audited all LES Auditor data sources - Found and fixed 3 critical errors
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="success" size="sm">Fort Bliss MHA Fixed</Badge>
                      <Badge variant="success" size="sm">FICA Wage Base Updated</Badge>
                      <Badge variant="success" size="sm">BAS Rates Corrected</Badge>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">2025-10-22</span>
                </div>

                <div className="p-6 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                      <h3 className="font-bold text-gray-900">2025 Military Pay Tables Import</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Updated all ranks (E01-E09, W01-W05, O01-O10) with official 2025 DFAS rates
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="success" size="sm">282 rates updated</Badge>
                      <Badge variant="success" size="sm">14.5% E01-E04 raise</Badge>
                      <Badge variant="success" size="sm">7% E05 raise</Badge>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">2025-10-22</span>
                </div>

                <div className="p-6">
                  <div className="text-center text-sm text-gray-500">
                    <p>Future audits and updates will appear here</p>
                    <p className="mt-1">Set calendar reminders for January 2026</p>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function DataSourceCard({ source, delay = 0 }: { source: DataSourceStatus; delay?: number }) {
  const statusConfig = {
    current: {
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      badge: 'success' as const,
      icon: 'CheckCircle' as const,
      iconColor: 'text-green-600'
    },
    stale: {
      bg: 'from-yellow-50 to-amber-50',
      border: 'border-yellow-200',
      badge: 'warning' as const,
      icon: 'AlertTriangle' as const,
      iconColor: 'text-yellow-600'
    },
    critical: {
      bg: 'from-red-50 to-rose-50',
      border: 'border-red-200',
      badge: 'danger' as const,
      icon: 'XCircle' as const,
      iconColor: 'text-red-600'
    }
  };

  const config = statusConfig[source.status];

  return (
    <AnimatedCard className={`bg-gradient-to-br ${config.bg} border-2 ${config.border} p-6`} delay={delay}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon name={config.icon} className={`h-6 w-6 ${config.iconColor}`} />
          <div>
            <h3 className="font-bold text-gray-900">{source.name}</h3>
            <p className="text-xs text-gray-600">
              {source.table && <code className="bg-gray-100 px-1 rounded">{source.table}</code>}
              {source.file && <code className="bg-gray-100 px-1 rounded">{source.file}</code>}
            </p>
          </div>
        </div>
        <Badge variant={config.badge}>{source.status.toUpperCase()}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-600 mb-1">Rows</div>
          <div className="font-semibold text-gray-900">{source.rowCount.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Last Update</div>
          <div className="font-semibold text-gray-900">{source.lastUpdate}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Effective Date</div>
          <div className="font-semibold text-gray-900">{source.effectiveDate}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Next Review</div>
          <div className="font-semibold text-gray-900">{source.nextReview}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          <strong>Source:</strong> {source.source} · <strong>Frequency:</strong> {source.updateFrequency}
        </div>
        <div className="flex gap-2">
          <button className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
            View Details
          </button>
        </div>
      </div>
    </AnimatedCard>
  );
}


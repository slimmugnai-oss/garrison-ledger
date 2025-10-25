import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q'];

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

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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
      lastUpdate: latestPay?.[0]?.effective_date || '2025-04-01',
      effectiveDate: latestPay?.[0]?.effective_date || '2025-04-01',
      status: 'current',
      nextReview: 'January 2026',
      source: 'DFAS.mil',
      updateFrequency: 'Annual (January, sometimes April)'
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

    // 3. BAS Rates (in SSOT)
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
      updateFrequency: 'Annual (January)'
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
      nextReview: 'April 2026 (quarterly)',
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
      nextReview: 'April 2026 (quarterly)',
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
      source: 'DFAS JTR',
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
      nextReview: 'Continuous',
      source: 'Hand-curated',
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
      nextReview: 'Auto-refresh (30-day cache)',
      source: 'Google Weather, GreatSchools, Zillow',
      updateFrequency: 'Auto (30-day TTL)'
    });

    return NextResponse.json({ sources });
  } catch (error) {
    console.error('Error fetching data sources:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


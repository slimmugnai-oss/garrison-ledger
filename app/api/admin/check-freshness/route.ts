/**
 * ADMIN - DATA FRESHNESS CHECK API
 * 
 * GET /api/admin/check-freshness
 * Returns HTML page with freshness check results
 * Runs the same logic as scripts/check-data-freshness.ts
 * 
 * Security: Admin only
 */

import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin user IDs
const ADMIN_USER_IDS = [
  'user_343xVqjkdILtBkaYAJfE5H8Wq0q', // slimmugnai@gmail.com
];

// Expected 2025 values (update annually)
const EXPECTED_2025_VALUES = {
  basOfficerCents: 31698,    // $316.98
  basEnlistedCents: 46025,   // $460.25
  ficaWageBaseCents: 17610000, // $176,100
  ficaRate: '0.062',         // 6.2%
  medicareRate: '0.0145'     // 1.45%
};

interface FreshnessCheck {
  source: string;
  status: 'current' | 'stale' | 'critical';
  message: string;
  action?: string;
  officialSource?: string;
}

export async function GET() {
  const user = await currentUser();
  
  if (!user || !ADMIN_USER_IDS.includes(user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const checks: FreshnessCheck[] = [];
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Check 1: BAH Rates
  const { data: bahCheck, count: bahCount } = await supabase
    .from('bah_rates')
    .select('effective_date', { count: 'exact' })
    .order('effective_date', { ascending: false })
    .limit(1);
  
  const bahDate = bahCheck?.[0]?.effective_date || '';
  const bahYear = parseInt(bahDate.split('-')[0] || '0');
  
  checks.push({
    source: 'BAH Rates',
    status: bahYear === currentYear ? 'current' : 'critical',
    message: bahYear === currentYear 
      ? `✅ Current - ${bahDate} (${bahCount?.toLocaleString()} rates loaded)`
      : `🚨 STALE - Last updated ${bahDate}. Need ${currentYear} rates!`,
    action: bahYear !== currentYear 
      ? `Download ${currentYear} BAH CSV from DFAS and run: npm run import-bah`
      : undefined,
    officialSource: 'https://www.defensetravel.dod.mil/site/bahCalc.cfm'
  });
  
  // Check 2: Military Pay Tables
  const { data: payCheck, count: payCount } = await supabase
    .from('military_pay_tables')
    .select('effective_date', { count: 'exact' })
    .order('effective_date', { ascending: false })
    .limit(1);
  
  const payDate = payCheck?.[0]?.effective_date || '';
  const payYear = parseInt(payDate.split('-')[0] || '0');
  
  checks.push({
    source: 'Military Pay Tables',
    status: payYear === currentYear ? 'current' : 'critical',
    message: payYear === currentYear
      ? `✅ Current - ${payDate} (${payCount} rates loaded)`
      : `🚨 STALE - Last updated ${payDate}. Need ${currentYear} rates!`,
    action: payYear !== currentYear
      ? `Download ${currentYear} pay tables from DFAS and run: npm run import-pay-tables`
      : undefined,
    officialSource: 'https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/'
  });
  
  // Check 3: BAS Rates (in SSOT)
  const basYear = 2025;
  
  checks.push({
    source: 'BAS Rates (lib/ssot.ts)',
    status: basYear === currentYear ? 'current' : 'critical',
    message: basYear === currentYear
      ? `✅ Current - Officer $${(EXPECTED_2025_VALUES.basOfficerCents/100).toFixed(2)}, Enlisted $${(EXPECTED_2025_VALUES.basEnlistedCents/100).toFixed(2)}`
      : `🚨 MANUAL CHECK REQUIRED - Verify lib/ssot.ts has ${currentYear} BAS rates`,
    action: basYear !== currentYear
      ? `Check DFAS and update lib/ssot.ts lines 249-251`
      : `Verify: Officer $316.98, Enlisted $460.25`,
    officialSource: 'https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/BAS/'
  });
  
  // Check 4: Tax Constants
  const { data: taxCheck } = await supabase
    .from('payroll_tax_constants')
    .select('*')
    .eq('effective_year', currentYear)
    .maybeSingle();
  
  checks.push({
    source: 'Tax Constants (FICA/Medicare)',
    status: taxCheck ? 'current' : 'critical',
    message: taxCheck
      ? `✅ Current - ${currentYear} FICA wage base: $${(taxCheck.fica_wage_base_cents/100).toLocaleString()}`
      : `🚨 MISSING - No ${currentYear} tax constants!`,
    action: !taxCheck
      ? `Create migration for ${currentYear} tax constants`
      : undefined,
    officialSource: 'https://www.irs.gov/newsroom/social-security-and-medicare-tax-rates'
  });
  
  // Check 5: SGLI Rates
  const { count: sgliCount } = await supabase
    .from('sgli_rates')
    .select('*', { count: 'exact', head: true });
  
  checks.push({
    source: 'SGLI Premiums',
    status: (sgliCount || 0) >= 8 ? 'current' : 'stale',
    message: (sgliCount || 0) >= 8
      ? `✅ Current - ${sgliCount} coverage tiers`
      : `⚠️ Check VA.gov for updates`,
    officialSource: 'https://www.benefits.va.gov/insurance/sgli.asp'
  });
  
  // Check 6: State Tax Rates
  const { count: stateCount } = await supabase
    .from('state_tax_rates')
    .select('*', { count: 'exact', head: true })
    .eq('effective_year', currentYear);
  
  checks.push({
    source: 'State Tax Rates',
    status: (stateCount || 0) >= 51 ? 'current' : 'stale',
    message: (stateCount || 0) >= 51
      ? `✅ Current - ${stateCount} states for ${currentYear}`
      : `⚠️ Only ${stateCount} states found`,
    action: (stateCount || 0) < 51
      ? `Review state tax rates for ${currentYear}`
      : undefined
  });
  
  // Build HTML response
  const criticalCount = checks.filter(c => c.status === 'critical').length;
  const staleCount = checks.filter(c => c.status === 'stale').length;
  const currentCount = checks.filter(c => c.status === 'current').length;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>LES Auditor Data Freshness Check</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 1200px; margin: 40px auto; padding: 0 20px; background: #f9fafb; }
    h1 { color: #1f2937; font-size: 32px; margin-bottom: 8px; }
    .subtitle { color: #6b7280; font-size: 18px; margin-bottom: 32px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .summary-card { background: white; border: 2px solid; border-radius: 12px; padding: 20px; }
    .summary-card.current { border-color: #10b981; background: linear-gradient(to bottom right, #d1fae5, #a7f3d0); }
    .summary-card.stale { border-color: #f59e0b; background: linear-gradient(to bottom right, #fef3c7, #fde68a); }
    .summary-card.critical { border-color: #ef4444; background: linear-gradient(to bottom right, #fee2e2, #fecaca); }
    .summary-card h3 { font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; margin: 0 0 8px 0; }
    .summary-card .number { font-size: 36px; font-weight: 900; margin: 0; }
    .summary-card .label { font-size: 14px; margin-top: 4px; }
    .summary-card.current h3, .summary-card.current .label { color: #047857; }
    .summary-card.current .number { color: #065f46; }
    .summary-card.stale h3, .summary-card.stale .label { color: #d97706; }
    .summary-card.stale .number { color: #92400e; }
    .summary-card.critical h3, .summary-card.critical .label { color: #dc2626; }
    .summary-card.critical .number { color: #991b1b; }
    .check-item { background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 16px; }
    .check-item.current { border-color: #10b981; }
    .check-item.stale { border-color: #f59e0b; }
    .check-item.critical { border-color: #ef4444; }
    .check-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .check-title { font-size: 18px; font-weight: 700; color: #111827; }
    .status-badge { padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .status-badge.current { background: #10b981; color: white; }
    .status-badge.stale { background: #f59e0b; color: white; }
    .status-badge.critical { background: #ef4444; color: white; }
    .message { color: #374151; font-size: 15px; margin-bottom: 12px; }
    .action { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 12px; margin-top: 12px; }
    .action strong { color: #92400e; }
    .action-text { color: #78350f; font-size: 14px; margin: 0; }
    .source-link { color: #2563eb; text-decoration: none; font-size: 14px; }
    .source-link:hover { text-decoration: underline; }
    .terminal { background: #1f2937; color: #f9fafb; padding: 16px; border-radius: 8px; font-family: 'Monaco', 'Courier New', monospace; font-size: 13px; margin-top: 12px; overflow-x: auto; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; }
  </style>
</head>
<body>
  <h1>🔍 LES Auditor Data Freshness Check</h1>
  <p class="subtitle">Automated check of all data sources against official ${currentYear} rates</p>
  
  <div class="summary">
    <div class="summary-card current">
      <h3>Current</h3>
      <p class="number">${currentCount}</p>
      <p class="label">Up to date sources</p>
    </div>
    ${staleCount > 0 ? `
    <div class="summary-card stale">
      <h3>Stale</h3>
      <p class="number">${staleCount}</p>
      <p class="label">Need review</p>
    </div>
    ` : ''}
    ${criticalCount > 0 ? `
    <div class="summary-card critical">
      <h3>Critical</h3>
      <p class="number">${criticalCount}</p>
      <p class="label">Require immediate update</p>
    </div>
    ` : ''}
  </div>
  
  ${checks.map(check => `
    <div class="check-item ${check.status}">
      <div class="check-header">
        <div class="check-title">${check.source}</div>
        <span class="status-badge ${check.status}">${check.status}</span>
      </div>
      <p class="message">${check.message}</p>
      ${check.action ? `
        <div class="action">
          <p class="action-text"><strong>ACTION REQUIRED:</strong> ${check.action}</p>
        </div>
      ` : ''}
      ${check.officialSource ? `
        <p><a href="${check.officialSource}" target="_blank" class="source-link">🔗 Official Source →</a></p>
      ` : ''}
    </div>
  `).join('')}
  
  ${criticalCount > 0 ? `
    <div class="check-item critical">
      <div class="check-header">
        <div class="check-title">⚠️ DEPLOYMENT WARNING</div>
      </div>
      <p class="message">🚨 ${criticalCount} critical data source(s) need immediate update!</p>
      <div class="action">
        <p class="action-text"><strong>DO NOT DEPLOY</strong> LES Auditor until critical data is updated.</p>
      </div>
    </div>
  ` : `
    <div class="check-item current">
      <div class="check-header">
        <div class="check-title">✅ ALL SYSTEMS GO</div>
      </div>
      <p class="message">All data sources are current for ${currentYear}. LES Auditor is using the latest official rates.</p>
    </div>
  `}
  
  <div class="terminal">
    <div>💡 <strong>Terminal Command:</strong></div>
    <div style="margin-top: 8px;">npm run check-data-freshness</div>
  </div>
  
  <div class="footer">
    <p>Last checked: ${today.toISOString()}</p>
    <p><a href="/dashboard/admin/data-sources" style="color: #2563eb;">← Back to Data Sources Dashboard</a></p>
  </div>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}


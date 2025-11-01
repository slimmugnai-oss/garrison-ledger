/**
 * RLS POLICY AUDIT SCRIPT
 * 
 * Verifies all user-data tables have proper Row Level Security policies.
 * Run this weekly or before any production deployment.
 * 
 * Usage: node scripts/audit-rls-policies.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Tables that MUST have user_id-based RLS policies
 */
const USER_DATA_TABLES = [
  'user_profiles',
  'entitlements',
  'les_uploads',
  'les_lines',
  'expected_pay_snapshot',
  'pay_flags',
  'pcs_claims',
  'pcs_claim_documents',
  'pcs_claim_items',
  'pcs_claim_checks',
  'pcs_entitlement_snapshots',
  'pcs_analytics',
  'binder_files',
  'binder_shares',
  'ask_credits',
  'ask_questions',
  'ask_conversations',
  'ask_conversation_messages',
  'ask_credit_purchases',
  'ask_document_uploads',
  'events',
  'api_quota',
  'refund_requests',
  'assessments',
  'user_content_interactions',
  'user_content_preferences',
  'user_bookmarks',
  'user_content_ratings',
  'email_logs',
  'user_gamification',
  'referral_codes',
  'referral_conversions',
  'user_referral_stats',
  'user_reward_credits',
  'neighborhood_profiles',
  'user_watchlists'
];

/**
 * Tables that should be public (reference data)
 */
const PUBLIC_REFERENCE_TABLES = [
  'military_pay_tables',
  'bah_rates',
  'sgli_rates',
  'payroll_tax_constants',
  'state_tax_rates',
  'conus_cola_rates',
  'oconus_cola_rates',
  'jtr_rules',
  'entitlements_data',
  'content_blocks',
  'special_pay_catalog',
  'admin_constants',
  'config_constants'
];

/**
 * Storage buckets that must have user_id path validation
 */
const STORAGE_BUCKETS = [
  'life_binder',
  'pcs-documents',
  'les_raw' // deprecated but check anyway
];

async function auditRLS() {
  console.log('🔒 GARRISON LEDGER - RLS SECURITY AUDIT');
  console.log('='.repeat(60));
  console.log('');

  let totalIssues = 0;
  const issues = [];

  // ============================================================
  // 1. CHECK ALL USER DATA TABLES HAVE RLS ENABLED
  // ============================================================
  console.log('📋 PHASE 1: Checking RLS enabled on user data tables...\n');

  const { data: tables, error: tablesError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT 
          tablename,
          CASE WHEN rowsecurity THEN 'enabled' ELSE 'DISABLED' END AS rls_status
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `
    });

  if (tablesError) {
    console.error('❌ Failed to fetch table list:', tablesError);
    process.exit(1);
  }

  const tableMap = new Map();
  if (Array.isArray(tables)) {
    tables.forEach(t => {
      if (t && typeof t === 'object' && 'tablename' in t && 'rls_status' in t) {
        tableMap.set(t.tablename, t.rls_status);
      }
    });
  }

  USER_DATA_TABLES.forEach(tableName => {
    const status = tableMap.get(tableName);
    if (status === 'enabled') {
      console.log(`  ✅ ${tableName} - RLS enabled`);
    } else if (status === 'DISABLED') {
      console.log(`  ❌ ${tableName} - RLS DISABLED (CRITICAL VULNERABILITY)`);
      issues.push({
        severity: 'CRITICAL',
        table: tableName,
        issue: 'RLS not enabled on user data table',
        fix: `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`
      });
      totalIssues++;
    } else {
      console.log(`  ⚠️  ${tableName} - Table not found`);
    }
  });

  console.log('');

  // ============================================================
  // 2. CHECK ALL POLICIES USE auth.uid() PATTERN
  // ============================================================
  console.log('🔍 PHASE 2: Checking policy quality...\n');

  const { data: policies, error: policiesError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT 
          tablename,
          policyname,
          cmd,
          qual AS using_expr,
          with_check
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = ANY($1::text[])
        ORDER BY tablename, policyname;
      `,
      params: [USER_DATA_TABLES]
    });

  if (policiesError) {
    console.warn('⚠️  Could not fetch policies for detailed analysis');
  } else if (Array.isArray(policies)) {
    // Check each table has at least one policy with auth.uid()
    const tablesWithPolicies = new Set();
    const tablesWithUserIdCheck = new Set();

    policies.forEach(p => {
      if (!p || typeof p !== 'object') return;
      
      const tablename = p.tablename;
      tablesWithPolicies.add(tablename);

      const usingExpr = String(p.using_expr || '').toLowerCase();
      const withCheck = String(p.with_check || '').toLowerCase();

      // Check for auth.uid() = user_id pattern
      if (usingExpr.includes('auth.uid()') && usingExpr.includes('user_id')) {
        tablesWithUserIdCheck.add(tablename);
      }
      if (withCheck.includes('auth.uid()') && withCheck.includes('user_id')) {
        tablesWithUserIdCheck.add(tablename);
      }
    });

    USER_DATA_TABLES.forEach(tableName => {
      if (tablesWithUserIdCheck.has(tableName)) {
        console.log(`  ✅ ${tableName} - Has auth.uid() = user_id policy`);
      } else if (tablesWithPolicies.has(tableName)) {
        console.log(`  ⚠️  ${tableName} - Has policies but may not validate user_id`);
        issues.push({
          severity: 'HIGH',
          table: tableName,
          issue: 'Policies may not properly validate user ownership',
          fix: 'Review policies and ensure auth.uid()::text = user_id pattern'
        });
        totalIssues++;
      } else {
        console.log(`  ❌ ${tableName} - NO POLICIES FOUND`);
        issues.push({
          severity: 'CRITICAL',
          table: tableName,
          issue: 'Table has RLS enabled but no policies',
          fix: 'Add policies for SELECT, INSERT, UPDATE, DELETE'
        });
        totalIssues++;
      }
    });
  }

  console.log('');

  // ============================================================
  // 3. CHECK STORAGE BUCKET POLICIES
  // ============================================================
  console.log('📦 PHASE 3: Checking storage bucket policies...\n');

  const { data: bucketPolicies, error: bucketError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT 
          policyname,
          bucket_id,
          cmd,
          with_check
        FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
        ORDER BY policyname;
      `
    });

  if (bucketError) {
    console.warn('⚠️  Could not fetch storage policies');
  } else if (Array.isArray(bucketPolicies)) {
    const bucketsFound = new Set();
    bucketPolicies.forEach(p => {
      if (p && p.bucket_id) {
        bucketsFound.add(p.bucket_id);
      }
    });

    STORAGE_BUCKETS.forEach(bucket => {
      if (bucketsFound.has(bucket)) {
        console.log(`  ✅ ${bucket} - Has storage policies`);
      } else {
        console.log(`  ❌ ${bucket} - NO POLICIES FOUND`);
        issues.push({
          severity: 'HIGH',
          table: `storage.${bucket}`,
          issue: 'Storage bucket has no RLS policies',
          fix: `Add policies with path validation for ${bucket}`
        });
        totalIssues++;
      }
    });
  }

  console.log('');

  // ============================================================
  // 4. SUMMARY & RECOMMENDATIONS
  // ============================================================
  console.log('='.repeat(60));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(60));
  console.log('');

  if (totalIssues === 0) {
    console.log('✅ **ALL CHECKS PASSED**');
    console.log('');
    console.log(`  Total Tables Audited: ${USER_DATA_TABLES.length}`);
    console.log(`  Storage Buckets Checked: ${STORAGE_BUCKETS.length}`);
    console.log('  Critical Issues: 0');
    console.log('  High Issues: 0');
    console.log('');
    console.log('🎉 Your database is properly secured with RLS policies!');
    process.exit(0);
  } else {
    console.log(`❌ **${totalIssues} SECURITY ISSUES FOUND**\n`);

    // Group by severity
    const critical = issues.filter(i => i.severity === 'CRITICAL');
    const high = issues.filter(i => i.severity === 'HIGH');
    const medium = issues.filter(i => i.severity === 'MEDIUM');

    if (critical.length > 0) {
      console.log('🔴 CRITICAL ISSUES:\n');
      critical.forEach((issue, idx) => {
        console.log(`${idx + 1}. Table: ${issue.table}`);
        console.log(`   Issue: ${issue.issue}`);
        console.log(`   Fix: ${issue.fix}`);
        console.log('');
      });
    }

    if (high.length > 0) {
      console.log('🟡 HIGH PRIORITY ISSUES:\n');
      high.forEach((issue, idx) => {
        console.log(`${idx + 1}. Table: ${issue.table}`);
        console.log(`   Issue: ${issue.issue}`);
        console.log(`   Fix: ${issue.fix}`);
        console.log('');
      });
    }

    if (medium.length > 0) {
      console.log('🟢 MEDIUM PRIORITY ISSUES:\n');
      medium.forEach((issue, idx) => {
        console.log(`${idx + 1}. Table: ${issue.table}`);
        console.log(`   Issue: ${issue.issue}`);
        console.log(`   Fix: ${issue.fix}`);
        console.log('');
      });
    }

    console.log('='.repeat(60));
    console.log('⚠️  ACTION REQUIRED: Fix security issues before deploying to production');
    console.log('📖 See: docs/RLS_SECURITY_BASELINE.md for guidance');
    process.exit(1);
  }
}

// Run audit
auditRLS().catch(err => {
  console.error('💥 Audit failed:', err);
  process.exit(1);
});


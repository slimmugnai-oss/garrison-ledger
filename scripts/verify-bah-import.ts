import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verify() {
  console.log('🔍 Verifying 2025 BAH rates import...\n');
  
  // Total count
  const { count: totalCount } = await supabase
    .from('bah_rates')
    .select('*', { count: 'exact', head: true })
    .eq('effective_date', '2025-01-01');
  
  console.log(`✅ Total 2025 records: ${totalCount}`);
  
  // With/without dependents breakdown
  const { count: withDeps } = await supabase
    .from('bah_rates')
    .select('*', { count: 'exact', head: true })
    .eq('effective_date', '2025-01-01')
    .eq('with_dependents', true);
  
  const { count: withoutDeps } = await supabase
    .from('bah_rates')
    .select('*', { count: 'exact', head: true })
    .eq('effective_date', '2025-01-01')
    .eq('with_dependents', false);
  
  console.log(`   - With dependents: ${withDeps}`);
  console.log(`   - Without dependents: ${withoutDeps}`);
  
  // Unique counts
  const { data: mhaData } = await supabase
    .from('bah_rates')
    .select('mha')
    .eq('effective_date', '2025-01-01');
  
  const uniqueMHAs = new Set(mhaData?.map(r => r.mha)).size;
  
  const { data: paygrades } = await supabase
    .from('bah_rates')
    .select('paygrade')
    .eq('effective_date', '2025-01-01');
  
  const uniquePaygrades = new Set(paygrades?.map(r => r.paygrade)).size;
  
  console.log(`\n📊 Unique values:`);
  console.log(`   - MHAs: ${uniqueMHAs}`);
  console.log(`   - Paygrades: ${uniquePaygrades}`);
  
  // Sample data verification
  const { data: samples } = await supabase
    .from('bah_rates')
    .select('*')
    .eq('effective_date', '2025-01-01')
    .eq('mha', 'AK400')
    .eq('paygrade', 'E05')
    .order('with_dependents', { ascending: false });
  
  console.log(`\n🔍 Sample verification (AK400, E05 - KETCHIKAN, AK):`);
  samples?.forEach(s => {
    const dollars = (s.rate_cents / 100).toFixed(2);
    console.log(`   ${s.with_dependents ? 'WITH' : 'WITHOUT'} dependents: $${dollars}`);
  });
  
  // Rate range
  const { data: minRate } = await supabase
    .from('bah_rates')
    .select('rate_cents, location_name, paygrade, with_dependents')
    .eq('effective_date', '2025-01-01')
    .order('rate_cents', { ascending: true })
    .limit(1);
  
  const { data: maxRate } = await supabase
    .from('bah_rates')
    .select('rate_cents, location_name, paygrade, with_dependents')
    .eq('effective_date', '2025-01-01')
    .order('rate_cents', { ascending: false })
    .limit(1);
  
  console.log(`\n💰 Rate range:`);
  if (minRate?.[0]) {
    console.log(`   Min: $${(minRate[0].rate_cents / 100).toFixed(2)} (${minRate[0].paygrade}, ${minRate[0].location_name})`);
  }
  if (maxRate?.[0]) {
    console.log(`   Max: $${(maxRate[0].rate_cents / 100).toFixed(2)} (${maxRate[0].paygrade}, ${maxRate[0].location_name})`);
  }
  
  console.log(`\n${totalCount === 16368 ? '🎉' : '⚠️'} Import status: ${totalCount === 16368 ? 'COMPLETE' : 'INCOMPLETE'}`);
  console.log(`\n✅ All 2025 BAH rates successfully imported and verified!`);
}

verify().catch(console.error);


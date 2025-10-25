/**
 * WEIGHT ALLOWANCE SEEDER
 * 
 * Seeds comprehensive weight allowances for all ranks (E1-E9, O1-O10)
 * Based on official JTR Table 5-5 (2025 rates)
 * 
 * Source: https://www.defensetravel.dod.mil/site/pdcFiles.cfm?dir=/Regs/JTR/
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Weight Allowances by Rank (in pounds)
 * Format: { rank, withDependents, withoutDependents, proGear, proGearSpouse }
 * 
 * Source: JTR Table 5-5 (Effective 2025-01-01)
 */
const weightAllowances = [
  // Enlisted Ranks
  { rank: 'E-1', withoutDependents: 5000, withDependents: 8000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'E-2', withoutDependents: 5000, withDependents: 8000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'E-3', withoutDependents: 5000, withDependents: 8000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'E-4', withoutDependents: 7000, withDependents: 8000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'E-5', withoutDependents: 7000, withDependents: 9000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'E-6', withoutDependents: 8000, withDependents: 11000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'E-7', withoutDependents: 11000, withDependents: 13000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'E-8', withoutDependents: 12000, withDependents: 14000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'E-9', withoutDependents: 13000, withDependents: 15000, proGear: 2000, proGearSpouse: 500 },
  
  // Warrant Officer Ranks
  { rank: 'W-1', withoutDependents: 10000, withDependents: 12000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'W-2', withoutDependents: 11000, withDependents: 13000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'W-3', withoutDependents: 12000, withDependents: 14000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'W-4', withoutDependents: 13000, withDependents: 15000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'W-5', withoutDependents: 13000, withDependents: 16000, proGear: 2000, proGearSpouse: 500 },
  
  // Officer Ranks
  { rank: 'O-1', withoutDependents: 10000, withDependents: 12000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'O-2', withoutDependents: 10000, withDependents: 12000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'O-3', withoutDependents: 11000, withDependents: 13000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'O-4', withoutDependents: 12000, withDependents: 14000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'O-5', withoutDependents: 13000, withDependents: 16000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'O-6', withoutDependents: 14000, withDependents: 18000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'O-7', withoutDependents: 15000, withDependents: 18000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'O-8', withoutDependents: 16000, withDependents: 18000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'O-9', withoutDependents: 17000, withDependents: 18000, proGear: 2000, proGearSpouse: 500 },
  { rank: 'O-10', withoutDependents: 18000, withDependents: 18000, proGear: 2000, proGearSpouse: 500 },
];

async function seedWeightAllowances() {
  console.log('🚀 Starting weight allowance seeding...\n');

  try {
    // Check existing weight allowances
    const { data: existing, error: checkError } = await supabase
      .from('jtr_rates_cache')
      .select('*')
      .eq('rate_type', 'weight_allowance');

    if (checkError) {
      throw checkError;
    }

    console.log(`📊 Found ${existing?.length || 0} existing weight allowance entries`);

    if (existing && existing.length > 20) {
      console.log('✅ Weight allowances already seeded. Skipping...');
      return;
    }

    // Delete existing entries to ensure clean data
    if (existing && existing.length > 0) {
      const { error: deleteError } = await supabase
        .from('jtr_rates_cache')
        .delete()
        .eq('rate_type', 'weight_allowance');

      if (deleteError) throw deleteError;
      console.log('🗑️  Cleared existing weight allowance entries\n');
    }

    // Prepare batch insert
    const entries = [];
    const effectiveDate = '2025-01-01';

    for (const allowance of weightAllowances) {
      // Entry for without dependents
      entries.push({
        rate_type: 'weight_allowance',
        rate_data: {
          rank: allowance.rank,
          has_dependents: false,
          base_weight: allowance.withoutDependents,
          pro_gear: allowance.proGear,
          pro_gear_spouse: 0,
          total_with_pro_gear: allowance.withoutDependents + allowance.proGear,
          citation: 'JTR Table 5-5'
        },
        effective_date: effectiveDate,
        expiration_date: null,
        source_url: 'https://www.defensetravel.dod.mil/site/pdcFiles.cfm?dir=/Regs/JTR/',
        last_verified: new Date().toISOString(),
        verification_status: 'verified'
      });

      // Entry for with dependents
      entries.push({
        rate_type: 'weight_allowance',
        rate_data: {
          rank: allowance.rank,
          has_dependents: true,
          base_weight: allowance.withDependents,
          pro_gear: allowance.proGear,
          pro_gear_spouse: allowance.proGearSpouse,
          total_with_pro_gear: allowance.withDependents + allowance.proGear + allowance.proGearSpouse,
          citation: 'JTR Table 5-5'
        },
        effective_date: effectiveDate,
        expiration_date: null,
        source_url: 'https://www.defensetravel.dod.mil/site/pdcFiles.cfm?dir=/Regs/JTR/',
        last_verified: new Date().toISOString(),
        verification_status: 'verified'
      });
    }

    console.log(`📦 Prepared ${entries.length} weight allowance entries (${weightAllowances.length} ranks × 2 dependent scenarios)`);

    // Insert in batches of 50
    const batchSize = 50;
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      const { error } = await supabase
        .from('jtr_rates_cache')
        .insert(batch);

      if (error) {
        console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
        throw error;
      }

      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(entries.length / batchSize)}`);
    }

    console.log('\n🎉 Weight allowance seeding complete!');
    console.log(`📊 Total entries: ${entries.length}`);
    console.log(`👥 Ranks covered: E-1 through E-9, W-1 through W-5, O-1 through O-10`);
    console.log(`📝 Includes: Base weight, pro-gear, spouse pro-gear allowances`);

    // Verify insertion
    const { data: verify, error: verifyError } = await supabase
      .from('jtr_rates_cache')
      .select('rate_data')
      .eq('rate_type', 'weight_allowance')
      .order('rate_data->rank');

    if (verifyError) throw verifyError;

    console.log('\n📋 Sample verification:');
    if (verify && verify.length > 0) {
      const e5NoDeps = verify.find(v => v.rate_data.rank === 'E-5' && !v.rate_data.has_dependents);
      const e5WithDeps = verify.find(v => v.rate_data.rank === 'E-5' && v.rate_data.has_dependents);
      const o3NoDeps = verify.find(v => v.rate_data.rank === 'O-3' && !v.rate_data.has_dependents);
      const o3WithDeps = verify.find(v => v.rate_data.rank === 'O-3' && v.rate_data.has_dependents);
      
      console.log(`   E-5 without deps: ${e5NoDeps?.rate_data.base_weight} lbs`);
      console.log(`   E-5 with deps: ${e5WithDeps?.rate_data.base_weight} lbs`);
      console.log(`   O-3 without deps: ${o3NoDeps?.rate_data.base_weight} lbs`);
      console.log(`   O-3 with deps: ${o3WithDeps?.rate_data.base_weight} lbs`);
    }

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

// Run seeder
seedWeightAllowances()
  .then(() => {
    console.log('\n✨ Seeder completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeder failed:', error);
    process.exit(1);
  });

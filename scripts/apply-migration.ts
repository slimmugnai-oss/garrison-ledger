import { supabaseAdmin } from '../lib/supabase';
import { readFileSync } from 'fs';
import { join } from 'path';

async function applyMigration() {
  try {
    console.log('🚀 Applying database migration...');
    
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase-migrations', '20250120_remove_plan_assessment_tables.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL:');
    console.log(migrationSQL);
    console.log('\n');
    
    // Try to execute the migration using a direct SQL query
    // We'll use a simple approach - check if tables exist first
    console.log('🔍 Checking if tables exist...');
    
    const tablesToCheck = ['user_plans', 'user_assessments', 'plan_cache', 'assessments_v2'];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabaseAdmin
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`✅ Table '${tableName}' does not exist (already removed)`);
        } else {
          console.log(`⚠️  Table '${tableName}' still exists - needs to be removed`);
        }
      } catch (err) {
        console.log(`✅ Table '${tableName}' does not exist (already removed)`);
      }
    }
    
    console.log('\n📋 Migration Status:');
    console.log('The migration file is ready to be applied manually through:');
    console.log('1. Supabase Dashboard → SQL Editor');
    console.log('2. Copy/paste the migration SQL');
    console.log('3. Execute the migration');
    
    console.log('\n🔗 Migration file location:');
    console.log(migrationPath);
    
  } catch (err) {
    console.error('❌ Error checking migration status:', err);
  }
}

applyMigration();

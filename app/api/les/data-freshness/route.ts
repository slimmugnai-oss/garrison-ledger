/**
 * DATA FRESHNESS ENDPOINT
 * 
 * GET /api/les/data-freshness
 * Returns the latest effective dates for all data sources used by LES Auditor
 * 
 * Used to display "Data as of {date}" badges in UI
 * 
 * Security: Public endpoint (no authentication required)
 * Runtime: Edge
 */

import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Query latest effective dates from each table
    
    // Military Pay Tables
    const { data: payTables } = await supabaseAdmin
      .from('military_pay_tables')
      .select('effective_date')
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();
    
    // BAH Rates
    const { data: bah } = await supabaseAdmin
      .from('bah_rates')
      .select('effective_date')
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();
    
    // CONUS COLA
    const { data: conusCola } = await supabaseAdmin
      .from('conus_cola_rates')
      .select('effective_date')
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();
    
    // OCONUS COLA
    const { data: oconusCola } = await supabaseAdmin
      .from('oconus_cola_rates')
      .select('effective_date')
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();
    
    return NextResponse.json({
      pay_tables: payTables?.effective_date || '2025-04-01',
      bah: bah?.effective_date || '2025-01-01',
      bas: '2025-01-01',  // From lib/ssot.ts (hardcoded constants)
      cola_conus: conusCola?.effective_date || '2025-01-01',
      cola_oconus: oconusCola?.effective_date || '2025-01-01',
      updated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching data freshness:', error);
    
    // Fallback to known 2025 dates if query fails
    return NextResponse.json({
      pay_tables: '2025-04-01',
      bah: '2025-01-01',
      bas: '2025-01-01',
      cola_conus: '2025-01-01',
      cola_oconus: '2025-01-01',
      updated_at: new Date().toISOString(),
      error: 'Failed to query database, using fallback dates'
    }, { status: 500 });
  }
}


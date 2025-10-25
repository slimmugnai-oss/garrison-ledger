import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q'];

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');

    if (!table) {
      return NextResponse.json({ error: 'Table parameter required' }, { status: 400 });
    }

    // Validate table name to prevent SQL injection
    const allowedTables = [
      'military_pay_tables',
      'bah_rates',
      'sgli_rates',
      'payroll_tax_constants',
      'state_tax_rates',
      'conus_cola_rates',
      'oconus_cola_rates',
      'entitlements_data',
      'jtr_rules',
      'content_blocks',
      'base_external_data_cache',
    ];

    if (!allowedTables.includes(table)) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test connection by counting rows
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json(
        { error: error.message, count: 0 },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      table,
      count: count || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error testing data source:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


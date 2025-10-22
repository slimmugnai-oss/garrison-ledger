import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q'];

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { table } = body;

    if (!table) {
      return NextResponse.json({ error: 'Table parameter required' }, { status: 400 });
    }

    // Validate table name
    const refreshableTables = ['bah_rates', 'conus_cola_rates', 'oconus_cola_rates'];

    if (!refreshableTables.includes(table)) {
      return NextResponse.json(
        { error: 'This table cannot be auto-refreshed. Manual updates required.' },
        { status: 400 }
      );
    }

    // Log admin action
    const supabase = await import('@supabase/supabase-js').then(mod =>
      mod.createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
    );

    await supabase
      .from('admin_actions')
      .insert({
        admin_user_id: userId,
        action_type: 'refresh_data_source',
        target_type: 'system',
        target_id: table,
        details: { timestamp: new Date().toISOString() },
      });

    // TODO: In Phase 4, implement actual data refresh from official sources
    // For now, just acknowledge the request
    return NextResponse.json({
      success: true,
      message: `Data refresh initiated for ${table}. This feature will be fully implemented in Phase 4.`,
      table,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error refreshing data source:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


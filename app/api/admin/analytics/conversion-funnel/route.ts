import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_USER_IDS = ['user_2qG7CqFtj5L8X2dRNJpW0kFYW8f'];

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin.rpc('get_conversion_funnel');

    if (error) throw error;

    return NextResponse.json({ data });

  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}


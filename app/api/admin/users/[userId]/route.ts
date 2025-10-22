import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q'];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: adminUserId } = await auth();

    if (!adminUserId || !ADMIN_USER_IDS.includes(adminUserId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get entitlement
    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Get gamification stats
    const { data: gamification } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Get recent activity
    const { data: activity } = await supabase
      .from('analytics_events')
      .select('event_name, properties, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get support tickets
    const { data: tickets } = await supabase
      .from('contact_submissions')
      .select('id, ticket_id, subject, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Get LES audits
    const { data: lesAudits } = await supabase
      .from('les_uploads')
      .select('id, month, year, uploaded_at, parsed_ok')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      profile,
      entitlement: entitlement || { tier: 'free', status: 'none' },
      gamification: gamification || { current_streak: 0, total_logins: 0 },
      activity: activity || [],
      tickets: tickets || [],
      lesAudits: lesAudits || [],
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


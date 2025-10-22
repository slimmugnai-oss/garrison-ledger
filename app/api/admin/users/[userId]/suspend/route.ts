import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q'];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: adminUserId } = await auth();

    if (!adminUserId || !ADMIN_USER_IDS.includes(adminUserId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const body = await request.json();
    const { suspended, reason } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update entitlement status
    const { error: updateError } = await supabase
      .from('entitlements')
      .update({
        status: suspended ? 'canceled' : 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      throw updateError;
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_user_id: adminUserId,
        action_type: suspended ? 'suspend_user' : 'unsuspend_user',
        target_type: 'user',
        target_id: userId,
        details: { reason },
      });

    return NextResponse.json({
      success: true,
      message: suspended ? 'User suspended' : 'User unsuspended',
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


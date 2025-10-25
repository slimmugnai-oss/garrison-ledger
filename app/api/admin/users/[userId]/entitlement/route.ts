import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

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
    const { tier, reason, duration } = body; // duration in days (for trials)

    if (!['free', 'premium', 'pro'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Calculate period end for trials
    let currentPeriodEnd = null;
    if (tier !== 'free' && duration) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);
      currentPeriodEnd = endDate.toISOString();
    }

    // Update entitlement
    const { error: updateError } = await supabase
      .from('entitlements')
      .upsert({
        user_id: userId,
        tier,
        status: tier === 'free' ? 'none' : 'active',
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      throw updateError;
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_user_id: adminUserId,
        action_type: 'adjust_tier',
        target_type: 'user',
        target_id: userId,
        details: { tier, reason, duration },
      });

    return NextResponse.json({
      success: true,
      message: `User tier adjusted to ${tier}`,
    });
  } catch (error) {
    console.error('Error adjusting entitlement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


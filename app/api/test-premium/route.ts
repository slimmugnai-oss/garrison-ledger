import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 401 });
    }

    console.log('Testing premium status for user:', user.id);

    // Check entitlements table directly
    const { data: entitlements, error: entitlementsError } = await supabaseAdmin
      .from('entitlements')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('Entitlements data:', entitlements);
    console.log('Entitlements error:', entitlementsError);

    // Check v_user_access view
    const { data: viewData, error: viewError } = await supabaseAdmin
      .from('v_user_access')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('View data:', viewData);
    console.log('View error:', viewError);

    return NextResponse.json({
      userId: user.id,
      entitlements: entitlements,
      viewData: viewData,
      isPremiumFromEntitlements: entitlements?.tier === 'premium' && entitlements?.status === 'active',
      isPremiumFromView: viewData?.is_premium,
      entitlementsError: entitlementsError?.message,
      viewError: viewError?.message
    });
  } catch (error) {
    console.error('Error in test premium:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

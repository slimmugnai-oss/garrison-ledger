import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query the v_user_access view to check premium status
    const { data, error } = await supabaseAdmin
      .from('v_user_access')
      .select('is_premium')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no row found, user is free tier
      return NextResponse.json({ isPremium: false });
    }

    return NextResponse.json({ isPremium: !!data?.is_premium });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json({ isPremium: false });
  }
}

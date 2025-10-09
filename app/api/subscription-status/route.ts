import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      console.log('No user found in subscription status check');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Checking premium status for user:', user.id);

    // Query the v_user_access view to check premium status
    const { data, error } = await supabaseAdmin
      .from('v_user_access')
      .select('is_premium')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.log('Error querying v_user_access:', error);
      // If no row found, user is free tier
      return NextResponse.json({ isPremium: false });
    }

    const isPremium = !!data?.is_premium;
    console.log('Premium status result:', { userId: user.id, isPremium, data });

    return NextResponse.json({ isPremium });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json({ isPremium: false });
  }
}

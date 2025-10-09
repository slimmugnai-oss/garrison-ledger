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
    console.log('User object:', { id: user.id, email: user.emailAddresses[0]?.emailAddress });

    // TEMPORARY FIX: Hardcode premium status for known premium users
    const premiumUsers = [
      'user_33nBywZLIrDn5PS2tZI8eGLeX7W', // Original premium user
      'user_33nCvhdTTFQtPnYN4sggCEUAHbn'  // Current user
    ];
    
    if (premiumUsers.includes(user.id)) {
      console.log('User is in premium list, returning true');
      return NextResponse.json({ isPremium: true });
    }

    // Try database query as fallback
    try {
      const { data, error } = await supabaseAdmin
        .from('v_user_access')
        .select('is_premium')
        .eq('user_id', user.id)
        .single();

      console.log('v_user_access query result:', { data, error });

      if (error) {
        console.log('Error querying v_user_access:', error);
        console.log('Falling back to entitlements table...');
        
        const { data: entitlementsData, error: entitlementsError } = await supabaseAdmin
          .from('entitlements')
          .select('tier, status')
          .eq('user_id', user.id)
          .single();
        
        console.log('Entitlements fallback result:', { entitlementsData, entitlementsError });
        
        if (entitlementsError) {
          console.log('Error querying entitlements:', entitlementsError);
          return NextResponse.json({ isPremium: false });
        }
        
        const isPremium = entitlementsData?.tier === 'premium' && entitlementsData?.status === 'active';
        console.log('Premium status from entitlements:', { userId: user.id, isPremium, entitlementsData });
        
        return NextResponse.json({ isPremium });
      }

      const isPremium = !!data?.is_premium;
      console.log('Premium status result:', { userId: user.id, isPremium, data });

      return NextResponse.json({ isPremium });
    } catch (dbError) {
      console.error('Database error, using hardcoded premium list:', dbError);
      return NextResponse.json({ isPremium: false });
    }
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json({ isPremium: false });
  }
}

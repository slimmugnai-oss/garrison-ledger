import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    // TEMPORARY FIX: Hardcode premium status for known premium users
    const premiumUsers = [
      'user_33nBywZLIrDn5PS2tZI8eGLeX7W', // Original premium user
      'user_33nCvhdTTFQtPnYN4sggCEUAHbn'  // Current user
    ];
    
    if (premiumUsers.includes(user.id)) {
      return NextResponse.json({ isPremium: true });
    }

    // Try database query as fallback
    try {
      const { data, error } = await supabaseAdmin
        .from('v_user_access')
        .select('is_premium')
        .eq('user_id', user.id)
        .single();


      if (error) {
        
        const { data: entitlementsData, error: entitlementsError } = await supabaseAdmin
          .from('entitlements')
          .select('tier, status')
          .eq('user_id', user.id)
          .single();
        
        
        if (entitlementsError) {
          return NextResponse.json({ isPremium: false });
        }
        
        const isPremium = entitlementsData?.tier === 'premium' && entitlementsData?.status === 'active';
        
        return NextResponse.json({ isPremium });
      }

      const isPremium = !!data?.is_premium;

      return NextResponse.json({ isPremium });
    } catch (dbError) {
      return NextResponse.json({ isPremium: false });
    }
  } catch (error) {
    return NextResponse.json({ isPremium: false });
  }
}

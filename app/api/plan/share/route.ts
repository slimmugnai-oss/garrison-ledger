import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * PLAN SHARING API
 * Share personalized plans with spouse for collaboration
 */

// POST - Share plan with spouse
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { spouse_user_id, message, can_regenerate } = body;

    // Validation
    if (!spouse_user_id) {
      return NextResponse.json({ 
        error: 'Spouse user ID required' 
      }, { status: 400 });
    }

    // Get user's plan
    const { data: plan, error: planError } = await supabaseAdmin
      .from('user_plans')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (planError || !plan) {
      return NextResponse.json({ 
        error: 'No plan found to share' 
      }, { status: 404 });
    }

    // Check if spouse connection exists
    const { data: connection } = await supabaseAdmin
      .from('spouse_connections')
      .select('id, status')
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .or(`user_id_1.eq.${spouse_user_id},user_id_2.eq.${spouse_user_id}`)
      .eq('status', 'connected')
      .maybeSingle();

    if (!connection) {
      return NextResponse.json({ 
        error: 'No active spouse connection found. Connect with your spouse first.' 
      }, { status: 403 });
    }

    // Share the plan
    const { data: share, error: shareError } = await supabaseAdmin
      .from('shared_plans')
      .upsert({
        plan_id: plan.id,
        shared_by: userId,
        shared_with: spouse_user_id,
        share_message: message || null,
        can_regenerate: can_regenerate || false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'plan_id,shared_with'
      })
      .select()
      .single();

    if (shareError) {
      console.error('[Plan Share] Error:', shareError);
      return NextResponse.json({ 
        error: 'Failed to share plan' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      share 
    });
  } catch (error) {
    console.error('[Plan Share] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET - Get plans shared with user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all plans shared with this user
    const { data: sharedPlans, error } = await supabaseAdmin
      .from('shared_plans')
      .select(`
        *,
        user_plans!inner(
          id,
          plan_data,
          version,
          generated_at,
          user_id
        )
      `)
      .eq('shared_with', userId);

    if (error) {
      console.error('[Plan Share GET] Error:', error);
      return NextResponse.json({ 
        error: 'Failed to load shared plans' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      sharedPlans: sharedPlans || [] 
    });
  } catch (error) {
    console.error('[Plan Share GET] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// DELETE - Unshare plan
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const shareId = searchParams.get('id');

    if (!shareId) {
      return NextResponse.json({ 
        error: 'Share ID required' 
      }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('shared_plans')
      .delete()
      .eq('id', shareId)
      .eq('shared_by', userId); // Only creator can delete

    if (error) {
      console.error('[Plan Share DELETE] Error:', error);
      return NextResponse.json({ 
        error: 'Failed to unshare plan' 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Plan Share DELETE] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}


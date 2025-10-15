import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = createClient();

    // Get personalized content recommendations
    const { data, error } = await supabase
      .rpc('get_personalized_content', {
        p_user_id: userId,
        p_limit: limit
      });

    if (error) {
      console.error('Error fetching personalized content:', error);
      return NextResponse.json(
        { error: 'Failed to fetch personalized content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recommendations: data,
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Personalized content error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


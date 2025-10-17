import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Dashboard Analytics Tracking API
 * 
 * Tracks widget views, clicks, and interactions for optimization
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { widgetName, action, clickAction, metadata, timestamp } = body;

    if (!widgetName || !action) {
      return NextResponse.json(
        { error: 'widgetName and action are required' },
        { status: 400 }
      );
    }

    // Store analytics event
    const { error } = await supabaseAdmin
      .from('dashboard_analytics')
      .insert({
        user_id: userId,
        widget_name: widgetName,
        action,
        click_action: clickAction,
        metadata: metadata || {},
        timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString()
      });

    if (error) {
      console.error('Error tracking dashboard analytics:', error);
      // Don't fail the request - analytics shouldn't break UX
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return NextResponse.json({ success: true }); // Still return success to not break UX
  }
}

/**
 * GET - Retrieve dashboard analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const timeRange = parseInt(searchParams.get('timeRange') || '30', 10);

    const since = new Date();
    since.setDate(since.getDate() - timeRange);

    // Get widget engagement stats
    const { data: analytics } = await supabaseAdmin
      .from('dashboard_analytics')
      .select('widget_name, action, click_action, created_at')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    // Calculate widget metrics
    const widgetMetrics: Record<string, any> = {};
    
    analytics?.forEach(event => {
      if (!widgetMetrics[event.widget_name]) {
        widgetMetrics[event.widget_name] = {
          views: 0,
          clicks: 0,
          lastViewed: null
        };
      }

      if (event.action === 'view') {
        widgetMetrics[event.widget_name].views++;
        if (!widgetMetrics[event.widget_name].lastViewed) {
          widgetMetrics[event.widget_name].lastViewed = event.created_at;
        }
      } else if (event.action === 'click') {
        widgetMetrics[event.widget_name].clicks++;
      }
    });

    return NextResponse.json({
      metrics: widgetMetrics,
      totalEvents: analytics?.length || 0,
      timeRange
    });

  } catch (error) {
    console.error('Dashboard analytics GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}


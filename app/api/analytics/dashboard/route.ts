import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';

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
    if (!userId) throw Errors.unauthorized();

    const body = await request.json();
    const { widgetName, action, clickAction, metadata, timestamp } = body;

    if (!widgetName || !action) {
      throw Errors.invalidInput('widgetName and action are required');
    }

    // Store analytics event (fire and forget - don't block user)
    supabaseAdmin
      .from('dashboard_analytics')
      .insert({
        user_id: userId,
        widget_name: widgetName,
        action,
        click_action: clickAction,
        metadata: metadata || {},
        timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString()
      })
      .then(({ error: analyticsError }) => {
        if (analyticsError) {
          logger.warn('[DashboardAnalytics] Failed to track event', { userId, widgetName, action, error: analyticsError.message });
        }
      });

    logger.debug('[DashboardAnalytics] Event tracked', { userId, widgetName, action });
    return NextResponse.json({ success: true });

  } catch (error) {
    // Analytics failures shouldn't break UX - return success anyway
    logger.warn('[DashboardAnalytics] Request failed, returning success to not break UX', { error });
    return NextResponse.json({ success: true });
  }
}

/**
 * GET - Retrieve dashboard analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const searchParams = request.nextUrl.searchParams;
    const timeRange = parseInt(searchParams.get('timeRange') || '30', 10);

    // Validate time range
    if (timeRange < 1 || timeRange > 365) {
      throw Errors.invalidInput('timeRange must be between 1 and 365 days');
    }

    const since = new Date();
    since.setDate(since.getDate() - timeRange);

    // Get widget engagement stats
    const { data: analytics, error } = await supabaseAdmin
      .from('dashboard_analytics')
      .select('widget_name, action, click_action, created_at')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('[DashboardAnalytics] Failed to fetch analytics', error, { userId, timeRange });
      throw Errors.databaseError('Failed to fetch analytics');
    }

    // Calculate widget metrics
    interface WidgetMetric {
      views: number;
      clicks: number;
      lastViewed: string | null;
    }
    
    const widgetMetrics: Record<string, WidgetMetric> = {};
    
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

    logger.info('[DashboardAnalytics] Analytics fetched', { 
      userId, 
      totalEvents: analytics?.length || 0,
      widgetCount: Object.keys(widgetMetrics).length,
      timeRange
    });

    return NextResponse.json({
      metrics: widgetMetrics,
      totalEvents: analytics?.length || 0,
      timeRange
    });

  } catch (error) {
    return errorResponse(error);
  }
}


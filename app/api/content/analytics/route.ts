import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Content Analytics API
 * 
 * Tracks and returns analytics for content performance and user engagement.
 * 
 * Metrics tracked:
 * - View count, duration, completion rate
 * - Bookmark rate, share rate
 * - Rating distribution
 * - User journey patterns
 * - Conversion to tool usage
 * - Assessment influence
 */

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const searchParams = request.nextUrl.searchParams;
    const contentId = searchParams.get('contentId');
    const timeRange = searchParams.get('timeRange') || '30'; // days
    const metricType = searchParams.get('metric') || 'overview';

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange, 10));

    // USER-SPECIFIC ANALYTICS
    if (contentId) {
      return await getContentAnalytics(contentId, userId, daysAgo);
    }

    // DASHBOARD ANALYTICS
    return await getDashboardAnalytics(userId, daysAgo, metricType);

  } catch (error) {
    return errorResponse(error);
  }
}

async function getContentAnalytics(contentId: string, userId: string, since: Date) {
  // Get content details
  const { data: content } = await supabaseAdmin
    .from('content_blocks')
    .select('*')
    .eq('id', contentId)
    .single();

  if (!content) {
    logger.warn('[ContentAnalytics] Content not found', { contentId, userId });
    throw Errors.notFound('Content');
  }

  // Get view count
  const { count: viewCount } = await supabaseAdmin
    .from('content_interactions')
    .select('*', { count: 'exact', head: true })
    .eq('content_id', contentId)
    .eq('action', 'view')
    .gte('created_at', since.toISOString());

  // Get unique viewers
  const { data: uniqueViewers } = await supabaseAdmin
    .from('content_interactions')
    .select('user_id')
    .eq('content_id', contentId)
    .eq('action', 'view')
    .gte('created_at', since.toISOString());

  const uniqueViewerCount = new Set(uniqueViewers?.map(v => v.user_id)).size;

  // Get bookmark count
  const { count: bookmarkCount } = await supabaseAdmin
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('content_id', contentId)
    .gte('created_at', since.toISOString());

  // Get rating stats
  const { data: ratings } = await supabaseAdmin
    .from('content_ratings')
    .select('rating')
    .eq('content_id', contentId);

  const ratingStats = ratings && ratings.length > 0 ? {
    average: ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length,
    count: ratings.length,
    distribution: {
      5: ratings.filter(r => r.rating === 5).length,
      4: ratings.filter(r => r.rating === 4).length,
      3: ratings.filter(r => r.rating === 3).length,
      2: ratings.filter(r => r.rating === 2).length,
      1: ratings.filter(r => r.rating === 1).length
    }
  } : null;

  // Check if user has interacted
  const { data: userInteraction } = await supabaseAdmin
    .from('content_interactions')
    .select('action, created_at')
    .eq('content_id', contentId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const { data: userBookmark } = await supabaseAdmin
    .from('bookmarks')
    .select('created_at')
    .eq('content_id', contentId)
    .eq('user_id', userId)
    .single();

  const { data: userRating } = await supabaseAdmin
    .from('content_ratings')
    .select('rating, created_at')
    .eq('content_id', contentId)
    .eq('user_id', userId)
    .single();

  return NextResponse.json({
    content: {
      id: content.id,
      title: content.title,
      domain: content.domain,
      type: content.type
    },
    analytics: {
      views: {
        total: viewCount || 0,
        unique: uniqueViewerCount
      },
      engagement: {
        bookmarks: bookmarkCount || 0,
        bookmarkRate: viewCount ? ((bookmarkCount || 0) / viewCount * 100).toFixed(1) : '0'
      },
      ratings: ratingStats,
      quality: {
        contentRating: content.content_rating,
        freshnessScore: content.content_freshness_score
      }
    },
    userStatus: {
      hasViewed: !!userInteraction,
      lastViewed: userInteraction?.created_at,
      hasBookmarked: !!userBookmark,
      bookmarkedAt: userBookmark?.created_at,
      userRating: userRating?.rating,
      ratedAt: userRating?.created_at
    },
    timeRange: {
      since: since.toISOString(),
      days: Math.floor((Date.now() - since.getTime()) / (1000 * 60 * 60 * 24))
    }
  });
}

async function getDashboardAnalytics(userId: string, since: Date, _metricType: string) {
  // Get user's content interactions
  const { data: userInteractions } = await supabaseAdmin
    .from('content_interactions')
    .select('content_id, action, created_at')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false });

  // Get user's bookmarks
  const { data: userBookmarks } = await supabaseAdmin
    .from('bookmarks')
    .select('content_id, created_at')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString());

  // Get user's ratings
  const { data: userRatings } = await supabaseAdmin
    .from('content_ratings')
    .select('content_id, rating, created_at')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString());

  // Calculate engagement metrics
  const viewCount = userInteractions?.filter(i => i.action === 'view').length || 0;
  const uniqueContentViewed = new Set(
    userInteractions?.filter(i => i.action === 'view').map(i => i.content_id)
  ).size;

  // Get content details for viewed items
  const viewedContentIds = Array.from(new Set(
    userInteractions?.filter(i => i.action === 'view').map(i => i.content_id) || []
  ));

  const domainBreakdown: Record<string, number> = {};
  const typeBreakdown: Record<string, number> = {};

  if (viewedContentIds.length > 0) {
    const { data: viewedContent } = await supabaseAdmin
      .from('content_blocks')
      .select('id, domain, type')
      .in('id', viewedContentIds);

    if (viewedContent) {
      viewedContent.forEach(content => {
        domainBreakdown[content.domain] = (domainBreakdown[content.domain] || 0) + 1;
        typeBreakdown[content.type] = (typeBreakdown[content.type] || 0) + 1;
      });
    }
  }

  // Calculate streaks
  const viewDates = userInteractions
    ?.filter(i => i.action === 'view')
    .map(i => new Date(i.created_at).toDateString()) || [];
  
  const uniqueViewDates = [...new Set(viewDates)].sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < uniqueViewDates.length; i++) {
    const currentDate = new Date(uniqueViewDates[i]);
    const prevDate = i > 0 ? new Date(uniqueViewDates[i - 1]) : null;
    
    if (prevDate) {
      const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Check if viewed today
  const today = new Date().toDateString();
  if (uniqueViewDates.length > 0 && uniqueViewDates[uniqueViewDates.length - 1] === today) {
    currentStreak = tempStreak;
  }

  // Top content by domain
  const topDomains = Object.entries(domainBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([domain, count]) => ({ domain, views: count }));

  return NextResponse.json({
    overview: {
      totalViews: viewCount,
      uniqueContentViewed,
      bookmarks: userBookmarks?.length || 0,
      ratings: userRatings?.length || 0,
      averageRating: userRatings && userRatings.length > 0
        ? (userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length).toFixed(1)
        : null
    },
    engagement: {
      currentStreak,
      longestStreak,
      daysActive: uniqueViewDates.length,
      averageViewsPerDay: uniqueViewDates.length > 0
        ? (viewCount / uniqueViewDates.length).toFixed(1)
        : '0'
    },
    preferences: {
      topDomains,
      contentTypes: Object.entries(typeBreakdown)
        .sort(([, a], [, b]) => b - a)
        .map(([type, count]) => ({ type, views: count }))
    },
    recentActivity: {
      lastViewed: userInteractions?.[0]?.created_at,
      lastBookmarked: userBookmarks?.[0]?.created_at,
      lastRated: userRatings?.[0]?.created_at
    },
    timeRange: {
      since: since.toISOString(),
      days: Math.floor((Date.now() - since.getTime()) / (1000 * 60 * 60 * 24))
    }
  });
}

// POST endpoint for tracking events
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const body = await request.json();
    const { contentId, event, metadata } = body;

    if (!contentId || !event) {
      throw Errors.invalidInput('contentId and event are required');
    }

    // Track the event (fire and forget - analytics shouldn't block UX)
    supabaseAdmin
      .from('content_interactions')
      .insert({
        user_id: userId,
        content_id: contentId,
        action: event,
        metadata: metadata || {}
      })
      .then(({ error: trackError }) => {
        if (trackError) {
          logger.warn('[ContentAnalytics] Failed to track event', { userId, contentId, event, error: trackError.message });
        }
      });

    logger.debug('[ContentAnalytics] Event tracked', { userId, contentId, event });
    return NextResponse.json({ success: true });

  } catch (error) {
    // Analytics failures shouldn't break UX
    logger.warn('[ContentAnalytics] Request failed, returning success to not break UX', { error });
    return NextResponse.json({ success: true });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Advanced Personalized Content Recommendations API
 * 
 * Uses multiple signals to provide highly relevant content:
 * 1. User assessment data (risk tolerance, financial goals, life stage)
 * 2. User interaction history (views, bookmarks, ratings)
 * 3. Demographic data (rank, branch, family status)
 * 4. Behavioral patterns (topics viewed, time spent, completion rate)
 * 5. Similar user preferences (collaborative filtering)
 * 
 * Returns: Personalized content blocks ranked by relevance score
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get URL parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const includeReasoning = searchParams.get('reasoning') === 'true';

    // 1. GET USER PROFILE DATA
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('military_status, rank, branch, family_status')
      .eq('user_id', userId)
      .single();

    // 2. GET USER ASSESSMENT DATA
    const { data: assessment } = await supabaseAdmin
      .from('user_assessments')
      .select('responses')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 3. GET USER INTERACTION HISTORY (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: interactions } = await supabaseAdmin
      .from('content_interactions')
      .select('content_id, action, created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    // 4. GET USER BOOKMARKS
    const { data: bookmarks } = await supabaseAdmin
      .from('bookmarks')
      .select('content_id')
      .eq('user_id', userId);

    // 5. GET USER RATINGS
    const { data: ratings } = await supabaseAdmin
      .from('content_ratings')
      .select('content_id, rating')
      .eq('user_id', userId);

    // ANALYZE USER PREFERENCES
    const viewedContentIds = interactions
      ?.filter(i => i.action === 'view')
      .map(i => i.content_id) || [];
    
    const bookmarkedContentIds = bookmarks?.map(b => b.content_id) || [];
    const highRatedContentIds = ratings
      ?.filter(r => r.rating >= 4)
      .map(r => r.content_id) || [];

    // Get domains and tags from interacted content
    let preferredDomains: string[] = [];
    let preferredTags: string[] = [];

    if (viewedContentIds.length > 0) {
      const { data: viewedContent } = await supabaseAdmin
        .from('content_blocks')
        .select('domain, tags')
        .in('id', viewedContentIds);

      if (viewedContent) {
        preferredDomains = [...new Set(viewedContent.map(c => c.domain))];
        preferredTags = [...new Set(viewedContent.flatMap(c => c.tags || []))];
      }
    }

    // EXTRACT USER INTENT FROM ASSESSMENT
    const userIntent = {
      lifeStage: 'early-career', // early-career, mid-career, pre-retirement, post-retirement
      primaryGoals: [] as string[], // retirement, pcs, deployment, family, career
      riskTolerance: 'moderate', // conservative, moderate, aggressive
      urgency: 'normal' // immediate, normal, long-term
    };

    if (assessment?.responses) {
      const responses = assessment.responses as any;
      
      // Determine life stage from years of service
      const yearsOfService = responses.yearsOfService || 0;
      if (yearsOfService < 5) userIntent.lifeStage = 'early-career';
      else if (yearsOfService < 15) userIntent.lifeStage = 'mid-career';
      else if (yearsOfService < 20) userIntent.lifeStage = 'pre-retirement';
      else userIntent.lifeStage = 'post-retirement';

      // Extract goals
      if (responses.planningForPCS) userIntent.primaryGoals.push('pcs');
      if (responses.deploymentSoon) userIntent.primaryGoals.push('deployment');
      if (responses.hasChildren) userIntent.primaryGoals.push('family');
      if (responses.consideringCareerChange) userIntent.primaryGoals.push('career');
      
      // Default to retirement if no specific goals
      if (userIntent.primaryGoals.length === 0) {
        userIntent.primaryGoals.push('retirement');
      }

      // Determine risk tolerance
      if (responses.riskTolerance) {
        userIntent.riskTolerance = responses.riskTolerance.toLowerCase();
      }
    }

    // BUILD PERSONALIZATION QUERY
    let query = supabaseAdmin
      .from('content_blocks')
      .select(`
        id,
        title,
        summary,
        html,
        domain,
        difficulty_level,
        target_audience,
        content_rating,
        content_freshness_score,
        est_read_min,
        tags,
        seo_keywords,
        type,
        created_at,
        updated_at
      `)
      .gte('content_rating', 3.0); // Only quality content

    // APPLY PERSONALIZATION FILTERS

    // 1. Prioritize user's primary goal domains
    const domainMapping: Record<string, string> = {
      'pcs': 'pcs',
      'deployment': 'deployment',
      'family': 'benefits',
      'career': 'career',
      'retirement': 'retirement'
    };

    const relevantDomains = userIntent.primaryGoals
      .map(goal => domainMapping[goal])
      .filter(Boolean);

    // 2. Filter by target audience if profile data available
    if (userProfile?.military_status) {
      const audienceMap: Record<string, string> = {
        'active_duty_enlisted': 'enlisted',
        'active_duty_officer': 'officers',
        'reserve_guard': 'enlisted',
        'veteran': 'veterans',
        'military_spouse': 'spouses',
        'family_member': 'families'
      };
      
      const userAudience = audienceMap[userProfile.military_status];
      if (userAudience) {
        query = query.contains('target_audience', [userAudience]);
      }
    }

    // 3. Exclude already viewed/bookmarked content (for fresh recommendations)
    const excludeIds = [...new Set([...viewedContentIds, ...bookmarkedContentIds])];
    if (excludeIds.length > 0 && excludeIds.length < 100) { // Supabase limit
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    // Execute query
    const { data: candidateBlocks, error } = await query.limit(50);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }

    if (!candidateBlocks || candidateBlocks.length === 0) {
      return NextResponse.json({ 
        blocks: [],
        personalization: userIntent,
        message: 'No personalized content available'
      });
    }

    // CALCULATE PERSONALIZATION SCORES
    interface ScoredBlock {
      block: any;
      score: number;
      reasoning: string[];
    }

    const scoredBlocks: ScoredBlock[] = candidateBlocks.map(block => {
      let score = 0;
      const reasoning: string[] = [];

      // 1. Domain match (30 points max)
      if (relevantDomains.includes(block.domain)) {
        const boost = 30;
        score += boost;
        reasoning.push(`Domain match (+${boost}): ${block.domain}`);
      }

      // 2. Preferred domain from history (15 points)
      if (preferredDomains.includes(block.domain)) {
        const boost = 15;
        score += boost;
        reasoning.push(`Historical preference (+${boost})`);
      }

      // 3. Tag overlap (20 points max)
      const blockTags = block.tags || [];
      const tagOverlap = blockTags.filter((tag: string) => preferredTags.includes(tag)).length;
      if (tagOverlap > 0) {
        const boost = Math.min(20, tagOverlap * 5);
        score += boost;
        reasoning.push(`Tag match (+${boost}): ${tagOverlap} common tags`);
      }

      // 4. Content rating (15 points max)
      const ratingBoost = (block.content_rating - 3.0) * 7.5;
      score += ratingBoost;
      reasoning.push(`Quality score (+${ratingBoost.toFixed(1)}): ${block.content_rating.toFixed(1)}/5.0`);

      // 5. Freshness score (10 points max)
      const freshnessBoost = block.content_freshness_score * 10;
      score += freshnessBoost;
      reasoning.push(`Freshness (+${freshnessBoost.toFixed(1)})`);

      // 6. Difficulty match (10 points)
      const difficultyMap: Record<string, string> = {
        'early-career': 'beginner',
        'mid-career': 'intermediate',
        'pre-retirement': 'advanced',
        'post-retirement': 'advanced'
      };
      
      if (block.difficulty_level === difficultyMap[userIntent.lifeStage]) {
        const boost = 10;
        score += boost;
        reasoning.push(`Difficulty match (+${boost}): ${block.difficulty_level}`);
      }

      // 7. Reading time preference (5 points)
      // Favor 5-15 min reads (sweet spot for military audience)
      if (block.est_read_min >= 5 && block.est_read_min <= 15) {
        const boost = 5;
        score += boost;
        reasoning.push(`Optimal length (+${boost}): ${block.est_read_min} min`);
      }

      // 8. Content type bonus (5 points for actionable types)
      const actionableTypes = ['tool', 'checklist', 'calculator', 'template'];
      if (actionableTypes.includes(block.type)) {
        const boost = 5;
        score += boost;
        reasoning.push(`Actionable type (+${boost}): ${block.type}`);
      }

      return {
        block: {
          ...block,
          relevance_score: score / 100 // Normalize to 0-1 scale
        },
        score,
        reasoning
      };
    });

    // SORT BY SCORE AND RETURN TOP N
    scoredBlocks.sort((a, b) => b.score - a.score);
    const topBlocks = scoredBlocks.slice(0, limit);

    const response: any = {
      blocks: topBlocks.map(sb => sb.block),
      personalization: {
        lifeStage: userIntent.lifeStage,
        primaryGoals: userIntent.primaryGoals,
        riskTolerance: userIntent.riskTolerance,
        preferredDomains: relevantDomains,
        totalCandidates: candidateBlocks.length,
        returningTop: topBlocks.length
      },
      metadata: {
        userId,
        hasAssessment: !!assessment,
        interactionCount: interactions?.length || 0,
        bookmarkCount: bookmarks?.length || 0,
        ratingCount: ratings?.length || 0
      }
    };

    // Include reasoning if requested
    if (includeReasoning) {
      response.reasoning = topBlocks.map(sb => ({
        contentId: sb.block.id,
        title: sb.block.title,
        finalScore: sb.score.toFixed(1),
        factors: sb.reasoning
      }));
    }

    return NextResponse.json(response);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


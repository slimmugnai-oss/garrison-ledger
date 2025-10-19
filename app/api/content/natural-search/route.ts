import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Initialize OpenAI only if API key is available
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Natural Language Search API
 * 
 * Understands user intent from natural language queries and returns relevant content.
 * 
 * Examples:
 * - "I'm PCSing to Japan next month, what do I need to know?"
 * - "How can I maximize my TSP contributions as an E-5?"
 * - "My spouse wants to start a business during my deployment"
 * - "What insurance do I need when I separate from the military?"
 * 
 * Process:
 * 1. Parse natural language query with GPT-4
 * 2. Extract intent, entities, and search parameters
 * 3. Execute semantic search with extracted parameters
 * 4. Rank results by relevance to user's specific situation
 * 5. Return results with AI-generated context
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, limit = 10 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Check user's tier for rate limiting
    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const tier = (entitlement?.tier === 'premium' || entitlement?.tier === 'pro') && entitlement?.status === 'active' 
      ? entitlement.tier 
      : 'free';

    // Check rate limit quota
    const quotaCheck = await supabase.rpc('check_ai_quota', {
      p_user_id: userId,
      p_feature: 'natural_search',
      p_tier: tier
    });

    if (quotaCheck.data && !quotaCheck.data.canUse) {
      return NextResponse.json({
        error: 'Daily search limit reached',
        limit: quotaCheck.data.dailyLimit,
        used: quotaCheck.data.usedToday,
        resetTime: 'midnight',
        upgradeMessage: tier === 'free' 
          ? 'Upgrade to Premium for 10 searches per day'
          : tier === 'premium'
          ? 'Upgrade to Pro for 20 searches per day'
          : null
      }, { status: 429 });
    }

    // Check cache first (normalized query)
    const queryNormalized = query.toLowerCase().trim();
    const { data: cached } = await supabase
      .from('natural_search_cache')
      .select('*')
      .eq('query_normalized', queryNormalized)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (cached) {
      // Cache hit! No AI cost
      await supabase
        .from('natural_search_cache')
        .update({ hit_count: (cached.hit_count || 0) + 1 })
        .eq('id', cached.id);

      return NextResponse.json({
        results: cached.search_results,
        aiContext: cached.ai_context,
        cached: true,
        cacheHit: true
      });
    }

    // Cache miss - proceed with AI search and increment quota
    await supabase.rpc('increment_ai_quota', {
      p_user_id: userId,
      p_feature: 'natural_search'
    });

    // Check if OpenAI is configured
    if (!openai) {
      return NextResponse.json(
        { error: 'Natural language search is not configured' },
        { status: 503 }
      );
    }

    // STEP 1: PARSE NATURAL LANGUAGE QUERY WITH GPT-4
    const parseCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a military financial intelligence assistant. Parse user queries to extract search intent and parameters.

Extract:
1. Primary intent (what they want to accomplish)
2. Life stage (early-career, mid-career, pre-retirement, retiring, veteran)
3. Urgency (immediate, soon, planning, long-term)
4. Domain (finance, career, pcs, deployment, retirement, benefits, family)
5. Key entities (rank, location, family status, specific programs like TSP, SDP, VGLI)
6. Search keywords (for semantic search)

Return JSON only with these exact fields:
{
  "intent": "brief description",
  "lifeStage": "string",
  "urgency": "string",
  "domains": ["array of relevant domains"],
  "entities": {
    "rank": "if mentioned",
    "branch": "if mentioned",
    "location": "if mentioned",
    "program": "if mentioned",
    "familyStatus": "if mentioned"
  },
  "searchKeywords": ["array of keywords for semantic search"],
  "confidence": 0.0-1.0
}`
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const parsedQuery = JSON.parse(parseCompletion.choices[0].message.content || '{}');
    console.log('Parsed query:', parsedQuery);

    // STEP 2: EXECUTE SEMANTIC SEARCH
    // Use Supabase full-text search with extracted keywords
    const searchKeywords = parsedQuery.searchKeywords?.join(' ') || query;
    
    let searchQuery = supabaseAdmin
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
        type
      `)
      .gte('content_rating', 3.0)
      .textSearch('search_tsv', searchKeywords, {
        type: 'websearch',
        config: 'english'
      });

    // Apply domain filter if specified
    if (parsedQuery.domains && parsedQuery.domains.length > 0) {
      searchQuery = searchQuery.in('domain', parsedQuery.domains);
    }

    const { data: searchResults, error: searchError } = await searchQuery.limit(30);

    if (searchError) {
      console.error('Search error:', searchError);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    if (!searchResults || searchResults.length === 0) {
      // Fall back to basic domain-based search
      const fallbackQuery = supabaseAdmin
        .from('content_blocks')
        .select('*')
        .gte('content_rating', 3.0)
        .order('content_rating', { ascending: false })
        .limit(10);

      if (parsedQuery.domains && parsedQuery.domains.length > 0) {
        fallbackQuery.in('domain', parsedQuery.domains);
      }

      const { data: fallbackResults } = await fallbackQuery;

      return NextResponse.json({
        blocks: fallbackResults || [],
        searchMetadata: {
          originalQuery: query,
          parsedIntent: parsedQuery,
          resultsFound: fallbackResults?.length || 0,
          searchType: 'fallback'
        }
      });
    }

    // STEP 3: RANK RESULTS BY RELEVANCE TO USER'S SPECIFIC SITUATION
    interface ScoredResult {
      block: any;
      score: number;
      reasoning: string[];
    }

    const scoredResults: ScoredResult[] = searchResults.map(block => {
      let score = 0;
      const reasoning: string[] = [];

      // Base relevance from search (estimated)
      score += 50;
      reasoning.push('Base search match (+50)');

      // Domain match bonus
      if (parsedQuery.domains && parsedQuery.domains.includes(block.domain)) {
        score += 20;
        reasoning.push(`Domain match (+20): ${block.domain}`);
      }

      // Urgency match
      if (parsedQuery.urgency === 'immediate' && block.type === 'tool') {
        score += 15;
        reasoning.push('Actionable content for urgent need (+15)');
      }

      // Content quality
      const qualityBoost = (block.content_rating - 3.0) * 10;
      score += qualityBoost;
      reasoning.push(`Quality (+${qualityBoost.toFixed(1)}): ${block.content_rating.toFixed(1)}/5.0`);

      // Freshness
      score += block.content_freshness_score * 10;
      reasoning.push(`Freshness (+${(block.content_freshness_score * 10).toFixed(1)})`);

      // Entity match bonus
      if (parsedQuery.entities) {
        const entityStr = JSON.stringify(parsedQuery.entities).toLowerCase();
        const contentStr = `${block.title} ${block.summary || ''} ${block.tags?.join(' ')}`.toLowerCase();
        
        let entityMatches = 0;
        if (parsedQuery.entities.program && contentStr.includes(parsedQuery.entities.program.toLowerCase())) {
          entityMatches++;
        }
        if (parsedQuery.entities.location && contentStr.includes(parsedQuery.entities.location.toLowerCase())) {
          entityMatches++;
        }
        
        if (entityMatches > 0) {
          const boost = entityMatches * 10;
          score += boost;
          reasoning.push(`Entity match (+${boost}): ${entityMatches} entities found`);
        }
      }

      return { block, score, reasoning };
    });

    // Sort by score
    scoredResults.sort((a, b) => b.score - a.score);
    const topResults = scoredResults.slice(0, limit);

    // STEP 4: GENERATE AI CONTEXT FOR RESULTS
    const contextCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a military financial advisor. Given a user's query and search results, provide a brief, actionable context paragraph.

Guidelines:
- Address user's specific situation
- Explain why these results are relevant
- Suggest what to focus on first
- Use military terminology appropriately
- Keep it under 100 words
- Be direct and actionable`
        },
        {
          role: 'user',
          content: `User query: "${query}"

Parsed intent: ${parsedQuery.intent}

Top results found:
${topResults.slice(0, 5).map(r => `- ${r.block.title} (${r.block.domain})`).join('\n')}

Provide context for these results.`
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const aiContext = contextCompletion.choices[0].message.content;

    // Return results with metadata
    // Save to cache for future requests
    const resultsToCache = topResults.map(r => ({
      ...r.block,
      relevance_score: r.score / 100,
      match_reasoning: r.reasoning
    }));

    await supabase
      .from('natural_search_cache')
      .upsert({
        query_normalized: queryNormalized,
        search_results: resultsToCache,
        ai_context: aiContext,
        cached_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        hit_count: 0
      }, {
        onConflict: 'query_normalized'
      });

    return NextResponse.json({
      blocks: resultsToCache,
      searchMetadata: {
        originalQuery: query,
        parsedIntent: parsedQuery,
        resultsFound: searchResults.length,
        returningTop: topResults.length,
        searchType: 'natural_language',
        aiContext
      },
      cached: false
    });

  } catch (error) {
    console.error('Natural search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}


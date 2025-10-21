import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { logger } from '@/lib/logger';
import { errorResponse, Errors } from '@/lib/api-errors';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null;
function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Get user's calculator insights
    const { data: insights } = await supabaseAdmin.rpc('get_user_insights', {
      p_user_id: userId
    });

    // Get cross-calculator patterns
    const { data: patterns } = await supabaseAdmin.rpc('get_cross_calculator_patterns', {
      p_user_id: userId
    });

    // Get existing active recommendations
    const { data: existingRecs } = await supabaseAdmin
      .from('ai_recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_dismissed', false)
      .order('priority', { ascending: false })
      .limit(5);

    // If no usage data yet, return starter recommendations
    if (!insights || insights.total_calculations === 0) {
      logger.info('[AIRecommendations] Returning starter recommendations', { userId });
      return NextResponse.json({
        recommendations: [
          {
            type: 'calculator',
            title: 'Start with TSP Allocation',
            description: 'Model your retirement savings with our TSP calculator. See how fund allocation affects long-term growth.',
            priority: 90,
            calculator_related: 'tsp',
            action_url: '/dashboard/tools/tsp-modeler'
          },
          {
            type: 'calculator',
            title: 'Plan Your Next PCS',
            description: 'Calculate your PCS entitlements and potential savings. Includes PPM profit calculator.',
            priority: 85,
            calculator_related: 'pcs',
            action_url: '/dashboard/tools/pcs-planner'
          },
          {
            type: 'resource',
            title: 'Explore On-Base Savings',
            description: 'Discover how much you can save shopping at the commissary and exchange.',
            priority: 80,
            calculator_related: 'savings',
            action_url: '/dashboard/tools/on-base-savings'
          }
        ],
        insights: {
          message: 'Welcome! Start exploring our calculators to get personalized recommendations.'
        }
      });
    }

    logger.info('[AIRecommendations] Recommendations fetched', { 
      userId, 
      recCount: existingRecs?.length || 0,
      totalCalculations: insights?.total_calculations 
    });

    return NextResponse.json({
      recommendations: existingRecs || [],
      insights: insights,
      patterns: patterns || []
    });

  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Check cache first (24-hour cache)
    const { data: cached } = await supabaseAdmin
      .from('ai_recommendation_cache')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (cached) {
      // Cache hit! Return cached recommendations (no AI cost)
      logger.info('[AIRecommendations] Cache hit', { userId });
      return NextResponse.json({
        recommendations: cached.recommendations,
        cached: true,
        cachedAt: cached.cached_at
      });
    }

    const body = await request.json();
    const { calculatorName, inputs, outputs, sessionDuration } = body;

    if (!calculatorName) {
      throw Errors.invalidInput('calculatorName is required');
    }

    // Log the calculator usage
    await supabaseAdmin.from('calculator_usage_log').insert({
      user_id: userId,
      calculator_name: calculatorName,
      inputs: inputs,
      outputs: outputs,
      session_duration_seconds: sessionDuration
    });

    // Update user profile
    await supabaseAdmin.rpc('update_user_calculator_profile', {
      p_user_id: userId,
      p_calculator_name: calculatorName
    });

    // Get updated insights
    const { data: insights } = await supabaseAdmin.rpc('get_user_insights', {
      p_user_id: userId
    });

    // Get patterns
    const { data: patterns } = await supabaseAdmin.rpc('get_cross_calculator_patterns', {
      p_user_id: userId
    });

    // Generate AI recommendations if user has enough data (5+ calculations)
    if (insights && insights.total_calculations >= 5) {
      logger.info('[AIRecommendations] Generating AI recommendations', { userId, totalCalcs: insights.total_calculations });
      await generateAIRecommendations(userId, insights, patterns, calculatorName, outputs);
    }

    logger.info('[AIRecommendations] Usage tracked', { userId, calculatorName });
    return NextResponse.json({ 
      success: true, 
      insights,
      patterns 
    });

  } catch (error) {
    return errorResponse(error);
  }
}

// Helper function to generate AI recommendations
async function generateAIRecommendations(
  userId: string,
  insights: Record<string, unknown>,
  patterns: unknown[],
  lastCalculator: string,
  lastOutputs: Record<string, unknown>
) {
  try {
    // Build context for AI
    const context = `
User Calculator Profile:
- Total calculations: ${insights.total_calculations}
- Calculators used: ${insights.calculators_count}
- Most used: ${insights.most_used_calculator}
- Days active: ${insights.days_active}
- Last calculator: ${lastCalculator}

Detected Patterns:
${
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patterns?.map((p: any) => `- ${p.pattern_name}: ${p.frequency} occurrences`).join('\n') || 'None yet'
}

Latest Results (${lastCalculator}):
${JSON.stringify(lastOutputs, null, 2)}
`;

    const prompt = `You are a military financial advisor analyzing a service member's calculator usage on Garrison Ledger.

${context}

Based on this usage pattern, generate 2-3 actionable recommendations. Each recommendation should:
1. Be specific and actionable
2. Reference relevant calculators they haven't tried yet
3. Connect to their detected patterns
4. Provide clear next steps

Return ONLY a JSON array of recommendations in this exact format:
[
  {
    "type": "calculator|action|resource|goal",
    "title": "Short title (max 60 chars)",
    "description": "Clear description with specific benefit (max 150 chars)",
    "priority": 50-100,
    "calculator_related": "tsp|sdp|pcs|house|savings|career",
    "action_url": "/dashboard/tools/..."
  }
]`;

    const aiClient = getOpenAI();
    if (!aiClient) {
      logger.warn('[AIRecommendations] OpenAI not configured, skipping AI generation');
      return;
    }

    const startTime = Date.now();
    const completion = await aiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a military financial advisor. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const duration = Date.now() - startTime;
    const aiResponse = completion.choices[0].message.content;
    if (!aiResponse) {
      logger.warn('[AIRecommendations] Empty AI response', { userId });
      return;
    }

    const recommendations = JSON.parse(aiResponse);
    logger.info('[AIRecommendations] AI recommendations generated', { 
      userId, 
      count: recommendations.length,
      duration 
    });

    // Store recommendations in database
    for (const rec of recommendations) {
      await supabaseAdmin.from('ai_recommendations').insert({
        user_id: userId,
        recommendation_type: rec.type,
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
        calculator_related: rec.calculator_related,
        action_url: rec.action_url,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
    }

    // Cache the recommendations for 24 hours (96% cost reduction!)
    await supabaseAdmin
      .from('ai_recommendation_cache')
      .upsert({
        user_id: userId,
        recommendations: recommendations,
        cached_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        cache_key: `${userId}_${Date.now()}`
      }, {
        onConflict: 'user_id'
      });

  } catch (error) {
    // Don't throw - recommendations are nice-to-have, not critical
    logger.error('[AIRecommendations] Failed to generate AI recommendations', error, { userId });
  }
}


import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * AI-POWERED PERSONALIZED PLAN GENERATOR
 * 
 * Phase 1: AI Master Curator
 * - Reads user's deep profile and assessment data
 * - Analyzes all 400+ content blocks in the Knowledge Graph
 * - Intelligently selects 8-10 most relevant blocks
 * 
 * Phase 2: AI Narrative Weaver
 * - Writes personalized executive summary
 * - Creates smooth introductions and transitions
 * - Weaves together hand-curated content blocks into cohesive plan
 */

const CURATOR_PROMPT = `You are an expert military financial advisor with deep knowledge of military benefits, career transitions, and financial planning.

Your task is to analyze a service member's profile and assessment data, then curate the most relevant content from our Knowledge Graph.

USER PROFILE:
{userProfile}

ASSESSMENT RESPONSES:
{assessmentResponses}

AVAILABLE CONTENT BLOCKS (Knowledge Graph):
{contentBlocks}

CURATION TASK:
1. Analyze the user's situation, goals, and priorities
2. Identify the 8-10 most relevant content blocks from our Knowledge Graph
3. Prioritize content that directly addresses their biggest concerns and goals
4. Consider their rank, branch, family situation, timeline, and financial priorities
5. Balance immediate needs (high urgency) with long-term goals

SELECTION CRITERIA:
- Direct relevance to stated concerns and goals
- Appropriate difficulty level for their experience
- Matches their target audience (rank, family status)
- Addresses their timeline (PCS date, deployment status)
- Covers their financial priorities
- Provides actionable guidance

RETURN (JSON):
{
  "selectedBlocks": [
    {
      "id": "uuid",
      "title": "Content Block Title",
      "relevanceScore": 9.5,
      "relevanceReason": "Why this is critical for this user"
    }
  ],
  "primaryFocus": "What should be their #1 priority right now",
  "secondaryFocus": "What should they tackle next",
  "urgencyLevel": "low|normal|high|critical"
}`;

const NARRATIVE_PROMPT = `You are an expert military financial advisor writing a personalized financial plan.

You have already selected 8-10 hand-curated content blocks from our proprietary Knowledge Graph. Now you need to weave them together into a cohesive, personalized plan.

USER PROFILE:
{userProfile}

ASSESSMENT RESPONSES:
{assessmentResponses}

CURATED CONTENT BLOCKS:
{curatedBlocks}

NARRATIVE TASK:
1. Write a compelling executive summary (3-4 paragraphs)
2. Create personalized introductions for each content section
3. Write smooth transitions between sections
4. Explain WHY each piece of content matters for THIS specific person
5. Add personalized action items and next steps

EXECUTIVE SUMMARY SHOULD INCLUDE:
- Personal acknowledgment of their current situation
- Recognition of their specific challenges and goals
- Clear statement of priorities and timeline
- Confidence-building message about their path forward

SECTION INTRODUCTIONS SHOULD:
- Connect to their specific situation
- Explain why this content matters NOW
- Set context for the hand-curated content
- Use military-friendly language

RETURN (JSON):
{
  "executiveSummary": "3-4 paragraph personalized summary",
  "sectionIntros": [
    {
      "blockId": "uuid",
      "introduction": "Personalized intro for this content block",
      "whyThisMatters": "Direct relevance to user's situation",
      "actionableNextStep": "Specific next step for this user"
    }
  ],
  "finalRecommendations": [
    "Immediate action item 1",
    "Immediate action item 2",
    "Near-term goal 1",
    "Long-term priority 1"
  ],
  "recommendedTools": [
    {
      "toolName": "TSP Modeler|PCS Planner|House Hacking|SDP Strategist|Salary Calculator|On-Base Savings",
      "reason": "Why this tool is relevant for this user"
    }
  ]
}`;

interface ContentBlock {
  id: string;
  title: string;
  domain: string;
  difficulty_level: string;
  target_audience: string[];
  tags: string[];
  topics: string[];
  text_content: string;
  summary: string;
  est_read_min: number;
  content_rating: number;
}

interface SelectedBlock {
  id: string;
  title: string;
  relevanceScore: number;
  relevanceReason: string;
}

interface CurationResult {
  selectedBlocks?: SelectedBlock[];
  primaryFocus?: string;
  secondaryFocus?: string;
  urgencyLevel?: string;
}

interface SectionIntro {
  blockId: string;
  introduction?: string;
  whyThisMatters?: string;
  actionableNextStep?: string;
}

interface NarrativeResult {
  executiveSummary?: string;
  sectionIntros?: SectionIntro[];
  finalRecommendations?: string[];
  recommendedTools?: Array<{ toolName: string; reason: string }>;
}

interface FullBlock {
  id: string;
  title: string;
  domain: string;
  html: string;
  text_content: string;
  est_read_min: number;
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Load user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ 
        error: "Profile not found. Please complete your profile first." 
      }, { status: 404 });
    }

    // Load assessment responses
    const { data: assessmentData, error: assessmentError } = await supabaseAdmin
      .from('user_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (assessmentError) {
      console.error('[Plan Generation] Assessment load error:', assessmentError);
    }

    const assessmentResponses = assessmentData?.responses || {};

    // Load all content blocks (Knowledge Graph)
    const { data: contentBlocks, error: blocksError } = await supabaseAdmin
      .from('content_blocks')
      .select('id, title, domain, difficulty_level, target_audience, tags, topics, text_content, summary, est_read_min, content_rating')
      .order('content_rating', { ascending: false });

    if (blocksError || !contentBlocks) {
      console.error('[Plan Generation] Content blocks load error:', blocksError);
      return NextResponse.json({ 
        error: "Failed to load content library" 
      }, { status: 500 });
    }

    console.log(`[Plan Generation] Loaded ${contentBlocks.length} content blocks for curation`);

    // Initialize OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: "AI service not configured" 
      }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    // ===================================
    // PHASE 1: AI MASTER CURATOR
    // ===================================
    console.log('[Plan Generation] Phase 1: AI Master Curator - Selecting relevant content blocks');

    // Format profile for AI
    const profileSummary = `
Rank: ${profile.rank || 'Not specified'}
Branch: ${profile.branch || 'Not specified'}
Service Status: ${profile.component || 'Not specified'}
Time in Service: ${profile.time_in_service_months ? `${Math.floor(profile.time_in_service_months / 12)} years` : 'Not specified'}
Current Base: ${profile.current_base || 'Not specified'}
PCS Date: ${profile.pcs_date || 'None scheduled'}
Deployment Status: ${profile.deployment_status || 'Not specified'}
Marital Status: ${profile.marital_status || 'Not specified'}
Children: ${profile.num_children || 0}
EFMP: ${profile.has_efmp ? 'Yes' : 'No'}
TSP Balance: ${profile.tsp_balance_range || 'Not specified'}
Debt: ${profile.debt_amount_range || 'Not specified'}
Emergency Fund: ${profile.emergency_fund_range || 'Not specified'}
Housing: ${profile.housing_situation || 'Not specified'}
Long-term Goal: ${profile.long_term_goal || 'Not specified'}
Financial Priorities: ${profile.financial_priorities?.join(', ') || 'Not specified'}
Career Interests: ${profile.career_interests?.join(', ') || 'Not specified'}
`;

    // Format content blocks for AI (simplified for token efficiency)
    const blocksForAI = contentBlocks.map((block: ContentBlock) => ({
      id: block.id,
      title: block.title,
      domain: block.domain,
      difficulty: block.difficulty_level,
      audience: block.target_audience,
      tags: block.tags,
      summary: block.summary || block.text_content.substring(0, 200),
      rating: block.content_rating
    }));

    const curationCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: CURATOR_PROMPT
            .replace('{userProfile}', profileSummary)
            .replace('{assessmentResponses}', JSON.stringify(assessmentResponses, null, 2))
            .replace('{contentBlocks}', JSON.stringify(blocksForAI, null, 2))
        },
        {
          role: "user",
          content: "Please analyze this service member's situation and curate the 8-10 most relevant content blocks from our Knowledge Graph."
        }
      ],
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const curationResult = JSON.parse(curationCompletion.choices[0]?.message?.content || '{}') as CurationResult;
    console.log(`[Plan Generation] Phase 1 Complete: Selected ${curationResult.selectedBlocks?.length || 0} content blocks`);

    // ===================================
    // PHASE 2: AI NARRATIVE WEAVER
    // ===================================
    console.log('[Plan Generation] Phase 2: AI Narrative Weaver - Creating personalized narrative');

    // Get full content for selected blocks
    const selectedBlockIds = curationResult.selectedBlocks?.map(b => b.id) || [];
    const { data: fullBlocks } = await supabaseAdmin
      .from('content_blocks')
      .select('*')
      .in('id', selectedBlockIds);

    // Format curated blocks for narrative generation
    const curatedBlocksForNarrative = curationResult.selectedBlocks?.map(selected => {
      const fullBlock = (fullBlocks as FullBlock[] | null)?.find(b => b.id === selected.id);
      return {
        id: selected.id,
        title: selected.title,
        relevanceReason: selected.relevanceReason,
        domain: fullBlock?.domain,
        text_preview: fullBlock?.text_content?.substring(0, 300)
      };
    });

    const narrativeCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: NARRATIVE_PROMPT
            .replace('{userProfile}', profileSummary)
            .replace('{assessmentResponses}', JSON.stringify(assessmentResponses, null, 2))
            .replace('{curatedBlocks}', JSON.stringify(curatedBlocksForNarrative, null, 2))
        },
        {
          role: "user",
          content: "Please create a personalized narrative that weaves together these hand-curated content blocks into a cohesive, actionable plan."
        }
      ],
      temperature: 0.6,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    const narrativeResult = JSON.parse(narrativeCompletion.choices[0]?.message?.content || '{}') as NarrativeResult;
    console.log('[Plan Generation] Phase 2 Complete: Narrative generated');

    // ===================================
    // ASSEMBLE FINAL PLAN
    // ===================================
    const personalizedPlan = {
      userId,
      generatedAt: new Date().toISOString(),
      
      // AI-generated narrative elements
      executiveSummary: narrativeResult.executiveSummary,
      primaryFocus: curationResult.primaryFocus,
      secondaryFocus: curationResult.secondaryFocus,
      urgencyLevel: curationResult.urgencyLevel,
      
      // Hand-curated content blocks with AI-generated context
      contentBlocks: (fullBlocks as FullBlock[] | null)?.map(block => {
        const curation = curationResult.selectedBlocks?.find(b => b.id === block.id);
        const narrative = narrativeResult.sectionIntros?.find(s => s.blockId === block.id);
        
        return {
          id: block.id,
          title: block.title,
          domain: block.domain,
          html: block.html,
          text_content: block.text_content,
          est_read_min: block.est_read_min,
          
          // AI-generated personalized context
          relevanceScore: curation?.relevanceScore,
          relevanceReason: curation?.relevanceReason,
          personalizedIntro: narrative?.introduction,
          whyThisMatters: narrative?.whyThisMatters,
          actionableNextStep: narrative?.actionableNextStep
        };
      }),
      
      // Final recommendations
      finalRecommendations: narrativeResult.finalRecommendations,
      recommendedTools: narrativeResult.recommendedTools
    };

    // Store the generated plan
    const { error: saveError } = await supabaseAdmin
      .from('user_plans')
      .upsert({
        user_id: userId,
        plan_data: personalizedPlan,
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (saveError) {
      console.error('[Plan Generation] Save error:', saveError);
    }

    // Update profile with plan generation count
    await supabaseAdmin
      .from('user_profiles')
      .update({ 
        plan_generated_count: (profile.plan_generated_count || 0) + 1 
      })
      .eq('user_id', userId);

    console.log('[Plan Generation] ✅ Complete - Plan generated and saved');

    return NextResponse.json({
      success: true,
      plan: personalizedPlan
    });

  } catch (error) {
    console.error('[Plan Generation] Error:', error);
    return NextResponse.json({ 
      error: "Failed to generate personalized plan",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


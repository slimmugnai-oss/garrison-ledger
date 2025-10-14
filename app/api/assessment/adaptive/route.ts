/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * ADAPTIVE ASSESSMENT ENGINE - GPT-4o
 * Intelligently determines next question based on previous answers
 * Reduces assessment from 30 questions to ~10 questions
 */

type Question = {
  id: string;
  question: string;
  type: 'select' | 'multiselect' | 'text' | 'number';
  options?: string[];
  context?: string; // Why we're asking this
};

type AssessmentState = {
  answers: Record<string, any>;
  questionsAsked: string[];
};

const CORE_QUESTIONS = [
  {
    id: 'service_status',
    question: 'What is your current service status?',
    type: 'select' as const,
    options: ['Active Duty', 'Reserve', 'National Guard', 'Retired', 'Veteran (Separated)', 'Separating (within 12 months)', 'Military Spouse / Dependent', 'DoD Civilian / Contractor'],
    context: 'Determines available benefits and relevant planning needs'
  },
  {
    id: 'branch',
    question: 'What branch did you serve in?',
    type: 'select' as const,
    options: ['Army', 'Navy', 'Air Force', 'Marines', 'Coast Guard', 'Space Force'],
    context: 'Determines which rank structure and benefits apply'
  },
  {
    id: 'rank',
    question: 'What is/was your rank?',
    type: 'select' as const,
    options: ['E-1 to E-4', 'E-5 to E-6', 'E-7 to E-9', 'W-1 to W-5 (Warrant)', 'O-1 to O-3', 'O-4 to O-6', 'O-7+'],
    context: 'Helps determine appropriate financial strategies'
  },
  {
    id: 'pcs_situation',
    question: 'What is your PCS situation?',
    type: 'select' as const,
    options: ['Just arrived (0-6 months)', 'Dwell time (settled)', 'PCS window (6-18 months)', 'Orders in hand', 'No PCS expected'],
    context: 'Determines move-related priorities'
  },
  {
    id: 'family_status',
    question: 'What is your family situation?',
    type: 'select' as const,
    options: ['Single, no kids', 'Married, no kids', 'Married with young kids (0-5)', 'Married with school-age kids (6-18)', 'Single parent'],
    context: 'Affects financial planning and PCS complexity'
  },
  {
    id: 'deployment_status',
    question: 'What is your deployment status?',
    type: 'select' as const,
    options: ['Never deployed', 'Pre-deployment (notified)', 'Currently deployed', 'Recently returned (0-6 months)', 'Multiple deployments'],
    context: 'Impacts financial and family planning needs'
  },
  {
    id: 'biggest_concern',
    question: 'What is your biggest financial concern right now?',
    type: 'select' as const,
    options: ['Debt payoff', 'Emergency fund', 'TSP/retirement', 'House purchase', 'Career transition', 'Deployment prep'],
    context: 'Sets primary focus for your plan'
  }
];

const ADAPTIVE_PROMPT = `You are an expert military financial advisor conducting an adaptive assessment.

Your task: Based on the user's previous answers, determine the NEXT most important question to ask.

RULES:
- Ask ONLY questions that are relevant based on their previous answers
- Skip questions where the answer is already known or obvious
- Prioritize questions that will significantly change the recommendations
- Maximum 10 total questions (5 core + 5 adaptive)
- Questions should be specific and tactical

EXAMPLE LOGIC:
- If they said "Orders in hand" → Ask about school-age kids for enrollment planning
- If they said "Pre-deployment" → Ask about SDP and legal prep
- If they said "Married with kids" + "PCS window" → Ask about EFMP enrollment
- If they said "Debt payoff" concern → Ask about debt amount ranges
- If they said "Career transition" → Ask about federal employment interest

PREVIOUS ANSWERS:
{previousAnswers}

QUESTIONS ALREADY ASKED:
{questionsAsked}

RETURN (JSON):
If more questions needed:
{
  "needsMore": true,
  "nextQuestion": {
    "id": "efmp_enrolled",
    "question": "Is anyone in your family enrolled in EFMP (Exceptional Family Member Program)?",
    "type": "select",
    "options": ["Yes", "No", "Not sure"],
    "context": "With school-age kids and PCS orders, EFMP status affects enrollment timelines"
  }
}

If assessment is complete:
{
  "needsMore": false,
  "reason": "Have enough information to generate personalized plan"
}`;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: AssessmentState;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { answers, questionsAsked } = body;

  // Load user profile to skip already-answered questions
  let profile: any = null;
  if (questionsAsked.length === 0) {
    // First question - check if we have profile data
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await supabase
      .from('user_profiles')
      .select('service_status, spouse_service_status, rank, branch, current_base, pcs_date, deployment_status, marital_status, num_children, has_efmp')
      .eq('user_id', userId)
      .maybeSingle();
    profile = data;
  }

  // If this is the first question, check profile and skip answered questions
  if (questionsAsked.length === 0) {
    // Build pre-answered data from profile
    const preAnswered: Record<string, string> = {};
    if (profile) {
      // Map service_status to assessment options
      if (profile.service_status) {
        const statusMap: Record<string, string> = {
          'active_duty': 'Active Duty',
          'reserve': 'Reserve',
          'national_guard': 'National Guard',
          'retired': 'Retired',
          'veteran': 'Veteran (Separated)',
          'separating': 'Separating (within 12 months)',
          'military_spouse': 'Military Spouse / Dependent',
          'dod_civilian': 'DoD Civilian / Contractor'
        };
        preAnswered.service_status = statusMap[profile.service_status] || profile.service_status;
      }
      if (profile.branch) preAnswered.branch = profile.branch;
      if (profile.rank) {
        // Map specific rank to rank range for assessment
        const rankUpper = profile.rank.toUpperCase();
        if (rankUpper.includes('E-1') || rankUpper.includes('E-2') || rankUpper.includes('E-3') || rankUpper.includes('E-4')) {
          preAnswered.rank = 'E-1 to E-4';
        } else if (rankUpper.includes('E-5') || rankUpper.includes('E-6')) {
          preAnswered.rank = 'E-5 to E-6';
        } else if (rankUpper.includes('E-7') || rankUpper.includes('E-8') || rankUpper.includes('E-9')) {
          preAnswered.rank = 'E-7 to E-9';
        } else if (rankUpper.includes('W-') || rankUpper.includes('WO') || rankUpper.includes('CW')) {
          preAnswered.rank = 'W-1 to W-5 (Warrant)';
        } else if (rankUpper.includes('O-1') || rankUpper.includes('O-2') || rankUpper.includes('O-3')) {
          preAnswered.rank = 'O-1 to O-3';
        } else if (rankUpper.includes('O-4') || rankUpper.includes('O-5') || rankUpper.includes('O-6')) {
          preAnswered.rank = 'O-4 to O-6';
        } else if (rankUpper.includes('O-7') || rankUpper.includes('O-8') || rankUpper.includes('O-9') || rankUpper.includes('O-10')) {
          preAnswered.rank = 'O-7+';
        }
      }
      if (profile.pcs_date) preAnswered.pcs_situation = 'Orders in hand';
      if (profile.deployment_status) preAnswered.deployment_status = profile.deployment_status;
      if (profile.marital_status) {
        const maritalMap: Record<string, string> = {
          'single': 'Single, no kids',
          'married': profile.num_children > 0 
            ? (profile.num_children <= 5 ? 'Married with young kids (0-5)' : 'Married with school-age kids (6-18)')
            : 'Married, no kids',
          'single_parent': 'Single parent'
        };
        preAnswered.family_status = maritalMap[profile.marital_status] || profile.marital_status;
      }
    }
    
    // Find first unanswered core question
    const firstUnanswered = CORE_QUESTIONS.find(q => !preAnswered[q.id]);
    
    if (firstUnanswered) {
      return NextResponse.json({
        needsMore: true,
        nextQuestion: firstUnanswered,
        preAnswered // Send pre-filled answers to frontend
      });
    }
    
    // If all core questions answered via profile, return first core question anyway
    return NextResponse.json({
      needsMore: true,
      nextQuestion: CORE_QUESTIONS[0]
    });
  }

  // If we've asked all core questions, use AI to determine next adaptive question
  const coreQuestionsAsked = CORE_QUESTIONS.filter(q => questionsAsked.includes(q.id)).length;
  
  if (coreQuestionsAsked < CORE_QUESTIONS.length) {
    // Still going through core questions
    const nextCore = CORE_QUESTIONS.find(q => !questionsAsked.includes(q.id));
    if (nextCore) {
      return NextResponse.json({
        needsMore: true,
        nextQuestion: nextCore
      });
    }
  }

  // All core questions asked - use AI for adaptive questions
  if (questionsAsked.length >= 10) {
    // Max questions reached
    return NextResponse.json({
      needsMore: false,
      reason: 'Assessment complete - enough data to generate personalized plan'
    });
  }

  // Call GPT-4o to determine next question
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Fall back to completing assessment
    return NextResponse.json({
      needsMore: false,
      reason: 'Assessment complete'
    });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const previousAnswersSummary = Object.entries(answers)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use mini for cost efficiency
      messages: [
        { 
          role: "system", 
          content: ADAPTIVE_PROMPT
            .replace('{previousAnswers}', previousAnswersSummary)
            .replace('{questionsAsked}', questionsAsked.join(', '))
        },
        { 
          role: "user", 
          content: "What should I ask next, or is the assessment complete?" 
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const result = JSON.parse(responseText);

    return NextResponse.json(result);

  } catch (error) {
    console.error('[Adaptive Assessment] Error:', error);
    // Fall back to completing assessment
    return NextResponse.json({
      needsMore: false,
      reason: 'Assessment complete'
    });
  }
}


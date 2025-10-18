/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDynamicQuestions } from "@/app/lib/assessment/dynamic-questions";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * ADAPTIVE ASSESSMENT ENGINE - Gemini 2.0 Flash
 * Intelligently determines next question based on previous answers
 * Reduces assessment from 30 questions to ~10 questions
 * 50% cost reduction vs GPT-4o-mini!
 */

// Removed unused type - questions are defined inline in CORE_QUESTIONS

type AssessmentState = {
  answers: Record<string, any>;
  questionsAsked: string[];
};

// Core questions that are NOT covered in profile setup
// Profile already covers: service_status, branch, rank, marital_status, num_children, has_efmp, pcs_date
const CORE_QUESTIONS = [
  {
    id: 'biggest_concern',
    question: 'What is your biggest financial concern right now?',
    type: 'select' as const,
    options: ['Debt payoff', 'Emergency fund', 'TSP/retirement', 'House purchase', 'Career transition', 'Deployment prep'],
    context: 'Sets primary focus for your plan'
  },
  {
    id: 'deployment_status',
    question: 'What is your deployment status?',
    type: 'select' as const,
    options: ['Never deployed', 'Pre-deployment (notified)', 'Currently deployed', 'Recently returned (0-6 months)', 'Multiple deployments'],
    context: 'Impacts financial and family planning needs'
  },
  {
    id: 'financial_goals',
    question: 'What are your primary financial goals for the next 2-3 years?',
    type: 'select' as const,
    options: ['Pay off debt', 'Build emergency fund', 'Maximize TSP contributions', 'Save for house down payment', 'Prepare for career transition', 'Deployment financial prep'],
    context: 'Helps prioritize recommendations and timeline'
  },
  {
    id: 'urgency_level',
    question: 'How urgent is your need for financial guidance?',
    type: 'select' as const,
    options: ['Just planning ahead', 'Have some concerns', 'Need help soon', 'Crisis situation'],
    context: 'Determines prioritization of recommendations'
  }
];

const ADAPTIVE_PROMPT = `You are an expert military financial advisor conducting an adaptive assessment.

IMPORTANT: The user has already completed their profile with basic information (rank, branch, service status, family situation, PCS info, etc.). Do NOT ask questions that are already covered in their profile.

Your task: Based on the user's previous assessment answers, determine the NEXT most important question to ask.

RULES:
- Ask ONLY questions that are relevant based on their previous answers
- Skip questions where the answer is already known from their profile
- Prioritize questions that will significantly change the recommendations
- Maximum 6 total assessment questions (4 core + 2 adaptive)
- Questions should be specific and tactical
- Focus on financial goals, concerns, and priorities not covered in profile

EXAMPLE LOGIC:
- If they said "Debt payoff" concern → Ask about debt amount ranges
- If they said "Career transition" → Ask about federal employment interest
- If they said "Pre-deployment" → Ask about SDP setup and deployment prep
- If they said "House purchase" → Ask about timeline and down payment goals

PREVIOUS ANSWERS:
{previousAnswers}

QUESTIONS ALREADY ASKED:
{questionsAsked}

RETURN (JSON):
If more questions needed:
{
  "needsMore": true,
  "nextQuestion": {
    "id": "debt_amount_range",
    "question": "What is your approximate debt amount?",
    "type": "select",
    "options": ["Under $5,000", "$5,000-$15,000", "$15,000-$30,000", "$30,000-$50,000", "Over $50,000", "Prefer not to say"],
    "context": "Helps prioritize debt payoff strategies"
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
  // Profile loading reserved for future adaptive logic
  // let profile: any = null;
  // if (questionsAsked.length === 0) {
  //   // First question - check if we have profile data
  //   const { createClient } = await import('@supabase/supabase-js');
  //   const supabase = createClient(
  //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //     process.env.SUPABASE_SERVICE_ROLE_KEY!
  //   );
  //   const { data: profileData } = await supabase
  //     .from('user_profiles')
  //     .select('service_status, spouse_service_status, rank, branch, current_base, pcs_date, deployment_status, marital_status, num_children, has_efmp')
  //     .eq('user_id', userId)
  //     .maybeSingle();
  //   profile = profileData;
  // }

  // If this is the first question, start with the first core question
  // Profile data is already available and doesn't need to be re-asked
  if (questionsAsked.length === 0) {
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

  // All core questions asked - check for dynamic questions first (SAVES AI COST!)
  const dynamicQuestions = getDynamicQuestions(answers);
  const unaskedDynamic = dynamicQuestions.filter(q => !questionsAsked.includes(q.id));
  
  // If we have dynamic questions to ask, ask them before using AI
  if (unaskedDynamic.length > 0 && questionsAsked.length < 6) {
    return NextResponse.json({
      needsMore: true,
      nextQuestion: unaskedDynamic[0]
    });
  }
  
  // Max questions reached (4 core + up to 2 dynamic)
  if (questionsAsked.length >= 6) {
    return NextResponse.json({
      needsMore: false,
      reason: 'Assessment complete - enough data to generate personalized plan'
    });
  }

  // Call Gemini 2.0 Flash to determine next question (50% cost reduction!)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fall back to completing assessment
    return NextResponse.json({
      needsMore: false,
      reason: 'Assessment complete'
    });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 500,
      responseMimeType: "application/json"
    }
  });

  try {
    const previousAnswersSummary = Object.entries(answers)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');

    const prompt = `${ADAPTIVE_PROMPT
      .replace('{previousAnswers}', previousAnswersSummary)
      .replace('{questionsAsked}', questionsAsked.join(', '))}

What should I ask next, or is the assessment complete?`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text() || '{}';
    const parsedResult = JSON.parse(responseText);

    return NextResponse.json(parsedResult);

  } catch (error) {
    console.error('[Adaptive Assessment] Error:', error);
    // Fall back to completing assessment
    return NextResponse.json({
      needsMore: false,
      reason: 'Assessment complete'
    });
  }
}


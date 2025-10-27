import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * INTELLIGENT EXPLAINER - GEMINI 2.0 POWERED
 * Provides contextual, personalized explanations for tool calculations
 */

// Type definitions
type ToolType = 'tsp' | 'sdp' | 'house' | 'on-base-savings' | 'pcs' | 'salary' | 'career-analyzer';

interface AssessmentAnswers {
  comprehensive?: {
    foundation?: {
      serviceYears?: string | number;
      familySnapshot?: string;
    };
    move?: {
      pcsSituation?: string;
    };
    deployment?: {
      status?: string;
    };
    career?: {
      ambitions?: string[];
    };
    finance?: {
      priority?: string;
    };
  };
  [key: string]: unknown;
}

interface UserContext {
  serviceYears: string;
  familySnapshot: string;
  pcsSituation: string;
  deploymentStatus: string;
  careerAmbitions: string[];
  financialPriority: string;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  tsp: `You are analyzing TSP results for a Garrison Ledger user. Give tactical, specific advice.

CRITICAL RULES:
- NO greetings, NO "Hello", NO "As an expert" intros
- Start with their ACTUAL numbers and what they mean
- Reference THEIR specific situation (age, timeline, family, deployment status)
- Keep it 200-250 words MAX
- Write like a knowledgeable military friend, not a corporate chatbot
- NO generic advice - be SPECIFIC to their inputs

OUTPUT FORMAT:
- Use <p> tags for paragraphs
- Use <strong> for emphasis (not bold tags)
- Use <ul><li> for 2-3 tactical next steps
- NO HTML comments, NO markdown
- Clean, semantic HTML only

STRUCTURE:
1. Lead with their projection and what it means (1 sentence)
2. One insight about their allocation (1 sentence)
3. 2-3 tactical recommendations based on THEIR situation (use <ul><li>)
4. One deployment/tax/BRS insight if relevant (1 sentence)

BAD (generic):
"Your TSP strategy looks good. Consider diversifying. Roth contributions may be beneficial."

GOOD (specific):
"<p>Your 70/30 C/S mix projects to <strong>\$727K at age 50</strong>—that's \$145K more than the default lifecycle fund. With 20 years and young kids, this aggressive stance makes sense.</p><ul><li>Max Roth TSP now while you're likely in the 12% bracket—that \$727K becomes tax-free at 50</li><li>If you deploy, temporarily boost to 60% to max SDP at \$10K (guaranteed 10%), then return to this allocation</li><li>With debt concerns, pay off high-interest first, but don't drop below 5% TSP to keep the full BRS match</li></ul>"`,

  sdp: `Analyze SDP results. Give tactical advice. NO greetings.

RULES:
- Start with their payout amount and growth potential
- Reference deployment timeline if known
- Compare strategies with THEIR numbers
- 2-3 tactical next steps (emergency fund first, then Roth IRA, then index funds)
- Mention tax implications (SDP payout is taxable income)
- 200-250 words MAX
- Clean HTML (<p>, <strong>, <ul><li>)

GOOD example:
"<p>Your <strong>\$10K SDP payout grows to \$35K in 15 years</strong> with moderate 8% returns—that's the power of deployment savings. The guaranteed 10% while deployed is unbeatable.</p><ul><li>Take the lump sum at reintegration, then immediately fund 6-month emergency fund (\$15K) in high-yield savings</li><li>Put remaining \$20K in Roth IRA (\$7K now, \$7K Jan 1st, \$6K in taxable brokerage)—tax-free growth forever</li><li>With young kids and debt, don't touch this money for 10+ years—let compound growth work</li></ul><p>Since you're pre-deployment, set contribution to 60% of base pay now to max the \$10K SDP cap.</p>"`,

  house: `Analyze house hacking numbers. Give tactical guidance. NO greetings.

RULES:
- Start with their cash flow verdict (positive/negative, actual monthly number)
- Reference PCS timeline and family situation
- Be realistic about risks (vacancy, maintenance, property management)
- 2-3 tactical next steps
- 200-250 words MAX
- Clean HTML (<p>, <strong>, <ul><li>)

GOOD example:
"<p><strong>+\$450/month positive cash flow</strong>—this property could pay you while building equity. With a PCS in 6-12 months and young kids, timing is tight but doable.</p><ul><li>Talk to VA lender THIS WEEK—get pre-approval at current rates (they're rising) and understand your BAH at new location</li><li>Research actual rental rates (not Zillow estimates)—call 3 property managers for reality check on \$2,200/mo rent assumption</li><li>Budget 10% for vacancy/maintenance (\$220/mo)—your \$450 cushion covers this, but reduces to \$230 net</li></ul><p>Risk: If you PCS again in 3 years, you're a long-distance landlord with young kids. Factor in property management costs (\$200/mo) which turns this barely positive. Only worth it if you plan 5+ years at this base or are committed to being a landlord.</p>"`,

  'on-base-savings': `Analyze on-base savings results. Give tactical advice. NO greetings.

RULES:
- Start with total annual savings potential
- Break down commissary vs exchange vs benefits
- Reference family situation (kids = more commissary savings)
- 2-3 tactical next steps
- Be realistic - savings estimates vary by shopping habits
- 200-250 words MAX
- Clean HTML (<p>, <strong>, <ul><li>)

GOOD example:
"<p><strong>\$4,200/year potential savings</strong>—that's \$350/month back in your pocket just by using on-base benefits. With young kids, your commissary savings (\$2,400) are your biggest win.</p><ul><li>Start with commissary for ALL meat, produce, and diapers—30% average savings on these items add up fast with a family</li><li>Use Military Star Card for gas—5¢/gallon × 2,000 gallons/year = \$100 saved, plus no sales tax on exchange purchases</li><li>Focus on high-impact items: baby formula, diapers, fresh meat—skip shelf-stable items where savings are minimal</li></ul><p>Reality check: \$4,200 assumes you shop on-base for everything. Start with 60% of groceries on-base (saves \$2,500), then expand if it fits your schedule.</p>"`,

  pcs: `Analyze PCS financial planner results. Give tactical advice. NO greetings.

RULES:
- Start with net estimate (income minus expenses)
- Reference DLA, per diem, PPM if applicable
- Be realistic about timing and paperwork
- 2-3 tactical next steps
- Mention common mistakes (saving receipts, filing deadlines)
- 200-250 words MAX
- Clean HTML (<p>, <strong>, <ul><li>)

GOOD example:
"<p><strong>Net estimate: +\$2,400</strong> after all PCS entitlements and expenses. Your DLA (\$3,500) and per diem (\$2,800) cover most costs, with PPM adding \$1,200 if you self-move.</p><ul><li>File DLA claim WITHIN 90 DAYS of PCS orders—many troops miss this deadline and lose \$3,500</li><li>Save ALL receipts for lodging, rental truck, storage—per diem is yours regardless, but backup docs prevent audits</li><li>Do PPM math carefully: \$1,200 incentive sounds good, but factor in gas (\$600), lodging (\$400), truck rental (\$800)—net is only \$200-300</li></ul><p>With young kids, professional movers (HHG) might beat PPM stress vs. money tradeoff. Run the numbers at current gas prices.</p>"`,

  salary: `Analyze salary relocation calculator results. Give tactical advice. NO greetings.

RULES:
- Start with equivalent salary and cost difference
- Reference housing, taxes, COL
- Be realistic about quality of life tradeoffs
- 2-3 tactical next steps
- Mention non-financial factors (schools, commute, family)
- 200-250 words MAX
- Clean HTML (<p>, <strong>, <ul><li>)

GOOD example:
"<p><strong>\$75,000 in Austin = \$95,000 in San Diego</strong> to maintain the same lifestyle. You'd need a 27% raise just to break even due to housing (\$2,400 vs. \$3,600/month) and CA state taxes.</p><ul><li>Housing is the killer—Austin \$2,400 rent gets you a house, San Diego \$3,600 gets you a 2BR apartment</li><li>Factor in 9.3% CA income tax (\$7,000/year) vs. 0% TX—that's a hidden pay cut</li><li>Research schools if you have kids—San Diego schools might justify the cost, but Austin has strong districts too</li></ul><p>Non-financial reality: San Diego weather and ocean vs. Austin heat and no beach. With young kids, consider which city has better family support (nearby relatives, etc.).</p>"`,

  'career-analyzer': `Analyze career opportunity results. Give tactical advice. NO greetings.

RULES:
- Start with total compensation difference
- Reference base pay, bonus, equity, benefits
- Factor in career growth and industry trends
- 2-3 tactical next steps
- Be realistic about job security and satisfaction
- 200-250 words MAX
- Clean HTML (<p>, <strong>, <ul><li>)

GOOD example:
"<p><strong>Total comp difference: +\$32,000/year</strong> for the new role (\$95K base + \$15K bonus + \$10K equity vs. current \$88K total). But location matters—new city has 15% higher COL, reducing real gain to \$22K.</p><ul><li>Equity vesting matters—\$10K/year paper equity means nothing if company isn't IPO-track or profitable</li><li>New industry (tech) has growth potential but higher risk than current stable role—factor in recession layoffs</li><li>Career trajectory: new role as Senior Engineer opens doors to Staff/Principal (\$150K+) faster than staying IC at current company</li></ul><p>With young kids and deployment stress, consider job stability vs. upside. \$22K real gain is significant, but if new role means 60hr weeks vs. current 40hr, calculate hourly rate difference.</p>"`
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Parse request
    let body: { tool?: string; inputs?: Record<string, unknown>; outputs?: Record<string, unknown> };
    try {
      body = await req.json();
    } catch {
      logger.warn('[Explain] Invalid JSON in request', { userId });
      throw Errors.invalidInput("Invalid JSON in request body");
    }

    const { tool, inputs, outputs } = body;

    if (!tool || !inputs || !outputs) {
      throw Errors.invalidInput("Missing required fields: tool, inputs, outputs");
    }

    // Validate tool type
    const validTools: ToolType[] = ['tsp', 'sdp', 'house', 'on-base-savings', 'pcs', 'salary', 'career-analyzer'];
    if (!validTools.includes(tool as ToolType)) {
      throw Errors.invalidInput(`Invalid tool type. Must be one of: ${validTools.join(', ')}`);
    }

    // Get user context from assessment (for personalization)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .select("answers")
      .eq("user_id", userId)
      .maybeSingle();

    if (assessmentError) {
      logger.warn('[Explain] Failed to fetch assessment', { userId, error: assessmentError });
      // Continue without assessment data - use defaults
    }

    const answers = (assessment?.answers || {}) as AssessmentAnswers;
    const comprehensive = answers.comprehensive || {};
    const foundation = comprehensive.foundation || {};
    const move = comprehensive.move || {};
    const deployment = comprehensive.deployment || {};
    const career = comprehensive.career || {};
    const finance = comprehensive.finance || {};
    
    // Build user context with proper type safety
    const userContext: UserContext = {
      serviceYears: String(foundation.serviceYears || 'unknown'),
      familySnapshot: String(foundation.familySnapshot || 'none'),
      pcsSituation: String(move.pcsSituation || 'none'),
      deploymentStatus: String(deployment.status || 'none'),
      careerAmbitions: Array.isArray(career.ambitions) ? career.ambitions : [],
      financialPriority: String(finance.priority || 'unknown')
    };

    // Initialize Gemini
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      logger.error('[Explain] GOOGLE_API_KEY not configured');
      throw Errors.externalApiError("Gemini", "API key not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.8, // Slightly more creative for explanations
        maxOutputTokens: 1000,
      }
    });

    const systemPrompt = SYSTEM_PROMPTS[tool as ToolType] || SYSTEM_PROMPTS.tsp;

    // Construct prompt with full context
    const userPrompt = `USER CONTEXT:
Service: ${userContext.serviceYears} years
Family: ${userContext.familySnapshot}
PCS Status: ${userContext.pcsSituation}
Deployment: ${userContext.deploymentStatus}
Financial Priority: ${userContext.financialPriority}

TOOL INPUTS:
${JSON.stringify(inputs, null, 2)}

CALCULATED OUTPUTS:
${JSON.stringify(outputs, null, 2)}

Please provide a personalized, actionable explanation of these ${tool.toUpperCase()} results for this specific service member. Reference their actual numbers and situation.`;

    try {
      const startTime = Date.now();
      const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
      const duration = Date.now() - startTime;
      
      const response = result.response;
      const text = response.text();

      logger.info('[Explain] AI explanation generated', { 
        userId, 
        tool, 
        duration, 
        charCount: text.length 
      });

      // Stream the HTML response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Split into chunks for smooth streaming
          const chunks = text.match(/.{1,100}/g) || [text];
          let i = 0;
          
          const push = () => {
            if (i >= chunks.length) {
              controller.close();
              return;
            }
            controller.enqueue(encoder.encode(chunks[i]));
            i++;
            setTimeout(push, 30); // Smooth streaming effect
          };
          
          push();
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        }
      });

    } catch (aiError) {
      logger.error('[Explain] AI generation failed, using fallback', aiError, { userId, tool });
      
      // Fallback to deterministic if AI fails
      const fallback = generateFallbackExplanation(tool as ToolType, inputs, outputs);
      return new Response(fallback, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        }
      });
    }
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Fallback: Simple deterministic explanation if AI fails
 */
function generateFallbackExplanation(
  tool: ToolType,
  inputs: Record<string, unknown>,
  outputs: Record<string, unknown>
): string {
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
  }).format(n);

  switch (tool) {
    case "tsp": {
      const endCustom = Number(outputs.endCustom) || 0;
      return `<p><strong>Projected retirement balance:</strong> ${fmt(endCustom)}</p><p>This projection is based on historical market returns. Actual results will vary.</p>`;
    }
    case "sdp": {
      const mod = Number(outputs.mod) || 0;
      return `<p><strong>15-year growth potential:</strong> ${fmt(mod)}</p><p>Your SDP payout can grow significantly with strategic investment.</p>`;
    }
    case "house": {
      const verdict = Number(outputs.verdict) || 0;
      const isPositive = verdict >= 0;
      return `<p><strong>Monthly cash flow:</strong> ${fmt(verdict)} ${isPositive ? '(Positive)' : '(Negative)'}</p><p>${isPositive ? 'This property could generate income.' : 'This property would require additional funds monthly.'}</p>`;
    }
    case "on-base-savings": {
      const totalSavings = Number(outputs.totalSavings) || 0;
      return `<p><strong>Annual savings potential:</strong> ${fmt(totalSavings)}</p><p>Maximize on-base benefits by focusing on commissary and exchange purchases.</p>`;
    }
    case "pcs": {
      const netEstimate = Number(outputs.netEstimate) || 0;
      const isPositive = netEstimate >= 0;
      return `<p><strong>Net PCS estimate:</strong> ${fmt(netEstimate)} ${isPositive ? '(Surplus)' : '(Deficit)'}</p><p>${isPositive ? 'Your entitlements should cover PCS costs.' : 'Budget carefully for out-of-pocket expenses.'}</p>`;
    }
    case "salary": {
      const equivalentSalary = Number(outputs.equivalentSalary) || 0;
      return `<p><strong>Equivalent salary:</strong> ${fmt(equivalentSalary)}</p><p>This accounts for cost of living differences between locations.</p>`;
    }
    case "career-analyzer": {
      const totalCompDiff = Number(outputs.totalCompDiff) || 0;
      const isPositive = totalCompDiff >= 0;
      return `<p><strong>Total compensation difference:</strong> ${fmt(Math.abs(totalCompDiff))} ${isPositive ? 'higher' : 'lower'}</p><p>Consider both financial and career growth factors when deciding.</p>`;
    }
    default:
      return "<p>Explanation unavailable.</p>";
  }
}

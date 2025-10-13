import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase-typed";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * INTELLIGENT EXPLAINER - GEMINI 2.0 POWERED
 * Provides contextual, personalized explanations for tool calculations
 */

const SYSTEM_PROMPTS: Record<string, string> = {
  tsp: `You are a TSP allocation expert for Garrison Ledger, specializing in military retirement planning. Analyze the user's TSP inputs and projections, then provide a personalized, actionable explanation.

Your response must be:
- Written in HTML (use <p>, <strong>, <ul>, <li> tags)
- 250-350 words
- Specific to their numbers and timeline
- Include 3-4 actionable recommendations
- Military-focused (reference BRS, matching, deployment opportunities)
- Encouraging but realistic tone
- Mention tax implications (Roth vs Traditional)
- Address their specific allocation strategy

Format as clean HTML. No markdown. Use line breaks naturally.`,

  sdp: `You are a deployment financial strategist for Garrison Ledger. Analyze the user's SDP payout scenarios and provide expert guidance on maximizing this deployment benefit.

Your response must be:
- Written in HTML (use <p>, <strong>, <ul>, <li> tags)
- 250-350 words
- Explain the power of the 10% guaranteed return
- Compare the three payout strategies intelligently
- Recommend specific next steps (emergency fund, Roth IRA, index funds)
- Address tax implications
- Reference deployment timeline and reintegration
- Encouraging and tactical

Format as clean HTML. No markdown.`,

  house: `You are a military real estate and house hacking expert for Garrison Ledger. Analyze the user's house hacking cash flow scenario and provide strategic guidance.

Your response must be:
- Written in HTML (use <p>, <strong>, <ul>, <li> tags)
- 250-350 words
- Explain whether this is a good house hacking opportunity
- Address the cash flow reality (positive vs negative)
- Discuss VA loan benefits (0% down, no PMI)
- Mention risks (vacancy, maintenance, property management)
- Recommend next steps (talk to lender, research market, etc.)
- Reference PCS timeline and long-term rental potential
- Balanced (optimistic but realistic)

Format as clean HTML. No markdown.`
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  // Parse request
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { tool, inputs, outputs } = body;

  if (!tool || !inputs || !outputs) {
    return new Response("Missing required fields: tool, inputs, outputs", { status: 400 });
  }

  // Get user context from assessment (for personalization)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: assessment } = await supabase
    .from("assessments")
    .select("answers")
    .eq("user_id", userId)
    .maybeSingle();

  const answers = (assessment?.answers as any) || {};
  const comprehensive = answers.comprehensive || {};
  const foundation = comprehensive.foundation || {};
  
  // Build user context
  const userContext = {
    serviceYears: foundation.serviceYears || 'unknown',
    familySnapshot: foundation.familySnapshot || 'none',
    pcsSituation: comprehensive.move?.pcsSituation || 'none',
    deploymentStatus: comprehensive.deployment?.status || 'none',
    careerAmbitions: comprehensive.career?.ambitions || [],
    financialPriority: comprehensive.finance?.priority || 'unknown'
  };

  // Initialize Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response("GEMINI_API_KEY not configured", { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.8, // Slightly more creative for explanations
      maxOutputTokens: 1000,
    }
  });

  const systemPrompt = SYSTEM_PROMPTS[tool] || SYSTEM_PROMPTS.tsp;

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
    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const response = result.response;
    const text = response.text();

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

  } catch (error) {
    console.error('[Explain] Gemini error:', error);
    
    // Fallback to deterministic if AI fails
    const fallback = generateFallbackExplanation(tool, inputs, outputs);
    return new Response(fallback, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      }
    });
  }
}

/**
 * Fallback: Simple deterministic explanation if AI fails
 */
function generateFallbackExplanation(
  tool: string,
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
    default:
      return "<p>Explanation unavailable.</p>";
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * AI AUTO-CURATION ENDPOINT
 * Protected middleman to Gemini API for transforming raw articles into atomic content blocks
 */

const SYSTEM_PROMPT = `You are the Lead Staff Writer for the Garrison Ledger, an expert on military family life. Your task is to take a raw article and transform it into a hand-curated "atomic" content block.

Your output must be a valid JSON object with exactly three keys:
1. "html" - A 200-350 word, professionally formatted HTML article in our brand voice. Use semantic HTML tags (h3, p, ul, li, strong, em). Write in a clear, authoritative, but warm tone. Focus on actionable guidance.
2. "summary" - A 1-2 sentence concise summary (under 150 characters).
3. "tags" - An array of 3-7 relevant keywords (lowercase, hyphenated format like "pcs-planning", "tsp-allocation").

Guidelines:
- Write for E-3 to O-6 audience (accessible but professional)
- Focus on practical, actionable information
- Avoid jargon unless you explain it
- Use military-specific keywords naturally
- Keep HTML clean and semantic (no inline styles)
- Tags should be specific and useful for categorization

Return ONLY valid JSON. No markdown code blocks, no explanations outside the JSON.`;

export async function POST(req: NextRequest) {
  // Auth check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse request body
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { title, summary, source_url } = body;

  if (!title || !summary || !source_url) {
    return NextResponse.json(
      { error: "Missing required fields: title, summary, source_url" },
      { status: 400 }
    );
  }

  // Initialize Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp", // Latest model - better quality, same speed
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000,
      responseMimeType: "application/json", // Force JSON output
    }
  });

  try {
    // Construct combined prompt
    const fullPrompt = `${SYSTEM_PROMPT}

---

Title: ${title}

Summary: ${summary}

Source URL: ${source_url}

Please analyze this article and create a curated atomic content block following the JSON format specified above.`;

    // Call Gemini API
    const result = await model.generateContent(fullPrompt);

    const response = result.response;
    const text = response.text();

    // Parse JSON response
    let curated;
    try {
      // Try to extract JSON if wrapped in markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      
      curated = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('[Curate] Failed to parse Gemini response:', text);
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: text },
        { status: 500 }
      );
    }

    // Validate response structure
    if (!curated.html || !curated.summary || !curated.tags) {
      return NextResponse.json(
        { error: "Invalid AI response structure", curated },
        { status: 500 }
      );
    }

    // Return curated content
    return NextResponse.json({
      success: true,
      html: curated.html,
      summary: curated.summary,
      tags: Array.isArray(curated.tags) ? curated.tags : [],
    });

  } catch (error) {
    console.error('[Curate] Gemini API error:', error);
    return NextResponse.json(
      { 
        error: "AI curation failed", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/lib/logger";
import { errorResponse, Errors } from "@/lib/api-errors";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * AI AUTO-CURATION ENDPOINT
 * Protected middleman to Gemini API for transforming raw articles into atomic content blocks
 */

const SYSTEM_PROMPT = `You are the Lead Staff Writer for the Garrison Ledger, an expert on military family life. Your task is to take a raw article and transform it into a hand-curated "atomic" content block.

Your output must be a valid JSON object with these keys:
1. "html" - A 200-350 word, professionally formatted HTML article in our brand voice. Use semantic HTML tags (h3, p, ul, li, strong, em). Write in a clear, authoritative, but warm tone. Focus on actionable guidance.
2. "summary" - A 1-2 sentence concise summary (under 150 characters).
3. "tags" - An array of 3-7 relevant keywords (lowercase, hyphenated format like "pcs-planning", "tsp-allocation").
4. "domain" - Primary category: "finance", "pcs", "career", "deployment", or "lifestyle"
5. "difficulty" - Content complexity: "beginner", "intermediate", or "advanced"
6. "seoKeywords" - Array of 4-5 SEO-optimized keywords for search discoverability

Guidelines:
- Write for E-3 to O-6 audience (accessible but professional)
- Focus on practical, actionable information
- Avoid jargon unless you explain it
- Use military-specific keywords naturally
- Keep HTML clean and semantic (no inline styles)
- Tags should be specific and useful for categorization
- Domain should match the primary topic (finance is most common)
- Difficulty based on content complexity (most should be intermediate)
- SEO keywords should include variations and related terms

Return ONLY valid JSON. No markdown code blocks, no explanations outside the JSON.`;

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Parse request body
    let body: { title?: string; summary?: string; source_url?: string };
    try {
      body = await req.json();
    } catch (jsonError) {
      logger.warn('[Curate] Invalid JSON in request', { userId });
      throw Errors.invalidInput("Invalid JSON body");
    }

    const { title, summary, source_url } = body;

    if (!title || !summary || !source_url) {
      throw Errors.invalidInput("Missing required fields: title, summary, source_url");
    }

    // Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error('[Curate] GEMINI_API_KEY not configured');
      throw Errors.externalApiError("Gemini", "API key not configured");
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
    const duration = Date.now() - startTime;

    // Parse JSON response
    let curated: {
      html?: string;
      summary?: string;
      tags?: string[];
      domain?: string;
      difficulty?: string;
      seoKeywords?: string[];
    };
    
    try {
      // Try to extract JSON if wrapped in markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      
      curated = JSON.parse(jsonText.trim());
    } catch (parseError) {
      logger.error('[Curate] Failed to parse AI response', parseError, { userId, title, textLength: text.length });
      throw Errors.externalApiError("Gemini", "Failed to parse AI response");
    }

    // Validate response structure
    if (!curated.html || !curated.summary || !curated.tags) {
      logger.error('[Curate] Invalid AI response structure', undefined, { userId, title, curated });
      throw Errors.externalApiError("Gemini", "Invalid AI response structure");
    }

    logger.info('[Curate] Content curated successfully', { 
      userId, 
      title, 
      domain: curated.domain,
      tagCount: curated.tags.length,
      duration
    });

    // Return curated content with enhanced metadata
    return NextResponse.json({
      success: true,
      html: curated.html,
      summary: curated.summary,
      tags: Array.isArray(curated.tags) ? curated.tags : [],
      domain: curated.domain || 'finance',
      difficulty: curated.difficulty || 'intermediate',
      seoKeywords: Array.isArray(curated.seoKeywords) ? curated.seoKeywords : curated.tags?.slice(0, 5) || [],
    });

  } catch (error) {
    return errorResponse(error);
  }
  
  } catch (error) {
    return errorResponse(error);
  }
}


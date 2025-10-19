import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { basesData } from '@/app/data/bases';

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

interface BaseRecommendation {
  baseId: string;
  baseName: string;
  matchScore: number;
  reasons: string[];
  considerations: string[];
  branch: string;
  state: string;
  city: string;
  url: string;
}

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get user assessment data
    const { data: assessment, error: assessmentError } = await supabaseAdmin
      .from('user_assessments')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (assessmentError || !assessment) {
      return NextResponse.json({ 
        error: "No assessment found. Please complete your assessment first.",
        needsAssessment: true 
      }, { status: 400 });
    }

    // 3. Check cache first (7-day cache)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { data: cachedRecs } = await supabaseAdmin
      .from('base_recommendations_cache')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .maybeSingle();

    if (cachedRecs) {
      return NextResponse.json({ 
        recommendations: cachedRecs.recommendations,
        cached: true,
        cachedAt: cachedRecs.created_at
      });
    }

    // 4. Generate AI recommendations
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      }
    });

    const prompt = `You are a military base recommendation expert. Based on this service member's profile, recommend 3-5 military bases that would be the best fit.

USER PROFILE:
- Branch: ${assessment.branch || 'Unknown'}
- Rank: ${assessment.rank || 'Unknown'}
- Family Size: ${assessment.family_size || 'Unknown'}
- Current Location: ${assessment.current_base || 'Unknown'}
- Financial Goals: ${assessment.financial_goals || 'Unknown'}
- Deployment Status: ${assessment.deployment_status || 'Unknown'}
- Career Stage: ${assessment.career_stage || 'Unknown'}

AVAILABLE BASES (select from these):
${basesData.slice(0, 50).map(base => `- ${base.title} (${base.branch}) - ${base.city}, ${base.state}`).join('\n')}

Provide recommendations in this EXACT JSON format:
{
  "recommendations": [
    {
      "baseName": "Base name exactly as shown above",
      "matchScore": 85,
      "reasons": ["Reason 1", "Reason 2", "Reason 3"],
      "considerations": ["Thing to consider 1", "Thing to consider 2"]
    }
  ]
}

Focus on bases that match their branch when possible. Consider family size, career goals, and current location. Be specific and practical.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse AI response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const aiResponse = JSON.parse(jsonMatch[0]);
    
    // Enrich recommendations with full base data
    const enrichedRecommendations: BaseRecommendation[] = aiResponse.recommendations.map((rec: any) => {
      const baseData = basesData.find(b => 
        b.title.toLowerCase() === rec.baseName.toLowerCase() ||
        b.title.toLowerCase().includes(rec.baseName.toLowerCase()) ||
        rec.baseName.toLowerCase().includes(b.title.toLowerCase())
      );

      if (!baseData) {
        console.warn(`Base not found: ${rec.baseName}`);
        return null;
      }

      return {
        baseId: baseData.id,
        baseName: baseData.title,
        matchScore: rec.matchScore,
        reasons: rec.reasons,
        considerations: rec.considerations || [],
        branch: baseData.branch,
        state: baseData.state,
        city: baseData.city,
        url: baseData.url
      };
    }).filter(Boolean);

    // 5. Cache recommendations
    await supabaseAdmin
      .from('base_recommendations_cache')
      .upsert({
        user_id: userId,
        recommendations: enrichedRecommendations,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    return NextResponse.json({ 
      recommendations: enrichedRecommendations,
      cached: false 
    });

  } catch (error) {
    console.error('[Base Recommendations] Error:', error);
    return NextResponse.json({ 
      error: "Failed to generate recommendations",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


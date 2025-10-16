import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = "nodejs";

/**
 * POST /api/plan/sample
 * 
 * Generates a quick sample/demo plan for new users
 * Shows immediate value without requiring full profile/assessment
 * 
 * This is a "quick win" - user sees AI capability in 30 seconds
 * Motivates them to complete profile for personalized version
 */
export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a real plan (don't override)
    const { data: existingPlan } = await supabaseAdmin
      .from('user_plans')
      .select('summary')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingPlan?.summary) {
      return NextResponse.json({ 
        success: false,
        message: "User already has a personalized plan" 
      });
    }

    // Generate sample plan with generic military financial advice
    const samplePlan = {
      summary: `# Welcome to Your Military Financial Journey!

This is a **sample plan** to show you what Garrison Ledger can do. Complete your profile and assessment to get a fully personalized plan with 8-10 expert content blocks tailored to your unique situation.

## What We'll Cover in Your Personalized Plan

Based on your rank, duty station, family situation, and goals, AI will curate specific guidance on:

### 🎯 Core Financial Foundations
- **TSP Optimization:** Maximize your retirement savings with the right fund allocation
- **Emergency Fund:** Build your 3-6 month safety net systematically  
- **Debt Strategy:** Pay down high-interest debt while building wealth

### 🏠 Military Life Planning  
- **PCS Preparation:** Budget your move and maximize entitlements
- **BAH Optimization:** Use your housing allowance strategically
- **Deployment Savings:** SDP, tax-free zones, and windfall planning

### 🚀 Long-Term Wealth Building
- **Investment Strategy:** Beyond TSP - building generational wealth
- **Transition Planning:** Preparing financially for civilian life
- **Education Benefits:** Maximizing TA, GI Bill, and spouse education

## Take Your Next Step

Ready for AI to analyze your specific situation and curate 8-10 blocks just for you?

1. **Complete your profile** (3 minutes) - Tell us about your rank, station, family
2. **Take the assessment** (5 minutes) - Help AI understand your priorities  
3. **Get your personalized plan** (30 seconds) - AI curates your custom strategy

---

*This sample plan was generated automatically. Your personalized plan will be based on YOUR unique military situation.*`,
      
      selected_blocks: [],
      is_sample: true
    };

    // Save sample plan
    await supabaseAdmin
      .from('user_plans')
      .insert({
        user_id: userId,
        summary: samplePlan.summary,
        selected_blocks: samplePlan.selected_blocks,
        is_sample: true,
        generated_at: new Date().toISOString()
      });

    return NextResponse.json({ 
      success: true,
      message: "Sample plan generated",
      plan: samplePlan
    });

  } catch (error) {
    console.error('[Sample Plan] Error:', error);
    return NextResponse.json({ error: "Failed to generate sample plan" }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { errorResponse, Errors } from "@/lib/api-errors";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get all scenarios for a user and tool
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const tool = req.nextUrl.searchParams.get('tool');
    
    if (!tool) {
      throw Errors.invalidInput("Tool parameter is required");
    }

    const { data, error } = await supabase
      .rpc('get_user_scenarios', { 
        p_user_id: userId, 
        p_tool: tool 
      });

    if (error) {
      logger.error('[CalcScenarios] Failed to fetch scenarios', error, { userId, tool });
      throw Errors.databaseError("Failed to fetch scenarios");
    }

    logger.info('[CalcScenarios] Scenarios fetched', { userId, tool, count: data?.length || 0 });
    return NextResponse.json({ success: true, scenarios: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}

// Create a new scenario
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const { tool, name, input, output } = await req.json();

    if (!tool || !name || !input) {
      throw Errors.invalidInput("Tool, name, and input are required");
    }

    // Check if user has premium status (for scenario limits)
    const { data: entitlement } = await supabase
      .from("entitlements")
      .select("tier, status")
      .eq("user_id", userId)
      .maybeSingle();
    
    const isPremium = entitlement?.tier === "premium" && entitlement?.status === "active";

    // Check scenario count (free users limited to 1 scenario per tool to start)
    if (!isPremium) {
      const { data: countData } = await supabase.rpc('count_user_scenarios', {
        p_user_id: userId,
        p_tool: tool
      });

      const scenarioCount = countData || 0;
      
      if (scenarioCount >= 1) {
        logger.warn('[CalcScenarios] Free user at limit', { userId, tool, scenarioCount });
        throw Errors.premiumRequired("Free users can save 1 scenario per tool. Upgrade to Premium for unlimited scenarios!");
      }
    }

    // Create the scenario
    const { data: scenario, error } = await supabase
      .from('calculator_scenarios')
      .insert({
        user_id: userId,
        tool,
        name,
        input,
        output: output || null
      })
      .select()
      .single();

    if (error) {
      logger.error('[CalcScenarios] Failed to create scenario', error, { userId, tool, name });
      throw Errors.databaseError("Failed to create scenario");
    }

    logger.info('[CalcScenarios] Scenario created', { userId, tool, scenarioId: scenario.id });
    return NextResponse.json({ 
      success: true, 
      scenario,
      message: "Scenario saved successfully"
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// Delete a scenario
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const scenarioId = req.nextUrl.searchParams.get('id');
    
    if (!scenarioId) {
      throw Errors.invalidInput("Scenario ID (id) is required");
    }

    const { error } = await supabase
      .from('calculator_scenarios')
      .delete()
      .eq('id', scenarioId)
      .eq('user_id', userId);

    if (error) {
      logger.error('[CalcScenarios] Failed to delete scenario', error, { userId, scenarioId });
      throw Errors.databaseError("Failed to delete scenario");
    }

    logger.info('[CalcScenarios] Scenario deleted', { userId, scenarioId });
    return NextResponse.json({ 
      success: true,
      message: "Scenario deleted successfully"
    });
  } catch (error) {
    return errorResponse(error);
  }
}


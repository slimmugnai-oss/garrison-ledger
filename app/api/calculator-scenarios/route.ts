import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get all scenarios for a user and tool
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tool = req.nextUrl.searchParams.get('tool');
  
  if (!tool) {
    return NextResponse.json({ error: "Tool parameter required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .rpc('get_user_scenarios', { 
        p_user_id: userId, 
        p_tool: tool 
      });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch scenarios" }, { status: 500 });
    }

    return NextResponse.json({ success: true, scenarios: data || [] });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create a new scenario
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tool, name, input, output } = await req.json();

    if (!tool || !name || !input) {
      return NextResponse.json(
        { error: "Tool, name, and input are required" },
        { status: 400 }
      );
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
        return NextResponse.json({
          error: "Free users can save 1 scenario per tool. Upgrade to Premium for unlimited scenarios!",
          isPremium: false,
          limit: 1,
          current: scenarioCount
        }, { status: 403 });
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
      return NextResponse.json({ 
        error: "Failed to create scenario", 
        details: error.message,
        hint: error.hint 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      scenario,
      message: "Scenario saved successfully"
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Delete a scenario
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scenarioId = req.nextUrl.searchParams.get('id');
  
  if (!scenarioId) {
    return NextResponse.json({ error: "Scenario ID required" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('calculator_scenarios')
      .delete()
      .eq('id', scenarioId)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: "Failed to delete scenario" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Scenario deleted successfully"
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


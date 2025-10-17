import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch latest saved models from each calculator
    const { data: models } = await supabaseAdmin
      .from('saved_models')
      .select('tool, input, output')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!models || models.length === 0) {
      return NextResponse.json({});
    }

    // Aggregate data from different calculators
    const overview: any = {};

    // Get most recent model for each tool
    const latestModels: { [key: string]: any } = {};
    for (const model of models) {
      if (!latestModels[model.tool]) {
        latestModels[model.tool] = model;
      }
    }

    // Extract TSP data
    if (latestModels['tsp']) {
      const tspData = latestModels['tsp'].output;
      // Assume output has a balance or projected value
      overview.tsp_balance = tspData?.futureValue || tspData?.totalValue || 0;
    }

    // Extract SDP data
    if (latestModels['sdp']) {
      const sdpData = latestModels['sdp'].output;
      overview.sdp_savings = sdpData?.totalReturn || sdpData?.finalAmount || 0;
    }

    // Extract House Hacking data
    if (latestModels['house']) {
      const houseData = latestModels['house'].output;
      overview.house_equity = houseData?.equity || houseData?.cashFlow || 0;
    }

    // Extract On-Base Savings data
    if (latestModels['savings']) {
      const savingsData = latestModels['savings'].output;
      overview.annual_savings = savingsData?.grandTotal || savingsData?.totalSavings || 0;
    }

    // Extract Career data
    if (latestModels['career']) {
      const careerData = latestModels['career'].input;
      overview.target_salary = careerData?.newSalary || careerData?.salary || 0;
    }

    return NextResponse.json(overview);

  } catch (error) {
    console.error('Error fetching financial overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overview' },
      { status: 500 }
    );
  }
}


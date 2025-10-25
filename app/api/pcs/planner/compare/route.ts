import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = 'nodejs';

/**
 * PCS ASSIGNMENT PLANNER - COMPARISON API
 * 
 * Handles saving and retrieving base assignment comparisons
 * Used for pre-orders planning and base selection analysis
 */

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) throw Errors.unauthorized();

    // Get all comparisons for user
    const { data: comparisons, error } = await supabaseAdmin
      .from('pcs_assignment_comparisons')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('[PCSPlanner] Database error', error, { userId: user.id });
      throw Errors.databaseError('Failed to fetch comparisons');
    }

    logger.info('[PCSPlanner] Comparisons retrieved', { 
      userId: user.id, 
      count: comparisons?.length || 0 
    });

    return NextResponse.json({ 
      success: true, 
      comparisons: comparisons || [] 
    });

  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) throw Errors.unauthorized();

    const { name, bases } = await request.json();

    if (!name || !bases || bases.length < 2) {
      throw Errors.badRequest('Name and at least 2 bases required');
    }

    // Calculate analysis data
    const analysis = calculateAnalysis(bases);

    // Save comparison
    const { data: comparison, error } = await supabaseAdmin
      .from('pcs_assignment_comparisons')
      .insert({
        user_id: user.id,
        comparison_name: name,
        bases: bases,
        analysis_data: analysis
      })
      .select()
      .single();

    if (error) {
      logger.error('[PCSPlanner] Database error', error, { userId: user.id });
      throw Errors.databaseError('Failed to save comparison');
    }

    logger.info('[PCSPlanner] Comparison saved', { 
      userId: user.id, 
      comparisonId: comparison.id,
      baseCount: bases.length 
    });

    return NextResponse.json({ 
      success: true, 
      comparison 
    });

  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) throw Errors.unauthorized();

    const { searchParams } = new URL(request.url);
    const comparisonId = searchParams.get('id');

    if (!comparisonId) {
      throw Errors.badRequest('Comparison ID required');
    }

    // Delete comparison
    const { error } = await supabaseAdmin
      .from('pcs_assignment_comparisons')
      .delete()
      .eq('id', comparisonId)
      .eq('user_id', user.id);

    if (error) {
      logger.error('[PCSPlanner] Delete error', error, { userId: user.id, comparisonId });
      throw Errors.databaseError('Failed to delete comparison');
    }

    logger.info('[PCSPlanner] Comparison deleted', { 
      userId: user.id, 
      comparisonId 
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Calculate analysis data for base comparison
 */
function calculateAnalysis(bases: any[]) {
  if (bases.length < 2) return null;

  // Find best options
  const bestBah = bases.reduce((best, current) => 
    current.bah > best.bah ? current : best
  );
  const bestCol = bases.reduce((best, current) => 
    current.colIndex < best.colIndex ? current : best
  );
  const bestSchools = bases.reduce((best, current) => 
    current.schoolRating > best.schoolRating ? current : best
  );
  const bestPcsCost = bases.reduce((best, current) => 
    current.pcsCost < best.pcsCost ? current : best
  );

  // Generate recommendation
  let recommendation = "";
  if (bestBah.code === bestCol.code) {
    recommendation = `${bestBah.name} offers the best BAH and cost of living combination.`;
  } else if (bestSchools.code === bestPcsCost.code) {
    recommendation = `${bestSchools.name} provides excellent schools with low PCS costs.`;
  } else {
    recommendation = `Consider your priorities: ${bestBah.name} for BAH, ${bestCol.name} for cost of living, ${bestSchools.name} for schools.`;
  }

  return {
    bestBah: bestBah.name,
    bestCol: bestCol.name,
    bestSchools: bestSchools.name,
    bestPcsCost: bestPcsCost.name,
    recommendation
  };
}

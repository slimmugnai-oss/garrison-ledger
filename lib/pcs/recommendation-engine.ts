/**
 * PCS RECOMMENDATION ENGINE
 * 
 * Static rule-based recommendations to help military members
 * maximize their PCS reimbursement and avoid common mistakes.
 * 
 * NO AI REQUIRED - Pure business logic based on claim data
 */

export interface Recommendation {
  id: string;
  type: 'dity_opportunity' | 'weight_warning' | 'receipt_reminder' | 'timeline_warning' | 'document_missing' | 'cost_savings' | 'entitlement_tip' | 'compliance_risk';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action?: string;
  link?: string;
  estimatedSavings?: number;
}

interface ClaimData {
  estimated_weight?: number;
  distance_miles?: number;
  rank?: string;
  has_dependents?: boolean;
  departure_date?: string;
  arrival_date?: string;
  origin_base?: string;
  destination_base?: string;
  move_type?: 'dity' | 'full' | 'partial';
  documents_uploaded?: {
    orders?: boolean;
    weigh_ticket?: boolean;
    lodging_receipts?: boolean;
    fuel_receipts?: boolean;
  };
}

/**
 * Generate smart recommendations based on claim data
 * Returns prioritized list of actionable recommendations
 */
export function generateStaticRecommendations(claimData: ClaimData): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Rule 1: DITY Profit Opportunity
  if (claimData.estimated_weight && claimData.distance_miles) {
    const weight = claimData.estimated_weight;
    const distance = claimData.distance_miles;

    // DITY makes sense for lighter weights and longer distances
    if (weight < 10000 && distance > 500) {
      const estimatedProfit = calculateDITYProfit(weight, distance);
      recommendations.push({
        id: 'dity-profit-opportunity',
        type: 'dity_opportunity',
        priority: 'high',
        title: 'DITY Move Could Save Significant Money',
        message: `Based on your weight (${weight.toLocaleString()} lbs) and distance (${distance} miles), a DITY move could net you approximately $${estimatedProfit.toLocaleString()} in profit. Consider running our Cost Comparison Tool.`,
        action: 'Compare DITY vs Full Move',
        link: '/dashboard/pcs-copilot/comparison',
        estimatedSavings: estimatedProfit
      });
    }
  }

  // Rule 2: Weight Allowance Warning
  if (claimData.estimated_weight && claimData.rank) {
    const allowance = getWeightAllowance(claimData.rank, claimData.has_dependents || false);
    const overageAmount = claimData.estimated_weight - allowance;

    if (overageAmount > 500) {
      recommendations.push({
        id: 'weight-over-allowance',
        type: 'weight_warning',
        priority: 'high',
        title: 'Weight Exceeds Allowance',
        message: `You're ${overageAmount.toLocaleString()} lbs over your authorized weight allowance of ${allowance.toLocaleString()} lbs. You'll need to pay for excess weight out of pocket. Consider reducing shipment weight or contact TMO for guidance.`,
        action: 'View Weight Calculator'
      });
    } else if (overageAmount > 0) {
      recommendations.push({
        id: 'weight-near-limit',
        type: 'weight_warning',
        priority: 'medium',
        title: 'Approaching Weight Limit',
        message: `You're ${overageAmount} lbs over your weight allowance. Consider weighing before final packing to avoid excess charges.`,
        action: 'Check Weight Allowance'
      });
    }
  }

  // Rule 3: Receipt Collection Reminder
  if (claimData.move_type === 'dity' || claimData.move_type === 'partial') {
    recommendations.push({
      id: 'receipt-reminder',
      type: 'receipt_reminder',
      priority: 'high',
      title: 'Save ALL Receipts',
      message: 'For DITY moves, keep EVERY receipt for gas, tolls, hotels, meals, truck rental, packing materials, and equipment. These are 100% reimbursable and significantly increase your payout.',
      action: 'View Receipt Checklist'
    });
  }

  // Rule 4: Timeline Warning - TLE Limits
  if (claimData.departure_date && claimData.arrival_date) {
    const daysAtOrigin = calculateDaysBetween(new Date().toISOString(), claimData.departure_date);
    const travelDays = calculateDaysBetween(claimData.departure_date, claimData.arrival_date);

    if (daysAtOrigin > 7) {
      recommendations.push({
        id: 'tle-origin-limit',
        type: 'timeline_warning',
        priority: 'medium',
        title: 'TLE at Origin Limited to 10 Days',
        message: `Temporary Lodging Expense (TLE) at your origin is limited to 10 days. Plan your departure accordingly to maximize this benefit.`,
        action: 'Learn About TLE'
      });
    }

    if (travelDays > 7) {
      recommendations.push({
        id: 'extended-travel-time',
        type: 'timeline_warning',
        priority: 'low',
        title: 'Extended Travel Time',
        message: `Your travel time is ${travelDays} days. Ensure you have lodging receipts for each night and per diem documentation.`,
        action: 'View Per Diem Rates'
      });
    }
  }

  // Rule 5: Missing Critical Documents
  if (claimData.documents_uploaded) {
    const docs = claimData.documents_uploaded;

    if (!docs.orders) {
      recommendations.push({
        id: 'missing-orders',
        type: 'document_missing',
        priority: 'high',
        title: 'PCS Orders Required',
        message: 'You must upload your official PCS orders. This is the #1 most important document for your claim.',
        action: 'Upload Orders Now'
      });
    }

    if (claimData.move_type === 'dity' && !docs.weigh_ticket) {
      recommendations.push({
        id: 'missing-weigh-tickets',
        type: 'document_missing',
        priority: 'high',
        title: 'Weigh Tickets Required',
        message: 'DITY moves require both EMPTY and FULL weigh tickets. Visit a certified weigh station (CAT scales) before loading and after loading your truck.',
        action: 'Find Weigh Stations'
      });
    }
  }

  // Rule 6: DITY Move Weight Sweet Spot
  if (claimData.estimated_weight && claimData.estimated_weight >= 3000 && claimData.estimated_weight <= 8000) {
    recommendations.push({
      id: 'dity-sweet-spot',
      type: 'cost_savings',
      priority: 'medium',
      title: 'Optimal Weight for DITY',
      message: `Your estimated weight (${claimData.estimated_weight.toLocaleString()} lbs) is in the sweet spot for DITY profitability. Most service members in this range see $2,000-$5,000 profit.`,
      action: 'Run Cost Analysis'
    });
  }

  // Rule 7: House Hunting Trip Entitlement
  if (claimData.rank && (claimData.rank.startsWith('E-7') || claimData.rank.startsWith('O-'))) {
    recommendations.push({
      id: 'hht-entitlement',
      type: 'entitlement_tip',
      priority: 'medium',
      title: 'You May Qualify for House Hunting Trip',
      message: 'As an E-7+ or Officer, you may be authorized a house hunting trip (HHT) to your new duty station. Check with your TMO office.',
      action: 'Learn About HHT'
    });
  }

  // Rule 8: SDP Opportunity (if deployment recently)
  if (claimData.departure_date) {
    recommendations.push({
      id: 'sdp-reminder',
      type: 'entitlement_tip',
      priority: 'low',
      title: 'Savings Deposit Program Reminder',
      message: 'If you\'re PCSing after a deployment, remember to withdraw your SDP funds (if applicable) before moving to maximize the 10% annual return.',
      action: 'Learn About SDP'
    });
  }

  // Rule 9: Storage in Transit (SIT) Limits
  if (claimData.estimated_weight && claimData.estimated_weight > 8000) {
    recommendations.push({
      id: 'sit-limits',
      type: 'compliance_risk',
      priority: 'medium',
      title: 'Storage in Transit (SIT) Available',
      message: 'With a larger shipment, you\'re authorized up to 90 days of Storage in Transit (SIT) if you can\'t immediately move into your new residence. Plan ahead.',
      action: 'Learn About SIT'
    });
  }

  // Rule 10: Advance Operating Allowance (AOP)
  if (claimData.distance_miles && claimData.distance_miles > 1000) {
    recommendations.push({
      id: 'aop-opportunity',
      type: 'entitlement_tip',
      priority: 'low',
      title: 'Consider Advance Operating Allowance',
      message: 'Long-distance PCS moves may qualify for an Advance Operating Allowance (AOP) to help with upfront costs. Contact your finance office.',
      action: 'Learn About AOP'
    });
  }

  // Sort by priority (high → medium → low)
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Helper Functions
 */

function calculateDITYProfit(weight: number, distance: number): number {
  // Simplified profit calculation
  // Government pays ~$0.18/lb/mile, actual cost ~$0.12/lb/mile
  const governmentPay = weight * distance * 0.18;
  const estimatedCost = weight * distance * 0.12;
  return Math.round(governmentPay - estimatedCost);
}

function getWeightAllowance(rank: string, hasDependents: boolean): number {
  // Simplified weight allowances (lbs)
  const allowances: Record<string, { solo: number; deps: number }> = {
    'E-1': { solo: 5000, deps: 8000 },
    'E-2': { solo: 5000, deps: 8000 },
    'E-3': { solo: 5000, deps: 8000 },
    'E-4': { solo: 7000, deps: 8000 },
    'E-5': { solo: 7000, deps: 9000 },
    'E-6': { solo: 8000, deps: 11000 },
    'E-7': { solo: 11000, deps: 13000 },
    'E-8': { solo: 12000, deps: 14000 },
    'E-9': { solo: 13000, deps: 15000 },
    'O-1': { solo: 10000, deps: 12000 },
    'O-2': { solo: 10000, deps: 12000 },
    'O-3': { solo: 11000, deps: 13000 },
    'O-4': { solo: 12000, deps: 14000 },
    'O-5': { solo: 13000, deps: 16000 },
    'O-6': { solo: 14000, deps: 18000 },
  };

  const rankData = allowances[rank] || allowances['E-5']; // Default to E-5
  return hasDependents ? rankData.deps : rankData.solo;
}

function calculateDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

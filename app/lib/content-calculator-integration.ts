/**
 * Content-Calculator Deep Linking Integration
 * 
 * Intelligently connects content blocks to relevant calculators
 * and pre-fills calculator inputs based on content context.
 */

export interface CalculatorLink {
  calculatorId: string;
  calculatorName: string;
  calculatorPath: string;
  relevanceScore: number;
  prefillData?: Record<string, any>;
  actionLabel: string;
  description: string;
}

export interface ContentCalculatorMap {
  contentId: string;
  contentTitle: string;
  contentDomain: string;
  calculators: CalculatorLink[];
}

/**
 * Get relevant calculators for a content block
 */
export function getRelevantCalculators(content: {
  id: string;
  title: string;
  domain: string;
  tags: string[];
  seo_keywords: string[];
  html: string;
}): CalculatorLink[] {
  const calculators: CalculatorLink[] = [];
  const contentText = `${content.title} ${content.tags.join(' ')} ${content.seo_keywords.join(' ')} ${content.html}`.toLowerCase();

  // TSP MODELER
  if (
    content.domain === 'retirement' ||
    contentText.includes('tsp') ||
    contentText.includes('thrift savings') ||
    contentText.includes('401k') ||
    contentText.includes('retirement savings')
  ) {
    calculators.push({
      calculatorId: 'tsp-modeler',
      calculatorName: 'TSP Retirement Modeler',
      calculatorPath: '/dashboard/tools/tsp-modeler',
      relevanceScore: 0.95,
      actionLabel: 'Model Your TSP Growth',
      description: 'See how your TSP contributions grow over time with compound interest projections'
    });
  }

  // SDP STRATEGIST
  if (
    content.domain === 'deployment' ||
    contentText.includes('sdp') ||
    contentText.includes('savings deposit') ||
    contentText.includes('deployment') ||
    contentText.includes('combat zone')
  ) {
    calculators.push({
      calculatorId: 'sdp-strategist',
      calculatorName: 'SDP Deployment Strategist',
      calculatorPath: '/dashboard/tools/sdp-strategist',
      relevanceScore: 0.95,
      actionLabel: 'Calculate SDP Returns',
      description: 'Maximize your 10% guaranteed return during deployment with SDP optimization'
    });
  }

  // LIFE INSURANCE CALCULATOR
  if (
    content.domain === 'benefits' ||
    contentText.includes('sgli') ||
    contentText.includes('vgli') ||
    contentText.includes('life insurance') ||
    contentText.includes('coverage') ||
    contentText.includes('beneficiary')
  ) {
    calculators.push({
      calculatorId: 'life-insurance',
      calculatorName: 'Life Insurance Calculator',
      calculatorPath: '/dashboard/tools/life-insurance-calculator',
      relevanceScore: 0.90,
      actionLabel: 'Calculate Coverage Needs',
      description: 'Determine optimal life insurance coverage for your family\'s financial security'
    });
  }

  // PCS BUDGET CALCULATOR
  if (
    content.domain === 'pcs' ||
    contentText.includes('pcs') ||
    contentText.includes('permanent change') ||
    contentText.includes('moving') ||
    contentText.includes('dity') ||
    contentText.includes('ppm')
  ) {
    calculators.push({
      calculatorId: 'pcs-budget',
      calculatorName: 'PCS Budget Calculator',
      calculatorPath: '/dashboard/tools/pcs-budget-calculator',
      relevanceScore: 0.90,
      actionLabel: 'Plan Your PCS Budget',
      description: 'Calculate PCS costs, DITY move profit, and relocation budget planning'
    });
  }

  // BAH COMPARISON CALCULATOR
  if (
    content.domain === 'pcs' ||
    content.domain === 'finance' ||
    contentText.includes('bah') ||
    contentText.includes('housing allowance') ||
    contentText.includes('housing cost') ||
    contentText.includes('rent vs buy')
  ) {
    calculators.push({
      calculatorId: 'bah-comparison',
      calculatorName: 'BAH Location Comparison',
      calculatorPath: '/dashboard/tools/bah-comparison-calculator',
      relevanceScore: 0.85,
      actionLabel: 'Compare BAH Rates',
      description: 'Compare housing allowances and costs across military bases nationwide'
    });
  }

  // BLENDED RETIREMENT CALCULATOR
  if (
    content.domain === 'retirement' ||
    contentText.includes('brs') ||
    contentText.includes('blended retirement') ||
    contentText.includes('high-3') ||
    contentText.includes('pension') ||
    contentText.includes('retirement system')
  ) {
    calculators.push({
      calculatorId: 'blended-retirement',
      calculatorName: 'Blended Retirement Calculator',
      calculatorPath: '/dashboard/tools/tsp-modeler',
      relevanceScore: 0.90,
      actionLabel: 'Compare Retirement Options',
      description: 'Compare BRS vs High-3 retirement systems for your career'
    });
  }

  // Sort by relevance score
  calculators.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return calculators;
}

/**
 * Extract pre-fill data from content for calculator
 */
export function extractPrefillData(content: {
  html: string;
  tags: string[];
  domain: string;
}, calculatorId: string): Record<string, any> | undefined {
  const prefillData: Record<string, any> = {};
  const contentText = content.html.toLowerCase();

  switch (calculatorId) {
    case 'tsp-modeler':
      // Try to extract contribution amounts, years of service, etc.
      const contributionMatch = contentText.match(/\$?(\d{1,3}(?:,?\d{3})*(?:\.\d{2})?)/);
      if (contributionMatch) {
        const amount = parseFloat(contributionMatch[1].replace(/,/g, ''));
        if (amount >= 50 && amount <= 5000) {
          prefillData.monthlyContribution = amount;
        }
      }
      
      // Check for BRS mention
      if (contentText.includes('brs') || contentText.includes('blended retirement')) {
        prefillData.retirementSystem = 'brs';
      }
      break;

    case 'sdp-strategist':
      // Extract deployment duration if mentioned
      const monthsMatch = contentText.match(/(\d+)\s*months?/);
      if (monthsMatch) {
        const months = parseInt(monthsMatch[1]);
        if (months >= 1 && months <= 12) {
          prefillData.deploymentMonths = months;
        }
      }
      break;

    case 'life-insurance':
      // Extract family size indicators
      if (contentText.includes('children') || contentText.includes('kids')) {
        prefillData.hasChildren = true;
      }
      if (contentText.includes('spouse') || contentText.includes('married')) {
        prefillData.hasSpouse = true;
      }
      break;

    case 'pcs-budget':
      // Extract origin/destination if mentioned
      const states = [
        'california', 'texas', 'florida', 'virginia', 'hawaii', 
        'north carolina', 'south carolina', 'georgia', 'colorado', 
        'washington', 'okinawa', 'germany', 'korea', 'japan'
      ];
      
      for (const state of states) {
        if (contentText.includes(state)) {
          if (!prefillData.destination) {
            prefillData.destination = state;
            break;
          }
        }
      }
      break;

    case 'bah-comparison':
      // Extract base names or locations
      const bases = [
        'fort bragg', 'camp pendleton', 'fort hood', 'fort campbell',
        'joint base lewis', 'fort benning', 'norfolk', 'san diego',
        'pearl harbor', 'ramstein'
      ];
      
      for (const base of bases) {
        if (contentText.includes(base)) {
          prefillData.baseLocation = base;
          break;
        }
      }
      break;

    case 'blended-retirement':
      // Extract years of service if mentioned
      const yosMatch = contentText.match(/(\d+)\s*years?\s*(?:of\s*)?service/);
      if (yosMatch) {
        const years = parseInt(yosMatch[1]);
        if (years >= 0 && years <= 30) {
          prefillData.yearsOfService = years;
        }
      }
      break;
  }

  return Object.keys(prefillData).length > 0 ? prefillData : undefined;
}

/**
 * Generate calculator deep link with pre-filled parameters
 */
export function generateCalculatorLink(
  calculatorPath: string,
  prefillData?: Record<string, any>,
  sourceContentId?: string
): string {
  const url = new URL(calculatorPath, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  
  if (prefillData) {
    Object.entries(prefillData).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }
  
  if (sourceContentId) {
    url.searchParams.set('source', 'content');
    url.searchParams.set('contentId', sourceContentId);
  }
  
  return url.pathname + url.search;
}

/**
 * Track calculator launch from content
 */
export async function trackCalculatorLaunch(
  contentId: string,
  calculatorId: string,
  userId: string
): Promise<void> {
  try {
    await fetch('/api/content/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentId,
        action: 'calculator_launch',
        metadata: { calculatorId, userId }
      })
    });
  } catch (error) {
  }
}

/**
 * Get content blocks that link to a specific calculator
 */
export function getContentForCalculator(calculatorId: string): {
  domains: string[];
  tags: string[];
  keywords: string[];
} {
  const calculatorContent: Record<string, { domains: string[]; tags: string[]; keywords: string[] }> = {
    'tsp-modeler': {
      domains: ['retirement', 'finance'],
      tags: ['tsp', 'retirement', 'investing', 'compound-interest'],
      keywords: ['tsp', 'thrift savings plan', 'retirement', '401k', 'compound interest']
    },
    'sdp-strategist': {
      domains: ['deployment', 'finance'],
      tags: ['sdp', 'deployment', 'savings', 'guaranteed-return'],
      keywords: ['sdp', 'savings deposit program', 'deployment', '10 percent', 'combat zone']
    },
    'life-insurance': {
      domains: ['benefits', 'family'],
      tags: ['sgli', 'vgli', 'insurance', 'life-insurance', 'beneficiary'],
      keywords: ['sgli', 'vgli', 'life insurance', 'coverage', 'beneficiary', 'death benefit']
    },
    'pcs-budget': {
      domains: ['pcs', 'finance'],
      tags: ['pcs', 'moving', 'dity', 'ppm', 'relocation'],
      keywords: ['pcs', 'permanent change station', 'moving', 'dity', 'ppm', 'relocation']
    },
    'bah-comparison': {
      domains: ['pcs', 'finance', 'benefits'],
      tags: ['bah', 'housing', 'allowance', 'cost-of-living'],
      keywords: ['bah', 'housing allowance', 'rent', 'mortgage', 'cost of living']
    },
    'blended-retirement': {
      domains: ['retirement', 'career'],
      tags: ['brs', 'high-3', 'retirement', 'pension'],
      keywords: ['brs', 'blended retirement', 'high-3', 'pension', 'retirement system']
    }
  };

  return calculatorContent[calculatorId] || { domains: [], tags: [], keywords: [] };
}


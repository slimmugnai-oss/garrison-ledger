import 'server-only';
import { z } from 'zod';

/**
 * PROPRIETARY RULES ENGINE - SERVER ONLY
 * This file contains Garrison Ledger's intelligent plan assembly logic.
 * Protected by server-only import to prevent client-side exposure.
 */

// ==================== ZOD SCHEMAS ====================

export const StrategicInputSchema = z.object({
  // Original assessment formats
  strategic: z.object({
    biggestFocus: z.string().optional(),
    pcsTimeline: z.string().optional(),
    efmpEnrolled: z.boolean().optional(),
    careerGoal: z.string().optional(),
    financialWorry: z.string().optional(),
  }).optional(),
  comprehensive: z.object({
    foundation: z.object({
      serviceYears: z.string().optional(),
      familySnapshot: z.string().optional(),
      efmpEnrolled: z.boolean().optional(),
    }).optional(),
    move: z.object({
      pcsSituation: z.string().optional(),
      oconusMove: z.string().optional(),
    }).optional(),
    deployment: z.object({
      status: z.string().optional(),
    }).optional(),
    career: z.object({
      ambitions: z.array(z.string()).optional(),
    }).optional(),
    finance: z.object({
      priority: z.string().optional(),
    }).optional(),
    preferences: z.object({
      topicInterests: z.array(z.string()).optional(),
      urgencyLevel: z.string().optional(),
      knowledgeLevel: z.string().optional(),
    }).optional(),
  }).optional(),
  // Adaptive assessment format (flexible key-value pairs)
  adaptive: z.record(z.union([z.string(), z.array(z.string())])).optional(),
}).passthrough(); // Allow additional keys for forward compatibility

export const AssembledPlanSchema = z.object({
  primarySituation: z.string(),
  priorityAction: z.string(),
  atomIds: z.array(z.string()),
});

export type StrategicInput = z.infer<typeof StrategicInputSchema>;
export type AssembledPlan = z.infer<typeof AssembledPlanSchema>;

// ==================== PINNED CONTENT CONFIGURATION ====================

/**
 * Pinned content that bypasses diversity rules and gets auto-included
 * when specific conditions are met.
 */
type PinnedContentRule = {
  slug: string;
  condition: (input: StrategicInput) => boolean;
  priority: 'critical' | 'high' | 'normal';
};

const PINNED_CONTENT: PinnedContentRule[] = [
  // Example: Time-sensitive BAH rates announcement
  // {
  //   slug: '2026-bah-rates-announced',
  //   condition: (input) => {
  //     const pcs = input?.strategic?.pcsTimeline || input?.comprehensive?.move?.pcsSituation || '';
  //     return ['orders', 'window', 'arrived'].includes(pcs);
  //   },
  //   priority: 'critical'
  // },
  
  // Add more pinned content here as needed
  // Example: SCRA updates, tax season reminders, etc.
];

/**
 * Get pinned content that applies to this user's situation
 */
function getPinnedContent(input: StrategicInput): string[] {
  return PINNED_CONTENT
    .filter(rule => rule.condition(input))
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, normal: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .map(rule => rule.slug);
}

// ==================== SCORING ENHANCEMENTS ====================

/**
 * Calculate recency boost for content blocks
 * Content updated/created within last 30 days gets a relevance boost
 */
export function calculateRecencyBoost(updatedAt: Date | string | null): number {
  if (!updatedAt) return 0;
  
  const updateDate = typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt;
  const now = new Date();
  const daysSinceUpdate = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // Within 7 days: +15% boost
  if (daysSinceUpdate <= 7) return 0.15;
  
  // Within 30 days: +8% boost
  if (daysSinceUpdate <= 30) return 0.08;
  
  // Older: no boost
  return 0;
}

/**
 * Apply diversity guardrail to atom selection
 * Prevents more than one atom of the same type (unless pinned)
 */
export function applyDiversityGuardrail(
  atomIds: string[],
  atomMetadata: Map<string, { type: string; isPinned: boolean }>
): string[] {
  const seen = new Set<string>();
  const diverse: string[] = [];
  
  for (const atomId of atomIds) {
    const meta = atomMetadata.get(atomId);
    if (!meta) {
      // Unknown atom, include it (fail-safe)
      diverse.push(atomId);
      continue;
    }
    
    // Pinned content always included (bypass diversity)
    if (meta.isPinned) {
      diverse.push(atomId);
      continue;
    }
    
    // Check if we've already included this type
    if (seen.has(meta.type)) {
      // Skip this atom (duplicate type)
      continue;
    }
    
    // Include this atom and mark type as seen
    diverse.push(atomId);
    seen.add(meta.type);
  }
  
  return diverse;
}

// ==================== RULES ENGINE ====================

export function assemblePlan(input: StrategicInput): AssembledPlan {
  const s = input?.strategic || {};
  const c = input?.comprehensive || {};
  
  const focus = s.biggestFocus || '';
  const pcs = s.pcsTimeline || c.move?.pcsSituation || '';
  const efmp = s.efmpEnrolled || c.foundation?.efmpEnrolled || false;
  const career = s.careerGoal || c.career?.ambitions?.[0] || '';
  const finance = s.financialWorry || c.finance?.priority || '';
  const interests = c.preferences?.topicInterests || [];
  const urgency = c.preferences?.urgencyLevel || 'normal';

  // Check for pinned content first
  const pinnedAtoms = getPinnedContent(input);

  // ==================== PCS RULES ====================
  
  // Rule 1: Urgent EFMP PCS
  if ((focus === 'pcs' || pcs === 'orders' || pcs === 'window') && efmp && (pcs === 'orders' || urgency === 'high')) {
    const atoms = [...pinnedAtoms, 'pcs-emotional-readiness', 'pcs-master-checklist'];
    const hasFinancialStress = ['budget', 'debt'].includes(finance);
    
    if (hasFinancialStress) atoms.push('pcs-budget-calculator');
    
    const standardPriority = ['pcs-timeline-tool', 'pcs-faq'];
    for (const atom of standardPriority) {
      if (atoms.length >= 5) break;
      atoms.push(atom);
    }
    
    return {
      primarySituation: "Urgent EFMP Relocation",
      priorityAction: "With an EFMP move on orders, your #1 priority is to initiate the family member travel screening process immediately. This is the crucial first step to ensure medical and educational support is available at your new duty station.",
      atomIds: atoms.slice(0, 5),
    };
  }

  // Rule 2: Imminent PCS (Orders in Hand)
  if (focus === 'pcs' && pcs === 'orders') {
    const atoms = [...pinnedAtoms, 'pcs-master-checklist', 'pcs-budget-calculator'];
    const familySnap = c.foundation?.familySnapshot || '';
    const hasChildren = ['young_children', 'school_age', 'mixed'].includes(familySnap);
    const hasFinancialStress = ['budget', 'debt'].includes(finance);
    
    if (hasChildren) atoms.push('pcs-emotional-readiness');
    if (hasFinancialStress) atoms.push('les-decoder');
    
    const standardPriority = ['pcs-timeline-tool', 'pcs-faq'];
    for (const atom of standardPriority) {
      if (atoms.length >= 5) break;
      atoms.push(atom);
    }
    
    return {
      primarySituation: "Imminent PCS Move",
      priorityAction: "Schedule your household goods shipment with TMO immediately and create your PCS binder. You need to act within the next 2 weeks to secure your preferred dates.",
      atomIds: atoms.slice(0, 5),
    };
  }

  // Rule 3: PCS Window
  if (focus === 'pcs' && pcs === 'window') {
    const hasActiveCareerGoal = career && career !== 'not_career' && career !== '';
    if (!hasActiveCareerGoal) {
      const atoms = [...pinnedAtoms, 'pcs-timeline-tool'];
      const serviceYrs = c.foundation?.serviceYears || '';
      const isVeteran = serviceYrs === '16+';
      const hasTSPFocus = finance === 'tsp';
      const hasChildren = ['young_children', 'school_age', 'mixed'].includes(c.foundation?.familySnapshot || '');
      const hasFinancialStress = ['budget', 'debt'].includes(finance);
      
      if (isVeteran && hasTSPFocus) {
        atoms.push('tsp-brs-essentials', 'ppm-profit-guide', 'federal-employment-guide');
      } else if (hasChildren && hasFinancialStress) {
        atoms.push('pcs-emotional-readiness', 'pcs-budget-calculator', 'les-decoder');
      } else {
        atoms.push('pcs-emotional-readiness', 'pcs-budget-calculator');
        if (hasTSPFocus) atoms.push('tsp-brs-essentials');
        else if (hasFinancialStress) atoms.push('les-decoder');
        else if (finance === 'emergency') atoms.push('emergency-fund-builder');
        else atoms.push('pcs-faq');
      }
      
      return {
        primarySituation: "Strategic PCS Planning",
        priorityAction: "Use this planning window to organize your finances, research your new location, and prepare emotionally. Early preparation gives you maximum control.",
        atomIds: atoms.slice(0, 5),
      };
    }
  }

  // Rule 4: OCONUS PCS
  if ((focus === 'pcs' || pcs === 'orders' || pcs === 'window') && c.move?.oconusMove === 'yes') {
    const atoms = [...pinnedAtoms, 'oconus-pcs-guide', 'pcs-master-checklist'];
    const hasCareerGoal = career && career !== 'not_career';
    const hasFinancialStress = ['budget', 'debt', 'emergency'].includes(finance);
    
    if (hasCareerGoal) atoms.push('portable-careers-guide');
    if (hasFinancialStress) atoms.push('emergency-fund-builder');
    
    const standardPriority = ['pcs-timeline-tool', 'oconus-shopping-guide', 'pcs-budget-calculator'];
    for (const atom of standardPriority) {
      if (atoms.length >= 5) break;
      atoms.push(atom);
    }
    
    return {
      primarySituation: "OCONUS PCS Preparation",
      priorityAction: "Begin country-specific preparations immediately: passports, pet quarantine paperwork, and understanding SOFA/VAT regulations for your destination.",
      atomIds: atoms.slice(0, 5),
    };
  }

  // ==================== DEPLOYMENT RULES ====================
  
  // Rule 5: Pre-Deployment
  if (focus === 'deployment' || c.deployment?.status === 'pre') {
    return {
      primarySituation: "Deployment Preparation",
      priorityAction: "Complete all legal and financial preparations within the next 30 days: Power of Attorney, wills, allotments, and family communication plan.",
      atomIds: [...pinnedAtoms, 'pre-deployment-checklist', 'deployment-family-pact', 'deployment-faq'].slice(0, 5),
    };
  }

  // Rule 6: Currently Deployed
  if (c.deployment?.status === 'current') {
    return {
      primarySituation: "Active Deployment Support",
      priorityAction: "Focus on maintaining financial stability through allotments and accessing support resources for solo parenting and emotional wellness.",
      atomIds: [...pinnedAtoms, 'homefront-survival', 'emergency-fund-builder', 'deployment-faq'].slice(0, 5),
    };
  }

  // Rule 7: Reintegration
  if (c.deployment?.status === 'reintegration') {
    const atoms = [...pinnedAtoms, 'reintegration-roadmap'];
    
    if (focus === 'finances' && finance === 'tsp') {
      atoms.push('tsp-brs-essentials', 'emergency-fund-builder', 'deployment-faq');
    } else if (focus === 'finances') {
      atoms.push('emergency-fund-builder', 'les-decoder', 'deployment-faq');
    } else {
      atoms.push('deployment-faq', 'emergency-fund-builder', 'homefront-survival');
    }
    
    return {
      primarySituation: "Reintegration Phase",
      priorityAction: "Give yourself and your service member grace. Rebuilding your 'new normal' takes 3-6 months. If finances are a concern, now is the time to realign your budget as deployment pays end.",
      atomIds: atoms.slice(0, 5),
    };
  }

  // ==================== CAREER RULES ====================
  
  // Rule 8: Job Search NOW
  if (focus === 'career' && (career === 'find-job' || interests.includes('remote-work'))) {
    const atoms = [...pinnedAtoms, 'resume-power-up', 'federal-employment-guide', 'portable-careers-guide'];
    const hasFinancialStress = ['budget', 'debt'].includes(finance);
    
    if (hasFinancialStress) atoms.push('les-decoder');
    
    return {
      primarySituation: "Active Job Search",
      priorityAction: "Translate your military life into powerful resume achievements and connect with MSEP (Military Spouse Employment Partnership) employers who value your skills.",
      atomIds: atoms.slice(0, 5),
    };
  }

  // Rule 9: Portable Career Development
  if (focus === 'career' && career === 'portable-career') {
    return {
      primarySituation: "Portable Career Development",
      priorityAction: "Identify a career field with strong remote opportunities, then create a certification roadmap to transition into it using MyCAA funding.",
      atomIds: [...pinnedAtoms, 'portable-careers-guide', 'mycaa-complete-guide', 'high-impact-certs'].slice(0, 5),
    };
  }

  // Rule 10: Entrepreneurship
  if (focus === 'career' && (career === 'business' || interests.includes('entrepreneurship'))) {
    const atoms = [...pinnedAtoms, 'entrepreneur-toolkit', 'license-transfer-guide'];
    const hasFinancialStress = ['budget', 'debt', 'emergency'].includes(finance);
    
    if (hasFinancialStress) {
      atoms.push('emergency-fund-builder', 'les-decoder');
    }
    
    const standardPriority = ['portable-careers-guide', 'mycaa-complete-guide'];
    for (const atom of standardPriority) {
      if (atoms.length >= 5) break;
      atoms.push(atom);
    }
    
    return {
      primarySituation: "Business Development Priority",
      priorityAction: "Validate your business idea, choose the correct legal structure (likely an LLC), and create a clear budget that separates your business and personal finances to ensure sustainable growth.",
      atomIds: atoms.slice(0, 5),
    };
  }

  // Rule 11: Education/MyCAA
  if (focus === 'career' && (career === 'education' || interests.includes('mycaa'))) {
    const atoms = [...pinnedAtoms, 'mycaa-complete-guide', 'high-impact-certs', 'portable-careers-guide'];
    const hasFinancialStress = ['budget', 'debt'].includes(finance);
    
    if (hasFinancialStress) atoms.push('les-decoder');
    
    return {
      primarySituation: "Education & Certification Priority",
      priorityAction: "Check your MyCAA eligibility today and choose a portable, high-demand certification. The $4,000 benefit can transform your career.",
      atomIds: atoms.slice(0, 5),
    };
  }

  // ==================== FINANCE RULES ====================
  
  // Rule 12: Budget & Debt Crisis
  if (focus === 'finances' && (finance === 'budget' || finance === 'debt')) {
    return {
      primarySituation: "Financial Stabilization Priority",
      priorityAction: "Create a zero-based budget using your LES this week. Then leverage SCRA to reduce interest rates on existing debt to 6% immediately.",
      atomIds: [...pinnedAtoms, 'les-decoder', 'emergency-fund-builder', 'commissary-exchange-basics'].slice(0, 5),
    };
  }

  // Rule 13: Emergency Savings
  if (focus === 'finances' && finance === 'emergency') {
    return {
      primarySituation: "Emergency Fund Priority",
      priorityAction: "Set up an automatic allotment today to build a 3-6 month emergency fund. Start with $100/month if that's all you can do.",
      atomIds: [...pinnedAtoms, 'emergency-fund-builder', 'les-decoder', 'commissary-savings-calculator'].slice(0, 5),
    };
  }

  // Rule 14: TSP/Retirement Focus
  if (focus === 'finances' && (finance === 'tsp' || interests.includes('tsp'))) {
    return {
      primarySituation: "Retirement Readiness Priority",
      priorityAction: "Log into TSP.gov today and verify you're contributing at least 5% to capture the full government match. If not, increase your contribution immediately.",
      atomIds: [...pinnedAtoms, 'tsp-brs-essentials', 'les-decoder', 'emergency-fund-builder'].slice(0, 5),
    };
  }

  // ==================== COMBO/FALLBACK RULES ====================
  
  // Rule 15: PCS + Career Combo
  if ((focus === 'pcs' || pcs === 'window') && career) {
    const atoms = [...pinnedAtoms, 'pcs-timeline-tool', 'resume-power-up'];
    const isJobSearching = career === 'find-job';
    const hasFinancialStress = ['budget', 'debt', 'emergency'].includes(finance);
    
    if (isJobSearching) atoms.push('portable-careers-guide');
    else atoms.push('mycaa-complete-guide');
    
    if (hasFinancialStress) atoms.push('emergency-fund-builder');
    
    const standardPriority = ['pcs-master-checklist', 'federal-employment-guide'];
    for (const atom of standardPriority) {
      if (atoms.length >= 5) break;
      atoms.push(atom);
    }
    
    return {
      primarySituation: "PCS + Career Transition",
      priorityAction: "With a PCS on the horizon and an immediate need for employment, your #1 priority is to simultaneously manage your relocation timeline while preparing your resume for your new job market.",
      atomIds: atoms.slice(0, 5),
    };
  }

  // Fallback: Default PCS
  if (focus === 'pcs' || pcs !== 'none') {
    return {
      primarySituation: "PCS Planning Mode",
      priorityAction: "Familiarize yourself with the complete PCS process and understand your financial entitlements.",
      atomIds: [...pinnedAtoms, 'pcs-master-checklist', 'pcs-timeline-tool', 'pcs-faq'].slice(0, 5),
    };
  }

  // Fallback: Default Career
  if (focus === 'career' || (c.career?.ambitions && c.career.ambitions.length > 0)) {
    return {
      primarySituation: "Career Development Focus",
      priorityAction: "Build a portable career that thrives across multiple duty stations using strategic certifications and remote work.",
      atomIds: [...pinnedAtoms, 'portable-careers-guide', 'resume-power-up', 'mycaa-complete-guide'].slice(0, 5),
    };
  }

  // Fallback: Default Deployment
  if (focus === 'deployment') {
    return {
      primarySituation: "Deployment Readiness",
      priorityAction: "Complete legal and financial preparations and establish a realistic family communication plan.",
      atomIds: [...pinnedAtoms, 'pre-deployment-checklist', 'deployment-family-pact', 'deployment-faq'].slice(0, 5),
    };
  }

  // Ultimate Fallback: Financial Wellness
  return {
    primarySituation: "Financial Wellness Priority",
    priorityAction: "Build a solid financial foundation by understanding your military pay and creating a sustainable budget.",
    atomIds: [...pinnedAtoms, 'les-decoder', 'emergency-fund-builder', 'tsp-brs-essentials'].slice(0, 5),
  };
}

/**
 * Enhanced version that applies diversity guardrail
 * Call this from API when you have block metadata available
 */
export function assemblePlanWithDiversity(
  input: StrategicInput,
  blockMetadata: Array<{ slug: string; type: string; updated_at?: string | null }>
): AssembledPlan {
  // Get base plan from rules
  const basePlan = assemblePlan(input);
  
  // Identify pinned atoms
  const pinnedSlugs = getPinnedContent(input);
  
  // Create metadata map
  const metaMap = new Map(
    blockMetadata.map(block => [
      block.slug,
      {
        type: block.type,
        isPinned: pinnedSlugs.includes(block.slug),
        updatedAt: block.updated_at
      }
    ])
  );
  
  // Apply diversity guardrail
  const diverseAtomIds = applyDiversityGuardrail(
    basePlan.atomIds,
    metaMap
  );
  
  return {
    ...basePlan,
    atomIds: diverseAtomIds,
  };
}

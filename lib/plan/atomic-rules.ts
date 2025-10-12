// Gold Standard Intelligent Assembly Rules
// Two-step process: (1) Identify #1 Priority, (2) Select 3-5 supporting atoms

export type StrategicInput = {
  strategic?: {
    biggestFocus?: string;
    pcsTimeline?: string;
    efmpEnrolled?: boolean;
    careerGoal?: string;
    financialWorry?: string;
  };
  comprehensive?: {
    foundation?: { serviceYears?: string; familySnapshot?: string; efmpEnrolled?: boolean };
    move?: { pcsSituation?: string; oconusMove?: string };
    deployment?: { status?: string };
    career?: { ambitions?: string[] };
    finance?: { priority?: string };
    preferences?: { topicInterests?: string[]; urgencyLevel?: string; knowledgeLevel?: string };
  };
};

export type AssembledPlan = {
  primarySituation: string;
  priorityAction: string;
  atomIds: string[]; // Just IDs, no "why" - UI handles presentation
};

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

  // ==================== PCS RULES ====================
  
  // Rule 1: Urgent EFMP PCS
  if ((focus === 'pcs' || pcs === 'orders' || pcs === 'window') && efmp && (pcs === 'orders' || urgency === 'high')) {
    return {
      primarySituation: "Urgent EFMP Relocation",
      priorityAction: "Contact your EFMP Family Support Coordinator immediately to begin medical and educational screening for your new location. This is the most time-sensitive part of your PCS.",
      atomIds: ['pcs-master-checklist', 'pcs-timeline-tool', 'pcs-budget-calculator'],
    };
  }

  // Rule 2: Imminent PCS (Orders in Hand) - Priority-Based Selection
  if (focus === 'pcs' && pcs === 'orders') {
    // Step 1: Non-negotiables for any imminent PCS
    const atoms = ['pcs-master-checklist', 'pcs-budget-calculator'];
    
    // Step 2: Add high-priority contextual atoms
    const familySnap = c.foundation?.familySnapshot || '';
    const hasChildren = ['young_children', 'school_age', 'mixed'].includes(familySnap);
    const hasFinancialStress = ['budget', 'debt'].includes(finance);
    
    if (hasChildren) {
      atoms.push('pcs-emotional-readiness');
    }
    if (hasFinancialStress) {
      atoms.push('les-decoder');
    }
    
    // Step 3: Fill remaining slots with standard resources (max 4 total)
    const standardPriority = ['pcs-timeline-tool', 'pcs-faq'];
    for (const atom of standardPriority) {
      if (atoms.length >= 4) break;
      atoms.push(atom);
    }
    
    return {
      primarySituation: "Imminent PCS Move",
      priorityAction: "Schedule your household goods shipment with TMO immediately and create your PCS binder. You need to act within the next 2 weeks to secure your preferred dates.",
      atomIds: atoms,
    };
  }

  // Rule 3: PCS Window
  if (focus === 'pcs' && pcs === 'window') {
    return {
      primarySituation: "Strategic PCS Planning",
      priorityAction: "Use this planning window to organize your finances, research your new location, and prepare emotionally. Early preparation gives you maximum control.",
      atomIds: ['pcs-timeline-tool', 'pcs-emotional-readiness', 'pcs-budget-calculator'],
    };
  }

  // Rule 4: OCONUS PCS - Priority-Based Selection
  if ((focus === 'pcs' || pcs === 'orders' || pcs === 'window') && c.move?.oconusMove === 'yes') {
    // Step 1: Non-negotiables for OCONUS move
    const atoms = ['oconus-pcs-guide', 'pcs-master-checklist'];
    
    // Step 2: Add high-priority contextual atoms
    const hasCareerGoal = career && career !== 'not_career';
    const hasFinancialStress = ['budget', 'debt', 'emergency'].includes(finance);
    
    if (hasCareerGoal) {
      atoms.push('portable-careers-guide');  // Research career options before OCONUS
    }
    if (hasFinancialStress) {
      atoms.push('emergency-fund-builder');  // OCONUS moves have higher unexpected costs
    }
    
    // Step 3: Fill remaining slots with standard resources (max 4 total)
    const standardPriority = ['pcs-timeline-tool', 'oconus-shopping-guide', 'pcs-budget-calculator'];
    for (const atom of standardPriority) {
      if (atoms.length >= 4) break;
      atoms.push(atom);
    }
    
    return {
      primarySituation: "OCONUS PCS Preparation",
      priorityAction: "Begin country-specific preparations immediately: passports, pet quarantine paperwork, and understanding SOFA/VAT regulations for your destination.",
      atomIds: atoms,
    };
  }

  // ==================== DEPLOYMENT RULES ====================
  
  // Rule 5: Pre-Deployment
  if (focus === 'deployment' || c.deployment?.status === 'pre') {
    return {
      primarySituation: "Deployment Preparation",
      priorityAction: "Complete all legal and financial preparations within the next 30 days: Power of Attorney, wills, allotments, and family communication plan.",
      atomIds: ['pre-deployment-checklist', 'deployment-family-pact', 'deployment-faq'],
    };
  }

  // Rule 6: Currently Deployed
  if (c.deployment?.status === 'current') {
    return {
      primarySituation: "Active Deployment Support",
      priorityAction: "Focus on maintaining financial stability through allotments and accessing support resources for solo parenting and emotional wellness.",
      atomIds: ['homefront-survival', 'emergency-fund-builder', 'deployment-faq'],
    };
  }

  // Rule 7: Reintegration - Priority-Based Selection
  if (c.deployment?.status === 'reintegration') {
    // Step 1: Non-negotiable for reintegration
    const atoms = ['reintegration-roadmap'];
    
    // Step 2: Add high-priority contextual atoms based on stated focus
    if (focus === 'finances' && finance === 'tsp') {
      // TSP-focused reintegration
      atoms.push('tsp-brs-essentials');
      atoms.push('emergency-fund-builder');
      atoms.push('deployment-faq');
    } else if (focus === 'finances') {
      // General financial focus during reintegration
      atoms.push('emergency-fund-builder');
      atoms.push('les-decoder');
      atoms.push('deployment-faq');
    } else {
      // Standard reintegration support
      atoms.push('deployment-faq');
      atoms.push('emergency-fund-builder');
      atoms.push('homefront-survival');
    }
    
    return {
      primarySituation: "Reintegration Phase",
      priorityAction: "Give yourself and your service member grace. Rebuilding your 'new normal' takes 3-6 months. If finances are a concern, now is the time to realign your budget as deployment pays end.",
      atomIds: atoms.slice(0, 4),  // Cap at 4
    };
  }

  // ==================== CAREER RULES ====================
  
  // Rule 8: Job Search NOW
  if (focus === 'career' && (career === 'find-job' || interests.includes('remote-work'))) {
    return {
      primarySituation: "Active Job Search",
      priorityAction: "Translate your military life into powerful resume achievements and connect with MSEP (Military Spouse Employment Partnership) employers who value your skills.",
      atomIds: ['resume-power-up', 'portable-careers-guide', 'federal-employment-guide'],
    };
  }

  // Rule 9: Portable Career Development
  if (focus === 'career' && career === 'portable-career') {
    return {
      primarySituation: "Portable Career Development",
      priorityAction: "Identify a career field with strong remote opportunities, then create a certification roadmap to transition into it using MyCAA funding.",
      atomIds: ['portable-careers-guide', 'mycaa-complete-guide', 'high-impact-certs'],
    };
  }

  // Rule 10: Entrepreneurship - Priority-Based Selection
  if (focus === 'career' && (career === 'business' || interests.includes('entrepreneurship'))) {
    // Step 1: Non-negotiables for any entrepreneur
    const atoms = ['entrepreneur-toolkit', 'license-transfer-guide'];
    
    // Step 2: Add high-priority contextual atoms
    const hasFinancialStress = ['budget', 'debt', 'emergency'].includes(finance);
    
    if (hasFinancialStress) {
      atoms.push('emergency-fund-builder');  // Critical for business owners with debt
      atoms.push('les-decoder');             // Essential for budgeting with variable income
    }
    
    // Step 3: Fill remaining slots with standard resources (max 4 total)
    const standardPriority = ['portable-careers-guide', 'mycaa-complete-guide'];
    for (const atom of standardPriority) {
      if (atoms.length >= 4) break;
      atoms.push(atom);
    }
    
    return {
      primarySituation: "Business Development Priority",
      priorityAction: "Validate your business idea, choose the correct legal structure (likely an LLC), and create a clear budget that separates your business and personal finances to ensure sustainable growth.",
      atomIds: atoms,
    };
  }

  // Rule 11: Education/MyCAA
  if (focus === 'career' && (career === 'education' || interests.includes('mycaa'))) {
    return {
      primarySituation: "Education & Certification Priority",
      priorityAction: "Check your MyCAA eligibility today and choose a portable, high-demand certification. The $4,000 benefit can transform your career.",
      atomIds: ['mycaa-complete-guide', 'high-impact-certs', 'portable-careers-guide'],
    };
  }

  // ==================== FINANCE RULES ====================
  
  // Rule 12: Budget & Debt Crisis
  if (focus === 'finances' && (finance === 'budget' || finance === 'debt')) {
    return {
      primarySituation: "Financial Stabilization Priority",
      priorityAction: "Create a zero-based budget using your LES this week. Then leverage SCRA to reduce interest rates on existing debt to 6% immediately.",
      atomIds: ['les-decoder', 'emergency-fund-builder', 'commissary-exchange-basics'],
    };
  }

  // Rule 13: Emergency Savings
  if (focus === 'finances' && finance === 'emergency') {
    return {
      primarySituation: "Emergency Fund Priority",
      priorityAction: "Set up an automatic allotment today to build a 3-6 month emergency fund. Start with $100/month if that's all you can do.",
      atomIds: ['emergency-fund-builder', 'les-decoder', 'commissary-savings-calculator'],
    };
  }

  // Rule 14: TSP/Retirement Focus
  if (focus === 'finances' && (finance === 'tsp' || interests.includes('tsp'))) {
    return {
      primarySituation: "Retirement Readiness Priority",
      priorityAction: "Log into TSP.gov today and verify you're contributing at least 5% to capture the full government match. If not, increase your contribution immediately.",
      atomIds: ['tsp-brs-essentials', 'les-decoder', 'emergency-fund-builder'],
    };
  }

  // ==================== COMBO/FALLBACK RULES ====================
  
  // Rule 15: PCS + Career Combo
  if ((focus === 'pcs' || pcs === 'window') && career) {
    return {
      primarySituation: "PCS + Career Transition",
      priorityAction: "Use your PCS as a career reset opportunity. Target remote roles that will travel with you to every future duty station.",
      atomIds: ['resume-power-up', 'pcs-master-checklist', 'portable-careers-guide'],
    };
  }

  // Fallback: Default PCS
  if (focus === 'pcs' || pcs !== 'none') {
    return {
      primarySituation: "PCS Planning Mode",
      priorityAction: "Familiarize yourself with the complete PCS process and understand your financial entitlements.",
      atomIds: ['pcs-master-checklist', 'pcs-timeline-tool', 'pcs-faq'],
    };
  }

  // Fallback: Default Career
  if (focus === 'career' || c.career?.ambitions && c.career.ambitions.length > 0) {
    return {
      primarySituation: "Career Development Focus",
      priorityAction: "Build a portable career that thrives across multiple duty stations using strategic certifications and remote work.",
      atomIds: ['portable-careers-guide', 'resume-power-up', 'mycaa-complete-guide'],
    };
  }

  // Fallback: Default Deployment
  if (focus === 'deployment') {
    return {
      primarySituation: "Deployment Readiness",
      priorityAction: "Complete legal and financial preparations and establish a realistic family communication plan.",
      atomIds: ['pre-deployment-checklist', 'deployment-family-pact', 'deployment-faq'],
    };
  }

  // Ultimate Fallback: Financial Wellness
  return {
    primarySituation: "Financial Wellness Priority",
    priorityAction: "Build a solid financial foundation by understanding your military pay and creating a sustainable budget.",
    atomIds: ['les-decoder', 'emergency-fund-builder', 'tsp-brs-essentials'],
  };
}

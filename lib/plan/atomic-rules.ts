// Intelligent Assembly Rules - Select 3-5 atomic blocks per situation
export type StrategicInput = {
  strategic?: {
    biggestFocus?: string;
    pcsTimeline?: string;
    efmpEnrolled?: boolean;
    careerGoal?: string;
    financialWorry?: string;
  };
};

export type AtomWithWhy = {
  atomId: string;
  why: string; // Dynamic, situation-specific
};

export type AssembledPlan = {
  primarySituation: string;
  priorityAction: string;
  atoms: AtomWithWhy[];
};

export function assemblePlan(input: StrategicInput): AssembledPlan {
  const s = input?.strategic || {};
  const focus = s.biggestFocus || '';
  const pcs = s.pcsTimeline || '';
  const efmp = s.efmpEnrolled || false;
  const career = s.careerGoal || '';
  const finance = s.financialWorry || '';

  // ==================== PCS RULES ====================
  
  // Rule 1: Urgent EFMP PCS
  if (focus === 'pcs' && pcs === 'orders' && efmp) {
    return {
      primarySituation: "Urgent EFMP Relocation",
      priorityAction: "Contact your EFMP Family Support Coordinator immediately to begin medical and educational screening for your new location. This is the most time-sensitive part of your entire PCS.",
      atoms: [
        { atomId: 'pcs-master-checklist', why: "Because you have orders in hand, this checklist ensures you complete every time-sensitive legal, financial, and household task before your move date." },
        { atomId: 'pcs-budget-calculator', why: "Because EFMP moves can have unexpected costs, calculating your DLA, TLE, and out-of-pocket expenses now prevents financial surprises." },
        { atomId: 'pcs-faq', why: "Because you're moving fast, these FAQs give you quick answers to common questions about entitlements, weight allowances, and reimbursements." },
      ],
    };
  }

  // Rule 2: Imminent PCS (Non-EFMP)
  if (focus === 'pcs' && pcs === 'orders') {
    return {
      primarySituation: "Imminent PCS Move",
      priorityAction: "Schedule your household goods shipment with TMO immediately and create your PCS binder with all essential documents. Time is critical.",
      atoms: [
        { atomId: 'pcs-timeline-tool', why: "Because you have orders, this tool generates your personalized timeline with every deadline from now until report date." },
        { atomId: 'pcs-master-checklist', why: "Because time is short, this comprehensive checklist breaks down legal, financial, and household tasks you must complete before moving." },
        { atomId: 'pcs-budget-calculator', why: "Because PCS moves cost $500-$2,000 out of pocket, calculating your DLA, TLE, and expenses now prevents budget shocks." },
      ],
    };
  }

  // Rule 3: PCS Window Planning
  if (focus === 'pcs' && pcs === 'window') {
    return {
      primarySituation: "Strategic PCS Planning",
      priorityAction: "Use this planning window to organize finances, research your new location, and prepare emotionally. Early preparation = less stress.",
      atoms: [
        { atomId: 'pcs-timeline-tool', why: "Because you're in the window, mapping out your timeline now gives you maximum control over pack dates and logistics." },
        { atomId: 'pcs-emotional-readiness', why: "Because you have time, addressing the emotional and psychological aspects of relocation now makes the transition smoother for your entire family." },
        { atomId: 'pcs-budget-calculator', why: "Because you can plan ahead, calculating your expected income (DLA/TLE) and expenses lets you save strategically for moving costs." },
        { atomId: 'pcs-faq', why: "Because you're planning, these FAQs answer common questions about PPM, weight allowances, and entitlements so you can make informed decisions." },
      ],
    };
  }

  // Rule 4: Settled - Future PCS Prep
  if (focus === 'pcs' && (pcs === 'settled' || !pcs)) {
    return {
      primarySituation: "Long-Term PCS Preparation",
      priorityAction: "Use this stability to build financial reserves and emotional readiness for your next move.",
      atoms: [
        { atomId: 'pcs-emotional-readiness', why: "Because you have stability now, building emotional resilience and coping strategies will pay dividends when your next orders arrive." },
        { atomId: 'emergency-fund-builder', why: "Because you have time, building a 3-6 month emergency fund now makes your next PCS financially smooth." },
        { atomId: 'pcs-faq', why: "Because you can plan ahead, familiarizing yourself with PCS entitlements and processes now reduces last-minute stress." },
      ],
    };
  }

  // ==================== DEPLOYMENT RULES ====================
  
  // Rule 5: Pre-Deployment
  if (focus === 'deployment') {
    return {
      primarySituation: "Deployment Preparation",
      priorityAction: "Complete all legal and financial preparations (POA, wills, allotments) and establish a family communication plan before deployment begins.",
      atoms: [
        { atomId: 'pre-deployment-checklist', why: "Because deployment is coming, this comprehensive checklist covers legal documents, financial setup, and household preparations you must complete." },
        { atomId: 'deployment-family-pact', why: "Because communication is critical, this planner helps your family define goals, expectations, and a realistic communication strategy for the separation ahead." },
        { atomId: 'homefront-survival', why: "Because you'll be managing everything solo, understanding the emotional phases and childcare resources prepares you for the reality of deployment." },
      ],
    };
  }

  // ==================== CAREER RULES ====================
  
  // Rule 6: Job Search NOW
  if (focus === 'career' && career === 'find-job') {
    return {
      primarySituation: "Active Job Search",
      priorityAction: "Translate your military life into resume achievements and connect with MSEP employers who value your skills.",
      atoms: [
        { atomId: 'resume-power-up', why: "Because you need a job now, this guide shows exactly how to frame deployments, PCS moves, and volunteer work as professional achievements that resonate with hiring managers." },
        { atomId: 'portable-careers-guide', why: "Because you're job searching, understanding which fields offer remote opportunities helps you target roles that will survive your next PCS." },
        { atomId: 'federal-employment-guide', why: "Because federal jobs offer stability and portability, understanding Military Spouse Preference and USAJOBS navigation opens powerful career doors." },
      ],
    };
  }

  // Rule 7: Portable Career Development
  if (focus === 'career' && career === 'portable-career') {
    return {
      primarySituation: "Portable Career Development",
      priorityAction: "Identify a career field with remote work and transferable skills, then create a roadmap to transition into it.",
      atoms: [
        { atomId: 'portable-careers-guide', why: "Because your goal is portability, this deep-dive into tech, healthcare, business, and creative fields shows you what's possible and how to get there." },
        { atomId: 'mycaa-complete-guide', why: "Because changing careers often requires new credentials, MyCAA's $4,000 benefit can fund certifications in portable fields." },
        { atomId: 'high-impact-certs', why: "Because certifications accelerate career transitions, PMP, Salesforce, and Google certifications are highly portable and MyCAA-eligible." },
      ],
    };
  }

  // Rule 8: Entrepreneurship
  if (focus === 'career' && career === 'business') {
    return {
      primarySituation: "Aspiring Entrepreneur",
      priorityAction: "Validate your business idea, choose the correct legal structure (likely an LLC), and understand tax implications of operating across state lines.",
      atoms: [
        { atomId: 'entrepreneur-toolkit', why: "Because your goal is business growth, this toolkit walks you through creating a 1-page business plan, choosing legal structures, and finding customers within the military community." },
        { atomId: 'portable-careers-guide', why: "Because understanding market demand helps validate business ideas, seeing which services military families need most informs your offering." },
        { atomId: 'license-transfer-guide', why: "Because some businesses require professional licenses, understanding interstate recognition and the $1,000 reimbursement protects your business portability." },
      ],
    };
  }

  // Rule 9: Education/Certification
  if (focus === 'career' && career === 'education') {
    return {
      primarySituation: "Education & Upskilling",
      priorityAction: "Check MyCAA eligibility and choose a portable, high-demand certification that pays off across multiple duty stations.",
      atoms: [
        { atomId: 'mycaa-complete-guide', why: "Because you want to upskill, this guide walks you through MyCAA's eligibility requirements, application process, and the full $4,000 benefit." },
        { atomId: 'high-impact-certs', why: "Because choosing the right certification matters, PMP, Salesforce, and Google certificates are highly portable, in-demand, and often MyCAA-approved." },
        { atomId: 'portable-careers-guide', why: "Because you're investing in education, understanding which fields have strong remote work opportunities ensures your new credential travels well." },
      ],
    };
  }

  // ==================== FINANCE RULES ====================
  
  // Rule 10: Budget & Debt Stress
  if (focus === 'finances' && finance === 'budget-debt') {
    return {
      primarySituation: "Financial Stabilization Priority",
      priorityAction: "Create a zero-based budget using your LES and leverage SCRA to reduce interest rates on existing debt to 6%.",
      atoms: [
        { atomId: 'les-decoder', why: "Because understanding your LES is the foundation of budgeting, this guide breaks down Base Pay, BAH, BAS, and deductions so you can plan your monthly cash flow accurately." },
        { atomId: 'emergency-fund-builder', why: "Because monthly budgeting stress is your concern, this guide provides steps to build an emergency fund, tackle debt systematically, and access free financial counseling." },
        { atomId: 'commissary-exchange-basics', why: "Because every dollar counts, understanding how commissary savings (25%) and exchange tax-free benefits work can free up $200-$400/month for debt payoff." },
      ],
    };
  }

  // Rule 11: Emergency Savings Fear
  if (focus === 'finances' && finance === 'emergency-savings') {
    return {
      primarySituation: "Emergency Fund Priority",
      priorityAction: "Automate savings via allotments and build a 3-6 month emergency fund in a high-yield savings account. This is your financial shock absorber.",
      atoms: [
        { atomId: 'emergency-fund-builder', why: "Because emergency savings is your focus, this section shows you how to calculate your target fund and systematically build it using military-specific strategies like allotments." },
        { atomId: 'les-decoder', why: "Because understanding your income is critical for savings planning, this LES breakdown helps you identify exactly how much you can save monthly." },
        { atomId: 'commissary-savings-calculator', why: "Because redirecting savings from smart shopping accelerates fund growth, this calculator shows how much you can save annually through on-base shopping." },
      ],
    };
  }

  // Rule 12: Retirement/TSP Uncertainty
  if (focus === 'finances' && finance === 'retirement-tsp') {
    return {
      primarySituation: "Retirement Readiness Focus",
      priorityAction: "Log into TSP.gov, verify you're contributing at least 5% to capture the full government match, and review your fund allocation.",
      atoms: [
        { atomId: 'tsp-brs-essentials', why: "Because your goal is retirement security, understanding the BRS two pillars (pension + TSP) and how the government match works is essential. Small TSP changes today = hundreds of thousands later." },
        { atomId: 'les-decoder', why: "Because TSP contributions come from your base pay, understanding your LES helps you determine the optimal contribution percentage for your budget." },
        { atomId: 'emergency-fund-builder', why: "Because retirement planning works best with emergency savings in place, this guide shows how to balance short-term security with long-term wealth building." },
      ],
    };
  }

  // ==================== COMBO RULES ====================
  
  // Rule 13: PCS + Career Combo
  if (focus === 'pcs' && career === 'find-job') {
    return {
      primarySituation: "PCS + Job Search",
      priorityAction: "Use your PCS as an opportunity to find remote work that travels with you to your next duty station and beyond.",
      atoms: [
        { atomId: 'resume-power-up', why: "Because you're moving AND job searching, framing your PCS management skills as logistics/project management makes you compelling for remote roles." },
        { atomId: 'pcs-master-checklist', why: "Because you're juggling a move and job search, staying organized with this checklist ensures your job search doesn't derail your PCS logistics." },
        { atomId: 'portable-careers-guide', why: "Because you're moving soon, targeting portable career fields (tech, healthcare, business) ensures your next job survives future PCS moves." },
      ],
    };
  }

  // Rule 14: Deployment + Finances
  if (focus === 'deployment' && finance === 'budget-debt') {
    return {
      primarySituation: "Deployment Financial Opportunity",
      priorityAction: "Set up allotments for all bills and leverage deployment pays (FSA, HDP, CZTE) plus SCRA to aggressively pay down debt.",
      atoms: [
        { atomId: 'pre-deployment-checklist', why: "Because you're deploying AND focused on finances, this checklist ensures you set up foolproof automatic payments and understand all deployment pay entitlements." },
        { atomId: 'emergency-fund-builder', why: "Because deployment is a financial opportunity, using tax-free income and special pays to crush debt and build savings can transform your situation in 6-12 months." },
      ],
    };
  }

  // Rule 15: EFMP + Career
  if (efmp && career && career !== 'none') {
    return {
      primarySituation: "EFMP Family Seeking Career Flexibility",
      priorityAction: "Pursue a fully remote career that allows you to maintain employment while managing specialized care needs across moves.",
      atoms: [
        { atomId: 'portable-careers-guide', why: "Because your family has EFMP needs, a fully remote career gives you flexibility to attend appointments and coordinate care without sacrificing professional growth." },
        { atomId: 'mycaa-complete-guide', why: "Because EFMP families face unique scheduling challenges, online certifications funded by MyCAA let you upskill on your own timeline without commuting." },
      ],
    };
  }

  // ==================== FALLBACK RULES ====================
  
  // Fallback: PCS General
  if (focus === 'pcs' || !focus) {
    return {
      primarySituation: "PCS Planning Mode",
      priorityAction: "Familiarize yourself with the PCS process, understand entitlements, and create a financial plan for your move.",
      atoms: [
        { atomId: 'pcs-timeline-tool', why: "Because planning a PCS requires organization, this tool maps out every deadline and task from orders to arrival." },
        { atomId: 'pcs-master-checklist', why: "Because a successful PCS requires completing dozens of tasks, this checklist ensures you don't miss critical legal, financial, or household steps." },
        { atomId: 'pcs-faq', why: "Because PCS entitlements are complex, these FAQs answer common questions about DLA, TLE, PPM, and weight allowances." },
      ],
    };
  }

  // Fallback: Career General
  if (focus === 'career') {
    return {
      primarySituation: "Career Development Focus",
      priorityAction: "Identify portable career paths, explore education opportunities, and build a resilient professional identity.",
      atoms: [
        { atomId: 'portable-careers-guide', why: "Because career portability is essential for military spouses, understanding which fields offer remote work helps you chart a resilient path." },
        { atomId: 'resume-power-up', why: "Because marketing yourself effectively is critical, learning to translate military life into resume achievements opens doors." },
        { atomId: 'mycaa-complete-guide', why: "Because education accelerates career development, MyCAA's $4,000 can fund certifications in portable, high-demand fields." },
      ],
    };
  }

  // Fallback: Deployment General
  if (focus === 'deployment') {
    return {
      primarySituation: "Deployment Readiness",
      priorityAction: "Complete legal and financial preparations and establish a family communication plan.",
      atoms: [
        { atomId: 'pre-deployment-checklist', why: "Because deployment preparation is complex, this checklist covers legal documents (POA, wills), financial setup (allotments, SCRA), and family planning." },
        { atomId: 'deployment-family-pact', why: "Because communication is critical during separation, this tool helps your family define goals and realistic expectations together." },
        { atomId: 'deployment-faq', why: "Because deployment raises many questions, these FAQs address common concerns about pay, OPSEC, childcare, and reintegration." },
      ],
    };
  }

  // Fallback: Finances General
  if (focus === 'finances') {
    return {
      primarySituation: "Financial Wellness Priority",
      priorityAction: "Understand your military pay structure and create a sustainable budget balancing immediate needs with long-term goals.",
      atoms: [
        { atomId: 'les-decoder', why: "Because understanding your income is foundational, this LES breakdown helps you accurately budget and identify optimization opportunities." },
        { atomId: 'emergency-fund-builder', why: "Because financial wellness starts with stability, this guide covers emergency funds, debt management, and free financial counseling." },
        { atomId: 'tsp-brs-essentials', why: "Because long-term wealth requires retirement planning, understanding TSP and the government match sets you up for financial security." },
      ],
    };
  }

  // Ultimate Fallback
  return {
    primarySituation: "Getting Started",
    priorityAction: "Complete the strategic assessment to receive your personalized action plan.",
    atoms: [
      { atomId: 'pcs-master-checklist', why: "Understanding the PCS process is fundamental to military financial planning." },
      { atomId: 'emergency-fund-builder', why: "Building financial wellness creates stability across all areas of military life." },
    ],
  };
}

